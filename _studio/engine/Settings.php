<?php

declare(strict_types=1);

namespace VoxelSite;

/**
 * Key-value settings store backed by the `settings` table.
 *
 * All values are JSON-encoded in the database for type flexibility.
 * get() returns the decoded PHP value (string, int, bool, array, null).
 * set() accepts any JSON-serializable value and encodes it.
 *
 * Settings are the central configuration mechanism — site name,
 * AI provider config, publishing preferences, and system state
 * all live here instead of in scattered config files.
 */
class Settings
{
    private Database $db;

    /** @var array<string, mixed>|null In-memory cache for the current request */
    private ?array $cache = null;

    public function __construct(?Database $db = null)
    {
        $this->db = $db ?? Database::getInstance();
    }

    /**
     * Get a setting value by key.
     *
     * Returns the decoded value, or $default if the key doesn't exist.
     * The first call loads all settings into memory — subsequent calls
     * are pure cache reads. This is fine because settings change
     * infrequently and the table is small.
     *
     * @param mixed $default Returned when key is not found
     */
    public function get(string $key, mixed $default = null): mixed
    {
        $all = $this->getAll();

        if (!array_key_exists($key, $all)) {
            return $default;
        }

        return $all[$key];
    }

    /**
     * Set a setting value.
     *
     * Uses upsert — creates the key if it doesn't exist, updates if
     * it does. Invalidates the in-memory cache so the next get()
     * reads fresh data.
     */
    public function set(string $key, mixed $value): void
    {
        $now = gmdate('Y-m-d\TH:i:s\Z');

        $this->db->upsert('settings', [
            'key'        => $key,
            'value'      => json_encode($value),
            'updated_at' => $now,
        ], 'key');

        // Invalidate cache so next read is fresh
        $this->cache = null;
    }

    /**
     * Set multiple settings at once inside a transaction.
     *
     * @param array<string, mixed> $values Key => value pairs
     */
    public function setMany(array $values): void
    {
        $this->db->transaction(function () use ($values) {
            foreach ($values as $key => $value) {
                $this->set($key, $value);
            }
        });
    }

    /**
     * Get all settings as a flat associative array.
     *
     * Values are JSON-decoded. The full table is loaded once per
     * request and cached. With ~20 settings rows, this is a single
     * fast query that eliminates N+1 lookups.
     *
     * @return array<string, mixed>
     */
    public function getAll(): array
    {
        if ($this->cache !== null) {
            return $this->cache;
        }

        $rows = $this->db->query('SELECT key, value FROM settings');

        $this->cache = [];
        foreach ($rows as $row) {
            $this->cache[$row['key']] = json_decode($row['value'], true);
        }

        return $this->cache;
    }

    /**
     * Check if a setting key exists in the database.
     */
    public function has(string $key): bool
    {
        return array_key_exists($key, $this->getAll());
    }

    /**
     * Delete a setting by key.
     */
    public function delete(string $key): void
    {
        $this->db->delete('settings', 'key = ?', [$key]);
        $this->cache = null;
    }

    /**
     * Clear the in-memory cache.
     *
     * Useful after bulk operations or during testing.
     */
    public function clearCache(): void
    {
        $this->cache = null;
    }
}
