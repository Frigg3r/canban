<?php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$allowedOrigin = 'http://localhost:5173';

if (isset($_SERVER['HTTP_ORIGIN']) && $_SERVER['HTTP_ORIGIN'] === $allowedOrigin) {
    header("Access-Control-Allow-Origin: $allowedOrigin");
}

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once(__DIR__ . '/utils/pg.connect.php');

$_POST = json_decode(file_get_contents("php://input"), true);

$taskId = (int)($_POST['task_id'] ?? 0);

if ($taskId <= 0) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'message' => 'Некорректный task_id',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// получаем текущий статус и архивность задачи
$taskQuery = "
    select
        id,
        status_id,
        is_archived
    from canban.canban_task
    where id = $taskId
    limit 1
";

$taskResult = $pg_db->Query($taskQuery, true);

if (!$taskResult || !isset($taskResult[0])) {
    http_response_code(404);
    echo json_encode([
        'ok' => false,
        'message' => 'Задача не найдена',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$task = $taskResult[0];
$statusId = (int)$task['status_id'];
$isArchived = filter_var($task['is_archived'], FILTER_VALIDATE_BOOLEAN);

// если уже в архиве
if ($isArchived) {
    echo json_encode([
        'ok' => true,
        'message' => 'Задача уже в архиве',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// разрешаем архивировать только backlog (1) и done (4)
if (!in_array($statusId, [1, 4], true)) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'message' => 'Можно архивировать только задачи из бэклога или выполненные задачи',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$archiveTaskQuery = "
    update canban.canban_task
    set is_archived = true
    where id = $taskId
";

$pg_db->Query($archiveTaskQuery);

$pg_db->Close();

echo json_encode([
    'ok' => true,
    'message' => 'Задача отправлена в архив',
], JSON_UNESCAPED_UNICODE);
?>