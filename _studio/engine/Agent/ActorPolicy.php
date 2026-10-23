<?php
declare(strict_types=1);

namespace VoxelSite\Agent;

use VoxelSite\Database;

/** Current database authority always narrows the authenticated actor snapshot. */
final class ActorPolicy
{
    public const READ = ['site:read', 'files:read', 'assets:read', 'context:read',
        'preview:read', 'snapshots:read', 'operations:read', 'forms:read'];
    public const EDIT = ['files:write', 'assets:write', 'changes:apply', 'snapshots:write',
        'restore:draft', 'structure:write', 'designs:read', 'designs:write',
        'revisions:write', 'export:read', 'references:read', 'forms:write'];
    public const OWNER = ['restore:live', 'settings:write', 'settings:secrets', 'mail:send',
        'team:write', 'credentials:write', 'updates:write', 'reset:site', 'reset:installation',
        'prompts:read', 'prompts:write', 'diagnostics:read', 'history:write'];
    public const BUSINESS_READ = ['forms:read', 'actions:read', 'submissions:read',
        'submissions:export', 'notes:read', 'board:read', 'history:read', 'settings:read'];
    public const BUSINESS_WRITE = ['forms:write', 'forms:submit', 'actions:write', 'actions:invoke',
        'submissions:write', 'notes:write', 'board:write'];

    public function __construct(private Database $db) {}

    public static function ceiling(string $role): array
    {
        if ($role === 'viewer') return array_merge(self::READ, ['board:read']);
        if (!in_array($role, ['owner', 'editor'], true)) return [];
        $scopes = array_merge(self::READ, self::EDIT, self::BUSINESS_READ, self::BUSINESS_WRITE, ['publish:write', 'unpublish:write']);
        return $role === 'owner' ? array_merge($scopes, self::OWNER) : $scopes;
    }

    public static function presets(): array
    {
        return [
            'read' => ['label' => 'Read the site', 'scopes' => self::READ],
            'edit' => ['label' => 'Edit drafts', 'scopes' => array_merge(self::READ, self::EDIT)],
            'publish' => ['label' => 'Edit and publish', 'scopes' => array_merge(self::READ, self::EDIT, ['publish:write'])],
        ];
    }

    /** Explicit additions never enter the default site-authoring preset. */
    public static function accessGroups(): array
    {
        $groups = [
            'unpublish'=>['label'=>'Take the live site offline','description'=>'Review and replace the managed live release with an offline page.','scopes'=>['unpublish:write']],
            'business_read'=>['label'=>'Read business workspace','description'=>'Read Actions, submissions, notes, board and conversation history; export submissions.','scopes'=>['actions:read','submissions:read','submissions:export','notes:read','board:read','history:read']],
            'business_write'=>['label'=>'Edit business workspace','description'=>'Edit Action definitions, submissions, notes and board records. Action configuration has immediate public effects.','scopes'=>['actions:read','actions:write','submissions:read','submissions:write','notes:read','notes:write','board:read','board:write']],
            'invoke'=>['label'=>'Submit real form and Action records','description'=>'Run explicit real submission tests. Email needs separate mail access.','scopes'=>['forms:read','forms:submit','actions:read','actions:invoke']],
            'configuration'=>['label'=>'Manage configuration','description'=>'Owner only. Read and update site settings and write-only provider or mail credentials.','scopes'=>['settings:read','settings:write','settings:secrets']],
            'mail'=>['label'=>'Send email','description'=>'Owner only. Permit explicit mail tests and notification sends.','scopes'=>['mail:send']],
            'prompts'=>['label'=>'Manage prompt overrides','description'=>'Owner only. Read, version and reset custom instructions.','scopes'=>['prompts:read','prompts:write']],
            'diagnostics'=>['label'=>'Manage diagnostic history','description'=>'Owner only. Read redacted diagnostics and delete selected history records.','scopes'=>['diagnostics:read','history:read','history:write']],
            'team'=>['label'=>'Manage team','description'=>'Owner only. Prepare team changes for a separate owner approval in Studio.','scopes'=>['team:write']],
            'credentials'=>['label'=>'Manage connections','description'=>'Owner only. Prepare credential changes for a separate owner approval in Studio.','scopes'=>['credentials:write']],
            'updates'=>['label'=>'Manage updates','description'=>'Owner only. Inspect and prepare supported updates for owner approval.','scopes'=>['updates:write']],
            'reset'=>['label'=>'Prepare resets','description'=>'Owner only. Review site or installation reset effects for explicit owner approval.','scopes'=>['reset:site','reset:installation']],
        ];
        foreach ($groups as &$group) $group['roles']=array_values(array_filter(['owner','editor','viewer'],
            static fn($role)=>array_diff($group['scopes'],self::ceiling($role))===[]));
        unset($group);
        return $groups;
    }

