<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Database,Encryption,Settings,SiteWorkspace};

/** Owner-session receipts are bound to immutable actions, never agent confirmation strings. */
final class AdminApprovalStore
{
    public const TTL=900;
    public const APPROVAL_TTL=300;
    private Encryption $cipher;
    public function __construct(private Database $db,private ActorPolicy $policy,private SiteWorkspace $workspace,
        private string $key)
    { $this->cipher=new Encryption($key); }

    public static function reviewSchema():array
    {
        $c=ToolContracts::class;
        return $c::object(['summary'=>$c::text(1000),'effects'=>$c::list($c::text(1000),100),
            'preserved'=>$c::list($c::text(1000),100),'secret_fields'=>$c::list($c::text(100),20),
            'files'=>$c::list($c::object(['path'=>$c::text(600),'effect'=>['enum'=>['replace','delete']],
                'before_hash'=>$c::nullable($c::hash()),'after_hash'=>$c::nullable($c::hash()),
                'before_bytes'=>$c::integer(),'after_bytes'=>$c::integer()]),1500),
            'tables'=>$c::list($c::object(['name'=>$c::text(100),'rows'=>$c::integer(),'sha256'=>$c::hash()]),100),
            'final_boundary'=>$c::text(2000)],['summary','effects','preserved','secret_fields']);
    }
    public static function outputSchema():array
    {
        $c=ToolContracts::class;
        return $c::object(['plan_id'=>$c::id('admin'),'operation_id'=>$c::requestId(),'action'=>$c::text(80),'digest'=>$c::hash(),
            'status'=>['enum'=>['pending','approved','authorized','succeeded','cancelled']],'review'=>self::reviewSchema(),
            'requested_by'=>$c::object(['user_id'=>$c::integer(),'credential_id'=>$c::nullable($c::integer()),'connection_name'=>$c::text(100)]),
            'approval_required'=>['const'=>true],'approved_by'=>$c::nullable($c::integer()),'expires_at'=>$c::integer(),
            'approval_expires_at'=>$c::nullable($c::integer()),'provider_calls'=>['const'=>0],
            'result'=>$c::nullable($c::object(['changed'=>['type'=>'boolean'],'provider_calls'=>['const'=>0],
                'entity'=>['enum'=>['team','credential','site','installation','update','storage']],
                'entity_id'=>$c::nullable($c::integer()),'version'=>$c::nullable($c::hash()),
                'operation_id'=>$c::requestId(),
                'secret_delivery'=>['enum'=>['none','studio_once']]],['changed']))]);
    }

    /** Payload may contain write-only inputs; only encrypted bytes are retained. */
    public function prepare(OperationActor $actor,string $operationId,string $action,array $payload,array $review,array $scopes,?callable $validateNew=null):array
    {
        $this->policy->require($actor,$scopes);
        JsonSchema::validate($operationId,ToolContracts::requestId());
        if(!preg_match('/^[a-z][a-z0-9_.]{1,79}$/D',$action) || !$scopes)throw new \InvalidArgumentException('A typed administrative action is required.');
        $json=CanonicalJson::encode($payload);
        if(strlen($json)>131072)throw new OperationException('size_limit','Administrative input exceeds the review budget.');
        $requestDigest=hash_hmac('sha256',$action."\0".$json,$this->key);
        return $this->db->transaction(function()use($actor,$operationId,$action,$json,$review,$scopes,$requestDigest,$validateNew):array{
            $prior=$this->db->queryOne('SELECT * FROM agent_admin_plans WHERE actor_key=? AND operation_id=?',[$actor->identity(),$operationId]);
            if($prior) {
                if(!hash_equals($prior['request_digest'],$requestDigest))throw new OperationException('idempotency_conflict','This administrative operation ID belongs to different input.');
                return $this->get($actor,$prior['id']);
            }
            if($validateNew!==null)$validateNew();
            JsonSchema::validate(JsonSchema::output($review),self::reviewSchema());
            if((int)$this->db->scalar("SELECT COUNT(*) FROM agent_admin_plans WHERE status IN ('pending','approved') AND expires_at>?",[time()])>=64)
                throw new OperationException('size_limit','Too many administrative reviews are pending. Finish or cancel an existing review.');
            $row=['id'=>'admin_'.bin2hex(random_bytes(16)),'actor_key'=>$actor->identity(),
                'actor_json'=>CanonicalJson::encode($actor->attribution()),'operation_id'=>$operationId,'action'=>$action,
                'site_key'=>$this->siteKey(),'request_digest'=>$requestDigest,'payload_ciphertext'=>$this->cipher->encrypt($json),
                'review_json'=>CanonicalJson::encode($review),'scopes_json'=>CanonicalJson::encode(array_values($scopes)),
                'status'=>'pending','created_at'=>time(),'expires_at'=>time()+self::TTL];
            $row['digest']=$this->digest($row);$this->db->insert('agent_admin_plans',$row);
            return $this->get($actor,$row['id']);
        });
    }

