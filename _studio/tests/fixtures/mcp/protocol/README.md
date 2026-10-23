# Studio MCP protocol fixtures

These fixtures exercise the PHP adapter against pinned official wire contracts.
They are synthetic tests, not evidence that Claude, ChatGPT, Codex or any other
named client has completed connection and workflow qualification.

Run `php _studio/tests/McpProtocolTest.php`. The test creates a temporary SQLite
database; it does not read or modify the installed site database or generated
site files. No outbound HTTP transport is used.

The adapter supports JSON responses to Streamable HTTP POSTs. The modern
2026-07-28 profile implements `server/discover`, required request metadata and
mirrored headers, result discriminators, and private zero-TTL discovery caches.
The 2025-11-25 compatibility profile handles `initialize`, the initialized
notification, and `ping`. It does not allocate optional HTTP session IDs.
Both profiles provide authorization-filtered `tools/list` and `tools/call`.

No resources, prompts, subscriptions, tasks, SSE, sampling, elicitation, OAuth
discovery or list-change notifications are advertised. Only custom bearer
authentication is implemented. Named-client qualification remains pending.

`_studio/mcp.php` fails closed until `config.json` contains
`studio_mcp.enabled: true` and the trusted `Agent\McpApplication` integration
factory exists. The factory contract is
`create(Database $db, array $config): McpServer`; it binds the real catalog,
handler resolver, actor policy and saved allowed origins. The request's Host
and forwarded headers must never supply that origin allowlist.
