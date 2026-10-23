<?php
declare(strict_types=1);

namespace VoxelSite\Agent;

/**
 * Request-bounded JSON responses over Streamable HTTP, with no resident process,
 * protocol sessions, SSE stream, sampling, prompts, resources or tasks.
 * Durable domain operations use explicit tool handles, independently of MCP.
 */
final class McpServer
{
    public const MAX_BODY_BYTES = 2 * 1024 * 1024;
    private \Closure $handlerResolver;
    private array $allowedOrigins;
    private array $serverInfo;

    /**
     * Origins must come from saved installation configuration, never Host or
     * forwarded headers supplied by the request. An empty list denies browsers;
     * native clients that omit Origin remain eligible for bearer authentication.
     */
    public function __construct(
        private CapabilityRegistry $registry,
        private ActorPolicy $policy,
        callable $handlerResolver,
        array $allowedOrigins = [],
        string $version = 'development',
        private int $maxBodyBytes = self::MAX_BODY_BYTES,
        private ?\Closure $requestGate = null,
        private ?ConnectionTelemetry $telemetry = null,
    ) {
        if ($maxBodyBytes < 1 || $maxBodyBytes > self::MAX_BODY_BYTES) throw new \InvalidArgumentException('Invalid body limit.');
        foreach ($allowedOrigins as $origin) {
            if (!is_string($origin) || self::origin($origin) === null) throw new \InvalidArgumentException('Invalid allowed origin.');
        }
        $this->allowedOrigins = array_map(self::origin(...), $allowedOrigins);
        $this->handlerResolver = \Closure::fromCallable($handlerResolver);
        $this->serverInfo = ['name' => 'VoxelSite Studio', 'version' => $version];
    }

