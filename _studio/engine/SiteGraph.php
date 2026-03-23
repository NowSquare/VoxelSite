<?php

declare(strict_types=1);

namespace VoxelSite;

/**
 * VoxelSite Site Control — In-Memory Site Graph (SC-001)
 *
 * Pure data structure: nodes + edges + query methods.
 * Zero I/O. No database, no file system.
 *
 * Node shape:   ['id' => string, 'type' => string, 'label' => string, 'meta' => array]
 * Edge shape:   ['source' => string, 'target' => string, 'type' => string, 'meta' => array]
 *
 * Node types:   page, partial, component (reserved), route, asset, form, token, revision (reserved)
 * Edge types:   includes, links_to, consumes_token, serves, embeds_form, embeds_asset
 *
 * Node ID convention (file-path-anchored):
 *   page:{file_path}       → page:about.php
 *   partial:{file_path}    → partial:_partials/footer.php
 *   route:{url_path}       → route:/about
 *   asset:{relative_path}  → asset:assets/css/style.css
 *   form:{action}:{index}  → form:submit.php:0
 *   token:{property_name}  → token:--color-primary
 */
class SiteGraph
{
    /** @var array<string, array{id: string, type: string, label: string, meta: array}> */
    private array $nodes = [];

    /** @var array<string, list<array{source: string, target: string, type: string, meta: array}>> */
    private array $outEdges = [];

    /** @var array<string, list<array{source: string, target: string, type: string, meta: array}>> */
    private array $inEdges = [];

    // ═══════════════════════════════════════════
    //  Build (used by SiteGraphIndexer only)
    // ═══════════════════════════════════════════

    /**
     * Add a node to the graph.
     *
     * @throws \RuntimeException If a node with the same ID already exists.
     */
    public function addNode(string $id, string $type, string $label, array $meta = []): void
    {
        if (isset($this->nodes[$id])) {
            throw new \RuntimeException("Duplicate node ID: {$id}");
        }

        $this->nodes[$id] = [
            'id'    => $id,
            'type'  => $type,
            'label' => $label,
            'meta'  => $meta,
        ];
    }

    /**
     * Add an edge between two existing nodes.
     *
     * @throws \RuntimeException If either the source or target node does not exist.
     */
    public function addEdge(string $source, string $target, string $type, array $meta = []): void
    {
        if (!isset($this->nodes[$source])) {
            throw new \RuntimeException("Edge source node not found: {$source}");
        }
        if (!isset($this->nodes[$target])) {
            throw new \RuntimeException("Edge target node not found: {$target}");
        }

        $edge = [
            'source' => $source,
            'target' => $target,
            'type'   => $type,
            'meta'   => $meta,
        ];

        $this->outEdges[$source][] = $edge;
        $this->inEdges[$target][]  = $edge;
    }

    /**
     * Update a node's meta by merging new values.
     */
    public function updateNodeMeta(string $id, array $mergeData): void
    {
        if (!isset($this->nodes[$id])) {
            return;
        }

        $this->nodes[$id]['meta'] = array_merge($this->nodes[$id]['meta'], $mergeData);
    }

    // ═══════════════════════════════════════════
    //  Read — single node/edge lookups
    // ═══════════════════════════════════════════

    /**
     * Get a single node by ID, or null if not found.
     */
    public function getNode(string $id): ?array
    {
        return $this->nodes[$id] ?? null;
    }

    /**
     * Get all nodes of a given type.
     *
     * @return list<array{id: string, type: string, label: string, meta: array}>
     */
    public function getNodesByType(string $type): array
    {
        $result = [];
        foreach ($this->nodes as $node) {
            if ($node['type'] === $type) {
                $result[] = $node;
            }
        }
        return $result;
    }

    /**
     * Get outgoing edges from a node, optionally filtered by edge type.
     *
     * @return list<array{source: string, target: string, type: string, meta: array}>
     */
    public function getOutEdges(string $nodeId, ?string $edgeType = null): array
    {
        $edges = $this->outEdges[$nodeId] ?? [];
        if ($edgeType === null) {
            return $edges;
        }
        return array_values(array_filter($edges, fn(array $e) => $e['type'] === $edgeType));
    }

    /**
     * Get incoming edges to a node, optionally filtered by edge type.
     *
     * @return list<array{source: string, target: string, type: string, meta: array}>
     */
    public function getInEdges(string $nodeId, ?string $edgeType = null): array
    {
        $edges = $this->inEdges[$nodeId] ?? [];
        if ($edgeType === null) {
            return $edges;
        }
        return array_values(array_filter($edges, fn(array $e) => $e['type'] === $edgeType));
    }

    // ═══════════════════════════════════════════
    //  Graph queries — semantic helpers
    // ═══════════════════════════════════════════

    /**
     * Get direct consumers (pages/partials) that include a given partial.
     * Follows incoming `includes` edges to the partial.
     *
     * @return list<array{id: string, type: string, label: string, meta: array}>
     */
    public function getConsumers(string $partialId): array
    {
        $result = [];
        foreach ($this->getInEdges($partialId, 'includes') as $edge) {
            $node = $this->getNode($edge['source']);
            if ($node !== null) {
                $result[] = $node;
            }
        }
        return $result;
    }

    /**
     * Get direct dependencies (partials) that a page/partial includes.
     * Follows outgoing `includes` edges from the page.
     *
     * @return list<array{id: string, type: string, label: string, meta: array}>
     */
    public function getDependencies(string $pageId): array
    {
        $result = [];
        foreach ($this->getOutEdges($pageId, 'includes') as $edge) {
            $node = $this->getNode($edge['target']);
            if ($node !== null) {
                $result[] = $node;
            }
        }
        return $result;
    }

