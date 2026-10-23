<?php
declare(strict_types=1);
namespace VoxelSite\Agent;

/** System destinations are explicit; an archive cannot adopt website or hosting files. */
final class UpdatePackagePolicy
{
    public const MAX_ARCHIVE_BYTES=134217728;
    public const MAX_INFLATED_BYTES=268435456;
    public const MAX_FILE_BYTES=16777216;
    public const MAX_ENTRIES=8000;
    public const BRIDGE='_studio/update-runtime.php';
    public static function gateContract(string $bytes,string $path):bool
    {
        $code='';
        foreach(token_get_all($bytes) as $token){
            if(is_array($token)){if(in_array($token[0],[T_OPEN_TAG,T_WHITESPACE,T_COMMENT,T_DOC_COMMENT],true))continue;$code.=$token[1];}
            else $code.=$token;
            if(strlen($code)>1024)break;
        }
        $gate=match($path){'_studio/engine/bootstrap.php'=>"dirname(__DIR__).'/update-gate.php'",'_studio/mcp.php'=>"__DIR__.'/update-gate.php'",'submit.php'=>"__DIR__.'/_studio/update-gate.php'",default=>null};
        if ($gate === null) return false;
        $require = 'require_once'.$gate.';';
        // Also accept the exact fail-closed compatibility guard for the 1.32.0
        // updater, which can replace bootstrap before it copies the new bridge.
        // No application statement may run before either form of the gate.
        $guard = 'if(!is_file('.$gate.')){http_response_code(503);'
            . "header('Content-Type:application/json');echo'{\"error\":\"update_runtime_missing\"}';exit;}";
        return str_starts_with($code, 'declare(strict_types=1);'.$require)
            || str_starts_with($code, 'declare(strict_types=1);'.$guard.$require);
    }
    public static function canonical(string $path):string
    {
        if($path===''||strlen($path)>240||!preg_match('~^[A-Za-z0-9_.@/+ -]+$~D',$path)||str_contains($path,'//')||str_starts_with($path,'/')||str_contains($path,'\\'))throw new OperationException('invalid_package','An archive entry has an unsupported path.');
        foreach(explode('/',$path) as $part)if($part===''||$part==='.'||$part==='..'||preg_match('/[. ]$/D',$part)||preg_match('/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/iD',$part))throw new OperationException('invalid_package','An archive entry has an unsafe path component.');
        return $path;
    }
    public static function managed(string $path):bool
    {
        self::canonical($path);
        if(in_array($path,['VERSION','composer.json','composer.lock','LICENSE','README.md','submit.php','actions-bar.css','actions-bar.js'],true))return true;
        // The recovery bridge and mutable data never belong to package activation.
        if(in_array($path,[self::BRIDGE,'_studio/update-gate.php'],true))return false;
        foreach(['_studio/engine/','_studio/api/','_studio/ui/','_studio/static/','_studio/prompts/','_studio/action-templates/','_studio/worker/','vendor/','assets/icons/','assets/library/'] as $prefix)if(str_starts_with($path,$prefix))return true;
        return in_array($path,['_studio/index.php','_studio/install.php','_studio/mcp.php','_studio/workspace.php','_studio/agent-capabilities.json', '_studio/mcp-client-qualification.json','_studio/data/default-index.php','_studio/data/default-unpublish-index.php','_studio/data/demo-root-actions-bar.php'],true);
    }
    /** Metadata validation never executes archive code or follows entry links. */
    public static function inventory(\ZipArchive $zip):array
    {
        if($zip->numFiles<1||$zip->numFiles>self::MAX_ENTRIES)throw new OperationException('size_limit','The update archive exceeds its entry budget.');
        $raw=[];$seen=[];$total=0;$prefix=null;
        for($i=0;$i<$zip->numFiles;$i++){
            $stat=$zip->statIndex($i);if(!$stat)throw new OperationException('invalid_package','Could not inspect an archive entry.');
            $name=$stat['name'];$dir=str_ends_with($name,'/');$trim=$dir?substr($name,0,-1):$name;self::canonical($trim);
            $fold=strtolower($trim);if(isset($seen[$fold]))throw new OperationException('invalid_package','The archive repeats a path or case-insensitive destination.');$seen[$fold]=true;
            $opsys=0;$attributes=0;if(!$zip->getExternalAttributesIndex($i,$opsys,$attributes))throw new OperationException('invalid_package','Archive attributes are unavailable.');
            $mode=($attributes>>16)&0170000;
            if($opsys===3&&(!in_array($mode,[0,0100000,0040000],true)||($mode===0040000&&!$dir)||($mode===0100000&&$dir)))throw new OperationException('invalid_package','Links and special files are not supported in updates.');
            if(($stat['encryption_method']??0)!==0)throw new OperationException('invalid_package','Encrypted update entries are unsupported.');
            $size=(int)$stat['size'];$compressed=(int)$stat['comp_size'];
            if($size<0||$size>self::MAX_FILE_BYTES||$compressed<0||($size>1048576&&$size>max(1,$compressed)*500))throw new OperationException('size_limit','An update entry exceeds its size or expansion budget.');
            $total+=$size;if($total>self::MAX_INFLATED_BYTES)throw new OperationException('size_limit','The update archive exceeds its expanded byte budget.');
            $raw[]=['index'=>$i,'name'=>$name,'directory'=>$dir,'bytes'=>$size,'crc'=>(int)$stat['crc']];
        }
        $files=array_values(array_filter($raw,fn($entry)=>!$entry['directory']));
        $names=array_column($files,'name');
        if(in_array('VERSION',$names,true))$prefix='';
        else foreach($names as $name)if(preg_match('~^([^/]+)/VERSION$~D',$name,$match)){$prefix=$match[1].'/';break;}
        if($prefix===null)throw new OperationException('invalid_package','The update package has no root VERSION file.');
        $entries=[];$skipped=0;$destinations=[];
        foreach($raw as $entry){
            if($prefix!==''&&!str_starts_with($entry['name'],$prefix))throw new OperationException('invalid_package','Every archive entry must share its single wrapper directory.');
            $path=substr($entry['name'],strlen($prefix));if($path===''||$entry['directory'])continue;self::canonical($path);
            $destinations[$path]=true;
            if(!self::managed($path)){$skipped++;continue;}
            $entries[]=['path'=>$path]+$entry;
        }
        foreach(array_keys($destinations) as $path){$parent=dirname($path);while($parent!=='.'){if(isset($destinations[$parent]))throw new OperationException('invalid_package','An archive file also names a parent directory.');$parent=dirname($parent);}}
        $versionEntry=array_values(array_filter($entries,fn($entry)=>$entry['path']==='VERSION'))[0]??null;
        if(!$versionEntry||$versionEntry['bytes']>64)throw new OperationException('invalid_package','The update version is missing or invalid.');
        $version=trim(self::entryBytes($zip,$versionEntry));
        if(!preg_match('/^\d{1,4}(?:\.\d{1,4}){2,4}(?:-[A-Za-z0-9.-]{1,40})?$/D',$version))throw new OperationException('invalid_package','The update version must be a bounded version number.');
        usort($entries,fn($a,$b)=>strcmp($a['path'],$b['path']));
        return ['version'=>$version,'entries'=>$entries,'skipped_files'=>$skipped,'expanded_bytes'=>$total];
    }
    public static function entryBytes(\ZipArchive $zip,array $entry):string
    {
        $stream=$zip->getStream($entry['name']);if(!is_resource($stream))throw new OperationException('invalid_package','An archive entry could not be opened.');
        try{$bytes=stream_get_contents($stream,$entry['bytes']+1);if($bytes===false||strlen($bytes)!==$entry['bytes']||!feof($stream)&&fread($stream,1)!=='')throw new OperationException('invalid_package','An archive entry does not match its declared size.');}
        finally{fclose($stream);}
        if(sprintf('%08x',crc32($bytes))!==sprintf('%08x',$entry['crc']))throw new OperationException('invalid_package','An archive entry failed its integrity check.');
        return $bytes;
    }
}
