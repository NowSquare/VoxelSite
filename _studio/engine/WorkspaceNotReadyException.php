<?php
declare(strict_types=1);
namespace VoxelSite;

/** An actionable private workspace setup condition, distinct from storage failures. */
final class WorkspaceNotReadyException extends \RuntimeException {}
