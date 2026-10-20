<?php
declare(strict_types=1);
namespace VoxelSite;

/** One cooperating website writer at a time, including background generation. */
final class SiteMutationLock
{
    private static array $locks = [];
    private function __construct(private string $path) {}

    public static function acquire(?string $path = null): self
    {
        $path ??= getenv('VS_TEST_MUTATION_LOCK') ?: dirname(__DIR__) . '/data/site-mutation.lock';
        if (isset(self::$locks[$path])) {
            self::$locks[$path]['count']++;
            return new self($path);
        }
        if (!is_dir(dirname($path)) && !mkdir(dirname($path), 0755, true)) {
            throw new \RuntimeException('Cannot create website lock directory.');
        }
        $handle = fopen($path, 'c');
        if (!$handle || !flock($handle, LOCK_EX | LOCK_NB)) {
            if ($handle) { fclose($handle); }
            throw new \RuntimeException('Another website change is in progress. Wait for it to finish and try again.');
        }
        self::$locks[$path] = ['handle' => $handle, 'count' => 1];
        return new self($path);
    }

    public function __destruct()
    {
        if (!isset(self::$locks[$this->path])) { return; }
        if (--self::$locks[$this->path]['count'] === 0) {
            $handle = self::$locks[$this->path]['handle'];
            flock($handle, LOCK_UN);
            fclose($handle);
            unset(self::$locks[$this->path]);
        }
    }
}
