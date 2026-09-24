<?php

declare(strict_types=1);

namespace VoxelSite;

use Closure;
use RuntimeException;
use Throwable;

/**
 * One literal PHP/HTML heading, one in-memory candidate, one apply.
 * RouterHeading/RouterPendingHeading authorize the code-built path allowlist.
 * No full-page prompts, FileManager, revisions, CSS or AEO until gate acceptance.
 */
final class StagedHeadingPatch
{
    private Closure $claimGate;
    private Closure $writerFactory;
    private ?Closure $isCancelled;
    private ?Closure $onBlockedCandidate;
    private const MAX_CANDIDATE_CHARS = 200;
    private const FORBIDDEN_CLAIMS_THRESHOLD = 0.60;

    /**
     * @param list<string> $allowedPaths Server-resolved page paths, never model paths.
     * @param callable(array):array $claimGate Returns the typed forbidden_claims Noul answer.
     * @param callable():FileManager $writerFactory Must address the same preview root.
     */
    public function __construct(
        private string $previewRoot,
        private array $allowedPaths,
        private ?AIProviderInterface $generator,
        callable $claimGate,
        callable $writerFactory,
        private ?AICallLedger $ledger = null,
        private bool $strictLedger = false,
        ?callable $isCancelled = null,
        private string $gateProvider = 'unknown',
        private ?string $gateModel = null,
        private bool $governedBudget = false,
        private ?RouterClaimOverride $claimOverrides = null,
        private ?int $claimOverrideId = null,
        ?callable $onBlockedCandidate = null
    ) {
        $this->claimGate = Closure::fromCallable($claimGate);
        $this->writerFactory = Closure::fromCallable($writerFactory);
        $this->isCancelled = $isCancelled === null ? null : Closure::fromCallable($isCancelled);
        $this->onBlockedCandidate = $onBlockedCandidate === null ? null : Closure::fromCallable($onBlockedCandidate);
        if ($ledger !== null && $generator !== null) {
            $this->generator = new LedgeredAIProvider($generator, $ledger, governedBudget: $governedBudget);
        }
    }

