<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\Database;

/** One bounded observation per credential; never an active-session claim or authority input. */
final class ConnectionTelemetry
{
    private const FAILURES=['audience_mismatch','credential_revoked','credential_expired','account_inactive'];
    public function __construct(private Database $db) {}

    public function authenticated(int $id):void {
        $at=time();
        $this->write($id,['first_authenticated_at'=>$at,'last_authenticated_at'=>$at,'last_outcome'=>'authenticated'],true);
    }
    public function used(OperationActor $actor):void {
        if($actor->type==='api_key')$this->write($actor->credentialId,['last_used_at'=>time(),'last_outcome'=>'used']);
    }
    /** Caller has already matched the full stored credential hash. */
    public function authenticationFailed(int $id,string $code):void {
        if(in_array($code,self::FAILURES,true))$this->write($id,
            ['last_auth_failure_at'=>time(),'last_auth_failure_code'=>$code,'last_outcome'=>'authentication_failed']);
    }
    public function rejectedCredential(int $id):void {
        try {
            $credential=$this->db->queryOne('SELECT * FROM studio_mcp_credentials WHERE key_id = ?',[$id]);
            if(!$credential)return;
            $code=$credential['revoked_at']!==null?'credential_revoked':
                (($credential['expires_at']!==null && (int)$credential['expires_at']<=time())?'credential_expired':'account_inactive');
            $this->authenticationFailed($id,$code);
        }catch(\PDOException){ /* Observation cannot change the authentication decision. */ }
    }
    public function permissionDenied(OperationActor $actor,CapabilityDefinition|string $tool,?array $requiredScopes=null):void {
        if($actor->type!=='api_key')return;
        if(is_string($tool) && !in_array($tool,['initialize','ping','server/discover','tools/list'],true))return;
        $name=is_string($tool)?$tool:$tool->name;
        $requiredScopes??=is_string($tool)?[]:$tool->requiredScopes;
        $scopes=array_values(array_unique(array_intersect(array_filter($requiredScopes,'is_string'),ActorPolicy::ceiling('owner'))));
        $this->write($actor->credentialId,['last_permission_denial_at'=>time(),'last_permission_denial_tool'=>$name,
            'last_permission_denial_scopes'=>json_encode($scopes,JSON_THROW_ON_ERROR),'last_outcome'=>'permission_denied']);
    }
    public function describe(array $credential,bool $enabled):array {
        $id=(int)$credential['id'];
        $metadata=$this->db->queryOne('SELECT * FROM studio_mcp_credentials WHERE key_id = ?',[$id]);
        $user=$metadata?$this->db->queryOne('SELECT * FROM users WHERE id = ?',[$metadata['user_id']]):null;
        $row=$this->available()?$this->db->queryOne('SELECT * FROM studio_mcp_connection_events WHERE key_id = ?',[$id]):null;
        $integer=static fn($value)=>$value===null?null:(int)$value;
        $disabled=!$enabled?'connections_disabled':(!$user || !empty($user['disabled_at'])
            || (array_key_exists('is_active',$user) && !$user['is_active'])
            || !in_array($user['role'],['owner','editor','viewer'],true)?'account_inactive':null);
        $state=$row['last_outcome']??(($metadata['last_authenticated_at']??null)!==null?'authenticated':'waiting');
        if(($credential['revoked_at']??null)!==null)$state='revoked';
        elseif(($credential['expires_at']??null)!==null && (int)$credential['expires_at']<=time())$state='expired';
        elseif($disabled!==null)$state='disabled';
        return $credential+['client_name'=>$metadata['client_name']??null,'connection_state'=>$state,
            'disabled_reason'=>$state==='disabled'?$disabled:null,
            'first_authenticated_at'=>$integer($row['first_authenticated_at']??null),
            'last_authenticated_at'=>$integer($row['last_authenticated_at']??$metadata['last_authenticated_at']??null),
            'last_used_at'=>$integer($row['last_used_at']??null),
            'last_auth_failure'=>($row['last_auth_failure_at']??null)===null?null:
                ['at'=>(int)$row['last_auth_failure_at'],'code'=>$row['last_auth_failure_code']],
            'last_permission_denial'=>($row['last_permission_denial_at']??null)===null?null:
                ['at'=>(int)$row['last_permission_denial_at'],'tool'=>$row['last_permission_denial_tool'],
                    'required_scopes'=>json_decode($row['last_permission_denial_scopes'],true,8,JSON_THROW_ON_ERROR)],
        ];
    }
    private function available():bool {
        return (bool)$this->db->scalar("SELECT name FROM sqlite_master WHERE type='table' AND name='studio_mcp_connection_events'");
    }
    private function write(int $id,array $fields,bool $authentication=false):void {
        try {
            // Partial legacy fixtures are supported; authentication never creates schema.
            if(!$this->available())return;
            $names=array_keys($fields);
            $updates=[];
            foreach($names as $name)$updates[]=$name.' = '.match(true) {
                $name==='first_authenticated_at'=>'CASE WHEN studio_mcp_connection_events.first_authenticated_at IS NULL '
                    .'AND studio_mcp_connection_events.last_authenticated_at IS NOT NULL THEN NULL '
                    .'ELSE COALESCE(studio_mcp_connection_events.first_authenticated_at,excluded.first_authenticated_at) END',
                $authentication && $name==='last_outcome'=>'COALESCE(studio_mcp_connection_events.last_outcome,excluded.last_outcome)',
                default=>'excluded.'.$name,
            };
            $sql='INSERT INTO studio_mcp_connection_events (key_id,'.implode(',',$names).') VALUES ('.implode(',',array_fill(0,count($fields)+1,'?')).') '
                .'ON CONFLICT(key_id) DO UPDATE SET '.implode(',',$updates);
            $this->db->getPdo()->prepare($sql)->execute([$id,...array_values($fields)]);
        }catch(\PDOException){ /* Best-effort telemetry must not alter a durable operation response. */ }
    }
}
