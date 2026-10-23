<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Database,SiteWorkspace};
/** Existing Studio routes share the exact staged package and owner approval services. */
final class UpdateStudioAdapter
{
    public readonly UpdatePackageStore $packages;
    public readonly UpdateService $updates;
    public readonly AdminApprovalStore $approvals;
    public function __construct(?Database $db=null,?SiteWorkspace $workspace=null,?string $privateRoot=null,?string $appKey=null)
    {
        $db??=Database::getInstance();$workspace??=new SiteWorkspace($db);$policy=new ActorPolicy($db);
        $this->packages=new UpdatePackageStore($db,$policy,$workspace,$privateRoot??dirname(__DIR__,2).'/data/updates');
        $appKey??=loadConfig()['app_key']??'';
        $this->approvals=new AdminApprovalStore($db,$policy,$workspace,$appKey);
        $operations=new OperationStore($db,$policy,$workspace->mutationLockPath());
        $this->updates=new UpdateService($db,$policy,$workspace,$this->packages,$this->approvals,$operations);
    }
}
