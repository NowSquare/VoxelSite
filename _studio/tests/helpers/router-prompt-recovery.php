<?php
declare(strict_types=1);
namespace VoxelSite {
    final class Database {
        public static function getInstance(): self { return new self(); }
        public function query(string $sql, array $params): array { return [['id' => 1]]; }
        public function update(...$args): void { $GLOBALS['probe']['updates']++; }
    }
    final class Settings { public function __construct(Database $db) {} }
    final class RouterShadow {
        public function __construct(Database $db, Settings $settings) {}
        public function checkConfiguration(): string {
            $mode = $GLOBALS['argv'][2];
            if (in_array($mode, ['missing_key', 'invalid_mode'], true)) { throw new \RuntimeException('governor_configuration'); }
            return $mode;
        }
    }
    final class Logger { public static function warning(...$args): void {} }
    final class FileManager {
        public function __construct() { $GLOBALS['probe']['writers']++; }
        public function ensureStyleCssExists(): void { $GLOBALS['probe']['styles']++; }
        public function compileTailwind(): void { $GLOBALS['probe']['compiles']++; }
    }
    final class PromptEngine { public function execute(array $request): void { $GLOBALS['probe']['dispatches']++; } }
}
namespace {
    function getJsonBody(): array { return ['user_prompt' => 'What is the site name?']; }
    $GLOBALS['probe'] = ['updates' => 0, 'writers' => 0, 'styles' => 0, 'compiles' => 0, 'dispatches' => 0];
    $_REQUEST = ['_route_method' => 'POST', '_route_path' => '/ai/prompt', '_user' => ['id' => 1]];
    require dirname(__DIR__, 2) . '/api/endpoints/ai.php';
    echo json_encode($GLOBALS['probe'], JSON_THROW_ON_ERROR);
}