    /**
     * Get ALL consumers of a node through transitive include chains.
     * BFS from the target node, walking incoming `includes` edges.
     *
     * Example: If page A includes partial B, and partial B includes partial C,
     *          getTransitiveConsumers('partial:C') returns [B, A].
     *
     * @return list<array{id: string, type: string, label: string, meta: array}>
     */
    public function getTransitiveConsumers(string $nodeId): array
    {
        $visited = [];
        $queue = [$nodeId];
        $result = [];

        while (!empty($queue)) {
            $current = array_shift($queue);
            foreach ($this->getInEdges($current, 'includes') as $edge) {
                $sourceId = $edge['source'];
                if (isset($visited[$sourceId])) {
                    continue;
                }
                $visited[$sourceId] = true;

                $node = $this->getNode($sourceId);
                if ($node !== null) {
                    $result[] = $node;
                    $queue[] = $sourceId;
                }
            }
        }

        return $result;
    }

    /**
     * Get pages/partials that link to a given route node.
     * Follows incoming `links_to` edges.
     *
     * @return list<array{id: string, type: string, label: string, meta: array}>
     */
    public function getInboundLinks(string $routeNodeId): array
    {
        $result = [];
        foreach ($this->getInEdges($routeNodeId, 'links_to') as $edge) {
            $node = $this->getNode($edge['source']);
            if ($node !== null) {
                $result[] = $node;
            }
        }
        return $result;
    }

    /**
     * Get nodes that consume a given token.
     * Follows incoming `consumes_token` edges.
     *
     * @return list<array{id: string, type: string, label: string, meta: array}>
     */
    public function getTokenConsumers(string $tokenId): array
    {
        $result = [];
        foreach ($this->getInEdges($tokenId, 'consumes_token') as $edge) {
            $node = $this->getNode($edge['source']);
            if ($node !== null) {
                $result[] = $node;
            }
        }
        return $result;
    }

    /**
     * Compute the blast radius of editing a given node.
     *
     * For a partial: returns all page nodes reachable through transitive
     * include chains. For a page: returns just that page. For a token:
     * returns all nodes that consume the token plus their transitive consumers.
     *
     * @return list<array{id: string, type: string, label: string, meta: array}>
     */
    public function getBlastRadius(string $nodeId): array
    {
        $node = $this->getNode($nodeId);
        if ($node === null) {
            return [];
        }

        if ($node['type'] === 'page') {
            return [$node];
        }

        if ($node['type'] === 'partial') {
            // Get all transitive consumers, then filter to pages only
            $consumers = $this->getTransitiveConsumers($nodeId);
            return array_values(array_filter($consumers, fn(array $n) => $n['type'] === 'page'));
        }

        if ($node['type'] === 'token') {
            // Get direct token consumers, then for each, get its page blast radius
            $directConsumers = $this->getTokenConsumers($nodeId);
            $pages = [];
            $seen = [];
            foreach ($directConsumers as $consumer) {
                if ($consumer['type'] === 'page') {
                    if (!isset($seen[$consumer['id']])) {
                        $pages[] = $consumer;
                        $seen[$consumer['id']] = true;
                    }
                } elseif ($consumer['type'] === 'partial') {
                    foreach ($this->getBlastRadius($consumer['id']) as $page) {
                        if (!isset($seen[$page['id']])) {
                            $pages[] = $page;
                            $seen[$page['id']] = true;
                        }
                    }
                } elseif ($consumer['type'] === 'asset') {
                    // CSS assets affect all pages (global stylesheet)
                    foreach ($this->getNodesByType('page') as $page) {
                        if (!isset($seen[$page['id']])) {
                            $pages[] = $page;
                            $seen[$page['id']] = true;
                        }
                    }
                }
            }
            return $pages;
        }

        // For routes: find the served page
        if ($node['type'] === 'route') {
            $servedEdges = $this->getOutEdges($nodeId, 'serves');
            $pages = [];
            foreach ($servedEdges as $edge) {
                $page = $this->getNode($edge['target']);
                if ($page !== null) {
                    $pages[] = $page;
                }
            }
            return $pages;
        }

        // For assets (e.g. style.css): CSS is global, affects all pages
        if ($node['type'] === 'asset') {
            return $this->getNodesByType('page');
        }

        return [];
    }

    // ═══════════════════════════════════════════
    //  Serialization
    // ═══════════════════════════════════════════

    /**
     * Export the full graph as an array.
     *
     * @return array{nodes: list<array>, edges: list<array>}
     */
    public function toArray(): array
    {
        $allEdges = [];
        foreach ($this->outEdges as $edges) {
            foreach ($edges as $edge) {
                $allEdges[] = $edge;
            }
        }

        return [
            'nodes' => array_values($this->nodes),
            'edges' => $allEdges,
        ];
    }

    /**
     * Get a summary of the graph contents.
     *
     * @return array{pages: int, partials: int, routes: int, tokens: int, forms: int, assets: int, edges: int}
     */
    public function summary(): array
    {
        $counts = [
            'pages'    => 0,
            'partials' => 0,
            'routes'   => 0,
            'tokens'   => 0,
            'forms'    => 0,
            'assets'   => 0,
        ];

        foreach ($this->nodes as $node) {
            match ($node['type']) {
                'page'    => $counts['pages']++,
                'partial' => $counts['partials']++,
                'route'   => $counts['routes']++,
                'token'   => $counts['tokens']++,
                'form'    => $counts['forms']++,
                'asset'   => $counts['assets']++,
                default   => null,
            };
        }

        $edgeCount = 0;
        foreach ($this->outEdges as $edges) {
            $edgeCount += count($edges);
        }
        $counts['edges'] = $edgeCount;

        return $counts;
    }
}
