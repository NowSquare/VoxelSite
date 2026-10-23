<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\Database;

/** Bounded private record versions are independent of website draft versions. */
final class BusinessRecordVersion
{
    public static function record(array $row):string {return CanonicalJson::digest($row);}
    public static function collection(Database $db,string $kind,?int $userId=null):string
    {
        if(!in_array($kind,['notes','cards'],true))throw new \LogicException('Unknown business collection.');
        $where=$kind==='notes'?' WHERE user_id=?':'';$args=$kind==='notes'?[$userId]:[];
        $limits=$db->queryOne('SELECT COUNT(*) AS count,COALESCE(SUM(length(CAST(title AS BLOB))+length(CAST(body AS BLOB))),0) AS bytes FROM '.$kind.$where,$args);
        if($limits['count']>5000 || $limits['bytes']>33554432)throw new OperationException('size_limit','This business collection exceeds the supported 5000 records or 32 MiB. Reduce it in Studio before requesting a bounded snapshot.');
        self::function($db,'vs_business_hash',static fn($value)=>hash('sha256',(string)$value));
        $fields=$kind==='notes'?'pinned,user_id,created_at,updated_at,deleted_at':'column_name,position,linked_page,archived,created_by_user_id,updated_by_user_id,source_note_id,created_at,updated_at';
        return CanonicalJson::digest($db->query('SELECT id,vs_business_hash(title) AS title_hash,vs_business_hash(body) AS body_hash,'.$fields.' FROM '.$kind.$where.' ORDER BY id',$args));
    }
    public static function board(Database $db):string
    {
        return CanonicalJson::digest($db->query('SELECT id,column_name,position,archived FROM cards ORDER BY id'));
    }
    public static function function(Database $db,string $name,\Closure $callback):void
    {
        $pdo=$db->getPdo();
        if(method_exists($pdo,'createFunction'))$pdo->createFunction($name,$callback,1);
        else @$pdo->sqliteCreateFunction($name,$callback,1); // PHP 8.2 compatibility on base PDO instances.
    }
    public static function expect(array $row,string $version):void
    {
        if(!hash_equals(self::record($row),$version))throw new OperationException('content_conflict','This record changed after you opened it. Keep your local text and read the current record before trying again.');
    }
    public static function text(string $title,string $body):void
    {
        if(strlen($title)>4096 || mb_strlen($title,'UTF-8')>1024 || strlen($body)>65536 || str_contains($title,"\0") || str_contains($body,"\0")
            || !mb_check_encoding($title.$body,'UTF-8'))throw new OperationException('size_limit','Use valid text with a title up to 1024 characters and a body up to 64 KiB.');
    }
    public static function bounded(array $result):array
    {
        if(strlen(CanonicalJson::encode($result))>393216)throw new OperationException('size_limit','This business response exceeds 384 KiB. Use a smaller page.');
        return $result;
    }
}
