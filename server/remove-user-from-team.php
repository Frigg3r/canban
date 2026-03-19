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

$teamId = (int)($_POST['team_id'] ?? 0);
$tabNum = (int)($_POST['tab_num'] ?? 0);

// to do: возможно переделаю в процедуру в БД

// удаляем сотрудника из команды
$deleteUserQuery = "
    delete from canban.canban_user_team
    where team_id = $teamId
      and tab_num = $tabNum
";

$pg_db->Query($deleteUserQuery);

// проверяем, остались ли еще участники в команде
$countQuery = "
    select count(*) as cnt
    from canban.canban_user_team
    where team_id = $teamId
";

$countResult = $pg_db->Query($countQuery, true);
$participantsCount = (int)$countResult[0]['cnt'];

// если команда пустая - возвращаем задачу в бэклог и удаляем всё связанное с командой
if ($participantsCount === 0) {
    $taskQuery = "
        select task_id
        from canban.canban_team
        where id = $teamId
        limit 1
    ";

    $taskResult = $pg_db->Query($taskQuery, true);
    $taskId = isset($taskResult[0]['task_id']) ? (int)$taskResult[0]['task_id'] : 0;

    if ($taskId > 0) {
        $moveTaskToBacklogQuery = "
            update canban.canban_task
            set status_id = 1
            where id = $taskId
        ";

        $pg_db->Query($moveTaskToBacklogQuery);
    }

    $deleteCommentsQuery = "
        delete from canban.canban_comment
        where team_id = $teamId
    ";

    $pg_db->Query($deleteCommentsQuery);

    $deleteTeamQuery = "
        delete from canban.canban_team
        where id = $teamId
    ";

    $pg_db->Query($deleteTeamQuery);
}

$pg_db->Close();

echo json_encode([
    'ok' => true,
], JSON_UNESCAPED_UNICODE);
?>