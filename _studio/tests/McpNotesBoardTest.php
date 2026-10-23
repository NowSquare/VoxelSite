<?php
declare(strict_types=1);
require_once dirname(__DIR__).'/engine/bootstrap.php';
require __DIR__.'/fixtures/mcp/ServiceFixture.php';
use VoxelSite\{CardManager,NoteManager,SiteWorkspace};
use VoxelSite\Agent\{BoardService,CanonicalJson,JsonSchema,NoteService,OperationActor,OperationException};
$checks=0;
function businessCheck(bool $ok,string $label):void {global $checks;$checks++;if(!$ok)throw new RuntimeException('FAIL '.$label);echo 'PASS '.$label."\n";}
function businessReject(callable $call,string $code,string $label):void {
    try{$call();}catch(OperationException $e){businessCheck($e->errorCode===$code,$label.' ['.$e->errorCode.']');return;}businessCheck(false,$label);
}
[$root,$db,$workspace,$policy,$actors,$credentials,$owner]=mcpServiceFixture();
foreach(['005_add_notes','006_add_board','029_notes_board_requests'] as $name){$migration=require dirname(__DIR__).'/engine/migrations/'.$name.'.php';($migration['up'])($db);}
$notes=new NoteService($db,$policy);$board=new BoardService($db,$policy);$legacyNotes=new NoteManager($db);$legacyCards=new CardManager($db);
$snapshot=SiteWorkspace::inventory($workspace->draftRoot());$live=SiteWorkspace::inventory($root.'/assets');$draftVersion=$workspace->status()['draft_version'];
foreach(['list','search','read','create','update','trash','restore'] as $method){JsonSchema::assertSupported(NoteService::inputSchema($method));JsonSchema::assertSupported(NoteService::outputSchema($method));}
foreach(['list','read','create','update','move','archive','restore','delete'] as $method){JsonSchema::assertSupported(BoardService::inputSchema($method));JsonSchema::assertSupported(BoardService::outputSchema($method));}
businessCheck(true,'Notes and board expose explicit supported schemas');
businessReject(fn()=>$notes->list($actors['writer'],(object)[]),'permission_denied','Default website edit grant excludes private notes');
businessReject(fn()=>$board->list($actors['writer'],(object)[]),'permission_denied','Default website edit grant excludes shared business board');
$scopeJson=json_encode(array_merge($actors['writer']->scopes,['notes:read','notes:write','board:read','board:write']));
$db->update('api_keys',['scopes'=>$scopeJson],'id=?',[$actors['writer']->credentialId]);$actor=$policy->fromCredential($actors['writer']->credentialId);
$create=(object)['request_id'=>'note-create-001','title'=>'Café idées','body'=>'<strong>ÉLAN</strong> — 東京'];
$note=$notes->create($actor,$create)['note'];JsonSchema::validate(JsonSchema::output(['note'=>$note,'pin_limit'=>false,'provider_calls'=>0]),NoteService::outputSchema('create'));
businessCheck($note['body']===$create->body && $note['trust']==='untrusted_business_input','Rich and Unicode note text is preserved as untrusted input');
$again=$notes->create($actor,$create)['note'];
businessCheck($again===$note && $db->scalar('SELECT COUNT(*) FROM notes')===1,'Repeated note creation returns the same identity and bytes');
$different=clone $create;$different->body='Different';
businessReject(fn()=>$notes->create($actor,$different),'idempotency_conflict','Changed note creation cannot reuse a request identity');
$empty=$notes->create($actor,(object)['request_id'=>'empty-note-001'])['note'];businessCheck($empty['title']===''&&$empty['body']==='','Empty scratch notes remain supported');
$private=$notes->create($owner,(object)['request_id'=>'owner-private-001','title'=>'Owner private','body'=>'Never included for another user'])['note'];
businessReject(fn()=>$notes->read($actor,(object)['id'=>$private['id']]),'permission_denied','A note remains scoped to its current owner');
$search=$notes->search($actor,(object)['query'=>'Élan']);
businessCheck(count($search['notes'])===1 && $search['notes'][0]['id']===$note['id'],'Search matches Unicode case without exposing other users');
$literal=$notes->search($actor,(object)['query'=>'%']);businessCheck($literal['total']===0,'Search treats SQL wildcard characters as literal text');
$list=$notes->list($actor,(object)['limit'=>1]);JsonSchema::validate(JsonSchema::output($list),NoteService::outputSchema('list'));
businessReject(fn()=>$notes->list($actor,(object)['offset'=>1]),'content_conflict','Note pagination requires a pinned collection version');
$second=$notes->list($actor,(object)['limit'=>1,'offset'=>$list['next_offset'],'collection_version'=>$list['collection_version']]);
businessCheck(count($second['notes'])===1,'Pinned note pagination returns the next page');
$long=$notes->create($actor,(object)['request_id'=>'long-note-001','title'=>'Long body','body'=>str_repeat('東京 — ',500)])['note'];
$longSummary=array_values(array_filter($notes->list($actor,(object)[])['notes'],fn($row)=>$row['id']===$long['id']))[0];
businessCheck($longSummary['body_truncated'] && strlen($longSummary['body'])<=512 && mb_check_encoding($longSummary['body'],'UTF-8')
    && $longSummary['version']===$long['version'] && $notes->read($actor,(object)['id'=>$long['id']])['note']['body']===$long['body'],
    'List summaries are UTF-8 bounded while full detail retains complete text and version');
