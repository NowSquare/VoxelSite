<?php
declare(strict_types=1);
require_once __DIR__ . '/helpers/StudioRuntimeFixture.php';

require_once dirname(__DIR__).'/engine/bootstrap.php';
require __DIR__.'/fixtures/mcp/ServiceFixture.php';
[$root,$db,$workspace,$policy,$actors,$credentials,$owner]=mcpServiceFixture();
$initialWorkspace=[$workspace->status(),VoxelSite\SiteWorkspace::inventory($root.'/assets')];
foreach(['005_add_notes','006_add_board','029_notes_board_requests'] as $name){$migration=require dirname(__DIR__).'/engine/migrations/'.$name.'.php';($migration['up'])($db);}
$db->exec("INSERT INTO users VALUES(3,'viewer',NULL)");
\VoxelSite\Tests\StudioRuntimeFixture::copy($root);
foreach(['notes','cards'] as $kind)copy(dirname(__DIR__).'/api/endpoints/'.$kind.'.php',$root.'/_studio/api/endpoints/'.$kind.'.php');
copy(__DIR__.'/helpers/notes-board-router.php',$root.'/router.php');
$socket=stream_socket_server('tcp://127.0.0.1:0',$errno,$error);
if(!$socket)throw new RuntimeException('Cannot open the disposable loopback fixture: '.$error);
$port=(int)substr(strrchr(stream_socket_get_name($socket,false),':'),1);fclose($socket);
$server=proc_open([PHP_BINARY,'-S','127.0.0.1:'.$port,$root.'/router.php'],[['pipe','r'],['file',$root.'/server.log','a'],['file',$root.'/server.log','a']],$pipes,$root);
fclose($pipes[0]);$checks=0;
function routeBusinessCheck(bool $ok,string $label):void {global $checks;$checks++;if(!$ok)throw new RuntimeException('FAIL '.$label);echo 'PASS '.$label."\n";}
function businessHttp(string $method,string $path,?array $input=null,int $user=1):array {
    global $port;$curl=curl_init('http://127.0.0.1:'.$port.'/_studio/api/router.php?_path='.rawurlencode($path));
    curl_setopt_array($curl,[CURLOPT_CUSTOMREQUEST=>$method,CURLOPT_RETURNTRANSFER=>true,CURLOPT_TIMEOUT=>10,
        CURLOPT_HTTPHEADER=>['Content-Type: application/json','X-Fixture-User: '.$user]]);
    if($input!==null)curl_setopt($curl,CURLOPT_POSTFIELDS,json_encode($input));
    $body=curl_exec($curl);$status=curl_getinfo($curl,CURLINFO_HTTP_CODE);
    return ['status'=>$status,'body'=>json_decode((string)$body,true)];
}
try {
    for($i=0;$i<50;$i++){if(@fsockopen('127.0.0.1',$port,$errno,$error,.1))break;usleep(20000);}
    $create=['request_id'=>'http-note-create-001','title'=>'Draft idea','body'=>str_repeat('東京 — ',400)];
    $response=businessHttp('POST','/notes',$create);$note=$response['body']['data']['note']??[];
    routeBusinessCheck($response['status']===201 && isset($note['version']),'Studio note create returns its exact version'.($response['status']===201?'':' '.json_encode($response)));
    routeBusinessCheck(businessHttp('POST','/notes',$create)['body']['data']['note']===$note,'Studio repeated create returns the retained identity');
    $listed=businessHttp('GET','/notes')['body']['data']['notes'][0];
    routeBusinessCheck($listed['body_truncated'] && strlen($listed['body'])<=512,'Studio list explicitly bounds summaries');
    routeBusinessCheck(businessHttp('GET','/notes/'.$note['id'])['body']['data']['note']['body']===$create['body'],'Studio detail preserves the complete Unicode body');
    routeBusinessCheck(businessHttp('GET','/notes/'.$note['id'],null,2)['status']===403,'Studio cannot read another user’s note');
    $external=new VoxelSite\Agent\NoteService($db,$policy);
    $current=$external->update($owner,(object)['request_id'=>'external-note-001','id'=>$note['id'],'expected_version'=>$note['version'],'fields'=>(object)['body'=>'External save']])['note'];
    $stale=businessHttp('PUT','/notes/'.$note['id'],['request_id'=>'http-stale-001','expected_version'=>$note['version'],'body'=>'Browser stale']);
    routeBusinessCheck($stale['status']===409 && $stale['body']['error']['code']==='content_conflict','Studio cannot overwrite a newer external note edit');
    $save=['request_id'=>'http-save-001','expected_version'=>$current['version'],'body'=>'Reviewed browser save'];
    $saved=businessHttp('PUT','/notes/'.$note['id'],$save)['body']['data']['note'];
    routeBusinessCheck(businessHttp('PUT','/notes/'.$note['id'],$save)['body']['data']['note']===$saved,'Studio autosave has the same durable retry semantics');
    $trash=businessHttp('DELETE','/notes/'.$note['id'],['request_id'=>'http-trash-001','expected_version'=>$saved['version']])['body']['data'];
    routeBusinessCheck($trash['deleted'] && $trash['note']['deleted_at']!==null,'Studio trash preserves legacy deleted response and the version');
    $restored=businessHttp('POST','/notes/'.$note['id'].'/restore',['request_id'=>'http-restore-001','expected_version'=>$trash['note']['version']])['body']['data']['note'];
    routeBusinessCheck($restored['id']===$note['id'] && $restored['deleted_at']===null,'Studio undo restores the same note');
    $card=businessHttp('POST','/cards',['request_id'=>'http-card-001','title'=>'Shared task','source_note_id'=>$note['id'],'expected_source_note_version'=>$restored['version']])['body']['data'];
    routeBusinessCheck($card['card']['source_note_id']===$note['id'],'Studio promotion pins the source note version');
    $id=$card['card']['id'];$move=['request_id'=>'http-move-001','expected_version'=>$card['card']['version'],'expected_board_version'=>$card['board_version'],'column_name'=>'done','position'=>0];
    $moved=businessHttp('PUT','/cards/'.$id.'/move',$move)['body']['data'];
    routeBusinessCheck($moved['card']['column_name']==='done' && businessHttp('PUT','/cards/'.$id.'/move',$move)['body']['data']===$moved,'Studio move and retry preserve exact order identity');
    routeBusinessCheck(businessHttp('GET','/cards',null,3)['status']===200 && businessHttp('POST','/cards',['request_id'=>'viewer-create-001','title'=>'Forbidden'],3)['status']===403,'Studio viewer can read the board but cannot write');
    routeBusinessCheck(businessHttp('PUT','/cards/'.$id,['title'=>'Unversioned'])['status']===422,'Studio rejects an unversioned write');
    $archived=businessHttp('POST','/cards/'.$id.'/archive',['request_id'=>'http-archive-001','expected_version'=>$moved['card']['version']])['body']['data'];
    routeBusinessCheck($archived['archived'] && $archived['card']['archived']===1,'Studio archive preserves its legacy response shape');
    $restoredCard=businessHttp('POST','/cards/'.$id.'/restore',['request_id'=>'http-card-restore-001','expected_version'=>$archived['card']['version']])['body']['data']['card'];
    routeBusinessCheck($restoredCard['column_name']==='done','Studio card restore retains its original column');
    routeBusinessCheck([$workspace->status(),VoxelSite\SiteWorkspace::inventory($root.'/assets')]===$initialWorkspace,'Studio business routes leave draft version and live files unchanged');
    echo "$checks notes and board HTTP checks passed\n";
    if(in_array('--browser',$argv,true)) {
        foreach(['src','dist'] as $path)mcpCopyFixture(dirname(__DIR__).'/ui/'.$path,$root.'/_studio/ui/'.$path);
        foreach(['api.js','state.js'] as $path)copy(dirname(__DIR__).'/ui/'.$path,$root.'/_studio/ui/'.$path);
        copy(__DIR__.'/helpers/notes-board-browser.html',$root.'/index.html');
        file_put_contents('/private/tmp/voxelsite-notes-board-fixture.json',json_encode(['root'=>$root,'port'=>$port]));
        echo "Browser fixture: http://127.0.0.1:$port\n";
        // Kept alive only when explicitly used for a disposable browser review.
        while(true)sleep(1);
    }
} finally {proc_terminate($server);proc_close($server);}
