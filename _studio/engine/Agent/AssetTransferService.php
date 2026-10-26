<?php
declare(strict_types=1);
namespace VoxelSite\Agent;

use VoxelSite\{AssetImageProcessor, Database, SiteWorkspace};

/** Upload bytes are inert private staging, never an edit of draft or live assets. */
class AssetTransferService
{
    public const CHUNK_BYTES = 262144;
    public const EXPIRY_SECONDS = 86400;
    private const MAX_CHUNKS = 1024;
    private const MAX_REQUESTS = 4096;
    private const MAX_STAGED_BYTES = 134217728;
    private string $root;
    private int $limit;
    private int $chunkLimit;

    /** The storage root and byte ceiling are trusted server configuration. */
    public function __construct(private Database $db, private ActorPolicy $policy,
        private SiteWorkspace $workspace, string $root, int $installationLimitBytes = 10485760)
    {
        $root = \VoxelSite\FilesystemPath::normalize($root);
        if ($installationLimitBytes < 1 || !\VoxelSite\FilesystemPath::isAbsolute($root) || is_link($root)) {
            throw new \InvalidArgumentException('A private absolute upload root and positive size limit are required.');
        }
        $parent = $root; $suffix = [];
        while (!file_exists($parent)) {
            if (is_link($parent) || dirname($parent) === $parent) throw new \InvalidArgumentException('Upload storage is unavailable.');
            array_unshift($suffix,basename($parent)); $parent = dirname($parent);
        }
        $resolved = \VoxelSite\FilesystemPath::realpath($parent);
        if (is_link($parent) || !is_dir($parent) || $resolved === false) throw new \InvalidArgumentException('Upload storage is unavailable.');
        foreach ($suffix as $part) if ($part === '.' || $part === '..' || !preg_match('/^[A-Za-z0-9_.-]+$/D',$part)) throw new \InvalidArgumentException('Invalid private upload root.');
        $this->root = $suffix ? rtrim($resolved,'/') . '/' . implode('/',$suffix) : $resolved;
        $this->limit = min($installationLimitBytes,self::iniBytes((string) ini_get('upload_max_filesize')),
            self::iniBytes((string) ini_get('post_max_size')),self::MAX_STAGED_BYTES);
        $this->chunkLimit = min(self::CHUNK_BYTES,max(0,(int) floor((self::iniBytes((string) ini_get('post_max_size'))-8192)*3/4)));
        if ($this->limit < 1 || $this->chunkLimit < 1) throw new OperationException('host_capability_unavailable','The PHP body or upload limit is too small for asset transfers.');
    }

    public static function inputSchema(string $method): array
    {
        $requestId = ['type'=>'string','pattern'=>'^[A-Za-z0-9][A-Za-z0-9_-]{7,127}$'];
        $upload = ['type'=>'string','pattern'=>'^upload_[a-f0-9]{32}$'];
        $hash = ['type'=>'string','pattern'=>'^[a-f0-9]{64}$'];
        $fields = match ($method) {
            'begin'=>['request_id'=>$requestId,'path'=>['type'=>'string','minLength'=>1,'maxLength'=>240],
                'bytes'=>['type'=>'integer','minimum'=>1,'maximum'=>self::MAX_STAGED_BYTES],
                'sha256'=>$hash,'mime_type'=>['type'=>'string','minLength'=>1,'maxLength'=>100]],
            'chunk'=>['request_id'=>$requestId,'upload_id'=>$upload,
                'offset'=>['type'=>'integer','minimum'=>0,'maximum'=>self::MAX_STAGED_BYTES],
                'data_base64'=>['type'=>'string','minLength'=>4,'maxLength'=>4*(int)ceil(self::CHUNK_BYTES/3)],
                'sha256'=>$hash],
            'finish'=>['request_id'=>$requestId,'upload_id'=>$upload],
            default=>throw new \InvalidArgumentException('Unknown upload method.'),
        };
        return self::object($fields);
    }