    /**
     * The authentication callback receives a bearer token and returns an
     * api_key OperationActor. No session/cookie fallback exists here.
     *
     * @return array{status:int,headers:array<string,string>,body:array|null}
     */
    public function handle(string $method, array $headers, string $body, callable $authenticate): array
    {
        $authenticatedActor=null;
        $response=ProviderCallPolicy::runExternal(function () use ($method, $headers, $body, $authenticate, &$authenticatedActor): array {
            $normalized = [];
            foreach ($headers as $name => $value) {
                $name = strtolower((string) $name);
                if (!preg_match("/^[!#$%&'*+.^_`|~0-9a-z-]+$/D", $name)
                    || !is_string($value) || isset($normalized[$name])
                    || strlen($value) > 8192 || preg_match('/[\x00-\x08\x0a-\x1f\x7f]/', $value)) {
                    return $this->error(400, -32600, 'Malformed HTTP headers.');
                }
                $normalized[$name] = $value;
            }
            $headers = $normalized;
            if (isset($headers['origin'])) {
                $origin = self::origin($headers['origin']);
                if ($origin === null || !in_array($origin, $this->allowedOrigins, true)) {
                    return $this->error(403, -32600, 'This request origin is not allowed.');
                }
            }
            if ($method !== 'POST') return $this->error(405, -32600, 'Use HTTP POST.', null, null, ['Allow' => 'POST']);
            if (strlen($body) > $this->maxBodyBytes
                || (isset($headers['content-length']) && (!ctype_digit($headers['content-length'])
                    || (float) $headers['content-length'] > $this->maxBodyBytes))) {
                return $this->error(413, -32600, 'The request body exceeds this endpoint’s limit.');
            }
            if (strtolower(trim(explode(';', $headers['content-type'] ?? '')[0])) !== 'application/json') {
                return $this->error(415, -32600, 'Use Content-Type: application/json.');
            }
            if (!$this->accepts($headers['accept'] ?? '', 'application/json')
                || !$this->accepts($headers['accept'] ?? '', 'text/event-stream')) {
                return $this->error(406, -32600, 'Accept must include application/json and text/event-stream.');
            }
            if (!preg_match('/^Bearer ([A-Za-z0-9._~+\/-]+=*)$/iD', $headers['authorization'] ?? '', $match)) {
                return $this->unauthorized();
            }
            try {
                $actor = $authenticate($match[1]);
                if (!$actor instanceof OperationActor || $actor->type !== 'api_key' || $actor->providerPolicy !== 'forbidden') {
                    return $this->unauthorized();
                }
                $this->policy->require($actor, []);
                $authenticatedActor=$actor;
            } catch (OperationException $e) {
                if ($e->errorCode === 'rate_limited') {
                    $retry = max(1, min(3600, (int) ($e->details['retry_after'] ?? 60)));
                    return $this->error(429, -32600, 'Too many requests. Wait before retrying.', null, null, ['Retry-After' => (string) $retry]);
                }
                if(isset($actor) && $actor instanceof OperationActor && $actor->type==='api_key')
                    $this->telemetry?->rejectedCredential($actor->credentialId);
                return $this->unauthorized();
            } catch (\Throwable) {
                return $this->error(500, -32603, 'The connection could not be authenticated.');
            }

            try { $request = json_decode($body, false, 64, JSON_THROW_ON_ERROR); }
            catch (\JsonException) { return $this->error(400, -32700, 'Invalid JSON.'); }
            if (!$request instanceof \stdClass || ($request->jsonrpc ?? null) !== '2.0'
                || !is_string($request->method ?? null) || $request->method === '' || strlen($request->method) > 128
                || property_exists($request, 'result') || property_exists($request, 'error')
                || (property_exists($request, 'id') && !is_string($request->id) && !is_int($request->id))) {
                return $this->error(400, -32600, 'Send one JSON-RPC 2.0 request or supported notification.');
            }
            $id = $request->id ?? null;
            if (property_exists($request, 'params') && !$request->params instanceof \stdClass) {
                return $this->error(400, -32602, 'Request params must be an object.', $id);
            }
            $params = $request->params ?? new \stdClass();
            if (property_exists($params, '_meta') && !$params->_meta instanceof \stdClass) {
                return $this->error(400, -32602, 'Request metadata must be an object.', $id);
            }
            $bodyVersion = $params->_meta->{ProtocolProfile::VERSION_META} ?? null;
            // initialize is the sole legacy handshake; modern metadata always
            // selects modern per-request semantics, even for an unknown method.
            $initializing = $request->method === 'initialize' && $bodyVersion === null;
            $version = $initializing ? ProtocolProfile::COMPATIBILITY : ($headers['mcp-protocol-version'] ?? null);
            if ($version === null) return $this->error(400, -32020, 'MCP-Protocol-Version is required.', $id);
            if (!in_array($version, ProtocolProfile::versions(), true)) {
                return $this->error(400, -32022, 'Unsupported protocol version.', $id,
                    ['supported' => ProtocolProfile::versions(), 'requested' => $version]);
            }
            if ($bodyVersion !== null && $bodyVersion !== $version) {
                return $this->error(400, -32020, 'Protocol version header and metadata do not match.', $id);
            }
            if ($bodyVersion !== null && $version === ProtocolProfile::COMPATIBILITY) {
                return $this->error(400, -32602, 'This compatibility profile uses initialize, not per-request protocol metadata.', $id);
            }
            $profile = new ProtocolProfile($version);
            if (($error = $profile->validate($request, $headers)) !== null) {
                return $this->error(400, $error['code'], $error['message'], $id);
            }
            if ($id === null) {
                // Never dispatch a tool invocation without a request ID.
                if (!$profile->modern() && $request->method === 'notifications/initialized') {
                    return $this->response(202);
                }
                return $this->error(400, -32600, 'This notification is not supported.');
            }
            try {
                if ($this->requestGate!==null) ($this->requestGate)($actor,$request->method,$params);
                switch ($request->method) {
                    case 'initialize':
                        if ($profile->modern()) break;
                        return $this->success($id, [
                            'protocolVersion' => ProtocolProfile::COMPATIBILITY,
                            'capabilities' => $this->capabilities(), 'serverInfo' => $this->serverInfo,
                        ]);
                    case 'ping':
                        if ($profile->modern()) break;
                        return $this->success($id, []);
                    case 'server/discover':
                        if (!$profile->modern()) break;
                        return $this->success($id, $profile->result([
                            'supportedVersions' => ProtocolProfile::versions(),
                            'capabilities' => $this->capabilities(),
                        ], $this->serverInfo, true));
                    case 'tools/list':
                        if (property_exists($params, 'cursor')) {
                            return $this->error(400, -32602, 'This catalog fits in one response; omit cursor.', $id);
                        }
                        $tools = array_map(static fn (CapabilityDefinition $item): array => $item->tool(),
                            $this->registry->visible($actor, $this->policy));
                        return $this->success($id, $profile->result(['tools' => $tools], $this->serverInfo, true));
                    case 'tools/call':
                        if (!is_string($params->name ?? null) || $params->name === ''
                            || (property_exists($params, 'arguments') && !$params->arguments instanceof \stdClass)
                            || property_exists($params, 'task') || property_exists($params, 'inputResponses')
                            || property_exists($params, 'requestState')) {
                            return $this->error(400, -32602, 'Provide a tool name and arguments object; task and input requests are not supported.', $id);
                        }
                        return $this->callTool($id, $params, $profile, $actor);
                }
                return $this->error($profile->modern() ? 404 : 200, -32601, 'Method not found.', $id);
            } catch (OperationException $e) {
                if ($e->errorCode==='rate_limited') {
                    return $this->error(429,-32600,$e->getMessage(),$id,null,
                        ['Retry-After'=>(string)max(1,min(3600,(int)($e->details['retry_after']??60)))]);
                }
                if($e->errorCode==='permission_denied')$this->recordDenial($actor,$request->method,$params,$e);
                return $this->error(403, -32600, 'This connection no longer has the required access.', $id);
            } catch (\Throwable) {
                return $this->error(500, -32603, 'The request could not be completed.', $id);
            }
        });
        $result=(array)($response['body']['result']??[]);
        if($authenticatedActor!==null && $response['status']>=200 && $response['status']<300
            && !isset($response['body']['error']) && ($result['isError']??false)!==true) {
            $this->telemetry?->used($authenticatedActor);
        }
        return $response;
    }

