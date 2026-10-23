<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{CardManager,Database};

/** Shared board semantics, with explicit private-note promotion and atomic ordering checks. */
final class BoardService
{
    private CardManager $cards;
    private NotesBoardRequestStore $requests;
    public function __construct(private Database $db,private ActorPolicy $policy)
    {$this->cards=new CardManager($db);$this->requests=new NotesBoardRequestStore($db,$policy);}
    public static function inputSchema(string $method):array
    {
        $c=ToolContracts::class;$id=['type'=>'integer','minimum'=>1];$column=['enum'=>['todo','in_progress','done']];
        $page=$c::nullable(['type'=>'string','maxLength'=>240,'pattern'=>'^/?[A-Za-z0-9_/-]+(?:\\.php)?$']);
        $fields=['title'=>['type'=>'string','minLength'=>1,'maxLength'=>1024],'body'=>$c::text(65536),
            'column_name'=>$column,'linked_page'=>$page,'archived'=>['type'=>'integer','enum'=>[0,1]]];
        $identity=['request_id'=>$c::requestId(),'id'=>$id,'expected_version'=>$c::hash()];
        return match($method){
            'list'=>$c::object(['state'=>['enum'=>['active','archived']],'offset'=>$c::integer(5000),'limit'=>['type'=>'integer','minimum'=>1,'maximum'=>100],'collection_version'=>$c::hash()],[]),
            'read'=>$c::object(['id'=>$id]),
            'create'=>$c::object(['request_id'=>$c::requestId(),'title'=>$fields['title'],'body'=>$fields['body'],'column_name'=>$column,
                'linked_page'=>$page,'source_note_id'=>$c::nullable($id),'expected_source_note_version'=>$c::nullable($c::hash())],['request_id','title']),
            'update'=>$c::object($identity+['fields'=>$c::object($fields,[]),'expected_board_version'=>$c::hash()],['request_id','id','expected_version','fields']),
            'move'=>$c::object($identity+['column_name'=>$column,'position'=>$c::integer(2147483647),'expected_board_version'=>$c::hash()]),
            'archive','restore','delete'=>$c::object($identity),
            default=>throw new \InvalidArgumentException('Unknown board operation.'),
        };
    }
    public static function cardSchema():array
    {
        $c=ToolContracts::class;$id=['type'=>'integer','minimum'=>1];
        return $c::object(['id'=>$id,'title'=>$c::text(1024),'body'=>$c::text(65536),'column_name'=>['enum'=>['todo','in_progress','done']],
            'position'=>$c::integer(2147483647),'linked_page'=>$c::nullable($c::text(240)),'archived'=>['type'=>'integer','enum'=>[0,1]],
            'created_by_user_id'=>$id,'updated_by_user_id'=>$c::nullable($id),'source_note_id'=>$c::nullable($id),
            'created_at'=>$c::text(40),'updated_at'=>$c::text(40),'version'=>$c::hash(),'body_truncated'=>['type'=>'boolean'],'trust'=>['const'=>'untrusted_business_input']]);
    }
    public static function outputSchema(string $method):array
    {
        $c=ToolContracts::class;
        if($method==='list')return $c::object(['cards'=>$c::list(self::cardSchema(),100),'total'=>$c::integer(5000),
            'next_offset'=>$c::nullable($c::integer(5000)),'collection_version'=>$c::hash(),'board_version'=>$c::hash(),'provider_calls'=>['const'=>0]]);
        return $c::object(['card'=>$c::nullable(self::cardSchema()),'deleted'=>['type'=>'boolean'],'board_version'=>$c::hash(),'provider_calls'=>['const'=>0]]);
    }
    public function list(OperationActor $actor,\stdClass $input):array
    {
        JsonSchema::validate($input,self::inputSchema('list'));$this->policy->require($actor,['board:read']);
        return $this->db->transaction(function()use($input):array{
            $version=BusinessRecordVersion::collection($this->db,'cards');
            if(isset($input->collection_version) && $input->collection_version!==$version || ($input->offset??0)>0 && ($input->collection_version??null)!==$version) {
                throw new OperationException('content_conflict','The board changed. Start again with the current collection version.');
            }
            $archived=($input->state??'active')==='archived'?1:0;
            $total=(int)$this->db->scalar('SELECT COUNT(*) FROM cards WHERE archived=?',[$archived]);
            $offset=$input->offset??0;$limit=$input->limit??50;
            if($offset>$total)throw new OperationException('invalid_schema','The board offset is outside this list.');
            $rows=$this->db->query('SELECT * FROM cards WHERE archived=? ORDER BY '.($archived?'updated_at DESC,id DESC':'column_name,position,id').' LIMIT ? OFFSET ?',[$archived,$limit,$offset]);
            $cards=array_map(fn($row)=>$this->publicCard($row,true),$rows);$next=$offset+count($rows);
            return BusinessRecordVersion::bounded(['cards'=>$cards,'total'=>$total,'next_offset'=>$next<$total?$next:null,
                'collection_version'=>$version,'board_version'=>BusinessRecordVersion::board($this->db),'provider_calls'=>0]);
        });
    }
    public function read(OperationActor $actor,\stdClass $input):array
    {
        JsonSchema::validate($input,self::inputSchema('read'));$this->policy->require($actor,['board:read']);
        return $this->db->transaction(fn()=>BusinessRecordVersion::bounded(['card'=>$this->publicCard($this->row($input->id)),
            'deleted'=>false,'board_version'=>BusinessRecordVersion::board($this->db),'provider_calls'=>0]));
    }
    public function create(OperationActor $actor,\stdClass $input):array {return $this->mutate($actor,'create',$input);}
    public function update(OperationActor $actor,\stdClass $input):array {return $this->mutate($actor,'update',$input);}
    public function move(OperationActor $actor,\stdClass $input):array {return $this->mutate($actor,'move',$input);}
    public function archive(OperationActor $actor,\stdClass $input):array {return $this->mutate($actor,'archive',$input);}
    public function restore(OperationActor $actor,\stdClass $input):array {return $this->mutate($actor,'restore',$input);}
    public function delete(OperationActor $actor,\stdClass $input):array {return $this->mutate($actor,'delete',$input);}
    private function mutate(OperationActor $actor,string $method,\stdClass $input):array
    {
        JsonSchema::validate($input,self::inputSchema($method));$scopes=['board:read','board:write'];
        if($method==='create' && ($input->source_note_id??null)!==null)$scopes[]='notes:read';
        return $this->requests->run($actor,'board.'.$method,$input,$scopes,function()use($actor,$method,$input):array{
            BusinessRecordVersion::collection($this->db,'cards');
            if($method==='create') {
                BusinessRecordVersion::text($input->title,$input->body??'');
                if(trim($input->title)==='')throw new OperationException('invalid_schema','A card needs a title.');
                if(($input->source_note_id??null)!==null) {
                    $note=$this->db->queryOne('SELECT * FROM notes WHERE id=? AND user_id=? AND deleted_at IS NULL',[$input->source_note_id,$actor->userId]);
                    if(!$note)throw new OperationException('permission_denied','Only your own active note can be promoted to the shared board.');
                    if(!isset($input->expected_source_note_version))throw new OperationException('content_conflict','Read this note and provide its version before promoting it.');
                    BusinessRecordVersion::expect($note,$input->expected_source_note_version);
                }
                $card=$this->cards->create($actor->userId,$input->title,$input->body??'',$input->column_name??'todo',$input->linked_page??null,$input->source_note_id??null);
                $id=$card['id'];
            }else {
                $row=$this->row($input->id);BusinessRecordVersion::expect($row,$input->expected_version);$id=$input->id;
                if($method==='move' || ($method==='update' && (isset($input->fields->column_name)||isset($input->fields->archived)))) {
                    if(($input->expected_board_version??null)!==BusinessRecordVersion::board($this->db)) {
                        throw new OperationException('content_conflict','Board ordering changed. Read the current board before moving this card.');
                    }
                }
                if($method==='move') {
                    if($row['archived'])throw new OperationException('content_conflict','Restore this archived card before moving it.');
                    $this->cards->move($id,$actor->userId,$input->column_name,$input->position);
                }elseif($method==='archive') {
                    if($row['archived'])throw new OperationException('content_conflict','This card is already archived.');
                    $this->cards->archive($id,$actor->userId);
                }elseif($method==='restore') {
                    if(!$row['archived'])throw new OperationException('content_conflict','This card is already active.');
                    $this->cards->restore($id,$actor->userId);
                }elseif($method==='delete')$this->cards->delete($id);
                else {
                    $fields=(array)$input->fields;
                    if(!$fields || trim($fields['title']??$row['title'])==='')throw new OperationException('invalid_schema','Provide at least one card field and a nonempty title.');
                    BusinessRecordVersion::text($fields['title']??$row['title'],$fields['body']??$row['body']);
                    $this->cards->update($id,$actor->userId,$fields);
                }
            }
            BusinessRecordVersion::collection($this->db,'cards');
            return BusinessRecordVersion::bounded(['card'=>$method==='delete'?null:$this->publicCard($this->row($id)),
                'deleted'=>$method==='delete','board_version'=>BusinessRecordVersion::board($this->db),'provider_calls'=>0]);
        });
    }
    private function row(int $id):array
    {
        $row=$this->db->queryOne('SELECT * FROM cards WHERE id=?',[$id]);
        if(!$row)throw new OperationException('permission_denied','This card is no longer available.');
        return $row;
    }
    private function publicCard(array $row,bool $summary=false):array
    {
        BusinessRecordVersion::text($row['title'],$row['body']);$row['version']=BusinessRecordVersion::record($row);
        $row['body_truncated']=$summary && strlen($row['body'])>512;
        if($row['body_truncated'])$row['body']=mb_strcut($row['body'],0,512,'UTF-8');
        $row['trust']='untrusted_business_input';return $row;
    }
}
