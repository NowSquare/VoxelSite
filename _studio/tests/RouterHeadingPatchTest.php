<?php

declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/vendor/autoload.php';
require_once __DIR__ . '/helpers/RouterHeadingFixture.php';

use VoxelSite\Database;
use VoxelSite\FileManager;
use VoxelSite\StagedHeadingPatch;
use VoxelSite\Tests\RouterHeadingFixture as Fixture;
use VoxelSite\Tests\HeadingFakeProvider;

$passed = 0;
$errors = [];
function check(bool $condition, string $message): void
{
    global $passed, $errors;
    if ($condition) { $passed++; } else { $errors[] = $message; }
}
function finish(): never
{
    global $passed, $errors;
    foreach ($errors as $message) { echo "FAIL: {$message}\n"; }
    echo "Passed: {$passed}\nFailed: " . count($errors) . "\n";
    exit($errors === [] ? 0 : 1);
}

$fixture = Fixture::manifest();
check($fixture['release_target'] === '1.31.0', 'Frozen release target');
check(class_exists(StagedHeadingPatch::class), 'StagedHeadingPatch contract must exist');
if (!class_exists(StagedHeadingPatch::class)) { finish(); }

class HeadingWriteProbe extends FileManager
{
    public int $writes = 0;
    public function writeGovernedFile(string $path, string $expectedHash, string $content, string $expectedAbsolutePath): void
    {
        $this->writes++;
        parent::writeGovernedFile($path, $expectedHash, $content, $expectedAbsolutePath);
    }
    public function writeFile(string $relativePath, string $content): ?string
    {
        throw new RuntimeException('Legacy autofix/write path is forbidden for heading proof');
    }
    public function compileTailwind(): array
    {
        throw new RuntimeException('CSS compile is forbidden for heading proof');
    }
}

