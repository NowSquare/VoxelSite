<?php
declare(strict_types=1);
namespace VoxelSite\Agent;

use VoxelSite\{Database, SiteWorkspace};

/** Pure, bounded inspection of managed sources; never syncs projections or recovers jobs. */
final class FileReadService
{
    public const MAX_FILES = 2000;
    public const MAX_SCAN_BYTES = 33554432;
    public const MAX_READ_BYTES = 65536;
    public const MAX_SEARCH_OFFSET = 10000;

    public function __construct(private Database $db, private ActorPolicy $policy, private SiteWorkspace $workspace) {}

    public static function inputSchema(string $method): array
    {
        $fields = match ($method) {
            'read' => [
                'path' => ['type'=>'string','minLength'=>1,'maxLength'=>240],
                'offset' => ['type'=>'integer','minimum'=>0,'maximum'=>self::MAX_SCAN_BYTES],
                'max_bytes' => ['type'=>'integer','minimum'=>4,'maximum'=>self::MAX_READ_BYTES],
                'expected_hash' => ['type'=>'string','pattern'=>'^[a-f0-9]{64}$'],
            ],
            'list', 'listAssets', 'search' => [
                'prefix' => ['type'=>'string','maxLength'=>240],
                'offset' => ['type'=>'integer','minimum'=>0,'maximum'=>self::MAX_SEARCH_OFFSET],
                'limit' => ['type'=>'integer','minimum'=>1,'maximum'=>100],
                'inventory_version' => ['type'=>'string','pattern'=>'^inventory:[a-f0-9]{64}$'],
                'include_shared' => ['type'=>'boolean'],
            ],
            default => throw new \InvalidArgumentException('Unknown file read method.'),
        };
        if ($method === 'search') $fields += [
            'query'=>['type'=>'string','minLength'=>1,'maxLength'=>128], 'case_sensitive'=>['type'=>'boolean'],
        ];
        return ['type'=>'object','properties'=>$fields,'required'=>$method === 'read' ? ['path'] : ($method === 'search' ? ['query'] : []),'additionalProperties'=>false];
    }

    public static function outputSchema(string $method): array
    {
        $string = ['type'=>'string'];
        $integer = ['type'=>'integer','minimum'=>0];
        $nullableOffset = ['type'=>['integer','null'],'minimum'=>0];
        $common = ['draft_version'=>$string, 'provider_calls'=>['const'=>0]];
        if ($method === 'read') {
            $fields = $common + ['path'=>$string,'sha256'=>$string,'bytes'=>$integer,'content'=>$string,
                'content_encoding'=>['enum'=>['utf8','base64']], 'offset'=>$integer,'next_offset'=>$nullableOffset,
                'truncated'=>['type'=>'boolean']];
        } else {
            $itemFields = $method === 'search'
                ? ['path'=>$string,'sha256'=>$string,'byte_offset'=>$integer,'line'=>['type'=>'integer','minimum'=>1],'excerpt'=>$string]
                : ['path'=>$string,'kind'=>$string,'bytes'=>$integer,'sha256'=>$string];
            $fields = $common + ['inventory_version'=>$string,'offset'=>$integer,'next_offset'=>$nullableOffset,
                'truncated'=>['type'=>'boolean'], $method === 'search' ? 'matches' : 'files'=>[
                    'type'=>'array','maxItems'=>100,'items'=>self::object($itemFields)],
                'limits'=>self::object(['max_files'=>$integer,'max_scan_bytes'=>$integer,'max_read_bytes'=>$integer])];
            $fields += $method === 'search' ? ['excluded_binary_files'=>$integer] : ['total'=>$integer];
        }
        return self::object($fields);
    }

    public function list(OperationActor $actor, \stdClass $request): array
    {
        $this->policy->require($actor,['files:read']);
        return $this->listing($actor,$request, false);
    }

    public function listAssets(OperationActor $actor, \stdClass $request): array
    {
        $this->policy->require($actor,['assets:read']);
        return $this->listing($actor,$request, true);
    }

