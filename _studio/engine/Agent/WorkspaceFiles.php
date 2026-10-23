<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\SiteWorkspace;

/** Bounded source inventory used by review, reads and transaction preconditions. */
final class WorkspaceFiles
{
    public const MAX_FILES = 500;
    public const MAX_BYTES = 33554432;
    /** Packaged empty scaffolds only; these are never managed authoring paths. */
    public const SCAFFOLD_PATHS = ['.gitkeep', 'assets/images/.gitkeep', 'assets/files/.gitkeep',
        'assets/fonts/.gitkeep', 'assets/css/.gitkeep', 'assets/js/.gitkeep',
        'assets/data/.gitkeep', 'assets/forms/.gitkeep'];

    public static function read(SiteWorkspace $workspace): array
    {
        $workspace->assertReady();
        $sources = []; $bytes = 0; $entries = 0;
        $walk = function (string $directory,string $prefix='') use (&$walk,&$sources,&$bytes,&$entries,$workspace): void {
            foreach (new \DirectoryIterator($directory) as $entry) {
                if ($entry->isDot()) continue;
                if (++$entries > self::MAX_FILES * 3) self::tooLarge();
                $path = $prefix . $entry->getFilename();
                $absolute = SiteWorkspace::resolveWithin($workspace->draftRoot(),$path);
                if (is_link($absolute)) throw new OperationException('invalid_path','Workspace inventory cannot follow symlinks.');
                $scaffold = in_array($path,self::SCAFFOLD_PATHS,true);
                if (is_dir($absolute) && !$scaffold) {
                    if (substr_count($path,'/') > 10) self::tooLarge();
                    $walk($absolute,$path . '/');
                    continue;
                }
                if ($path === '.htaccess') continue;
                $stat = lstat($absolute);
                if ($stat === false || ($stat['mode'] & 0170000) !== 0100000) throw new OperationException('invalid_path','Workspace entries must be regular files.');
                $emptyScaffold = $scaffold && $stat['size'] === 0;
                if (!$emptyScaffold) SitePathPolicy::canonical($path);
                $bytes += $stat['size'];
                if ((!$emptyScaffold && count($sources) >= self::MAX_FILES) || $bytes > self::MAX_BYTES) self::tooLarge();
                // Check bounds before reading/hashing, and cap the actual read
                // in case a non-cooperating process grows the source meanwhile.
                $content = file_get_contents($absolute,false,null,0,$stat['size']+1);
                clearstatcache(true,$absolute);
                $after = lstat($absolute);
                if ($content === false || strlen($content)!==$stat['size'] || !$after || is_link($absolute)
                    || $after['ino']!==$stat['ino'] || $after['size']!==$stat['size'] || $after['mtime']!==$stat['mtime']) {
                    throw new OperationException('content_conflict','The workspace changed during inventory. Read its current version and try again.');
                }
                // Empty placeholders still consume the scan budget and receive
                // the same no-follow and stable-read checks as source files.
                if ($emptyScaffold) continue;
                $sources[$path] = $content;
            }
        };
        $walk($workspace->draftRoot());
        ksort($sources,SORT_STRING);
        return $sources;
    }

    private static function tooLarge(): never
    {
        throw new OperationException('host_capability_unavailable','This workspace exceeds the qualified preparation budget (500 files, 32 MiB or the directory scan limit). Reduce its size before preparing a change.');
    }

    public static function hashes(array $sources): array
    {
        $hashes = [];
        foreach ($sources as $path=>$content) $hashes[$path] = hash('sha256',$content);
        ksort($hashes,SORT_STRING);
        return $hashes;
    }

    public static function write(string $root, string $relative, string $content): void
    {
        $path = SiteWorkspace::resolveWithin($root,$relative);
        if (!is_dir(dirname($path)) && !mkdir(dirname($path),0700,true)) throw new OperationException('host_capability_unavailable','Cannot create the staged directory.');
        $temporary = tempnam(dirname($path),'.stage-');
        if ($temporary === false) throw new OperationException('host_capability_unavailable','Cannot stage this file.');
        try {
            if (file_put_contents($temporary,$content) !== strlen($content) || !chmod($temporary,0600)
                || !rename($temporary,$path) || hash_file('sha256',$path) !== hash('sha256',$content)) {
                throw new OperationException('host_capability_unavailable','Cannot save and verify staged bytes.');
            }
        } finally { if (is_file($temporary)) unlink($temporary); }
    }
}