$db = Database::getInstance(':memory:');
$cases = $fixture['cases'] + [
    'initial_hash_wrong' => ['initial_hash' => str_repeat('0', 64), 'expected' => 'rejected', 'reason' => 'content_changed'],
    'candidate_too_long' => ['candidate' => str_repeat('a', 201), 'expected' => 'rejected', 'reason' => 'invalid_candidate'],
    'candidate_multiline' => ['candidate' => "Hello\nWorld", 'expected' => 'rejected', 'reason' => 'invalid_candidate'],
    'generator_interrupted' => ['generator_fails' => true, 'expected' => 'rejected', 'reason' => 'generation_failed'],
    'path_not_allowlisted' => ['file_path' => 'other.php', 'expected' => 'rejected', 'reason' => 'invalid_target'],
    'path_traversal' => ['file_path' => '../index.php', 'expected' => 'rejected', 'reason' => 'invalid_target'],
    'gate_out_of_range' => ['noul' => 1.1, 'expected' => 'rejected', 'reason' => 'gate_invalid'],
    'gate_object_answer' => ['gate' => 'object_answer', 'expected' => 'rejected', 'reason' => 'gate_invalid'],
    'gate_object_nested' => ['gate' => 'object_nested', 'expected' => 'rejected', 'reason' => 'gate_invalid'],
    'gate_nan' => ['noul' => NAN, 'expected' => 'rejected', 'reason' => 'gate_invalid'],
    'gate_string_probability' => ['noul' => '0.1', 'expected' => 'rejected', 'reason' => 'gate_invalid'],
    'drift_at_writer_boundary' => ['mutation' => 'edit_in_writer_factory', 'expected' => 'rejected', 'reason' => 'content_changed'],
    'unrelated_same_file_edit' => ['mutation' => 'edit_other_text_during_gate', 'expected' => 'rejected', 'reason' => 'content_changed'],
    'literal_heading_only' => ['mutation' => 'heading_in_php_string', 'expected' => 'rejected', 'reason' => 'invalid_target'],
    'comment_across_php' => ['mutation' => 'comment_across_php', 'expected' => 'rejected', 'reason' => 'invalid_target'],
    'script_across_php' => ['mutation' => 'script_across_php', 'expected' => 'rejected', 'reason' => 'invalid_target'],
    'writer_root_mismatch' => ['mutation' => 'writer_root_mismatch', 'expected' => 'rejected', 'reason' => 'apply_failed'],
    'heading_in_comment' => ['mutation' => 'heading_in_comment', 'expected' => 'rejected', 'reason' => 'invalid_target'],
    'heading_in_script' => ['mutation' => 'heading_in_script', 'expected' => 'rejected', 'reason' => 'invalid_target'],
    'invalid_php' => ['mutation' => 'invalid_php', 'expected' => 'rejected', 'reason' => 'invalid_target'],
    'symlink_target' => ['mutation' => 'symlink', 'expected' => 'rejected', 'reason' => 'invalid_target'],
    'escaped_copy' => ['candidate' => 'Bread & butter', 'expected' => 'applied'],
];
foreach ($cases as $name => $case) {
    $root = Fixture::create();
    $outside = tempnam(sys_get_temp_dir(), 'governor-outside-');
    $otherRoot = Fixture::create();
    $otherBefore = Fixture::snapshot($otherRoot);
    $previousPreview = getenv('VS_TEST_PREVIEW_DIR');
    $previousAssets = getenv('VS_TEST_ASSETS_DIR');
    try {
        $target = $fixture['target'];
        $target['file_path'] = $case['file_path'] ?? $target['file_path'];
        $target['content_hash'] = $case['initial_hash'] ?? $target['content_hash'];
        $file = $root . '/' . $target['file_path'];
        $anchor = $fixture['target']['source_address'];
        $mutation = $case['mutation'] ?? '';
        if ($mutation === 'duplicate_heading') { file_put_contents($file, "\n" . $anchor, FILE_APPEND); }
        if ($mutation === 'remove_heading') { file_put_contents($file, str_replace($anchor, '', file_get_contents($file))); }
        if ($mutation === 'heading_in_php_string') { file_put_contents($file, '<?php $text = ' . var_export($anchor, true) . ';'); }
        if ($mutation === 'comment_across_php') { file_put_contents($file, '<!-- <?php $x = 1; ?> ' . $anchor . ' -->'); }
        if ($mutation === 'script_across_php') { file_put_contents($file, '<script>let x = <?php echo 1; ?>; let html = `' . $anchor . '`;</script>'); }
        if ($mutation === 'heading_in_comment') { file_put_contents($file, '<!-- ' . $anchor . ' -->'); }
        if ($mutation === 'heading_in_script') { file_put_contents($file, '<script>const html = `' . $anchor . '`;</script>'); }
        if ($mutation === 'invalid_php') { file_put_contents($file, "<?php broken ( ?>\n" . $anchor); }
        if ($mutation === 'symlink') { copy($file, $outside); unlink($file); symlink($outside, $file); }
        $before = Fixture::snapshot($root);
        $intervening = null;
        $provider = new HeadingFakeProvider($case['candidate'] ?? $fixture['accepted_candidate']);
        $provider->fail = $case['generator_fails'] ?? false;
        $factoryCalls = 0;
        $gateCalls = 0;
        $writer = null;
        $events = [];
        $provider->duringChunk = function () use ($root, $before, &$factoryCalls, &$events, $name): void {
            check($factoryCalls === 0, $name . ': no FileManager during generation');
            check(Fixture::snapshot($root) === $before, $name . ': no site mutation during generation');
            $events[] = 'chunk';
        };
        $gate = function (array $state) use ($root, $before, $case, $mutation, $file, $fixture, &$factoryCalls, &$gateCalls, &$events, &$intervening, $name): mixed {
            $gateCalls++;
            $events[] = 'gate';
            check($factoryCalls === 0, $name . ': no FileManager before acceptance');
            check(Fixture::snapshot($root) === $before, $name . ': gate sees unchanged site including CSS/AEO sentinels');
            check($state['trusted_facts'] === $fixture['trusted_facts'], $name . ': trusted facts supplied');
            check($state['candidate_hash'] === hash('sha256', $state['candidate']), $name . ': candidate hash exact');
            check(!isset($state['file_content']), $name . ': no full page in gate state');
            if (($case['gate'] ?? '') === 'throw') { throw new RuntimeException('Offline'); }
            if (($case['gate'] ?? '') === 'object_answer') { return (object) ['answers' => []]; }
            if (($case['gate'] ?? '') === 'object_nested') { return ['answers' => (object) ['forbidden_claims' => ['noul' => 0.1]]]; }
            if (($case['gate'] ?? '') === 'missing_noul') { return ['answers' => []]; }
            if (in_array($mutation, ['edit_during_gate', 'edit_other_text_during_gate'], true)) {
                $intervening = $mutation === 'edit_during_gate'
                    ? str_replace('Discover our freshly baked sourdough every morning', 'A human changed this heading', file_get_contents($file))
                    : str_replace('Visit the bakery', 'A human changed the CTA', file_get_contents($file));
                file_put_contents($file, $intervening);
            }
            return ['answers' => ['forbidden_claims' => ['noul' => $case['noul'] ?? 0.1]]];
        };
        putenv('VS_TEST_PREVIEW_DIR=' . $root);
        putenv('VS_TEST_ASSETS_DIR=' . $root . '/assets');
        $factory = function () use ($db, &$writer, &$factoryCalls, &$events, $mutation, $file, &$intervening, $otherRoot): FileManager {
            $factoryCalls++;
            $events[] = 'writer';
            if ($mutation === 'edit_in_writer_factory') {
                $intervening = str_replace('Visit the bakery', 'Late human edit', file_get_contents($file));
                file_put_contents($file, $intervening);
            }
            if ($mutation === 'writer_root_mismatch') { putenv('VS_TEST_PREVIEW_DIR=' . $otherRoot); }
            return $writer = new HeadingWriteProbe($db);
        };
        $patch = new StagedHeadingPatch($root, ['index.php', 'bakery/index.php'], $provider, $gate, $factory);
        $result = $patch->execute($target, $fixture['prompt'], $fixture['trusted_facts']);
        check($result['status'] === $case['expected'], $name . ': expected ' . $case['expected'] . ', got ' . json_encode($result));
        if (isset($case['reason'])) { check($result['reason'] === $case['reason'], $name . ': rejection reason'); }
        if ($case['expected'] === 'applied') {
            $expectedHeading = str_replace('Fresh sourdough, every morning', htmlspecialchars($case['candidate'] ?? $fixture['accepted_candidate'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'), $fixture['expected_heading']);
            $original = file_get_contents(__DIR__ . '/fixtures/router-heading/site/' . $target['file_path']);
            check(file_get_contents($file) === str_replace($anchor, $expectedHeading, $original), $name . ': only addressed heading text changed');
            $after = Fixture::snapshot($root);
            unset($after[$target['file_path']], $before[$target['file_path']]);
            check($after === $before, $name . ': unrelated files byte-identical, no extra files');
            check($factoryCalls === 1 && $writer->writes === 1, $name . ': exactly one accepted FileManager apply');
            check(array_slice($events, -2) === ['gate', 'writer'], $name . ': gate precedes apply');
        } elseif ($intervening !== null) {
            check(file_get_contents($file) === $intervening, $name . ': intervening human edit preserved');
            check($result['files_changed'] === 0, $name . ': no governed write on drift');
        } else {
            check(Fixture::snapshot($root) === $before, $name . ': rejection leaves entire site untouched');
            check($factoryCalls === ($mutation === 'writer_root_mismatch' ? 1 : 0), $name . ': writer only constructed after acceptance');
        }
        if (in_array($result['reason'], ['invalid_target', 'missing_address', 'ambiguous_address', 'content_changed'], true) && $intervening === null) {
            check(count($provider->calls) === 0, $name . ': no generator for invalid/stale target');
        }
        check(Fixture::snapshot($otherRoot) === $otherBefore, $name . ': alternate root untouched');
        if ($result['reason'] === 'invalid_candidate') { check($gateCalls === 0, $name . ': invalid candidate never reaches gate'); }
    } catch (Throwable $e) {
        check(false, $name . ': unexpected ' . $e::class . ' ' . $e->getMessage());
    } finally {
        putenv($previousPreview === false ? 'VS_TEST_PREVIEW_DIR' : 'VS_TEST_PREVIEW_DIR=' . $previousPreview);
        putenv($previousAssets === false ? 'VS_TEST_ASSETS_DIR' : 'VS_TEST_ASSETS_DIR=' . $previousAssets);
        Fixture::remove($root);
        Fixture::remove($otherRoot);
        unlink($outside);
    }
}
finish();
