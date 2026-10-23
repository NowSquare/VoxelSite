<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Database,Settings,SiteWorkspace,SiteMutationLock};

/** Inbox authority is independent from schema authoring and real invocation authority. */
final class SubmissionService
{
    private BusinessReceiptStore $receipts;
    public function __construct(private Database $db,private ActorPolicy $policy,private SiteWorkspace $workspace,
        private FormService $forms,private ActionService $actions,private string $formDbPath,private string $actionDbPath,
        private string $uploadsRoot,?BusinessReceiptStore $receipts=null) {$this->receipts=$receipts??new BusinessReceiptStore($policy);}
    private static function locator():array {return ['kind'=>['enum'=>['form','action']],'entity_id'=>BusinessContracts::id(),'record_id'=>['type'=>'integer','minimum'=>1]];}
    private static function filters():array {return ['kind'=>['enum'=>['all','form','action']],'entity_id'=>BusinessContracts::id(),'status'=>ToolContracts::text(40),'source'=>ToolContracts::text(40),'search'=>ToolContracts::text(200),'date_from'=>ToolContracts::text(40),'date_to'=>ToolContracts::text(40),'cursor'=>ToolContracts::text(4096),'limit'=>['type'=>'integer','minimum'=>1,'maximum'=>100]];}
    public static function inputSchema(string $method):array {
        $record=ToolContracts::object(['record_id'=>['type'=>'integer','minimum'=>1],'version'=>ToolContracts::hash()]);
        return match($method) {
            'list','export'=>ToolContracts::object(self::filters(),[]),
            'read'=>ToolContracts::object(self::locator()),
            'update'=>ToolContracts::object(self::locator()+['version'=>ToolContracts::hash(),'request_id'=>ToolContracts::requestId(),'status'=>ToolContracts::text(40),'notes'=>ToolContracts::text(10000)],['kind','entity_id','record_id','version','request_id']),
            'delete'=>ToolContracts::object(self::locator()+['version'=>ToolContracts::hash(),'request_id'=>ToolContracts::requestId()]),
            'bulk','purge'=>ToolContracts::object(['kind'=>['enum'=>['form','action']],'entity_id'=>BusinessContracts::id(),'request_id'=>ToolContracts::requestId(),'records'=>['type'=>'array','minItems'=>1,'maxItems'=>100,'items'=>$record],'status'=>ToolContracts::text(40),'before'=>ToolContracts::text(40)],$method==='purge'?['kind','entity_id','request_id','records','before']:['kind','entity_id','request_id','records','status']),
            'attachment'=>ToolContracts::object(self::locator()+['version'=>ToolContracts::hash(),'field'=>['type'=>'string','pattern'=>'^[a-zA-Z][a-zA-Z0-9_-]{0,63}$'],'offset'=>ToolContracts::integer(52428800),'length'=>['type'=>'integer','minimum'=>1,'maximum'=>65536],'sha256'=>ToolContracts::hash()],['kind','entity_id','record_id','version','field']),
            'submit'=>ToolContracts::object(['form_id'=>BusinessContracts::id(),'version'=>ToolContracts::hash(),'request_id'=>ToolContracts::requestId(),'data'=>BusinessContracts::map()]),
            default=>throw new \InvalidArgumentException('Unknown submission method.'),
        };
    }
    private static function recordSchema():array {return ToolContracts::object(self::locator()+['version'=>ToolContracts::hash(),'status'=>ToolContracts::text(40),'source'=>ToolContracts::text(40),'created_at'=>ToolContracts::text(40),'updated_at'=>ToolContracts::text(40),'read_at'=>ToolContracts::nullable(ToolContracts::text(40)),'notes'=>ToolContracts::text(10000),'confirmation_code'=>ToolContracts::nullable(ToolContracts::text(64)),'data'=>BusinessContracts::map(),'metadata'=>BusinessContracts::map()]);}
    public static function outputSchema(string $method):array {
        $provider=['provider_calls'=>['const'=>0]];
        return match($method) {
            'list'=>ToolContracts::object(['records'=>ToolContracts::list(self::recordSchema(),100),'next_cursor'=>ToolContracts::nullable(ToolContracts::text(4096)),'consistency'=>['const'=>'keyset_with_initial_id_watermarks']]+$provider),
            'read'=>ToolContracts::object(['record'=>self::recordSchema()]+$provider),
            'export'=>ToolContracts::object(['csv'=>ToolContracts::text(196608),'rows'=>ToolContracts::integer(100),'header_included'=>['type'=>'boolean'],'next_cursor'=>ToolContracts::nullable(ToolContracts::text(4096)),'formula_protection'=>['const'=>'apostrophe_prefix']]+$provider),
            'attachment'=>ToolContracts::object(['record_id'=>['type'=>'integer','minimum'=>1],'field'=>ToolContracts::text(64),'filename'=>ToolContracts::text(255),'content_type'=>['const'=>'application/octet-stream'],'size'=>ToolContracts::integer(52428800),'sha256'=>ToolContracts::hash(),'offset'=>ToolContracts::integer(52428800),'next_offset'=>ToolContracts::nullable(ToolContracts::integer(52428800)),'base64'=>ToolContracts::text(87384)]+$provider),
            'submit'=>ToolContracts::object(['form_id'=>BusinessContracts::id(),'record_id'=>ToolContracts::nullable(['type'=>'integer','minimum'=>1]),'record_created'=>['type'=>'boolean'],'status'=>ToolContracts::text(40),'request_id'=>ToolContracts::requestId(),'deliveries'=>BusinessReceiptStore::deliveriesSchema()]+$provider),
            default=>ToolContracts::object(['kind'=>['enum'=>['form','action']],'entity_id'=>BusinessContracts::id(),'changed_ids'=>ToolContracts::list(['type'=>'integer','minimum'=>1],100),'request_id'=>ToolContracts::requestId(),'deliveries'=>BusinessReceiptStore::deliveriesSchema(),'attachments_retained'=>['const'=>true],'versions'=>ToolContracts::list(ToolContracts::object(['record_id'=>['type'=>'integer','minimum'=>1],'version'=>ToolContracts::hash()]),100)]+$provider),
        };
    }
    public function list(OperationActor $actor,\stdClass $input):array {
        $this->policy->require($actor,['submissions:read']);JsonSchema::validate($input,self::inputSchema('list'));
        return $this->listing($actor,$input);
    }
    private function listing(OperationActor $actor,\stdClass $input):array {
        $filters=(array)$input;unset($filters['cursor'],$filters['limit']);$digest=CanonicalJson::digest($filters);$limit=$input->limit??50;$cursor=null;
        if(isset($input->cursor)) {
            $decoded=base64_decode(strtr($input->cursor,'-_','+/'),true);if($decoded===false||strlen($decoded)>3000)throw new OperationException('invalid_schema','Invalid inbox cursor.');
            try{$cursor=json_decode($decoded,true,16,JSON_THROW_ON_ERROR);}catch(\Throwable){throw new OperationException('invalid_schema','Invalid inbox cursor.');}
            if(!is_array($cursor)||($cursor['actor']??null)!==$actor->identity()||($cursor['user']??null)!==$actor->userId||($cursor['filters']??null)!==$digest||!isset($cursor['watermarks'],$cursor['last'])||!is_array($cursor['watermarks'])||!is_array($cursor['last']))throw new OperationException('content_conflict','Cursor belongs to another actor or filter.');
        }
        $all=[];$watermarks=$cursor['watermarks']??[];$kind=$input->kind??'all';
        foreach(['form','action'] as $source) {
            if($kind!=='all'&&$kind!==$source)continue;$pdo=$this->connection($source,false);if(!$pdo){$watermarks[$source]=0;continue;}
            [$table,$entity]=$this->table($source);$watermark=$watermarks[$source]??(int)$pdo->query('SELECT COALESCE(MAX(id),0) FROM '.$table)->fetchColumn();if(!is_int($watermark)||$watermark<0)throw new OperationException('invalid_schema','Invalid inbox watermark.');$watermarks[$source]=$watermark;
            $where=['id<=?'];$params=[$watermark];foreach(['entity_id'=>$entity,'status'=>'status','source'=>'source'] as $key=>$column)if(isset($input->$key)){$where[]=$column.'=?';$params[]=$input->$key;}
            if(isset($input->search)){$where[]='data LIKE ?';$params[]='%'.$input->search.'%';}
            foreach(['date_from'=>'>=','date_to'=>'<='] as $key=>$operator)if(isset($input->$key)){$where[]='created_at'.$operator.'?';$params[]=$input->$key;}
            if($cursor){$last=$cursor['last'];if(!is_string($last['date']??null)||!in_array($last['kind']??null,['form','action'],true)||!is_int($last['id']??null))throw new OperationException('invalid_schema','Invalid inbox keyset.');
                $where[]='(created_at < ? OR (created_at = ? AND (? < ? OR (? = ? AND id < ?))))';array_push($params,$last['date'],$last['date'],$source,$last['kind'],$source,$last['kind'],$last['id']);}
            $sql=$this->select($source).' WHERE '.implode(' AND ',$where).' ORDER BY created_at DESC,id DESC LIMIT '.($limit+1);$q=$pdo->prepare($sql);$q->execute($params);
            foreach($q->fetchAll(\PDO::FETCH_ASSOC) as $row)$all[]=$this->record($source,$row);
        }
        usort($all,static fn($a,$b)=>strcmp($b['created_at'],$a['created_at'])?:strcmp($b['kind'],$a['kind'])?:($b['record_id']<=>$a['record_id']));$more=count($all)>$limit;$records=array_slice($all,0,$limit);$next=null;
        if($more){$last=$records[array_key_last($records)];$next=rtrim(strtr(base64_encode(CanonicalJson::encode(['actor'=>$actor->identity(),'user'=>$actor->userId,'filters'=>$digest,'watermarks'=>$watermarks,'last'=>['date'=>$last['created_at'],'kind'=>$last['kind'],'id'=>$last['record_id']]])),'+/','-_'),'=');}
        if(strlen(CanonicalJson::encode($records))>196608)throw new OperationException('size_limit','Inbox page exceeds 192 KiB. Request a smaller page.');
        return ['records'=>$records,'next_cursor'=>$next,'consistency'=>'keyset_with_initial_id_watermarks','provider_calls'=>0];
    }
    public function read(OperationActor $actor,\stdClass $input):array {$this->policy->require($actor,['submissions:read']);JsonSchema::validate($input,self::inputSchema('read'));return ['record'=>$this->load($input->kind,$input->entity_id,$input->record_id),'provider_calls'=>0];}
    public function update(OperationActor $actor,\stdClass $input):array {return $this->mutation($actor,$input,'update');}
    public function delete(OperationActor $actor,\stdClass $input):array {return $this->mutation($actor,$input,'delete');}
    public function bulk(OperationActor $actor,\stdClass $input):array {return $this->mutation($actor,$input,'bulk');}
    public function purge(OperationActor $actor,\stdClass $input):array {return $this->mutation($actor,$input,'purge');}
    private function mutation(OperationActor $actor,\stdClass $input,string $method):array {
        $this->policy->require($actor,['submissions:read','submissions:write']);JsonSchema::validate($input,self::inputSchema($method));
        $lock=SiteMutationLock::acquire($this->workspace->mutationLockPath(),$this->db);
        $pdo=$this->connection($input->kind,true);$records=$input->records??[(object)['record_id'=>$input->record_id,'version'=>$input->version]];
        if(count(array_unique(array_column($records,'record_id')))!==count($records))throw new OperationException('invalid_schema','Each reviewed record ID must appear once.');
        $statuses=$input->kind==='form'?['new','read','replied','archived']:['confirmed','pending','cancelled','completed','no-show'];
        if(isset($input->status)&&!in_array($input->status,$statuses,true))throw new OperationException('invalid_schema','Unsupported record status.');
        if(isset($input->notes)&&$input->kind!=='form')throw new OperationException('invalid_schema','Action records do not have form notes.');
        if($method==='update'&&!isset($input->status)&&!isset($input->notes))throw new OperationException('invalid_schema','Specify a status or note change.');
        if($method==='purge'&&(!strtotime($input->before)||strtotime($input->before)>time()))throw new OperationException('invalid_schema','Purge cutoff must be a date in the past.');
        return $this->receipts->mutate($actor,$pdo,$input->request_id,['site_key'=>$this->actions->siteKey(),'method'=>$method,'input'=>$input],['submissions:read','submissions:write'],function()use($input,$method,$records,$pdo):array {
            [$table,$entity]=$this->table($input->kind);$ids=[];
            foreach($records as $expected){$record=$this->load($input->kind,$input->entity_id,$expected->record_id,$pdo);if(!hash_equals($record['version'],$expected->version))throw new OperationException('content_conflict','A selected record changed. Review its current version.');if($method==='purge'&&strtotime($record['created_at'])>=strtotime($input->before))throw new OperationException('content_conflict','A selected record is newer than the purge cutoff.');$ids[]=$expected->record_id;}
            foreach($ids as $id) {
                if(in_array($method,['delete','purge'],true)){$pdo->prepare("DELETE FROM {$table} WHERE id=? AND {$entity}=?")->execute([$id,$input->entity_id]);continue;}
                $set=['updated_at=?'];$values=[date('c')];if(isset($input->status)){$set[]='status=?';$values[]=$input->status;if($input->kind==='form'&&$input->status!=='new'){$set[]='read_at=COALESCE(read_at,?)';$values[]=date('c');}}
                if(isset($input->notes)){$set[]='notes=?';$values[]=$input->notes;}$values[]=$id;$values[]=$input->entity_id;$pdo->prepare("UPDATE {$table} SET ".implode(',',$set)." WHERE id=? AND {$entity}=?")->execute($values);
            }
            $versions=[];if(!in_array($method,['delete','purge'],true))foreach($ids as $id)$versions[]=['record_id'=>$id,'version'=>$this->load($input->kind,$input->entity_id,$id,$pdo)['version']];
            return ['result'=>['kind'=>$input->kind,'entity_id'=>$input->entity_id,'changed_ids'=>$ids,'attachments_retained'=>true,'versions'=>$versions]];
        });
    }
    public function export(OperationActor $actor,\stdClass $input):array {
        $this->policy->require($actor,['submissions:read','submissions:export']);JsonSchema::validate($input,self::inputSchema('export'));$page=$this->listing($actor,$input);$stream=fopen('php://temp','r+');$header=!isset($input->cursor);
        if($header)fputcsv($stream,['Kind','Entity','ID','Status','Source','Created','Updated','Notes','Confirmation','Data'],',','"','');
        foreach($page['records'] as $row)fputcsv($stream,array_map([BusinessContracts::class,'csvCell'],[$row['kind'],$row['entity_id'],$row['record_id'],$row['status'],$row['source'],$row['created_at'],$row['updated_at'],$row['notes'],$row['confirmation_code'],$row['data']]),',','"','');
        rewind($stream);$csv=stream_get_contents($stream,196609);fclose($stream);if(strlen($csv)>196608)throw new OperationException('size_limit','CSV page exceeds 192 KiB. Request fewer rows.');
        return ['csv'=>$csv,'rows'=>count($page['records']),'header_included'=>$header,'next_cursor'=>$page['next_cursor'],'formula_protection'=>'apostrophe_prefix','provider_calls'=>0];
    }
    public function attachment(OperationActor $actor,\stdClass $input):array
    {
        $file=$this->openAttachment($actor,$input);
        try {$offset=$input->offset??0;if($offset>0&&!isset($input->sha256))throw new OperationException('content_conflict','Attachment continuation requires its hash.');if(isset($input->sha256)&&!hash_equals($file['sha256'],$input->sha256))throw new OperationException('content_conflict','Attachment hash changed.');if($offset>$file['size'])throw new OperationException('invalid_schema','Attachment offset exceeds its size.');fseek($file['handle'],$offset);$bytes=fread($file['handle'],$input->length??65536);}
        finally{fclose($file['handle']);}
        unset($file['handle']);return $file+['offset'=>$offset,'next_offset'=>$offset+strlen($bytes)<$file['size']?$offset+strlen($bytes):null,'base64'=>base64_encode($bytes),'provider_calls'=>0];
    }
    /** Trusted HTTP adapter streams a verified private copy, never a caller-supplied filesystem path. */
    public function openAttachment(OperationActor $actor,\stdClass $input):array
    {
        $this->policy->require($actor,['submissions:read']);JsonSchema::validate($input,self::inputSchema('attachment'));$record=$this->load($input->kind,$input->entity_id,$input->record_id);
        if(!hash_equals($record['version'],$input->version))throw new OperationException('content_conflict','The attachment record changed.');$value=((array)$record['data'])[$input->field]??null;$path=is_array($value)?($value['path']??null):$value;
        if(!is_string($path)||!str_starts_with($path,'_data/uploads/'))throw new OperationException('not_found','This record field has no attachment.');$relative=substr($path,14);
        if($input->kind==='action'&&!str_starts_with($relative,'actions/'.$input->entity_id.'/'))throw new OperationException('invalid_path','Action attachment is outside its record owner.');
        if($input->kind==='form'&&(str_contains($relative,'/')||!preg_match('/^[a-zA-Z0-9_.-]+$/D',$relative)))throw new OperationException('invalid_path','Form attachment is outside its upload namespace.');
        $absolute=SiteWorkspace::resolveWithin($this->uploadsRoot,$relative);$before=@lstat($absolute);if(!$before||is_link($absolute)||!is_file($absolute))throw new OperationException('not_found','Attachment is unavailable.');if($before['size']>52428800)throw new OperationException('size_limit','Attachment exceeds 50 MiB.');
        $handle=fopen($absolute,'rb');if(!$handle)throw new OperationException('not_found','Attachment cannot be read.');$copy=fopen('php://temp/maxmemory:1048576','w+b');if(!$copy){fclose($handle);throw new OperationException('host_capability_unavailable','Private attachment buffering is unavailable.');}
        try {$stat=fstat($handle);if($stat['ino']!==$before['ino'])throw new OperationException('content_conflict','Attachment changed during open.');$hash=hash_init('sha256');$read=0;$deadline=microtime(true)+5;
            while(!feof($handle)) {if(microtime(true)>$deadline)throw new OperationException('host_capability_unavailable','Attachment verification exceeded the request time budget.');$chunk=fread($handle,min(65536,$before['size']+1-$read));if($chunk===false)throw new OperationException('read_failed','Attachment cannot be read.');$read+=strlen($chunk);if($read>$before['size'])throw new OperationException('content_conflict','Attachment grew during read.');hash_update($hash,$chunk);if(fwrite($copy,$chunk)!==strlen($chunk))throw new OperationException('host_capability_unavailable','Private attachment buffering failed.');if($read===$before['size']){if(fread($handle,1)!=='')throw new OperationException('content_conflict','Attachment grew during read.');break;}}
            $sha=hash_final($hash);$after=fstat($handle);if($read!==$before['size']||$after['mtime']!==$before['mtime']||$after['size']!==$before['size'])throw new OperationException('content_conflict','Attachment changed during read.');rewind($copy);
        }catch(\Throwable $error){fclose($copy);throw $error;}finally{fclose($handle);}
        $filename=is_array($value)?($value['original_name']??basename($path)):basename($path);$filename=preg_replace('~[\x00-\x1f\x7f/\\\\]~','_',mb_substr((string)$filename,0,255));
        return ['record_id'=>$input->record_id,'field'=>$input->field,'filename'=>$filename,'content_type'=>'application/octet-stream','size'=>$read,'sha256'=>$sha,'handle'=>$copy];
    }
    public function submit(OperationActor $actor,\stdClass $input):array {
        $this->policy->require($actor,['forms:read','forms:submit']);JsonSchema::validate($input,self::inputSchema('submit'));$lock=SiteMutationLock::acquire($this->workspace->mutationLockPath(),$this->db);
        $pdo=$this->connection('form',true);return $this->receipts->mutate($actor,$pdo,$input->request_id,['site_key'=>$this->actions->siteKey(),'input'=>$input],['forms:read','forms:submit'],function()use($input,$pdo,$actor):array {
            $form=$this->forms->get($actor,(object)['source'=>'published','form_id'=>$input->form_id]);if(!hash_equals($form['version'],$input->version))throw new OperationException('content_conflict','The public form changed.');
            $validation=$this->forms->validate($actor,(object)['source'=>'published','form_id'=>$input->form_id,'version'=>$input->version,'data'=>$input->data]);if(!$validation['valid'])throw new OperationException('validation_failed','Form input is invalid: '.implode(' ',array_values((array)$validation['errors'])));
            $data=(array)$validation['data'];$site=json_decode(BusinessContracts::read($this->workspace->publishedRoot(),'assets/data/site.json',1048576)??'{}',true,32,JSON_THROW_ON_ERROR);$fallback=(string)(new Settings($this->db))->get('mail.from_address','');
            if(FormNotificationPlan::build($form['definition'],$data,$site,0,$fallback))$this->policy->require($actor,['mail:send']);
            $id=null;$status=$form['definition']['default_status']??'new';if(!in_array($status,['new','read','replied','archived'],true))throw new OperationException('invalid_schema','Unsupported form default status.');
            $this->consumeFormQuota($pdo,$actor,$input->form_id,$form['definition']);
            if($form['definition']['submission']['store']??true){$now=date('c');$source=match($actor->type){'rest_key'=>'api','user'=>'studio',default=>'mcp'};$pdo->prepare('INSERT INTO submissions (form_id,data,status,ip_address,user_agent,referrer,source,created_at,updated_at,notes) VALUES (?,?,?,?,?,?,?,?,?,?)')->execute([$input->form_id,CanonicalJson::encode((object)$data),$status,'','','',$source,$now,$now,'']);$id=(int)$pdo->lastInsertId();}
            return ['result'=>['form_id'=>$input->form_id,'record_id'=>$id,'record_created'=>$id!==null,'status'=>$status],'deliveries'=>FormNotificationPlan::build($form['definition'],$data,$site,$id??0,$fallback)];
        });
    }
    /** Runs only for a new receipt, in its source-database transaction. */
    private function consumeFormQuota(\PDO $pdo,OperationActor $actor,string $formId,array $definition):void
    {
        $maximum=max(1,(int)($definition['spam_protection']['max_per_ip_per_hour']??10));
        $query=$pdo->prepare('INSERT INTO rate_limits (ip_address,form_id,window_start,count) VALUES (?,?,?,1)
            ON CONFLICT(ip_address,form_id,window_start) DO UPDATE SET count=rate_limits.count+1 WHERE rate_limits.count<?');
        $query->execute(['actor:'.$actor->identity(),$formId,date('Y-m-d\TH:00:00'),$maximum]);
        if($query->rowCount()!==1)throw new OperationException('rate_limited','This actor has reached the form’s hourly submission limit. Try again in the next hour.');
    }
    private function table(string $kind):array {return $kind==='form'?['submissions','form_id']:['action_records','action_id'];}
    private function connection(string $kind,bool $write):?\PDO {
        $path=$kind==='form'?$this->formDbPath:$this->actionDbPath;$parent=dirname($path);if(is_link($parent)||is_link($path))throw new OperationException('invalid_path','Business database links are not allowed.');
        if(!$write&&!is_file($path))return null;
        if($write&&$kind==='action')return $this->actions->manager()->businessDatabase();
        if(!is_dir($parent)&&(!mkdir($parent,0700,true)))throw new OperationException('host_capability_unavailable','Cannot create private business storage.');
        SiteWorkspace::resolveWithin($parent,basename($path),$write);$pdo=new \PDO('sqlite:'.$path);$pdo->setAttribute(\PDO::ATTR_ERRMODE,\PDO::ERRMODE_EXCEPTION);$pdo->exec('PRAGMA busy_timeout=2000');
        if(!$write){$pdo->exec('PRAGMA query_only=ON');return $pdo;}
        $pdo->exec('PRAGMA journal_mode=WAL');$pdo->exec("CREATE TABLE IF NOT EXISTS submissions (id INTEGER PRIMARY KEY AUTOINCREMENT,form_id TEXT NOT NULL,data TEXT NOT NULL,status TEXT DEFAULT 'new',ip_address TEXT,user_agent TEXT,referrer TEXT,source TEXT DEFAULT 'web',created_at TEXT NOT NULL,updated_at TEXT NOT NULL,read_at TEXT,notes TEXT DEFAULT '')");
        $pdo->exec('CREATE TABLE IF NOT EXISTS rate_limits (ip_address TEXT NOT NULL,form_id TEXT NOT NULL,window_start TEXT NOT NULL,count INTEGER NOT NULL DEFAULT 1,PRIMARY KEY(ip_address,form_id,window_start))');
        $pdo->exec('CREATE INDEX IF NOT EXISTS idx_agent_submissions_created ON submissions(created_at,id)');return $pdo;
    }
    private function select(string $kind):string {return $kind==='form'?'SELECT id,form_id,substr(status,1,41) status,substr(source,1,41) source,substr(created_at,1,41) created_at,substr(updated_at,1,41) updated_at,substr(read_at,1,41) read_at,substr(notes,1,10001) notes,substr(data,1,65537) data,substr(ip_address,1,255) ip_address,substr(user_agent,1,1024) user_agent,substr(referrer,1,2048) referrer FROM submissions':'SELECT id,action_id,substr(status,1,41) status,substr(source,1,41) source,substr(created_at,1,41) created_at,substr(updated_at,1,41) updated_at,substr(confirmation_code,1,65) confirmation_code,substr(data,1,65537) data,substr(ip_address,1,255) ip_address,substr(locale,1,65) locale FROM action_records';}
    private function load(string $kind,string $entityId,int $id,?\PDO $pdo=null):array {$pdo??=$this->connection($kind,false);if(!$pdo)throw new OperationException('not_found','The record is unavailable.');[, $entity]=$this->table($kind);$q=$pdo->prepare($this->select($kind)." WHERE id=? AND {$entity}=?");$q->execute([$id,$entityId]);$row=$q->fetch(\PDO::FETCH_ASSOC);if(!$row)throw new OperationException('not_found','The record is unavailable in this source.');return $this->record($kind,$row);}
    private function record(string $kind,array $row):array {
        foreach(['status','source','created_at','updated_at','read_at'] as $field)if(strlen($row[$field]??'')>40)throw new OperationException('size_limit','Stored record metadata exceeds its bounded contract.');
        if(strlen($row['confirmation_code']??'')>64||strlen($row['locale']??'')>64)throw new OperationException('size_limit','Stored Action metadata exceeds its bounded contract.');
        if(strlen($row['data'])>65536||strlen($row['notes']??'')>10000)throw new OperationException('size_limit','Stored record exceeds the bounded inbox contract.');
        try {$data=BusinessContracts::bounded(json_decode($row['data'],false,32,JSON_THROW_ON_ERROR));}catch(\JsonException){throw new OperationException('invalid_schema','Stored record is not valid JSON.');}
        return ['kind'=>$kind,'entity_id'=>$row[$kind==='form'?'form_id':'action_id'],'record_id'=>(int)$row['id'],'version'=>CanonicalJson::digest($row),'status'=>(string)$row['status'],'source'=>(string)$row['source'],'created_at'=>$row['created_at'],'updated_at'=>$row['updated_at'],'read_at'=>$row['read_at']??null,'notes'=>$row['notes']??'','confirmation_code'=>$row['confirmation_code']??null,'data'=>$data?:new \stdClass(),'metadata'=>['ip_address'=>$row['ip_address']??'','user_agent'=>$row['user_agent']??'','referrer'=>$row['referrer']??'','locale'=>$row['locale']??'']];
    }
    /** Session adapter support preserves the shipped page/count response while sharing bounded records. */
    public function legacyPage(OperationActor $actor,string $kind,string $entityId,array $filters):array
    {
        $this->policy->require($actor,['submissions:read']);JsonSchema::validate($entityId,BusinessContracts::id());
        $page=max(1,min(1000,(int)($filters['page']??1)));$limit=max(1,min(100,(int)($filters['per_page']??20)));$pdo=$this->connection($kind,false);
        if(!$pdo)return ['records'=>[],'total'=>0,'page'=>$page,'per_page'=>$limit];[$table,$entity]=$this->table($kind);$where=[$entity.'=?'];$params=[$entityId];
        foreach(['status','source'] as $key)if(isset($filters[$key])&&$filters[$key]!==''){$where[]=$key.'=?';$params[]=mb_substr((string)$filters[$key],0,40);}
        if(!empty($filters['search'])){$where[]='data LIKE ?';$params[]='%'.mb_substr((string)$filters['search'],0,200).'%';}
        foreach(['date_from'=>'>=','date_to'=>'<='] as $key=>$operator)if(!empty($filters[$key])){$where[]='created_at'.$operator.'?';$params[]=mb_substr((string)$filters[$key],0,40);}
        $q=$pdo->prepare('SELECT COUNT(*) FROM '.$table.' WHERE '.implode(' AND ',$where));$q->execute($params);$total=(int)$q->fetchColumn();
        $q=$pdo->prepare($this->select($kind).' WHERE '.implode(' AND ',$where).' ORDER BY created_at DESC,id DESC LIMIT '.$limit.' OFFSET '.(($page-1)*$limit));$q->execute($params);$records=[];
        foreach($q->fetchAll(\PDO::FETCH_ASSOC) as $row){$record=$this->record($kind,$row);$records[]=$record+['id'=>$record['record_id'],$entity=>$entityId];}
        if(strlen(CanonicalJson::encode($records))>196608)throw new OperationException('size_limit','Inbox page exceeds 192 KiB. Select fewer records.');
        return ['records'=>$records,'total'=>$total,'page'=>$page,'per_page'=>$limit];
    }
    public function summaries(OperationActor $actor,string $kind):array
    {
        $this->policy->require($actor,['submissions:read']);$pdo=$this->connection($kind,false);if(!$pdo)return [];[$table,$entity]=$this->table($kind);
        $q=$pdo->query("SELECT {$entity} entity,status,COUNT(*) count,MAX(created_at) latest FROM {$table} GROUP BY {$entity},status LIMIT 2001");$rows=$q->fetchAll(\PDO::FETCH_ASSOC);if(count($rows)>2000)throw new OperationException('size_limit','Inbox summary exceeds its source bound.');$out=[];
        foreach($rows as $row){$id=$row['entity'];$out[$id]??=['total'=>0,'unread'=>0,'by_status'=>[],'last_activity'=>null];$n=(int)$row['count'];$out[$id]['total']+=$n;$out[$id]['by_status'][$row['status']]=$n;if($row['status']==='new')$out[$id]['unread']+=$n;if($row['latest']>$out[$id]['last_activity'])$out[$id]['last_activity']=$row['latest'];}
        return $out;
    }
    public function legacyExport(OperationActor $actor,string $kind,string $entityId,array $filters):string
    {
        $this->policy->require($actor,['submissions:read','submissions:export']);$input=['kind'=>$kind,'entity_id'=>$entityId,'limit'=>100];foreach(['status','source','search','date_from','date_to'] as $key)if(isset($filters[$key])&&$filters[$key]!=='')$input[$key]=(string)$filters[$key];$csv='';$count=0;
        do {$page=$this->export($actor,(object)$input);$csv.=$page['csv'];$count+=$page['rows'];if(strlen($csv)>8388608||$count>10000)throw new OperationException('size_limit','Export exceeds 8 MiB or 10,000 records. Narrow the filters.');$input['cursor']=$page['next_cursor'];}while($input['cursor']!==null);
        return $csv;
    }
}
