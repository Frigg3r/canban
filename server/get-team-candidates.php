<?php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
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

$taskId = (int)($_GET['task_id'] ?? 0);

if ($taskId <= 0) {
    echo json_encode([
        'ok' => false,
        'message' => 'Не передан task_id',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$query = "
    select
        u.tab_num,
        u.fio
    from canban.canban_user u
    where u.tab_num not in (
        select cut.tab_num
        from canban.canban_user_team cut
        join canban.canban_team ct on ct.id = cut.team_id
        where ct.task_id = $taskId
    )
    order by u.fio
";

$data = $pg_db->Query($query, true);

$pg_db->Close();

echo json_encode([
    'ok' => true,
    'data' => $data,
], JSON_UNESCAPED_UNICODE);
?>