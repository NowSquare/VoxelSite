<?php
declare(strict_types=1);
namespace VoxelSite\Agent;

/** Pure validation/resolution. No includes, writes, provider calls or partial acceptance. */
final class ChangeSetValidator
{
    public const MAX_OPERATIONS = 100;
    public const MAX_FILE_BYTES = 1048576;
    public const MAX_TEXT_BYTES = 8388608;

    public static function operationSchema(): array
    {
        $path = ['type'=>'string','minLength'=>1,'maxLength'=>240];
        $hash = ['type'=>'string','pattern'=>'^[a-f0-9]{64}$'];
        $nullableHash = ['anyOf'=>[$hash,['type'=>'null']]];
        $text = ['type'=>'string','maxLength'=>self::MAX_FILE_BYTES];
        $variants = [];
        foreach (['create','replace','edit','delete','merge','attach_asset'] as $type) {
            $fields = ['type'=>['const'=>$type], 'path'=>$path,
                'expected_hash'=>$type === 'create' ? ['type'=>'null'] : (in_array($type,['merge','attach_asset'],true) ? $nullableHash : $hash)];
            if (in_array($type,['create','replace'],true)) $fields['content'] = $text;
            if ($type === 'edit') $fields += ['before'=>['type'=>'string','minLength'=>1,'maxLength'=>self::MAX_FILE_BYTES], 'after'=>$text];
            if ($type === 'merge') $fields['delta'] = ['type'=>'object','properties'=>[
                'set'=>['type'=>'object','properties'=>[],'additionalProperties'=>true,'maxProperties'=>256],
                'remove'=>['type'=>'array','items'=>['type'=>'string','minLength'=>1,'maxLength'=>100],'maxItems'=>256,'uniqueItems'=>true],
            ],'required'=>['set','remove'],'additionalProperties'=>false];
            if ($type === 'attach_asset') $fields['upload_id'] = ['type'=>'string','pattern'=>'^upload_[a-f0-9]{32}$'];
            $variants[] = ['type'=>'object','properties'=>$fields,'required'=>array_keys($fields),'additionalProperties'=>false];
        }
        return ['oneOf'=>$variants];
    }

    /** @param array<string, string|null> $current Exact current source bytes; missing keys mean absent files. */
    public function resolve(array $operations, array $current, ?callable $finalizedAsset = null, bool $trustedSeo = false): array
    {
        if (!$operations || !array_is_list($operations) || count($operations) > self::MAX_OPERATIONS) {
            throw new OperationException('size_limit', 'Submit 1–100 operations in one change set.');
        }
        $total = 0; $resolved = [];
        foreach ($operations as $op) {
            if (!($op instanceof \stdClass)) throw new OperationException('invalid_schema', 'Each operation must be a JSON object.');
            foreach (['content','before','after'] as $key) {
                if (isset($op->$key) && is_string($op->$key)) {
                    $length = strlen($op->$key); $total += $length;
                    if ($length > self::MAX_FILE_BYTES || $total > self::MAX_TEXT_BYTES) throw new OperationException('size_limit', 'Text exceeds the 1 MiB file or 8 MiB request limit. Split the work into reviewed change sets.');
                }
            }
            if (isset($op->delta)) {
                $length = strlen(CanonicalJson::encode($op->delta)); $total += $length;
                if ($length > self::MAX_FILE_BYTES || $total > self::MAX_TEXT_BYTES) throw new OperationException('size_limit', 'The merge delta exceeds the text limit.');
            }
            JsonSchema::validate($op, self::operationSchema());
            $path = SitePathPolicy::canonical($op->path, !($trustedSeo && in_array($op->path, ['_root/robots.txt','_root/llms.txt'], true)));
            if (isset($resolved[$path])) throw new OperationException('invalid_schema', 'Each path can appear only once in a change set.', ['path'=>$path]);
            $before = $current[$path] ?? null;
            $beforeHash = $before === null ? null : hash('sha256', $before);
            if ($beforeHash !== $op->expected_hash) throw new OperationException('content_conflict', 'The source changed or the absence precondition no longer holds. Read the file and prepare again.', ['path'=>$path,'current_hash'=>$beforeHash]);
            if (SitePathPolicy::isMergeOnly($path) && $op->type !== 'merge') throw new OperationException('invalid_schema', 'Memory and design intelligence accept merge deltas only.', ['path'=>$path]);
            $binary = SitePathPolicy::type($path) === 'binary';
            if ($binary && !in_array($op->type, ['attach_asset','delete'], true)) throw new OperationException('invalid_schema', 'Upload binary assets, then attach their finalized upload ID.');
            $after = match ($op->type) {
                'create','replace' => $op->content,
                'delete' => null,
                'edit' => $this->edit($before, $op->before, $op->after, $path),
                'merge' => $this->merge($path, $before, $op->delta),
                'attach_asset' => $this->asset($path, $op->upload_id, $finalizedAsset),
            };
            if ($after !== null && !$binary) {
                if (strlen($after) > self::MAX_FILE_BYTES) throw new OperationException('size_limit', 'The resulting file exceeds 1 MiB.', ['path'=>$path]);
                $this->validateContent($path, $after);
            }
            $resolved[$path] = ['type'=>$op->type, 'expected_hash'=>$beforeHash, 'content'=>$after, 'binary'=>$binary,
                'proposed_hash'=>$after === null ? null : hash('sha256', $after)];
        }
        return $resolved;
    }

