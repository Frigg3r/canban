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
$participants = $_POST['participants'] ?? [];

if ($taskId <= 0) {
    echo json_encode([
        'ok' => false,
        'message' => 'Не передан task_id',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// если хотя бы один из переданных сотрудников уже участвует
// в этой задаче, повторно брать ее нельзя
if (!empty($participants)) {
    $participantsList = implode(',', $participants);

    $busyParticipantQuery = "
        select cut.tab_num
        from canban.canban_user_team cut
        join canban.canban_team ct on ct.id = cut.team_id
        where ct.task_id = $taskId
          and cut.tab_num in ($participantsList)
        limit 1
    ";

    $busyParticipant = $pg_db->Query($busyParticipantQuery, true);

    if (!empty($busyParticipant)) {
        echo json_encode([
            'ok' => false,
            'message' => 'Сотрудник уже участвует в этой задаче',
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
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

// оставил forEach, можно сделать одним запросом, развернув с помощью unnest, пока думаю..
foreach ($participants as $tabNum) {
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
}

$pg_db->Close();

// возвращаем карточку с привязкой к команде
echo json_encode([
    'ok' => true,
    'data' => [
        'team_id' => $teamId,
        'task_id' => $taskId,
    ],
], JSON_UNESCAPED_UNICODE);
?>