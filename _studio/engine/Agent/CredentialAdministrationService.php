<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{AgentAuth,Database};

/** Credential administration never delivers generated plaintext through MCP. */
final class CredentialAdministrationService
{
    public function __construct(private Database $db,private ActorPolicy $policy,private AdminApprovalStore $approvals) {}
    public static function inputSchema(string $method):array
    {
        $c=ToolContracts::class;
        if($method==='list')return $c::object(['offset'=>$c::integer(10000),
            'limit'=>['type'=>'integer','minimum'=>1,'maximum'=>50],'inventory_version'=>$c::hash(),
            'audience'=>['enum'=>['studio_mcp','rest']]],[]);
        if(in_array($method,['get','apply'],true))return AdministrationService::inputSchema($method);
        if($method!=='prepare')throw new \InvalidArgumentException('Unknown credential operation.');
        $common=['type'=>['const'=>'credential.create'],'user_id'=>['type'=>'integer','minimum'=>1],
            'label'=>['type'=>'string','minLength'=>1,'maxLength'=>100]];
        $mcp=$common+['audience'=>['const'=>'studio_mcp'],'preset'=>['enum'=>array_keys(ActorPolicy::presets())],
            'client_name'=>$c::nullable($c::text(100)),
            'extra_scopes'=>['type'=>'array','uniqueItems'=>true,'maxItems'=>80,'items'=>['enum'=>array_values(array_unique(ActorPolicy::ceiling('owner')))]]];
        $mcpRequired=array_merge(array_keys($common),['audience','preset','extra_scopes']);
        return $c::object(['operation_id'=>$c::requestId(),'intent'=>['oneOf'=>[
            $c::object($mcp+['expires_at'=>['type'=>'integer','minimum'=>1]],[...$mcpRequired,'expires_at']),
            $c::object($mcp+['expiry_days'=>['type'=>'integer','minimum'=>1,'maximum'=>366]],[...$mcpRequired,'expiry_days']),
            $c::object($common+['audience'=>['const'=>'rest'],'role'=>['enum'=>['owner','editor','viewer','agent']],
                'scopes'=>['type'=>'array','uniqueItems'=>true,'minItems'=>1,'maxItems'=>50,'items'=>['enum'=>AgentAuth::getAllScopes()]]]),
            $c::object(['type'=>['const'=>'credential.revoke'],'credential_id'=>['type'=>'integer','minimum'=>1],'version'=>$c::hash()]),
            $c::object(['type'=>['const'=>'credential.bind_rest'],'credential_id'=>['type'=>'integer','minimum'=>1],
                'version'=>$c::hash(),'user_id'=>['type'=>'integer','minimum'=>1]]),
        ]]]);
    }
    public static function outputSchema(string $method):array
    {
        if($method!=='list')return AdminApprovalStore::outputSchema();
        $c=ToolContracts::class;
        return $c::object(['credentials'=>$c::list($c::object(['id'=>$c::integer(),'label'=>$c::text(100),
            'audience'=>['enum'=>['studio_mcp','rest']],'user_id'=>$c::nullable($c::integer()),'role'=>$c::text(20),
            'scopes'=>$c::list($c::text(80),100),'created_at'=>$c::text(40),'expires_at'=>$c::nullable($c::integer()),
            'revoked_at'=>$c::nullable($c::integer()),'version'=>$c::hash()]),50),
            'total'=>$c::integer(10000),'next_offset'=>$c::nullable($c::integer(10000)),
            'inventory_version'=>$c::hash(),'provider_calls'=>['const'=>0]]);
    }
    public function list(OperationActor $actor,\stdClass $input):array
    {
        JsonSchema::validate($input,self::inputSchema('list'));$this->policy->require($actor,['credentials:write']);
        $rows=$this->rows(audience:$input->audience??null);if(count($rows)>10000)throw new OperationException('size_limit','Credential inventory exceeds the supported budget.');
        $version=CanonicalJson::digest($rows);$offset=$input->offset??0;$limit=$input->limit??50;
        if(($offset>0&&!isset($input->inventory_version)) || (isset($input->inventory_version)&&$input->inventory_version!==$version))
            throw new OperationException('content_conflict','Connections changed. Restart the credential list.');
        $slice=array_map($this->metadata(...),array_slice($rows,$offset,$limit));$next=$offset+count($slice);
        return ['credentials'=>$slice,'total'=>count($rows),'next_offset'=>$next<count($rows)?$next:null,
            'inventory_version'=>$version,'provider_calls'=>0];
    }
    public function prepare(OperationActor $actor,\stdClass $input):array
    {
        JsonSchema::validate($input,self::inputSchema('prepare'));$this->policy->require($actor,['credentials:write']);
        $intent=json_decode(CanonicalJson::encode($input->intent),true,32,JSON_THROW_ON_ERROR);
        $effects=match($intent['type']){
            'credential.create'=>['Create a '.$intent['audience'].' credential for account '.$intent['user_id'].'.',
                $intent['audience']==='rest'?'REST role: '.$intent['role'].'.':'Access preset: '.$intent['preset'].'.',
                'Grant: '.implode(', ',$intent['audience']==='studio_mcp'?array_unique(array_merge(ActorPolicy::presets()[$intent['preset']]['scopes'],$intent['extra_scopes'])):$intent['scopes']).'.',
                'Deliver the new credential once to the owner in Studio; the requesting connection never receives it.',
                $intent['audience']==='studio_mcp'
                    ?(isset($intent['expiry_days'])?'Credential expires '.$intent['expiry_days'].' days after creation.'
                        :'Credential expiry: '.gmdate('Y-m-d H:i:s \U\T\C',$intent['expires_at']).'.')
                    :'REST credentials remain valid until revoked.'],
            'credential.revoke'=>['Revoke credential '.$intent['credential_id'].'. Existing website and business records remain intact.'],
            'credential.bind_rest'=>['Bind REST credential '.$intent['credential_id'].' to account '.$intent['user_id'].'. Its existing audience and granted scopes are preserved.'],
        };
        return $this->approvals->prepare($actor,$input->operation_id,$intent['type'],$intent,
            ['summary'=>str_replace('credential.','',$intent['type']).': '.($intent['label']??'Credential '.$intent['credential_id']),
                'effects'=>$effects,'preserved'=>['Website files','Business records','Other credentials'],'secret_fields'=>[]],
            ['credentials:write'],fn()=>$this->validate($actor,$intent));
    }
    public function get(OperationActor $actor,\stdClass $input):array
    {
        JsonSchema::validate($input,self::inputSchema('get'));$this->policy->require($actor,['credentials:write']);
        $plan=$this->approvals->get($actor,$input->plan_id);
        if(!str_starts_with($plan['action'],'credential.'))throw new OperationException('invalid_schema','Use the matching administrative service.');
        return $plan;
    }
    public function apply(OperationActor $actor,\stdClass $input):array
    {
        JsonSchema::validate($input,self::inputSchema('apply'));$this->get($actor,(object)['plan_id'=>$input->plan_id]);
        return $this->approvals->executeDatabase($actor,$input->plan_id,$input->digest,function(array $intent,array $plan)use($actor):array{
            $this->validate($actor,$intent);
            $owner=new OperationActor('user',(int)$plan['approved_by'],null,[],'studio_configured',null);
            if($intent['type']==='credential.create'){
                if($intent['audience']==='studio_mcp'){
                    $created=(new CredentialService($this->db))->create($owner,$intent['user_id'],$intent['preset'],
                        $intent['label'],$intent['client_name']??null,
                        isset($intent['expiry_days'])?time()+$intent['expiry_days']*86400:$intent['expires_at'],$intent['extra_scopes']);
                }else{
                    $created=(new AgentAuth($this->db))->createKey($intent['label'],$intent['role'],$intent['scopes']);
                    $this->policy->bindRestCredential($owner,$created['id'],$intent['user_id']);
                }
                $id=$created['id'];$this->approvals->retainSecret($plan['id'],$id,$created['key']);
            }else{
                $id=$intent['credential_id'];
                if($intent['type']==='credential.bind_rest')$this->policy->bindRestCredential($owner,$id,$intent['user_id']);
                elseif($this->row($id)['audience']==='studio_mcp')(new CredentialService($this->db))->revoke($owner,$id);
                else (new AgentAuth($this->db))->revokeKey($id);
            }
            $row=$this->row($id);
            return ['changed'=>true,'entity'=>'credential','entity_id'=>$id,'version'=>$row?CanonicalJson::digest($row):null,
                'secret_delivery'=>$intent['type']==='credential.create'?'studio_once':'none','provider_calls'=>0];
        });
    }
    /** The current owner's explicit Studio form approves exactly these fields. Secrets are claimed separately. */
    public function executeStudio(OperationActor $owner, \stdClass $input): array
    {
        $this->policy->requireOwnerSession($owner);
        $review = $this->prepare($owner, $input);
        if (in_array($review['status'], ['pending', 'approved'], true)) {
            $this->approvals->approve($owner, $review['plan_id'], $review['digest']);
        }
        $operation = $this->apply($owner, (object)['plan_id' => $review['plan_id'], 'digest' => $review['digest']]);
        return ['operation' => $operation, 'plan_id' => $review['plan_id'],
            'credential_id' => $operation['result']['entity_id'], 'provider_calls' => 0];
    }
    private function validate(OperationActor $actor,array $intent):void
    {
        $this->policy->require($actor,['credentials:write']);
        if($intent['type']==='credential.create'){
            $user=$this->policy->user($intent['user_id']);
            if(trim($intent['label'])==='' || preg_match('/[\x00-\x1f\x7f]/',$intent['label']))
                throw new OperationException('invalid_schema','Use a readable connection name.');
            if($intent['audience']==='studio_mcp'){
                $scopes=array_merge(ActorPolicy::presets()[$intent['preset']]['scopes'],$intent['extra_scopes']);
                if(array_diff($scopes,ActorPolicy::ceiling($user['role'])))
                    throw new OperationException('permission_denied','The selected access exceeds this account’s role.');
                if(!isset($intent['expiry_days']) && ($intent['expires_at']<time()+60 || $intent['expires_at']>time()+366*86400))
                    throw new OperationException('invalid_schema','Choose a credential expiry within the next year.');
            }elseif(($user['role']==='viewer' && $intent['role']!=='viewer') || ($user['role']==='editor' && $intent['role']==='owner'))
                throw new OperationException('permission_denied','The REST role exceeds the bound account role.');
            return;
        }
        if($actor->credentialId===$intent['credential_id'])
            throw new OperationException('permission_denied','Manage the requesting credential directly from Studio.');
        $row=$this->row($intent['credential_id']);
        if(!$row || !hash_equals(CanonicalJson::digest($row),$intent['version']))
            throw new OperationException('content_conflict','The credential changed. Review its current version.');
        if($intent['type']==='credential.bind_rest'){
            $this->policy->user($intent['user_id']);
            if($row['audience']!=='rest' || ($row['user_id']!==null && (int)$row['user_id']!==$intent['user_id']))
                throw new OperationException('permission_denied','Only an unbound REST credential can receive an account binding.');
        }
    }
    private function rows(?int $id=null,?string $audience=null):array
    {
        return $this->db->query("SELECT k.id,k.label,k.audience,k.role,k.scopes,k.created_at,
            COALESCE(c.user_id,o.user_id) AS user_id,c.expires_at,c.revoked_at
            FROM api_keys k LEFT JOIN studio_mcp_credentials c ON c.key_id=k.id
            LEFT JOIN agent_rest_owners o ON o.key_id=k.id WHERE k.audience IN ('rest','studio_mcp')".
            ($id===null?'':' AND k.id=?').($audience===null?'':' AND k.audience=?').' ORDER BY k.id LIMIT 10001',
            array_merge($id===null?[]:[$id],$audience===null?[]:[$audience]));
    }
    private function row(int $id):?array { return $this->rows($id)[0]??null; }
    private function metadata(array $row):array
    {
        $version=CanonicalJson::digest($row);$row['scopes']=json_decode($row['scopes'],true,32,JSON_THROW_ON_ERROR);
        foreach(['id','user_id','expires_at','revoked_at'] as $field)if($row[$field]!==null)$row[$field]=(int)$row[$field];
        return $row+['version'=>$version];
    }
}