    public function get(OperationActor $actor,string $id):array
    { return $this->present($this->authorized($actor,$id)); }

    /** Only called inside approved SQL execution; never included in an agent result. */
    public function retainSecret(string $planId,int $credentialId,string $secret):void
    {
        if(!$this->db->getPdo()->inTransaction())throw new \LogicException('Credential issuance and delivery must be atomic.');
        $row=$this->raw($planId);
        if($row['action']!=='credential.create' || $row['status']!=='approved')
            throw new \LogicException('A credential creation approval is required.');
        $hash=$this->db->scalar('SELECT key_hash FROM api_keys WHERE id=?',[$credentialId]);
        if(!is_string($hash) || !hash_equals($hash,hash('sha256',$secret)))throw new \LogicException('Credential delivery does not match the issued key.');
        $this->db->insert('agent_admin_secrets',['plan_id'=>$planId,'credential_id'=>$credentialId,
            'ciphertext'=>$this->cipher->encrypt($secret),'expires_at'=>time()+900]);
    }

    public function pendingSecrets(OperationActor $owner):array
    {
        $this->policy->requireOwnerSession($owner);
        return $this->db->query("SELECT s.plan_id,s.credential_id,s.expires_at,k.label,k.audience
            FROM agent_admin_secrets s JOIN agent_admin_plans p ON p.id=s.plan_id JOIN api_keys k ON k.id=s.credential_id
            LEFT JOIN studio_mcp_credentials c ON c.key_id=k.id
            WHERE p.status='succeeded' AND s.ciphertext IS NOT NULL AND s.claimed_at IS NULL AND s.expires_at>?
              AND (c.key_id IS NULL OR (c.revoked_at IS NULL AND (c.expires_at IS NULL OR c.expires_at>?)))
            ORDER BY s.expires_at LIMIT 64",[time(),time()]);
    }

    /** Claim before returning bytes: a lost response requires revoke/replacement, never a second reveal. */
    public function revealSecret(OperationActor $owner,string $id):array
    {
        $this->policy->requireOwnerSession($owner);
        return $this->db->transaction(function()use($owner,$id):array{
            $this->policy->requireOwnerSession($owner);
            $plan=$this->raw($id);
            $row=$this->db->queryOne("SELECT s.*,k.key_hash,k.label,k.audience,c.revoked_at,c.expires_at AS key_expires
                FROM agent_admin_secrets s JOIN api_keys k ON k.id=s.credential_id
                LEFT JOIN studio_mcp_credentials c ON c.key_id=k.id WHERE s.plan_id=?",[$id]);
            if($plan['status']!=='succeeded' || !$row || $row['ciphertext']===null || $row['claimed_at']!==null
                || (int)$row['expires_at']<=time() || $row['revoked_at']!==null
                || ($row['key_expires']!==null && (int)$row['key_expires']<=time()))
                throw new OperationException('secret_unavailable','This credential can no longer be revealed. Revoke it and create a replacement.');
            $secret=$this->cipher->decrypt($row['ciphertext']);
            if(!hash_equals($row['key_hash'],hash('sha256',$secret)))
                throw new OperationException('secret_unavailable','Credential delivery failed verification. Revoke it and create a replacement.');
            if($this->db->update('agent_admin_secrets',['ciphertext'=>null,'claimed_at'=>time()],
                'plan_id = ? AND claimed_at IS NULL AND ciphertext IS NOT NULL',[$id])!==1)
                throw new OperationException('secret_unavailable','This credential was already claimed.');
            return ['id'=>(int)$row['credential_id'],'key'=>$secret,'label'=>$row['label'],'audience'=>$row['audience']];
        });
    }

    /** Bounded cleanup retains receipt identities while removing expired sensitive material. */
    public function pruneSensitiveInputs(int $limit=20):int
    {
        $limit=max(1,min(100,$limit));
        $rows=$this->db->query('SELECT id FROM agent_admin_plans WHERE payload_ciphertext IS NOT NULL AND expires_at<=? LIMIT '.$limit,[time()]);
        foreach($rows as $row)$this->db->update('agent_admin_plans',['payload_ciphertext'=>null],'id = ?',[$row['id']]);
        $secrets=$this->db->query('SELECT plan_id FROM agent_admin_secrets WHERE ciphertext IS NOT NULL AND expires_at<=? LIMIT '.$limit,[time()]);
        foreach($secrets as $row)$this->db->update('agent_admin_secrets',['ciphertext'=>null],'plan_id = ?',[$row['plan_id']]);
        return count($rows)+count($secrets);
    }

    public function ownerList(OperationActor $owner):array
    {
        $this->policy->requireOwnerSession($owner);
        return array_map(fn($row)=>$this->present($this->verify($row)),
            $this->db->query("SELECT * FROM agent_admin_plans WHERE status IN ('pending','approved') AND expires_at>? ORDER BY created_at DESC LIMIT 64",[time()]));
    }

    public function approve(OperationActor $owner,string $id,string $digest):array
    {
        $this->policy->requireOwnerSession($owner);
        return $this->db->transaction(function()use($owner,$id,$digest):array{
            $row=$this->raw($id);$this->checkDigest($row,$digest);$this->assertFresh($row);
            $this->policy->require($this->actor($row),json_decode($row['scopes_json'],true,32,JSON_THROW_ON_ERROR));
            if(!in_array($row['status'],['pending','approved'],true))throw new OperationException('content_conflict','This review can no longer receive approval.');
            $this->db->update('agent_admin_plans',['status'=>'approved','approved_by'=>$owner->userId,
                'approval_expires_at'=>min((int)$row['expires_at'],time()+self::APPROVAL_TTL)],'id = ?',[$id]);
            return $this->present($this->raw($id));
        });
    }

    public function cancel(OperationActor $owner,string $id,string $digest):array
    {
        $this->policy->requireOwnerSession($owner);
        return $this->db->transaction(function()use($id,$digest):array{
            $row=$this->raw($id);$this->checkDigest($row,$digest);
            if(in_array($row['status'],['authorized','succeeded'],true))throw new OperationException('content_conflict','An authorized or completed action cannot be cancelled here. Inspect its operation.');
            $this->db->update('agent_admin_plans',['status'=>'cancelled','payload_ciphertext'=>null,'approval_expires_at'=>null],'id = ?',[$id]);
            return $this->present($this->raw($id));
        });
    }

    /** Bind an owner receipt to one durable job before that job may change files. */
    public function authorizeExecution(OperationActor $actor,string $id,string $digest,callable $allocate):array
    {
        return $this->db->transaction(function()use($actor,$id,$digest,$allocate):array{
            $row=$this->authorized($actor,$id);$this->checkDigest($row,$digest);
            if($row['status']==='authorized')return $this->present($row);
            $this->assertFresh($row);
            if($row['status']!=='approved' || $row['consumed_at']!==null)
                throw new OperationException('approval_required','Approve this exact action from the owner account in Studio.');
            if((int)$row['approval_expires_at']<=time())throw new OperationException('approval_expired','The owner approval expired. Review it again in Studio.');
            $this->policy->requireOwnerSession(new OperationActor('user',(int)$row['approved_by'],null,[],'studio_configured',null));
            $payload=$this->cipher->decrypt($row['payload_ciphertext']);
            if(!hash_equals($row['request_digest'],hash_hmac('sha256',$row['action']."\0".$payload,$this->key)))
                throw new OperationException('content_conflict','The retained administrative input failed verification.');
            $operationId=$allocate(json_decode($payload,true,64,JSON_THROW_ON_ERROR),$row);
            JsonSchema::validate($operationId,ToolContracts::requestId());
            $operation=$this->db->queryOne('SELECT id FROM agent_operations WHERE actor_key=? AND operation_id=?',
                [$actor->identity(),$operationId]);
            if(!$operation)throw new \LogicException('The authorized operation must be allocated in this transaction.');
            $this->db->update('agent_admin_plans',['status'=>'authorized','consumed_at'=>time(),'payload_ciphertext'=>null,
                'result_json'=>CanonicalJson::encode(['changed'=>false,'operation_id'=>$operationId,'secret_delivery'=>'none','provider_calls'=>0])],
                'id = ? AND consumed_at IS NULL',[$id]);
            return $this->present($this->raw($id));
        });
    }

    /** SQL-only callback: domain writes and receipt consumption commit together. No mail/files/network. */
    public function executeDatabase(OperationActor $actor,string $id,string $digest,callable $execute):array
    {
        return ProviderCallPolicy::runExternal(fn()=>$this->db->transaction(function()use($actor,$id,$digest,$execute):array{
            $row=$this->authorized($actor,$id);$this->checkDigest($row,$digest);
            if($row['status']==='succeeded')return $this->present($row);
            $this->assertFresh($row);
            if($row['status']!=='approved')throw new OperationException('approval_required','Review and approve this exact action from the owner account in Studio.');
            if((int)$row['approval_expires_at']<=time())throw new OperationException('approval_expired','The owner approval expired. Review it again in Studio.');
            $approver=new OperationActor('user',(int)$row['approved_by'],null,[],'studio_configured',null);
            $this->policy->requireOwnerSession($approver);
            if($row['consumed_at']!==null)throw new OperationException('approval_used','This owner receipt has already been consumed.');
            $payload=$this->cipher->decrypt($row['payload_ciphertext']);
            if(!hash_equals($row['request_digest'],hash_hmac('sha256',$row['action']."\0".$payload,$this->key)))
                throw new OperationException('content_conflict','The retained administrative input failed verification.');
            $result=$execute(json_decode($payload,true,64,JSON_THROW_ON_ERROR),$row);
            if(!is_array($result) || strlen(CanonicalJson::encode($result))>131072)throw new \LogicException('Administrative result must be bounded and redacted.');
            $this->db->update('agent_admin_plans',['status'=>'succeeded','consumed_at'=>time(),
                'result_json'=>CanonicalJson::encode($result),'payload_ciphertext'=>null],'id = ? AND consumed_at IS NULL',[$id]);
            return $this->present($this->raw($id));
        }));
    }

    private function authorized(OperationActor $actor,string $id):array
    {
        $this->policy->require($actor,[]);
        $row=$this->raw($id);
        if($row['actor_key']!==$actor->identity() || $this->actor($row)->userId!==$actor->userId)
            throw new OperationException('permission_denied','This review belongs to another connection.');
        $this->policy->require($actor,json_decode($row['scopes_json'],true,32,JSON_THROW_ON_ERROR));
        return $row;
    }
    private function raw(string $id):array
    {
        if(!preg_match('/^admin_[a-f0-9]{32}$/D',$id))throw new OperationException('permission_denied','This administrative review is unavailable.');
        $row=$this->db->queryOne('SELECT * FROM agent_admin_plans WHERE id=?',[$id]);
        if(!$row)throw new OperationException('permission_denied','This administrative review is unavailable.');
        return $this->verify($row);
    }
    private function verify(array $row):array
    {
        if(!hash_equals($row['site_key'],$this->siteKey()) || !hash_equals($row['digest'],$this->digest($row)))
            throw new OperationException('content_conflict','This administrative review no longer matches the installation.');
        return $row;
    }
    private function actor(array $row):OperationActor
    {
        $value=json_decode($row['actor_json'],true,16,JSON_THROW_ON_ERROR);
        if($value['type']==='api_key') {
            $actor=$this->policy->fromCredential((int)$value['credential_id']);
            if($actor->userId!==(int)$value['user_id'])throw new OperationException('permission_denied','The requesting account changed.');
            return $actor;
        }
        if($value['type']!=='user')throw new OperationException('permission_denied','REST credentials cannot request administrative approvals.');
        return new OperationActor('user',(int)$value['user_id'],null,[],'studio_configured',null);
    }
    private function assertFresh(array $row):void
    { if((int)$row['expires_at']<=time())throw new OperationException('review_expired','This administrative review expired. Prepare a new operation.'); }
    private function checkDigest(array $row,string $digest):void
    { if(!hash_equals($row['digest'],$digest))throw new OperationException('content_conflict','Approve or apply the exact reviewed action digest.'); }
    private function siteKey():string
    {
        $settings=new Settings($this->db);
        return CanonicalJson::digest([$this->workspace->publishedRoot(),$settings->get('workspace_base_url',$settings->get('site_url',''))]);
    }
    private function digest(array $row):string
    {
        return CanonicalJson::digest(array_intersect_key($row,array_flip(['actor_key','actor_json','operation_id','action','site_key',
            'request_digest','review_json','scopes_json','expires_at'])));
    }
    private function present(array $row):array
    {
        $actor=json_decode($row['actor_json'],true,16,JSON_THROW_ON_ERROR);
        $label=$actor['credential_id']===null?'Studio owner':
            ($this->db->scalar('SELECT label FROM api_keys WHERE id=?',[$actor['credential_id']])?:'Removed connection');
        return ['plan_id'=>$row['id'],'operation_id'=>$row['operation_id'],'action'=>$row['action'],'digest'=>$row['digest'],
            'status'=>$row['status'],'review'=>json_decode($row['review_json'],true,64,JSON_THROW_ON_ERROR),'approval_required'=>true,
            'requested_by'=>['user_id'=>(int)$actor['user_id'],'credential_id'=>$actor['credential_id'],'connection_name'=>$label],
            'approved_by'=>$row['approved_by']===null?null:(int)$row['approved_by'],'expires_at'=>(int)$row['expires_at'],
            'approval_expires_at'=>$row['approval_expires_at']===null?null:(int)$row['approval_expires_at'],'provider_calls'=>0,
            'result'=>$row['result_json']===null?null:json_decode($row['result_json'],true,64,JSON_THROW_ON_ERROR)];
    }
}