    public static function outputSchema(string $method): array
    {
        $string = ['type'=>'string']; $integer = ['type'=>'integer','minimum'=>0];
        $common = ['upload_id'=>$string,'path'=>$string,'expires_at'=>$integer,'provider_calls'=>['const'=>0]];
        $fields = match ($method) {
            'begin'=>$common+['status'=>['const'=>'uploading'],'expected_bytes'=>$integer,'expected_hash'=>$string,
                'limits'=>self::object(['max_file_bytes'=>$integer,'max_chunk_bytes'=>$integer,'max_chunks'=>$integer])],
            'chunk'=>$common+['accepted_offset'=>$integer,'accepted_bytes'=>$integer,'next_offset'=>$integer,'sha256'=>$string],
            'finish'=>$common+['status'=>['const'=>'finalized'],'sha256'=>$string,'bytes'=>$integer,
                'original_sha256'=>$string,'original_bytes'=>$integer,'mime_type'=>$string,
                'normalized'=>['type'=>'boolean'],'image'=>self::object([
                    'width'=>['type'=>['integer','null']],'height'=>['type'=>['integer','null']],
                    'thumbnail'=>['type'=>'boolean']])],
            default=>throw new \InvalidArgumentException('Unknown upload method.'),
        };
        return self::object($fields);
    }

    public function begin(OperationActor $actor, \stdClass $request): array
    {
        $this->authorize($actor);
        JsonSchema::validate($request,self::inputSchema('begin'));
        $path = SitePathPolicy::canonical($request->path,true);
        $type = $this->type($path);
        if ($request->mime_type !== $type['mime']) throw new OperationException('invalid_schema','Use the declared MIME type for this managed asset extension.');
        $limit = min($this->limit,$type['limit']);
        if ($request->bytes > $limit) throw new OperationException('size_limit','The asset exceeds the installation or PHP upload limit.',['max_file_bytes'=>$limit]);
        $lock = $this->lock();
        try {
            if ($saved = $this->replay($actor,'begin',$request)) return $saved;
            if ($this->db->scalar('SELECT COUNT(*) FROM agent_asset_uploads WHERE actor_key = ? AND expected_bytes > 0',[$actor->identity()]) >= 32
                || $this->db->scalar('SELECT COUNT(*) FROM agent_asset_uploads WHERE expected_bytes > 0') >= 512
                || (int)$this->db->scalar('SELECT COALESCE(SUM(expected_bytes),0) FROM agent_asset_uploads')+$request->bytes > self::MAX_STAGED_BYTES) {
                throw new OperationException('size_limit','Private upload storage is full. Ask the owner to review retained uploads.');
            }
            $id = 'upload_' . bin2hex(random_bytes(16));
            $expires = time()+self::EXPIRY_SECONDS;
            $result = ['upload_id'=>$id,'path'=>$path,'status'=>'uploading','expected_bytes'=>$request->bytes,
                'expected_hash'=>$request->sha256,'expires_at'=>$expires,'provider_calls'=>0,
                'limits'=>['max_file_bytes'=>$limit,'max_chunk_bytes'=>$this->chunkLimit,'max_chunks'=>self::MAX_CHUNKS]];
            $this->db->transaction(function () use ($actor,$request,$path,$id,$expires,$result): void {
                $this->db->insert('agent_asset_uploads',['id'=>$id,'actor_key'=>$actor->identity(),'user_id'=>$actor->userId,
                    'credential_id'=>$actor->credentialId,'path'=>$path,'mime_type'=>$request->mime_type,
                    'expected_bytes'=>$request->bytes,'expected_hash'=>$request->sha256,'status'=>'uploading',
                    'created_at'=>time(),'expires_at'=>$expires]);
                $this->recordRequest($actor,'begin',$request,$id,$result);
            });
            return $result;
        } finally { $this->unlock($lock); }
    }

