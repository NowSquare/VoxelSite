<?php
declare(strict_types=1);
namespace VoxelSite\Agent;

/** Static URL literals only. Dynamic PHP/JS expressions are never guessed. */
final class AssetReferenceIndex
{
    public static function find(array $files,string $asset,?string $replacement=null): array
    {
        $references=[];$rewrites=[];
        foreach ($files as $file=>$content) {
            if ($file===AssetManagementService::CATALOG || in_array(SitePathPolicy::type($file),['binary','derived'],true)) continue;
            $pattern='~(["\'`])([^"\'`\r\n]{1,4096})\1|url\(\s*([^)\s"\'`]{1,2048})\s*\)~';
            preg_match_all($pattern,$content,$matches,PREG_SET_ORDER|PREG_OFFSET_CAPTURE);
            $foundOffsets=[];
            foreach ($matches as $match) {
                [$value,$base]=isset($match[3]) && $match[3][1]>=0?$match[3]:$match[2];
                preg_match_all('~[^\s,]+~',$value,$tokens,PREG_OFFSET_CAPTURE);
                foreach ($tokens[0] as [$token,$offset]) {
                    $decoded=str_replace('\\/','/',$token);
                    $json=pathinfo($file,PATHINFO_EXTENSION)==='json';
                    if ($json) {
                        $value=json_decode('"'.$token.'"',true);
                        if (is_string($value)) $decoded=$value;
                    }
                    if (self::resolve($file,$decoded)!==$asset) continue;
                    $absolute=$base+$offset;
                    if (isset($foundOffsets[$absolute])) continue;
                    $foundOffsets[$absolute]=strlen($token);
                    $next=$replacement===null?null:self::replacementUrl($file,$decoded,$replacement);
                    if ($next!==null && $json) $next=substr(json_encode($next,JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR),1,-1);
                    elseif ($next!==null && str_contains($token,'\\/')) $next=str_replace('/','\\/',$next);
                    $references[]=['path'=>$asset,'source_file'=>$file,'line'=>substr_count(substr($content,0,$absolute),"\n")+1,
                        'source_url'=>$token,'replacement_url'=>$next];
                    if ($next!==null) $rewrites[$file][]=['offset'=>$absolute,'length'=>strlen($token),'value'=>$next];
                    if (count($references)>500) throw new OperationException('size_limit','This asset has more than 500 static references. Split its migration into smaller reviews.');
                }
            }
            // Detect direct asset-path mentions outside supported URL literals.
            // Such expressions need an explicit authoring edit before a move/delete.
            foreach (array_unique([$asset,str_replace('/','\\/',$asset),implode('/',array_map('rawurlencode',explode('/',$asset)))]) as $needle) {
                $position=0;
                while (($position=strpos($content,$needle,$position))!==false) {
                    $covered=false;
                    foreach ($foundOffsets as $start=>$length) {
                        if ($position>=$start && $position+strlen($needle)<=$start+$length) {$covered=true;break;}
                    }
                    if (!$covered && $replacement!==null) throw new OperationException('invalid_schema',
                        'An asset reference is outside a supported static URL. Edit that source explicitly before moving the asset.',
                        ['source_file'=>$file,'line'=>substr_count(substr($content,0,$position),"\n")+1]);
                    if (!$covered) {
                        $references[]=['path'=>$asset,'source_file'=>$file,'line'=>substr_count(substr($content,0,$position),"\n")+1,
                            'source_url'=>$needle,'replacement_url'=>null];
                        if (count($references)>500) throw new OperationException('size_limit','This asset exceeds the reference inspection limit.');
                    }
                    $position+=strlen($needle);
                }
            }
        }
        $updated=[];
        foreach ($rewrites as $file=>$edits) {
            usort($edits,static fn($a,$b)=>$b['offset']<=>$a['offset']);$text=$files[$file];
            foreach ($edits as $edit) $text=substr_replace($text,$edit['value'],$edit['offset'],$edit['length']);
            $updated[$file]=$text;
        }
        return ['references'=>$references,'files'=>$updated];
    }

    private static function resolve(string $source,string $url): ?string
    {
        if ($url==='' || str_contains($url,'$') || str_contains($url,'\\') || str_starts_with($url,'//')
            || preg_match('~^[a-z][a-z0-9+.-]*:~i',$url)) return null;
        $path=rawurldecode(preg_split('/[?#]/',$url,2)[0]);
        $joined=str_starts_with($path,'/')?ltrim($path,'/'):(dirname($source)==='.'?'':dirname($source).'/').$path;
        $parts=[];
        foreach (explode('/',$joined) as $segment) {
            if ($segment==='' || $segment==='.') continue;
            if ($segment==='..') {if (!$parts) return null;array_pop($parts);} else $parts[]=$segment;
        }
        $resolved=implode('/',$parts);
        try {SitePathPolicy::canonical($resolved);} catch (OperationException) {return null;}
        return SitePathPolicy::type($resolved)==='binary'?$resolved:null;
    }
    private static function replacementUrl(string $source,string $original,string $replacement): string
    {
        $suffix=preg_match('/[?#].*$/',$original,$match)?$match[0]:'';
        if (str_starts_with($original,'/')) return '/'.implode('/',array_map('rawurlencode',explode('/',$replacement))).$suffix;
        $sourceParts=dirname($source)==='.'?[]:explode('/',dirname($source));$targetParts=explode('/',$replacement);
        while ($sourceParts && $targetParts && $sourceParts[0]===$targetParts[0]) {array_shift($sourceParts);array_shift($targetParts);}
        $path=str_repeat('../',count($sourceParts)).implode('/',array_map('rawurlencode',$targetParts));
        if (str_starts_with($original,'./') && !str_starts_with($path,'../')) $path='./'.$path;
        return $path.$suffix;
    }
}