    private function listing(OperationActor $actor,\stdClass $request, bool $assets): array
    {
        JsonSchema::validate($request,self::inputSchema($assets ? 'listAssets' : 'list'));
        $prefix = $this->prefix($request->prefix ?? ($assets ? 'assets/' : ''));
        if ($assets && !str_starts_with($prefix,'assets/')) throw new OperationException('invalid_path','Asset listing requires an assets/ prefix.');
        $this->requirePrefix($actor,$prefix);
        $snapshot = $this->snapshot($actor,$request->include_shared ?? false);
        $this->checkCursor($request,$snapshot['version']);
        $files = array_values(array_filter($snapshot['files'],static fn ($file)=>str_starts_with($file['path'],$prefix)));
        $offset = $request->offset ?? 0;
        if ($offset > count($files)) throw new OperationException('invalid_schema','The listing offset is beyond this inventory.');
        $slice = array_slice($files,$offset,$request->limit ?? 50);
        $next = $offset + count($slice);
        return ['files'=>$slice,'total'=>count($files),'offset'=>$offset,'next_offset'=>$next<count($files) ? $next:null,
            'truncated'=>$next<count($files)] + $this->common($snapshot);
    }

    public function read(OperationActor $actor, \stdClass $request): array
    {
        $this->policy->require($actor,['files:read']);
        JsonSchema::validate($request,self::inputSchema('read'));
        $path = SitePathPolicy::canonical($request->path);
        $this->policy->require($actor,[self::scopeForPath($path)]);
        $version = $this->version();
        $absolute = $this->workspace->resolveDraft($path);
        $content = $this->stableBytes($absolute);
        $hash = hash('sha256',$content);
        $offset = $request->offset ?? 0;
        if (($offset > 0 && !isset($request->expected_hash))
            || (isset($request->expected_hash) && !hash_equals($hash,$request->expected_hash))) {
            throw new OperationException('content_conflict','Ranged reads require the current source hash. Start again at offset zero.');
        }
        if ($offset > strlen($content)) throw new OperationException('invalid_schema','The source offset is beyond the file.');
        $binary = in_array(SitePathPolicy::type($path),['binary','immutable'],true)
            || !mb_check_encoding($content,'UTF-8') || str_contains($content,"\0");
        $limit = $request->max_bytes ?? 16384;
        if (!$binary && $offset < strlen($content) && (ord($content[$offset]) & 0xc0) === 0x80) {
            throw new OperationException('invalid_schema','Use a returned next_offset to keep UTF-8 characters intact.');
        }
        $part = $binary ? substr($content,$offset,$limit) : mb_strcut($content,$offset,$limit,'UTF-8');
        $next = $offset + strlen($part);
        if ($version !== $this->version()) throw new OperationException('content_conflict','The draft changed during this read. Retry from its current version.');
        return ['path'=>$path,'sha256'=>$hash,'bytes'=>strlen($content),'draft_version'=>$version,'offset'=>$offset,
            'next_offset'=>$next<strlen($content) ? $next:null,'truncated'=>$next<strlen($content),
            'content_encoding'=>$binary ? 'base64':'utf8','content'=>$binary ? base64_encode($part):$part,'provider_calls'=>0];
    }

    public function search(OperationActor $actor, \stdClass $request): array
    {
        $this->policy->require($actor,['files:read']);
        JsonSchema::validate($request,self::inputSchema('search'));
        $prefix = $this->prefix($request->prefix ?? '');
        $this->requirePrefix($actor,$prefix);
        $snapshot = $this->snapshot($actor,$request->include_shared ?? false);
        $this->checkCursor($request,$snapshot['version']);
        $offset = $request->offset ?? 0; $limit = $request->limit ?? 50;
        $seen = 0; $matches = []; $excluded = 0; $more = false;
        foreach ($snapshot['files'] as $file) {
            if (!str_starts_with($file['path'],$prefix)) continue;
            if (in_array($file['kind'],['binary','immutable'],true)) { $excluded++; continue; }
            $bytes = $this->stableBytes($this->workspace->resolveDraft($file['path']));
            if (!hash_equals($file['sha256'],hash('sha256',$bytes))) throw new OperationException('content_conflict','A source changed during search. Start with a new inventory.');
            if (!mb_check_encoding($bytes,'UTF-8') || str_contains($bytes,"\0")) { $excluded++; continue; }
            $position = 0;
            while (($found = ($request->case_sensitive ?? true) ? strpos($bytes,$request->query,$position) : stripos($bytes,$request->query,$position)) !== false) {
                $position = $found + strlen($request->query);
                if ($seen++ < $offset) continue;
                if (count($matches) === $limit) { $more = true; break 2; }
                $start = max(0,$found-80);
                while ($start > 0 && (ord($bytes[$start]) & 0xc0) === 0x80) $start--;
                $matches[] = ['path'=>$file['path'],'sha256'=>$file['sha256'],'byte_offset'=>$found,
                    'line'=>substr_count(substr($bytes,0,$found),"\n")+1,'excerpt'=>mb_strcut($bytes,$start,240,'UTF-8')];
            }
        }
        if ($seen < $offset) throw new OperationException('invalid_schema','The search offset is beyond the matching results.');
        if ($snapshot['draft_version'] !== $this->version()) throw new OperationException('content_conflict','The draft changed during search.');
        if ($more && $offset+count($matches)>self::MAX_SEARCH_OFFSET) throw new OperationException('size_limit','Narrow the search prefix or query to stay within its result budget.');
        return ['matches'=>$matches,'offset'=>$offset,'next_offset'=>$more ? $offset+count($matches):null,
            'truncated'=>$more,'excluded_binary_files'=>$excluded] + $this->common($snapshot);
    }

