<?php
declare(strict_types=1);
namespace VoxelSite;

/** Small, current context for a selected file; never truncates editable source. */
final class RouterContext
{
    public function __construct(private Database $db, private Settings $settings, private FileManager $files) {}

    public function focused(array $target, int $budget): ?array
    {
        $path = $target['file_path'] ?? null;
        if (!is_string($path)) { return null; }
        $source = $this->files->readFile($path);
        if ($source === null) { return null; }
        $info = ['site_name' => $this->settings->get('site_name', ''), 'site_tagline' => $this->settings->get('site_tagline', '')];
        $parts = ['=== FOCUSED EDIT CONTEXT ===', json_encode($info, JSON_UNESCAPED_UNICODE),
            '=== TARGET FILE: ' . $path . " ===\n" . $source];
        $supportFiles = ['assets/css/style.css', '_partials/header.php', '_partials/nav.php', '_partials/footer.php'];
        // PHP pages often render JSON instead of containing literal copy. Include
        // that source of truth; if it does not fit, use the normal context path.
        $assets = getenv('VS_TEST_ASSETS_DIR') ?: dirname(__DIR__, 2) . '/assets';
        foreach (glob($assets . '/data/*.json') ?: [] as $dataFile) {
            $supportFiles[] = 'assets/data/' . basename($dataFile);
        }
        foreach ($supportFiles as $support) {
            $text = $this->files->readFile($support);
            if ($text !== null) { $parts[] = '=== ' . $support . " ===\n" . $text; }
            if (strlen(implode("\n\n", $parts)) > $budget) { return null; }
        }
        $context = RouterSecrets::redact(implode("\n\n", $parts));
        if ($budget <= 0 || strlen($context) > $budget) { return null; }
        return ['context' => $context, 'metrics' => ['total_chars' => strlen($context), 'budget_chars' => $budget,
            'budget_used_pct' => round(strlen($context) / $budget * 100, 1), 'sections' => ['focused' => strlen($context)],
            'trimmed' => [], 'focus_page_chars' => strlen($source), 'history_chars' => 0]];
    }

    public function readOnly(?array $target, int $budget): string
    {
        if ($target !== null && ($focus = $this->focused($target, $budget)) !== null) { return $focus['context']; }
        $parts = ['=== READ-ONLY SITE CONTEXT ===', 'Site: ' . $this->settings->get('site_name', ''),
            'Tagline: ' . $this->settings->get('site_tagline', '')];
        foreach ($this->db->query("SELECT title, file_path FROM pages WHERE page_type = 'page' ORDER BY id LIMIT 40") as $page) {
            $text = $this->files->readFile($page['file_path']);
            $section = $page['title'] . ' (' . $page['file_path'] . ")\n" . mb_substr(strip_tags($text ?? ''), 0, 3000);
            if (strlen(implode("\n", $parts)) + strlen($section) > $budget) { break; }
            $parts[] = $section;
        }
        return RouterSecrets::redact(implode("\n\n", $parts));
    }
}
