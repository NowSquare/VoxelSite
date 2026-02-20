<?php

declare(strict_types=1);

namespace VoxelSite;

use RuntimeException;

/**
 * Schema migration runner.
 *
 * Reads migration files from _studio/engine/migrations/, compares
 * their version against the stored schema_version setting, and
 * executes any that are newer — in order, inside a transaction.
 *
 * Migration files return an array with 'version', 'description',
 * 'up' (callable), and 'down' (callable). The 'down' function
 * exists for development rollback but is never auto-executed
 * in production.
 */
class Migrator
{
    private Database $db;
    private Settings $settings;
    private string $migrationsPath;

    public function __construct(?Database $db = null, ?Settings $settings = null)
    {
        $this->db = $db ?? Database::getInstance();
        $this->settings = $settings ?? new Settings($this->db);
        $this->migrationsPath = dirname(__DIR__) . '/engine/migrations';
    }

    /**
     * Run all pending migrations.
     *
     * Discovers migration files, filters to those newer than
     * the current schema version, and executes them in order.
     * Each migration runs inside a transaction — if it fails,
     * the database stays at the last successful version.
     *
     * @return array{applied: string[], current_version: string}
     */
    public function run(): array
    {
        $currentVersion = $this->getCurrentVersion();
        $migrations = $this->discoverMigrations();
        $applied = [];

        foreach ($migrations as $migration) {
            if (version_compare($migration['version'], $currentVersion, '<=')) {
                continue;
            }

            $this->db->transaction(function () use ($migration) {
                ($migration['up'])($this->db);
                $this->settings->set('schema_version', $migration['version']);
            });

            $applied[] = $migration['version'] . ': ' . $migration['description'];
        }

        return [
            'applied'         => $applied,
            'current_version' => $this->settings->get('schema_version', '0.0.0'),
        ];
    }

    /**
     * Get the current schema version from settings.
     *
     * Returns '0.0.0' if no version is set (fresh install before
     * any migration has run). This means the initial migration
     * (version 1.0.0) will always run on a fresh database.
     */
    public function getCurrentVersion(): string
    {
        try {
            return $this->settings->get('schema_version', '0.0.0') ?? '0.0.0';
        } catch (\Throwable) {
            // Settings table doesn't exist yet (first-ever run)
            return '0.0.0';
        }
    }

    /**
     * Discover and load all migration files, sorted by filename.
     *
     * Files are named like 001_initial_schema.php, 002_add_revisions.php.
     * The numeric prefix determines execution order. Each file must
     * return an array with version, description, up, and down keys.
     *
     * @return array<int, array{version: string, description: string, up: callable, down: callable}>
     */
    private function discoverMigrations(): array
    {
        $files = glob($this->migrationsPath . '/*.php');
        if ($files === false || empty($files)) {
            return [];
        }

        sort($files); // Lexicographic sort ensures numeric order

        $migrations = [];
        foreach ($files as $file) {
            $migration = require $file;

            if (!is_array($migration) || !isset($migration['version'], $migration['up'])) {
                throw new RuntimeException(
                    "Invalid migration file: {$file}. Must return array with 'version' and 'up' keys."
                );
            }

            $migrations[] = $migration;
        }

        return $migrations;
    }
}
