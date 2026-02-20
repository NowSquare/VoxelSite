<?php

declare(strict_types=1);

namespace VoxelSite;

use VoxelSite\Mail\MailDriverInterface;
use VoxelSite\Mail\MailpitDriver;
use VoxelSite\Mail\PhpMailDriver;
use VoxelSite\Mail\SmtpDriver;

/**
 * Mailer — single entry point for sending email in VoxelSite.
 *
 * Reads configuration from the Studio settings database, instantiates
 * the appropriate driver, and sends messages. Handles fallback
 * gracefully: if SMTP fails, tries php_mail. If that fails too,
 * logs the error and moves on.
 *
 * Email is best-effort notification, not a transaction requirement.
 * A form submission must NEVER fail because email delivery failed.
 *
 * Uses the existing Settings class for config storage and Encryption
 * class for SMTP password encryption (same AES-256-CBC + APP_KEY
 * mechanism used for API keys).
 */
class Mailer
{
    private static ?Mailer $instance = null;
    private ?MailDriverInterface $driver = null;
    private array $config = [];
    private string $lastError = '';
    private Settings $settings;

    /**
     * SMTP presets for common email providers.
     * Shown in the Studio settings UI as a dropdown.
     */
    public const SMTP_PRESETS = [
        'gmail' => [
            'label' => 'Gmail',
            'host' => 'smtp.gmail.com',
            'port' => 587,
            'encryption' => 'tls',
            'help' => 'Requires an App Password. Enable 2FA in your Google account, then generate an App Password at myaccount.google.com/apppasswords',
        ],
        'outlook' => [
            'label' => 'Outlook / Hotmail',
            'host' => 'smtp-mail.outlook.com',
            'port' => 587,
            'encryption' => 'tls',
            'help' => '',
        ],
        'yahoo' => [
            'label' => 'Yahoo',
            'host' => 'smtp.mail.yahoo.com',
            'port' => 587,
            'encryption' => 'tls',
            'help' => 'Requires an App Password. Generate one in Yahoo account security settings.',
        ],
        'icloud' => [
            'label' => 'iCloud',
            'host' => 'smtp.mail.me.com',
            'port' => 587,
            'encryption' => 'tls',
            'help' => 'Requires an App-Specific Password. Generate one at appleid.apple.com',
        ],
        'zoho' => [
            'label' => 'Zoho',
            'host' => 'smtp.zoho.com',
            'port' => 587,
            'encryption' => 'tls',
            'help' => '',
        ],
        'hosting' => [
            'label' => 'My Hosting Provider',
            'host' => '',
            'port' => 465,
            'encryption' => 'ssl',
            'help' => 'Check your hosting control panel for SMTP settings. Common: mail.yourdomain.com on port 465 with SSL.',
        ],
        'custom' => [
            'label' => 'Custom SMTP Server',
            'host' => '',
            'port' => 587,
            'encryption' => 'tls',
            'help' => '',
        ],
    ];

    private function __construct(?Settings $settings = null)
    {
        $this->settings = $settings ?? new Settings();
        $this->loadConfig();
    }

    /**
     * Get the singleton Mailer instance.
     */
    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Reset the singleton (for testing or after config changes).
     */
    public static function resetInstance(): void
    {
        self::$instance = null;
    }

    /**
     * Send an email message.
     *
     * Tries the configured driver first. If it fails and isn't already
     * php_mail, falls back to PhpMailDriver. If both fail, logs the
     * error and returns false. Never throws.
     *
     * @param string $to Recipient email
     * @param string $subject Subject line
     * @param string $body Plain text body
     * @param array $options Optional: 'reply_to', 'from_address', 'from_name'
     * @return bool True if accepted for delivery (not guaranteed inbox)
     */
    public function send(string $to, string $subject, string $body, array $options = []): bool
    {
        $headers = $this->buildHeaders($options);

        // Try the configured driver
        $driver = $this->getDriver();
        $driverName = $driver->getName();

        try {
            $result = $driver->send($to, $subject, $body, $headers);
            if ($result) {
                $this->log('info', "Email sent via {$driverName} to {$to}: {$subject}");
                return true;
            }
            $this->lastError = "{$driverName} returned false";
        } catch (\Exception $e) {
            $this->lastError = $e->getMessage();
        }

        $this->log('warning', "Email failed via {$driverName}: {$this->lastError}");

        // Fallback to php_mail if we weren't already using it
        if (!($driver instanceof PhpMailDriver)) {
            $this->log('info', "Falling back to PHP mail() for {$to}");
            $fallback = new PhpMailDriver();
            try {
                $result = $fallback->send($to, $subject, $body, $headers);
                if ($result) {
                    $this->log('info', "Email sent via PHP mail() (fallback) to {$to}");
                    return true;
                }
            } catch (\Exception $e) {
                $this->lastError = $e->getMessage();
            }
            $this->log('warning', "Fallback PHP mail() also failed: {$this->lastError}");
        }

        $this->log('error', "All email delivery methods failed for {$to}: {$subject}");
        return false;
    }

