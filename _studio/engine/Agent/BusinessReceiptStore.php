<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\Mailer;

/** Record, retry identity and notification intent commit in the same source database. */
final class BusinessReceiptStore
{
    public function __construct(private ActorPolicy $policy,private ?\Closure $sender=null) {}
    public static function install(\PDO $pdo):void {
        $pdo->exec("CREATE TABLE IF NOT EXISTS agent_business_receipts (
            actor_key TEXT NOT NULL, user_id INTEGER NOT NULL, request_id TEXT NOT NULL, digest TEXT NOT NULL,
            result_json TEXT NOT NULL, scopes_json TEXT NOT NULL, created_at INTEGER NOT NULL,
            PRIMARY KEY(actor_key,request_id))");
        $pdo->exec("CREATE TABLE IF NOT EXISTS agent_business_deliveries (
            id TEXT PRIMARY KEY, actor_key TEXT NOT NULL, request_id TEXT NOT NULL, payload_json TEXT NOT NULL,
            state TEXT NOT NULL CHECK(state IN ('pending','attempted','sent','failed','unknown')), attempted_at INTEGER,
            completed_at INTEGER)");
    }
    public function mutate(OperationActor $actor,\PDO $pdo,string $requestId,mixed $intent,array $scopes,\Closure $mutation):array {
        JsonSchema::validate($requestId,ToolContracts::requestId());$this->policy->require($actor,$scopes);
        self::install($pdo);$digest=CanonicalJson::digest($intent);$pdo->exec('BEGIN IMMEDIATE');
        try {
            $query=$pdo->prepare('SELECT * FROM agent_business_receipts WHERE actor_key=? AND request_id=?');$query->execute([$actor->identity(),$requestId]);$receipt=$query->fetch(\PDO::FETCH_ASSOC);
            if($receipt) {
                if((int)$receipt['user_id']!==$actor->userId || !hash_equals($receipt['digest'],$digest))throw new OperationException('idempotency_conflict','This request identity already belongs to different business input.');
                $this->policy->require($actor,json_decode($receipt['scopes_json'],true,32,JSON_THROW_ON_ERROR));
                $result=json_decode($receipt['result_json'],true,32,JSON_THROW_ON_ERROR);
            }else {
                if((int)$pdo->query('SELECT COUNT(*) FROM agent_business_receipts')->fetchColumn()>=10000)throw new OperationException('size_limit','Business receipt storage is full. Retained identities need maintenance.');
                $out=$mutation();$result=$out['result'];$deliveries=$out['deliveries']??[];
                if(count($deliveries)>2)throw new \LogicException('Business notifications exceed the shared delivery bound.');
                if($deliveries)$this->policy->require($actor,['mail:send']);
                $wire=CanonicalJson::encode($result);$result=json_decode($wire,true,32,JSON_THROW_ON_ERROR);if(strlen($wire)>131072)throw new OperationException('size_limit','Business result exceeds 128 KiB.');
                if((int)$pdo->query('SELECT COALESCE(SUM(length(result_json)),0) FROM agent_business_receipts')->fetchColumn()+strlen($wire)>16777216)throw new OperationException('size_limit','Retained business responses exceed 16 MiB.');
                $pdo->prepare('INSERT INTO agent_business_receipts VALUES (?,?,?,?,?,?,?)')->execute([$actor->identity(),$actor->userId,$requestId,$digest,$wire,CanonicalJson::encode(array_values(array_unique(array_merge($scopes,$deliveries?['mail:send']:[])))),time()]);
                foreach($deliveries as $index=>$delivery) {
                    $delivery['subject']=preg_replace('/[\r\n\x00]/',' ',mb_substr((string)$delivery['subject'],0,500));
                    foreach(['from_name','reply_to'] as $header)if(isset($delivery['options'][$header]))$delivery['options'][$header]=preg_replace('/[\r\n\x00]/',' ',mb_substr((string)$delivery['options'][$header],0,500));
                    $body=CanonicalJson::encode($delivery);if(strlen($body)>65536)throw new OperationException('size_limit','Notification exceeds its 64 KiB limit.');
                    if((int)$pdo->query('SELECT COALESCE(SUM(length(payload_json)),0) FROM agent_business_deliveries')->fetchColumn()+strlen($body)>16777216)throw new OperationException('size_limit','Retained delivery intents exceed 16 MiB.');
                    $id=hash('sha256',$actor->identity()."\0".$requestId."\0".$index);
                    $pdo->prepare('INSERT INTO agent_business_deliveries (id,actor_key,request_id,payload_json,state) VALUES (?,?,?,?,?)')->execute([$id,$actor->identity(),$requestId,$body,'pending']);
                }
            }
            $this->policy->require($actor,$scopes);
            $pdo->exec('COMMIT');
        }catch(\Throwable $error){$pdo->exec('ROLLBACK');throw $error;}
        $result['request_id']=$requestId;$result['deliveries']=$this->dispatch($actor,$pdo,$requestId);$result['provider_calls']=0;return $result;
    }
    private function dispatch(OperationActor $actor,\PDO $pdo,string $requestId):array {
        $query=$pdo->prepare('SELECT * FROM agent_business_deliveries WHERE actor_key=? AND request_id=? ORDER BY id');$query->execute([$actor->identity(),$requestId]);$states=[];
        foreach($query->fetchAll(\PDO::FETCH_ASSOC) as $delivery) {
            $state=$delivery['state'];
            if($state==='pending') {
                $this->policy->require($actor,['mail:send']);
                $claim=$pdo->prepare("UPDATE agent_business_deliveries SET state='attempted',attempted_at=? WHERE id=? AND state='pending'");$claim->execute([time(),$delivery['id']]);
                if($claim->rowCount()===1) {
                    $message=json_decode($delivery['payload_json'],true,32,JSON_THROW_ON_ERROR);
                    try {$ok=$this->sender?($this->sender)($message):Mailer::getInstance()->send($message['to'],$message['subject'],$message['body'],$message['options']??[]);$state=$ok?'sent':'failed';}
                    catch(\Throwable){$state='unknown';}
                    $pdo->prepare('UPDATE agent_business_deliveries SET state=?,completed_at=? WHERE id=? AND state=\'attempted\'')->execute([$state,time(),$delivery['id']]);
                }else $state='unknown';
            }elseif($state==='attempted')$state='unknown';
            $states[]=['delivery_id'=>$delivery['id'],'state'=>$state,'automatic_retry'=>false];
        }
        return $states;
    }
    public static function deliveriesSchema():array {return ToolContracts::list(ToolContracts::object(['delivery_id'=>ToolContracts::hash(),'state'=>['enum'=>['pending','sent','failed','unknown']],'automatic_retry'=>['const'=>false]]),2);}
}
