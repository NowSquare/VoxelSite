<?php
declare(strict_types=1);

namespace VoxelSite;

use RuntimeException;
use Throwable;

/**
 * Consent service, not an HTTP authorization boundary. The application supplies
 * the authenticated user ID and code-resolved path allowlist, never model fields.
 * RouterPendingHeading supplies server-held bindings; HTTP never accepts an approval ID.
 */
final class RouterClaimOverride
{
    public function __construct(private Database $db, private RouterSettings $config,
        private int $authenticatedOwnerId, private string $previewRoot, private array $allowedPaths) {}

    /** Fresh owner/config checks also run after the override decision, before apply. */
    public function assertAvailable(?string $previewRoot = null): void
    {
        if ($previewRoot !== null && (realpath($previewRoot) === false
            || realpath($previewRoot) !== realpath($this->previewRoot))) {
            throw new RuntimeException('override_invalid');
        }
        try {
            $status = $this->config->publicStatus();
            if ($status['governor.mode'] !== 'enforce' || $status['governor.configuration_error'] !== null) {
                throw new RuntimeException();
            }
            // Registers both ciphertext and plaintext with the redaction boundary.
            $this->config->typeSafeKey();
        } catch (Throwable) { throw new RuntimeException('governor_configuration'); }
        try {
            $user = $this->db->queryOne('SELECT role FROM users WHERE id = ?', [$this->authenticatedOwnerId]);
        } catch (Throwable) { throw new RuntimeException('override_unavailable'); }
        if (($user['role'] ?? null) !== 'owner') { throw new RuntimeException('override_forbidden'); }
    }

    /** Persist explicit owner consent to these exact candidate and source bytes. */
    public function approve(array $target, string $candidateHash, #[\SensitiveParameter] string $reason): int
    {
        $this->assertAvailable();
        if ($this->db->getPdo()->inTransaction()) { throw new RuntimeException('override_unavailable'); }
        $reason = trim($reason);
        if (!mb_check_encoding($reason, 'UTF-8') || preg_match('/\A\s*\z/uD', $reason)
            || mb_strlen($reason, 'UTF-8') > 1000 || preg_match('/[\x00-\x1f\x7f]/', $reason)
            || RouterSecrets::redact($reason) !== $reason) { throw new RuntimeException('override_invalid'); }
        $binding = $this->binding($target, $candidateHash);
        try {
            // Recheck role inside the atomic insertion, not a caller-supplied label.
            $statement = $this->db->getPdo()->prepare('INSERT INTO governor_claim_overrides
                (user_id, created_at, reason, candidate_hash, preview_root_hash, file_path, source_address, content_hash, expected_file_hash)
                SELECT ?, ?, ?, ?, ?, ?, ?, ?, ? WHERE EXISTS (SELECT 1 FROM users WHERE id = ? AND role = \'owner\')');
            $statement->execute([$this->authenticatedOwnerId, gmdate('Y-m-d\TH:i:s\Z'), $reason,
                ...array_values($binding), $this->authenticatedOwnerId]);
            if ($statement->rowCount() !== 1) { throw new RuntimeException(); }
            return (int) $this->db->getPdo()->lastInsertId();
        } catch (Throwable) { throw new RuntimeException('override_unavailable'); }
    }

    /**
     * Called only after a valid completed gate blocks this exact candidate.
     * Consumed means permission spent, NOT evidence that the file was applied.
     */
    public function consume(int $id, array $target, string $candidateHash): bool
    {
        $this->assertAvailable();
        $binding = $this->binding($target, $candidateHash);
        $pdo = $this->db->getPdo();
        if ($pdo->inTransaction()) { throw new RuntimeException('override_unavailable'); }
        $began = false;
        try {
            $pdo->exec('BEGIN IMMEDIATE');
            $began = true;
            $row = $this->db->queryOne('SELECT * FROM governor_claim_overrides WHERE id = ?', [$id]);
            $matches = $row !== null && $row['user_id'] === $this->authenticatedOwnerId && $row['consumed_at'] === null
                && is_string($row['reason']) && trim($row['reason']) !== ''
                && is_string($row['created_at']) && strtotime($row['created_at']) !== false;
            foreach ($binding as $field => $value) {
                $matches = $matches && is_string($row[$field] ?? null) && hash_equals($value, $row[$field]);
            }
            if (!$matches) { $pdo->exec('ROLLBACK'); $began = false; return false; }
            $this->assertAvailable();
            $changed = $this->db->update('governor_claim_overrides', ['consumed_at' => gmdate('Y-m-d\TH:i:s\Z')],
                'id = ? AND consumed_at IS NULL', [$id]);
            if ($changed !== 1) { throw new RuntimeException(); }
            $pdo->exec('COMMIT');
            $began = false;
            return true;
        } catch (Throwable $error) {
            if ($began) { try { $pdo->exec('ROLLBACK'); } catch (Throwable) {} }
            if (in_array($error->getMessage(), ['governor_configuration', 'override_forbidden'], true)) {
                throw new RuntimeException($error->getMessage());
            }
            throw new RuntimeException('override_unavailable');
        }
    }

    private function binding(array $target, string $candidateHash): array
    {
        $path = $target['file_path'] ?? null;
        $address = $target['source_address'] ?? null;
        $spanHash = $target['content_hash'] ?? null;
        $fileHash = $target['expected_file_hash'] ?? null;
        foreach ([$candidateHash, $spanHash, $fileHash] as $hash) {
            if (!is_string($hash) || !preg_match('/\A[a-f0-9]{64}\z/D', $hash)
                || RouterSecrets::redact($hash) !== $hash) { throw new RuntimeException('override_invalid'); }
        }
        if (!is_string($path) || !in_array($path, $this->allowedPaths, true) || !is_string($address)
            || $address === '' || strlen($address) > 8192 || !mb_check_encoding($address, 'UTF-8')
            || RouterSecrets::redact([$path, $address]) !== [$path, $address]) { throw new RuntimeException('override_invalid'); }
        try {
            $absolute = GovernedFilePath::resolve($this->previewRoot, $path);
            $original = file_get_contents($absolute, false, null, 0, 512001);
            if (!is_string($original) || strlen($original) > 512000 || substr_count($original, $address) !== 1
                || !hash_equals($spanHash, hash('sha256', $address)) || !hash_equals($fileHash, hash('sha256', $original))) {
                throw new RuntimeException();
            }
            return ['candidate_hash' => $candidateHash, 'preview_root_hash' => hash('sha256', realpath($this->previewRoot)),
                'file_path' => $path, 'source_address' => $address, 'content_hash' => $spanHash, 'expected_file_hash' => $fileHash];
        } catch (Throwable) { throw new RuntimeException('override_invalid'); }
    }
}