    /**
     * Test the current email configuration.
     *
     * @return array{success: bool, message: string, driver: string}
     */
    public function testConnection(string $testRecipient): array
    {
        $driver = $this->getDriver();
        $result = $driver->testConnection($testRecipient);
        $result['driver'] = $driver->getName();
        return $result;
    }

    /**
     * Test a specific configuration without saving it.
     *
     * Used by the settings UI and installation wizard to verify
     * config before committing it to the database.
     *
     * @return array{success: bool, message: string, driver: string}
     */
    public static function testConfig(array $config, string $testRecipient): array
    {
        $driver = self::createDriverFromConfig($config);
        $result = $driver->testConnection($testRecipient);
        $result['driver'] = $driver->getName();
        return $result;
    }

    /**
     * Get the last error message (for debugging).
     */
    public function getLastError(): string
    {
        return $this->lastError;
    }

    /**
     * Get the current configuration (SMTP password masked).
     *
     * Safe to expose to the frontend / API responses.
     */
    public function getConfig(): array
    {
        $config = $this->config;
        if (!empty($config['smtp_password'])) {
            $config['smtp_password'] = '••••••••';
        }
        return $config;
    }

    /**
     * Get SMTP presets with auto-suggested hosting hostname.
     *
     * @return array<string, array>
     */
    public function getPresetsWithHostingSuggestion(): array
    {
        $presets = self::SMTP_PRESETS;

        // Auto-suggest mail.{domain} for the hosting preset
        $host = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? '';
        $host = preg_replace('/^www\./', '', $host);
        if ($host && $presets['hosting']['host'] === '') {
            $presets['hosting']['host'] = 'mail.' . $host;
        }

        return $presets;
    }