    public function user(int $id): array
    {
        $user = $this->db->queryOne('SELECT * FROM users WHERE id = ?', [$id]);
        if (!$user || !empty($user['disabled_at']) || (array_key_exists('is_active', $user) && !$user['is_active'])
            || !in_array($user['role'], ['owner', 'editor', 'viewer'], true)) {
            throw new OperationException('permission_denied', 'This account is inactive. Ask the owner to create a new connection.');
        }
        return $user;
    }

    public function credential(int $keyId): array
    {
        $row = $this->db->queryOne(
            'SELECT c.*, k.scopes, k.label FROM studio_mcp_credentials c
             JOIN api_keys k ON k.id = c.key_id WHERE c.key_id = ? AND k.audience = ?', [$keyId, 'studio_mcp']
        );
        if (!$row || $row['revoked_at'] !== null || ($row['expires_at'] !== null && (int) $row['expires_at'] <= time())) {
            throw new OperationException('permission_denied', 'This connection is inactive or expired. Create a replacement in Studio.');
        }
        $user = $this->user((int) $row['user_id']);
        $granted = json_decode($row['scopes'], true, 32, JSON_THROW_ON_ERROR);
        $row['effective_scopes'] = array_values(array_intersect($granted, self::ceiling($user['role'])));
        return $row;
    }

    public function fromCredential(int $keyId, ?string $clientName = null): OperationActor
    {
        $row = $this->credential($keyId);
        return new OperationActor('api_key', (int) $row['user_id'], $keyId, $row['effective_scopes'],
            'forbidden', $clientName === null ? $row['client_name'] : mb_substr(preg_replace('/[\x00-\x1f\x7f]/u', '', $clientName), 0, 100));
    }

    /** Legacy REST is a separate audience; only an owner may establish its account binding. */
    public function fromRestCredential(int $keyId, string $purpose = 'publish'): OperationActor
    {
        $row=$this->restCredential($keyId);
        $allowed=match($purpose) {
            'publish'=>['operations:read','publish:write','site:read','files:read','assets:read','forms:read'],
            'assets'=>['operations:read','site:read','files:read','files:write','assets:read','assets:write','changes:apply'],
            'settings'=>['operations:read','settings:read','settings:write'],
            'authoring'=>['operations:read','site:read','files:read','files:write','structure:write','changes:apply'],
            'compile'=>['operations:read','files:read','files:write','changes:apply'],
            'business'=>['site:read','forms:read','forms:submit','actions:read','actions:invoke','submissions:read','mail:send'],
            default=>throw new \LogicException('Unknown REST application adapter purpose.'),
        };
        if(in_array($purpose,['authoring','compile'],true)) {
            $legacy=json_decode($row['scopes'],true,32,JSON_THROW_ON_ERROR);
            $grant=$purpose==='compile'?'compile:trigger':'pages:write';
            if(!in_array($grant,$legacy,true)) $allowed=array_values(array_diff($allowed,['files:write','structure:write','changes:apply']));
            if($purpose==='authoring'&&!in_array('pages:read',$legacy,true)&&!in_array('pages:write',$legacy,true))
                $allowed=array_values(array_diff($allowed,['site:read','files:read']));
            if($purpose==='compile'&&!in_array('compile:trigger',$legacy,true)) $allowed=['operations:read'];
        }
        return new OperationActor('rest_key',(int)$row['user_id'],$keyId,
            array_values(array_intersect($row['effective_scopes'],$allowed)),'forbidden',$row['label']);
    }

    public function bindRestCredential(OperationActor $owner,int $keyId,int $userId): void
    {
        $this->requireOwnerSession($owner);
        $this->user($userId);
        $key=$this->db->queryOne("SELECT id FROM api_keys WHERE id = ? AND audience = 'rest'",[$keyId]);
        if (!$key) throw new OperationException('invalid_schema','Choose an existing REST API credential.');
        $bind=function() use($owner,$keyId,$userId):void {
            $existing=$this->db->queryOne('SELECT user_id FROM agent_rest_owners WHERE key_id = ?',[$keyId]);
            if ($existing) {
                if ((int)$existing['user_id']!==$userId) {
                    throw new OperationException('content_conflict','An existing connection cannot change identity. Revoke it and create a new credential.');
                }
                return;
            }
            $this->db->insert('agent_rest_owners',['key_id'=>$keyId,'user_id'=>$userId,'bound_by'=>$owner->userId,'bound_at'=>time()]);
        };
        if ($this->db->getPdo()->inTransaction()) $bind();
        else $this->db->transaction($bind);
    }