    public function chunk(OperationActor $actor, \stdClass $request): array
    {
        $this->authorize($actor);
        JsonSchema::validate($request,self::inputSchema('chunk'));
        $bytes = base64_decode($request->data_base64,true);
        if ($bytes === false || base64_encode($bytes) !== $request->data_base64 || $bytes === '') {
            throw new OperationException('invalid_schema','Provide canonical base64 containing a nonempty chunk.');
        }
        if (strlen($bytes)>$this->chunkLimit) throw new OperationException('size_limit','The decoded chunk exceeds the advertised chunk limit.');
        if (!hash_equals($request->sha256,hash('sha256',$bytes))) throw new OperationException('content_conflict','The chunk digest does not match its bytes.');
        $lock = $this->lock();
        try {
            $row = $this->get($actor,$request->upload_id);
            if ($saved = $this->replay($actor,'chunk',$request)) return $saved;
            if ($row['status'] !== 'uploading') throw new OperationException('content_conflict','This upload was already finalized.');
            if ($request->offset+strlen($bytes) > $row['expected_bytes']) throw new OperationException('size_limit','The chunk exceeds the declared file length.');
            $chunk = $this->db->queryOne('SELECT * FROM agent_asset_chunks WHERE upload_id = ? AND byte_offset = ?',[$row['id'],$request->offset]);
            if ($chunk && ((int)$chunk['byte_length'] !== strlen($bytes) || !hash_equals($chunk['sha256'],$request->sha256))) {
                throw new OperationException('idempotency_conflict','Different bytes were already reserved at this upload offset.');
            }
            if ((!$chunk || !(int)$chunk['complete']) && $request->offset !== $row['received_bytes']) {
                throw new OperationException('content_conflict','Chunks must arrive at the returned next_offset.',['next_offset'=>$row['received_bytes']]);
            }
            if (!$chunk && $this->db->scalar('SELECT COUNT(*) FROM agent_asset_chunks WHERE upload_id = ?',[$row['id']]) >= self::MAX_CHUNKS) {
                throw new OperationException('size_limit','This upload exceeds the chunk count limit.');
            }
            // Retain the request and offset intent before touching bytes.
            $this->db->transaction(function () use ($actor,$request,$row,$bytes,$chunk): void {
                $this->recordRequest($actor,'chunk',$request,$row['id']);
                if (!$chunk) $this->db->insert('agent_asset_chunks',['upload_id'=>$row['id'],'byte_offset'=>$request->offset,
                    'byte_length'=>strlen($bytes),'sha256'=>$request->sha256]);
            });
            $directory = $this->directory($row['id']);
            $target = SiteWorkspace::resolveWithin($directory,'chunk-' . $request->offset . '.bin');
            if (!$chunk || !(int)$chunk['complete']) $this->writeAtomic($target,$bytes);
            if (!is_file($target) || is_link($target) || filesize($target) !== strlen($bytes) || hash_file('sha256',$target) !== $request->sha256) {
                throw new OperationException('content_conflict','Retained chunk integrity verification failed.');
            }
            $next = max($row['received_bytes'],$request->offset+strlen($bytes));
            $result = $this->common($row)+['accepted_offset'=>$request->offset,'accepted_bytes'=>strlen($bytes),'next_offset'=>$next,'sha256'=>$request->sha256];
            $this->db->transaction(function () use ($actor,$request,$row,$next,$result): void {
                $this->db->update('agent_asset_chunks',['complete'=>1],'upload_id = ? AND byte_offset = ?',[$row['id'],$request->offset]);
                $this->db->update('agent_asset_uploads',['received_bytes'=>$next],'id = ?',[$row['id']]);
                $this->saveResult($actor,'chunk',$request->request_id,$result);
            });
            return $result;
        } finally { $this->unlock($lock); }
    }

    public function finish(OperationActor $actor, \stdClass $request): array
    {
        $this->authorize($actor);
        JsonSchema::validate($request,self::inputSchema('finish'));
        $lock = $this->lock();
        try {
            $row = $this->get($actor,$request->upload_id);
            if ($saved = $this->replay($actor,'finish',$request)) {
                $this->verifiedFinal($row);
                return $saved;
            }
            $this->recordRequest($actor,'finish',$request,$row['id']);
            if ($row['status'] === 'finalized') {
                $this->verifiedFinal($row);
                $result = json_decode($row['result_json'],true,64,JSON_THROW_ON_ERROR);
                $this->saveResult($actor,'finish',$request->request_id,$result);
                return $result;
            }
            if ($row['received_bytes'] !== $row['expected_bytes']) throw new OperationException('content_conflict','Upload all declared bytes before finalizing.',['next_offset'=>$row['received_bytes']]);
            $directory = $this->directory($row['id']);
            $raw = SiteWorkspace::resolveWithin($directory,'assembled.bin');
            $this->assemble($row,$raw);
            $final = SiteWorkspace::resolveWithin($directory,'final.' . pathinfo($row['path'],PATHINFO_EXTENSION));
            $result = $this->validateAndStage($row,$raw,$final);
            $this->db->transaction(function () use ($actor,$request,$row,$result): void {
                $this->db->update('agent_asset_uploads',['status'=>'finalized','final_hash'=>$result['sha256'],
                    'final_bytes'=>$result['bytes'],'result_json'=>CanonicalJson::encode($result)],'id = ?',[$row['id']]);
                $this->saveResult($actor,'finish',$request->request_id,$result);
            });
            return $result;
        } finally { $this->unlock($lock); }
    }

