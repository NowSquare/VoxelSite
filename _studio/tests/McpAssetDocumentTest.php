<?php
declare(strict_types=1);
require_once dirname(__DIR__).'/engine/bootstrap.php';
require __DIR__.'/fixtures/mcp/ServiceFixture.php';
use VoxelSite\Agent\{AssetDocumentValidator,AssetTransferService,OperationException};
use VoxelSite\SiteWorkspace;
$checks=0;
function documentCheck(bool $ok,string $label):void {global $checks;$checks++;if(!$ok)throw new RuntimeException('FAIL '.$label);echo 'PASS '.$label."\n";}
function documentReject(callable $call,string $label):void {try{$call();}catch(OperationException $e){documentCheck($e->errorCode==='invalid_schema',$label.' ['.$e->errorCode.']');return;}documentCheck(false,$label);}
function documentZip(string $root,string $type,array $extra=[]):string {
    $main=$type==='docx'?'word/document.xml':'xl/workbook.xml';
    $content=$type==='docx'?'application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml';
    $xml=$type==='docx'?'<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p/></w:body></w:document>'
        :'<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheets/></workbook>';
    $entries=['[Content_Types].xml'=>'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Override PartName="/'.$main.'" ContentType="'.$content.'"/></Types>',
        '_rels/.rels'=>'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="'.$main.'"/></Relationships>',
        $main=>$xml];
    $file=$root.'/package-'.bin2hex(random_bytes(4)).'.zip';$zip=new ZipArchive();$zip->open($file,ZipArchive::CREATE);
    foreach(array_merge($entries,$extra) as $path=>$bytes)$zip->addFromString($path,$bytes);$zip->close();
    return file_get_contents($file);
}
function documentCfb(string $type):string {
    $header=str_repeat("\0",512);
    $set=static function(string &$data,int $offset,string $value):void {$data=substr_replace($data,$value,$offset,strlen($value));};
    $set($header,0,"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1");$set($header,24,pack('vvvvv',0x003e,3,0xfffe,9,6));
    $set($header,44,pack('V*',1,1,0,4096,0xfffffffe,0,0xfffffffe,0));
    $set($header,76,pack('V*',0,...array_fill(0,108,0xffffffff)));
    $fat=array_fill(0,128,0xffffffff);$fat[0]=0xfffffffd;$fat[1]=0xfffffffe;
    for($i=2;$i<=17;$i++)$fat[$i]=in_array($i,[9,17],true)?0xfffffffe:$i+1;
    $entry=static function(string $name,int $type,int $start,int $length):string {
        $bytes=str_repeat("\0",128);$encoded=mb_convert_encoding($name."\0",'UTF-16LE','UTF-8');
        $bytes=substr_replace($bytes,$encoded,0,strlen($encoded));$bytes=substr_replace($bytes,pack('vCC',strlen($encoded),$type,1),64,4);
        $bytes=substr_replace($bytes,pack('V*',0xffffffff,0xffffffff,$type===5?1:0xffffffff),68,12);
        return substr_replace($bytes,pack('VVV',$start,$length,0),116,12);
    };
    $directory=$entry('Root Entry',5,0xfffffffe,0).$entry($type==='doc'?'WordDocument':'Workbook',2,2,4096)
        .$entry($type==='doc'?'0Table':'Metadata',2,10,4096).str_repeat("\0",128);
    $stream=$type==='doc'?pack('v',0xa5ec).str_repeat("\0",4094)
        :pack('vvvvVV',0x0809,8,0x0600,0x0005,0,0x0fec00ff).str_repeat("\0",4076).pack('vv',0x000a,0);
    return $header.pack('V*',...$fat).$directory.$stream.str_repeat("\0",4096);
}
[$root,$db,$workspace,$policy,$actors,$credentials,$owner]=mcpServiceFixture();
$service=new AssetTransferService($db,$policy,$workspace,$root.'/_studio/data/document-uploads',1048576);$sequence=0;
$before=SiteWorkspace::inventory($workspace->draftRoot());$live=SiteWorkspace::inventory($root.'/assets');
$upload=function(string $bytes,string $path,string $mime)use($service,$actors,&$sequence):array {
    $id='document-upload-'.(++$sequence);$record=$service->begin($actors['writer'],(object)['request_id'=>$id,'path'=>$path,'bytes'=>strlen($bytes),'sha256'=>hash('sha256',$bytes),'mime_type'=>$mime]);
    for($offset=0;$offset<strlen($bytes);$offset+=262144){
        $part=substr($bytes,$offset,262144);$service->chunk($actors['writer'],(object)['request_id'=>$id.'-'.$offset,'upload_id'=>$record['upload_id'],'offset'=>$offset,'data_base64'=>base64_encode($part),'sha256'=>hash('sha256',$part)]);
    }
    $result=$service->finish($actors['writer'],(object)['request_id'=>$id.'-finish','upload_id'=>$record['upload_id']]);
    documentCheck($service->finalizedBytes($actors['writer'],$result['upload_id'],$path)===$bytes,'Validated '.$path.' preserves exact downloadable bytes');
    return $result;
};
$upload("# Read me\n\nA downloadable document.\n",'assets/files/readme.md','text/markdown');
$png=file_get_contents(__DIR__.'/fixtures/mcp/site-lifecycle/site/assets/images/workshop.png');
$ico=pack('vvv',0,1,1).pack('CCCCvvVV',32,24,0,0,1,32,strlen($png),22).$png;
$icon=$upload($ico,'assets/images/favicon.ico','image/x-icon');documentCheck($icon['image']['width']===32&&$icon['image']['height']===24,'ICO directory dimensions are verified');
$docx=documentZip($root,'docx');$xlsx=documentZip($root,'xlsx');
$doc=documentCfb('doc');$xls=documentCfb('xls');
$upload($docx,'assets/files/document.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document');
$upload($xlsx,'assets/files/workbook.xlsx','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
$upload($doc,'assets/files/document.doc','application/msword');
$upload($xls,'assets/files/workbook.xls','application/vnd.ms-excel');
$sample=documentZip($root,'docx',['word/document.xml'=>'<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t><![CDATA[<?php echo "Example";]]></w:t></w:r></w:p></w:body></w:document>']);
$upload($sample,'assets/files/php-example.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document');
$sampleBinary=substr_replace($doc,'<?php echo "Example";',1536+100,strlen('<?php echo "Example";'));
$upload($sampleBinary,'assets/files/php-example.doc','application/msword');
documentReject(fn()=>$upload("<?php echo 1;\n",'assets/files/script.md','text/markdown'),'Markdown cannot contain executable PHP');
documentReject(fn()=>$upload($png,'assets/images/not-icon.ico','image/x-icon'),'A PNG renamed to ICO is not an icon container');
documentReject(fn()=>$upload($ico.'MZpayload','assets/images/trailing.ico','image/x-icon'),'ICO cannot hide trailing executable bytes');
documentReject(fn()=>$upload($xlsx,'assets/files/misleading.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document'),'Spreadsheet package cannot masquerade as Word');
documentReject(fn()=>$upload($xls,'assets/files/misleading.doc','application/msword'),'Workbook compound file cannot masquerade as Word');
documentReject(fn()=>$upload(documentZip($root,'docx',['word/vbaProject.bin'=>'macro']), 'assets/files/macros.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document'),'Office macro payload is rejected');
documentReject(fn()=>$upload(documentZip($root,'docx',['word/embeddings/object.bin'=>'embedded']), 'assets/files/embedded.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document'),'Embedded Office objects are rejected');
documentReject(fn()=>$upload(documentZip($root,'docx',['../outside.xml'=>'<data/>']), 'assets/files/traversal.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document'),'ZIP traversal paths are rejected');
documentReject(fn()=>$upload(documentZip($root,'docx',['word/script.xml'=>'<!DOCTYPE x [<!ENTITY y SYSTEM "file:///etc/passwd">]><x>&y;</x>']), 'assets/files/entity.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document'),'Office XML entities cannot read server files');
$cycle=substr_replace($doc,pack('V',2),512+2*4,4);
documentReject(fn()=>AssetDocumentValidator::officeBinary($cycle,'doc','application/msword'),'Compound stream allocation cycles are rejected');
documentReject(fn()=>AssetDocumentValidator::officeBinary(substr($doc,0,-7),'doc','application/msword'),'Truncated compound sectors fail with a schema error');
$outside=substr_replace($doc,pack('V',999999),76,4);
documentReject(fn()=>AssetDocumentValidator::officeBinary($outside,'doc','application/msword'),'Out-of-bounds FAT sector fails with a schema error');
$miniHeader=substr($doc,0,512);
$miniHeader=substr_replace($miniHeader,pack('VV',2,1),60,8);
$miniFat=array_fill(0,128,0xffffffff);$miniFat[0]=0xfffffffd;$miniFat[1]=0xfffffffe;$miniFat[2]=0xfffffffe;$miniFat[3]=0xfffffffe;
$miniDirectory=substr($doc,1024,512);
$miniDirectory=substr_replace($miniDirectory,pack('VVV',3,512,0),116,12);
$miniDirectory=substr_replace($miniDirectory,pack('VVV',0,32,0),128+116,12);
$miniDirectory=substr_replace($miniDirectory,pack('VVV',1,64,0),256+116,12);
$miniAllocation=array_fill(0,128,0xffffffff);$miniAllocation[0]=0xfffffffe;$miniAllocation[1]=0xfffffffe;
$mini=$miniHeader.pack('V*',...$miniFat).$miniDirectory.pack('V*',...$miniAllocation).pack('v',0xa5ec).str_repeat("\0",510);
$upload($mini,'assets/files/mini-document.doc','application/msword');
$miniCycle=substr_replace($mini,pack('V',0),1536,4);
documentReject(fn()=>AssetDocumentValidator::officeBinary($miniCycle,'doc','application/msword'),'Mini stream cycles fail with a schema error');
$miniExcess=substr_replace($mini,pack('V',513),64,4);
documentReject(fn()=>AssetDocumentValidator::officeBinary($miniExcess,'doc','application/msword'),'Excessive mini allocation chains fail before reading');
$encrypted=substr_replace($doc,pack('v',0x0100),1536+10,2);
documentReject(fn()=>AssetDocumentValidator::officeBinary($encrypted,'doc','application/msword'),'Encrypted binary Word payload is rejected');
$macro=substr_replace($doc,str_pad(mb_convert_encoding("VBA\0",'UTF-16LE','UTF-8'),64,"\0"),1024+256,64);
$macro=substr_replace($macro,pack('v',8),1024+256+64,2);
documentReject(fn()=>AssetDocumentValidator::officeBinary($macro,'doc','application/msword'),'Binary Office VBA storage is rejected');
documentCheck(SiteWorkspace::inventory($workspace->draftRoot())===$before && SiteWorkspace::inventory($root.'/assets')===$live,'Document validation never mutates draft or live assets');
echo "$checks document asset checks passed\n";
