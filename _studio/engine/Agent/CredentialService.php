<?php
declare(strict_types=1);

namespace VoxelSite\Agent;

use VoxelSite\AgentAuth;
use VoxelSite\Database;
use VoxelSite\Logger;

/** Studio-managed MCP credentials use the shared hashed-key store with a separate audience. */
final class CredentialService
{
    private ActorPolicy $policy;
    private AgentAuth $auth;

    public function __construct(private Database $db)
    {
        $this->policy = new ActorPolicy($db);
        $this->auth = new AgentAuth($db);
    }

    public function create(OperationActor $issuer, int $userId, string $preset, string $label,
        ?string $clientName, ?int $expiresAt = null, array $extraScopes = []): array
    {
        $this->policy->requireOwnerSession($issuer);
        $user = $this->policy->user($userId);
        $presets = ActorPolicy::presets();
        if (!isset($presets[$preset]) || trim($label) === '' || mb_strlen($label) > 100
            || preg_match('/[\x00-\x1f\x7f]/', $label)
            || ($clientName !== null && (mb_strlen($clientName) > 100 || preg_match('/[\x00-\x1f\x7f]/', $clientName)))
            || ($expiresAt !== null && ($expiresAt < time() + 60 || $expiresAt > time() + 366 * 86400))) {
            throw new OperationException('invalid_schema', 'Check the connection name, access preset and expiry.');
        }
        $scopes = array_values(array_unique(array_merge($presets[$preset]['scopes'], $extraScopes)));
        if (array_diff($scopes, ActorPolicy::ceiling($user['role']))) {
            throw new OperationException('permission_denied', 'The selected access exceeds this account’s role.');
        }
        $secret = 'vxs_' . bin2hex(random_bytes(32));
        $create = function () use ($secret, $label, $scopes, $user, $clientName, $expiresAt): int {
            $id = $this->db->insert('api_keys', ['key_hash' => hash('sha256', $secret),
                'key_prefix' => substr($secret, 0, 12), 'label' => trim($label), 'role' => $user['role'],
                'scopes' => json_encode($scopes, JSON_THROW_ON_ERROR), 'rate_limit' => 1000,
                'audience' => 'studio_mcp', 'created_at' => now()]);
            $this->db->insert('studio_mcp_credentials', ['key_id' => $id, 'user_id' => $user['id'],
                'client_name' => $clientName, 'expires_at' => $expiresAt, 'created_at' => time()]);
            return $id;
        };
        $id = $this->db->getPdo()->inTransaction() ? $create() : $this->db->transaction($create);
        Logger::info('studio-mcp', 'Connection created', ['credential_id' => $id, 'user_id' => $userId, 'scopes' => $scopes]);
        return ['id' => $id, 'key' => $secret, 'label' => trim($label), 'scopes' => $scopes, 'expires_at' => $expiresAt];
    }

    public function authenticate(?string $clientName = null,bool $deferRequestBudget=false): OperationActor
    {
        $result = $this->auth->authenticate('studio_mcp',!$deferRequestBudget);
        if ($result['status'] === AgentAuth::AUTH_RATE_LIMITED) {
            throw new OperationException('rate_limited', 'Too many requests. Wait before retrying.',
                ['retry_after' => $result['retry_after']]);
        }
        if ($result['status'] !== AgentAuth::AUTH_OK) {
            throw new OperationException('permission_denied', 'The connection credential was not accepted. Check the credential and Authorization header.');
        }
        try { $actor = $this->policy->fromCredential((int) $result['key']['id'], $clientName); }
        catch (OperationException $error) {
            if ($error->errorCode === 'permission_denied') (new ConnectionTelemetry($this->db))->rejectedCredential((int) $result['key']['id']);
            throw $error;
        }
        $this->db->update('studio_mcp_credentials', ['last_authenticated_at' => time()], 'key_id = ?', [$actor->credentialId]);
        (new ConnectionTelemetry($this->db))->authenticated($actor->credentialId);
        return $actor;
    }

    public function list(OperationActor $issuer): array
    {
        $this->policy->requireOwnerSession($issuer);
        return $this->db->query('SELECT k.id, k.label, k.key_prefix, k.scopes, c.user_id, c.client_name,
            c.created_at, c.expires_at, c.revoked_at, c.last_authenticated_at
            FROM studio_mcp_credentials c JOIN api_keys k ON k.id = c.key_id WHERE k.audience = \'studio_mcp\'
            ORDER BY c.created_at DESC, k.id DESC');
    }

    public function revoke(OperationActor $issuer, int $keyId): void
    {
        $this->policy->requireOwnerSession($issuer);
        $this->db->update('studio_mcp_credentials', ['revoked_at' => time()], 'key_id = ? AND revoked_at IS NULL', [$keyId]);
        Logger::info('studio-mcp', 'Connection revoked', ['credential_id' => $keyId, 'user_id' => $issuer->userId]);
    }
}
