<?php
declare(strict_types=1);

namespace VoxelSite\Agent;

use VoxelSite\DesignDirection;

/** External reasoning input. This service neither generates nor changes site files. */
final class AuthoringBriefService
{
    public function __construct(private ContextService $context, private BriefStore $store) {}

    public function create(OperationActor $actor, array $input): array
    {
        return ProviderCallPolicy::runExternal(function () use ($actor, $input): array {
            if (array_diff(array_keys($input), ['request_id', 'action', 'focus_paths', 'max_bytes', 'max_chars', 'style', 'instruction'])) {
                throw new OperationException('invalid_schema', 'Unknown authoring brief option.');
            }
            if (!isset($input['request_id']) || !is_string($input['request_id'])) {
                throw new OperationException('invalid_schema', 'A stable request_id is required.');
            }
            $options = ContextService::options(array_intersect_key($input, array_flip(['action', 'focus_paths', 'max_bytes', 'max_chars'])));
            if ($options['max_bytes'] < 12288 || $options['max_chars'] < 12288) {
                throw new OperationException('size_limit', 'An authoring brief needs at least 12288 bytes and characters. Use context.get for a smaller read.');
            }
            $style = $input['style'] ?? '';
            $instruction = $input['instruction'] ?? '';
            if (!is_string($style) || !in_array($style, ['', 'modern_minimal', 'bold_vibrant', 'elegant_classic', 'playful_creative', 'dark_premium'], true)
                || !is_string($instruction) || strlen($instruction) > 2048 || !mb_check_encoding($instruction, 'UTF-8')) {
                throw new OperationException('invalid_schema', 'Choose a known style and an instruction of at most 2048 UTF-8 bytes.');
            }
            $request = $options + ['style' => $style, 'instruction' => $instruction];
            return $this->context->withSnapshot($actor, fn() => $this->store->retain($actor, $input['request_id'], $request, function (string $id, int $created, int $expires) use ($actor, $options, $style, $instruction): array {
                $contextOptions = $options;
                $contextOptions['max_bytes'] -= 8192;
                $contextOptions['max_chars'] -= 8192;
                $context = $this->context->build($actor, $contextOptions);
                $hasPages = $context['site_state']['has_pages'];
                $direction = null;
                if ($options['action'] === 'create_site' || ($options['action'] === 'free_prompt' && !$hasPages)) {
                    // The existing draw applies style cards, stated preferences and rejections.
                    $direction = DesignDirection::draw(['style' => $style, 'memory' => $this->context->directionMemory($actor)]);
                }
                $brief = ['brief_id' => $id, 'action' => $options['action'], 'base_draft_version' => $context['draft_version'],
                    'rules_digest' => $context['rules'][0]['sha256'], 'context' => $context,
                    'instruction' => ['trust' => 'user_supplied_source', 'text' => $instruction],
                    'direction' => $direction, 'provider_calls' => 0, 'created_at' => $created, 'expires_at' => $expires,
                    'review' => ['mode' => 'external', 'not_run' => ['design_review', 'accessibility_review', 'copy_review', 'browser_visual_review']],
                    'limits' => ['max_bytes' => $options['max_bytes'], 'max_chars' => $options['max_chars']],
                    'size_bytes' => 0, 'size_chars' => 0];
                $brief = ContextService::measure($brief);
                if ($brief['size_bytes'] > $options['max_bytes'] || $brief['size_chars'] > $options['max_chars']) {
                    throw new OperationException('size_limit', 'Increase the brief budget or shorten the instruction.');
                }
                return $brief;
            }));
        });
    }
}
