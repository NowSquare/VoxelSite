<?php
declare(strict_types=1);
namespace VoxelSite;

/** Installation choice is data; external/later modes never invent a provider. */
final class AiSetup
{
    public const MODES=['builtin','external','later'];
    public const PROVIDERS=['claude','openai','gemini','deepseek','openai_compatible'];

    public static function validate(array $input):array
    {
        $mode=$input['ai_setup_mode']??'builtin';
        if (!is_string($mode) || !in_array($mode,self::MODES,true)) return ['Choose how you want to use AI.'];
        if ($mode!=='builtin') return [];
        $provider=$input['ai_provider']??'claude';
        if (!is_string($provider) || !in_array($provider,self::PROVIDERS,true)) return ['Choose a supported AI provider.'];
        if ($provider!=='openai_compatible' && (!is_string($input['ai_api_key']??null) || trim($input['ai_api_key'])==='')) {
            return ['API key is required for built-in AI.'];
        }
        if ($provider==='openai_compatible' && (!is_string($input['ai_base_url']??null)
            || !filter_var($input['ai_base_url'],FILTER_VALIDATE_URL))) return ['Enter your compatible AI server URL.'];
        return [];
    }
    public static function installationSettings(array $input,Encryption $encryption):array
    {
        if ($errors=self::validate($input)) throw new \InvalidArgumentException(implode(' ',$errors));
        $mode=$input['ai_setup_mode']??'builtin';
        if ($mode!=='builtin') return ['ai_setup_mode'=>$mode,'ai_provider'=>''];
        $provider=$input['ai_provider']??'claude';
        $settings=['ai_setup_mode'=>'builtin','ai_provider'=>$provider,"ai_{$provider}_model"=>(string)($input['ai_model']??'')];
        $key=trim($input['ai_api_key']??'');
        if ($key!=='') $settings["ai_{$provider}_api_key"]=$encryption->encrypt($key);
        if ($provider==='openai_compatible') $settings['ai_openai_compatible_base_url']=trim($input['ai_base_url']);
        return $settings;
    }
    public static function configured(Settings $settings):bool
    {
        $provider=$settings->get('ai_provider','');
        if (!in_array($provider,self::PROVIDERS,true)) return false;
        if ($provider==='openai_compatible') return trim((string)$settings->get('ai_openai_compatible_base_url',''))!=='';
        return trim((string)$settings->get("ai_{$provider}_api_key",''))!=='';
    }
}