    private function restCredential(int $keyId): array
    {
        $row=$this->db->queryOne("SELECT o.user_id,k.label,k.scopes,k.role FROM agent_rest_owners o
            JOIN api_keys k ON k.id = o.key_id WHERE k.id = ? AND k.audience = 'rest'",[$keyId]);
        if (!$row) throw new OperationException('credential_migration_required',
            'An owner must bind this REST credential to an account in Studio Connections before it can use managed website operations.');
        $user=$this->user((int)$row['user_id']);
        $legacy=json_decode($row['scopes'],true,32,JSON_THROW_ON_ERROR);
        $scopes=['operations:read'];
        // Publishing already reads the complete website internally. This mapping
        // grants only the reads needed for its retained review, never draft edits,
        // business records, secret access, or management MCP authentication.
        if (in_array('publish:trigger',$legacy,true) && in_array($row['role'],['owner','agent'],true)) {
            $scopes=array_merge($scopes,['publish:write','files:read','assets:read','forms:read','site:read']);
        }
        // This grant is used only by the fixed asset service adapter. Its
        // trusted planner may rewrite exact references, never arbitrary files.
        // The actor purpose above prevents publishing from inheriting it.
        if (in_array('assets:read',$legacy,true)) $scopes=array_merge($scopes,['assets:read','files:read','site:read']);
        if (in_array('assets:write',$legacy,true) && in_array($row['role'],['owner','editor','agent'],true)) {
            $scopes=array_merge($scopes,['assets:write','files:write','changes:apply']);
        }
        if (in_array('settings:read',$legacy,true)) $scopes[]='settings:read';
        if (in_array('settings:write',$legacy,true) && $row['role']==='owner' && $user['role']==='owner')
            $scopes[]='settings:write';
        if(in_array('pages:read',$legacy,true)||in_array('pages:write',$legacy,true))
            $scopes=array_merge($scopes,['site:read','files:read']);
        if(in_array('pages:write',$legacy,true)&&in_array($row['role'],['owner','editor','agent'],true))
            $scopes=array_merge($scopes,['files:write','structure:write','changes:apply']);
        if(in_array('compile:trigger',$legacy,true)&&in_array($row['role'],['owner','editor','agent'],true))
            $scopes=array_merge($scopes,['files:read','files:write','changes:apply']);
        if (in_array('tools:invoke',$legacy,true) && in_array($row['role'],['owner','editor','agent'],true))
            $scopes=array_merge($scopes,['site:read','forms:read','forms:submit','actions:read','actions:invoke']);
        if (in_array('submissions:read',$legacy,true))$scopes[]='submissions:read';
        if (in_array('mail:send',$legacy,true) && $row['role']==='owner' && $user['role']==='owner')$scopes[]='mail:send';
        $row['effective_scopes']=array_values(array_intersect($scopes,self::ceiling($user['role'])));
        return $row;
    }

    public function require(OperationActor $actor, array $required): void
    {
        $user = $this->user($actor->userId);
        $current = self::ceiling($user['role']);
        if ($actor->type !== 'user') {
            $key = $actor->type==='rest_key' ? $this->restCredential($actor->credentialId) : $this->credential($actor->credentialId);
            if ((int) $key['user_id'] !== $actor->userId) {
                throw new OperationException('permission_denied', 'The connection identity changed. Reconnect before continuing.');
            }
            $current = array_intersect($current, $key['effective_scopes'], $actor->scopes);
        }
        if ($missing = array_values(array_diff($required, $current))) {
            throw new OperationException('permission_denied', 'This connection cannot perform this action. Ask the owner for access.',
                ['required_scopes' => $missing]);
        }
    }

    public function requireOwnerSession(OperationActor $actor): void
    {
        if ($actor->type !== 'user' || $this->user($actor->userId)['role'] !== 'owner') {
            throw new OperationException('permission_denied', 'Complete this action from the owner account in Studio.');
        }
    }
}
