<?php
declare(strict_types=1);
namespace VoxelSite\Agent;

/** Explicit deterministic compilation retains exact source and output bytes. */
final class CompileService
{
    public function __construct(private ChangeSetService $changes) {}
    public static function inputSchema(string $method='prepare'): array
    {
        if ($method!=='prepare') throw new \InvalidArgumentException('Unknown compile method.');
        return ToolContracts::object(['request_id'=>ToolContracts::requestId(),'base_draft_version'=>ToolContracts::version()]);
    }
    public static function outputSchema(string $method='prepare'): array
    {
        self::inputSchema($method);
        return ToolContracts::changeReview();
    }
    public static function request(string $id,string $version): \stdClass
    {
        return (object)['request_id'=>$id,'base_draft_version'=>$version,'brief_id'=>'files:v1',
            'summary'=>'Compile draft styles','intent'=>(object)['action'=>'compile']];
    }
    public function prepare(OperationActor $actor,\stdClass $input): array
    {
        JsonSchema::validate($input,self::inputSchema());
        return $this->changes->prepareFiles($actor,self::request($input->request_id,$input->base_draft_version),
            static fn(array $before):array=>['operations'=>[]]);
    }
}
