<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\Database;

/** Operation-status polling cannot spend the budget needed to finish a write. */
final class RequestBudget
{
    public const WINDOW=3600;
    public const REQUESTS=1000;
    public const POLLS=600;
    public function __construct(private Database $db,private ActorPolicy $policy) {}
    public function consume(OperationActor $actor,string $method,\stdClass $params):void
    {
        $this->policy->require($actor,[]);
        if ($actor->type!=='api_key') throw new OperationException('permission_denied','A Studio MCP credential is required.');
        $poll=$method==='tools/call' && ($params->name??null)==='voxelsite_operations_get';
        $bucket=$poll?'polls':'requests';$limit=$poll?self::POLLS:self::REQUESTS;
        $window=intdiv(time(),self::WINDOW)*self::WINDOW;
        $this->db->transaction(function() use($actor,$bucket,$limit,$window):void {
            $row=$this->db->queryOne('SELECT window_start,request_count FROM agent_request_budgets WHERE credential_id = ? AND bucket = ?',
                [$actor->credentialId,$bucket]);
            $count=$row && (int)$row['window_start']===$window?(int)$row['request_count']:0;
            if ($count >= $limit) throw new OperationException('rate_limited',
                $bucket==='polls'?'Status polling is temporarily limited. An explicit continuation has its own request budget.':'The connection request limit was reached.',
                ['retry_after'=>max(1,$window+self::WINDOW-time()),'bucket'=>$bucket]);
            $statement=$this->db->getPdo()->prepare('INSERT INTO agent_request_budgets (credential_id,bucket,window_start,request_count) VALUES (?,?,?,?)
                ON CONFLICT(credential_id,bucket) DO UPDATE SET window_start=excluded.window_start,request_count=excluded.request_count');
            $statement->execute([$actor->credentialId,$bucket,$window,$count+1]);
        });
    }
}
