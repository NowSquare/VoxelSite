<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Database,InstallationUrl,PreviewAssetRouter,SiteMutationLock,SiteWorkspace};

/** Legacy HTTP shapes delegate to the same private staging and retained mutation services. */
final class AssetHttpAdapter
{
    private ActorPolicy $policy;
    private ?AssetTransferService $uploads=null;
    private string $privateRoot;
    private AssetManagementService $assets;
    private ChangeSetService $changes;
    private ChangeSetExecutor $executor;
    public function __construct(private Database $db,private SiteWorkspace $workspace,?string $privateRoot=null,?string $legacyMetadata=null)
    {
        $privateRoot??=dirname($workspace->draftRoot()).'/data/agent';$this->privateRoot=$privateRoot;$this->policy=new ActorPolicy($db);
        $store=new ChangeSetStore($db,$this->policy,$privateRoot.'/changes');
        $this->changes=new ChangeSetService($db,$this->policy,$workspace,new BriefStore($db,$this->policy),$store,
            fn($actor,$id,$path)=>$this->uploads()->finalizedBytes($actor,$id,$path));
        $this->assets=new AssetManagementService($db,$this->policy,$workspace,$this->changes,$legacyMetadata);
        $this->executor=new ChangeSetExecutor($db,$this->policy,$workspace,$store,new OperationStore($db,$this->policy,$workspace->mutationLockPath()),100);
    }
    public function list(OperationActor $actor,array $query,bool $studio=true): array
    {
        $request=(object)['limit'=>min(100,max(1,(int)($query['per_page']??100)))];
        if (isset($query['category'])) $request->category=$query['category'];
        $result=$this->assets->list($actor,$request);$all=$result['assets'];
        if ($studio) {
            while($result['next_offset']!==null) {
                $request->offset=$result['next_offset'];$request->draft_version=$result['draft_version'];
                $result=$this->assets->list($actor,$request);array_push($all,...$result['assets']);
            }
        } else {
            $page=max(1,(int)($query['page']??1));
            if ($page>1) {
                if (!isset($query['draft_version'])) throw new OperationException('content_conflict','Pass the draft_version from the first page when continuing this asset list.');
                $request->offset=($page-1)*$request->limit;$request->draft_version=$query['draft_version'];$result=$this->assets->list($actor,$request);$all=$result['assets'];
            }
        }
        foreach($all as &$asset) {
            $asset['path']='/'.$asset['path'];
            $asset['preview_url']=PreviewAssetRouter::url($asset['path'],base:InstallationUrl::studioPath().'/api/router.php?_path=%2Fpreview&path=');
            $asset['thumbnail']=$asset['preview_url'];
            $asset['modified']='';
        }unset($asset);
        return ['assets'=>$all,'count'=>count($all),'total'=>$result['total'],'page'=>(int)($query['page']??1),
            'per_page'=>$request->limit,'folders'=>$result['folders'],'draft_version'=>$result['draft_version']];
    }
    public function mutate(OperationActor $actor,string $action,array $input): array
    {
        $this->policy->require($actor,['assets:read','assets:write','files:read','files:write','changes:apply']);
        $id=$this->requestId($input);$this->requireVersion($input);$lock=$this->lock($actor,$id);
        $path=ltrim((string)($input['path']??''),'/');
        if($action!=='folder' && !array_key_exists('expected_hash',$input))throw new OperationException('invalid_schema','Send the asset hash you reviewed.');
        $expected=$input['expected_hash']??null;
        $intent=match($action) {
            'metadata'=>['type'=>'metadata','path'=>$path,'expected_hash'=>$expected,'alt'=>$input['alt']??'','description'=>$input['description']??''],
            'delete'=>['type'=>'delete','path'=>$path,'expected_hash'=>$expected,'replacement_path'=>isset($input['replacement_path'])?ltrim($input['replacement_path'],'/'):null],
            'folder'=>['type'=>'folder','path'=>'assets/'.($input['category']??'images').'/'.self::filename((string)($input['name']??''))],
            'move'=>['type'=>'move','path'=>$path,'expected_hash'=>$expected,'destination'=>ltrim((string)($input['destination']??''),'/'),'rewrite_references'=>true],
            default=>throw new OperationException('invalid_schema','Unknown asset action.'),
        };
        $review=$this->assets->prepare($actor,(object)['request_id'=>$id,
            'base_draft_version'=>$input['base_draft_version'],
            'intent'=>(object)$intent]);
        $operation=$this->apply($actor,$review,$id);
        return ['path'=>$path,'deleted'=>$action==='delete'?$path:null,'folder'=>$action==='folder'?'/'.$intent['path']:null,
            'review'=>$review,'operation'=>$operation];
    }
    /** The temporary path is supplied only by the authenticated multipart adapter after is_uploaded_file. */
    public function upload(OperationActor $actor,array $input,array $file): array
    {
        $this->policy->require($actor,['assets:read','assets:write','files:read','files:write','changes:apply']);
        $id=$this->requestId($input);$this->requireVersion($input);$lock=$this->lock($actor,$id);
        clearstatcache(true,$file['tmp_name']);$size=filesize($file['tmp_name']);
        if ($size===false || $size<1 || $size>10485760 || is_link($file['tmp_name'])) throw new OperationException('size_limit','This upload exceeds the 10 MiB asset limit.');
        $bytes=file_get_contents($file['tmp_name'],false,null,0,10485761);
        if ($bytes===false || strlen($bytes)!==$size) throw new OperationException('content_conflict','The upload changed while being read.');
        $extension=strtolower(pathinfo($file['name'],PATHINFO_EXTENSION));
        $category=$input['category']??(in_array($extension,['jpg','jpeg','png','gif','webp','avif','svg','ico'],true)?'images':
            (in_array($extension,['woff','woff2','ttf','otf'],true)?'fonts':
            (in_array($extension,['mp4','webm','mp3','ogg','wav'],true)?'media':'files')));
        if (!in_array($category,['images','fonts','media','files'],true)) throw new OperationException('invalid_schema','Upload images, fonts, media or files. Edit CSS and JavaScript through the code editor.');
        $name=self::filename(pathinfo($file['name'],PATHINFO_FILENAME)).'.'.$extension;
        $base='assets/'.$category.'/'.$name;
        $collision='assets/'.$category.'/'.pathinfo($name,PATHINFO_FILENAME).'-'.substr(hash('sha256',$id),0,8).'.'.$extension;
        $path=isset($input['path'])?ltrim($input['path'],'/'):$base;
        $saved=$this->db->queryOne('SELECT u.* FROM agent_asset_requests r JOIN agent_asset_uploads u ON u.id=r.upload_id WHERE r.actor_key=? AND r.action=? AND r.request_id=?',
            [$actor->identity(),'begin',$id.'-begin']);
        if ($saved) {
            $allowed=isset($input['path'])?[$path]:[$base,$collision];
            if (!in_array($saved['path'],$allowed,true)) throw new OperationException('idempotency_conflict','This upload identity belongs to a different filename.');
            $path=$saved['path'];
        } elseif (!isset($input['path']) && is_file($this->workspace->resolveDraft($base))) $path=$collision;
        $mime=self::mime($extension);
        $upload=$this->uploads()->begin($actor,(object)['request_id'=>$id.'-begin','path'=>$path,'bytes'=>strlen($bytes),
            'sha256'=>hash('sha256',$bytes),'mime_type'=>$mime]);
        for($offset=0;$offset<strlen($bytes);$offset+=$upload['limits']['max_chunk_bytes']) {
            $part=substr($bytes,$offset,$upload['limits']['max_chunk_bytes']);
            $this->uploads()->chunk($actor,(object)['request_id'=>$id.'-chunk-'.$offset,'upload_id'=>$upload['upload_id'],
                'offset'=>$offset,'data_base64'=>base64_encode($part),'sha256'=>hash('sha256',$part)]);
        }
        $final=$this->uploads()->finish($actor,(object)['request_id'=>$id.'-finish','upload_id'=>$upload['upload_id']]);
        $review=$this->assets->prepare($actor,(object)['request_id'=>$id,
            'base_draft_version'=>$input['base_draft_version'],
            'intent'=>(object)['type'=>'replace','path'=>$path,'expected_hash'=>$input['expected_hash']??null,'upload_id'=>$final['upload_id']]]);
        $operation=$this->apply($actor,$review,$id);
        return ['path'=>'/'.$path,'filename'=>basename($path),'original'=>$file['name'],'extension'=>$extension,
            'category'=>$category,'size'=>$final['bytes'],'image'=>$final['image'],'review'=>$review,'operation'=>$operation];
    }
    private function uploads(): AssetTransferService
    {
        return $this->uploads??=new AssetTransferService($this->db,$this->policy,$this->workspace,$this->privateRoot.'/uploads');
    }
    private function apply(OperationActor $actor,array $review,string $id): array
    {
        $replay=(bool)$this->db->scalar('SELECT COUNT(*) FROM agent_operations WHERE actor_key=? AND operation_id=?',[$actor->identity(),$id.'-apply']);
        $operation=$this->executor->apply($actor,(object)['change_set_id'=>$review['change_set_id'],'digest'=>$review['digest'],'operation_id'=>$id.'-apply']);
        for($step=0;!$replay && $operation['status']==='applying' && $step<6;$step++) {
            $operation=$this->executor->continue($actor,$operation['operation_id'],$operation['checkpoint']);
        }
        if ($operation['status']!=='succeeded') throw new OperationException(
            $operation['status']==='recovery_required'?'recovery_required':($operation['result']['error']['code']??'operation_pending'),
            'The asset operation did not finish. Inspect its retained result before trying another edit.',['operation_id'=>$operation['operation_id'],'status'=>$operation['status']]);
        return $operation;
    }
    private function lock(OperationActor $actor,string $id): SiteMutationLock
    {
        $operation=$this->db->queryOne('SELECT id FROM agent_operations WHERE actor_key=? AND user_id=? AND operation_id=?',
            [$actor->identity(),$actor->userId,$id.'-apply']);
        return SiteMutationLock::acquire($this->workspace->mutationLockPath(),$this->db,$operation['id']??null);
    }
    private function requireVersion(array $input):void
    {
        if(!isset($input['base_draft_version']) || !is_string($input['base_draft_version']) || !preg_match('/^draft:[0-9]+$/D',$input['base_draft_version']))
            throw new OperationException('invalid_schema','Send the draft version displayed with this asset list.');
    }
    private function requestId(array $input): string
    {
        $id=$input['request_id']??$input['operation_id']??null;
        if (!is_string($id)||!preg_match('/^[A-Za-z0-9][A-Za-z0-9_-]{7,127}$/D',$id)) throw new OperationException('invalid_schema','Use a stable request ID of 8–128 letters, digits, dashes or underscores.');
        return 'http-asset-'.substr(hash('sha256',$id),0,40);
    }
    private static function filename(string $name): string
    {
        $name=strtolower(trim($name));$name=preg_replace('/[^a-z0-9_-]+/','-',$name);$name=trim($name,'-_');
        if ($name==='') throw new OperationException('invalid_path','Use a filename with letters or numbers.');
        return substr($name,0,55);
    }
    private static function mime(string $extension): string
    {
        return match($extension) {
            'jpg','jpeg'=>'image/jpeg','png'=>'image/png','gif'=>'image/gif','webp'=>'image/webp','avif'=>'image/avif','svg'=>'image/svg+xml','ico'=>'image/x-icon',
            'pdf'=>'application/pdf','txt'=>'text/plain','md'=>'text/markdown','csv'=>'text/csv','woff'=>'font/woff','woff2'=>'font/woff2','ttf'=>'font/ttf','otf'=>'font/otf',
            'doc'=>'application/msword','xls'=>'application/vnd.ms-excel',
            'docx'=>'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xlsx'=>'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'mp4'=>'video/mp4','webm'=>'video/webm','mp3'=>'audio/mpeg','ogg'=>'audio/ogg','wav'=>'audio/wav',
            default=>throw new OperationException('invalid_schema','This file type is not supported by managed asset uploads.'),
        };
    }
}
