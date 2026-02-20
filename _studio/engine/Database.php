<?php

declare(strict_types=1);

namespace VoxelSite;

use PDO;
use PDOException;
use PDOStatement;
use RuntimeException;

/**
 * SQLite database singleton with WAL mode and convenience methods.
 *
 * This is the foundation of all Studio data access. SQLite is chosen
 * deliberately: zero-config for shared hosting buyers, single file,
 * no daemon process. WAL mode gives concurrent read performance
 * without the complexity of a database server.
 *
 * Every query uses parameterized statements. No exceptions.
 */
class Database
{
    private static ?Database $instance = null;
    private PDO $pdo;

    /**
     * Private constructor — use Database::getInstance() instead.
     *
     * Configures PDO with:
     * - WAL journal mode for concurrent reads
     * - Foreign keys enforced (SQLite disables them by default)
     * - Exception error mode (fail loud, never silently)
     * - 5-second busy timeout for lock contention
     */
    private function __construct(string $dbPath)
    {
        $dir = dirname($dbPath);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        try {
            $this->pdo = new PDO("sqlite:{$dbPath}", null, null, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);

            // WAL mode: allows concurrent reads while writing
            $this->pdo->exec('PRAGMA journal_mode = WAL');

            // Enforce foreign key constraints (SQLite ignores them by default)
            $this->pdo->exec('PRAGMA foreign_keys = ON');

            // 5-second busy timeout before raising SQLITE_BUSY
            $this->pdo->exec('PRAGMA busy_timeout = 5000');
        } catch (PDOException $e) {
            throw new RuntimeException(
                "Could not connect to database at {$dbPath}: {$e->getMessage()}"
            );
        }
    }

    /**
     * Get the singleton database instance.
     *
     * On first call, creates the connection. Subsequent calls return
     * the same instance. The database file is created automatically
     * by SQLite if it doesn't exist.
     */
    public static function getInstance(?string $dbPath = null): self
    {
        if (self::$instance === null) {
            $path = $dbPath ?? self::defaultPath();
            self::$instance = new self($path);
        }

        return self::$instance;
    }

    /**
     * Default database path: _studio/data/studio.db
     */
    private static function defaultPath(): string
    {
        return dirname(__DIR__) . '/data/studio.db';
    }

    /**
     * Get the underlying PDO instance for advanced operations.
     */
    public function getPdo(): PDO
    {
        return $this->pdo;
    }

    /**
     * Execute a query and return all matching rows.
     *
     * @param string $sql    SQL with named or positional placeholders
     * @param array  $params Values to bind
     * @return array<int, array<string, mixed>> Array of associative arrays
     */
    public function query(string $sql, array $params = []): array
    {
        $stmt = $this->execute($sql, $params);
        return $stmt->fetchAll();
    }

    /**
     * Execute a query and return the first matching row, or null.
     */
    public function queryOne(string $sql, array $params = []): ?array
    {
        $stmt = $this->execute($sql, $params);
        $row = $stmt->fetch();
        return $row !== false ? $row : null;
    }

    /**
     * Execute a query and return a single scalar value, or null.
     * Useful for COUNT(), MAX(), etc.
     */
    public function scalar(string $sql, array $params = []): mixed
    {
        $stmt = $this->execute($sql, $params);
        $value = $stmt->fetchColumn();
        return $value !== false ? $value : null;
    }

    /**
     * Insert a row and return the last insert ID.
     *
     * @param string               $table   Table name
     * @param array<string, mixed> $data    Column => value pairs
     * @return int The auto-incremented ID
     */
    public function insert(string $table, array $data): int
    {
        $columns = implode(', ', array_keys($data));
        $placeholders = implode(', ', array_fill(0, count($data), '?'));

        $sql = "INSERT INTO {$table} ({$columns}) VALUES ({$placeholders})";
        $this->execute($sql, array_values($data));

        return (int) $this->pdo->lastInsertId();
    }

