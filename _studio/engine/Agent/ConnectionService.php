<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Database, Settings, SiteWorkspace};

/** Session-owner administration; never exposed as a self-authorizing MCP tool. */
final class ConnectionService
{
    private ActorPolicy $policy;
    private Settings $settings;
    private CredentialService $credentials;
    public function __construct(private Database $db,private SiteWorkspace $workspace,private array $config=[]) {
        $this->policy=new ActorPolicy($db);$this->settings=new Settings($db);$this->credentials=new CredentialService($db);
    }
    public static function enabled(Settings $settings,array $config):bool {
        // An explicit configuration switch remains an installation-level override.
        if (array_key_exists('enabled',$config['studio_mcp']??[])) return $config['studio_mcp']['enabled']===true;
        return $settings->get('studio_mcp_enabled',false)===true;
    }
    public function status(OperationActor $owner, array $page=[]):array {
        $this->policy->requireOwnerSession($owner);
        $inventory=[];
        foreach(['mcp'=>'studio_mcp','rest'=>'rest'] as $prefix=>$audience) {
            $input=['audience'=>$audience];
            if(isset($page[$prefix.'_offset']))$input['offset']=(int)$page[$prefix.'_offset'];
            if(isset($page[$prefix.'_version']))$input['inventory_version']=$page[$prefix.'_version'];
            $inventory[$prefix]=$this->administration()->list($owner,(object)$input);
        }
        $base=$this->settings->get('workspace_base_url',$this->settings->get('site_url',''));
        $endpoint=null;
        if (is_string($base) && self::validBase($base)) $endpoint=rtrim($base,'/').'/_studio/mcp.php';
        $enabled=self::enabled($this->settings,$this->config);
        $telemetry=new ConnectionTelemetry($this->db);
        $siteName=$this->settings->get('site_name','');
        if(!is_string($siteName)||trim($siteName)==='')$siteName=is_string($base)?(parse_url($base,PHP_URL_HOST)?:'Your site'):'Your site';
        return ['enabled'=>$enabled,'site_name'=>$siteName,
            'version'=>$this->version(),
            'configuration_override'=>array_key_exists('enabled',$this->config['studio_mcp']??[]),
            'endpoint'=>$endpoint,'workspace_ready'=>$this->workspace->status()['ready'],
            'connections'=>array_map(fn($row)=>$telemetry->describe($row,$enabled),$inventory['mcp']['credentials']),'presets'=>ActorPolicy::presets(),'access_groups'=>ActorPolicy::accessGroups(),
            'accounts'=>array_map(static fn($row)=>array_intersect_key($row,array_flip(['id','name','role'])),(new \VoxelSite\Auth($this->db))->listUsers()),
            'rest_connections'=>$inventory['rest']['credentials'],
            'pages'=>array_map(static fn($list)=>array_intersect_key($list,array_flip(['total','next_offset','inventory_version'])),$inventory),
            'approvals'=>isset($this->config['app_key'])
                ?(new AdminApprovalStore($this->db,$this->policy,$this->workspace,$this->config['app_key']))->ownerList($owner):[],
            'pending_secrets'=>isset($this->config['app_key'])
                ?(new AdminApprovalStore($this->db,$this->policy,$this->workspace,$this->config['app_key']))->pendingSecrets($owner):[],
            'qualification'=>ClientQualification::load(trim((string)file_get_contents(dirname(__DIR__,3).'/VERSION'))),
            'billing'=>'Your connected AI tool runs the conversation. Studio MCP makes no calls to VoxelSite-managed AI providers.',
        ];
    }
    public function setEnabled(OperationActor $owner,\stdClass $input):array {
        $this->policy->requireOwnerSession($owner);
        JsonSchema::validate($input,ToolContracts::object(['operation_id'=>ToolContracts::requestId(),
            'version'=>ToolContracts::hash(),'enabled'=>['type'=>'boolean']]));
        $approvals=$this->approvals();
        $review=$approvals->prepare($owner,$input->operation_id,'connection.configure',
            ['enabled'=>$input->enabled,'version'=>$input->version],
            ['summary'=>$input->enabled?'Enable Studio MCP':'Disable Studio MCP',
                'effects'=>[$input->enabled?'Allow active credentials to connect.':'Refuse new MCP requests; retain credentials and all website data.'],
                'preserved'=>['Credentials','Website files','Business records'],'secret_fields'=>[]],
            ['credentials:write'],fn()=>$this->validateEnabled($input->enabled,$input->version));
        if(in_array($review['status'],['pending','approved'],true))$approvals->approve($owner,$review['plan_id'],$review['digest']);
        $operation=$approvals->executeDatabase($owner,$review['plan_id'],$review['digest'],function(array $intent):array{
            $this->validateEnabled($intent['enabled'],$intent['version']);
            $this->settings->set('studio_mcp_enabled',$intent['enabled']);
            return ['changed'=>true,'entity'=>'credential','entity_id'=>null,'version'=>$this->version(),'provider_calls'=>0];
        });
        return $this->status($owner)+['operation'=>$operation];
    }
    private function validateEnabled(bool $enabled,string $version):void {
        $this->settings=new Settings($this->db);
        if(!hash_equals($this->version(),$version))throw new OperationException('content_conflict','Connection access changed. Reload Settings before changing it.');
        if (array_key_exists('enabled',$this->config['studio_mcp']??[])) {
            throw new OperationException('feature_disabled','This installation controls MCP access in its server configuration.');
        }
        if ($enabled) {
            $this->workspace->assertReady();
            $base=$this->settings->get('workspace_base_url',$this->settings->get('site_url',''));
            if (!is_string($base) || !self::validBase($base)) {
                throw new OperationException('host_capability_unavailable','Finish private draft setup with the canonical website URL before enabling connections.');
            }
        }
    }
    public function create(OperationActor $owner,\stdClass $input):array {
        $this->policy->requireOwnerSession($owner);
        $fields=[
            'operation_id'=>ToolContracts::requestId(),
            'user_id'=>['type'=>'integer','minimum'=>1],'preset'=>['enum'=>['read','edit','publish']],
            'label'=>['type'=>'string','minLength'=>1,'maxLength'=>100],
            'client_name'=>ToolContracts::nullable(ToolContracts::text(100)),
            'live_restore'=>['type'=>'boolean'],
            'access_groups'=>['type'=>'array','maxItems'=>12,'uniqueItems'=>true,'items'=>['enum'=>array_keys(ActorPolicy::accessGroups())]],
        ];
        $required=['operation_id','user_id','preset','label'];
        JsonSchema::validate($input,['oneOf'=>[
            ToolContracts::object($fields+['expires_at'=>ToolContracts::integer()],[...$required,'expires_at']),
            ToolContracts::object($fields+['expiry_days'=>['type'=>'integer','minimum'=>1,'maximum'=>366]],[...$required,'expiry_days']),
        ]]);
        $extra=($input->live_restore??false)?['restore:live']:[];
        foreach($input->access_groups??[] as $group)array_push($extra,...ActorPolicy::accessGroups()[$group]['scopes']);
        return $this->administration()->executeStudio($owner,(object)['operation_id'=>$input->operation_id,'intent'=>(object)([
            'type'=>'credential.create','audience'=>'studio_mcp','user_id'=>$input->user_id,'preset'=>$input->preset,
            'label'=>$input->label,'client_name'=>$input->client_name??null,'extra_scopes'=>array_values(array_unique($extra)),
        ]+(isset($input->expiry_days)?['expiry_days'=>$input->expiry_days]:['expires_at'=>$input->expires_at]))]);
    }
    public function revoke(OperationActor $owner,int $id,\stdClass $input):array {
        JsonSchema::validate($input,ToolContracts::object(['operation_id'=>ToolContracts::requestId(),'version'=>ToolContracts::hash()]));
        return $this->administration()->executeStudio($owner,(object)['operation_id'=>$input->operation_id,'intent'=>(object)[
            'type'=>'credential.revoke','credential_id'=>$id,'version'=>$input->version]]);
    }
    public function bindRest(OperationActor $owner,\stdClass $input):array {
        JsonSchema::validate($input,ToolContracts::object(['operation_id'=>ToolContracts::requestId(),'version'=>ToolContracts::hash(),
            'credential_id'=>['type'=>'integer','minimum'=>1],'user_id'=>['type'=>'integer','minimum'=>1]]));
        return $this->administration()->executeStudio($owner,(object)['operation_id'=>$input->operation_id,'intent'=>(object)[
            'type'=>'credential.bind_rest','credential_id'=>$input->credential_id,'user_id'=>$input->user_id,'version'=>$input->version]]);
    }
    private function version():string { return CanonicalJson::digest([self::enabled(new Settings($this->db),$this->config),$this->config['studio_mcp']??[]]); }
    private function approvals():AdminApprovalStore { return new AdminApprovalStore($this->db,$this->policy,$this->workspace,$this->config['app_key']??''); }
    private function administration():CredentialAdministrationService { return new CredentialAdministrationService($this->db,$this->policy,$this->approvals()); }
    public function activity(OperationActor $actor):array {
        return (new ExternalActivityService($this->db,$this->policy,$this->workspace))->read($actor,(object)[]);
    }
    private static function validBase(string $url):bool {
        if (strlen($url)>2048 || preg_match('/[\s\\\\]/',$url)) return false;
        $parts=parse_url($url);
        return is_array($parts) && isset($parts['scheme'],$parts['host']) && in_array($parts['scheme'],['https','http'],true)
            && !isset($parts['user']) && !isset($parts['pass']) && !isset($parts['query']) && !isset($parts['fragment']);
    }
}
