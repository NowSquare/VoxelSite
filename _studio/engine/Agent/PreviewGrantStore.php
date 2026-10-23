<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Database, SiteWorkspace};

/** Browser authority is limited to this installation, draft and saved credential. */
final class PreviewGrantStore
{
    public const TTL_SECONDS=900;
    public const TICKET_TTL_SECONDS=120;

    public function __construct(private Database $db,private ActorPolicy $policy,private SiteWorkspace $workspace) {}

    public function create(OperationActor $actor,string $entry,array $paths): array
    {
        $this->policy->require($actor,['preview:read']);
        if ($actor->type !== 'api_key' || $actor->credentialId === null) {
            throw new OperationException('permission_denied','A browser handoff requires an active Studio MCP credential.');
        }
        SitePathPolicy::canonical($entry);
        if (SitePathPolicy::type($entry) !== 'page' || !in_array($entry,$paths,true)) {
            throw new OperationException('invalid_path','Choose an existing page from this draft.');
        }
        if (count($paths)>WorkspaceFiles::MAX_FILES || !array_is_list($paths)) throw new OperationException('size_limit','The preview path inventory exceeds its limit.');
        foreach ($paths as $path) SitePathPolicy::canonical($path);
        sort($paths,SORT_STRING);
        $state=$this->state();
        return $this->db->transaction(function () use ($actor,$entry,$paths,$state): array {
            // Creating a new handoff may prune expired ephemeral authority. Reads never do.
            $this->db->delete('agent_preview_grants','expires_at <= ?',[time()]);
            if ((int)$this->db->scalar('SELECT COUNT(*) FROM agent_preview_grants WHERE credential_id = ? AND expires_at > ?',[$actor->credentialId,time()]) >= 32
                || (int)$this->db->scalar('SELECT COUNT(*) FROM agent_preview_grants') >= 512) {
                throw new OperationException('size_limit','The retained preview limit was reached. Clean expired previews before requesting another handoff.');
            }
            $id='preview_'.bin2hex(random_bytes(16));
            $ticket=bin2hex(random_bytes(32));
            $created=time();
            $this->db->insert('agent_preview_grants',[
                'id'=>$id,'credential_id'=>$actor->credentialId,'user_id'=>$actor->userId,
                'site_key'=>$this->siteKey(),'draft_version'=>'draft:'.$state['draft_version'],'entry_path'=>$entry,
                'paths_json'=>CanonicalJson::encode($paths),'ticket_hash'=>hash('sha256',$ticket),
                'ticket_expires_at'=>$created+self::TICKET_TTL_SECONDS,'created_at'=>$created,'expires_at'=>$created+self::TTL_SECONDS,
            ]);
            return ['preview_id'=>$id,'ticket'=>$ticket,'draft_version'=>'draft:'.$state['draft_version'],
                'entry_path'=>$entry,'ticket_expires_at'=>$created+self::TICKET_TTL_SECONDS,'expires_at'=>$created+self::TTL_SECONDS];
        });
    }

    /** The exchange caller validates request Origin before invoking this write. */
    public function exchange(string $ticket): array
    {
        self::token($ticket);
        return $this->db->transaction(function () use ($ticket): array {
            $row=$this->db->queryOne('SELECT * FROM agent_preview_grants WHERE ticket_hash = ?',[hash('sha256',$ticket)]);
            if (!$row || $row['consumed_at'] !== null || (int)$row['ticket_expires_at']<=time()) {
                throw new OperationException('preview_expired','This preview ticket was used or expired. Request a new browser handoff.');
            }
            $this->validate($row);
            $cookie=bin2hex(random_bytes(32));
            if ($this->db->update('agent_preview_grants',['consumed_at'=>time(),'cookie_hash'=>hash('sha256',$cookie)],
                'id = ? AND consumed_at IS NULL',[$row['id']]) !== 1) {
                throw new OperationException('preview_expired','This preview ticket has already been used.');
            }
            return ['cookie'=>$cookie,'entry_path'=>$row['entry_path'],'expires_at'=>(int)$row['expires_at']];
        });
    }

    /** A normal preview read never creates, renews or consumes authority. */
    public function authenticate(string $cookie,?string $path=null): array
    {
        self::token($cookie);
        $row=$this->db->queryOne('SELECT * FROM agent_preview_grants WHERE cookie_hash = ?',[hash('sha256',$cookie)]);
        if (!$row || $row['consumed_at'] === null) throw new OperationException('preview_expired','This browser preview is unavailable. Request a fresh handoff.');
        $actor=$this->validate($row);
        $paths=json_decode($row['paths_json'],true,32,JSON_THROW_ON_ERROR);
        if ($path !== null) {
            SitePathPolicy::canonical($path);
            $type=SitePathPolicy::type($path);
            if ($type !== 'immutable' && !in_array($path,$paths,true)) throw new OperationException('permission_denied','This path is outside the retained preview.');
            if ($type === 'partial') throw new OperationException('permission_denied','Shared partials are rendered through their page.');
            if ($type === 'forms') $this->policy->require($actor,['forms:read']);
            if ($type !== 'page') $this->policy->require($actor,['assets:read']);
        }
        return ['preview_id'=>$row['id'],'actor'=>$actor,'draft_version'=>$row['draft_version'],'entry_path'=>$row['entry_path'],
            'paths'=>$paths,'expires_at'=>(int)$row['expires_at']];
    }

    private function validate(array $row): OperationActor
    {
        if ((int)$row['expires_at']<=time() || !hash_equals($row['site_key'],$this->siteKey())) {
            throw new OperationException('preview_expired','This browser preview expired. Request a fresh handoff.');
        }
        $actor=$this->policy->fromCredential((int)$row['credential_id']);
        if ($actor->userId !== (int)$row['user_id']) throw new OperationException('permission_denied','The authorizing connection changed.');
        $this->policy->require($actor,['preview:read','files:read','assets:read']);
        if ('draft:'.$this->state()['draft_version'] !== $row['draft_version']) {
            throw new OperationException('preview_expired','The draft changed. Request a fresh preview for its current version.');
        }
        return $actor;
    }

    private function state(): array
    {
        $this->workspace->assertReady();
        $state=$this->workspace->status();
        if ($state['reservation_operation_id'] !== null) throw new OperationException('site_busy','The draft is changing. Wait for its retained operation before previewing.');
        return $state;
    }

    private function siteKey(): string { return hash('sha256',$this->workspace->publishedRoot()."\n".$this->workspace->draftRoot()); }
    private static function token(string $token): void {
        if (!preg_match('/^[a-f0-9]{64}$/D',$token)) throw new OperationException('preview_expired','This preview credential is unavailable. Request a fresh handoff.');
    }
}