    /**
     * source_address is an exact, unique literal heading, not a browser selector.
     * base_revision_id is diagnostic only. The span AND whole-file hashes are checked.
     * Returns no live-site success when generation, validation, gate or compare fails.
     */
    public function execute(array $target, string $request, array $trustedFacts, ?string $explicitCandidate = null, ?string $repairReason = null): array
    {
        $path = $target['file_path'] ?? null;
        $address = $target['source_address'] ?? null;
        $hash = $target['content_hash'] ?? null;
        if (!is_string($path) || !in_array($path, $this->allowedPaths, true)
            || !is_string($address) || $address === '' || !is_string($hash)
            || !preg_match('/\A[0-9a-f]{64}\z/D', $hash)) {
            return $this->result('rejected', 'invalid_target');
        }
        try {
            $absolute = GovernedFilePath::resolve($this->previewRoot, $path);
            $original = $this->read($absolute);
            if (isset($target['expected_file_hash']) && (!is_string($target['expected_file_hash'])
                || !hash_equals($target['expected_file_hash'], hash('sha256', $original)))) {
                return $this->result('rejected', 'content_changed');
            }
            // Parse syntax without executing PHP or creating temporary site files.
            $tokens = token_get_all($original, TOKEN_PARSE);
        } catch (Throwable) {
            return $this->result('rejected', 'invalid_target');
        }
        $matches = substr_count($original, $address);
        if ($matches !== 1) {
            return $this->result('clarify', $matches === 0 ? 'missing_address' : 'ambiguous_address');
        }
        if (!hash_equals($hash, hash('sha256', $address))) {
            return $this->result('rejected', 'content_changed');
        }
        $offset = strpos($original, $address);
        // This proof supports plain text inside a literal heading only, preserving tags/attributes.
        if (!preg_match('/\A(<h([1-6])\b[^<>]*>)([^<>]*)(<\/h\2>)\z/iD', $address, $heading)
            || !$this->isLiteralHeading($tokens, $offset, strlen($address))) {
            return $this->result('rejected', 'invalid_target');
        }
        $originalHash = hash('sha256', $original);
        // Proof-only server injection. Neither request data nor a gate answer can
        // create an approval service. Overrides require strict call accounting.
        if ($this->claimOverrideId !== null) {
            if ($this->claimOverrides === null || $this->claimOverrideId < 1 || !isset($target['expected_file_hash'])) {
                return $this->result('rejected', 'override_invalid');
            }
            if (!$this->strictLedger || $this->ledger === null || !$this->ledger->isHealthy()) {
                return $this->result('rejected', 'ledger_unavailable');
            }
            try { $this->claimOverrides->assertAvailable($this->previewRoot); }
            catch (Throwable $e) { return $this->result('rejected', $this->overrideFailure($e)); }
        }
        if ($this->cancelled()) { return $this->result('rejected', 'generation_cancelled'); }
        // Explicit user text is literal: do not generate or trim replacement bytes.
        $candidate = $explicitCandidate;
        if ($candidate === null) {
            if ($this->generator === null) {
                return $this->result('rejected', 'generation_failed');
            }
            $candidate = '';
            $completed = false;
            try {
                $this->generator->stream(
                    'Return only replacement plain text for the selected heading, at most 200 characters. Keep the meaning. Do not add markup, explanations or unsupported facts.',
                    [['role' => 'user', 'content' => json_encode([
                        'request' => $request,
                        'current_heading' => html_entity_decode($heading[3], ENT_QUOTES | ENT_HTML5, 'UTF-8'),
                        'trusted_facts' => $trustedFacts,
                    ] + ($repairReason === null ? [] : ['repair_reason' => $repairReason]), JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]],
                    function (string $chunk) use (&$candidate): void {
                        if ($this->cancelled()) { throw new RuntimeException('generation_cancelled'); }
                        $candidate .= $chunk;
                        if (strlen($candidate) > 4096) {
                            throw new RuntimeException('Candidate exceeds buffer limit');
                        }
                    },
                    function (string $response, array $usage) use (&$candidate, &$completed): void {
                        if ($completed || $response !== $candidate) {
                            throw new RuntimeException('Inconsistent completion');
                        }
                        $completed = true;
                    },
                    ['max_tokens' => 256, 'temperature' => 0]
                );
            } catch (Throwable $e) {
                if ($this->governedBudget && in_array($e->getMessage(), ['repair_limit_exhausted', 'ledger_unavailable'], true)) {
                    return $this->result('rejected', $e->getMessage());
                }
                return $this->result('rejected', $e->getMessage() === 'generation_cancelled' ? 'generation_cancelled' : 'generation_failed');
            }
            if (!$completed) {
                return $this->result('rejected', 'generation_failed');
            }
            $candidate = trim($candidate);
        }
        if ($this->strictLedger && ($this->ledger === null || !$this->ledger->isHealthy())) {
            return $this->result('rejected', 'ledger_unavailable');
        }
        if (($this->claimOverrideId !== null && RouterSecrets::redact($candidate) !== $candidate)
            || trim($candidate) === '' || !mb_check_encoding($candidate, 'UTF-8')
            || ($explicitCandidate !== null && preg_match('/\A\s+\z/uD', $candidate))
            || mb_strlen($candidate, 'UTF-8') > self::MAX_CANDIDATE_CHARS
            || preg_match('/[<>\x00-\x1f\x7f]/', $candidate)) {
            return $this->result('rejected', 'invalid_candidate');
        }
        $replacement = $heading[1] . htmlspecialchars($candidate, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . $heading[4];
        $modified = substr_replace($original, $replacement, $offset, strlen($address));
        try {
            token_get_all($modified, TOKEN_PARSE);
            // Refuse stale input before paying for a gate; repeat after the gate below.
            if (!$this->unchanged($path, $absolute, $originalHash)) {
                return $this->result('rejected', 'content_changed');
            }
        } catch (Throwable) {
            return $this->result('rejected', 'invalid_candidate');
        }
        $candidateHash = hash('sha256', $candidate);
        if ($this->cancelled()) { return $this->result('rejected', 'generation_cancelled', $candidateHash); }
        // The injected gate may be a fake or another classifier. Do not invent
        // provider/model identity or persist state in its metadata ledger.
        $gateCallId = $this->ledger?->start('gate', $this->gateProvider, $this->gateModel, 'evaluate');
        if ($this->strictLedger && ($gateCallId === null || !$this->ledger->isHealthy())) {
            return $this->result('rejected', 'ledger_unavailable', $candidateHash);
        }
        try {
            $answer = ($this->claimGate)([
                'file_path' => $path, 'source_address' => $address, 'content_hash' => $hash,
                'candidate' => $candidate, 'candidate_hash' => $candidateHash, 'trusted_facts' => $trustedFacts,
            ]);
        } catch (Throwable) {
            $this->ledger?->finish($gateCallId, 'error', errorCode: 'gate_error');
            return $this->result('rejected', 'gate_unavailable', $candidateHash);
        }
        if (!is_array($answer) || !is_array($answer['answers'] ?? null)
            || !is_array($answer['answers']['forbidden_claims'] ?? null)) {
            $this->ledger?->finish($gateCallId, 'error', errorCode: 'invalid_response');
            return $this->result('rejected', 'gate_invalid', $candidateHash);
        }
        $noul = $answer['answers']['forbidden_claims']['noul'] ?? null;
        if ((!is_int($noul) && !is_float($noul)) || !is_finite((float) $noul) || $noul < 0 || $noul > 1) {
            $this->ledger?->finish($gateCallId, 'error', errorCode: 'invalid_response');
            return $this->result('rejected', 'gate_invalid', $candidateHash);
        }
        $this->ledger?->finish($gateCallId, 'success',
            is_array($answer['usage'] ?? null) ? $answer['usage'] : null, null, null,
            is_string($answer['model'] ?? null) ? $answer['model'] : null);
        if ($this->strictLedger && !$this->ledger->isHealthy()) {
            return $this->result('rejected', 'ledger_unavailable', $candidateHash);
        }
        $overridden = false;
        if ($noul >= self::FORBIDDEN_CLAIMS_THRESHOLD && $this->claimOverrideId !== null) {
            try { $overridden = $this->claimOverrides->consume($this->claimOverrideId, $target, $candidateHash); }
            catch (Throwable $e) { return $this->result('rejected', $this->overrideFailure($e), $candidateHash); }
        }
        if ($noul >= self::FORBIDDEN_CLAIMS_THRESHOLD && !$overridden) {
            if ($this->onBlockedCandidate !== null) { ($this->onBlockedCandidate)($candidate); }
            return $this->result('rejected', 'forbidden_claims', $candidateHash);
        }
        try {
            if ($this->cancelled()) { return $this->result('rejected', 'generation_cancelled', $candidateHash); }
            if ($this->claimOverrideId !== null) {
                try { $this->claimOverrides->assertAvailable($this->previewRoot); }
                catch (Throwable $e) { return $this->result('rejected', $this->overrideFailure($e), $candidateHash); }
                if (!$this->ledger->isHealthy()) { return $this->result('rejected', 'ledger_unavailable', $candidateHash); }
            }
            if (!$this->unchanged($path, $absolute, $originalHash)) {
                return $this->result('rejected', 'content_changed', $candidateHash);
            }
            if ($modified === $original) {
                return $this->result('unchanged', 'identical_candidate', $candidateHash);
            }
            // First FileManager interaction. Exact write bypasses legacy normalization/autofix.
            $writer = ($this->writerFactory)();
            if (!$writer instanceof FileManager) {
                throw new RuntimeException('Invalid writer');
            }
            $writer->writeGovernedFile($path, $originalHash, $modified, $absolute);
        } catch (Throwable $e) {
            return $this->result('rejected', $e->getMessage() === 'content_changed' ? 'content_changed' : 'apply_failed', $candidateHash);
        }
        return $this->result('applied', $overridden ? 'accepted_owner_override' : 'accepted', $candidateHash, 1);
    }

    private function overrideFailure(Throwable $error): string
    {
        return in_array($error->getMessage(), ['governor_configuration', 'override_forbidden', 'override_invalid'], true)
            ? $error->getMessage() : 'override_unavailable';
    }

    private function read(string $path): string
    {
        $content = file_get_contents($path, false, null, 0, 512001);
        if ($content === false || strlen($content) > 512000) {
            throw new RuntimeException('invalid_target');
        }
        return $content;
    }

    private function cancelled(): bool
    {
        return $this->isCancelled !== null && ($this->isCancelled)();
    }

    private function unchanged(string $path, string $absolute, string $expectedHash): bool
    {
        try {
            return GovernedFilePath::resolve($this->previewRoot, $path) === $absolute
                && hash_equals($expectedHash, hash('sha256', $this->read($absolute)));
        } catch (Throwable) {
            return false;
        }
    }

    private function isLiteralHeading(array $tokens, int $offset, int $length): bool
    {
        $cursor = 0;
        $html = '';
        $insideHtml = false;
        foreach ($tokens as $token) {
            $text = is_array($token) ? $token[1] : $token;
            $inline = is_array($token) && $token[0] === T_INLINE_HTML;
            if ($inline && $offset >= $cursor && $offset + $length <= $cursor + strlen($text)) {
                $insideHtml = true;
            }
            // Preserve offsets and HTML context across PHP islands without executing PHP.
            $html .= $inline ? $text : str_repeat(' ', strlen($text));
            $cursor += strlen($text);
        }
        if (!$insideHtml) { return false; }
        preg_match_all('/<!--[\s\S]*?(?:-->|$)|<(script|style|textarea|title|template)\b[^>]*>[\s\S]*?(?:<\/\1\s*>|$)/i', $html, $ignored, PREG_OFFSET_CAPTURE);
        foreach ($ignored[0] as [$span, $start]) {
            if ($offset >= $start && $offset < $start + strlen($span)) { return false; }
        }
        // A heading-shaped string inside another tag's quoted attribute is not a target.
        preg_match_all('/<\/?[a-z][a-z0-9:-]*(?:[^<>"\x27]|"[^"]*"|\x27[^\x27]*\x27)*>/i', $html, $tags, PREG_OFFSET_CAPTURE);
        foreach ($tags[0] as [$tag, $start]) {
            if ($offset > $start && $offset < $start + strlen($tag)) { return false; }
        }
        return true;
    }

    private function result(string $status, string $reason, ?string $candidateHash = null, int $changed = 0): array
    {
        return ['status' => $status, 'reason' => $reason, 'candidate_hash' => $candidateHash, 'files_changed' => $changed];
    }
}
