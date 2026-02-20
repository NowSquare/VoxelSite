<?php

declare(strict_types=1);

namespace VoxelSite\Mail;

/**
 * Mailpit driver — local email testing.
 *
 * Mailpit (github.com/axllent/mailpit) captures all outgoing email
 * and displays it in a web UI. Essential for development — you can
 * test form submissions without sending real emails.
 *
 * This is a thin wrapper around SmtpDriver with pre-configured
 * settings for Mailpit's default configuration (localhost:1025,
 * no auth, no encryption).
 */
class MailpitDriver extends SmtpDriver
{
    public function __construct(string $host = 'localhost', int $port = 1025)
    {
        parent::__construct(
            host: $host,
            port: $port,
            username: '',
            password: '',
            encryption: 'none',
            timeout: 5
        );
    }

    public function getName(): string
    {
        return 'Mailpit (local testing)';
    }

    public function testConnection(string $testRecipient): array
    {
        $result = parent::testConnection($testRecipient);

        if (!$result['success']) {
            $result['message'] .= "\n\nMake sure Mailpit is running. "
                . 'Install: https://mailpit.axllent.org/docs/install/';
        }

        return $result;
    }
}
