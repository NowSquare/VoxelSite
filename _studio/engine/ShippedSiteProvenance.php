<?php
declare(strict_types=1);
namespace VoxelSite;

/**
 * Exact package bootstrap bytes only. This never adopts customer files.
 * Update these hashes deliberately when either shipped source changes.
 */
final class ShippedSiteProvenance
{
    public const FILES = [
        'index.php'=>'d4e6b2a3d131787599f4325f72540c1812429ac69deaddb94cf8168d80956c10',
        'submit.php'=>'6cb302a2cba0814dbca05d2ea8446ab9bff526e4f25a5efdd2c080c8394434d3',
    ];

    /** Called only by the explicit fresh-install operation. */
    public static function capture(Database $db,SiteWorkspace $workspace):void
    {
        foreach(self::FILES as $path=>$hash) {
            if(self::hash($workspace->resolvePublished($path))!==$hash)continue;
            $statement=$db->getPdo()->prepare('INSERT OR IGNORE INTO site_shipped_provenance(path,sha256,captured_at) VALUES(?,?,?)');
            $statement->execute([$path,$hash,time()]);
        }
    }

    /** Recorded bootstrap provenance expires if its live bytes were changed. */
    public static function verified(Database $db,SiteWorkspace $workspace):array
    {
        $out=[];
        foreach($db->query('SELECT path,sha256 FROM site_shipped_provenance') as $row) {
            if((self::FILES[$row['path']]??null)!==$row['sha256'])continue;
            if(self::hash($workspace->resolvePublished($row['path']))===$row['sha256'])$out[$row['path']]=$row['sha256'];
        }
        ksort($out,SORT_STRING);return $out;
    }

    private static function hash(string $path):?string
    {
        clearstatcache(true,$path);
        $before=@lstat($path);
        if(!$before || !is_file($path) || is_link($path) || $before['size']>2097152)return null;
        $bytes=file_get_contents($path,false,null,0,$before['size']+1);
        $again=file_get_contents($path,false,null,0,$before['size']+1);
        clearstatcache(true,$path);$after=lstat($path);
        if($bytes===false || !$after || is_link($path) || $before['ino']!==$after['ino']
            || strlen($bytes)!==$before['size'] || strlen($bytes)!==$after['size'] || $bytes!==$again)return null;
        return hash('sha256',$bytes);
    }
}
