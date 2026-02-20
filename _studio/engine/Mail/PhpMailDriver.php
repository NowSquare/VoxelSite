<?php

declare(strict_types=1);

namespace VoxelSite\Mail;

/**
 * PHP mail() driver — the zero-configuration default.
 *
 * Uses PHP's built-in mail() function. Works on most shared hosting.
 * Reliability varies by host — some block it, some route through
 * their own SMTP servers, some land in spam. But it requires zero
 * configuration, making it the right default for the bakery owner
 * who just wants her contact form to work.
 */
class PhpMailDriver implements MailDriverInterface
{
    public function send(string $to, string $subject, string $body, array $headers = []): bool
    {
        $headerString = $this->buildHeaderString($headers);
        return @mail($to, $subject, $body, $headerString);
    }

    public function testConnection(string $testRecipient): array
    {
        $subject = 'VoxelSite — Email Test';
        $body = "This is a test email from VoxelSite.\n\n";
        $body .= "If you're reading this, your email configuration is working.\n";
        $body .= 'Sent at: ' . date('Y-m-d H:i:s T') . "\n";
        $body .= "Driver: PHP mail()\n";

        $headers = [
            'Content-Type' => 'text/plain; charset=UTF-8',
        ];

        $result = $this->send($testRecipient, $subject, $body, $headers);

        if ($result) {
            return [
                'success' => true,
                'message' => 'Test email sent via PHP mail(). Check your inbox (and spam folder).',
            ];
        }

        return [
            'success' => false,
            'message' => 'PHP mail() returned false. Your hosting provider may have disabled '
                . 'the mail() function. Try switching to SMTP.',
        ];
    }

    public function getName(): string
    {
        return 'PHP mail()';
    }

    /**
     * Convert associative header array to RFC 2822 header string.
     */
    private function buildHeaderString(array $headers): string
    {
        $lines = [];
        foreach ($headers as $key => $value) {
            $lines[] = $key . ': ' . $value;
        }
        return implode("\r\n", $lines);
    }
}
