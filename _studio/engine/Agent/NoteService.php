<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Database,NoteManager};

/** User-owned notes are explicit, untrusted business input, never general site context. */
final class NoteService
{
    private NoteManager $notes;
    private NotesBoardRequestStore $requests;
    public function __construct(private Database $db,private ActorPolicy $policy)
    {$this->notes=new NoteManager($db);$this->requests=new NotesBoardRequestStore($db,$policy);}
    public static function inputSchema(string $method):array
    {
        $c=ToolContracts::class;$id=['type'=>'integer','minimum'=>1];$fields=['title'=>$c::text(1024),'body'=>$c::text(65536),'pinned'=>['type'=>'integer','enum'=>[0,1]]];
        return match($method){
            'list'=>$c::object(['state'=>['enum'=>['active','trash']],'offset'=>$c::integer(5000),'limit'=>['type'=>'integer','minimum'=>1,'maximum'=>100],'collection_version'=>$c::hash()],[]),
            'search'=>$c::object(['query'=>['type'=>'string','maxLength'=>256],'state'=>['enum'=>['active','trash']],'offset'=>$c::integer(5000),'limit'=>['type'=>'integer','minimum'=>1,'maximum'=>100],'collection_version'=>$c::hash()],['query']),
            'read'=>$c::object(['id'=>$id]),
            'create'=>$c::object(['request_id'=>$c::requestId(),'title'=>$fields['title'],'body'=>$fields['body']],['request_id']),
            'update'=>$c::object(['request_id'=>$c::requestId(),'id'=>$id,'expected_version'=>$c::hash(),'fields'=>$c::object($fields,[])]),
            'trash','restore'=>$c::object(['request_id'=>$c::requestId(),'id'=>$id,'expected_version'=>$c::hash()]),
            default=>throw new \InvalidArgumentException('Unknown note operation.'),
        };
    }
    public static function noteSchema():array
    {
        $c=ToolContracts::class;
        return $c::object(['id'=>['type'=>'integer','minimum'=>1],'title'=>$c::text(1024),'body'=>$c::text(65536),
            'pinned'=>['type'=>'integer','enum'=>[0,1]],'user_id'=>['type'=>'integer','minimum'=>1],
            'created_at'=>$c::text(40),'updated_at'=>$c::text(40),'deleted_at'=>$c::nullable($c::text(40)),
            'version'=>$c::hash(),'body_truncated'=>['type'=>'boolean'],'trust'=>['const'=>'untrusted_business_input']]);
    }
    public static function outputSchema(string $method):array
    {
        $c=ToolContracts::class;
        if(in_array($method,['list','search'],true))return $c::object(['notes'=>$c::list(self::noteSchema(),100),'total'=>$c::integer(5000),
            'next_offset'=>$c::nullable($c::integer(5000)),'collection_version'=>$c::hash(),'provider_calls'=>['const'=>0]]);
        return $c::object(['note'=>self::noteSchema(),'pin_limit'=>['type'=>'boolean'],'provider_calls'=>['const'=>0]]);
    }
    public function list(OperationActor $actor,\stdClass $input):array {return $this->listing($actor,$input,false);}
    public function search(OperationActor $actor,\stdClass $input):array {return $this->listing($actor,$input,true);}
    private function listing(OperationActor $actor,\stdClass $input,bool $search):array
    {
        JsonSchema::validate($input,self::inputSchema($search?'search':'list'));$this->policy->require($actor,['notes:read']);
        return $this->db->transaction(function()use($actor,$input,$search):array{
            $version=BusinessRecordVersion::collection($this->db,'notes',$actor->userId);
            if(isset($input->collection_version) && $input->collection_version!==$version || ($input->offset??0)>0 && ($input->collection_version??null)!==$version) {
                throw new OperationException('content_conflict','The note list changed. Start again with its current collection version.');
            }
            $where='user_id=? AND deleted_at IS '.(($input->state??'active')==='trash'?'NOT ':'').'NULL';$args=[$actor->userId];$rank='';
            if($search && $input->query!=='') {
                BusinessRecordVersion::function($this->db,'vs_casefold',static fn($text)=>mb_strtolower((string)$text,'UTF-8'));
                $query=mb_strtolower($input->query,'UTF-8');
                $where.=' AND (instr(vs_casefold(title),?)>0 OR instr(vs_casefold(body),?)>0)';array_push($args,$query,$query);
                $rank='CASE WHEN instr(vs_casefold(title),?)>0 THEN 0 ELSE 1 END,';
            }
            $total=(int)$this->db->scalar('SELECT COUNT(*) FROM notes WHERE '.$where,$args);
            $offset=$input->offset??0;$limit=$input->limit??50;
            if($offset>$total)throw new OperationException('invalid_schema','The note offset is outside this list.');
            $rows=$this->db->query('SELECT * FROM notes WHERE '.$where.' ORDER BY '.$rank.'pinned DESC,updated_at DESC,id DESC LIMIT ? OFFSET ?',
                [...$args,...($rank!==''?[$query]:[]),$limit,$offset]);
            $notes=array_map(fn($row)=>$this->publicNote($row,true),$rows);$next=$offset+count($rows);
            return BusinessRecordVersion::bounded(['notes'=>$notes,'total'=>$total,'next_offset'=>$next<$total?$next:null,'collection_version'=>$version,'provider_calls'=>0]);
        });
    }
    public function read(OperationActor $actor,\stdClass $input):array
    {
        JsonSchema::validate($input,self::inputSchema('read'));$this->policy->require($actor,['notes:read']);
        return BusinessRecordVersion::bounded(['note'=>$this->publicNote($this->row($actor,$input->id)),'pin_limit'=>false,'provider_calls'=>0]);
    }
    public function create(OperationActor $actor,\stdClass $input):array {return $this->mutate($actor,'create',$input);}
    public function update(OperationActor $actor,\stdClass $input):array {return $this->mutate($actor,'update',$input);}
    public function trash(OperationActor $actor,\stdClass $input):array {return $this->mutate($actor,'trash',$input);}
    public function restore(OperationActor $actor,\stdClass $input):array {return $this->mutate($actor,'restore',$input);}
    private function mutate(OperationActor $actor,string $method,\stdClass $input):array
    {
        JsonSchema::validate($input,self::inputSchema($method));
        return $this->requests->run($actor,'notes.'.$method,$input,['notes:read','notes:write'],function()use($actor,$method,$input):array{
            BusinessRecordVersion::collection($this->db,'notes',$actor->userId);$pinLimit=false;
            if($method==='create') {
                BusinessRecordVersion::text($input->title??'',$input->body??'');
                $created=$this->notes->create($actor->userId,$input->title??'',$input->body??'');$id=$created['id'];
            }else {
                $row=$this->row($actor,$input->id);BusinessRecordVersion::expect($row,$input->expected_version);$id=$input->id;
                if($method==='restore') {
                    if($row['deleted_at']===null)throw new OperationException('content_conflict','This note is already active.');
                    if(strtotime($row['deleted_at'])<time()-30)throw new OperationException('review_expired','This note’s undo window expired.');
                    $this->notes->restore($id,$actor->userId);
                }elseif($row['deleted_at']!==null)throw new OperationException('content_conflict','Restore this note before editing it.');
                elseif($method==='trash')$this->notes->softDelete($id,$actor->userId);
                else {
                    $fields=(array)$input->fields;if(!$fields)throw new OperationException('invalid_schema','Provide at least one note field.');
                    BusinessRecordVersion::text($fields['title']??$row['title'],$fields['body']??$row['body']);
                    $pinLimit=$this->notes->update($id,$actor->userId,$fields)['pin_limit'];
                }
            }
            $note=$this->publicNote($this->row($actor,$id));
            $this->notes->hardDeleteExpired($actor->userId,100,$id);
            BusinessRecordVersion::collection($this->db,'notes',$actor->userId);
            return BusinessRecordVersion::bounded(['note'=>$note,'pin_limit'=>$pinLimit,'provider_calls'=>0]);
        });
    }
    private function row(OperationActor $actor,int $id):array
    {
        $row=$this->db->queryOne('SELECT * FROM notes WHERE id=? AND user_id=?',[$id,$actor->userId]);
        if(!$row)throw new OperationException('permission_denied','This note is not available to this account.');
        return $row;
    }
    private function publicNote(array $row,bool $summary=false):array
    {
        BusinessRecordVersion::text($row['title'],$row['body']);$row['version']=BusinessRecordVersion::record($row);
        $row['body_truncated']=$summary && strlen($row['body'])>512;
        if($row['body_truncated'])$row['body']=mb_strcut($row['body'],0,512,'UTF-8');
        $row['trust']='untrusted_business_input';return $row;
    }
}
