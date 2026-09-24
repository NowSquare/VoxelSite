<?php
declare(strict_types=1);

namespace VoxelSite;

interface TypeSafeClientInterface
{
    /** Typed routing answers or a safe failure; no generation or file operations. */
    public function evaluate(array $state, array $questions): array;
}
