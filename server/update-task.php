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
$name = trim($_POST['name'] ?? '');
$description = trim($_POST['description'] ?? '');
$score = (int)($_POST['score'] ?? 0);
$quota = (int)($_POST['quota'] ?? 0);
$deadline = trim($_POST['deadline'] ?? '');

if ($taskId <= 0 || !$name || !$description || $score <= 0 || $quota <= 0 || !$deadline) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'message' => 'Некорректные данные',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$checkQuery = "
    select id
    from canban.canban_task
    where id = $taskId
      and status_id = 1
      and is_archived = false
";

$task = $pg_db->Query($checkQuery, true);

if (!$task || count($task) === 0) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'message' => 'Редактировать можно только карточку в бэклоге',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$name = pg_escape_string($pg_db->link, $name);
$description = pg_escape_string($pg_db->link, $description);

$deadlineObj = DateTime::createFromFormat('Y-m-d', $deadline);

if (!$deadlineObj) {
    $deadlineObj = DateTime::createFromFormat('d.m.Y', $deadline);
}

if (!$deadlineObj) {
    $deadlineObj = DateTime::createFromFormat('d.m.Y H:i', $deadline);
}

if (!$deadlineObj) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'message' => 'Неверный формат дедлайна',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$deadlineIso = $deadlineObj->format('Y-m-d 00:00:00');
$deadlineIso = pg_escape_string($pg_db->link, $deadlineIso);

$updateQuery = "
    update canban.canban_task
    set
        name = '$name',
        description = '$description',
        score = $score,
        quota = $quota,
        deadline = '$deadlineIso'
    where id = $taskId
";

$pg_db->Query($updateQuery);
$pg_db->Close();

echo json_encode([
    'ok' => true,
    'message' => 'Карточка обновлена',
], JSON_UNESCAPED_UNICODE);
?>