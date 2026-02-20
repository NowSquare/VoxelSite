<?php

declare(strict_types=1);

namespace VoxelSite;

use RuntimeException;

/**
 * AES-256-CBC encryption for sensitive values.
 *
 * Used primarily for API key storage. The encryption key (APP_KEY)
 * is generated during installation and stored in config.json.
 * Keys are decrypted only in memory for the duration of an API call,
 * never written to disk in plaintext.
 *
 * Why not just store plaintext API keys?
 * - If the SQLite DB is accessed via path traversal or misconfigured
 *   .htaccess, encrypted keys are useless without the APP_KEY.
 * - The APP_KEY lives in config.json which is also .htaccess-blocked,
 *   creating defense in depth (attacker needs both files).
 */
class Encryption
{
    private const CIPHER = 'aes-256-cbc';

    private string $key;

    /**
     * @param string $key The APP_KEY from config.json (base64-encoded, 32 bytes decoded)
     */
    public function __construct(string $key)
    {
        $decoded = base64_decode($key, true);
        if ($decoded === false || strlen($decoded) !== 32) {
            throw new RuntimeException(
                'Invalid APP_KEY: must be a base64-encoded 32-byte string. '
                . 'Regenerate it via the installer or Settings → System.'
            );
        }
        $this->key = $decoded;
    }

    /**
     * Encrypt a plaintext value.
     *
     * Returns a base64-encoded string containing the IV (16 bytes)
     * prepended to the ciphertext. The IV is generated randomly
     * for each encryption — the same plaintext produces different
     * ciphertext each time.
     */
    public function encrypt(string $plaintext): string
    {
        $ivLength = openssl_cipher_iv_length(self::CIPHER);
        $iv = random_bytes($ivLength);

        $ciphertext = openssl_encrypt(
            $plaintext,
            self::CIPHER,
            $this->key,
            OPENSSL_RAW_DATA,
            $iv
        );

        if ($ciphertext === false) {
            throw new RuntimeException('Encryption failed: ' . openssl_error_string());
        }

        // IV + ciphertext, base64-encoded for safe storage
        return base64_encode($iv . $ciphertext);
    }

    /**
     * Decrypt a value previously encrypted with encrypt().
     *
     * Extracts the IV from the first 16 bytes, then decrypts the
     * remaining ciphertext. Returns the original plaintext.
     */
    public function decrypt(string $encrypted): string
    {
        $raw = base64_decode($encrypted, true);
        if ($raw === false) {
            throw new RuntimeException(
                'Decryption failed: input is not valid base64. '
                . 'The encrypted value may be corrupted.'
            );
        }

        $ivLength = openssl_cipher_iv_length(self::CIPHER);

        if (strlen($raw) <= $ivLength) {
            throw new RuntimeException(
                'Decryption failed: encrypted data is too short. '
                . 'Expected at least ' . ($ivLength + 1) . ' bytes.'
            );
        }

        $iv = substr($raw, 0, $ivLength);
        $ciphertext = substr($raw, $ivLength);

        $plaintext = openssl_decrypt(
            $ciphertext,
            self::CIPHER,
            $this->key,
            OPENSSL_RAW_DATA,
            $iv
        );

        if ($plaintext === false) {
            throw new RuntimeException(
                'Decryption failed: wrong APP_KEY or corrupted data. '
                . 'If you regenerated the APP_KEY, previously encrypted values cannot be recovered.'
            );
        }

        return $plaintext;
    }

    /**
     * Generate a cryptographically secure APP_KEY.
     *
     * Returns a base64-encoded 32-byte random key suitable for
     * storing in config.json. Called once during installation.
     */
    public static function generateKey(): string
    {
        return base64_encode(random_bytes(32));
    }
}
