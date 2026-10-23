# Asset management and reference imports — local evidence

Validated on 2026-10-20 against disposable SQLite databases and private draft/live roots. This is local service evidence, not a production hosting qualification or recorded external-client lifecycle.

## Implemented behavior

- `AssetManagementService` lists the private asset inventory, inspects static dependencies, and prepares folder, metadata, move/rename, same-path replacement, and deletion intents. Empty folders and asset identities/metadata live in the revisioned `assets/data/asset-catalog.json`.
- Move and replacement plans retain exact affected references with source file, line, original URL, and replacement URL. Moves preserve bytes and asset identity; relative references, query suffixes, CSS URLs, JavaScript string URLs, and JSON slash escapes are preserved. Deleting a referenced file requires an existing replacement.
- The shared asset planner cannot gain structure/SEO authority. Form references require `forms:read`; modifying a form reference also requires `forms:write`. Retained reviews recheck those permissions. Private form submissions, notes, inbox data, and Studio files are outside the inventory.
- Studio and legacy REST asset endpoints delegate to private staged uploads, retained change reviews, revision capture, and the common apply/recovery executor. Stable request IDs replay upload, metadata, and deletion results without duplicating revisions. REST credentials require an explicit owner-established account binding and a narrowed asset purpose.
- Asset reads no longer generate thumbnails or write public assets. The Studio asset grid and lightbox use authenticated preview URLs. Deletes send the loaded content hash and show actionable conflicts.
- The shared canonical upload validator supports the previous ICO, Markdown, Word (`doc`/`docx`), and Excel (`xls`/`xlsx`) formats alongside existing image, font, document, and media types. ICO directory/image bounds, Office ZIP package/main-content matching, and compound-file FAT/directory/stream bounds are checked. Encrypted Office documents, macros, embedded objects, executable entries, traversal, and inconsistent containers are rejected. Valid Office code samples containing literal PHP text are retained as inert document content.
- `PublicReferenceFetcher` verifies every redirect destination, checks all DNS answers for private/local/reserved addresses, pins a selected public IP in cURL, disables proxies and automatic redirects, validates TLS, and limits response bytes, headers, redirects, MIME, and elapsed HTTP time. `SiteImporter` uses it for page and robots reads. `ReferenceImportService` returns bounded, explicitly untrusted text/base64 data without installing files or calling a model.

## Verification

| Check | Result |
| --- | ---: |
| `McpAssetsAndImportTest.php` | 62 passed |
| `McpAssetDocumentTest.php` | 27 passed |
| `McpAssetTransferTest.php` | 41 passed, 0 failures |
| `McpSitePathTest.php` | 30 passed |
| `McpChangeSetTest.php` | 38 passed |
| `McpSiteStructureTest.php` | 58 passed |
| `McpActorPolicyTest.php` | 36 passed, 0 failures |
| `SiteImporterTest.php` | 91 passed, 0 failures |

PHP syntax checks and the edited asset view's Node syntax check passed. The lead rebuilt the shipped Studio bundle after the UI changes. The focused suites cover current-scope revocation, read-only inventory, unchanged live bytes, normalized upload attachment, same-name replacement, lost-response replay, escaped JSON references, private redirects, DNS rebinding, incomplete/oversize downloads, Office family spoofing, malformed FAT/mini-streams, and code-sample preservation.

## Explicit limits

- Reference inspection is static. Dynamic PHP/JavaScript expressions and remote references are not evaluated. Direct mentions outside supported URL syntax stop a move rather than silently rewrite an uncertain expression.
- Managed paths use the shared ASCII canonical path contract. Upload filenames are normalized; explicit moves reject spaces and encoded paths.
- Uploads advertise the smaller of installation and PHP limits (default installation cap 10 MiB), and complete drafts retain the shared 500-file / 32 MiB limits. Office package inspection also has explicit entry, expansion, XML, and stream bounds. These are structural checks, not a malware scanner or a guarantee that every Office feature can be opened by every desktop application.
- cURL address pinning is required. The HTTP deadline is bounded; native `dns_get_record` uses the host resolver's timeout before the elapsed-deadline check can run. DNS interruption behavior remains a hosting qualification item.
- No external page was fetched during these automated tests; injected transports supplied adversarial responses. No public asset or live website was changed.

The compound-file and workbook checks follow Microsoft's [Compound File Header](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-cfb/05060311-bfce-4b12-874d-71fd4ce63aea), [BOF record](https://learn.microsoft.com/en-us/openspecs/office_file_formats/ms-xls/4d6a3d1e-d7c5-405f-bbae-d01e9cb79366), and [FilePass record](https://learn.microsoft.com/en-us/openspecs/office_file_formats/ms-xls/cf9ae8d5-4e8c-40a2-95f1-3b31f16b5529) specifications.
