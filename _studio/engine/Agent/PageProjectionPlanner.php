<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Database,NavLinksParser,PageService};

/** Pure composition of page metadata and the canonical structural transforms. */
final class PageProjectionPlanner
{
    public static function plan(Database $db,array $before,\stdClass $intent,\Closure $structural):array
    {
        $original=$db->query('SELECT * FROM pages ORDER BY id');$pages=$original;$after=$before;
        if(count($pages)>500)throw new OperationException('size_limit','Page management supports at most 500 pages per review.');
        $byFile=array_column($pages,null,'file_path');
        foreach($before as $path=>$content)if(SitePathPolicy::type($path)==='page'&&!isset($byFile[$path]))throw new OperationException('content_conflict','The page registry needs explicit reconciliation before page management.');
        if($intent->type==='page_create') {
            $path=$intent->slug.'.php';SitePathPolicy::canonical($path,true);
            if(isset($before[$path])||isset($byFile[$path]))throw new OperationException('content_conflict','The page already exists.');
            $title=trim($intent->title);self::title($title);$content=$intent->content;
            if($content==='')$content='<?php $page = '.var_export(['title'=>$title,'slug'=>$intent->slug],true).'; ?>'."\n<h1>".htmlspecialchars($title,ENT_QUOTES,'UTF-8')."</h1>\n";
            $after[$path]=PageService::updatePhpMeta($content,$title,$intent->slug);
            $template=$db->query('PRAGMA table_info(pages)');$row=[];
            foreach($template as $column){$default=$column['dflt_value'];$row[$column['name']]=$default===null?null:trim((string)$default,"'\"");}
            $nextId=max((int)$db->scalar("SELECT seq FROM sqlite_sequence WHERE name='pages'"),0,...array_column($pages,'id'))+1;
            $row=array_replace($row,['id'=>$nextId,'slug'=>$intent->slug,'title'=>$title,'file_path'=>$path,'page_type'=>'page','is_homepage'=>$intent->slug==='index'?1:0,'is_published'=>1,'nav_order'=>null,'nav_label'=>null,'created_at'=>now(),'updated_at'=>now()]);
            $pages[]=$row;
            if(isset($after['_partials/nav.php'])){
                $nav=self::nav($after);$href=$intent->slug==='index'?'/':'/'.$intent->slug;
                if(!NavLinksParser::isInNav($nav,$href)){
                    $entry=['label'=>$title,'href'=>$href];if($href==='/'){$entry['home']=true;array_unshift($nav,$entry);}else $nav[]=$entry;
                    $pages[count($pages)-1]['nav_order']=$href==='/'?null:count($nav)-(NavLinksParser::hasHomeEntry($nav)?1:0);
                    self::writeNav($after,$nav);
                }
            }
        } elseif($intent->type==='pages_reorder') {
            $order=$intent->order;
            if(count($order)!==count(array_unique($order)))throw new OperationException('invalid_schema','Page order cannot contain duplicate slugs.');
            $bySlug=array_column($pages,null,'slug');foreach($order as $slug)if(!isset($bySlug[$slug]))throw new OperationException('content_conflict','A reordered page no longer exists.');
            foreach($pages as &$row){$position=array_search($row['slug'],$order,true);if($position!==false)$row['nav_order']=$position;}unset($row);
            $nav=self::nav($after);$ranks=array_flip($order);
            $sort=function(array $entries)use(&$sort,$ranks):array {
                usort($entries,static function($a,$b)use($ranks):int {
                    if(($a['home']??false)!==($b['home']??false))return ($a['home']??false)?-1:1;
                    return ($ranks[ltrim($a['href'],'/')]??PHP_INT_MAX)<=>($ranks[ltrim($b['href'],'/')]??PHP_INT_MAX);
                });
                foreach($entries as &$entry)if(isset($entry['children']))$entry['children']=$sort($entry['children']);unset($entry);return $entries;
            };self::writeNav($after,$sort($nav));
        } else {
            $path=$intent->page_file;$page=$byFile[$path]??null;
            if(!$page||!isset($before[$path]))throw new OperationException('not_found','Page source not found.');
            if(hash('sha256',$before[$path])!==$intent->expected_hash)throw new OperationException('content_conflict','The page changed after it was displayed.');
            $id=$page['id'];$updates=(array)$intent->values;
            if(isset($updates['content']))$after[$path]=$updates['content'];
            $apply=function(\stdClass $step)use(&$after,&$pages,$structural):void {
                $result=$structural($after,$step,$pages);
                foreach($result['operations'] as $op){if($op->type==='delete')unset($after[$op->path]);else $after[$op->path]=$op->content;}
                $pages=$result['projection']['after'];
            };
            if(isset($updates['title'])&&trim($updates['title'])!==$page['title']) {
                $updates['title']=trim($updates['title']);self::title($updates['title']);
                $apply((object)['type'=>'title','page_file'=>$path,'title'=>$updates['title']]);
            }
            if(isset($updates['slug'])&&$updates['slug']!==$page['slug']) {
                if(str_contains($page['slug'],'/')){$apply((object)['type'=>'move','page_file'=>$path,'target_parent'=>'','target_index'=>null]);$path=basename($path);}
                if($updates['slug']!==substr($path,0,-4)){$apply((object)['type'=>'url','page_file'=>$path,'new_slug'=>$updates['slug']]);$path=$updates['slug'].'.php';}
            }
            foreach($pages as &$row)if($row['id']===$id){
                foreach(['nav_label','nav_order','is_published','is_homepage'] as $field)if(array_key_exists($field,$updates))$row[$field]=in_array($field,['is_published','is_homepage'],true)?(int)$updates[$field]:$updates[$field];
                if(isset($updates['content']))$after[$path]=PageService::updatePhpMeta($after[$path],$row['title'],$row['slug']);
            }unset($row);
            if(($updates['is_homepage']??false)===true)foreach($pages as &$row)if($row['id']!==$id)$row['is_homepage']=0;unset($row);
            if(array_key_exists('nav_label',$updates)||array_key_exists('nav_order',$updates)){
                $nav=self::nav($after);$current=array_values(array_filter($pages,fn($r)=>$r['id']===$id))[0];$href=$current['slug']==='index'?'/':'/'.$current['slug'];
                $walk=function(array $entries)use(&$walk,$href,$current,$updates):array {
                    foreach($entries as &$entry){if($entry['href']===$href&&array_key_exists('nav_label',$updates))$entry['label']=$current['nav_label']?:$current['title'];if(isset($entry['children']))$entry['children']=$walk($entry['children']);}unset($entry);
                    if(array_key_exists('nav_order',$updates)&&$updates['nav_order']!==null){$index=null;foreach($entries as $i=>$entry)if($entry['href']===$href&&!($entry['home']??false))$index=$i;if($index!==null){$entry=$entries[$index];array_splice($entries,$index,1);$position=min(count($entries),$updates['nav_order']);if(($entries[0]['home']??false)&&$position===0)$position=1;array_splice($entries,$position,0,[$entry]);}}
                    return $entries;
                };self::writeNav($after,$walk($nav));
            }
        }
        $prior=array_column($original,null,'id');
        foreach($pages as &$row)if(isset($prior[$row['id']])&&$row!==$prior[$row['id']])$row['updated_at']=now();unset($row);
        $ops=[];foreach(array_unique(array_merge(array_keys($before),array_keys($after))) as $path){
            if(($before[$path]??null)===($after[$path]??null))continue;
            $op=(object)['type'=>!isset($before[$path])?'create':(!isset($after[$path])?'delete':'replace'),'path'=>$path,'expected_hash'=>isset($before[$path])?hash('sha256',$before[$path]):null];
            if(isset($after[$path]))$op->content=$after[$path];$ops[]=$op;
        }
        return ['operations'=>$ops,'projection'=>['before'=>$original,'after'=>array_values($pages),'before_collections'=>$db->query('SELECT id,index_page_id FROM collections ORDER BY id')]];
    }
    private static function title(string $title):void{if($title===''||preg_match('/[\x00-\x1f\x7f]/',$title))throw new OperationException('invalid_schema','Use a nonempty page title without control characters.');}
    private static function nav(array &$files):array {
        $source=$files['_partials/nav.php']??'';$nav=NavLinksParser::parse($source);
        if($nav===null){
            $nav=NavLinksParser::extractFromLegacyNav($source);
            if($nav===null||NavLinksParser::checkLayoutCompatibility($source)!==null)throw new OperationException('invalid_schema','Normalize navigation before changing page labels or order.');
            $normalized=NavLinksParser::normalizeFileContent($source,$nav);
            if(!is_string($normalized))throw new OperationException('invalid_schema','Navigation normalization failed.');
            $files['_partials/nav.php']=$normalized;
        }
        return $nav;
    }
    private static function writeNav(array &$files,array $nav):void {
        $source=NavLinksParser::replaceNavBlock($files['_partials/nav.php'],NavLinksParser::serialize($nav));
        if($source===null)throw new OperationException('invalid_schema','Cannot replace the canonical navigation block.');$files['_partials/nav.php']=$source;
    }
}
