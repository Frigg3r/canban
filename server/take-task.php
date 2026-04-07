<?php
header("Content-Type: application/json; charset=utf-8");
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

$input = json_decode(file_get_contents("php://input"), true) ?? [];

$taskId = (int)($input['task_id'] ?? 0);
$tabNum = (int)($input['tab_num'] ?? 0);

if ($taskId <= 0 || $tabNum <= 0) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'message' => 'Некорректные данные',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$busyParticipantQuery = "
    select 1
    from canban.canban_user_team cut
    join canban.canban_team ct on ct.id = cut.team_id
    where ct.task_id = $taskId
      and cut.tab_num = $tabNum
    limit 1
";

$busyParticipant = $pg_db->Query($busyParticipantQuery, true);

if (!empty($busyParticipant)) {
    $pg_db->Close();

    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'message' => 'Сотрудник уже участвует в этой задаче',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$teamsCountQuery = "
    select count(*) as cnt
    from canban.canban_team
    where task_id = $taskId
";

$teamsCountResult = $pg_db->Query($teamsCountQuery, true);
$teamsCount = (int)($teamsCountResult[0]['cnt'] ?? 0);

if ($teamsCount >= 3) {
    $pg_db->Close();

    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'message' => 'Нельзя создать больше 3 команд по задаче',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$teamQuery = "
    insert into canban.canban_team (
        task_id,
        status_id
    )
    values (
        $taskId,
        1
    )
    returning id
";

$teamResult = $pg_db->Query($teamQuery, true);
$teamId = (int)$teamResult[0]['id'];

$insertParticipantQuery = "
    insert into canban.canban_user_team (
        team_id,
        tab_num
    )
    values (
        $teamId,
        $tabNum
    )
";

$pg_db->Query($insertParticipantQuery);

$updateTaskQuery = "
    update canban.canban_task
    set status_id = 2
    where id = $taskId
";

$pg_db->Query($updateTaskQuery);

$pg_db->Close();

echo json_encode([
    'ok' => true,
    'data' => [
        'team_id' => $teamId,
        'task_id' => $taskId,
    ],
], JSON_UNESCAPED_UNICODE);
?>