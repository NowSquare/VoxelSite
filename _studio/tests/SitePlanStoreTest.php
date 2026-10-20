<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/engine/bootstrap.php';
use VoxelSite\Database;
use VoxelSite\FileManager;
use VoxelSite\Migrator;
use VoxelSite\SitePlanStore;
use VoxelSite\SiteMutationLock;

if (!class_exists(SitePlanStore::class) || !class_exists(SiteMutationLock::class)) {
    fwrite(STDERR, "FAIL: reviewed plans and mutation coordination are not retained on the server.\n");
    exit(1);
}
$root = sys_get_temp_dir() . '/vs-plan-store-' . bin2hex(random_bytes(6));
mkdir($root . '/preview', 0700, true);
mkdir($root . '/assets/css', 0700, true);
foreach (['PREVIEW_DIR' => '/preview', 'ASSETS_DIR' => '/assets', 'PLAN_DIR' => '/plans',
    'SNAPSHOT_DIR' => '/snapshots', 'MUTATION_LOCK' => '/mutation.lock'] as $key => $suffix) {
    putenv('VS_TEST_' . $key . '=' . $root . $suffix);
}
$db = Database::getInstance($root . '/studio.db');
(new Migrator($db))->run();
$db->insert('users', ['id'=>1,'email'=>'owner@example.test','name'=>'Owner','role'=>'owner',
    'password_hash'=>'disabled','created_at'=>now(),'updated_at'=>now()]);
$source = '<?php $page = [\'title\'=>\'About\']; ?><h1>Old</h1>';
file_put_contents($root . '/preview/about.php', $source);
file_put_contents($root . '/assets/css/tailwind.css', 'original css');
$fm = new FileManager($db);
$fm->syncPageRegistry();
$store = new SitePlanStore($db, $fm);
$edit = ['file'=>'about.php','strategy'=>'line-replace','anchored'=>true,
    'before_snippet'=>'Old','after_snippet'=>'New','source_hash'=>hash('sha256', $source)];
$plan = ['applicable'=>true,'edits'=>[$edit],'summary'=>'Change heading'];
$passed = 0;
function check(bool $ok, string $name): void {
    global $passed;
    if (!$ok) { throw new RuntimeException('FAIL ' . $name); }
    $passed++; echo 'PASS ' . $name . "\n";
}
$id = $store->create(1, $plan);
check($store->get($id, 1)['status'] === 'ready', 'Server retains review identity');
check($store->get($id, 2) === null, 'Another user cannot read or apply review');
$lock = SiteMutationLock::acquire();
$claimed = $store->begin($id, 1);
check($claimed['plan']['edits'] === [$edit], 'Apply loads only the stored edits');
check(is_int($claimed['recovery_snapshot_id']), 'Recovery backup is visible in existing Snapshots');
file_put_contents($root . '/preview/about.php', str_replace('Old', 'New', $source));
$store->recoverInterrupted();
$recovered = $store->get($id, 1);
check($recovered['status'] === 'failed' && $recovered['result']['rollback_clean'] === true,
    'An interrupted apply has a confirmed failed/restored terminal outcome');
check(file_get_contents($root . '/preview/about.php') === $source, 'Interrupted mutation restores exact original bytes');
check(file_get_contents($root . '/assets/css/tailwind.css') === 'original css', 'Interrupted recovery restores compiled CSS');
$id = $store->create(1, $plan);
file_put_contents($root . '/preview/about.php', $source . '<p>Later manual edit</p>');
$rejected = false;
try { $store->begin($id, 1); } catch (Throwable $e) { $rejected = str_contains($e->getMessage(), 'changed'); }
check($rejected, 'Change outside the anchor invalidates reviewed plan');
file_put_contents($root . '/preview/about.php', $source);
$id = $store->create(1, $plan);
$store->begin($id, 1);
$result = ['success'=>true,'files_changed'=>1,'rollback_clean'=>true];
$store->finish($id, $result);
check($store->begin($id, 1)['result'] === $store->get($id, 1)['result'], 'Retry returns retained outcome without a second mutation');
$db->exec("UPDATE site_control_plans SET expires_at = 0 WHERE id = '" . $id . "'");
check($store->begin($id, 1)['status'] === 'applied', 'Completed retry remains available after review expiry');
$id = $store->create(1, $plan);
$db->exec("UPDATE site_control_plans SET expires_at = 0 WHERE id = '" . $id . "'");
$rejected = false;
try { $store->begin($id, 1); } catch (Throwable) { $rejected = true; }
check($rejected, 'Unapplied review expires');
echo "$passed checks passed. Fixture: $root\n";
