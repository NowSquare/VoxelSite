# D1 REST business route evidence

The expanded `McpBusinessRestRoutesTest.php` passes 58 combined adapter and actual HTTP checks on PHP 8.2.35 and 8.5.7, with one lint per runtime, no diagnostics and zero trapped provider/Router attempts. Every run uses a disposable outer source copy and isolated databases. No product code changed for this route coverage.

Actual HTTP requests now cover public-only `list_forms`; Action discovery, availability, creation, stable create retry, changed-input refusal, capacity refusal, cancellation and stable cancellation retry; exact persisted record identity/data/source/status; form/Action inbox filters and the retained `action_` selector; bounded mixed cursor traversal with no duplicate records; and refusal of changed cursor filters or contradictory selectors. Existing form mutation/version and account/scope checks remain intact.

These are production REST router calls, separate from the direct-adapter checks included by the suite. Exact hashes and retained logs are in [the JSON record](2026-10-23-d1-business-rest.json).
