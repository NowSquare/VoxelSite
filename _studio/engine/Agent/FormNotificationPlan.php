<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
/** Shared deterministic form notification planning; transport is deliberately separate. */
final class FormNotificationPlan
{
    public static function build(array $schema,array $data,array $site,int $recordId,string $fallback,string $source='mcp',string $ip=''):array {
        $config=$schema['notifications']['email']??null;if(!is_array($config)||!($config['enabled']??false))return [];
        $resolve=static function(string $template)use($schema,$data,$site,$recordId,$ip):string {
            return preg_replace_callback('/\{\{([^}]+)\}\}/',static function(array $m)use($schema,$data,$site,$recordId,$ip):string {
                $key=trim($m[1]);if(str_starts_with($key,'site.')){$value=$site;foreach(explode('.',substr($key,5)) as $part)$value=is_array($value)?($value[$part]??''):'';}
                else $value=match($key){'form.name'=>$schema['name']??$schema['id']??'','submission.id'=>$recordId,'submission.date'=>date('Y-m-d H:i:s'),'submission.ip'=>$ip,default=>$data[$key]??''};
                return is_array($value)?implode(', ',array_map(static fn($v)=>is_scalar($v)?(string)$v:CanonicalJson::encode($v),$value)):(string)$value;
            },$template);
        };
        $recipient=$resolve((string)($config['recipient']??''));if(!filter_var($recipient,FILTER_VALIDATE_EMAIL))$recipient=$fallback;if(!filter_var($recipient,FILTER_VALIDATE_EMAIL))return [];
        $body='New submission from '.($site['name']??'your website')."\nForm: ".($schema['name']??$schema['id']??'')."\nSource: {$source}\n\n";
        foreach($schema['fields']??[] as $field)if(array_key_exists($field['name'],$data)){$value=$data[$field['name']];$body.=($field['label']??$field['name']).': '.(is_array($value)?CanonicalJson::encode($value):(string)$value)."\n";}
        $body.="\nSubmission ID: #{$recordId}\n";$options=[];$reply=$resolve((string)($config['reply_to']??''));if(filter_var($reply,FILTER_VALIDATE_EMAIL))$options['reply_to']=$reply;
        return [['to'=>$recipient,'subject'=>$resolve((string)($config['subject']??'New form submission')),'body'=>$body,'options'=>$options]];
    }
}