    /** Walk at most the declared file/byte budget; never follow any descendant link. */
    private function snapshot(OperationActor $actor,bool $shared): array
    {
        $version = $this->version(); $files = []; $totalBytes = 0; $entries = 0;
        $allowed=[];
        foreach(['files:read','assets:read','forms:read'] as $scope) {
            try {$this->policy->require($actor,[$scope]);$allowed[]=$scope;}
            catch(OperationException $error) {if($error->errorCode!=='permission_denied')throw $error;}
        }
        $walk = function (string $root, string $relative = '', string $prefix = '') use (&$walk,&$files,&$totalBytes,&$entries,$allowed): void {
            $directory = $relative === '' ? $root : SiteWorkspace::resolveWithin($root,$relative);
            if (!is_dir($directory) || is_link($directory)) throw new OperationException('invalid_path','The source tree is unavailable or contains an unsafe link.');
            $handle = opendir($directory);
            if ($handle === false) throw new OperationException('host_capability_unavailable','Cannot inspect this source directory.');
            try {
                while (($name = readdir($handle)) !== false) {
                    if ($name === '.' || $name === '..') continue;
                    if (++$entries > self::MAX_FILES * 4) throw new OperationException('size_limit','This inventory exceeds the directory scan budget.');
                    if (str_starts_with($name,'.')) continue;
                    $child = ($relative === '' ? '' : $relative . '/') . $name;
                    $path = $prefix . $child;
                    if (count(explode('/',$path)) > 10) throw new OperationException('size_limit','This inventory exceeds the directory depth budget.');
                    if ((!in_array('forms:read',$allowed,true) && preg_match('#^assets/forms(?:/|$)#D',$path))
                        || (!in_array('assets:read',$allowed,true) && preg_match('#^assets/(images|files|fonts|media|library|icons)(?:/|$)#D',$path))
                        || (!in_array('files:read',$allowed,true) && ($path!=='assets' && !str_starts_with($path,'assets/')
                            || preg_match('#^assets/(css|js|data)(?:/|$)#D',$path)))) continue;
                    $absolute = SiteWorkspace::resolveWithin($root,$child);
                    if (is_dir($absolute)) {
                        if ($prefix === '' && in_array($path,['assets/library','assets/icons'],true)) continue;
                        if ($this->directoryAllowed($path)) $walk($root,$child,$prefix);
                        continue;
                    }
                    if (SitePathPolicy::type($path) === null) continue;
                    if (!in_array(self::scopeForPath($path),$allowed,true)) continue;
                    SitePathPolicy::canonical($path);
                    if (count($files) >= self::MAX_FILES) throw new OperationException('size_limit','This inventory exceeds the managed file limit.');
                    $content = $this->stableBytes($absolute,self::MAX_SCAN_BYTES-$totalBytes);
                    $totalBytes += strlen($content);
                    if ($totalBytes > self::MAX_SCAN_BYTES) throw new OperationException('size_limit','This inventory exceeds the source byte budget.');
                    $files[$path] = ['path'=>$path,'kind'=>SitePathPolicy::type($path),'bytes'=>strlen($content),'sha256'=>hash('sha256',$content)];
                }
            } finally { closedir($handle); }
        };
        $walk($this->workspace->draftRoot());
        if ($shared && in_array('assets:read',$allowed,true)) foreach (['library','icons'] as $directory) {
            $root = SiteWorkspace::resolveWithin($this->workspace->publishedAssetsRoot(),$directory);
            if (is_dir($root)) $walk($root,'','assets/' . $directory . '/');
        }
        ksort($files,SORT_STRING);
        if ($version !== $this->version()) throw new OperationException('content_conflict','The draft changed during inventory.');
        return ['files'=>array_values($files),'draft_version'=>$version,
            'version'=>'inventory:' . CanonicalJson::digest(['actor'=>$actor->identity(),'scopes'=>$allowed,'draft_version'=>$version,'files'=>$files])];
    }

