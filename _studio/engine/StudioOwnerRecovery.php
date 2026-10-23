<?php
declare(strict_types=1);
namespace VoxelSite;
use VoxelSite\Agent\{ActionConfiguration, ActionService, ActorPolicy, AdminApprovalStore, ChangeSetExecutor, ChangeSetStore,
    DiagnosticMutationService, DiagnosticsService, FaviconService, OwnerRecoveryService, OperationStore,
    PromptService, PublishPlanService, ReleaseStore, ResetInventory, ResetService, SettingsService};

/** Shared Studio wiring; recovery callbacks consume retained artifacts only. */
final class StudioOwnerRecovery
{
    public static function create(Database $db, SiteWorkspace $workspace, array $config = []): OwnerRecoveryService
    {
        $studio = dirname($workspace->draftRoot()); $data = $studio . '/data'; $private = $data . '/agent';
        $policy = new ActorPolicy($db); $operations = new OperationStore($db, $policy, $workspace->mutationLockPath());
        $history = new WebsiteHistoryService($db, $workspace, $private);
        $changes = new ChangeSetExecutor($db, $policy, $workspace, new ChangeSetStore($db, $policy, $private . '/changes'), $operations);
        $publish = new PublishPlanService($db, $policy, $workspace, new ReleaseStore($db, $policy, $private . '/releases'), $operations);
        $settings = new SettingsService($db, $policy, $workspace, $operations, $config['app_key'] ?? null);
        $prompts = new PromptService($db, $policy, $workspace, $operations);
        $favicon = new FaviconService($db, $policy, $workspace, $operations);
        $diagnostics = new DiagnosticMutationService($db, $policy, $workspace, $operations, $studio . '/logs',
            new DiagnosticsService($db, $policy, $workspace, $operations, appKey: $config['app_key'] ?? null));
        $handlers = [
            'changes.apply' => ['restore' => $changes->restoreForOwnerRecovery(...)],
            'publish.apply' => ['restore' => $publish->restoreForOwnerRecovery(...)],
            'snapshots.create' => ['restore' => $history->snapshots->restoreForOwnerRecovery(...)],
            'snapshots.delete' => ['view' => $history->snapshots->deletions()->recoveryView(...),
                'restore' => $history->snapshots->deletions()->restoreForOwnerRecovery(...)],
            'settings.update' => ['restore' => $settings->restoreForOwnerRecovery(...)],
            'mail.test' => ['action' => 'acknowledge_delivery', 'view' => fn() => [],
                'intent' => fn($op) => self::mailIntent($db, $op),
                'restore' => function ($op) use ($db, $workspace): array {
                    OwnerRecoveryService::assertClaim($db, $workspace, $op);
                    $intent = self::mailIntent($db, $op);
                    return ['acknowledged' => true, 'restored' => false, 'remaining_paths' => [],
                        'recipient' => $intent['recipient'], 'delivery_status' => $intent['delivery_status']];
                }],
        ];
        foreach (['restore.apply', 'revisions.undo', 'revisions.redo', 'designs.load', 'designs.new', 'site.unpublish'] as $kind) {
            $handlers[$kind] = ['restore' => $history->restores->restoreForOwnerRecovery(...)];
        }
        foreach (['designs.save', 'designs.rename', 'designs.delete'] as $kind) $handlers[$kind] = ['restore' => $history->designs->restoreForOwnerRecovery(...)];
        foreach (['prompts.update', 'prompts.reset'] as $kind) $handlers[$kind] = ['restore' => $prompts->restoreForOwnerRecovery(...)];
        foreach (['settings.favicon_update', 'settings.favicon_delete'] as $kind) $handlers[$kind] = ['restore' => $favicon->restoreForOwnerRecovery(...)];
        foreach (['diagnostics.logs_delete', 'diagnostics.history_delete', 'diagnostics.repair', 'diagnostics.cancel'] as $kind) {
            $handlers[$kind] = ['restore' => $diagnostics->restoreForOwnerRecovery(...)];
        }
        foreach (array_keys($handlers) as $kind) if (str_starts_with($kind, 'prompts.') || str_starts_with($kind, 'diagnostics.') || str_starts_with($kind, 'settings.favicon_')) {
            $handlers[$kind]['view'] = fn($op) => self::configurationPaths($db, $workspace, $op);
        }
        if (is_string($config['app_key'] ?? null)) {
            $reset = new ResetService($db, $policy, $workspace, new AdminApprovalStore($db, $policy, $workspace, $config['app_key']),
                $operations, new ResetInventory($db, $workspace, $publish, $studio, $data . '/default-index.php'), $private . '/resets');
            $handlers['site.reset'] = ['view' => $reset->recoveryView(...), 'restore' => $reset->restore(...)];
        }
        $actions = new ActionService($db, $policy, $workspace, getenv('VS_TEST_ACTIONS_DIR') ?: $data . '/actions',
            $workspace->publishedRoot() . '/_data/actions.db', getenv('VS_TEST_ACTION_SITE_DATA_PATH') ?: ActionConfiguration::draftPath($workspace),
            $studio . '/action-templates');
        return new OwnerRecoveryService($db, $policy, $workspace, $operations, $handlers, $actions);
    }

    private static function mailIntent(Database $db, array $op): array
    {
        $row = $db->queryOne('SELECT recipient,state,started_at FROM agent_mail_dispatches WHERE operation_internal_id=?', [$op['id']]);
        return ['recipient' => $row['recipient'] ?? $op['request']['recipient'],
            'delivery_status' => !$row ? 'failed' : ($row['state'] === 'dispatching' ? 'unknown' : $row['state']),
            'started_at' => $row ? (int) $row['started_at'] : null, 'resend' => false];
    }

    private static function configurationPaths(Database $db, SiteWorkspace $workspace, array $op): array
    {
        if (!$op['recovery']) return [];
        $row = $db->queryOne('SELECT payload_json FROM agent_configuration_requests WHERE id=? AND actor_key=? AND operation_id=? AND kind=?',
            [$op['preparation_id'], $op['actor_key'], $op['operation_id'], $op['kind']]);
        if (!is_string($row['payload_json'] ?? null) || strlen($row['payload_json']) > 67108864) throw new \RuntimeException('Invalid retained configuration journal.');
        $payload = json_decode($row['payload_json'], true, 64, JSON_THROW_ON_ERROR); $studio = dirname($workspace->draftRoot());
        if (str_starts_with($op['kind'], 'prompts.')) {
            $files = [$payload['path'] => ['before' => $payload['before'], 'after' => $payload['after']]];
            $root = $studio . '/custom_prompts'; $domain = 'custom_prompts'; $encoded = false;
        } elseif (str_starts_with($op['kind'], 'settings.favicon_')) {
            $files = ['favicon.ico' => $payload]; $root = $workspace->publishedRoot(); $domain = 'published'; $encoded = true;
        } else {
            $files = $payload['files']; $domain = $payload['action'] === 'logs_delete' ? 'logs' : 'draft';
            $root = $domain === 'logs' ? $studio . '/logs' : $workspace->draftRoot(); $encoded = true;
        }
        if (count($files) > 500) throw new \RuntimeException('Too many retained configuration paths.');
        $paths = [];
        foreach ($files as $path => $file) {
            $hash = static fn($value) => $value === null ? null : hash('sha256', $encoded ? base64_decode($value, true) : $value);
            $paths[] = ['domain' => $domain, 'path' => $path, 'before_hash' => $hash($file['before']), 'after_hash' => $hash($file['after']),
                'current_hash' => OwnerRecoveryService::hashPath(SiteWorkspace::resolveWithin($root, $path))];
        }
        return $paths;
    }
}
