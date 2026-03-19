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
$teamId = (int)($_POST['team_id'] ?? 0);

if ($taskId <= 0 || $teamId <= 0) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'message' => 'Некорректные данные',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// удаляем комментарии команды
$deleteCommentsQuery = "
    delete from canban.canban_comment
    where team_id = $teamId
";
$pg_db->Query($deleteCommentsQuery);

// удаляем участников команды
$deleteUsersQuery = "
    delete from canban.canban_user_team
    where team_id = $teamId
";
$pg_db->Query($deleteUsersQuery);

// удаляем саму команду
$deleteTeamQuery = "
    delete from canban.canban_team
    where id = $teamId
      and task_id = $taskId
";
$pg_db->Query($deleteTeamQuery);

// возвращаем задачу в backlog
$moveTaskToBacklogQuery = "
    update canban.canban_task
    set status_id = 1
    where id = $taskId
";
$pg_db->Query($moveTaskToBacklogQuery);

$pg_db->Close();

echo json_encode([
    'ok' => true,
], JSON_UNESCAPED_UNICODE);
?>