    private function stableBytes(string $path,int $byteLimit=self::MAX_SCAN_BYTES): string
    {
        clearstatcache(true,$path);
        $before = lstat($path);
        if ($before === false || is_link($path) || !is_file($path)) throw new OperationException('invalid_path','This managed source file is unavailable.');
        if ($before['size'] > $byteLimit) throw new OperationException('size_limit','This file exceeds the remaining source inspection budget.');
        $bytes = file_get_contents($path,false,null,0,$before['size']+1);
        $verify = file_get_contents($path,false,null,0,$before['size']+1);
        clearstatcache(true,$path);
        $after = lstat($path);
        if ($bytes === false || $after === false || is_link($path)
            || $before['ino'] !== $after['ino'] || $before['size'] !== strlen($bytes)
            || $after['size'] !== strlen($bytes) || $verify !== $bytes) {
            throw new OperationException('content_conflict','The source changed during inspection. Retry its current version.');
        }
        return $bytes;
    }

    private function version(): string
    {
        $this->workspace->assertReady();
        $state = $this->workspace->status();
        if ($state['reservation_operation_id'] !== null) throw new OperationException('site_busy','A retained site change is in progress. Inspect its operation result before reading sources.');
        return 'draft:' . $state['draft_version'];
    }
    private static function scopeForPath(string $path):string
    {
        return match(SitePathPolicy::type($path)) {
            'forms'=>'forms:read', 'binary','immutable'=>'assets:read', default=>'files:read',
        };
    }
    private function requirePrefix(OperationActor $actor,string $prefix):void
    {
        if(preg_match('#^assets/forms(?:/|$)#D',$prefix))$this->policy->require($actor,['forms:read']);
        elseif(preg_match('#^assets/(images|files|fonts|media|library|icons)(?:/|$)#D',$prefix))$this->policy->require($actor,['assets:read']);
        elseif(preg_match('#^assets/(css|js|data)(?:/|$)#D',$prefix))$this->policy->require($actor,['files:read']);
    }
    private function checkCursor(\stdClass $request,string $version): void
    {
        if ((($request->offset ?? 0)>0 && !isset($request->inventory_version))
            || (isset($request->inventory_version) && !hash_equals($version,$request->inventory_version))) {
            throw new OperationException('content_conflict','Use the inventory version returned with the first page. The source inventory may have changed.');
        }
    }
    private function prefix(string $prefix): string
    {
        if ($prefix !== '' && (!preg_match('~^[A-Za-z0-9_-][A-Za-z0-9_./-]*$~D',$prefix)
            || str_contains($prefix,'..') || str_contains($prefix,'//') || !$this->directoryAllowed(rtrim($prefix,'/')))) {
            throw new OperationException('invalid_path','Use a managed site path prefix.');
        }
        return $prefix;
    }
    private function directoryAllowed(string $path): bool
    {
        if ($path === 'assets' || $path === '_partials' || $path === '_root') return true;
        if (str_starts_with($path,'assets/')) return (bool) preg_match('~^assets/(css|js|data|forms|images|files|fonts|media|library|icons)(?:/|$)~D',$path);
        if (str_starts_with($path,'_')) return str_starts_with($path,'_partials/') || str_starts_with($path,'_root/');
        return !preg_match('~^(vendor|config|storage|node_modules)(?:/|$)~i',$path);
    }
    private function common(array $snapshot): array
    {
        return ['draft_version'=>$snapshot['draft_version'],'inventory_version'=>$snapshot['version'],'provider_calls'=>0,
            'limits'=>['max_files'=>self::MAX_FILES,'max_scan_bytes'=>self::MAX_SCAN_BYTES,'max_read_bytes'=>self::MAX_READ_BYTES]];
    }
    private static function object(array $properties): array
    {
        return ['type'=>'object','properties'=>$properties,'required'=>array_keys($properties),'additionalProperties'=>false];
    }
}
