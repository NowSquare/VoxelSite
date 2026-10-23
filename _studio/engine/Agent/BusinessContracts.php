<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\SiteWorkspace;

/** Bounded user-defined fields are data, never handlers, queries or filesystem paths. */
final class BusinessContracts
{
    public static function id():array {return ['type'=>'string','pattern'=>'^[a-z0-9][a-z0-9_-]{0,63}$'];}
    public static function map(int $max=128):array {return ['type'=>'object','properties'=>[],'maxProperties'=>$max,'additionalProperties'=>true];}
    public static function nullableVersion():array {return ToolContracts::nullable(ToolContracts::hash());}
    public static function bounded(mixed $value,int $maximum=65536):array {
        $wire=CanonicalJson::encode($value);
        if(strlen($wire)>$maximum)throw new OperationException('size_limit','Business data exceeds its bounded JSON limit.');
        $walk=function(mixed $item,int $depth=0)use(&$walk):void {
            if($depth>10)throw new OperationException('invalid_schema','Business data is nested too deeply.');
            if(is_array($item)||is_object($item)) {
                if(count((array)$item)>128)throw new OperationException('size_limit','Business data has too many fields or entries.');
                foreach((array)$item as $key=>$child) {
                    if(strlen((string)$key)>128)throw new OperationException('invalid_schema','Business field names are too long.');
                    $walk($child,$depth+1);
                }
            }elseif(is_string($item) && (!mb_check_encoding($item,'UTF-8') || strlen($item)>32768 || str_contains($item,"\0"))) {
                throw new OperationException('invalid_schema','Business text must be bounded UTF-8 without NUL bytes.');
            }
        };$walk($value);return json_decode($wire,true,32,JSON_THROW_ON_ERROR);
    }
    public static function read(string $root,string $relative,int $limit=65536):?string {
        $path=SiteWorkspace::resolveWithin($root,$relative);clearstatcache(true,$path);
        if(!file_exists($path))return null;
        $before=lstat($path);if(!$before || !is_file($path) || is_link($path))throw new OperationException('invalid_path','Business storage must contain regular files.');
        if($before['size']>$limit)throw new OperationException('size_limit','Business source exceeds its read limit.');
        $bytes=file_get_contents($path,false,null,0,$before['size']+1);clearstatcache(true,$path);$after=lstat($path);
        if(!is_string($bytes)||strlen($bytes)!==$before['size']||!$after||is_link($path)||$after['ino']!==$before['ino']||$after['size']!==$before['size']||$after['mtime']!==$before['mtime'])throw new OperationException('content_conflict','Business source changed during its read.');
        return $bytes;
    }
    public static function csvCell(mixed $value):string {
        $text=is_array($value)||is_object($value)?CanonicalJson::encode($value):(string)$value;
        // Excel/LibreOffice also interpret formulas after leading whitespace or controls.
        return preg_match('/^[\x00-\x20]*[=+\-@]/u',$text) || preg_match('/^[\t\r\n]/',$text) ? "'".$text : $text;
    }
}
