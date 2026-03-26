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

$input = json_decode(file_get_contents("php://input"), true);

$taskId = (int)($input['task_id'] ?? 0);

if ($taskId <= 0) {
    echo json_encode([
        'ok' => false,
        'message' => 'Некорректный task_id',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$taskQuery = "
    select
        status_id
    from canban.canban_task
    where id = $taskId
    limit 1
";

$taskResult = $pg_db->Query($taskQuery, true);

if (!$taskResult || !isset($taskResult[0])) {
    $pg_db->Close();

    echo json_encode([
        'ok' => false,
        'message' => 'Задача не найдена',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$task = $taskResult[0];
$statusId = (int)$task['status_id'];

if (!in_array($statusId, [1, 3], true)) {
    $pg_db->Close();

    echo json_encode([
        'ok' => false,
        'message' => 'Можно архивировать только задачи из бэклога или выполненные задачи',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$activeTeamQuery = "
    select 1
    from canban.canban_team
    where task_id = $taskId
      and status_id in (1, 2)
    limit 1
";

$activeTeamResult = $pg_db->Query($activeTeamQuery, true);

if ($activeTeamResult && count($activeTeamResult) > 0) {
    $pg_db->Close();

    echo json_encode([
        'ok' => false,
        'message' => 'Нельзя архивировать карточку, пока она находится в работе или на проверке',
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