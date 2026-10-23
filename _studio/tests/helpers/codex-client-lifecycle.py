"""Developer-only acceptance driver using the installed Codex MCP client.

Arguments: disposable fixture root, absolute Codex executable. The native client
handles negotiation, HTTP, bearer authentication, discovery and every tool call.
The script supplies deterministic fixture intents; it does not test model-led
authoring or claim that Codex performed a browser visual review.
"""
import base64
import hashlib
import json
import os
from pathlib import Path
import select
import subprocess
import sys
import time

root = Path(sys.argv[1]).resolve()
assert root.name.startswith("vs-mcp-client-") and root.is_dir()
fixture = json.loads((root / "fixture.json").read_text())
codex = sys.argv[2]
version = subprocess.check_output([codex, "--version"], text=True).strip()
env = os.environ.copy()
env["VOXELSITE_FIXTURE_TOKEN"] = (root / "credential.txt").read_text()
client_dir = root / "client"
client_dir.mkdir(exist_ok=True)
config = '{fixture={url=' + json.dumps(fixture["endpoint"]) + ',bearer_token_env_var="VOXELSITE_FIXTURE_TOKEN"}}'
log = (root / "codex-client.stderr").open("w")
p = subprocess.Popen([codex, "-c", "mcp_servers="+config, "app-server", "--stdio"],
    stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=log, env=env,
    cwd=client_dir, text=True, bufsize=1)
seq = 0
calls = []
def request(method, params):
    global seq
    seq += 1
    p.stdin.write(json.dumps({"id": seq, "method": method, "params": params})+"\n")
    p.stdin.flush()
    end = time.monotonic()+45
    while time.monotonic() < end:
        ready, _, _ = select.select([p.stdout], [], [], 1)
        if not ready:
            if p.poll() is not None:
                raise RuntimeError("Codex client exited")
            continue
        line = p.stdout.readline()
        if not line:
            raise RuntimeError("Codex client closed")
        item = json.loads(line)
        if item.get("id") == seq:
            if "error" in item:
                raise RuntimeError(str(item["error"]))
            return item["result"]
    raise RuntimeError("Codex client request timed out: "+method)

def tool(name, arguments=None):
    result = request("mcpServer/tool/call", {"threadId": tid, "server": "fixture",
        "tool": "voxelsite_"+name, "arguments": arguments or {}})
    if result.get("isError"):
        raise RuntimeError(json.dumps(result))
    content = result["structuredContent"]
    calls.append({"tool": name, "status": content.get("status"), "digest": content.get("digest"),
        "operation_id": content.get("operation_id"), "draft_version": content.get("draft_version")})
    return content

def finish(state):
    for _ in range(100):
        if state["status"] != "applying":
            break
        state = tool("operations_continue", {"operation_id": state["operation_id"], "checkpoint": state["checkpoint"]})
    assert state["status"] == "succeeded", state
    return state

