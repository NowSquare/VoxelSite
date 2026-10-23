<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\Database;

/** Receipt and business row commit together; expired identities never recreate data. */
final class NotesBoardRequestStore
{
    public const RETENTION_SECONDS=604800;
    public function __construct(private Database $db,private ActorPolicy $policy) {}
    public function run(OperationActor $actor,string $kind,\stdClass $input,array $scopes,\Closure $mutation):array
    {
        return ProviderCallPolicy::runExternal(function()use($actor,$kind,$input,$scopes,$mutation):array{
            $this->policy->require($actor,$scopes);
            return $this->db->transaction(function()use($actor,$kind,$input,$scopes,$mutation):array{
                // Establish SQLite write ownership before inspecting a version.
                $this->db->exec('UPDATE notes_board_requests SET response_bytes=response_bytes WHERE 0');
                $this->policy->require($actor,$scopes);
                $digest=CanonicalJson::digest(['kind'=>$kind,'input'=>$input]);
                $row=$this->db->queryOne('SELECT * FROM notes_board_requests WHERE actor_key=? AND request_id=?',[$actor->identity(),$input->request_id]);
                if($row) {
                    if((int)$row['user_id']!==$actor->userId)throw new OperationException('permission_denied','This mutation does not belong to this account.');
                    if(!hash_equals($row['request_digest'],$digest))throw new OperationException('idempotency_conflict','This request ID was used for another edit. Read its result or use a new request ID.');
                    if((int)$row['expires_at']<=time() || $row['response_json']===null)throw new OperationException('review_expired','This edit receipt expired. Read current records before making another edit.');
                    return json_decode($row['response_json'],true,32,JSON_THROW_ON_ERROR);
                }
                // Explicit writes reclaim expired payloads in bounded batches.
                // Identity/digest tombstones remain so old requests cannot recreate
                // a note after its trash retention window has ended.
                $this->db->update('notes_board_requests',['response_json'=>null,'response_bytes'=>0],
                    'rowid IN (SELECT rowid FROM notes_board_requests WHERE expires_at<=? AND response_json IS NOT NULL ORDER BY expires_at LIMIT 100)',[time()]);
                if((int)$this->db->scalar('SELECT COUNT(*) FROM notes_board_requests WHERE actor_key=?',[$actor->identity()])>=10000
                    || (int)$this->db->scalar('SELECT COUNT(*) FROM notes_board_requests')>=100000) {
                    throw new OperationException('size_limit','Business edit receipt storage is full. Ask the owner to review retained records.');
                }
                $result=$mutation();
                $json=CanonicalJson::encode($result);$bytes=strlen($json);
                if($bytes>393216
                    || (int)$this->db->scalar('SELECT COALESCE(SUM(response_bytes),0) FROM notes_board_requests WHERE actor_key=?',[$actor->identity()])+$bytes>67108864
                    || (int)$this->db->scalar('SELECT COALESCE(SUM(response_bytes),0) FROM notes_board_requests')+$bytes>536870912) {
                    throw new OperationException('size_limit','Business edit receipts exceed their retained byte budget.');
                }
                $this->db->insert('notes_board_requests',['actor_key'=>$actor->identity(),'request_id'=>$input->request_id,'user_id'=>$actor->userId,
                    'kind'=>$kind,'request_digest'=>$digest,'response_json'=>$json,'response_bytes'=>$bytes,'created_at'=>time(),'expires_at'=>time()+self::RETENTION_SECONDS]);
                return json_decode($json,true,32,JSON_THROW_ON_ERROR);
            });
        });
    }
}
