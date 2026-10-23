<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Auth,Database,Validator};

/** Administrative domain changes use current authority and an exact owner-approved review. */
final class AdministrationService
{
    public function __construct(private Database $db,private ActorPolicy $policy,private AdminApprovalStore $approvals) {}

    public static function inputSchema(string $method):array
    {
        $c=ToolContracts::class;
        if($method==='team')return $c::object(['offset'=>$c::integer(10000),'limit'=>['type'=>'integer','minimum'=>1,'maximum'=>50],
            'inventory_version'=>$c::hash()],[]);
        if($method==='get')return $c::object(['plan_id'=>$c::id('admin')]);
        if($method==='apply')return $c::object(['plan_id'=>$c::id('admin'),'digest'=>$c::hash()]);
        if($method!=='prepare')throw new \InvalidArgumentException('Unknown administrative method.');
        $member=['user_id'=>['type'=>'integer','minimum'=>1],'version'=>$c::hash()];
        $name=['type'=>'string','minLength'=>2,'maxLength'=>100];
        $email=['type'=>'string','minLength'=>3,'maxLength'=>254];
        $password=['type'=>'string','minLength'=>8,'maxLength'=>256];
        $role=['enum'=>['editor','viewer']];
        $fields=$c::object(['name'=>$name,'email'=>$email,'role'=>$role],[]);$fields['minProperties']=1;
        return $c::object(['operation_id'=>$c::requestId(),'intent'=>['oneOf'=>[
            $c::object(['type'=>['const'=>'team.create'],'name'=>$name,'email'=>$email,'password'=>$password,'role'=>$role]),
            $c::object(['type'=>['const'=>'team.update']]+$member+['fields'=>$fields]),
            $c::object(['type'=>['const'=>'team.delete']]+$member),
            $c::object(['type'=>['const'=>'team.password']]+$member+['password'=>$password]),
        ]]]);
    }
    public static function memberSchema():array
    {
        $c=ToolContracts::class;
        return $c::object(['id'=>$c::integer(),'name'=>$c::text(100),'email'=>$c::text(254),
            'role'=>['enum'=>['owner','editor','viewer']],'created_at'=>$c::text(40),'updated_at'=>$c::text(40),
            'last_login_at'=>$c::nullable($c::text(40)),'version'=>$c::hash()]);
    }
    public static function outputSchema(string $method):array
    {
        $c=ToolContracts::class;
        if($method==='team')return $c::object(['members'=>$c::list(self::memberSchema(),50),'total'=>$c::integer(10000),
            'next_offset'=>$c::nullable($c::integer(10000)),'inventory_version'=>$c::hash(),'provider_calls'=>['const'=>0]]);
        return AdminApprovalStore::outputSchema();
    }
    public function team(OperationActor $actor,\stdClass $input):array
    {
        JsonSchema::validate($input,self::inputSchema('team'));$this->policy->require($actor,['team:write']);
        $members=$this->db->query('SELECT * FROM users WHERE disabled_at IS NULL ORDER BY id LIMIT 10001');
        if(count($members)>10000)throw new OperationException('size_limit','Team inventory exceeds this installation’s supported budget.');
        $version=CanonicalJson::digest($members);$offset=$input->offset??0;$limit=$input->limit??50;
        if(($offset>0&&!isset($input->inventory_version)) || (isset($input->inventory_version)&&$input->inventory_version!==$version))
            throw new OperationException('content_conflict','The team changed. Restart the team list.');
        $slice=array_map($this->member(...),array_slice($members,$offset,$limit));$next=$offset+count($slice);
        return ['members'=>$slice,'total'=>count($members),'next_offset'=>$next<count($members)?$next:null,
            'inventory_version'=>$version,'provider_calls'=>0];
    }
    public function prepare(OperationActor $actor,\stdClass $input):array
    {
        JsonSchema::validate($input,self::inputSchema('prepare'));$this->policy->require($actor,['team:write']);
        $intent=json_decode(CanonicalJson::encode($input->intent),true,32,JSON_THROW_ON_ERROR);
        // Existence/version validation belongs to execution too. Preparing a
        // replay must return the original review, even after it succeeded.
        $target=$intent['type']==='team.create'?null:$this->db->queryOne('SELECT * FROM users WHERE id=?',[$intent['user_id']]);
        $label=$target?($target['name'].' ('.$target['email'].')'):($intent['name']??'Selected member');
        if(isset($intent['email']))$this->validEmail($intent['email']);
        if(isset($intent['fields']['email']))$this->validEmail($intent['fields']['email']);
        $effects=match($intent['type']){
            'team.create'=>['Create '.$intent['role'].' account for '.$intent['email'].'.','Store a password hash; send no email.'],
            'team.update'=>array_map(fn($key)=>'Set '.$key.' to '.$intent['fields'][$key].'.',array_keys($intent['fields'])),
            'team.password'=>['Replace the selected member password.','Revoke that member’s existing Studio sessions.','Send no email.'],
            'team.delete'=>['Remove the selected member’s login, personal account fields and sessions.','Revoke account-bound REST and MCP credentials.',
                'Retain an inactive account ID for existing business records and operation history.'],
        };
        return $this->approvals->prepare($actor,$input->operation_id,$intent['type'],$intent,
            ['summary'=>str_replace('team.','',$intent['type']).': '.$label,'effects'=>$effects,
                'preserved'=>['Published website files','Private draft files','Other team accounts'],
                'secret_fields'=>isset($intent['password'])?['password']:[]],['team:write'],
            fn()=>$this->validateCurrent($actor,$intent));
    }
    public function get(OperationActor $actor,\stdClass $input):array
    {
        JsonSchema::validate($input,self::inputSchema('get'));return $this->approvals->get($actor,$input->plan_id);
    }
    public function apply(OperationActor $actor,\stdClass $input):array
    {
        JsonSchema::validate($input,self::inputSchema('apply'));
        return $this->approvals->executeDatabase($actor,$input->plan_id,$input->digest,
            function(array $intent,array $plan)use($actor):array{
                $this->policy->require($actor,['team:write']);
                if(!str_starts_with($plan['action'],'team.') || $plan['action']!==($intent['type']??null))
                    throw new OperationException('invalid_schema','Use the matching administrative action service.');
                $this->validateCurrent($actor,$intent);
                $auth=new Auth($this->db);
                if($intent['type']==='team.create'){
                    $this->validEmail($intent['email']);
                    if($this->db->scalar('SELECT COUNT(*) FROM users WHERE lower(email)=?', [strtolower(trim($intent['email']))]))
                        throw new OperationException('content_conflict','An account with this email already exists.');
                    $id=$auth->createUser($intent['name'],$intent['email'],$intent['password'],$intent['role']);
                }else{
                    $id=$intent['user_id'];$member=$this->db->queryOne('SELECT * FROM users WHERE id=?',[$id]);
                    if(!$member || $member['disabled_at']!==null || !hash_equals(CanonicalJson::digest($member),$intent['version']))
                        throw new OperationException('content_conflict','The team member changed after this review.');
                    if(in_array($intent['type'],['team.delete','team.password'],true) && ($member['role']==='owner' || $id===$actor->userId))
                        throw new OperationException('permission_denied','Use the owner profile workflow for the owner account. Self-removal is unavailable.');
                    if($intent['type']==='team.update'){
                        if(isset($intent['fields']['email']))$this->validEmail($intent['fields']['email']);
                        $result=$auth->updateUser($id,$intent['fields']);
                        if(!$result['ok'])throw new OperationException('permission_denied',$result['error']);
                    }elseif($intent['type']==='team.password'){
                        $auth->setPassword($id,$intent['password']);$this->db->delete('sessions','user_id = ?',[$id]);
                    }elseif($intent['type']==='team.delete'){
                        $keys=$this->db->query('SELECT key_id FROM studio_mcp_credentials WHERE user_id=? UNION SELECT key_id FROM agent_rest_owners WHERE user_id=?',[$id,$id]);
                        foreach($keys as $key)$this->db->delete('api_keys','id = ?',[$key['key_id']]);
                        $result=$auth->deleteUser($id);
                        if(!$result['ok'])throw new OperationException('permission_denied',$result['error']);
                    }
                }
                $current=$this->db->queryOne('SELECT * FROM users WHERE id=?',[$id]);
                return ['changed'=>true,'entity'=>'team','entity_id'=>$id,'version'=>$current && $current['disabled_at']===null?CanonicalJson::digest($current):null,
                    'secret_delivery'=>'none','provider_calls'=>0];
            });
    }
    private function member(array $row):array
    {
        return array_intersect_key($row,array_flip(['id','name','email','role','created_at','updated_at']))
            +['last_login_at'=>$row['last_login_at']??null,'version'=>CanonicalJson::digest($row)];
    }
    /** Fresh reviews validate current data; a retained replay is resolved first. */
    private function validateCurrent(OperationActor $actor,array $intent):void
    {
        $this->policy->require($actor,['team:write']);
        $fields=$intent['type']==='team.create'?$intent:($intent['fields']??[]);
        if(isset($fields['name']) && mb_strlen(trim($fields['name']),'UTF-8')<2)
            throw new OperationException('invalid_schema','Name must be at least 2 characters.');
        if(isset($fields['email'])) {
            $this->validEmail($fields['email']);
            if($this->db->scalar('SELECT COUNT(*) FROM users WHERE lower(email)=? AND id!=?',
                [strtolower(trim($fields['email'])),$intent['user_id']??0]))
                throw new OperationException('content_conflict','An account with this email already exists.');
        }
        if($intent['type']==='team.create') {
            if((int)$this->db->scalar('SELECT COUNT(*) FROM users WHERE disabled_at IS NULL')>=10000)
                throw new OperationException('size_limit','This team reached the supported account limit.');
            return;
        }
        $member=$this->db->queryOne('SELECT * FROM users WHERE id=?',[$intent['user_id']]);
        if(!$member || $member['disabled_at']!==null || !hash_equals(CanonicalJson::digest($member),$intent['version']))
            throw new OperationException('content_conflict','The team member changed. Review the current account before trying again.');
        if(in_array($intent['type'],['team.delete','team.password'],true) && ($member['role']==='owner' || $member['id']===$actor->userId))
            throw new OperationException('permission_denied','Use the owner profile workflow for the owner account. Self-removal is unavailable.');
        if($member['role']==='owner' && isset($fields['role']) && $fields['role']!=='owner')
            throw new OperationException('permission_denied','The owner role cannot be changed through team management.');
    }
    private function validEmail(string $email):void
    {
        if(($error=Validator::email($email))!==null)throw new OperationException('invalid_schema',$error);
    }
}
