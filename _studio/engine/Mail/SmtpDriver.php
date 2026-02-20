<?php

declare(strict_types=1);

namespace VoxelSite\Mail;

/**
 * Direct SMTP driver — reliable email delivery without dependencies.
 *
 * Implements the SMTP protocol directly via PHP sockets. Supports
 * STARTTLS, SSL/TLS, and AUTH LOGIN/PLAIN. Handles the common
 * cases needed for VoxelSite (plain text emails with basic headers)
 * in ~200 lines without pulling in PHPMailer's 4,000+ lines of
 * edge-case handling for features we'll never use.
 *
 * Works with Gmail, Outlook, hosting provider SMTP, and any
 * standard SMTP server.
 */
class SmtpDriver implements MailDriverInterface
{
    protected string $host;
    protected int $port;
    protected string $username;
    protected string $password;
    protected string $encryption;
    protected int $timeout;

    /** @var resource|null */
    private $socket = null;

    /** @var string[] Communication log for debugging */
    private array $log = [];

    /** @var bool True while sending AUTH credentials (for log redaction) */
    private bool $inAuth = false;

    public function __construct(
        string $host,
        int $port = 587,
        string $username = '',
        string $password = '',
        string $encryption = 'tls',
        int $timeout = 30
    ) {
        $this->host = $host;
        $this->port = $port;
        $this->username = $username;
        $this->password = $password;
        $this->encryption = $encryption;
        $this->timeout = $timeout;
    }

    public function send(string $to, string $subject, string $body, array $headers = []): bool
    {
        try {
            $this->connect();
            $this->authenticate();

            // MAIL FROM — extract bare email from "Name <email>" format
            $from = $headers['From'] ?? $headers['from'] ?? $this->username;
            if (preg_match('/<([^>]+)>/', $from, $matches)) {
                $from = $matches[1];
            }
            $this->command("MAIL FROM:<{$from}>", 250);

            // RCPT TO
            $this->command("RCPT TO:<{$to}>", [250, 251]);

            // DATA
            $this->command('DATA', 354);

            // Build and send message, then terminate with lone dot
            $message = $this->buildMessage($to, $subject, $body, $headers);
            $this->command($message . "\r\n.", 250);

            // QUIT
            $this->command('QUIT', 221);
            $this->disconnect();

            return true;
        } catch (\Exception $e) {
            $this->log[] = 'Error: ' . $e->getMessage();
            $this->disconnect();
            return false;
        }
    }

    public function testConnection(string $testRecipient): array
    {
        try {
            $this->connect();
            $this->authenticate();

            // Send a real test email
            $subject = 'VoxelSite — Email Test';
            $body = "This is a test email from VoxelSite.\n\n";
            $body .= "If you're reading this, your SMTP configuration is working.\n";
            $body .= 'Sent at: ' . date('Y-m-d H:i:s T') . "\n";
            $body .= "Driver: SMTP ({$this->host}:{$this->port})\n";

            $from = $this->username;
            $this->command("MAIL FROM:<{$from}>", 250);
            $this->command("RCPT TO:<{$testRecipient}>", [250, 251]);
            $this->command('DATA', 354);

            $headers = [
                'From' => $from,
                'Content-Type' => 'text/plain; charset=UTF-8',
            ];
            $message = $this->buildMessage($testRecipient, $subject, $body, $headers);
            $this->command($message . "\r\n.", 250);

            $this->command('QUIT', 221);
            $this->disconnect();

            return [
                'success' => true,
                'message' => "Connected to {$this->host}:{$this->port} and test email sent successfully.",
            ];
        } catch (\Exception $e) {
            $this->disconnect();
            return [
                'success' => false,
                'message' => 'SMTP error: ' . $e->getMessage(),
            ];
        }
    }

    public function getName(): string
    {
        return "SMTP ({$this->host}:{$this->port})";
    }

    /**
     * Get the communication log (for debugging).
     *
     * @return string[]
     */
    public function getLog(): array
    {
        return $this->log;
    }

    // ─── Connection ───────────────────────────────

    /**
     * Open a socket connection and perform EHLO + optional STARTTLS.
     */
    private function connect(): void
    {
        $this->log = [];

        // SSL connections use ssl:// prefix; TLS connects plain then upgrades
        $address = $this->encryption === 'ssl'
            ? 'ssl://' . $this->host . ':' . $this->port
            : $this->host . ':' . $this->port;

        // SSL context — always strict certificate verification.
        $verifyPeer = true;
        $context = stream_context_create([
            'ssl' => [
                'verify_peer'       => $verifyPeer,
                'verify_peer_name'  => $verifyPeer,
                'allow_self_signed' => !$verifyPeer,
            ],
        ]);

        $this->socket = @stream_socket_client(
            $address,
            $errno,
            $errstr,
            $this->timeout,
            STREAM_CLIENT_CONNECT,
            $context
        );

        if (!$this->socket) {
            throw new \RuntimeException(
                "Could not connect to {$this->host}:{$this->port} — {$errstr} (#{$errno}). "
                . 'Check that the hostname, port, and encryption setting are correct.'
            );
        }

        stream_set_timeout($this->socket, $this->timeout);

        // Read server greeting
        $this->readResponse(220);

        // EHLO
        $hostname = gethostname() ?: 'localhost';
        $ehloResponse = $this->command("EHLO {$hostname}", 250);

        // STARTTLS upgrade for TLS encryption
        if ($this->encryption === 'tls') {
            if (stripos($ehloResponse, 'STARTTLS') === false) {
                throw new \RuntimeException(
                    "Server {$this->host} does not support STARTTLS. "
                    . 'Try changing encryption to SSL (port 465) or None.'
                );
            }

            $this->command('STARTTLS', 220);

            $cryptoResult = stream_socket_enable_crypto(
                $this->socket,
                true,
                STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT | STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT
            );

            if (!$cryptoResult) {
                throw new \RuntimeException(
                    "TLS negotiation failed with {$this->host}. "
                    . 'Try SSL (port 465) or check your PHP OpenSSL configuration.'
                );
            }

            // Re-EHLO after TLS upgrade (required by RFC 3207)
            $this->command("EHLO {$hostname}", 250);
        }
    }

