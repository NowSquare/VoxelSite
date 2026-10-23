<?php
declare(strict_types=1);
use VoxelSite\{Database, SiteWorkspace, StudioConfigurationService};
use VoxelSite\Agent\{OperationActor, OperationException};

$method = $_REQUEST['_route_method']; $path = $_REQUEST['_route_path'];
$db = Database::getInstance();
$configuration = new StudioConfigurationService($db, new SiteWorkspace($db));
$actor = new OperationActor('user', (int) ($_REQUEST['_user']['id'] ?? 0), null, [], 'studio_configured', null);
try {
    if ($method === 'GET' && str_starts_with($path, '/ai/conversations/')) {
        $input = ['conversation_id' => (string) ($_REQUEST['_route_params']['id'] ?? ''),
            'limit' => min(50, max(1, (int) ($_GET['limit'] ?? 50))),
            'max_bytes' => min(65536, max(8192, (int) ($_GET['max_bytes'] ?? 65536)))];
        if (isset($_GET['offset'])) $input['offset'] = (int) $_GET['offset'];
        jsonResponse(['ok' => true, 'data' => $configuration->diagnostics->conversation($actor, (object) $input)]); return;
    }
    if ($method === 'GET' && in_array($path, ['/ai/history', '/ai/conversations', '/ai/diagnostics'], true)) {
        $input = ['limit' => min(50, max(1, (int) ($_GET['limit'] ?? 20)))];
        if ($path === '/ai/history') {
            $input['max_bytes'] = min(65536, max(4096, (int) ($_GET['max_bytes'] ?? 65536)));
            if (isset($_GET['before_id'])) $input['before_id'] = (int) $_GET['before_id'];
            $data = $configuration->diagnostics->history($actor, (object) $input);
        } elseif ($path === '/ai/conversations') {
            if (isset($_GET['offset'])) $input['offset'] = (int) $_GET['offset'];
            $data = $configuration->diagnostics->conversations($actor, (object) $input);
        } else $data = $configuration->diagnostics->system($actor);
        jsonResponse(['ok' => true, 'data' => $data]); return;
    }
    if ($method === 'GET' && $path === '/settings') {
        jsonResponse(['ok' => true, 'data' => $configuration->readSettings($actor)]); return;
    }
    if ($method === 'GET' && $path === '/settings/system') {
        $system = $configuration->diagnostics->system($actor);
        $system += ['version' => trim((string) file_get_contents(dirname(__DIR__, 3) . '/VERSION')),
            'max_upload' => formatBytes($system['upload_max_bytes']), 'max_execution' => $system['max_execution_seconds']];
        jsonResponse(['ok' => true, 'data' => ['system' => $system]]); return;
    }
    if ($method === 'GET' && $path === '/settings/mail') {
        $read = $configuration->settings->read($actor, (object) ['group' => 'mail']); $config = [];
        foreach ((array) $read['values'] as $key => $value) $config[str_replace('.', '_', substr($key, 5))] = $value;
        $config['smtp_password'] = $read['configured']->{'mail.smtp.password'} ? '••••••••' : '';
        jsonResponse(['ok' => true, 'data' => ['config' => $config, 'version' => $read['version'], 'presets' => \VoxelSite\Mailer::SMTP_PRESETS]]); return;
    }
    if ($method === 'GET' && $path === '/settings/usage') {
        $read = $configuration->diagnostics->usage($actor, (object) ['all_users' => ($_REQUEST['_user']['role'] ?? '') === 'owner']);
        $models = []; $totals = ['request_count' => 0, 'total_input_tokens' => 0, 'total_output_tokens' => 0, 'total_cost' => 0];
        foreach ($read['models'] as $row) {
            $model = ['ai_model' => $row['model'], 'request_count' => $row['requests'], 'total_input_tokens' => $row['input_tokens'],
                'total_output_tokens' => $row['output_tokens'], 'total_cost' => $row['estimated_cost']];
            $models[] = $model; foreach ($totals as $key => $_) $totals[$key] += $model[$key];
        }
        jsonResponse(['ok' => true, 'data' => ['models' => $models, 'totals' => $totals]]); return;
    }
    if ($method === 'GET' && $path === '/settings/logs') {
        $input = ['limit' => min(50, max(1, (int) ($_GET['limit'] ?? 50)))];
        foreach (['offset', 'inventory_version'] as $key) if (isset($_GET[$key])) $input[$key] = $key === 'offset' ? (int) $_GET[$key] : $_GET[$key];
        jsonResponse(['ok' => true, 'data' => $configuration->diagnostics->logs($actor, (object) $input)]); return;
    }
    if ($method === 'GET' && $path === '/settings/logs/download') {
        $file = (string) ($_GET['file'] ?? ''); $bytes = $configuration->diagnostics->exportLog($actor, $file);
        header('Content-Type: text/plain; charset=utf-8'); header('Content-Disposition: attachment; filename="redacted-' . $file . '"');
        header('Cache-Control: no-store'); header('X-Content-Type-Options: nosniff'); echo $bytes; return;
    }
    if ($method === 'GET' && $path === '/settings/mail/log') {
        jsonResponse(['ok' => true, 'data' => $configuration->diagnostics->mailLog($actor, (object) ['limit' => 20])]); return;
    }
    if ($method === 'GET' && $path === '/settings/favicon') {
        jsonResponse(['ok' => true, 'data' => $configuration->favicon->read($actor)]); return;
    }
    if ($method === 'GET' && $path === '/settings/prompts') {
        jsonResponse(['ok' => true, 'data' => $configuration->prompts->list($actor)]); return;
    }
    if ($method === 'GET' && $path === '/settings/prompts/content') {
        jsonResponse(['ok' => true, 'data' => $configuration->promptFile($actor, '_prompts/' . (string) ($_GET['path'] ?? ''))]); return;
    }
    if (in_array($method, ['PUT', 'DELETE'], true) && $path === '/settings/prompts/content') {
        $operation = $configuration->savePrompt($actor, getJsonBody(), $method === 'DELETE');
    } elseif ($method === 'PUT' && $path === '/settings') {
        $operation = $configuration->saveSettings($actor, getJsonBody());
    } elseif ($method === 'POST' && $path === '/settings/mail') {
        $operation = $configuration->saveSettings($actor, getJsonBody());
    } elseif ($method === 'POST' && $path === '/settings/mail/test') {
        $body = getJsonBody(); unset($body['checkpoint']);
        $operation = $configuration->settings->testMail($actor, (object) $body);
        if (isset(getJsonBody()['checkpoint']) && $operation['status'] === 'applying') $operation = $configuration->settings->continue($actor, $body['operation_id'], (int) getJsonBody()['checkpoint']);
    } elseif ($method === 'DELETE' && $path === '/settings/logs') {
        $body = getJsonBody(); $checkpoint = $body['checkpoint'] ?? null; unset($body['checkpoint']);
        $operation = $configuration->diagnostics->mutate($actor, 'logs_delete', (object) $body);
        if (is_int($checkpoint) && $operation['status'] === 'applying') $operation = $configuration->diagnostics->continue($actor, $body['operation_id'], $checkpoint);
    } elseif ($path === '/settings/favicon' && in_array($method, ['POST', 'DELETE'], true)) {
        $body = getJsonBody(); $id = StudioConfigurationService::operationId($body); $version = $body['version'] ?? '';
        if (!is_string($version) || (isset($body['checkpoint']) && !is_int($body['checkpoint']))) {
            throw new OperationException('invalid_schema', 'Provide the reviewed favicon version and an integer checkpoint.');
        }
        $bytes = null;
        if ($method === 'POST') {
            if (!is_string($body['content_base64'] ?? null) || strlen($body['content_base64']) > 699052
                || ($bytes = base64_decode($body['content_base64'], true)) === false) throw new OperationException('invalid_schema', 'Provide a bounded ICO upload.');
        }
        $operation = $configuration->favicon->updateBytes($actor, $id, $version, $bytes);
        if (isset($body['checkpoint']) && $operation['status'] === 'applying') $operation = $configuration->favicon->continue($actor, $id, (int) $body['checkpoint']);
    } elseif (($method === 'POST' && in_array($path, ['/ai/repair-generation', '/ai/cancel-interrupted'], true))
        || ($method === 'DELETE' && $path === '/ai/history')) {
        $body = getJsonBody(); $checkpoint = $body['checkpoint'] ?? null; unset($body['checkpoint']);
        // HTTP decoding produces arrays; preserve nested entry object semantics.
        $input = json_decode(json_encode($body, JSON_THROW_ON_ERROR), false, 32, JSON_THROW_ON_ERROR);
        $action = match ($path) { '/ai/repair-generation' => 'repair', '/ai/cancel-interrupted' => 'cancel', default => 'history_delete' };
        $operation = $configuration->diagnostics->mutate($actor, $action, $input);
        if (is_int($checkpoint) && $operation['status'] === 'applying') $operation = $configuration->diagnostics->continue($actor, $body['operation_id'], $checkpoint);
    } else {
        jsonResponse(['ok' => false, 'error' => ['code' => 'not_found', 'message' => 'Configuration endpoint not found.']], 404); return;
    }
    $ok = in_array($operation['status'], ['applying', 'succeeded'], true);
    jsonResponse(['ok' => $ok, 'data' => ($operation['result'] ?? []) + ['operation' => $operation],
        'error' => $ok ? null : ($operation['result']['error'] ?? ['code' => $operation['status'], 'message' => 'This configuration change needs attention.'])],
        $operation['status'] === 'applying' ? 202 : ($ok ? 200 : 409));
} catch (OperationException $error) {
    jsonResponse(['ok' => false, 'error' => ['code' => $error->errorCode, 'message' => $error->getMessage(), 'details' => $error->details]],
        match ($error->errorCode) { 'permission_denied' => 403, 'not_found' => 404, 'invalid_schema', 'invalid_path', 'size_limit' => 422, default => 409 });
}