    /** Called only while preparing a reviewed attach_asset; never returns a host path. */
    public function finalizedBytes(OperationActor $actor,string $uploadId,string $path): string
    {
        $this->authorize($actor);
        $row = $this->get($actor,$uploadId);
        if ($row['path'] !== SitePathPolicy::canonical($path,true)) throw new OperationException('invalid_path','Attach this upload only to its declared managed asset path.');
        return $this->verifiedFinal($row);
    }

    private function authorize(OperationActor $actor): void
    {
        $this->policy->require($actor,['assets:write']);
        $this->workspace->assertReady();
    }
    private function get(OperationActor $actor,string $id): array
    {
        if (!preg_match('/^upload_[a-f0-9]{32}$/D',$id)) throw new OperationException('invalid_schema','Use a returned upload ID.');
        $row = $this->db->queryOne('SELECT * FROM agent_asset_uploads WHERE id = ? AND actor_key = ? AND user_id = ?',[$id,$actor->identity(),$actor->userId]);
        if (!$row) throw new OperationException('permission_denied','This upload is not available to this connection.');
        if ((int)$row['expires_at']<=time()) throw new OperationException('review_expired','This upload expired. Start a new upload with a new request ID.');
        foreach (['expected_bytes','received_bytes','expires_at'] as $field) $row[$field]=(int)$row[$field];
        return $row;
    }
    private function replay(OperationActor $actor,string $action,\stdClass $request): ?array
    {
        $saved = $this->db->queryOne('SELECT * FROM agent_asset_requests WHERE actor_key = ? AND action = ? AND request_id = ?',[$actor->identity(),$action,$request->request_id]);
        if (!$saved) return null;
        if (!hash_equals($saved['request_digest'],CanonicalJson::digest($request))) throw new OperationException('idempotency_conflict','This request ID was already used for different upload arguments.');
        $this->get($actor,$saved['upload_id']);
        return $saved['result_json'] === null ? null:json_decode($saved['result_json'],true,64,JSON_THROW_ON_ERROR);
    }
    private function recordRequest(OperationActor $actor,string $action,\stdClass $request,string $id,?array $result=null): void
    {
        $existing = $this->db->queryOne('SELECT request_digest FROM agent_asset_requests WHERE actor_key = ? AND action = ? AND request_id = ?',[$actor->identity(),$action,$request->request_id]);
        if ($existing) {
            if (!hash_equals($existing['request_digest'],CanonicalJson::digest($request))) throw new OperationException('idempotency_conflict','This request ID has different upload arguments.');
            return;
        }
        if ($this->db->scalar('SELECT COUNT(*) FROM agent_asset_requests WHERE upload_id = ?',[$id]) >= self::MAX_REQUESTS) throw new OperationException('size_limit','This upload reached its retained request limit.');
        $this->db->insert('agent_asset_requests',['actor_key'=>$actor->identity(),'action'=>$action,'request_id'=>$request->request_id,
            'upload_id'=>$id,'request_digest'=>CanonicalJson::digest($request),'result_json'=>$result === null ? null:CanonicalJson::encode($result),'created_at'=>time()]);
    }
    private function saveResult(OperationActor $actor,string $action,string $requestId,array $result): void
    {
        if ($this->db->update('agent_asset_requests',['result_json'=>CanonicalJson::encode($result)],
            'actor_key = ? AND action = ? AND request_id = ?',[$actor->identity(),$action,$requestId]) !== 1) throw new \RuntimeException('Cannot retain upload result.');
    }
    private function common(array $row): array
    {
        return ['upload_id'=>$row['id'],'path'=>$row['path'],'expires_at'=>$row['expires_at'],'provider_calls'=>0];
    }
    private static function object(array $properties): array
    {
        return ['type'=>'object','properties'=>$properties,'required'=>array_keys($properties),'additionalProperties'=>false];
    }
    private static function iniBytes(string $value): int
    {
        if (trim($value)==='-1') return PHP_INT_MAX;
        if (!preg_match('/^\s*(\d+)\s*([KMG]?)\s*$/iD',$value,$match)) return 0;
        if ((int)$match[1]===0) return PHP_INT_MAX;
        return (int) min(PHP_INT_MAX,(float)$match[1]*(1024 ** (array_search(strtoupper($match[2]),['','K','M','G'],true))));
    }
    /** Shared private storage lock, not the site mutation lock: no site bytes change. */
    private function lock()
    {
        $this->directory();
        $path = SiteWorkspace::resolveWithin($this->root,'transfers.lock');
        $handle = fopen($path,'c');
        if (!$handle || !flock($handle,LOCK_EX|LOCK_NB)) {
            if ($handle) fclose($handle);
            throw new OperationException('site_busy','Another upload request is being recorded. Retry the same request ID.');
        }
        chmod($path,0600);
        return $handle;
    }
    private function unlock($handle): void { flock($handle,LOCK_UN); fclose($handle); }
    private function directory(?string $id=null): string
    {
        if (is_link($this->root)) throw new OperationException('invalid_path','Private upload storage is unsafe.');
        if (!is_dir($this->root) && !mkdir($this->root,0700,true)) throw new OperationException('host_capability_unavailable','Cannot create private upload storage.');
        $access = SiteWorkspace::resolveWithin($this->root,'.htaccess');
        if (!is_file($access)) $this->writeAtomic($access,"Require all denied\nDeny from all\n");
        $protection=file_get_contents($access);
        if (!is_string($protection) || !str_contains($protection,'Require all denied') || !str_contains($protection,'Deny from all')) {
            throw new OperationException('host_capability_unavailable','Private upload access protection is missing.');
        }
        if ($id===null) return $this->root;
        $path = SiteWorkspace::resolveWithin($this->root,$id);
        if (!is_dir($path) && !mkdir($path,0700)) throw new OperationException('host_capability_unavailable','Cannot create private upload staging.');
        return $path;
    }
    protected function writeAtomic(string $path,string $bytes): void
    {
        if (is_link($path)) throw new OperationException('invalid_path','Private upload storage contains an unsafe link.');
        if ($this->availableBytes(dirname($path)) < strlen($bytes)+4096) throw new OperationException('host_capability_unavailable','Private upload storage has insufficient free space.');
        $temporary = tempnam(dirname($path),'.upload-');
        if ($temporary===false) throw new OperationException('host_capability_unavailable','Cannot create private upload staging.');
        try {
            if (file_put_contents($temporary,$bytes)!==strlen($bytes) || !chmod($temporary,0600)
                || !rename($temporary,$path) || hash_file('sha256',$path)!==hash('sha256',$bytes)) {
                throw new OperationException('host_capability_unavailable','Cannot save and verify this upload chunk. Retry the same request ID.');
            }
        } finally { if (is_file($temporary)) unlink($temporary); }
    }
    protected function availableBytes(string $directory): float
    {
        $bytes = disk_free_space($directory);
        return $bytes===false ? 0:(float)$bytes;
    }
    private function assemble(array $row,string $path): void
    {
        $chunks = $this->db->query('SELECT * FROM agent_asset_chunks WHERE upload_id = ? ORDER BY byte_offset',[$row['id']]);
        if ($this->availableBytes(dirname($path)) < $row['expected_bytes']*3+4096) throw new OperationException('host_capability_unavailable','Insufficient private storage for finalization.');
        $output = tempnam(dirname($path),'.assemble-');
        if ($output===false) throw new OperationException('host_capability_unavailable','Cannot create private assembly staging.');
        $stream = fopen($output,'wb'); $offset=0; $hash=hash_init('sha256');
        try {
            if ($stream===false) throw new OperationException('host_capability_unavailable','Cannot assemble upload.');
            foreach ($chunks as $chunk) {
                if (!(int)$chunk['complete'] || (int)$chunk['byte_offset']!==$offset) throw new OperationException('content_conflict','The retained chunk sequence is incomplete.');
                $chunkPath = SiteWorkspace::resolveWithin(dirname($path),'chunk-' . $offset . '.bin');
                $bytes = file_get_contents($chunkPath);
                if ($bytes===false || strlen($bytes)!==(int)$chunk['byte_length'] || !hash_equals($chunk['sha256'],hash('sha256',$bytes))) throw new OperationException('content_conflict','Retained chunk integrity verification failed.');
                if (fwrite($stream,$bytes)!==strlen($bytes)) throw new OperationException('host_capability_unavailable','Cannot assemble the complete upload.');
                hash_update($hash,$bytes); $offset+=strlen($bytes);
            }
            if ($offset!==$row['expected_bytes'] || !hash_equals($row['expected_hash'],hash_final($hash))) throw new OperationException('content_conflict','The complete upload digest or length does not match.');
            fclose($stream); $stream=null;
            if (!chmod($output,0600) || !rename($output,$path)) throw new OperationException('host_capability_unavailable','Cannot retain assembled bytes.');
        } finally {
            if (is_resource($stream)) fclose($stream);
            if (is_file($output)) unlink($output);
        }
    }
    private function verifiedFinal(array $row): string
    {
        if ($row['status']!=='finalized') throw new OperationException('content_conflict','Only finalized uploads can enter a reviewed change set.');
        $path = SiteWorkspace::resolveWithin($this->directory($row['id']),'final.' . pathinfo($row['path'],PATHINFO_EXTENSION));
        $bytes = file_get_contents($path);
        if ($bytes===false || strlen($bytes)!==(int)$row['final_bytes'] || !hash_equals($row['final_hash'],hash('sha256',$bytes))) throw new OperationException('content_conflict','Finalized upload integrity verification failed.');
        return $bytes;
    }

