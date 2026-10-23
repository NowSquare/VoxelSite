<?php
declare(strict_types=1);
namespace VoxelSite;

/** Pure navigation transformations shared by Studio and reviewed external edits. */
final class SiteStructureTransforms
{
    public static function remove(array $navLinks, string $targetHref): array
    {
        // Search root level
        foreach ($navLinks as $i => $entry) {
            if ($entry['href'] === $targetHref) {
                $children = $entry['children'] ?? [];
                // Splice: remove this entry, insert its children at the same position
                array_splice($navLinks, $i, 1, $children);
                return ['removed' => true, 'promoted' => count($children), 'navLinks' => $navLinks];
            }
        }

        // Search children of root entries
        foreach ($navLinks as $i => $entry) {
            if (!empty($entry['children'])) {
                foreach ($entry['children'] as $j => $child) {
                    if ($child['href'] === $targetHref) {
                        // Children of a nested entry cannot be further nested (depth-1 model),
                        // so they are promoted to the parent entry's children array
                        $grandchildren = $child['children'] ?? [];
                        array_splice($navLinks[$i]['children'], $j, 1, $grandchildren);

                        // Clean up empty children array
                        if (empty($navLinks[$i]['children'])) {
                            unset($navLinks[$i]['children']);
                        }

                        return ['removed' => true, 'promoted' => count($grandchildren), 'navLinks' => $navLinks];
                    }
                }
            }
        }

        return ['removed' => false, 'promoted' => 0, 'navLinks' => $navLinks];
    }

    public static function relocate(array $navLinks, string $oldHref, string $newHref, ?string $newParentHref): array
    {
        // Step 1: Extract the entry from its current position (preserve label + children)
        $extracted = null;

        // Search root level
        foreach ($navLinks as $i => $entry) {
            if ($entry['href'] === $oldHref) {
                $extracted = $entry;
                array_splice($navLinks, $i, 1);
                break;
            }
        }

        // Search children of root entries
        if ($extracted === null) {
            foreach ($navLinks as $i => $entry) {
                if (!empty($entry['children'])) {
                    foreach ($entry['children'] as $j => $child) {
                        if ($child['href'] === $oldHref) {
                            $extracted = $child;
                            array_splice($navLinks[$i]['children'], $j, 1);
                            if (empty($navLinks[$i]['children'])) {
                                unset($navLinks[$i]['children']);
                            }
                            break 2;
                        }
                    }
                }
            }
        }

        if ($extracted === null) {
            // Entry not found in nav — nothing to relocate
            return ['navLinks' => $navLinks, 'status' => 'not_found'];
        }

        // Step 2: Update the href
        $extracted['href'] = $newHref;

        // Step 3: Insert at the correct new position
        if ($newParentHref === null) {
            // Move to root level — append at end
            $navLinks[] = $extracted;
            return ['navLinks' => $navLinks, 'status' => 'relocated'];
        } else {
            // Move under a parent entry
            foreach ($navLinks as $i => $entry) {
                if ($entry['href'] === $newParentHref) {
                    // Navigation renders one child level. Descendant pages stay
                    // routable, but must not become invisible third-level data
                    // that falsely appears navigable in the page projection.
                    unset($extracted['children']);
                    if (!isset($navLinks[$i]['children'])) {
                        $navLinks[$i]['children'] = [];
                    }
                    $navLinks[$i]['children'][] = $extracted;
                    return ['navLinks' => $navLinks, 'status' => 'relocated'];
                }
            }

            // Parent not found in nav — entry becomes nav-hidden
            // (don't orphan at root; that would contradict the filesystem hierarchy)
            return ['navLinks' => $navLinks, 'status' => 'removed'];
        }
    }
}
