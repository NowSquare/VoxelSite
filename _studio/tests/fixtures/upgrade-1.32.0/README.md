# Legacy bootstrap fixture

`bootstrap.php` is copied byte-for-byte from product release 1.32.0, commit
`479d3560473db6681941ba4e4b49d07b8e72c3dc`, path `_studio/engine/bootstrap.php`.
SHA-256: `5653af7ce563edea73cbf9114c4fc494d7922fef9bd19777fa20c83d0e863e42`.

The updater in that release's `_studio/api/endpoints/update.php` iterates ZIP
entries in archive order and writes each destination immediately. It does not
stage the whole update or install a maintenance gate first. `BootstrapUpgradeTest`
starts with these legacy bytes, then writes the current bootstrap, MCP endpoint,
and public form handler before copying the newly introduced gate. Requests in
that intermediate state must return HTTP 503 before loading replaceable code.

This is an upgrade-order regression fixture, not a claim that every legacy
installation has completed release-package qualification.

`AgentAuth.php` and `migrations/001` through `013` are also byte-identical copies
from that commit. `runtime-sha256.json` pins each source. The REST and publication
upgrade suites execute these migrations in a disposable SQLite database, issue
keys with the frozen authentication class in a separate process, then replace
it with the current runtime and run all remaining migrations. No installed
database, credential, configuration or generated website is used.