    public function validateContent(string $path, string $content): void
    {
        if (!mb_check_encoding($content, 'UTF-8') || str_contains($content, "\0")) throw new OperationException('invalid_schema', 'Source files must contain UTF-8 text without NUL bytes.', ['path'=>$path]);
        $type = SitePathPolicy::type($path);
        if (in_array($type, ['page','partial'], true)) {
            if (!function_exists('token_get_all')) throw new OperationException('host_capability_unavailable', 'Enable the PHP tokenizer extension before authoring PHP files.');
            try { token_get_all($content, TOKEN_PARSE); }
            catch (\ParseError $e) { throw new OperationException('invalid_schema', 'PHP syntax is invalid. Correct the source and prepare again.', ['path'=>$path,'line'=>$e->getLine()]); }
            if (preg_match('/\$_SERVER\s*\[\s*[\'"]DOCUMENT_ROOT[\'"]\s*\]/', $content)) throw new OperationException('invalid_schema', 'Use paths relative to the draft page or shared partial. Document-root reads can bypass draft isolation.', ['path'=>$path]);
        }
        if (in_array($type,['data','forms'],true)) {
            try { $data = json_decode($content, false, 64, JSON_THROW_ON_ERROR); }
            catch (\JsonException) { throw new OperationException('invalid_schema', 'The data file is not valid JSON.', ['path'=>$path]); }
            if ($type === 'forms') $this->validateForm($path, $data);
        }
    }

