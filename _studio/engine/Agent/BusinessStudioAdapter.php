<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Database,SiteWorkspace};
/** Trusted session construction for the existing forms/Actions screens. */
final class BusinessStudioAdapter
{
    public readonly FormService $forms;
    public readonly ActionService $actions;
    public readonly SubmissionService $submissions;
    public readonly ActorPolicy $policy;
    public function __construct(?Database $db=null,?SiteWorkspace $workspace=null) {
        $db??=Database::getInstance();$workspace??=new SiteWorkspace($db);$this->policy=new ActorPolicy($db);
        $studio=dirname(__DIR__,2);$data=$workspace->publishedRoot().'/_data';
        $this->forms=new FormService($db,$this->policy,$workspace);
        $this->actions=new ActionService($db,$this->policy,$workspace,getenv('VS_TEST_ACTIONS_DIR')?:$studio.'/data/actions',$data.'/actions.db',getenv('VS_TEST_ACTION_SITE_DATA_PATH')?:ActionConfiguration::draftPath($workspace),$studio.'/action-templates');
        $this->submissions=new SubmissionService($db,$this->policy,$workspace,$this->forms,$this->actions,$data.'/submissions.db',$data.'/actions.db',$data.'/uploads');
    }
    public static function actor():OperationActor {
        $id=(int)($_REQUEST['_user']['id']??0);if($id<1)throw new OperationException('permission_denied','A current Studio account is required.');return new OperationActor('user',$id,null,[],'studio_configured',null);
    }
    public static function requestId(array $body):string {$id=$body['request_id']??$_SERVER['HTTP_IDEMPOTENCY_KEY']??null;if(!is_string($id))throw new OperationException('invalid_schema','A stable request_id is required. Reload Studio before trying this change.');JsonSchema::validate($id,ToolContracts::requestId());return $id;}
    public static function bodyObject(array $body):\stdClass {return json_decode(json_encode((object)$body,JSON_THROW_ON_ERROR),false,32,JSON_THROW_ON_ERROR);}
    public function mutationInput(OperationActor $actor,string $kind,string $entity,int $record,array $body):\stdClass {
        $version=$body['version']??null;if(!is_string($version))throw new OperationException('content_conflict','The displayed record version is required. Reload and review the record.');
        $input=['kind'=>$kind,'entity_id'=>$entity,'record_id'=>$record,'version'=>$version,'request_id'=>self::requestId($body)];foreach(['status','notes'] as $key)if(array_key_exists($key,$body))$input[$key]=$body[$key];return (object)$input;
    }
}
