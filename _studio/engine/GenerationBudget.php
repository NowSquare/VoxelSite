<?php
declare(strict_types=1);

namespace VoxelSite;

/** One output reservation for the UI, context builder and provider request. */
final class GenerationBudget
{
    public static function resolve(
        AIProviderInterface $provider,
        string $model,
        int $configured,
        string $action = 'free_prompt',
        bool $focused = false
    ): array {
        $configured = max(1, $configured);
        $actionAdjusted = self::adjusted($configured,$action,$focused);

        return [
            'configured' => $configured,
            'action_adjusted' => $actionAdjusted,
            'effective' => $provider->resolveMaxTokens($actionAdjusted, $model),
            'model_limit' => $provider->resolveMaxTokens(PHP_INT_MAX, $model),
            'context_window' => $provider->getContextWindow($model),
            'provider' => $provider->getId(),
            'model' => $model,
        ];
    }

    /** Same budget calculation from already retained local capability metadata. */
    public static function fromCapabilities(string $provider,string $model,int $configured,array $capabilities=[],string $action='free_prompt',bool $focused=false):array
    {
        $configured=max(1,$configured);$adjusted=self::adjusted($configured,$action,$focused);
        $limits=ModelCapabilities::resolve($provider,$model,$capabilities);
        return ['configured'=>$configured,'action_adjusted'=>$adjusted,'effective'=>min($adjusted,$limits['max_output_tokens']),
            'model_limit'=>$limits['max_output_tokens'],'context_window'=>$limits['context_window'],'provider'=>$provider,'model'=>$model];
    }

    private static function adjusted(int $configured,string $action,bool $focused):int
    {
        $adjusted=$focused||in_array($action,['section_edit','add_section'],true)?min($configured,16000):$configured;
        return $action==='question'?min($adjusted,2048):$adjusted;
    }

}
