<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Database,GenerationBudget,ModelCapabilities,ModelCapabilitySettings,Settings};

/** Local token limits only: no provider construction, discovery, keys or network. */
final class ModelBudgetService
{
    public function __construct(private Database $db,private ActorPolicy $policy){}
    public static function inputSchema():array
    {
        $limits=ToolContracts::object(['max_output_tokens'=>['type'=>'integer','minimum'=>1,'maximum'=>2000000],
            'context_window'=>['type'=>'integer','minimum'=>1,'maximum'=>10000000]]);
        return ToolContracts::object([
            'provider'=>['enum'=>['claude','openai','gemini','deepseek','openai_compatible']],
            'model'=>['type'=>'string','maxLength'=>256,'pattern'=>'^[^\\x00-\\x1f\\x7f]*$'],
            'base_url'=>['type'=>'string','maxLength'=>2048,'pattern'=>'^[^\\x00-\\x1f\\x7f]*$'],
            'max_tokens'=>['type'=>'integer','minimum'=>1000,'maximum'=>128000],
            'model_limits'=>ToolContracts::object(['base_url'=>['type'=>'string','maxLength'=>2048],
                'models'=>['type'=>'object','properties'=>[],'additionalProperties'=>$limits,'maxProperties'=>200]]),
        ],[]);
    }
    public static function outputSchema():array
    {
        $budget=ToolContracts::object([
            'configured'=>['type'=>'integer','minimum'=>1,'maximum'=>128000],
            'action_adjusted'=>['type'=>'integer','minimum'=>1,'maximum'=>128000],
            'effective'=>['type'=>'integer','minimum'=>1,'maximum'=>128000],
            'model_limit'=>['type'=>'integer','minimum'=>1,'maximum'=>2000000],
            'context_window'=>['type'=>'integer','minimum'=>1,'maximum'=>10000000],
            'provider'=>['enum'=>['claude','openai','gemini','deepseek','openai_compatible']],
            'model'=>['type'=>'string','maxLength'=>256],
        ]);
        return ToolContracts::object(['budget'=>$budget,'focused_budget'=>$budget,
            'source'=>['enum'=>['documented','fallback','metadata','override']],'provider_calls'=>['const'=>0]]);
    }
    public function read(OperationActor $actor,\stdClass $input):array
    {
        return ProviderCallPolicy::runExternal(function()use($actor,$input):array{
            $this->policy->require($actor,['settings:read']);
            return self::preview(new Settings($this->db),$input);
        });
    }
    /** Shared with the authenticated Studio read-only preview route. */
    public static function preview(Settings $settings,\stdClass $input):array
    {
        JsonSchema::validate($input,self::inputSchema());
        $effective=(object)(get_object_vars($input)+['provider'=>$settings->get('ai_provider','claude'),
            'model'=>'','base_url'=>$settings->get('ai_openai_compatible_base_url',''),'max_tokens'=>32000]);
        JsonSchema::validate($effective,self::inputSchema());
        if(strlen($effective->model)>256||strlen($effective->base_url)>2048)throw new OperationException('invalid_schema','Model or endpoint exceeds its byte limit.');
        try {
            $requested=ModelCapabilitySettings::validateMaxTokens($effective->max_tokens);
            $overrides=isset($input->model_limits)?ModelCapabilitySettings::validateOverrides(
                json_decode(json_encode($input->model_limits,JSON_THROW_ON_ERROR),true,16,JSON_THROW_ON_ERROR),$effective->base_url):null;
        } catch(\RuntimeException $error) {throw new OperationException('invalid_schema',$error->getMessage());}
        $capabilities=ModelCapabilitySettings::forProvider($settings,$effective->provider,$effective->base_url,$overrides);
        $model=$effective->model===''?ModelCapabilities::defaultModel($effective->provider):$effective->model;
        return ['budget'=>GenerationBudget::fromCapabilities($effective->provider,$model,$requested,$capabilities),
            'focused_budget'=>GenerationBudget::fromCapabilities($effective->provider,$model,$requested,$capabilities,'section_edit'),
            'source'=>ModelCapabilities::resolve($effective->provider,$model,$capabilities)['source'],'provider_calls'=>0];
    }
}
