<?php
declare(strict_types=1);

namespace VoxelSite;

// Isolated Windows filesystem semantics for SiteWorkspacePathTest. No host I/O.
// Native Windows coverage uses the same test without this fixture.
const DIRECTORY_SEPARATOR = '\\';

final class WindowsWorkspaceFilesystem
{
    public static array $directories = [
        'C:/' => true, 'C:/xampp' => true, 'C:/xampp/htdocs' => true,
        'C:/xampp/htdocs/site' => true, 'C:/xampp/htdocs/site/_studio' => true,
        'C:/xampp/htdocs/site/_studio/preview' => true,
        'C:/xampp/htdocs/site/assets' => true,
        '//server/share' => true, '//server/share/site' => true,
    ];
    public static array $links = [];
    public static int $probes = 0;

    public static function key(string $path): string
    {
        $path = str_replace('\\', '/', $path);
        return preg_match('~^[A-Za-z]:/$~D', $path) ? $path : rtrim($path, '/');
    }
}

function file_exists(string $path): bool { return isset(WindowsWorkspaceFilesystem::$directories[WindowsWorkspaceFilesystem::key($path)]); }
function is_dir(string $path): bool { return file_exists($path); }
function is_file(string $path): bool { return false; }
function is_link(string $path): bool
{
    if (++WindowsWorkspaceFilesystem::$probes > 200) throw new \RuntimeException('Ancestor walk did not terminate.');
    return isset(WindowsWorkspaceFilesystem::$links[WindowsWorkspaceFilesystem::key($path)]);
}
function realpath(string $path): string|false
{
    return file_exists($path) ? str_replace('/', '\\', WindowsWorkspaceFilesystem::key($path)) : false;
}
function dirname(string $path, int $levels = 1): string
{
    $path = WindowsWorkspaceFilesystem::key($path);
    for ($i = 0; $i < $levels; $i++) {
        if (preg_match('~^[A-Za-z]:/$~D', $path)) break;
        $path = \dirname($path);
        if (preg_match('~^[A-Za-z]:$~D', $path)) $path .= '/';
    }
    return str_replace('/', '\\', $path);
}
function basename(string $path): string { return \basename(str_replace('\\', '/', $path)); }
