<?php
declare(strict_types=1);
require_once dirname(__DIR__).'/engine/bootstrap.php';

use VoxelSite\{ActionManager,Database,FileManager,Migrator,Settings,SiteWorkspace};
use VoxelSite\Agent\{ActionService,ActorPolicy,BusinessReceiptStore,CanonicalJson,CredentialService,FormService,OperationActor,OperationException,SubmissionService,WorkspaceFiles};

$checks=0;
function frCheck(bool $ok,string $label):void {global $checks;$checks++;if(!$ok)throw new RuntimeException('FAIL '.$label);echo 'PASS '.$label."\n";}
function frReject(callable $call,string $code,string $label):void {try{$call();}catch(OperationException $e){frCheck($e->errorCode===$code,$label.' ('.$e->errorCode.')');return;}frCheck(false,$label);}
frCheck((new ReflectionMethod(FileManager::class,'__construct'))->getNumberOfParameters()>=2,'Workspace injection verified before fixture setup');
frCheck((new ReflectionMethod(ActionManager::class,'__construct'))->getNumberOfParameters()>=5,'Business path injection verified before fixture setup');
$root=sys_get_temp_dir().'/vs-form-rate-'.bin2hex(random_bytes(8));
foreach(['draft/assets/forms','live/assets/forms','private/actions','private/templates','live/_data/uploads'] as $dir)mkdir($root.'/'.$dir,0700,true);
$root=realpath($root);
foreach(['VS_TEST_PREVIEW_DIR'=>$root.'/draft','VS_TEST_ASSETS_DIR'=>$root.'/live/assets','VS_TEST_DOC_ROOT'=>$root.'/live','VS_TEST_WORKSPACE_STATE_DIR'=>$root.'/private/workspace','VS_TEST_MUTATION_LOCK'=>$root.'/private/site.lock','VS_TEST_REVISIONS_DIR'=>$root.'/private/revisions','VS_TEST_SNAPSHOT_DIR'=>$root.'/private/snapshots'] as $key=>$value)putenv($key.'='.$value);
foreach(['logDir'=>$root.'/private','initialized'=>true] as $key=>$value)(new ReflectionProperty(VoxelSite\Logger::class,$key))->setValue(null,$value);
Database::resetInstance();$db=Database::getInstance($root.'/private/studio.db');(new Migrator($db,new Settings($db)))->run();
$db->insert('users',['email'=>'fixture@example.invalid','password_hash'=>'fixture','name'=>'Fixture','role'=>'owner','created_at'=>now(),'updated_at'=>now()]);
$db->update('site_workspace_state',['format'=>2],'id=1');file_put_contents($root.'/draft/.htaccess',SiteWorkspace::ACCESS_MARKER."\nRequire all denied\nDeny from all\n");
$workspace=new SiteWorkspace($db,$root.'/draft',$root.'/live',$root.'/private/workspace',$root.'/live/assets');$policy=new ActorPolicy($db);$owner=new OperationActor('user',1,null,[],'studio_configured',null);$credentials=new CredentialService($db);
$makeActor=static function()use($credentials,$owner,$db,$policy):OperationActor {$key=$credentials->create($owner,1,'read','Form rate fixture',null);$db->update('api_keys',['scopes'=>json_encode(['forms:read','forms:submit'])],'id=?',[$key['id']]);return $policy->fromCredential($key['id']);};
$actor=$makeActor();$peer=$makeActor();$sent=[];$receipts=new BusinessReceiptStore($policy,static function(array $message)use(&$sent):bool{$sent[]=$message;return true;});
$forms=new FormService($db,$policy,$workspace);$actions=new ActionService($db,$policy,$workspace,$root.'/private/actions',$root.'/live/_data/actions.db',$root.'/private/site.json',$root.'/private/templates',$receipts);
$service=new SubmissionService($db,$policy,$workspace,$forms,$actions,$root.'/live/_data/submissions.db',$root.'/live/_data/actions.db',$root.'/live/_data/uploads',$receipts);
WorkspaceFiles::write($root.'/live','assets/data/site.json','{"name":"Fixture"}');
$form=['id'=>'limited','name'=>'Limited','fields'=>[['name'=>'name','type'=>'text','required'=>true]],'submission'=>['store'=>true],'notifications'=>['email'=>['enabled'=>false]],'spam_protection'=>['max_per_ip_per_hour'=>2]];
$save=static function(array $definition)use($root,$forms,$actor):string {WorkspaceFiles::write($root.'/live','assets/forms/'.$definition['id'].'.json',CanonicalJson::encode($definition));return $forms->get($actor,(object)['source'=>'published','form_id'=>$definition['id']])['version'];};
$version=$save($form);$input=static fn(string $id,string $request,string $hash,array $data=['name'=>'Fixture']):stdClass=>(object)['form_id'=>$id,'request_id'=>$request,'version'=>$hash,'data'=>(object)$data];
$first=$input('limited','rate-first',$version);$made=$service->submit($actor,$first);
frCheck($service->submit($actor,$first)===$made,'Identical retry returns the original receipt');
$_SERVER['REMOTE_ADDR']='192.0.2.1';$service->submit($actor,$input('limited','rate-second',$version));
$_SERVER['REMOTE_ADDR']='192.0.2.2';
frReject(fn()=>$service->submit($actor,$input('limited','rate-third',$version)),'rate_limited','Configured maximum applies despite changed caller IP');
$pdo=new PDO('sqlite:'.$root.'/live/_data/submissions.db');$pdo->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);
$count=static function(OperationActor $who,string $id)use($pdo):int{$q=$pdo->prepare('SELECT COALESCE(SUM(count),0) FROM rate_limits WHERE ip_address=? AND form_id=?');$q->execute(['actor:'.$who->identity(),$id]);return (int)$q->fetchColumn();};
frCheck($count($actor,'limited')===2&&(int)$pdo->query('SELECT COUNT(*) FROM submissions')->fetchColumn()===2,'Denied call and receipt replay consume no extra quota or records');
frCheck($service->submit($actor,$first)===$made,'Retry remains available after the quota is exhausted');
$service->submit($peer,$input('limited','peer-first',$version));frCheck($count($peer,'limited')===1,'Authenticated actors have separate form counters');
$other=$form;$other['id']='other';$otherVersion=$save($other);$service->submit($actor,$input('other','other-first',$otherVersion));frCheck($count($actor,'other')===1,'Each form has an independent actor counter');
$pdo->prepare('UPDATE rate_limits SET window_start=? WHERE ip_address=? AND form_id=?')->execute(['2000-01-01T00:00:00','actor:'.$actor->identity(),'limited']);
$service->submit($actor,$input('limited','next-window',$version));frCheck($count($actor,'limited')===3,'An expired hourly window does not consume current quota');