    /**
     * Update rows matching a WHERE clause. Returns affected row count.
     *
     * @param string               $table  Table name
     * @param array<string, mixed> $data   Column => new value pairs
     * @param string               $where  WHERE clause (without "WHERE")
     * @param array                $params Values to bind in the WHERE clause
     */
    public function update(string $table, array $data, string $where, array $params = []): int
    {
        $setClauses = [];
        $values = [];
        foreach ($data as $column => $value) {
            $setClauses[] = "{$column} = ?";
            $values[] = $value;
        }

        $sql = "UPDATE {$table} SET " . implode(', ', $setClauses) . " WHERE {$where}";
        $stmt = $this->execute($sql, array_merge($values, $params));

        return $stmt->rowCount();
    }

    /**
     * Delete rows matching a WHERE clause. Returns affected row count.
     */
    public function delete(string $table, string $where, array $params = []): int
    {
        $sql = "DELETE FROM {$table} WHERE {$where}";
        $stmt = $this->execute($sql, $params);

        return $stmt->rowCount();
    }

    /**
     * Insert or update (upsert) based on a conflict column.
     *
     * Uses SQLite's ON CONFLICT DO UPDATE. The conflict column
     * is typically the primary key or a unique-constrained column.
     *
     * @param string               $table          Table name
     * @param array<string, mixed> $data           Column => value pairs
     * @param string               $conflictColumn Column that triggers the conflict
     */
    public function upsert(string $table, array $data, string $conflictColumn): int
    {
        $columns = implode(', ', array_keys($data));
        $placeholders = implode(', ', array_fill(0, count($data), '?'));

        $updateClauses = [];
        foreach (array_keys($data) as $col) {
            if ($col !== $conflictColumn) {
                $updateClauses[] = "{$col} = excluded.{$col}";
            }
        }

        $sql = "INSERT INTO {$table} ({$columns}) VALUES ({$placeholders})";
        if (!empty($updateClauses)) {
            $sql .= " ON CONFLICT({$conflictColumn}) DO UPDATE SET " . implode(', ', $updateClauses);
        } else {
            $sql .= " ON CONFLICT({$conflictColumn}) DO NOTHING";
        }

        $this->execute($sql, array_values($data));

        return (int) $this->pdo->lastInsertId();
    }

    /**
     * Count rows matching an optional WHERE clause.
     */
    public function count(string $table, string $where = '1=1', array $params = []): int
    {
        $sql = "SELECT COUNT(*) FROM {$table} WHERE {$where}";
        return (int) $this->scalar($sql, $params);
    }

    /**
     * Run raw SQL (DDL, PRAGMA, etc.) without returning results.
     */
    public function exec(string $sql): void
    {
        $this->pdo->exec($sql);
    }

    /**
     * Begin a transaction. Returns false if already in one.
     */
    public function beginTransaction(): bool
    {
        return $this->pdo->beginTransaction();
    }

    /**
     * Commit the current transaction.
     */
    public function commit(): bool
    {
        return $this->pdo->commit();
    }

    /**
     * Roll back the current transaction.
     */
    public function rollBack(): bool
    {
        return $this->pdo->rollBack();
    }

    /**
     * Run a callback inside a transaction.
     *
     * If the callback throws, the transaction is rolled back and
     * the exception re-thrown. Otherwise, the transaction is committed
     * and the callback's return value is returned.
     *
     * @template T
     * @param callable(): T $callback
     * @return T
     */
    public function transaction(callable $callback): mixed
    {
        $this->beginTransaction();

        try {
            $result = $callback();
            $this->commit();
            return $result;
        } catch (\Throwable $e) {
            $this->rollBack();
            throw $e;
        }
    }

    /**
     * Prepare and execute a parameterized statement.
     *
     * Every database interaction funnels through this method,
     * ensuring consistent error handling and parameterization.
     */
    private function execute(string $sql, array $params = []): PDOStatement
    {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            throw new RuntimeException(
                "Database query failed: {$e->getMessage()} — SQL: {$sql}"
            );
        }
    }

    /**
     * Reset the singleton (for testing only).
     */
    public static function resetInstance(): void
    {
        self::$instance = null;
    }

    /**
     * Close the database connection and reset the singleton.
     *
     * Unlike resetInstance(), this explicitly closes the PDO connection
     * to release file locks before the garbage collector runs.
     * Required before deleting the database file (e.g., factory reset).
     */
    public static function closeInstance(): void
    {
        if (self::$instance !== null) {
            // PDO closes on null assignment, releasing the SQLite lock
            unset(self::$instance->pdo);
            self::$instance = null;
        }
    }
}
