<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{ActionManager,Database,Settings,SiteWorkspace,SiteMutationLock};

/** Definitions change the live runtime; bar settings remain private until publication. */
final class ActionService
{
    public function __construct(private Database $db,private ActorPolicy $policy,private SiteWorkspace $workspace,
        private string $actionsDir,private string $recordsPath,private string $siteDataPath,private string $templatesDir,
        private ?BusinessReceiptStore $receipts=null,private ?\Closure $executionHook=null) {$this->receipts??=new BusinessReceiptStore($policy);}
    public static function inputSchema(string $method):array {
        $id=['action_id'=>BusinessContracts::id()];$version=['version'=>ToolContracts::hash()];$data=['data'=>BusinessContracts::map()];
        return match($method) {
            'list','templates'=>ToolContracts::object(['offset'=>ToolContracts::integer(200),'limit'=>['type'=>'integer','minimum'=>1,'maximum'=>50],'version'=>ToolContracts::hash()],[]),
            'get'=>ToolContracts::object($id),'manifest','bar'=>ToolContracts::object([]),
            'validate','availability'=>ToolContracts::object($id+$version+$data),
            'invoke'=>ToolContracts::object($id+$version+$data+['kind'=>['enum'=>['create','cancel']],'request_id'=>ToolContracts::requestId()]),
            'change'=>ToolContracts::object(['request_id'=>ToolContracts::requestId(),'version'=>ToolContracts::hash(),'intent'=>['oneOf'=>[
                ToolContracts::object(['type'=>['const'=>'save'],'definition'=>BusinessContracts::map(),'mode'=>['enum'=>['create','update','upsert']]],['type','definition']),
                ToolContracts::object(['type'=>['const'=>'delete']]+$id),
                ToolContracts::object(['type'=>['const'=>'duplicate']]+$id+['new_id'=>BusinessContracts::id()]),
                ToolContracts::object(['type'=>['const'=>'from_template'],'template_id'=>BusinessContracts::id(),'new_id'=>BusinessContracts::id()]),
                ToolContracts::object(['type'=>['const'=>'reorder'],'order'=>ToolContracts::list(BusinessContracts::id(),200)]),
                ToolContracts::object(['type'=>['const'=>'bar'],'settings'=>self::barSchema()]),
            ]]]),
            default=>throw new \InvalidArgumentException('Unknown Action method.'),
        };
    }
    public static function barSchema():array {return ToolContracts::object(['theme'=>['enum'=>['bottom-bar','floating-fab','minimal-pill']],
        'visibility'=>['enum'=>['all-pages','homepage-only','hidden']],'pages'=>ToolContracts::list(ToolContracts::text(240),200),
        'color_scheme'=>['enum'=>['light','dark']],'brand_color'=>['type'=>'string','pattern'=>'^(|#[a-fA-F0-9]{3}|#[a-fA-F0-9]{6})$']]);}
    public static function outputSchema(string $method):array {
        $provider=['provider_calls'=>['const'=>0]];
        return match($method) {
            'list','templates'=>ToolContracts::object(['version'=>ToolContracts::hash(),'items'=>ToolContracts::list(BusinessContracts::map(),50),'total'=>ToolContracts::integer(200),'next_offset'=>ToolContracts::nullable(ToolContracts::integer(200))]+$provider),
            'get'=>ToolContracts::object(['action_id'=>BusinessContracts::id(),'version'=>ToolContracts::hash(),'definition'=>BusinessContracts::map(),'effect'=>['const'=>'live_write']]+$provider),
            'bar'=>ToolContracts::object(['version'=>ToolContracts::hash(),'settings'=>self::barSchema(),'migration_required'=>['type'=>'boolean']]+$provider),
            'manifest'=>ToolContracts::object(['manifest'=>BusinessContracts::map()]+$provider),
            'validate'=>ToolContracts::object(['valid'=>['type'=>'boolean'],'data'=>BusinessContracts::map(),'errors'=>ToolContracts::list(ToolContracts::text(2048),100),'mode'=>['const'=>'validation_only'],'record_created'=>['const'=>false],'email_sent'=>['const'=>false]]+$provider),
            'availability'=>ToolContracts::object(['result'=>BusinessContracts::map()]+$provider),
            'invoke'=>ToolContracts::object(['action_id'=>BusinessContracts::id(),'record_id'=>['type'=>'integer','minimum'=>1],'status'=>ToolContracts::text(80),'confirmation_code'=>ToolContracts::text(64),'message'=>ToolContracts::text(32768),'record_created'=>['type'=>'boolean'],'request_id'=>ToolContracts::requestId(),'deliveries'=>BusinessReceiptStore::deliveriesSchema()]+$provider),
            'change'=>ToolContracts::object(['request_id'=>ToolContracts::requestId(),'operation_id'=>ToolContracts::id('business'),'effect'=>['enum'=>['live_write','draft_write']],'version'=>ToolContracts::hash(),'changed_ids'=>ToolContracts::list(BusinessContracts::id(),200),'public_effects_immediate'=>['type'=>'boolean']]+$provider),
            default=>throw new \InvalidArgumentException('Unknown Action method.'),
        };
    }
    public function manager():ActionManager {return new ActionManager($this->actionsDir,$this->recordsPath,$this->workspace->resolvePublished('assets/data/site.json'),dirname($this->recordsPath).'/uploads/actions',$this->templatesDir);}
    public function list(OperationActor $actor,\stdClass $input):array {return $this->inventory($actor,$input,false);}
    public function templates(OperationActor $actor,\stdClass $input):array {return $this->inventory($actor,$input,true);}
    private function inventory(OperationActor $actor,\stdClass $input,bool $templates):array {
        $this->policy->require($actor,['actions:read']);JsonSchema::validate($input,self::inputSchema($templates?'templates':'list'));
        $defs=$this->definitions($templates?$this->templatesDir:$this->actionsDir);$version=$templates?CanonicalJson::digest($defs):$this->configurationVersion();
        if(($input->offset??0)>0&&!isset($input->version))throw new OperationException('content_conflict','Continuation requires the inventory version.');
        if(isset($input->version)&&!hash_equals($version,$input->version))throw new OperationException('content_conflict','The Action inventory changed. Restart pagination.');
        $items=[];foreach($defs as $id=>$bytes){$definition=json_decode($bytes,true,32,JSON_THROW_ON_ERROR);$items[]=['id'=>$id,'name'=>$definition['name']??$id,'description'=>$definition['description']??'','active'=>(bool)($definition['active']??false),'version'=>hash('sha256',$bytes),'fields'=>count($definition['fields']??[])];}
        $offset=$input->offset??0;$limit=$input->limit??25;return ['version'=>$version,'items'=>array_slice($items,$offset,$limit),'total'=>count($items),'next_offset'=>$offset+$limit<count($items)?$offset+$limit:null,'provider_calls'=>0];
    }
    public function get(OperationActor $actor,\stdClass $input):array {
        $this->policy->require($actor,['actions:read']);JsonSchema::validate($input,self::inputSchema('get'));
        $bytes=BusinessContracts::read($this->actionsDir,$input->action_id.'.json');if($bytes===null)throw new OperationException('not_found','The Action definition is unavailable.');
        return ['action_id'=>$input->action_id,'version'=>hash('sha256',$bytes),'definition'=>BusinessContracts::bounded(json_decode($bytes,false,32,JSON_THROW_ON_ERROR)),'effect'=>'live_write','provider_calls'=>0];
    }
    public function manifest(OperationActor $actor,\stdClass $input):array {$this->policy->require($actor,['actions:read']);JsonSchema::validate($input,self::inputSchema('manifest'));$this->definitions($this->actionsDir);return ['manifest'=>$this->manager()->generateManifest(),'provider_calls'=>0];}
    public function bar(OperationActor $actor,\stdClass $input):array {$this->policy->require($actor,['actions:read']);JsonSchema::validate($input,self::inputSchema('bar'));$site=$this->siteData();$legacy=ActionConfiguration::legacyBar($this->workspace,$this->siteDataPath);if($legacy!==null)$site['actions_bar']=$legacy;return ['migration_required'=>$legacy!==null,'version'=>$this->configurationVersion(),'settings'=>array_merge(['theme'=>$site['actions_bar']['position']??'bottom-bar','visibility'=>'all-pages','pages'=>[],'color_scheme'=>'light','brand_color'=>''],array_intersect_key($site['actions_bar']??[],self::barSchema()['properties'])),'provider_calls'=>0];}
    public function validate(OperationActor $actor,\stdClass $input):array {
        JsonSchema::validate($input,self::inputSchema('validate'));$action=$this->pinned($actor,$input);$result=$this->manager()->validateSubmission($action,BusinessContracts::bounded($input->data));
        return ['valid'=>$result['valid'],'data'=>$result['data']?:new \stdClass(),'errors'=>$result['errors'],'mode'=>'validation_only','record_created'=>false,'email_sent'=>false,'provider_calls'=>0];
    }
    public function availability(OperationActor $actor,\stdClass $input):array {JsonSchema::validate($input,self::inputSchema('availability'));$this->policy->require($actor,['actions:invoke']);$action=$this->pinned($actor,$input);return ['result'=>$this->manager()->availability($action,BusinessContracts::bounded($input->data)),'provider_calls'=>0];}
    public function invoke(OperationActor $actor,\stdClass $input):array {
        JsonSchema::validate($input,self::inputSchema('invoke'));$this->policy->require($actor,['actions:read','actions:invoke']);
        $lock=SiteMutationLock::acquire($this->workspace->mutationLockPath(),$this->db);
        $manager=$this->manager();$data=BusinessContracts::bounded($input->data);
        return $this->receipts->mutate($actor,$manager->businessDatabase(),$input->request_id,['site_key'=>$this->siteKey(),'input'=>$input],['actions:read','actions:invoke'],function()use($manager,$input,$data,$actor):array {
            $action=$this->pinned($actor,$input);
            if(!($action['active']??false))throw new OperationException('permission_denied','This Action is disabled.');
            $settings=new Settings($this->db);$owner=$settings->get('notifications.owner_email')??$settings->get('owner_email')??$settings->get('mail.from_address');
            if($input->kind==='create'&&$manager->notificationPlan($action,$data,'PENDING',is_string($owner)?$owner:null))$this->policy->require($actor,['mail:send']);
            $source=match($actor->type){'rest_key'=>'api','user'=>'studio',default=>'mcp'};
            $result=$manager->invokeStored($action,$input->kind,$data,'studio:'.$actor->identity(),$source);unset($result['ok']);$result['action_id']=$action['id'];
            return ['result'=>$result,'deliveries'=>$input->kind==='create'?$manager->notificationPlan($action,$data,$result['confirmation_code'],is_string($owner)?$owner:null):[]];
        });
    }
    public function change(OperationActor $actor,\stdClass $input):array {
        JsonSchema::validate($input,self::inputSchema('change'));$this->policy->require($actor,['actions:read','actions:write']);$this->workspace->assertReady();
        $digest=CanonicalJson::digest($input);
        $row=$this->db->queryOne('SELECT * FROM agent_business_changes WHERE actor_key=? AND request_id=?',[$actor->identity(),$input->request_id]);
        $id=$row['id']??'business_'.bin2hex(random_bytes(16));
        $lock=SiteMutationLock::acquire($this->workspace->mutationLockPath(),$this->db,businessOperationId:$id);
        $row=$this->db->queryOne('SELECT * FROM agent_business_changes WHERE actor_key=? AND request_id=?',[$actor->identity(),$input->request_id]);
        if($row){if((int)$row['user_id']!==$actor->userId||($row['site_key']??null)!==$this->siteKey()||!hash_equals($row['request_digest'],$digest))throw new OperationException('idempotency_conflict','This request identity already belongs to different Action changes.');if($row['status']==='succeeded')return json_decode($row['result_json'],true,32,JSON_THROW_ON_ERROR);if($row['status']==='failed_restored')throw new OperationException('failed_restored','The owner restored this interrupted Action change. Review the current configuration and use a new request identity.');}
        else {
            if($this->db->scalar("SELECT COUNT(*) FROM agent_business_changes WHERE status='prepared'"))throw new OperationException('recovery_required','An exact Action change must finish before another configuration change.');
            if($this->db->scalar('SELECT COUNT(*) FROM agent_business_changes')>=512)throw new OperationException('size_limit','Action change journal is full.');
            if($input->intent->type==='bar')\VoxelSite\SiteRecovery::assertWritable($this->db);
            if(!hash_equals($this->configurationVersion(),$input->version))throw new OperationException('content_conflict','Action configuration changed. Review its current version.');
            [$payload,$changed,$version,$metadata]=$this->plan($input->intent);if((int)$this->db->scalar('SELECT COALESCE(SUM(length(payload_json)+COALESCE(length(metadata_json),0)),0) FROM agent_business_changes')+strlen(CanonicalJson::encode($payload))+strlen(CanonicalJson::encode($metadata))>16777216)throw new OperationException('size_limit','Retained Action changes exceed their 16 MiB storage budget.');
            $result=['request_id'=>$input->request_id,'operation_id'=>$id,'effect'=>$input->intent->type==='bar'?'draft_write':'live_write','version'=>$version,'changed_ids'=>$changed,'public_effects_immediate'=>$input->intent->type!=='bar','provider_calls'=>0];
            $this->db->insert('agent_business_changes',['id'=>$id,'actor_key'=>$actor->identity(),'user_id'=>$actor->userId,'site_key'=>$this->siteKey(),'request_id'=>$input->request_id,'request_digest'=>$digest,'status'=>'prepared','payload_json'=>CanonicalJson::encode($payload),'metadata_json'=>CanonicalJson::encode($metadata),'metadata_digest'=>CanonicalJson::digest($metadata),'result_json'=>CanonicalJson::encode($result),'created_at'=>time(),'actor_json'=>CanonicalJson::encode($actor->attribution()),'action_kind'=>'action.'.$input->intent->type]);
            $row=$this->db->queryOne('SELECT * FROM agent_business_changes WHERE id=?',[$id]);
        }
        $payload=$this->recoveryPayload($row);$metadata=$this->metadata($row);
        $this->assertMetadataState($metadata);
        $this->assertPublishedConfiguration($metadata);
        foreach($payload as $entry){$current=BusinessContracts::read($entry['root'],$entry['path'],4194304);if($current!==$entry['before']&&$current!==$entry['after'])throw new OperationException('recovery_required','Action configuration changed outside its retained plan; preserve the conflicting bytes.');}
        foreach($payload as $entry){
            if($this->executionHook)($this->executionHook)('before_entry',$entry);
            $current=BusinessContracts::read($entry['root'],$entry['path'],4194304);
            if($current===$entry['after'])continue;
            if($current!==$entry['before'])throw new OperationException('recovery_required','Action configuration changed before its write; preserve the conflicting bytes.');
            if($entry['after']===null){$path=SiteWorkspace::resolveWithin($entry['root'],$entry['path']);if(is_file($path)&&!unlink($path))throw new OperationException('write_failed','Could not remove the Action definition.');}
            else $this->writeEntry($entry,$entry['after']);
        }
        if($this->executionHook)($this->executionHook)('after_files',$row);
        foreach($payload as $entry)if(BusinessContracts::read($entry['root'],$entry['path'],4194304)!==$entry['after'])throw new OperationException('recovery_required','Action bytes changed before commit.');
        $this->db->transaction(function()use($row,$metadata):void{$this->assertPublishedConfiguration($metadata);$this->commitMetadata($metadata,false);$this->db->update('agent_business_changes',['status'=>'succeeded','completed_at'=>time()],'id=?',[$row['id']]);});return json_decode($row['result_json'],true,32,JSON_THROW_ON_ERROR);
    }
    /** Studio owner recovery is deliberately separate from the originating credential's authority. */
    public function pendingChanges(OperationActor $ownerSession):array
    {
        $this->policy->requireOwnerSession($ownerSession);
        $rows=$this->db->query("SELECT * FROM agent_business_changes WHERE site_key=? AND status='prepared' ORDER BY created_at,id LIMIT 32",[$this->siteKey()]);
        return ['items'=>array_map(fn($row)=>$this->recoveryMetadata($row),$rows),'provider_calls'=>0];
    }
    public function inspectChange(OperationActor $ownerSession,string $operationId):array
    {
        $this->policy->requireOwnerSession($ownerSession);$row=$this->recoveryRow($operationId);
        $lock=SiteMutationLock::acquire($this->workspace->mutationLockPath(),$this->db,businessOperationId:$operationId);
        $row=$this->recoveryRow($operationId);$review=$this->recoveryMetadata($row);
        if($row['status']!=='prepared')return $review+['digest'=>null,'expires_at'=>null];
        $expires=time()+900;$digest=$this->recoveryDigest($row,$review,$ownerSession->userId,$expires);
        $this->db->update('agent_business_changes',['recovery_digest'=>$digest,'recovery_expires_at'=>$expires,'recovery_owner_id'=>$ownerSession->userId],'id=?',[$operationId]);
        return $review+['digest'=>$digest,'expires_at'=>$expires];
    }
    public function recover(OperationActor $ownerSession,string $operationId,string $digest):array
    {
        $this->policy->requireOwnerSession($ownerSession);JsonSchema::validate($digest,ToolContracts::hash());
        $row=$this->recoveryRow($operationId);
        $lock=SiteMutationLock::acquire($this->workspace->mutationLockPath(),$this->db,businessOperationId:$operationId);
        $row=$this->recoveryRow($operationId);
        if((int)($row['recovery_owner_id']??0)!==$ownerSession->userId||!hash_equals($row['recovery_digest']??'',$digest))throw new OperationException('content_conflict','Review this exact Action recovery from the current owner session.');
        if($row['status']==='failed_restored')return $this->recoveryResult($row);
        if($row['status']!=='prepared'||(int)$row['recovery_expires_at']<time())throw new OperationException('content_conflict','This Action recovery review expired or is no longer pending.');
        $review=$this->recoveryMetadata($row);
        if(!$review['eligible']||!hash_equals($digest,$this->recoveryDigest($row,$review,$ownerSession->userId,(int)$row['recovery_expires_at'])))throw new OperationException('recovery_required','Action bytes changed after recovery review. Preserve them and inspect again.');
        foreach($this->recoveryPayload($row) as $entry){
            $current=BusinessContracts::read($entry['root'],$entry['path'],4194304);
            if($current!==$entry['before']&&$current!==$entry['after'])throw new OperationException('recovery_required','Conflicting Action bytes were preserved. Inspect recovery again.');
            if($current===$entry['before'])continue;
            if($entry['before']===null){$path=SiteWorkspace::resolveWithin($entry['root'],$entry['path']);if(is_file($path)&&!unlink($path))throw new OperationException('write_failed','Could not restore the absent Action definition.');}
            else $this->writeEntry($entry,$entry['before']);
        }
        foreach($this->recoveryPayload($row) as $entry)if(BusinessContracts::read($entry['root'],$entry['path'],4194304)!==$entry['before'])throw new OperationException('recovery_required','Restored Action bytes changed before recovery completed. Inspect recovery again.');
        $metadata=$this->metadata($row);$this->db->transaction(function()use($metadata,$ownerSession,$operationId):void{$this->commitMetadata($metadata,true);$this->db->update('agent_business_changes',['status'=>'failed_restored','completed_at'=>time(),'recovered_by'=>$ownerSession->userId,'recovered_at'=>time()],'id=?',[$operationId]);});
        return $this->recoveryResult($this->recoveryRow($operationId));
    }
    private function recoveryRow(string $operationId):array
    {
        JsonSchema::validate($operationId,ToolContracts::id('business'));
        $row=$this->db->queryOne('SELECT * FROM agent_business_changes WHERE id=? AND site_key=?',[$operationId,$this->siteKey()]);
        if(!$row)throw new OperationException('not_found','The Action recovery is unavailable for this installation.');
        return $row;
    }
    private function recoveryPayload(array $row):array
    {
        if(strlen($row['payload_json'])>8388608)throw new OperationException('size_limit','The retained Action journal exceeds its recovery budget.');
        $payload=json_decode($row['payload_json'],true,32,JSON_THROW_ON_ERROR);
        if(!is_array($payload)||!array_is_list($payload)||count($payload)>202)throw new OperationException('recovery_required','The retained Action journal is invalid.');
        $seen=[];
        foreach($payload as $entry){
            $allowed=($entry['root']??null)===$this->actionsDir&&preg_match('/^[a-z0-9][a-z0-9_-]{0,63}\.json$/D',$entry['path']??'')
                ||(($entry['root']??null)===dirname($this->siteDataPath)&&($entry['path']??null)===basename($this->siteDataPath))
                ||(($entry['root']??null)===dirname($this->identitySitePath())&&($entry['path']??null)===basename($this->identitySitePath()))
                ||(($entry['root']??null)===$this->workspace->publishedRoot()&&($entry['path']??null)==='actions/manifest.json');
            if(!$allowed||!array_key_exists('before',$entry)||!array_key_exists('after',$entry))throw new OperationException('recovery_required','The retained Action journal targets an unsupported path.');
            foreach(['before','after'] as $key)if($entry[$key]!==null&&(!is_string($entry[$key])||strlen($entry[$key])>4194304))throw new OperationException('recovery_required','The retained Action bytes are invalid.');
            $key=$entry['root']."\0".$entry['path'];if(isset($seen[$key]))throw new OperationException('recovery_required','The retained Action journal repeats a path.');$seen[$key]=true;
        }
        return $payload;
    }
    private function recoveryMetadata(array $row):array
    {
        $paths=[];$eligible=$row['status']==='prepared';$metadata=$this->metadata($row);try{$this->assertMetadataState($metadata);}catch(OperationException){$eligible=false;}
        foreach($this->recoveryPayload($row) as $entry){
            $current=BusinessContracts::read($entry['root'],$entry['path'],4194304);
            $state=$current===$entry['before']?'before':($current===$entry['after']?'after':'conflict');
            if($state==='conflict')$eligible=false;
            $domain=$entry['root']===$this->actionsDir?'definitions':($entry['root']===$this->workspace->publishedRoot()?'published_manifest':'bar_settings');
            $paths[]=['domain'=>$domain,'path'=>$entry['path'],'state'=>$state,'current_hash'=>$current===null?null:hash('sha256',$current),'before_hash'=>$entry['before']===null?null:hash('sha256',$entry['before']),'after_hash'=>$entry['after']===null?null:hash('sha256',$entry['after'])];
        }
        return ['operation_id'=>$row['id'],'kind'=>$row['action_kind'],'status'=>$row['status'],'original_actor'=>$this->recoveryActor($row),'created_at'=>(int)$row['created_at'],'paths'=>$paths,'eligible'=>$eligible,'action'=>'restore_before','provider_calls'=>0];
    }
    private function recoveryActor(array $row):array
    {return $row['actor_json']?json_decode($row['actor_json'],true,16,JSON_THROW_ON_ERROR):['type'=>explode(':',$row['actor_key'])[0],'user_id'=>(int)$row['user_id'],'credential_id'=>str_starts_with($row['actor_key'],'user:')?null:(int)explode(':',$row['actor_key'])[1],'client_name'=>null];}
    private function recoveryDigest(array $row,array $review,int $ownerId,int $expires):string
    {return CanonicalJson::digest(['site'=>$this->siteKey(),'request'=>$row['request_digest'],'payload'=>hash('sha256',$row['payload_json']),'metadata'=>$row['metadata_digest']??null,'transition_state'=>$this->transitionState($row),'review'=>$review,'owner'=>$ownerId,'expires'=>$expires]);}
    private function recoveryResult(array $row):array
    {return ['operation_id'=>$row['id'],'status'=>'failed_restored','original_actor'=>$this->recoveryActor($row),'recovered_by'=>(int)$row['recovered_by'],'recovered_at'=>(int)$row['recovered_at'],'resumed'=>false,'provider_calls'=>0];}
    public function siteKey():string {return CanonicalJson::digest([$this->workspace->publishedRoot(),$this->actionsDir,$this->identitySitePath(),$this->recordsPath]);}
    public function configurationVersion():string {return CanonicalJson::digest(['definitions'=>$this->definitions($this->actionsDir),'site'=>$this->siteDataBytes()]);}
    private function pinned(OperationActor $actor,\stdClass $input):array {$read=$this->get($actor,(object)['action_id'=>$input->action_id]);if(!hash_equals($read['version'],$input->version))throw new OperationException('content_conflict','The Action changed. Review its current definition.');$this->validateDefinition($read['definition']);return $read['definition'];}
    private function definitions(string $root):array {
        if(!is_dir($root))return [];$out=[];$count=0;$total=0;
        foreach(new \DirectoryIterator($root) as $entry){if($entry->isDot())continue;if(++$count>240)throw new OperationException('size_limit','Action directory exceeds its entry limit.');if(!preg_match('/^([a-z0-9][a-z0-9_-]{0,63})\.json$/D',$entry->getFilename(),$m))continue;
            $bytes=BusinessContracts::read($root,$entry->getFilename());$def=BusinessContracts::bounded(json_decode($bytes,false,32,JSON_THROW_ON_ERROR));if(($def['id']??null)!==$m[1])throw new OperationException('invalid_schema','Action IDs must match their filenames.');$total+=strlen($bytes);if($total>1048576||count($out)>=100)throw new OperationException('size_limit','Action definitions exceed their inventory limit.');$out[$m[1]]=$bytes;}
        ksort($out,SORT_STRING);return $out;
    }
    private function siteDataBytes():?string {
        $path=$this->siteDataPath;
        if($path===$this->workspace->draftRoot().'/assets/data/site.json')$path=$this->workspace->resolveDraft('assets/data/site.json');
        return BusinessContracts::read(dirname($path),basename($path),1048576);
    }
    private function siteData():array {return json_decode($this->siteDataBytes()??'{}',true,32,JSON_THROW_ON_ERROR);}
    private function validateDefinition(array $definition):void {
        foreach(['id','name','description','icon','category','bar_button_label'] as $field)if(isset($definition[$field])&&!is_string($definition[$field]))throw new OperationException('invalid_schema','Action text fields must be strings.');
        if(isset($definition['active'])&&!is_bool($definition['active']))throw new OperationException('invalid_schema','Action active must be a boolean.');
        foreach(['companion_tools','notifications'] as $container)foreach((array)($definition[$container]??[]) as $key=>$value)if(in_array($key,['check_availability','cancel_by_code','guest_notify','owner_notify'],true)&&!is_bool($value))throw new OperationException('invalid_schema','Action switches must be booleans.');
        foreach((array)($definition['constraints']??[]) as $constraint)if(!is_array($constraint))throw new OperationException('invalid_schema','Action constraints must use objects.');
        foreach(['constraints','confirmation','responses','companion_tools','notifications','rate_limit'] as $field)if(isset($definition[$field])&&!is_array($definition[$field]))throw new OperationException('invalid_schema','Action configuration must use objects.');
        if(!isset($definition['fields'])||!is_array($definition['fields'])||!array_is_list($definition['fields'])||count($definition['fields'])>100)throw new OperationException('invalid_schema','Action fields must be a bounded list.');
        foreach($definition['fields'] as $field) {
            if(!is_array($field)||!is_string($field['name']??null)||!is_string($field['type']??null))throw new OperationException('invalid_schema','Every Action field needs a name and type.');
            foreach(['label','placeholder','description'] as $key)if(isset($field[$key])&&!is_string($field[$key]))throw new OperationException('invalid_schema','Action field text must be a string.');
            if(isset($field['options'])&&(!is_array($field['options'])||array_filter($field['options'],fn($v)=>!is_string($v))))throw new OperationException('invalid_schema','Action field options must be strings.');
            foreach(['min_length','max_length'] as $key)if(isset($field[$key])&&(!is_int($field[$key])||$field[$key]<0||$field[$key]>32768))throw new OperationException('invalid_schema','Action text length is out of range.');
        }
        foreach(['name'=>300,'description'=>2000,'bar_button_label'=>100] as $key=>$max)if(isset($definition[$key])&&mb_strlen($definition[$key])>$max)throw new OperationException('size_limit','Action display text exceeds its limit.');
        foreach($definition['fields'] as $field) {
            if(isset($field['required'])&&!is_bool($field['required']))throw new OperationException('invalid_schema','Field required must be a boolean.');
            if(isset($field['options'])&&count($field['options'])>100)throw new OperationException('size_limit','A field may have at most 100 options.');
        }
        foreach($definition['constraints']??[] as $name=>$constraint) {
            if(isset($constraint['enabled'])&&!is_bool($constraint['enabled']))throw new OperationException('invalid_schema','Constraint enabled must be a boolean.');
            foreach(['slot_fields','fields','count_statuses','scope_statuses'] as $key)if(isset($constraint[$key])&&(!is_array($constraint[$key])||count($constraint[$key])>8||array_filter($constraint[$key],fn($v)=>!is_string($v))))throw new OperationException('invalid_schema','Constraint field/status lists must contain at most eight strings.');
            if(isset($constraint['max_per_slot'])&&(!is_int($constraint['max_per_slot'])||$constraint['max_per_slot']<1||$constraint['max_per_slot']>1000000))throw new OperationException('invalid_schema','Slot capacity must be a bounded positive integer.');
            foreach(['time_field','date_field'] as $key)if(isset($constraint[$key])&&!is_string($constraint[$key]))throw new OperationException('invalid_schema','Constraint field names must be strings.');
            if(isset($constraint['fallback_hours'])&&(!is_array($constraint['fallback_hours'])||array_filter($constraint['fallback_hours'],fn($v)=>!is_string($v))))throw new OperationException('invalid_schema','Fallback hours must use string times.');
        }
        foreach($definition['rate_limit']??[] as $value)if(!is_int($value)||$value<1||$value>1000000)throw new OperationException('invalid_schema','Rate limits must be bounded positive integers.');
        foreach($definition['responses']??[] as $value)if(!is_string($value))throw new OperationException('invalid_schema','Response messages must be strings.');
        $c=$definition['confirmation']??[];if(isset($c['default_status'])&&!in_array($c['default_status'],['confirmed','pending','cancelled','completed','no-show'],true))throw new OperationException('invalid_schema','Unsupported Action default status.');if(isset($c['code_length'])&&(!is_int($c['code_length'])||$c['code_length']<4||$c['code_length']>32))throw new OperationException('invalid_schema','Confirmation codes must contain 4–32 characters.');
        if(isset($c['code_alphabet'])&&(!is_string($c['code_alphabet'])||!preg_match('/^[A-Z0-9]{2,64}$/D',$c['code_alphabet'])))throw new OperationException('invalid_schema','Confirmation alphabet must be bounded uppercase letters and digits.');
        try {$result=$this->manager()->validateDefinition($definition);}catch(\Throwable){throw new OperationException('invalid_schema','The Action definition has invalid configuration values.');}
        if(!$result['valid'])throw new OperationException('invalid_schema',implode(' ',array_slice($result['errors'],0,10)));
    }
    // Preserve old receipt identities while moving only new writes to canonical draft data.
    private function identitySitePath():string {
        return $this->siteDataPath===ActionConfiguration::draftPath($this->workspace)
            ? ActionConfiguration::legacyPath($this->workspace) : $this->siteDataPath;
    }
    private function releaseStore():ReleaseStore {return new ReleaseStore($this->db,$this->policy,dirname($this->workspace->draftRoot()).'/data/agent/releases');}
    private function publishedSiteBytes():?string {$path=$this->workspace->resolvePublished('assets/data/site.json');return BusinessContracts::read(dirname($path),basename($path),1048576);}
    private function assertPublishedConfiguration(array $metadata):void {
        if(!array_key_exists('published_site_hash',$metadata))return;
        $bytes=$this->publishedSiteBytes();$hash=$bytes===null?null:hash('sha256',$bytes);
        if($metadata['published_site_hash']!==$hash)throw new OperationException('recovery_required','Published Action configuration changed after review. Restore this retained change before retrying.');
    }
    private function writeEntry(array $entry,string $bytes):void {
        if($entry['root']!==$this->workspace->publishedRoot()){WorkspaceFiles::write($entry['root'],$entry['path'],$bytes);return;}
        $path=SiteWorkspace::resolveWithin($entry['root'],$entry['path']);
        $parent=realpath(dirname($path));
        if($parent===false||$parent!==dirname($path)||!is_writable($parent))throw new OperationException('write_failed','Cannot stage the Action manifest in its destination directory.');
        $temporary=tempnam($parent,'.action-');
        if($temporary===false)throw new OperationException('write_failed','Could not stage the public Action manifest.');
        try{if(realpath(dirname($temporary))!==$parent||is_link($temporary))throw new OperationException('write_failed','Action staging must remain in the destination directory.');
            if(file_put_contents($temporary,$bytes)!==strlen($bytes)||!chmod($temporary,0644)||!rename($temporary,$path))throw new OperationException('write_failed','Could not replace the public Action manifest.');}
        finally{if(is_file($temporary))unlink($temporary);}
    }
    private function transitionState(array $row):array {
        $metadata=$this->metadata($row);$state=[];
        if(isset($metadata['draft_version']))$state['draft_version']=$this->workspace->status()['draft_version'];
        if(isset($metadata['release']))$state['release']=[$this->workspace->status()['release_id'],$this->db->queryOne('SELECT manifest_json,digest FROM site_releases WHERE id=?',[$metadata['release']['release_id']])];
        return $state;
    }
    private function metadata(array $row):array {
        if(($row['metadata_json']??null)===null)return []; // Retained pre-upgrade journals keep their exact targets.
        if(strlen($row['metadata_json'])>1048576)throw new OperationException('size_limit','Action transition metadata exceeds its bound.');
        $metadata=json_decode($row['metadata_json'],true,32,JSON_THROW_ON_ERROR);
        if(!hash_equals($row['metadata_digest']??'',CanonicalJson::digest($metadata)))throw new OperationException('recovery_required','Action transition metadata failed verification.');
        return $metadata;
    }
    private function assertMetadataState(array $metadata):void {
        if(isset($metadata['release']))$this->releaseStore()->assertActionTransition($this->workspace,$metadata['release']);
        if(isset($metadata['draft_version'])&&!in_array($this->workspace->status()['draft_version'],array_values($metadata['draft_version']),true))throw new OperationException('recovery_required','Draft version changed outside the retained Action settings change.');
    }
    private function commitMetadata(array $metadata,bool $restore):void {
        $this->assertMetadataState($metadata);
        if(isset($metadata['release']))$this->releaseStore()->commitActionTransition($this->workspace,$metadata['release'],$restore);
        if(isset($metadata['draft_version']))$this->db->update('site_workspace_state',['draft_version'=>$metadata['draft_version'][$restore?'before':'after'],'updated_at'=>time()],'id=1');
    }
    private function plan(\stdClass $intent):array {
        $before=$this->definitions($this->actionsDir);$after=$before;$siteBefore=$this->siteDataBytes();$site=$this->siteData();$changed=[];
        switch($intent->type) {
            case 'save':$definition=BusinessContracts::bounded($intent->definition);$this->validateDefinition($definition);$id=$definition['id'];if(($intent->mode??'upsert')==='create'&&isset($before[$id]))throw new OperationException('content_conflict','An Action with that ID already exists.');if(($intent->mode??'upsert')==='update'&&!isset($before[$id]))throw new OperationException('not_found','Action not found.');$old=isset($before[$id])?json_decode($before[$id],true):null;$definition['version']=(int)($old['version']??0)+1;$after[$id]=CanonicalJson::encode($definition);$changed[]=$id;break;
            case 'delete':if(!isset($before[$intent->action_id]))throw new OperationException('not_found','Action not found.');unset($after[$intent->action_id]);$changed[]=$intent->action_id;break;
            case 'duplicate':case 'from_template':
                $id=$intent->new_id;if(isset($before[$id]))throw new OperationException('content_conflict','The destination Action already exists.');
                $source=$intent->type==='duplicate'?($before[$intent->action_id]??null):BusinessContracts::read($this->templatesDir,$intent->template_id.'.json');if($source===null)throw new OperationException('not_found','Source Action or template not found.');
                $definition=BusinessContracts::bounded(json_decode($source,false,32,JSON_THROW_ON_ERROR));$definition['id']=$id;$definition['active']=false;$definition['version']=1;if($intent->type==='duplicate')$definition['name'].=' (Copy)';$this->validateDefinition($definition);$after[$id]=CanonicalJson::encode($definition);$changed[]=$id;break;
            case 'reorder':$order=$intent->order;$ids=array_keys($before);$sorted=$order;sort($sorted,SORT_STRING);if($sorted!==$ids)throw new OperationException('invalid_schema','Order must include each current Action exactly once.');foreach($order as $index=>$id){$def=json_decode($before[$id],true,32,JSON_THROW_ON_ERROR);$def['order']=$index;$after[$id]=CanonicalJson::encode($def);$changed[]=$id;}break;
            case 'bar':$site['actions_bar']=BusinessContracts::bounded($intent->settings);break;
        }
        ksort($after,SORT_STRING);if(count($after)>100)throw new OperationException('size_limit','Action inventory exceeds 100 definitions.');$siteAfter=$intent->type==='bar'?CanonicalJson::encode($site):$siteBefore;
        $payload=[];foreach(array_unique(array_merge(array_keys($before),array_keys($after))) as $id)if(($before[$id]??null)!==($after[$id]??null))$payload[]=['root'=>$this->actionsDir,'path'=>$id.'.json','before'=>$before[$id]??null,'after'=>$after[$id]??null];
        if($siteAfter!==$siteBefore)$payload[]=['root'=>dirname($this->siteDataPath),'path'=>basename($this->siteDataPath),'before'=>$siteBefore,'after'=>$siteAfter];
        // Existing generated public manifests refresh from the same exact candidate definitions.
        $metadata=[];
        if($intent->type==='bar' && $siteAfter!==$siteBefore){$v=$this->workspace->status()['draft_version'];$metadata['draft_version']=['before'=>$v,'after'=>$v+1];}
        $manifest=BusinessContracts::read($this->workspace->publishedRoot(),'actions/manifest.json',4194304);
        if($intent->type!=='bar' && $manifest!==null) {
            $publishedSite=$this->publishedSiteBytes();
            $dir=dirname($this->actionsDir).'/action-stage-'.bin2hex(random_bytes(8));mkdir($dir,0700,true);
            try {mkdir($dir.'/definitions');foreach($after as $id=>$bytes)WorkspaceFiles::write($dir.'/definitions',$id.'.json',$bytes);WorkspaceFiles::write($dir,'site.json',$publishedSite??'{}');$manager=new ActionManager($dir.'/definitions',$dir.'/unused.db',$dir.'/site.json',$dir.'/uploads',$this->templatesDir);$payload[]=['root'=>$this->workspace->publishedRoot(),'path'=>'actions/manifest.json','before'=>$manifest,'after'=>CanonicalJson::encode($manager->generateManifest())];}
            finally {foreach(glob($dir.'/definitions/*.json') as $file)unlink($file);rmdir($dir.'/definitions');if(is_file($dir.'/site.json'))unlink($dir.'/site.json');rmdir($dir);}
            $metadata['published_site_hash']=$publishedSite===null?null:hash('sha256',$publishedSite);$last=end($payload);$metadata['release']=$this->releaseStore()->actionTransition($this->workspace,$manifest,$last['after']);
        }
        if(strlen(CanonicalJson::encode($payload))>8388608)throw new OperationException('size_limit','Action change exceeds 8 MiB.');
        return [$payload,$changed,CanonicalJson::digest(['definitions'=>$after,'site'=>$siteAfter]),$metadata];
    }
}
