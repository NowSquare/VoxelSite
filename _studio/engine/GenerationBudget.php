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
        $actionAdjusted = $focused || in_array($action, ['section_edit', 'add_section'], true)
            ? min($configured, 16000) : $configured;
        if ($action === 'question') { $actionAdjusted = min($actionAdjusted, 2048); }

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
}