    /**
     * Read recent entries from the mail log.
     *
     * @return array<int, array{time: string, level: string, message: string}>
     */
    public function getRecentLog(int $maxEntries = 10): array
    {
        $logFile = $this->getLogPath();
        if (!file_exists($logFile)) {
            return [];
        }

        $lines = file($logFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if (!$lines) {
            return [];
        }

        // Take the last N entries
        $lines = array_slice($lines, -$maxEntries);

        $entries = [];
        foreach ($lines as $line) {
            // Parse: "2026-02-12 14:30:00 [info] Email sent via..."
            if (preg_match('/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \[(\w+)] (.+)$/', $line, $m)) {
                $entries[] = [
                    'time' => $m[1],
                    'level' => $m[2],
                    'message' => $m[3],
                ];
            }
        }

        return $entries;
    }

    // ─── Private Methods ──────────────────────────

    /**
     * Load mail config from the Settings table.
     */
    private function loadConfig(): void
    {
        $this->config = [
            'driver' => (string) $this->settings->get('mail.driver', 'none'),
            'from_address' => (string) $this->settings->get('mail.from_address', $this->getDefaultFromAddress()),
            'from_name' => (string) $this->settings->get('mail.from_name', $this->getDefaultFromName()),
            'smtp_host' => (string) $this->settings->get('mail.smtp.host', ''),
            'smtp_port' => (int) $this->settings->get('mail.smtp.port', 587),
            'smtp_username' => (string) $this->settings->get('mail.smtp.username', ''),
            'smtp_password' => $this->decryptSetting('mail.smtp.password'),
            'smtp_encryption' => (string) $this->settings->get('mail.smtp.encryption', 'tls'),
            'mailpit_host' => (string) $this->settings->get('mail.mailpit.host', 'localhost'),
            'mailpit_port' => (int) $this->settings->get('mail.mailpit.port', 1025),
        ];
    }

    /**
     * Get or create the active driver instance.
     */
    private function getDriver(): MailDriverInterface
    {
        if ($this->driver !== null) {
            return $this->driver;
        }

        $this->driver = self::createDriverFromConfig($this->config);
        return $this->driver;
    }

    /**
     * Instantiate a driver from a configuration array.
     *
     * Used both internally (from settings) and externally (testConfig).
     */
    private static function createDriverFromConfig(array $config): MailDriverInterface
    {
        $driverName = $config['driver'] ?? 'none';

        return match ($driverName) {
            'smtp' => new SmtpDriver(
                host: $config['smtp_host'] ?? '',
                port: (int) ($config['smtp_port'] ?? 587),
                username: $config['smtp_username'] ?? '',
                password: $config['smtp_password'] ?? '',
                encryption: $config['smtp_encryption'] ?? 'tls',
            ),
            'mailpit' => new MailpitDriver(
                host: $config['mailpit_host'] ?? 'localhost',
                port: (int) ($config['mailpit_port'] ?? 1025),
            ),
            'php_mail' => new PhpMailDriver(),
            // 'none' and any unknown driver: still use PhpMailDriver as
            // a best-effort fallback, but the intent is "not configured"
            default => new PhpMailDriver(),
        };
    }

    /**
     * Build header array for the email message.
     */
    private function buildHeaders(array $options): array
    {
        $fromAddress = $options['from_address'] ?? $this->config['from_address'];
        $fromName = $options['from_name'] ?? $this->config['from_name'];

        $headers = [
            'From' => $fromName ? "{$fromName} <{$fromAddress}>" : $fromAddress,
            'Content-Type' => 'text/plain; charset=UTF-8',
        ];

        if (!empty($options['reply_to'])) {
            $headers['Reply-To'] = $options['reply_to'];
        }

        return $headers;
    }

    /**
     * Default "From" address: noreply@{domain}.
     */
    private function getDefaultFromAddress(): string
    {
        $host = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? 'localhost';
        $host = preg_replace('/^www\./', '', $host);
        return 'noreply@' . $host;
    }

    /**
     * Default "From" name: site name from site.json, or 'VoxelSite'.
     */
    private function getDefaultFromName(): string
    {
        $docRoot = $_SERVER['DOCUMENT_ROOT'] ?? '';
        $siteJsonPath = $docRoot . '/assets/data/site.json';
        if ($docRoot && file_exists($siteJsonPath)) {
            $siteData = json_decode(file_get_contents($siteJsonPath), true);
            if (!empty($siteData['name'])) {
                return $siteData['name'];
            }
        }
        return 'VoxelSite';
    }

    /**
     * Decrypt an encrypted setting using the existing Encryption class.
     *
     * Reuses the same APP_KEY + AES-256-CBC mechanism used for API keys —
     * no need for a parallel encryption system.
     */
    private function decryptSetting(string $key): string
    {
        $encrypted = $this->settings->get($key, '');
        if (empty($encrypted) || !is_string($encrypted)) {
            return '';
        }

        try {
            $config = loadConfig();
            if (!$config || empty($config['app_key'])) {
                return '';
            }
            $encryption = new Encryption($config['app_key']);
            return $encryption->decrypt($encrypted);
        } catch (\Throwable $e) {
            $this->log('warning', "Failed to decrypt {$key}: " . $e->getMessage());
            return '';
        }
    }

    /**
     * Encrypt a value for storage using the existing Encryption class.
     *
     * @throws \RuntimeException If APP_KEY is not configured
     */
    public static function encryptPassword(string $password): string
    {
        $config = loadConfig();
        if (!$config || empty($config['app_key'])) {
            throw new \RuntimeException('Application key not configured — run the installation wizard.');
        }
        $encryption = new Encryption($config['app_key']);
        return $encryption->encrypt($password);
    }

    /**
     * Log a mail event.
     *
     * Auto-rotates at ~100KB to keep the log file manageable
     * on shared hosting.
     */
    private function log(string $level, string $message): void
    {
        $logFile = $this->getLogPath();
        $logDir = dirname($logFile);

        // Ensure log directory exists
        if (!is_dir($logDir)) {
            @mkdir($logDir, 0755, true);
        }

        // Auto-rotate: truncate to last half when > 100KB
        if (file_exists($logFile) && filesize($logFile) > 102400) {
            $content = file_get_contents($logFile);
            $halfPoint = (int) (strlen($content) / 2);
            // Find the next newline after the half point so we don't cut mid-line
            $cutPoint = strpos($content, "\n", $halfPoint);
            if ($cutPoint !== false) {
                file_put_contents($logFile, substr($content, $cutPoint + 1));
            }
        }

        $entry = date('Y-m-d H:i:s') . " [{$level}] {$message}\n";
        @file_put_contents($logFile, $entry, FILE_APPEND | LOCK_EX);
    }

    /**
     * Path to the mail log file.
     */
    private function getLogPath(): string
    {
        return ($_SERVER['DOCUMENT_ROOT'] ?? dirname(__DIR__, 2))
            . '/_studio/data/mail.log';
    }
}