    /** Block newly broken dependencies; disclose retained legacy problems in the review. */
    public function dependencies(array $files, array $before = []): array
    {
        $warnings = [];
        $warn = static function (string $code, string $path, string $message) use (&$warnings): void {
            if (count($warnings) < 500) $warnings[] = ['code'=>$code,'path'=>$path,'message'=>mb_strcut($message,0,2048,'UTF-8')];
            else $warnings[499] = ['code'=>'dependency_warnings_truncated','message'=>'Additional dependency warnings were omitted. Review the existing site dependencies before publication.'];
        };
        $pages = array_filter(array_keys($files), static fn ($path) => SitePathPolicy::type($path) === 'page');
        $oldPages = array_filter(array_keys($before), static fn ($path) => SitePathPolicy::type($path) === 'page');
        if ($pages) {
            foreach (['_partials/header.php','_partials/nav.php','_partials/footer.php'] as $partial) {
                if (array_key_exists($partial, $files)) continue;
                if (!$oldPages || array_key_exists($partial,$before)) throw new OperationException('invalid_schema', 'A site with pages requires the shared header, navigation and footer partials.', ['missing'=>$partial]);
                $warn('pre_existing_dependency',$partial,'This existing site has no '.$partial.'. This change does not add the shared partial.');
            }
        }
        foreach ($files as $path => $content) {
            if (!in_array(SitePathPolicy::type($path), ['page','partial','css','js'], true)) continue;
            $dependencies = $this->staticDependencies($path,$content);
            $oldDependencies = isset($before[$path]) ? $this->staticDependencies($path,$before[$path]) : [];
            foreach ($dependencies as $target=>$errorCode) {
                if (array_key_exists($target,$files)) continue;
                // Check all referring files: deleting a target creates a new
                // broken dependency even when its referring source is unchanged.
                if (!array_key_exists($target,$oldDependencies) || array_key_exists($target,$before)) {
                    throw new OperationException($errorCode,'A new or removed dependency cannot be resolved in the proposed draft.', ['path'=>$path,'missing'=>mb_strcut($target,0,240,'UTF-8')]);
                }
                $warn('pre_existing_dependency',$path,'An existing dependency remains unresolved: '.$target.'. This change does not repair it.');
            }
            if (str_contains($content, 'include $') || str_contains($content, 'require $')) {
                $warn('dynamic_dependency',$path,'Dynamic PHP dependencies need external review. Static validation cannot resolve them.');
            }
        }
        return $warnings;
    }

    /** @return array<string,string> Static targets and the error for a newly unresolved target. */
    private function staticDependencies(string $path, string $content): array
    {
        $targets = [];
        if (preg_match_all('~(?:include|include_once|require|require_once)\s*(?:\(\s*)?(__DIR__|dirname\(__DIR__(?:,\s*([1-9]))?\))\s*\.\s*([\'"])(.*?)\3~s', $content, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $match) {
                $directory = dirname($path);
                if ($match[1] !== '__DIR__') $directory = dirname($directory, (int) ($match[2] ?: 1));
                $relative = $directory . '/' . ltrim($match[4], '/');
                try { $targets[$this->relativeDependency($relative)] = 'invalid_schema'; }
                catch (OperationException) { $targets['outside-site:'.$relative] = 'invalid_path'; }
            }
        }
        // Strip complete qualified URLs before looking for managed paths. A
        // CDN path (including its query) is not a local asset dependency.
        $localContent = preg_replace('~(?<![A-Za-z0-9+.-])(?:[A-Za-z][A-Za-z0-9+.-]*:|//)[^\s\'"`()<>]+~', '', $content);
        if (preg_match_all('~(?<![A-Za-z0-9])/?(assets/(?:css|js|data|forms|images|files|fonts|media)/[A-Za-z0-9_./-]+\.[A-Za-z0-9]+)~', $localContent, $matches)) {
            foreach ($matches[1] as $target) $targets[$target] = 'invalid_schema';
        }
        return $targets;
    }

    private function edit(?string $source, string $before, string $after, string $path): string
    {
        $offset = $source === null ? false : strpos($source,$before);
        if ($offset === false || strpos($source,$before,$offset+1) !== false) throw new OperationException('content_conflict', 'An exact edit must match once. Read the current source and choose a unique anchor.', ['path'=>$path]);
        return substr_replace($source,$after,$offset,strlen($before));
    }

    private function merge(string $path, ?string $source, \stdClass $delta): string
    {
        if (SitePathPolicy::type($path) !== 'data') throw new OperationException('invalid_schema', 'Merge deltas are limited to JSON data files.');
        try { $existing = $source === null ? new \stdClass() : json_decode($source, false, 64, JSON_THROW_ON_ERROR); }
        catch (\JsonException) { throw new OperationException('invalid_schema', 'The existing data file is invalid. Repair it before merging.'); }
        if (!($existing instanceof \stdClass)) throw new OperationException('invalid_schema', 'A merge target must be a JSON object.');
        foreach (get_object_vars($delta->set) as $key => $value) {
            if (!preg_match('/^[a-zA-Z0-9_][a-zA-Z0-9_.-]{0,99}$/D', (string) $key) || in_array($key, $delta->remove, true)) throw new OperationException('invalid_schema', 'Merge keys must be bounded names and cannot be set and removed together.');
            if ($path === 'assets/data/memory.json') {
                if (!($value instanceof \stdClass) || !property_exists($value, 'value') || !property_exists($value, 'confidence')
                    || array_diff(array_keys(get_object_vars($value)), ['value','confidence'])
                    || !in_array($value->confidence, ['stated','inferred'], true)) throw new OperationException('invalid_schema', 'Each memory value needs value and stated/inferred confidence.');
            }
            if ($path === 'assets/data/design-intelligence.json' && !is_string($value)) throw new OperationException('invalid_schema', 'Design intelligence values must be prose strings.');
            $existing->$key = $value;
        }
        foreach ($delta->remove as $key) unset($existing->$key);
        return json_encode($existing, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR) . "\n";
    }

