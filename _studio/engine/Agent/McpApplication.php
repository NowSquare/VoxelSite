<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Database, DesignManager, ExportService, Settings, SiteWorkspace, SnapshotService};

/** Trusted application wiring. Request parameters cannot select a PHP handler. */
final class McpApplication
{
    public static function create(Database $db,array $config,?SiteWorkspace $workspace=null,?string $privateRoot=null):McpServer
    {
        $workspace??=new SiteWorkspace($db);
        $privateRoot??=dirname($workspace->draftRoot()).'/data/agent';
        $policy=new ActorPolicy($db);
        $context=new ContextService($db,$policy,$workspace);
        $briefStore=new BriefStore($db,$policy);
        $briefs=new AuthoringBriefService($context,$briefStore);
        $files=new FileReadService($db,$policy,$workspace);
        // Construct uploads lazily so a low host upload limit cannot disable
        // ordinary source reading, review, status or explicit recovery.
        $uploads=null;
        $uploadService=static function() use(&$uploads,$db,$policy,$workspace,$privateRoot):AssetTransferService {
            return $uploads??=new AssetTransferService($db,$policy,$workspace,$privateRoot.'/uploads');
        };
        $changes=new ChangeSetStore($db,$policy,$privateRoot.'/changes');
        $review=new ChangeSetService($db,$policy,$workspace,$briefStore,$changes,
            static fn($actor,$uploadId,$path)=>$uploadService()->finalizedBytes($actor,$uploadId,$path));
        $operations=new OperationStore($db,$policy,$workspace->mutationLockPath());
        $executor=new ChangeSetExecutor($db,$policy,$workspace,$changes,$operations);
        $workspaceData=dirname($workspace->draftRoot()).'/data';
        $preview=new PreviewService($db,$policy,$workspace,actionsDir:$workspaceData.'/actions');
        $releases=new ReleaseStore($db,$policy,$privateRoot.'/releases');
        $publish=new PublishPlanService($db,$policy,$workspace,$releases,$operations);
        $snapshots=new SnapshotService($db,$policy,$workspace,$releases,$operations,
            $privateRoot.'/snapshots',$workspaceData.'/snapshots',$workspaceData.'/actions');
        $restores=new RestorePlanService($db,$policy,$workspace,$snapshots,$releases,$operations,$privateRoot.'/restores');
        $structure=new SiteStructureService($db,$policy,$workspace,$review);
        $pages=new PageManagementService($db,$policy,$workspace,$review);
        $assets=new AssetManagementService($db,$policy,$workspace,$review,$workspaceData.'/assets-meta.json');
        $forms=new FormService($db,$policy,$workspace,$review);
        $businessRoot=$workspace->publishedRoot().'/_data';
        $actions=new ActionService($db,$policy,$workspace,getenv('VS_TEST_ACTIONS_DIR')?:$workspaceData.'/actions',
            $businessRoot.'/actions.db',getenv('VS_TEST_ACTION_SITE_DATA_PATH')?:ActionConfiguration::draftPath($workspace),
            dirname($workspace->draftRoot()).'/action-templates');
        $submissions=new SubmissionService($db,$policy,$workspace,$forms,$actions,$businessRoot.'/submissions.db',
            $businessRoot.'/actions.db',$businessRoot.'/uploads');
        $notes=new NoteService($db,$policy);
        $board=new BoardService($db,$policy);
        $settingsService=new SettingsService($db,$policy,$workspace,$operations,$config['app_key']??null);
        $prompts=new PromptService($db,$policy,$workspace,$operations);
        $diagnostics=new DiagnosticsService($db,$policy,$workspace,$operations,appKey:$config['app_key']??null);
        $references=new ReferenceImportService($policy);
        $designs=new DesignService($db,$policy,$workspace,new DesignManager($db,$workspace),$restores,$operations,
            $workspaceData.'/actions',$privateRoot.'/design-previews');
        $revisions=new RevisionService($db,$policy,$workspace,$restores,
            getenv('VS_TEST_REVISIONS_DIR')?:dirname($workspace->draftRoot()).'/revisions',$privateRoot.'/revision-previews');
        $unpublish=new UnpublishService($policy,$workspace,$restores);
        $exports=new ExportService($db,$policy,$workspace,new DownloadGrantStore($db,$policy,$workspace,$privateRoot.'/exports'),$publish);
        $admin=null;
        $administration=static function()use(&$admin,$db,$policy,$workspace,$config):AdministrationService {
            if(!is_string($config['app_key']??null))throw new OperationException('feature_disabled','Finish installation before using administrative reviews.');
            return $admin??=new AdministrationService($db,$policy,new AdminApprovalStore($db,$policy,$workspace,$config['app_key']));
        };
        $credentialAdmin=null;
        $credentialAdministration=static function()use(&$credentialAdmin,$db,$policy,$workspace,$config):CredentialAdministrationService {
            if(!is_string($config['app_key']??null))throw new OperationException('feature_disabled','Finish installation before using administrative reviews.');
            return $credentialAdmin??=new CredentialAdministrationService($db,$policy,new AdminApprovalStore($db,$policy,$workspace,$config['app_key']));
        };
        $faviconService=static function(bool $needsUpload=false)use($db,$policy,$workspace,$operations,$uploadService):FaviconService {
            return new FaviconService($db,$policy,$workspace,$operations,$needsUpload?$uploadService():null);
        };
        $resetService=static function()use($db,$policy,$workspace,$operations,$publish,$privateRoot,$config):ResetService {
            if(!is_string($config['app_key']??null))throw new OperationException('feature_disabled','Finish installation before using reset reviews.');
            $studio=dirname($workspace->draftRoot());
            return new ResetService($db,$policy,$workspace,new AdminApprovalStore($db,$policy,$workspace,$config['app_key']),
                $operations,new ResetInventory($db,$workspace,$publish,$studio,$studio.'/data/default-index.php'),$privateRoot.'/resets');
        };
        $factoryResetService=static fn()=>new FactoryResetService($db,$policy,$workspace,new FactoryResetInventory($db,$workspace,$publish));
        $updatePackages=null;
        $updatePackageService=static function()use(&$updatePackages,$db,$policy,$workspace,$workspaceData):UpdatePackageStore {
            return $updatePackages??=new UpdatePackageStore($db,$policy,$workspace,$workspaceData.'/updates');
        };
        $updates=null;
        $updateService=static function()use(&$updates,$updatePackageService,$db,$policy,$workspace,$config,$operations):UpdateService {
            if(!is_string($config['app_key']??null))throw new OperationException('feature_disabled','Finish installation before using update reviews.');
            return $updates??=new UpdateService($db,$policy,$workspace,$updatePackageService(),
                new AdminApprovalStore($db,$policy,$workspace,$config['app_key']),$operations);
        };
        $continuation=static function(OperationActor $actor,string $id) use($operations,$executor,$publish,$snapshots,$restores,$designs,$settingsService,$prompts,$diagnostics,$faviconService,$resetService,$updateService):object {
            return match($operations->get($actor,$id)['kind']) {
                'changes.apply'=>$executor,'publish.apply'=>$publish,
                'snapshots.create'=>$snapshots,
                'snapshots.delete'=>$snapshots->deletions(),
                'restore.apply','revisions.undo','revisions.redo','designs.load','designs.new','site.unpublish'=>$restores,
                'designs.save','designs.rename','designs.delete'=>$designs,
                'settings.update','mail.test'=>$settingsService,
                'prompts.update','prompts.reset'=>$prompts,
                'diagnostics.logs_delete','diagnostics.history_delete','diagnostics.repair','diagnostics.cancel'=>$diagnostics,
                'settings.favicon_update','settings.favicon_delete'=>$faviconService(),
                'site.reset'=>$resetService(),
                'update.apply'=>$updateService(),
                default=>throw new OperationException('invalid_schema','The recorded operation has no available continuation.'),
            };
        };
        $handlers=[
            'structure.navigation'=>static fn($actor,$input)=>(new NavigationPreflightService($db,$policy,$workspace))->read($actor,$input),
            'site_control.plan_read'=>static fn($actor,$input)=>(new LegacySiteControlService($db,$policy,$workspace,$review))->read($actor,$input,'plan'),
            'site_control.mutation_read'=>static fn($actor,$input)=>(new LegacySiteControlService($db,$policy,$workspace,$review))->read($actor,$input,'mutation'),
            'site_control.plan_prepare'=>static fn($actor,$input)=>(new LegacySiteControlService($db,$policy,$workspace,$review))->prepare($actor,$input),
            'site.activity'=>static fn($actor,$input)=>(new ExternalActivityService($db,$policy,$workspace))->read($actor,$input),
            'settings.model_budget'=>static fn($actor,$input)=>(new ModelBudgetService($db,$policy))->read($actor,$input),
            'structure.seo_read'=>static fn($actor,$input)=>$pages->seoRead($actor,$input),
            'publish.diff'=>static fn($actor,$input)=>(new PublicationDiffService($db,$policy,$workspace,$publish))->read($actor,$input),
            'site.get'=>static function(OperationActor $actor) use($db,$workspace):array {
                $state=$workspace->status();
                return ['draft_version'=>'draft:'.$state['draft_version'],'release_id'=>$state['release_id'],
                    'page_count'=>(int)$db->scalar('SELECT COUNT(*) FROM pages'),'workspace_ready'=>$state['ready'],'provider_calls'=>0,
                    'limits'=>['max_change_files'=>ChangeSetValidator::MAX_OPERATIONS,'max_draft_bytes'=>WorkspaceFiles::MAX_BYTES,
                        'max_request_bytes'=>McpServer::MAX_BODY_BYTES],
                    'boundaries'=>[
                        'This endpoint never calls a VoxelSite-managed AI provider.',
                        'External edits affect the private draft; publishing requires its own reviewed operation.',
                        'Custom website PHP executes with the installation’s PHP authority when rendered; static validation is not a sandbox.',
                        'Browser screenshots and visual review run in the external client.',
                    ]];
            },
            'site.context'=>static fn($actor,$input)=>$context->build($actor,(array)$input),
            'authoring.brief'=>static fn($actor,$input)=>$briefs->create($actor,(array)$input),
            'authoring.get'=>static fn($actor,$input)=>$briefStore->get($actor,$input->brief_id),
            'rules.read'=>static fn($actor,$input)=>$context->readRules($actor,$input->action,$input->kind,$input->digest,
                $input->offset??0,$input->max_bytes??8192),
            'changes.prepare'=>static fn($actor,$input)=>$review->prepare($actor,$input),
            'changes.get'=>static fn($actor,$input)=>$review->get($actor,$input->change_set_id),
            'changes.diff'=>static fn($actor,$input)=>$review->readDiff($actor,$input->change_set_id,$input->path,
                $input->offset??0,$input->max_bytes??16384,$input->side??null),
            'changes.apply'=>static fn($actor,$input)=>$executor->apply($actor,$input),
            'preview.render'=>static fn($actor,$input)=>$preview->render($actor,$input),
            'preview.open'=>static fn($actor,$input)=>$preview->open($actor,$input),
            'publish.prepare'=>static fn($actor,$input)=>$publish->prepare($actor,$input),
            'publish.get'=>static fn($actor,$input)=>$publish->get($actor,$input->plan_id),
            'publish.apply'=>static fn($actor,$input)=>$publish->publish($actor,$input),
            'snapshots.create'=>static fn($actor,$input)=>$snapshots->create($actor,$input),
            'snapshots.list'=>static fn($actor,$input)=>$snapshots->listPaged($actor,$input),
            'snapshots.inspect'=>static fn($actor,$input)=>$snapshots->inspect($actor,$input->snapshot_id),
            'snapshots.delete_review'=>static fn($actor,$input)=>$snapshots->deletions()->inspect($actor,$input),
            'snapshots.delete'=>static fn($actor,$input)=>$snapshots->deletions()->delete($actor,$input),
            'restore.prepare'=>static fn($actor,$input)=>$restores->prepare($actor,$input),
            'restore.get'=>static fn($actor,$input)=>$restores->get($actor,$input->plan_id),
            'restore.apply'=>static fn($actor,$input)=>$restores->apply($actor,$input),
            'references.fetch'=>static fn($actor,$input)=>$references->fetch($actor,$input),
            'revisions.state'=>static fn($actor)=>$revisions->state($actor),
            'revisions.list'=>static fn($actor,$input)=>$revisions->list($actor,$input),
            'revisions.prepare'=>static fn($actor,$input)=>$revisions->prepare($actor,$input),
            'revisions.get'=>static fn($actor,$input)=>$revisions->get($actor,$input->plan_id),
            'revisions.apply'=>static fn($actor,$input)=>$revisions->apply($actor,$input),
            'designs.prepare_load'=>static fn($actor,$input)=>$designs->prepareLoad($actor,$input),
            'designs.prepare_new'=>static fn($actor,$input)=>$designs->prepareNew($actor,$input),
            'designs.get'=>static fn($actor,$input)=>$designs->get($actor,$input->plan_id),
            'unpublish.prepare'=>static fn($actor,$input)=>$unpublish->prepare($actor,$input),
            'unpublish.get'=>static fn($actor,$input)=>$unpublish->get($actor,$input->plan_id),
            'unpublish.apply'=>static fn($actor,$input)=>$unpublish->apply($actor,$input),
            'team.list'=>static fn($actor,$input)=>$administration()->team($actor,$input),
            'administration.prepare'=>static fn($actor,$input)=>$administration()->prepare($actor,$input),
            'administration.get'=>static fn($actor,$input)=>$administration()->get($actor,$input),
            'administration.apply'=>static fn($actor,$input)=>$administration()->apply($actor,$input),
            'settings.read'=>static fn($actor,$input)=>$settingsService->read($actor,$input),
            'settings.update'=>static fn($actor,$input)=>$settingsService->update($actor,$input),
            'mail.test'=>static fn($actor,$input)=>$settingsService->testMail($actor,$input),
            'operations.get'=>static fn($actor,$input)=>OperationRunner::publicState($operations->get($actor,$input->operation_id)),
            'operations.continue'=>static fn($actor,$input)=>$continuation($actor,$input->operation_id)->continue($actor,$input->operation_id,$input->checkpoint),
            'operations.recover'=>static fn($actor,$input)=>$continuation($actor,$input->operation_id)->recover($actor,$input->operation_id),
        ];
        foreach(['prepare','get','apply'] as $method)$handlers['reset.'.$method]=static fn($actor,$input)=>$resetService()->$method($actor,$input);
        foreach(['list','read','prepare'] as $method)$handlers['pages.'.$method]=static fn($actor,$input)=>$pages->$method($actor,$input);
        foreach(['prepare','get'] as $method)$handlers['factory_reset.'.$method]=static fn($actor,$input)=>$factoryResetService()->$method($actor,$input);
        foreach(['begin','chunk','finish','get','cleanup'] as $method)$handlers['update_package.'.$method]=static fn($actor,$input)=>$updatePackageService()->$method($actor,$input);
        foreach(['inspect'=>'inspect','packages'=>'packages','stage_local'=>'stageLocal','stage_git'=>'stageGit','prepare'=>'prepare','apply'=>'apply'] as $name=>$method)
            $handlers['updates.'.$name]=static fn($actor,$input)=>$updateService()->$method($actor,$input);
        $handlers['compile.prepare']=static fn($actor,$input)=>(new CompileService($review))->prepare($actor,$input);
        foreach (['graph','blastRadius','discover','prepare'] as $method) {
            $handlers['structure.'.($method==='blastRadius'?'blast_radius':$method)]=static fn($actor,$input)=>$structure->$method($actor,$input);
        }
        foreach (['list','prepare','get','apply'] as $method) {
            $handlers['credentials.'.$method]=static fn($actor,$input)=>$credentialAdministration()->$method($actor,$input);
        }
        foreach (['read','update','delete'] as $method) {
            $handlers['favicon.'.$method]=static fn($actor,$input)=>$faviconService($method==='update')->$method($actor,$input);
        }
        foreach (['list','read','update','reset'] as $method) {
            $handlers['prompts.'.$method]=static fn($actor,$input)=>$prompts->$method($actor,$input);
        }
        foreach (['list','get','prepare','validate'] as $method) {
            $handlers['forms.'.$method]=static fn($actor,$input)=>$forms->$method($actor,$input);
        }
        $handlers['forms.submit']=static fn($actor,$input)=>$submissions->submit($actor,$input);
        foreach (['list','get','templates','manifest','bar','validate','availability','invoke','change'] as $method) {
            $handlers['actions.'.$method]=static fn($actor,$input)=>$actions->$method($actor,$input);
        }
        foreach (['list','read','update','delete','bulk','purge','export','attachment'] as $method) {
            $handlers['submissions.'.$method]=static fn($actor,$input)=>$submissions->$method($actor,$input);
        }
        foreach (['system','usage','history','conversations','conversation','logs','log_read','mail_log'] as $method) {
            $handler=match($method){'log_read'=>'readLog','mail_log'=>'mailLog',default=>$method};
            $handlers['diagnostics.'.$method]=static fn($actor,$input)=>$diagnostics->$handler($actor,$input);
        }
        foreach (['logs_delete','history_delete','repair','cancel'] as $method) {
            $handlers['diagnostics.'.$method]=static fn($actor,$input)=>$diagnostics->mutate($actor,$method,$input);
        }
        foreach (['list','read','search'] as $method) {
            $handlers['files.'.$method]=static fn($actor,$input)=>$files->$method($actor,$input);
        }
        foreach (['list','inspect','prepare'] as $method) {
            $handlers['assets.'.$method]=static fn($actor,$input)=>$assets->$method($actor,$input);
        }
        foreach (['list','save','rename','delete','preview','apply'] as $method) {
            $handlers['designs.'.$method]=static fn($actor,$input)=>$designs->$method($actor,$input);
        }
        foreach (['prepare','create','status','download'] as $method) {
            $handlers['export.'.$method]=static fn($actor,$input)=>$exports->$method($actor,$input);
        }
        foreach (['list','search','read','create','update','trash','restore'] as $method) {
            $handlers['notes.'.$method]=static fn($actor,$input)=>$notes->$method($actor,$input);
        }
        foreach (['list','read','create','update','move','archive','restore','delete'] as $method) {
            $handlers['board.'.$method]=static fn($actor,$input)=>$board->$method($actor,$input);
        }
        foreach (['begin','chunk','finish'] as $method) {
            $handlers['assets.upload_'.$method]=static fn($actor,$input)=>$uploadService()->$method($actor,$input);
        }
        $origins=[];
        $settings=new Settings($db);
        foreach (['workspace_base_url','site_url'] as $setting) {
            $saved=$settings->get($setting,'');
            $url=is_string($saved)?parse_url($saved):false;
            if ($url===false || !isset($url['scheme'],$url['host']) || !in_array($url['scheme'],['http','https'],true)
                || isset($url['user']) || isset($url['pass']) || isset($url['query']) || isset($url['fragment'])) continue;
            $origins[]=$url['scheme'].'://'.$url['host'].(isset($url['port'])?':'.$url['port']:'');
        }
        $version=trim((string)file_get_contents(dirname(__DIR__,3).'/VERSION'));
        return new McpServer(CapabilityCatalog::core(),$policy,
            static fn(string $handler)=>$handlers[$handler]??throw new \LogicException('Unbound capability handler.'),
            array_values(array_unique($origins)),$version,McpServer::MAX_BODY_BYTES,
            static function($actor,$method,$params) use($db,$policy,$workspace,$privateRoot,$config):void {
                (new RequestBudget($db,$policy))->consume($actor,$method,$params);
                if ($method==='tools/call' && in_array($params->name??null,[
                    'voxelsite_authoring_brief','voxelsite_assets_upload_begin','voxelsite_changes_prepare',
                    'voxelsite_publish_prepare','voxelsite_restore_prepare','voxelsite_snapshots_create','voxelsite_structure_prepare',
                    'voxelsite_assets_prepare','voxelsite_designs_save','voxelsite_designs_prepare_load','voxelsite_designs_prepare_new',
                    'voxelsite_revisions_prepare','voxelsite_unpublish_prepare','voxelsite_export_prepare',
                    'voxelsite_administration_prepare','voxelsite_credentials_prepare',
                ],true)) {
                    (new MaintenanceService($db,$policy,$workspace,$privateRoot))->run($actor);
                    if(is_string($config['app_key']??null))
                        (new AdminApprovalStore($db,$policy,$workspace,$config['app_key']))->pruneSensitiveInputs(10);
                }
            },new ConnectionTelemetry($db));
    }
}
