<?php

declare(strict_types=1);

namespace VoxelSite\Mail;

/**
 * Contract for all mail delivery drivers.
 *
 * Every driver must be able to send a message and test its own
 * configuration. Drivers are stateless — they receive all necessary
 * connection parameters via their constructor.
 *
 * Ship with: PhpMailDriver, SmtpDriver, MailpitDriver.
 * Adding a new driver (Resend, SES, etc.) means adding one file —
 * no changes to any existing code.
 */
interface MailDriverInterface
{
    /**
     * Send an email message.
     *
     * @param string $to Recipient email address
     * @param string $subject Email subject line
     * @param string $body Email body (plain text)
     * @param array<string, string> $headers Key => value pairs (From, Reply-To, etc.)
     * @return bool True if the message was accepted for delivery
     */
    public function send(string $to, string $subject, string $body, array $headers = []): bool;

    /**
     * Test the connection / configuration by sending a real test email.
     *
     * @param string $testRecipient Email address to send the test to
     * @return array{success: bool, message: string}
     */
    public function testConnection(string $testRecipient): array;

    /**
     * Get the driver's human-readable display name.
     */
    public function getName(): string;
}
