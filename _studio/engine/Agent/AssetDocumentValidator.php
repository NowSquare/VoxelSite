<?php
declare(strict_types=1);
namespace VoxelSite\Agent;

/** Structural validation for inert downloadable assets; never executes document content. */
final class AssetDocumentValidator
{
    public static function icon(string $bytes): array
    {
        if (strlen($bytes)<22 || substr($bytes,0,4)!=="\0\0\1\0") self::invalid();
        $count=self::u16($bytes,4);$end=6+16*$count;
        if ($count<1 || $count>128 || $end>strlen($bytes)) self::invalid();
        $ranges=[];$largest=[0,0];
        for($i=0;$i<$count;$i++) {
            $entry=6+16*$i;$width=ord($bytes[$entry])?:256;$height=ord($bytes[$entry+1])?:256;
            $size=self::u32($bytes,$entry+8);$start=self::u32($bytes,$entry+12);
            if ($size<40 || $start<$end || $start+$size>strlen($bytes)) self::invalid();
            $image=substr($bytes,$start,$size);
            if (str_starts_with($image,"\x89PNG\r\n\x1a\n")) {
                $dimensions=@getimagesizefromstring($image);
                if (!$dimensions || $dimensions[0]!==$width || $dimensions[1]!==$height
                    || substr($image,-12)!=="\0\0\0\0IEND\xaeB`\x82") self::invalid();
            } else {
                $header=self::u32($image,0);$bits=self::u16($image,14);
                if (!in_array($header,[40,108,124],true) || $header>$size || self::u32($image,4)!==$width
                    || self::u32($image,8)!==2*$height || self::u16($image,12)!==1
                    || !in_array($bits,[1,4,8,16,24,32],true) || self::u32($image,16)!==0) self::invalid();
                $colors=$bits<=8?(self::u32($image,32)?:1<<$bits):0;
                $pixels=(int)ceil($width*$bits/32)*4*$height;
                $mask=(int)ceil($width/32)*4*$height;
                if ($size!==$header+4*$colors+$pixels+$mask) self::invalid();
            }
            $ranges[]=[$start,$start+$size];
            if ($width*$height>$largest[0]*$largest[1]) $largest=[$width,$height];
        }
        sort($ranges);
        foreach($ranges as [$start,$finish]) {if($start!==$end) self::invalid();$end=$finish;}
        if($end!==strlen($bytes)) self::invalid();
        return ['width'=>$largest[0],'height'=>$largest[1],'thumbnail'=>false];
    }