$atomic=$form;$atomic['id']='atomic';$atomicVersion=$save($atomic);
frReject(fn()=>$service->submit($actor,$input('atomic','invalid-data',$atomicVersion,[])),'validation_failed','Invalid form input does not enter a successful mutation');
frCheck($count($actor,'atomic')===0,'Validation failure consumes no form quota');
$pdo->exec("CREATE TRIGGER fail_form_receipt BEFORE INSERT ON agent_business_receipts WHEN NEW.request_id='atomic-failure' BEGIN SELECT RAISE(ABORT,'fixture rollback'); END");
try{$service->submit($actor,$input('atomic','atomic-failure',$atomicVersion));frCheck(false,'Fixture receipt failure must interrupt the transaction');}catch(PDOException $error){frCheck(str_contains($error->getMessage(),'fixture rollback'),'Receipt failure occurs after record and counter mutation');}
frCheck($count($actor,'atomic')===0&&(int)$pdo->query("SELECT COUNT(*) FROM submissions WHERE form_id='atomic'")->fetchColumn()===0,'Receipt failure rolls back both record and form counter');
$pdo->exec('DROP TRIGGER fail_form_receipt');$service->submit($actor,$input('atomic','atomic-failure',$atomicVersion));frCheck($count($actor,'atomic')===1,'Rolled-back request can retry without a phantom quota charge');

$mail=$form;$mail['id']='mail';$mail['notifications']=['email'=>['enabled'=>true,'recipient'=>'owner@example.invalid']];$mailVersion=$save($mail);
frReject(fn()=>$service->submit($actor,$input('mail','mail-without-grant',$mailVersion)),'permission_denied','Notification authority is checked before quota commits');
frCheck($count($actor,'mail')===0&&!$sent,'Denied mail leaves no quota charge or delivery');
$unstored=$form;$unstored['id']='unstored';$unstored['submission']['store']=false;$unstored['spam_protection']['max_per_ip_per_hour']=1;$unstoredVersion=$save($unstored);
$unstoredMade=$service->submit($actor,$input('unstored','unstored-first',$unstoredVersion));frCheck(!$unstoredMade['record_created']&&$count($actor,'unstored')===1,'Successful non-storing forms still consume their configured quota');
frReject(fn()=>$service->submit($actor,$input('unstored','unstored-second',$unstoredVersion)),'rate_limited','Disabling record storage cannot bypass the form limit');

$default=$form;$default['id']='default';unset($default['spam_protection']);$defaultVersion=$save($default);
for($i=0;$i<10;$i++)$service->submit($actor,$input('default','default-'.$i,$defaultVersion));
frReject(fn()=>$service->submit($actor,$input('default','default-exhausted',$defaultVersion)),'rate_limited','Missing configuration preserves the shipped maximum of ten');
unlink($root.'/live/assets/forms/limited.json');frCheck($service->submit($actor,$first)===$made,'Retained reply remains available after the form definition is removed');
$db->update('studio_mcp_credentials',['revoked_at'=>time()],'key_id=?',[$actor->credentialId]);
frReject(fn()=>$service->submit($actor,$first),'permission_denied','Revocation still blocks retained form replies');
echo "\n{$checks} passed\n";
