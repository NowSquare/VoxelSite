<?php
declare(strict_types=1);
$body=json_decode(file_get_contents('php://input'),true) ?? [];
file_put_contents(__DIR__.'/provider-requests.jsonl',json_encode($body)."\n",FILE_APPEND);
$system=$body['messages'][0]['content'] ?? '';
$prompt=$body['messages'][1]['content'] ?? '';
if (str_contains($system,'intent classifier')) {
    $result=['category'=>'content','scope'=>'partial:_partials/footer.php','keywords'=>['footer'],
        'summary'=>'Update the shared footer copy.'];
} else {
    $result=['edits'=>[['file'=>'_partials/footer.php','region'=>['start'=>1,'end'=>1],'strategy'=>'line-replace',
        'description'=>'Update the shared footer copy.','before_snippet'=>'Original shared footer',
        'after_snippet'=>'Reviewed shared footer','verification'=>'All pages render the reviewed footer.']],
        'summary'=>'Update the footer across the website.','risk_level'=>'low'];
}
header('Content-Type: application/json');
echo json_encode(['id'=>'fixture-completion','model'=>'fixture-model',
    'choices'=>[['message'=>['role'=>'assistant','content'=>json_encode($result)],'finish_reason'=>'stop']],
    'usage'=>['prompt_tokens'=>100,'completion_tokens'=>100,'total_tokens'=>200]]);
