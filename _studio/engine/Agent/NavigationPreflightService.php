<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Database,NavLinksParser,SiteMutationLock,SiteWorkspace};

/** Exact navigation diagnostics without normalization, execution or registry sync. */
final class NavigationPreflightService
{
    public function __construct(private Database $db,private ActorPolicy $policy,private SiteWorkspace $workspace){}
    public static function inputSchema():array{return ToolContracts::object(['page_file'=>ToolContracts::path()]);}
    public static function outputSchema():array
    {
        $c=ToolContracts::class;$entry=$c::object(['href'=>$c::text(2048),'label'=>$c::text(1000),'home'=>['type'=>'boolean']],['href','label']);
        $parent=$entry;$parent['properties']['children']=$c::list($entry,500);
        return $c::object(['navStatus'=>['enum'=>['canonical','nav_missing','nav_parse_error','needs_normalization','unsupported_layout']],
            'isInNav'=>['type'=>'boolean'],'isHomepage'=>['type'=>'boolean'],'currentPosition'=>$c::nullable($c::object([
                'parentHref'=>$c::nullable($c::text(2048)),'index'=>$c::integer(500),'siblingCount'=>$c::integer(500)])),
            'navTree'=>$c::list($parent,500),'hasHomeEntry'=>['type'=>'boolean'],'provider_calls'=>['const'=>0]]);
    }
    private function readSource():?string
    {
        try{return BusinessContracts::read($this->workspace->draftRoot(),'_partials/nav.php',1048576);}
        catch(OperationException $error){throw $error;}
        catch(\RuntimeException $error){throw new OperationException('invalid_path','Navigation source must remain inside the private workspace without links.');}
    }
    public function read(OperationActor $actor,\stdClass $input):array
    {
        return ProviderCallPolicy::runExternal(function()use($actor,$input):array{
            $this->policy->require($actor,['site:read','files:read']);JsonSchema::validate($input,self::inputSchema());
            $path=SitePathPolicy::canonical($input->page_file);
            if(SitePathPolicy::type($path)!=='page')throw new OperationException('invalid_path','Choose a managed page file.');
            $lock=SiteMutationLock::acquire($this->workspace->mutationLockPath(),$this->db);$this->workspace->assertReady();
            $page=$this->db->queryOne('SELECT slug,file_path,is_homepage FROM pages WHERE file_path=?',[$path]);
            if($page===null)throw new OperationException('not_found','This page has no retained page record.');
            $source=$this->readSource();
            $home=(bool)$page['is_homepage'];$href=$home?'/':'/'.$page['slug'];
            $status='nav_missing';$nav=null;
            if($source!==null){
                $nav=NavLinksParser::parse($source);
                if($nav!==null)$status='canonical';
                elseif(NavLinksParser::hasNavLinksBlock($source))$status='nav_parse_error';
                elseif(NavLinksParser::checkLayoutCompatibility($source)!==null)$status='unsupported_layout';
                else{$nav=NavLinksParser::extractFromLegacyNav($source);$status=$nav===null?'unsupported_layout':'needs_normalization';}
            }
            $inside=$nav!==null&&NavLinksParser::isInNav($nav,$href);
            $result=['navStatus'=>$status,'isInNav'=>$inside,'isHomepage'=>$home,
                'currentPosition'=>$inside?NavLinksParser::findPosition($nav,$href):null,
                'navTree'=>$nav===null?[]:NavLinksParser::getMovableTree($nav),'hasHomeEntry'=>$nav!==null&&NavLinksParser::hasHomeEntry($nav),'provider_calls'=>0];
            if(strlen(CanonicalJson::encode($result))>131072)throw new OperationException('size_limit','Navigation diagnostics exceed the 128 KiB read budget.');
            JsonSchema::validate(JsonSchema::output($result),self::outputSchema());
            if($source!==$this->readSource()
                ||$page!==$this->db->queryOne('SELECT slug,file_path,is_homepage FROM pages WHERE file_path=?',[$path]))
                throw new OperationException('content_conflict','Navigation or page metadata changed during inspection. Read it again.');
            return $result;
        });
    }
}