for($pinIndex=0;$pinIndex<6;$pinIndex++){
    $pinNote=$notes->create($actor,(object)['request_id'=>'pin-create-'.$pinIndex,'title'=>'Pinned '.$pinIndex])['note'];
    $pinResult=$notes->update($actor,(object)['request_id'=>'pin-update-'.$pinIndex,'id'=>$pinNote['id'],'expected_version'=>$pinNote['version'],'fields'=>(object)['pinned'=>1]]);
}
businessCheck($pinResult['pin_limit'] && $pinResult['note']['pinned']===0 && $db->scalar('SELECT COUNT(*) FROM notes WHERE user_id=? AND pinned=1',[$actor->userId])===5,
    'The existing five-pin limit remains a soft limit without losing note content');
businessReject(fn()=>$notes->create($actor,(object)['request_id'=>'oversized-note-001','body'=>str_repeat('é',32769)]),'size_limit','Body bytes are bounded independently of Unicode character count');
$legacyNotes->update($note['id'],$actor->userId,['body'=>'Saved in Studio']);
businessReject(fn()=>$notes->update($actor,(object)['request_id'=>'stale-note-001','id'=>$note['id'],'expected_version'=>$note['version'],'fields'=>(object)['body'=>'Stale external']]),
    'content_conflict','An external edit cannot overwrite a newer legacy Studio save');
$current=$notes->read($actor,(object)['id'=>$note['id']])['note'];
$update=(object)['request_id'=>'fresh-note-001','id'=>$note['id'],'expected_version'=>$current['version'],'fields'=>(object)['body'=>'Saved externally']];
$updated=$notes->update($actor,$update)['note'];$replay=$notes->update($actor,$update)['note'];
businessCheck($updated===$replay && $updated['version']!==$current['version'],'Note update atomically returns a stable receipt and a new version');
$trashInput=(object)['request_id'=>'trash-note-001','id'=>$note['id'],'expected_version'=>$updated['version']];
$trashed=$notes->trash($actor,$trashInput)['note'];
businessCheck($trashed['deleted_at']!==null && $notes->trash($actor,$trashInput)['note']===$trashed,'Trash retains the note identity and idempotent result');
$restored=$notes->restore($actor,(object)['request_id'=>'restore-note-001','id'=>$note['id'],'expected_version'=>$trashed['version']])['note'];
businessCheck($restored['deleted_at']===null && $restored['id']===$note['id'],'Note undo preserves identity and content');
$old=$notes->trash($actor,(object)['request_id'=>'trash-empty-001','id'=>$empty['id'],'expected_version'=>$empty['version']])['note'];
$db->update('notes',['deleted_at'=>gmdate('Y-m-d\TH:i:s\Z',time()-120)],'id=?',[$old['id']]);
$count=$db->scalar('SELECT COUNT(*) FROM notes');$notes->list($actor,(object)[]);$notes->search($actor,(object)['query'=>'']);$legacyNotes->listForUser($actor->userId);$legacyNotes->search($actor->userId,'');
businessCheck($count===$db->scalar('SELECT COUNT(*) FROM notes'),'Neither MCP nor legacy read/list/search silently removes trash');
$oldVersion=$notes->read($actor,(object)['id'=>$old['id']])['note']['version'];
businessReject(fn()=>$notes->restore($actor,(object)['request_id'=>'expired-restore-001','id'=>$old['id'],'expected_version'=>$oldVersion]),'review_expired','Expired trash cannot be resurrected');
$notes->create($actor,(object)['request_id'=>'cleanup-trigger-001','title'=>'Explicit mutation']);
businessCheck(!$db->scalar('SELECT COUNT(*) FROM notes WHERE id=?',[$old['id']]),'Explicit note mutation performs bounded expired trash cleanup');
$notes->create($actor,(object)['request_id'=>'empty-note-001']);
businessCheck(!$db->scalar('SELECT COUNT(*) FROM notes WHERE id=?',[$old['id']]),'A retained create retry cannot recreate a purged note');
$db->update('notes_board_requests',['expires_at'=>time()-1],'actor_key=? AND request_id=?',[$actor->identity(),'empty-note-001']);
businessReject(fn()=>$notes->create($actor,(object)['request_id'=>'empty-note-001']),'review_expired','Expired mutation identity remains a non-reusable tombstone');
$notes->create($actor,(object)['request_id'=>'receipt-cleanup-001']);
$expiredReceipt=$db->queryOne('SELECT response_json,response_bytes FROM notes_board_requests WHERE actor_key=? AND request_id=?',[$actor->identity(),'empty-note-001']);
businessCheck($expiredReceipt['response_json']===null && $expiredReceipt['response_bytes']===0,'Explicit writes remove expired receipt payloads while preserving request tombstones');
businessReject(fn()=>$notes->create($actor,(object)['request_id'=>'empty-note-001']),'review_expired','Pruned receipt payloads cannot resurrect old creates');
$promote=(object)['request_id'=>'promote-note-001','title'=>$restored['title'],'body'=>$restored['body'],'source_note_id'=>$restored['id'],'expected_source_note_version'=>$restored['version']];
$card=$board->create($actor,$promote)['card'];JsonSchema::validate(JsonSchema::output(['card'=>$card,'deleted'=>false,'board_version'=>$board->list($actor,(object)[])['board_version'],'provider_calls'=>0]),BoardService::outputSchema('create'));
businessCheck($card['source_note_id']===$restored['id'] && $card['body']===$restored['body'],'Note promotion preserves copy-on-promote relationship metadata');
businessReject(fn()=>$board->create($actor,(object)['request_id'=>'foreign-promote-001','title'=>'Shared','source_note_id'=>$private['id'],'expected_source_note_version'=>$private['version']]),'permission_denied','A foreign private note cannot be promoted');
$card2=$board->create($owner,(object)['request_id'=>'second-card-001','title'=>'Second card'])['card'];
$boardBefore=$board->list($actor,(object)[]);
$move=(object)['request_id'=>'move-card-001','id'=>$card['id'],'expected_version'=>$card['version'],'expected_board_version'=>$boardBefore['board_version'],'column_name'=>'in_progress','position'=>0];
$moved=$board->move($actor,$move);
businessCheck($moved['card']['column_name']==='in_progress' && $board->move($actor,$move)===$moved,'Move retains ordering and exact replay result');
businessReject(fn()=>$board->move($owner,(object)['request_id'=>'stale-board-move-001','id'=>$card2['id'],'expected_version'=>$card2['version'],'expected_board_version'=>$boardBefore['board_version'],'column_name'=>'done','position'=>0]),
    'content_conflict','Concurrent move rejects stale board ordering even for a different card');
