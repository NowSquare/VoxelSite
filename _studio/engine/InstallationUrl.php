<?php
declare(strict_types=1);
namespace VoxelSite;

/** Paths from the server's executing script; never a request Host header. */
final class InstallationUrl
{
    public static function studioPath(?string $scriptName=null):string
    {
        $scriptName??=$_SERVER['SCRIPT_NAME']??'/_studio/index.php';
        if (!preg_match('#^(/(?:[a-zA-Z0-9._~!$&()+,;=@-]|%[a-fA-F0-9]{2}|/)*)_studio(?:/|$)#D',$scriptName,$match)) {
            return '/_studio';
        }
        $prefix=$match[1];
        foreach (explode('/',rawurldecode($prefix)) as $segment) {
            if (in_array($segment,['.','..'],true) || str_contains($segment,'\\')
                || preg_match('/[\x00-\x20\x7f]/',$segment)) return '/_studio';
        }
        return $prefix.'_studio';
    }
}