    private function callTool(string|int $id, \stdClass $params, ProtocolProfile $profile, OperationActor $actor): array
    {
        try {
            $value = $this->registry->dispatch($params->name, $params->arguments ?? new \stdClass(),
                $actor, $this->policy, $this->handlerResolver);
            $value = (object) $value;
            $result = ['content' => [['type' => 'text', 'text' => json_encode($value, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES)]],
                'structuredContent' => $value, 'isError' => false];
        } catch (OperationException $e) {
            if ($e->errorCode === 'unknown_tool') return $this->error(400, -32602, 'Unknown tool.', $id);
            if ($e->errorCode === 'permission_denied') {
                $this->recordDenial($actor,'tools/call',$params,$e);
                return $this->error(403, -32600, 'This connection does not have the required access.', $id);
            }
            $result = ['content' => [['type' => 'text', 'text' => json_encode([
                'error' => ['code' => $e->errorCode, 'message' => $e->getMessage(), 'details' => (object) $e->details],
            ], JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES)]], 'isError' => true];
        } catch (ProviderCallForbidden) {
            $result = ['content' => [['type' => 'text', 'text' => 'This operation cannot call a VoxelSite-managed AI provider.']], 'isError' => true];
        }
        return $this->success($id, $profile->result($result, $this->serverInfo));
    }

    private function recordDenial(OperationActor $actor,string $method,\stdClass $params,OperationException $error):void
    {
        if($this->telemetry===null)return;
        $target=$method;
        if($method==='tools/call') {
            if(!is_string($params->name??null))return;
            try { $target=$this->registry->get($params->name); }
            catch(OperationException){return;}
        }
        $this->telemetry->permissionDenied($actor,$target,
            is_array($error->details['required_scopes']??null)?$error->details['required_scopes']:null);
    }

    private function capabilities(): array
    {
        return ['tools' => new \stdClass()];
    }

    private function unauthorized(): array
    {
        // Custom bearer authentication only; this is not an OAuth discovery claim.
        return $this->error(401, -32600, 'A valid Studio MCP bearer credential is required.', null, null,
            ['WWW-Authenticate' => 'Bearer realm="VoxelSite Studio MCP"']);
    }

    private function success(string|int $id, array $result): array
    {
        return $this->response(200, ['jsonrpc' => '2.0', 'id' => $id, 'result' => (object) $result]);
    }

    private function error(int $status, int $code, string $message, string|int|null $id = null,
        ?array $data = null, array $headers = []): array
    {
        $body = ['jsonrpc' => '2.0', 'error' => ['code' => $code, 'message' => $message]];
        if ($id !== null) $body['id'] = $id;
        if ($data !== null) $body['error']['data'] = (object) $data;
        return $this->response($status, $body, $headers);
    }

    private function response(int $status, ?array $body = null, array $headers = []): array
    {
        return ['status' => $status, 'headers' => array_merge([
            'Cache-Control' => 'no-store', 'X-Content-Type-Options' => 'nosniff',
        ], $body === null ? [] : ['Content-Type' => 'application/json; charset=utf-8'], $headers), 'body' => $body];
    }

    private function accepts(string $accept, string $type): bool
    {
        foreach (explode(',', strtolower($accept)) as $range) {
            $parts = array_map('trim', explode(';', $range));
            if ($parts[0] !== $type) continue;
            $quality = 1.0;
            foreach (array_slice($parts, 1) as $parameter) {
                if (str_starts_with($parameter, 'q=')) $quality = (float) substr($parameter, 2);
            }
            if ($quality > 0 && $quality <= 1) return true;
        }
        return false;
    }

    private static function origin(string $origin): ?string
    {
        if (preg_match('/[\s,\\\\]/', $origin)) return null;
        $url = parse_url($origin);
        if ($url === false || !isset($url['scheme'], $url['host'])
            || !in_array(strtolower($url['scheme']), ['https', 'http'], true)
            || isset($url['user']) || isset($url['pass'])
            || isset($url['query']) || isset($url['fragment']) || isset($url['path'])) return null;
        $scheme = strtolower($url['scheme']);
        $port = $url['port'] ?? ($scheme === 'https' ? 443 : 80);
        return $scheme . '://' . strtolower($url['host']) . ':' . $port;
    }
}
