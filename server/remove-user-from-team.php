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

$data = json_decode(file_get_contents("php://input"), true);

$teamId = (int)($data['team_id'] ?? 0);
$tabNum = (int)($data['tab_num'] ?? 0);

if ($teamId <= 0 || $tabNum <= 0) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'message' => 'Некорректные данные',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$accrualRows = $pg_db->Query("
    select 1
    from canban.canban_score_accrual
    where team_id = $teamId
      and tab_num = $tabNum
    limit 1
", true);

if ($accrualRows && count($accrualRows) > 0) {
    $pg_db->Close();

    echo json_encode([
        'ok' => false,
        'message' => 'Нельзя удалить участника из уже принятой команды',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$deleteUserQuery = "
    delete from canban.canban_user_team
    where team_id = $teamId
      and tab_num = $tabNum
";

$pg_db->Query($deleteUserQuery);

$countQuery = "
    select count(*) as cnt
    from canban.canban_user_team
    where team_id = $teamId
";

$countResult = $pg_db->Query($countQuery, true);
$participantsCount = (int)$countResult[0]['cnt'];

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