    public static function officeXml(string $path,string $extension,string $mime): void
    {
        if (!class_exists(\ZipArchive::class) || !class_exists(\DOMDocument::class)) {
            throw new OperationException('host_capability_unavailable','This host needs ZIP and DOM to validate Office documents.');
        }
        $expected=$extension==='docx'?'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            :'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        if (!in_array($mime,[$expected,'application/zip','application/octet-stream'],true)) self::invalid();
        $zip=new \ZipArchive();
        if ($zip->open($path,\ZipArchive::CHECKCONS|\ZipArchive::RDONLY)!==true) self::invalid();
        try {
            if ($zip->numFiles<3 || $zip->numFiles>2000) self::invalid();
            $seen=[];$expanded=0;$xml=[];
            $main=$extension==='docx'?'word/document.xml':'xl/workbook.xml';
            for($i=0;$i<$zip->numFiles;$i++) {
                $stat=$zip->statIndex($i);if(!$stat) self::invalid();
                $name=$stat['name'];$lower=strtolower($name);
                if (strlen($name)>240 || !preg_match('~^[A-Za-z0-9_\[\]][A-Za-z0-9_\[\]. /-]*$~D',$name)
                    || str_contains($name,'..') || str_contains($name,'//') || isset($seen[$lower])
                    || ($stat['encryption_method']??0)!==0
                    || preg_match('~(?:^|/)(?:vbaproject|vba|activex|embeddings|encryptedpackage)(?:[./]|$)|\.(?:exe|dll|com|bat|cmd|ps1|js|vbs|php|phar|hta)$~i',$name)) self::invalid();
                $seen[$lower]=true;$expanded+=(int)$stat['size'];
                if ($expanded>33554432 || $stat['size']>8388608
                    || ($stat['size']>1048576 && $stat['size']>max(1,$stat['comp_size'])*200)) self::invalid();
                $opsys=0;$attributes=0;
                if($zip->getExternalAttributesIndex($i,$opsys,$attributes) && (($attributes>>16)&0170000)===0120000) self::invalid();
                if (str_ends_with($name,'/')) continue;
                $body=$zip->getFromIndex($i,8388609);
                if (!is_string($body) || strlen($body)!==$stat['size']
                    || sprintf('%u',crc32($body))!==sprintf('%u',$stat['crc'])
                    || str_starts_with($body,'MZ')) self::invalid();
                if (str_ends_with($lower,'.xml') || str_ends_with($lower,'.rels')) {
                    if (strlen($body)>2097152 || preg_match('/<!DOCTYPE|<!ENTITY/i',$body)) self::invalid();
                    $document=self::xml($body);
                    foreach($document->getElementsByTagName('*') as $element) {
                        if(in_array(strtolower($element->localName),['oleobject','object','control','activexcontrol'],true))self::invalid();
                        foreach(['ContentType','Type'] as $attribute) {
                            if(preg_match('/macroEnabled|vbaProject|oleObject|activeX/i',$element->getAttribute($attribute)))self::invalid();
                        }
                    }
                    if(in_array($name,['[Content_Types].xml','_rels/.rels',$main],true)) $xml[$name]=$document;
                    unset($document);
                }
            }
            $root=$extension==='docx'?'document':'workbook';
            $contentType=$extension==='docx'?'application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml'
                :'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml';
            if (!isset($xml['[Content_Types].xml'],$xml['_rels/.rels'],$xml[$main])
                || $xml[$main]->documentElement?->localName!==$root) self::invalid();
            $match=false;
            foreach($xml['[Content_Types].xml']->getElementsByTagName('Override') as $override) {
                if($override->getAttribute('PartName')==='/'.$main && $override->getAttribute('ContentType')===$contentType) $match=true;
            }
            $relation=false;
            foreach($xml['_rels/.rels']->getElementsByTagName('Relationship') as $entry) {
                if (str_ends_with($entry->getAttribute('Type'),'/officeDocument')
                    && ltrim($entry->getAttribute('Target'),'/')===$main && $entry->getAttribute('TargetMode')!=='External') $relation=true;
            }
            if(!$match || !$relation) self::invalid();
        } finally {$zip->close();}
    }