    private function asset(string $path, string $uploadId, ?callable $reader): string
    {
        if (SitePathPolicy::type($path) !== 'binary') throw new OperationException('invalid_schema', 'An uploaded asset cannot replace source code or data.');
        if ($reader === null) throw new OperationException('feature_disabled', 'Asset transfer is not available on this connection.');
        $bytes = $reader($uploadId, $path);
        if (!is_string($bytes)) throw new \LogicException('Asset reader must return finalized bytes.');
        return $bytes;
    }

    private function validateForm(string $path, mixed $data): void
    {
        if (!($data instanceof \stdClass) || ($data->id ?? null) !== pathinfo($path, PATHINFO_FILENAME)
            || !is_array($data->fields ?? null) || !$data->fields || count($data->fields) > 100) throw new OperationException('invalid_schema', 'Form schemas need a matching ID and 1–100 fields.', ['path'=>$path]);
        $seen = [];
        foreach ($data->fields as $field) {
            if (!($field instanceof \stdClass) || !is_string($field->name ?? null) || !preg_match('/^[a-z][a-z0-9_]{0,63}$/D', $field->name)
                || isset($seen[$field->name]) || !in_array($field->type ?? 'text',
                    ['text','email','tel','url','number','date','time','datetime-local','textarea','select','radio','multiselect','checkbox','file','hidden'],true)) {
                throw new OperationException('invalid_schema', 'Form field names must be unique and use a supported type.', ['path'=>$path]);
            }
            foreach(['label','placeholder','description','options_from'] as $key)if(isset($field->$key)&&!is_string($field->$key))throw new OperationException('invalid_schema','Form field text must be a string.',['path'=>$path]);
            if(isset($field->required)&&!is_bool($field->required))throw new OperationException('invalid_schema','Form required must be a boolean.',['path'=>$path]);
            if(isset($field->validation)&&!($field->validation instanceof \stdClass))throw new OperationException('invalid_schema','Form validation must be an object.',['path'=>$path]);
            foreach(['min_length','max_length'] as $key)if(isset($field->validation->$key)&&(!is_int($field->validation->$key)||$field->validation->$key<0||$field->validation->$key>32768))throw new OperationException('invalid_schema','Form text limits must be bounded integers.',['path'=>$path]);
            if(isset($field->validation->pattern)&&(!is_string($field->validation->pattern)||strlen($field->validation->pattern)>1000))throw new OperationException('invalid_schema','Form patterns must be bounded strings.',['path'=>$path]);
            if(isset($field->options)){if(!is_array($field->options)||count($field->options)>100)throw new OperationException('invalid_schema','Form options must be a bounded list.',['path'=>$path]);foreach($field->options as $option)if(!($option instanceof \stdClass)||!isset($option->value)||!is_scalar($option->value))throw new OperationException('invalid_schema','Form options need scalar values.',['path'=>$path]);}
            $seen[$field->name] = true;
        }
    }

    private function relativeDependency(string $path): string
    {
        $parts = [];
        foreach (explode('/', $path) as $part) {
            if ($part === '' || $part === '.') continue;
            if ($part === '..') { if (!$parts) throw new OperationException('invalid_path', 'A dependency points outside the site.'); array_pop($parts); }
            else $parts[] = $part;
        }
        return implode('/', $parts);
    }
}
