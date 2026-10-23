<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\SiteWorkspace;

/** Legacy configuration is visible for explicit migration; reads never backfill files. */
final class ActionConfiguration
{
    /** Locate private configuration without requiring a healthy draft during recovery wiring. */
    public static function draftPath(SiteWorkspace $workspace):string {return SiteWorkspace::resolveWithin($workspace->draftRoot(),'assets/data/site.json');}
    public static function legacyPath(SiteWorkspace $workspace):string {return dirname($workspace->draftRoot()).'/assets/data/site.json';}
    public static function legacyBar(SiteWorkspace $workspace,?string $sitePath=null):?array
    {
        $canonical=$workspace->resolveDraft('assets/data/site.json');
        if($sitePath!==null&&$sitePath!==$canonical)return null;
        $draft=BusinessContracts::read(dirname($canonical),basename($canonical),1048576);
        $data=json_decode($draft??'{}',true,32,JSON_THROW_ON_ERROR);
        if(array_key_exists('actions_bar',$data))return null;
        $path=self::legacyPath($workspace);$bytes=BusinessContracts::read(dirname($path),basename($path),1048576);
        $legacy=json_decode($bytes??'{}',true,32,JSON_THROW_ON_ERROR);
        return is_array($legacy['actions_bar']??null)?$legacy['actions_bar']:null;
    }
    public static function assertPublishReady(SiteWorkspace $workspace):void
    {
        if(self::legacyBar($workspace)!==null)throw new OperationException('configuration_migration_required','Review and save Actions Bar settings in Studio before publishing. Your legacy settings remain available there and have not been changed.');
    }
}