    public static function officeBinary(string $bytes,string $extension,string $mime): void
    {
        if (!in_array($mime,['application/msword','application/vnd.ms-excel','application/x-ole-storage','application/CDFV2',
            'application/x-cdf','application/octet-stream'],true) || strlen($bytes)<1536
            || substr($bytes,0,8)!=="\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1" || self::u16($bytes,28)!==65534
            || self::u16($bytes,32)!==6 || self::u32($bytes,56)!==4096) self::invalid();
        $version=self::u16($bytes,26);$shift=self::u16($bytes,30);
        if (!(($version===3&&$shift===9)||($version===4&&$shift===12))) self::invalid();
        $size=1<<$shift;$sectors=intdiv(strlen($bytes),$size)-1;
        if (strlen($bytes)%$size || $sectors<2 || $sectors>65536) self::invalid();
        $sector=static function(int $id)use($bytes,$size,$sectors):string {
            if($id<0 || $id>=$sectors) self::invalid();
            return substr($bytes,($id+1)*$size,$size);
        };
        $fatIds=array_values(unpack('V*',substr($bytes,76,436)));
        $difat=self::u32($bytes,68);$difatCount=self::u32($bytes,72);$seen=[];
        if($difatCount>512) self::invalid();
        for($i=0;$i<$difatCount;$i++) {
            if(isset($seen[$difat])) self::invalid();$seen[$difat]=true;
            $values=array_values(unpack('V*',$sector($difat)));$difat=array_pop($values);array_push($fatIds,...$values);
        }
        if($difatCount && $difat!==0xfffffffe) self::invalid();
        $fatIds=array_values(array_filter($fatIds,static fn($id)=>$id!==0xffffffff));
        if(count($fatIds)!==self::u32($bytes,44) || count($fatIds)<1 || count($fatIds)>1024
            || count(array_unique($fatIds))!==count($fatIds)) self::invalid();
        $fat=[];
        foreach($fatIds as $id) array_push($fat,...array_values(unpack('V*',$sector($id))));
        $chain=static function(int $start,array $table,callable $read,int $maximum):string {
            $result='';$visited=[];
            while($start!==0xfffffffe) {
                if(!isset($table[$start]) || isset($visited[$start])) self::invalid();
                $visited[$start]=true;$result.=$read($start);
                if(strlen($result)>$maximum) self::invalid();
                $start=$table[$start];
            }
            return $result;
        };
        $directory=$chain(self::u32($bytes,48),$fat,$sector,262144);$streams=[];$root=null;$totalStreams=0;
        for($i=0;$i<strlen($directory);$i+=128) {
            $entry=substr($directory,$i,128);$type=ord($entry[66]);if($type===0)continue;
            $length=self::u16($entry,64);
            if(!in_array($type,[1,2,5],true)||$length<2||$length>64||$length%2||substr($entry,$length-2,2)!=="\0\0")self::invalid();
            $name=mb_convert_encoding(substr($entry,0,$length-2),'UTF-8','UTF-16LE');
            if(preg_match('/VBA|Macros|_VBA|ObjectPool|Ole10Native|EncryptedPackage|EncryptionInfo/i',$name))self::invalid();
            $record=['start'=>self::u32($entry,116),'size'=>self::u32($entry,120)];
            if(self::u32($entry,124)!==0 || $record['size']>strlen($bytes))self::invalid();
            if($type===5){if($root!==null||$i!==0)self::invalid();$root=$record;}
            elseif($type===2){if(isset($streams[$name]))self::invalid();$streams[$name]=$record;$totalStreams+=$record['size'];}
        }
        if($root===null || $totalStreams>strlen($bytes))self::invalid();
        $miniCount=self::u32($bytes,64);$miniTable=[];
        if($miniCount>512)self::invalid();
        if($miniCount) $miniTable=array_values(unpack('V*',$chain(self::u32($bytes,60),$fat,$sector,$miniCount*$size)));
        $mini=$root['size']?substr($chain($root['start'],$fat,$sector,(int)ceil($root['size']/$size)*$size),0,$root['size']):'';
        $read=static function(array $record)use($mini,$miniTable,$chain,$fat,$sector,$size):string {
            if(!$record['size'])return '';
            if($record['size']<4096){
                $content=$chain($record['start'],$miniTable,static function(int $id)use($mini):string{
                    if($id*64+64>strlen($mini))self::invalid();return substr($mini,$id*64,64);
                },(int)ceil($record['size']/64)*64);
            }else $content=$chain($record['start'],$fat,$sector,(int)ceil($record['size']/$size)*$size);
            if(strlen($content)<$record['size'])self::invalid();
            return substr($content,0,$record['size']);
        };
        foreach($streams as $record) { $stream=$read($record);if(str_starts_with($stream,'MZ'))self::invalid(); }
        if($extension==='doc') {
            if(!isset($streams['WordDocument']) || !(isset($streams['0Table'])||isset($streams['1Table'])))self::invalid();
            $word=$read($streams['WordDocument']);
            if(strlen($word)<32 || self::u16($word,0)!==0xa5ec || (self::u16($word,10)&0x8100)!==0)self::invalid();
        }else {
            $record=$streams['Workbook']??$streams['Book']??null;if($record===null)self::invalid();
            $book=$read($record);$offset=0;$end=false;
            if(strlen($book)<8 || !in_array(self::u16($book,0),[0x0809,0x0409,0x0209,0x0009],true))self::invalid();
            while($offset+4<=strlen($book)) {
                $type=self::u16($book,$offset);$length=self::u16($book,$offset+2);
                if($type===0x002f || $offset+4+$length>strlen($book) || $length>8224)self::invalid();
                if(in_array($type,[0x0809,0x0409,0x0209,0x0009],true) && ($length<4||self::u16($book,$offset+6)===0x0040))self::invalid();
                if($type===0x0085 && $length>=6 && ord($book[$offset+9])===1)self::invalid();
                if($type===0x000a)$end=true;
                $offset+=4+$length;
            }
            if(!$end || $offset!==strlen($book))self::invalid();
        }
    }
    private static function xml(string $bytes): \DOMDocument
    {
        $previous=libxml_use_internal_errors(true);
        try {$dom=new \DOMDocument();if(!$dom->loadXML($bytes,LIBXML_NONET)||!$dom->documentElement)self::invalid();return $dom;}
        finally {libxml_clear_errors();libxml_use_internal_errors($previous);}
    }
    private static function u16(string $bytes,int $offset): int {if($offset+2>strlen($bytes))self::invalid();return unpack('v',substr($bytes,$offset,2))[1];}
    private static function u32(string $bytes,int $offset): int {if($offset+4>strlen($bytes))self::invalid();return unpack('V',substr($bytes,$offset,4))[1];}
    private static function invalid(): never
    {throw new OperationException('invalid_schema','The document container does not match this file type, is damaged, or contains unsupported encrypted or executable content.');}
}
