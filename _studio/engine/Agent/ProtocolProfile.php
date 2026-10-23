<?php
declare(strict_types=1);

namespace VoxelSite\Agent;

/**
 * Pinned wire contracts. These profiles are protocol fixture coverage, not a
 * claim that a named desktop client has qualified against this installation.
 *
 * @see https://modelcontextprotocol.io/specification/2026-07-28/basic/versioning
 * @see https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle
 */
final readonly class ProtocolProfile
{
    public const CURRENT = '2026-07-28';
    public const COMPATIBILITY = '2025-11-25';
    public const VERSION_META = 'io.modelcontextprotocol/protocolVersion';
    public const CAPABILITIES_META = 'io.modelcontextprotocol/clientCapabilities';
    public const CLIENT_META = 'io.modelcontextprotocol/clientInfo';
    public const SERVER_META = 'io.modelcontextprotocol/serverInfo';

    public function __construct(public string $version)
    {
        if (!in_array($version, self::versions(), true)) {
            throw new \InvalidArgumentException('Unsupported protocol profile.');
        }
    }

    public static function versions(): array
    {
        return [self::CURRENT, self::COMPATIBILITY];
    }

    public function modern(): bool
    {
        return $this->version === self::CURRENT;
    }

    /** @return array{code:int,message:string}|null */
    public function validate(\stdClass $request, array $headers): ?array
    {
        $params = $request->params ?? new \stdClass();
        if (!$this->modern()) {
            if ($request->method === 'initialize') {
                if (!is_string($params->protocolVersion ?? null)
                    || !($params->capabilities ?? null) instanceof \stdClass
                    || !self::implementation($params->clientInfo ?? null)) {
                    return self::invalid('Initialization requires a protocol version, capabilities object and client name/version.');
                }
                if (isset($headers['mcp-protocol-version'])
                    && $headers['mcp-protocol-version'] !== $params->protocolVersion) {
                    return self::mismatch();
                }
            }
            return null;
        }

        $meta = $params->_meta ?? null;
        if (!$meta instanceof \stdClass
            || !is_string($meta->{self::VERSION_META} ?? null)
            || !($meta->{self::CAPABILITIES_META} ?? null) instanceof \stdClass
            || (property_exists($meta, self::CLIENT_META) && !self::implementation($meta->{self::CLIENT_META}))) {
            return self::invalid('Each request requires protocolVersion and clientCapabilities in params._meta.');
        }
        if (($headers['mcp-protocol-version'] ?? null) !== $meta->{self::VERSION_META}
            || ($headers['mcp-method'] ?? null) !== $request->method
            || preg_match('/[^\x20-\x7e]/', $headers['mcp-method'] ?? '')) {
            return self::mismatch();
        }
        if (in_array($request->method, ['tools/call', 'prompts/get', 'resources/read'], true)) {
            $name = $request->method === 'resources/read' ? ($params->uri ?? null) : ($params->name ?? null);
            if (!is_string($name) || !isset($headers['mcp-name'])
                || self::decodeHeaderValue($headers['mcp-name']) !== $name) {
                return self::mismatch();
            }
        }
        return null;
    }

    /** Decode the modern HTTP sentinel exactly once; malformed encoding fails. */
    public static function decodeHeaderValue(string $value): ?string
    {
        if (preg_match('/[^\x09\x20-\x7e]/', $value) || trim($value, " \t") !== $value) return null;
        if (str_starts_with($value, '=?base64?') && str_ends_with($value, '?=')) {
            $encoded = substr($value, 9, -2);
            $decoded = base64_decode($encoded, true);
            if ($decoded === false || base64_encode($decoded) !== $encoded || !mb_check_encoding($decoded, 'UTF-8')) return null;
            return $decoded;
        }
        return $value;
    }

    public function result(array $result, array $serverInfo, bool $cacheable = false): array
    {
        if ($this->modern()) {
            $result['resultType'] = 'complete';
            $result['_meta'] = [self::SERVER_META => $serverInfo];
            if ($cacheable) {
                // Authorization and revocation apply on every request.
                $result['ttlMs'] = 0;
                $result['cacheScope'] = 'private';
            }
        }
        return $result;
    }

    private static function implementation(mixed $value): bool
    {
        return $value instanceof \stdClass
            && is_string($value->name ?? null) && $value->name !== ''
            && is_string($value->version ?? null) && $value->version !== ''
            && strlen($value->name) <= 256 && strlen($value->version) <= 128;
    }

    private static function invalid(string $message): array
    {
        return ['code' => -32602, 'message' => $message];
    }

    private static function mismatch(): array
    {
        return ['code' => -32020, 'message' => 'Required MCP headers are missing, malformed or do not match the request body.'];
    }
}