try:
    request("initialize", {"clientInfo": {"name": "voxelsite_qualification", "version": "1"},
        "capabilities": {"experimentalApi": True}})
    p.stdin.write('{"method":"initialized"}\n')
    p.stdin.flush()
    thread = request("thread/start", {"cwd": str(client_dir), "ephemeral": True})
    tid = thread["thread"]["id"]
    discovery = request("mcpServerStatus/list", {"threadId": tid, "detail": "toolsAndAuthOnly"})
    (root / "codex-discovery.json").write_text(json.dumps(discovery, indent=2))
    assert tool("site_get")["draft_version"] == "draft:0"
    context = tool("site_context", {"max_bytes": 8192})
    rule = context["rules"][0]
    tool("rules_read", {"action": context["action"], "kind": rule["kind"], "digest": rule["sha256"]})
    brief = tool("authoring_brief", {"request_id": "codex-brief-001", "action": "create_site"})
    source = Path(__file__).resolve().parents[1] / "fixtures/mcp/site-lifecycle/site"
    image = (source / "assets/images/workshop.png").read_bytes()
    digest = hashlib.sha256(image).hexdigest()
    upload = tool("assets_upload_begin", {"request_id": "codex-upload-001", "path": "assets/images/workshop.png",
        "bytes": len(image), "sha256": digest, "mime_type": "image/png"})
    tool("assets_upload_chunk", {"request_id": "codex-chunk-001", "upload_id": upload["upload_id"], "offset": 0,
        "data_base64": base64.b64encode(image).decode(), "sha256": digest})
    asset = tool("assets_upload_finish", {"request_id": "codex-finish-001", "upload_id": upload["upload_id"]})
    operations = []
    for file in sorted(source.rglob("*")):
        if not file.is_file():
            continue
        path = file.relative_to(source).as_posix()
        operation = {"path": path, "expected_hash": None}
        if path == "assets/images/workshop.png":
            operation.update(type="attach_asset", upload_id=asset["upload_id"])
        elif path in ["assets/data/memory.json", "assets/data/design-intelligence.json"]:
            operation.update(type="merge", delta={"set": json.loads(file.read_text()), "remove": []})
        else:
            operation.update(type="create", content=file.read_text())
        operations.append(operation)
    review = tool("changes_prepare", {"request_id": "codex-changes-001", "base_draft_version": "draft:0",
        "brief_id": brief["brief_id"], "summary": "Create three-page client qualification fixture", "operations": operations})
    tool("changes_get", {"change_set_id": review["change_set_id"]})
    applied = finish(tool("changes_apply", {"change_set_id": review["change_set_id"], "digest": review["digest"],
        "operation_id": "codex-apply-001"}))
    assert tool("operations_get", {"operation_id": "codex-apply-001"}) == applied
    tool("files_list", {"limit": 2})
    tool("files_read", {"path": "services/repairs.php", "max_bytes": 4096})
    preview = tool("preview_render", {"path": "index.php", "draft_version": "draft:1", "max_bytes": 196608})
    assert preview["rendered"]
    browser = tool("preview_open", {"path": "index.php", "draft_version": "draft:1"})
    # Short-lived ticket stays in a private local file, never release evidence.
    (root / "browser-preview.txt").write_text(browser["browser_url"])
    os.chmod(root / "browser-preview.txt", 0o600)
    plan = tool("publish_prepare", {"request_id": "codex-publish-plan-001", "base_draft_version": "draft:1"})
    publish_args = {"plan_id": plan["plan_id"], "digest": plan["digest"], "operation_id": "codex-publish-001"}
    published = finish(tool("publish_apply", publish_args))
    assert tool("publish_apply", publish_args) == published
    snapshot = finish(tool("snapshots_create", {"operation_id": "codex-snapshot-001", "domain": "both", "label": "Codex first release"}))
    renamed = tool("structure_prepare", {"request_id": "codex-title-001", "base_draft_version": "draft:1",
        "intent": {"type": "title", "page_file": "about.php", "title": "About our workshop"}})
    finish(tool("changes_apply", {"change_set_id": renamed["change_set_id"], "digest": renamed["digest"], "operation_id": "codex-title-apply-001"}))
    second = tool("publish_prepare", {"request_id": "codex-publish-plan-002", "base_draft_version": "draft:2"})
    finish(tool("publish_apply", {"plan_id": second["plan_id"], "digest": second["digest"], "operation_id": "codex-publish-002"}))
    restore = tool("restore_prepare", {"request_id": "codex-restore-001", "snapshot_id": snapshot["result"]["snapshot_id"], "domain": "published"})
    restored = finish(tool("restore_apply", {"plan_id": restore["plan_id"], "digest": restore["digest"], "operation_id": "codex-restore-apply-001"}))
    assert tool("site_get")["draft_version"] == "draft:2"
    assert tool("files_read", {"path": "about.php", "max_bytes": 4096})["draft_version"] == "draft:2"
    browser = tool("preview_open", {"path": "index.php", "draft_version": "draft:2"})
    (root / "browser-preview.txt").write_text(browser["browser_url"])
    evidence = {"client": version, "transport": "native Codex app-server MCP client / HTTP bearer",
        "fixture": fixture["qualification"], "calls": calls, "release_id": restored["result"].get("release_id"),
        "model_led_authoring": False, "browser_visual_review": False}
    (root / "codex-lifecycle.json").write_text(json.dumps(evidence, indent=2))
    print(json.dumps({"client": version, "tool_calls": len(calls), "lifecycle": "passed",
        "evidence": str(root / "codex-lifecycle.json"), "model_led_authoring": False}))
finally:
    p.terminate()
    try:
        p.wait(timeout=5)
    except subprocess.TimeoutExpired:
        p.kill()
        p.wait()
    log.close()
