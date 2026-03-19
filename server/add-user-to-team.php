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

// проверяем, что сотрудник еще не участвует в этой задаче
$checkQuery = "
    select 1
    from canban.canban_user_team cut
    join canban.canban_team ct on ct.id = cut.team_id
    join canban.canban_team current_team on current_team.id = $teamId
    where ct.task_id = current_team.task_id
      and cut.tab_num = $tabNum
    limit 1
";

$checkResult = $pg_db->Query($checkQuery, true);

if (!empty($checkResult)) {
    echo json_encode([
        'ok' => false,
        'message' => 'Сотрудник уже участвует в этой задаче',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$insertQuery = "
    insert into canban.canban_user_team (
        team_id,
        tab_num
    )
    values (
        $teamId,
        $tabNum
    )
";

$pg_db->Query($insertQuery);

$pg_db->Close();

echo json_encode([
    'ok' => true,
], JSON_UNESCAPED_UNICODE);
?>