$legacyCards->update($card['id'],1,['body'=>'Studio changed this card']);
businessReject(fn()=>$board->update($actor,(object)['request_id'=>'stale-card-edit-001','id'=>$card['id'],'expected_version'=>$moved['card']['version'],'fields'=>(object)['body'=>'Stale']]),
    'content_conflict','External card edits cannot overwrite current Studio content');
$currentCard=$board->read($actor,(object)['id'=>$card['id']])['card'];
$archived=$board->archive($actor,(object)['request_id'=>'archive-card-001','id'=>$card['id'],'expected_version'=>$currentCard['version']])['card'];
$restoredCard=$board->restore($actor,(object)['request_id'=>'restore-card-001','id'=>$card['id'],'expected_version'=>$archived['version']])['card'];
businessCheck($restoredCard['id']===$card['id'] && $restoredCard['column_name']==='in_progress' && !$restoredCard['archived'],'Archive restore preserves the original column and identity');
$delete=(object)['request_id'=>'delete-card-001','id'=>$card['id'],'expected_version'=>$restoredCard['version']];
$deleted=$board->delete($actor,$delete);businessCheck($deleted['deleted'] && $deleted['card']===null && $board->delete($actor,$delete)===$deleted,'Permanent card deletion replays without recreating a record');
$db->exec("INSERT INTO users VALUES (3,'viewer',NULL)");
$viewer=new OperationActor('user',3,null,[],'studio_configured',null);
businessCheck($board->list($viewer,(object)[])['total']===1,'Viewer can read the shared board');
businessReject(fn()=>$board->create($viewer,(object)['request_id'=>'viewer-card-001','title'=>'Forbidden']),'permission_denied','Viewer cannot mutate shared board');
businessReject(fn()=>$notes->list($viewer,(object)[]),'permission_denied','Viewer cannot read private notes');
$db->update('api_keys',['scopes'=>'[]'],'id=?',[$actor->credentialId]);
businessReject(fn()=>$notes->create($actor,$create),'permission_denied','Receipt replay rechecks current private note authority');
businessReject(fn()=>$board->create($actor,$promote),'permission_denied','Promotion replay rechecks current board and note authority');
businessCheck($snapshot===SiteWorkspace::inventory($workspace->draftRoot()) && $live===SiteWorkspace::inventory($root.'/assets')
    && $draftVersion===$workspace->status()['draft_version'],'Business records never alter website draft or live state');
echo "$checks notes and board checks passed\n";