    // Asset policy/processing stays shared with Studio's image processing helper.
    private function type(string $path): array
    {
        if (SitePathPolicy::type($path)!=='binary') throw new OperationException('invalid_path','Upload only managed image, font, media or document assets.');
        $ext = pathinfo($path,PATHINFO_EXTENSION);
        $types = [
            'jpg'=>['image/jpeg','images',10], 'jpeg'=>['image/jpeg','images',10],
            'png'=>['image/png','images',10], 'gif'=>['image/gif','images',10],
            'webp'=>['image/webp','images',10], 'avif'=>['image/avif','images',10],
            'svg'=>['image/svg+xml','images',10], 'pdf'=>['application/pdf','files',50],
            'ico'=>['image/x-icon','images',2],
            'txt'=>['text/plain','files',5], 'csv'=>['text/csv','files',5], 'md'=>['text/markdown','files',5],
            'doc'=>['application/msword','files',50], 'xls'=>['application/vnd.ms-excel','files',50],
            'docx'=>['application/vnd.openxmlformats-officedocument.wordprocessingml.document','files',50],
            'xlsx'=>['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','files',50],
            'woff'=>['font/woff','fonts',5], 'woff2'=>['font/woff2','fonts',5],
            'ttf'=>['font/ttf','fonts',5], 'otf'=>['font/otf','fonts',5],
            'mp4'=>['video/mp4','media',100], 'webm'=>['video/webm','media',100],
            'mp3'=>['audio/mpeg','media',50], 'wav'=>['audio/wav','media',50], 'ogg'=>['audio/ogg','media',50],
        ];
        if (!isset($types[$ext])) throw new OperationException('invalid_path','This asset extension is not supported.');
        [$mime,$category,$mb]=$types[$ext];
        if (!str_starts_with($path,'assets/' . $category . '/') && !($category==='media' && str_starts_with($path,'assets/files/'))) {
            throw new OperationException('invalid_path','Use the asset category appropriate to this file type.');
        }
        return ['mime'=>$mime,'extension'=>$ext,'category'=>$category,'limit'=>$mb*1048576];
    }
    private function validateAndStage(array $row,string $raw,string $final): array
    {
        $type=$this->type($row['path']); $ext=$type['extension'];
        $bytes=file_get_contents($raw);
        if ($bytes===false || !function_exists('finfo_open')) throw new OperationException('host_capability_unavailable','The Fileinfo extension is required to validate uploads.');
        if (!in_array($ext,['doc','docx','xls','xlsx'],true) && preg_match('/<\?(?:php|=)/i',$bytes)) {
            throw new OperationException('invalid_schema','Executable PHP content is not permitted in asset uploads.');
        }
        $mime=(new \finfo(FILEINFO_MIME_TYPE))->buffer($bytes);
        $image=['width'=>null,'height'=>null,'thumbnail'=>false];
        if ($ext==='ico') {
            if (!in_array($mime,['image/x-icon','image/vnd.microsoft.icon','application/octet-stream'],true)) throw new OperationException('invalid_schema','This file is not an icon container.');
            $image=AssetDocumentValidator::icon($bytes);
            $this->writeAtomic($final,$bytes);
        } elseif (in_array($ext,['docx','xlsx'],true)) {
            AssetDocumentValidator::officeXml($raw,$ext,$mime);
            $this->writeAtomic($final,$bytes);
        } elseif (in_array($ext,['doc','xls'],true)) {
            AssetDocumentValidator::officeBinary($bytes,$ext,$mime);
            $this->writeAtomic($final,$bytes);
        } elseif ($ext==='svg') {
            $bytes=$this->sanitizeSvg($bytes);
            $this->writeAtomic($final,$bytes);
        } elseif ($type['category']==='images') {
            if ($mime!==$type['mime'] || !function_exists('imagecreatefromstring')) throw new OperationException('invalid_schema','Image content does not match its extension or this host cannot safely decode it.');
            $dimensions=@getimagesizefromstring($bytes);
            $pixelBudget=min(8000000,max(0,(int)floor((self::iniBytes((string)ini_get('memory_limit'))-memory_get_usage(true)-16777216)/16)));
            if (!$dimensions || $dimensions[0]<1 || $dimensions[1]<1 || $dimensions[0]*$dimensions[1]>$pixelBudget) throw new OperationException('size_limit','The image exceeds this host’s safe decoding memory budget.');
            $source=@imagecreatefromstring($bytes);
            if (!$source) throw new OperationException('invalid_schema','The image decoder rejected this upload.');
            try {
                imagealphablending($source,false); imagesavealpha($source,true);
                ob_start();
                try {
                    $ok=match($ext) {
                        'jpg','jpeg'=>imagejpeg($source,null,90), 'png'=>imagepng($source,null,6),
                        'gif'=>imagegif($source), 'webp'=>function_exists('imagewebp') && imagewebp($source,null,85),
                        'avif'=>function_exists('imageavif') && imageavif($source,null,85),
                        default=>false,
                    };
                    $bytes=ob_get_contents();
                } finally { ob_end_clean(); }
                if (!$ok || !is_string($bytes)) throw new OperationException('host_capability_unavailable','This host cannot sanitize the selected image format.');
                $this->writeAtomic($final,$bytes);
            } finally { unset($source); }
            $processed=AssetImageProcessor::process($final,$ext);
            if (isset($processed['processing_error'])) throw new OperationException('host_capability_unavailable','Private image processing failed.');
            $actual=@getimagesize($final);
            if (!$actual) throw new OperationException('content_conflict','Processed image integrity verification failed.');
            $hasThumbnail=isset($processed['thumbnail']);
            if ($hasThumbnail) {
                $thumbnail=SiteWorkspace::resolveWithin(dirname($final),'thumbs/'.basename($final));
                if (!is_file($thumbnail) || !@getimagesize($thumbnail)) throw new OperationException('host_capability_unavailable','The private thumbnail could not be verified.');
            }
            $image=['width'=>$actual[0],'height'=>$actual[1],'thumbnail'=>$hasThumbnail];
        } else {
            if (!$this->magicMatches($ext,$mime,$bytes)) throw new OperationException('invalid_schema','The file content does not match its declared asset type.');
            $this->writeAtomic($final,$bytes);
        }
        $finalBytes=file_get_contents($final);
        if ($finalBytes===false || strlen($finalBytes)>min($this->limit,$type['limit'])) throw new OperationException('size_limit','The sanitized asset exceeds the upload limit.');
        return $this->common($row)+['status'=>'finalized','sha256'=>hash('sha256',$finalBytes),'bytes'=>strlen($finalBytes),
            'original_sha256'=>$row['expected_hash'],'original_bytes'=>$row['expected_bytes'],'mime_type'=>$type['mime'],
            'normalized'=>!hash_equals($row['expected_hash'],hash('sha256',$finalBytes)),'image'=>$image];
    }
    private function magicMatches(string $ext,string $mime,string $bytes): bool
    {
        return match($ext) {
            'pdf'=>str_starts_with($bytes,'%PDF-') && $mime==='application/pdf' && str_contains(substr($bytes,-2048),'%%EOF'),
            'txt','csv','md'=>in_array($mime,['text/plain','text/csv','text/markdown'],true) && mb_check_encoding($bytes,'UTF-8') && !str_contains($bytes,"\0"),
            'woff'=>str_starts_with($bytes,'wOFF') && strlen($bytes)>=44,
            'woff2'=>str_starts_with($bytes,'wOF2') && strlen($bytes)>=48,
            'ttf'=>in_array(substr($bytes,0,4),["\0\1\0\0",'true'],true) && strlen($bytes)>=12,
            'otf'=>str_starts_with($bytes,'OTTO') && strlen($bytes)>=12,
            'mp4'=>substr($bytes,4,4)==='ftyp' && in_array($mime,['video/mp4','application/mp4'],true),
            'webm'=>str_starts_with($bytes,"\x1a\x45\xdf\xa3") && in_array($mime,['video/webm','audio/webm'],true),
            'mp3'=>(str_starts_with($bytes,'ID3') || (strlen($bytes)>2 && ord($bytes[0])===255 && (ord($bytes[1])&224)===224)) && $mime==='audio/mpeg',
            'wav'=>str_starts_with($bytes,'RIFF') && substr($bytes,8,4)==='WAVE' && in_array($mime,['audio/x-wav','audio/wav'],true),
            'ogg'=>str_starts_with($bytes,'OggS') && in_array($mime,['audio/ogg','application/ogg','video/ogg'],true),
            default=>false,
        };
    }
    private function sanitizeSvg(string $bytes): string
    {
        if (!class_exists(\DOMDocument::class)) throw new OperationException('host_capability_unavailable','The DOM extension is required to sanitize SVG assets.');
        if (preg_match('/<!DOCTYPE|<!ENTITY/i',$bytes)) throw new OperationException('invalid_schema','SVG entities and document types are not permitted.');
        $previous=libxml_use_internal_errors(true);
        try {
            $dom=new \DOMDocument();
            if (!$dom->loadXML($bytes,LIBXML_NONET) || !$dom->documentElement || $dom->documentElement->localName!=='svg'
                || !in_array($dom->documentElement->namespaceURI,[null,'http://www.w3.org/2000/svg'],true)) throw new OperationException('invalid_schema','This upload is not an SVG document.');
            $allowed=['svg','g','path','rect','circle','ellipse','line','polyline','polygon','text','tspan','defs',
                'linearGradient','radialGradient','stop','clipPath','mask','use','symbol','title','desc'];
            $clean=function (\DOMNode $node) use (&$clean,$allowed): void {
                foreach (iterator_to_array($node->childNodes) as $child) {
                    if ($child instanceof \DOMElement) {
                        if (!in_array($child->localName,$allowed,true) || !in_array($child->namespaceURI,[null,'http://www.w3.org/2000/svg'],true)) { $node->removeChild($child); continue; }
                        $clean($child);
                    } elseif (!$child instanceof \DOMText) $node->removeChild($child);
                }
                if ($node instanceof \DOMElement) foreach (iterator_to_array($node->attributes) as $attribute) {
                    $name=strtolower($attribute->localName); $value=$attribute->value;
                    if (str_starts_with($name,'on') || $name==='style' || $name==='src'
                        || ($name==='href' && !preg_match('/^#[A-Za-z0-9_.:-]+$/D',$value))
                        || preg_match('/url\s*\(|javascript:|data:/i',$value)
                        || ($attribute->namespaceURI!==null && $attribute->namespaceURI!=='http://www.w3.org/1999/xlink')) {
                        $node->removeAttributeNode($attribute);
                    }
                }
            };
            $clean($dom->documentElement);
            $result=$dom->saveXML($dom->documentElement);
            if ($result===false) throw new OperationException('invalid_schema','SVG sanitation failed.');
            return $result;
        } finally { libxml_clear_errors(); libxml_use_internal_errors($previous); }
    }
}
