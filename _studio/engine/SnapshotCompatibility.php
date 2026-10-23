<?php
declare(strict_types=1);

/** Existing Studio/extension function API delegates to the shared service. */
function snapshotArchiveDomains(string $path): array { return \VoxelSite\LegacySnapshotService::snapshotArchiveDomains($path); }
function createSnapshot(\VoxelSite\Database $db, string $snapshotDir, string $previewDir, string $assetsDir, string $type, string $label = '', string $description = '', bool $enforceLimit = true): array
{ return \VoxelSite\LegacySnapshotService::createSnapshot($db, $snapshotDir, $previewDir, $assetsDir, $type, $label, $description, $enforceLimit); }
function addDirectoryToZip(\ZipArchive $zip, string $dir, string $zipPrefix): int { return \VoxelSite\LegacySnapshotService::addDirectoryToZip($zip, $dir, $zipPrefix); }
function restoreSnapshot(string $zipPath, string $previewDir, string $assetsDir): array { return \VoxelSite\LegacySnapshotService::restoreSnapshot($zipPath, $previewDir, $assetsDir); }
function canWriteSnapshotEntry(string $baseDir, string $relativePath): bool { return \VoxelSite\LegacySnapshotService::canWriteSnapshotEntry($baseDir, $relativePath); }
function isSafeSnapshotRelativePath(string $path): bool { return \VoxelSite\LegacySnapshotService::isSafeSnapshotRelativePath($path); }
function writeSnapshotEntry(string $baseDir, string $relativePath, string $content): bool { return \VoxelSite\LegacySnapshotService::writeSnapshotEntry($baseDir, $relativePath, $content); }
function clearDirectory(string $dir, array $keepExtensions = []): void { \VoxelSite\LegacySnapshotService::clearDirectory($dir, $keepExtensions); }
function enforceSnapshotLimit(\VoxelSite\Database $db, \VoxelSite\Settings $settings, string $snapshotDir, array $currentIds = []): void { \VoxelSite\LegacySnapshotService::enforceSnapshotLimit($db, $settings, $snapshotDir, $currentIds); }