    /**
     * Perform SMTP authentication (AUTH LOGIN).
     *
     * Skipped when no credentials are provided (e.g., local relay, Mailpit).
     */
    private function authenticate(): void
    {
        if ($this->username === '' || $this->password === '') {
            return;
        }

        $this->inAuth = true;
        $this->command('AUTH LOGIN', 334);
        $this->command(base64_encode($this->username), 334);
        $this->command(base64_encode($this->password), 235);
        $this->inAuth = false;
    }

    // ─── Protocol I/O ─────────────────────────────

    /**
     * Send a command and validate the response code.
     *
     * @param int|int[] $expectedCode Single code or array of acceptable codes
     */
    private function command(string $command, int|array $expectedCode): string
    {
        // Redact credentials from the log
        if ($this->inAuth && !str_starts_with($command, 'AUTH')) {
            $this->log[] = '>>> [credentials]';
        } else {
            $this->log[] = '>>> ' . substr($command, 0, 100);
        }

        fwrite($this->socket, $command . "\r\n");

        return $this->readResponse($expectedCode);
    }

    /**
     * Read a complete SMTP response (handles multi-line).
     *
     * @param int|int[] $expectedCode
     */
    private function readResponse(int|array $expectedCode): string
    {
        $expectedCodes = is_array($expectedCode) ? $expectedCode : [$expectedCode];
        $response = '';

        while (true) {
            $line = fgets($this->socket, 4096);
            if ($line === false) {
                throw new \RuntimeException('Lost connection to SMTP server');
            }
            $response .= $line;

            // Multi-line: "250-..." continues, "250 ..." is the final line
            if (isset($line[3]) && $line[3] !== '-') {
                break;
            }
        }

        $this->log[] = '<<< ' . trim($response);

        $code = (int) substr($response, 0, 3);
        if (!in_array($code, $expectedCodes, true)) {
            throw new \RuntimeException(
                'SMTP error: expected ' . implode('/', $expectedCodes)
                . " but got {$code} — " . trim($response)
            );
        }

        return $response;
    }

    // ─── Message Building ─────────────────────────

    /**
     * Build a complete RFC 2822 message with headers and body.
     */
    private function buildMessage(string $to, string $subject, string $body, array $headers): string
    {
        $lines = [];

        // Ensure required headers (only if caller hasn't set them)
        $headerKeys = array_change_key_case($headers, CASE_LOWER);

        if (!isset($headerKeys['date'])) {
            $lines[] = 'Date: ' . date('r');
        }
        if (!isset($headerKeys['to'])) {
            $lines[] = 'To: ' . $to;
        }
        if (!isset($headerKeys['subject'])) {
            $lines[] = 'Subject: ' . $this->encodeHeader($subject);
        }
        if (!isset($headerKeys['mime-version'])) {
            $lines[] = 'MIME-Version: 1.0';
        }
        if (!isset($headerKeys['content-type'])) {
            $lines[] = 'Content-Type: text/plain; charset=UTF-8';
        }
        if (!isset($headerKeys['content-transfer-encoding'])) {
            $lines[] = 'Content-Transfer-Encoding: quoted-printable';
        }

        // Add caller-supplied headers
        foreach ($headers as $key => $value) {
            $lines[] = $key . ': ' . $value;
        }

        // Blank line separates headers from body
        $lines[] = '';

        // Encode body as quoted-printable for safe transport
        $lines[] = quoted_printable_encode($body);

        $message = implode("\r\n", $lines);

        // Dot-stuffing: lines starting with a dot get an extra dot (RFC 5321 §4.5.2)
        return preg_replace('/^\./m', '..', $message);
    }

    /**
     * Encode header value for non-ASCII characters (RFC 2047).
     */
    private function encodeHeader(string $value): string
    {
        if (preg_match('/[^\x20-\x7E]/', $value)) {
            return '=?UTF-8?B?' . base64_encode($value) . '?=';
        }
        return $value;
    }

    /**
     * Close the socket connection.
     */
    private function disconnect(): void
    {
        if ($this->socket !== null) {
            @fclose($this->socket);
            $this->socket = null;
        }
    }
}
