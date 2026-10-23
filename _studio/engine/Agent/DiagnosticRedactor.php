<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Database, Encryption, RouterSecrets};

/** The same final redaction boundary applies to JSON reads and text downloads. */
final class DiagnosticRedactor
{
    private array $secrets = [];
    public function __construct(Database $db, #[\SensitiveParameter] ?string $appKey = null)
    {
        foreach ($db->query('SELECT key,value FROM settings') as $row) {
            if (!preg_match('/(?:api_key|password|secret|token)$/i', $row['key'])) continue;
            $value = json_decode($row['value'], true);
            if (!is_string($value) || $value === '') continue;
            $this->secrets[$value] = '[redacted]';
            try {
                $key = $appKey ?? (loadConfig()['app_key'] ?? '');
                $plain = (new Encryption($key))->decrypt($value);
                if ($plain !== '') $this->secrets[$plain] = '[redacted]';
            } catch (\Throwable) {
                throw new OperationException('host_capability_unavailable', 'Logs cannot be safely redacted while configured secrets cannot be decrypted.');
            }
        }
    }
    public function value(#[\SensitiveParameter] mixed $value, int $depth = 0): mixed
    {
        if ($depth > 24) return '[omitted: nesting limit]';
        if (is_object($value)) $value = (array) $value;
        if (is_array($value)) {
            $out = [];
            foreach ($value as $key => $item) {
                if (is_string($key) && preg_match('/(?:password|secret|api.?key|authorization|cookie|access.?token|refresh.?token|credential)/i', $key)) $out[$key] = '[redacted]';
                else $out[$key] = $this->value($item, $depth + 1);
            }
            return $out;
        }
        if (!is_string($value)) return $value;
        $decoded = json_decode($value, true);
        if (is_array($decoded)) return CanonicalJson::encode($this->value($decoded, $depth + 1));
        return $this->text($value);
    }
    public function text(#[\SensitiveParameter] string $text): string
    {
        $text = strtr((string) RouterSecrets::redact($text), $this->secrets);
        $text = preg_replace('#\\b(?:Bearer|Basic)\\s+[A-Za-z0-9._~+/-]+=*#i', '[redacted authorization]', $text);
        $text = preg_replace('~\\b(?:sk-(?:ant-)?[A-Za-z0-9_-]{8,}|AIza[A-Za-z0-9_-]{12,}|vsmcp_[A-Za-z0-9_-]+)\\b~', '[redacted token]', $text);
        $text = preg_replace('~((?:password|secret|api[_-]?key|access[_-]?token|refresh[_-]?token|authorization|cookie)[\"\\x27]?\\s*[:=]\\s*)([\"\\x27])(?:\\\\.|(?!\\2).)*\\2~i', '$1"[redacted]"', $text);
        $text = preg_replace('~((?:password|secret|api[_-]?key|access[_-]?token|refresh[_-]?token|authorization|cookie)[\"\\x27]?\\s*[:=]\\s*)[^\\s,;}]+~i', '$1[redacted]', $text);
        $text = preg_replace('~(https?://)[^\\s/@]+:[^\\s/@]+@~i', '$1[redacted]@', $text);
        return $text;
    }
}
