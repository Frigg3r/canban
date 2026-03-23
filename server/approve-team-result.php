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
$approvedByTabNum = (int)($data['approved_by_tab_num'] ?? 0);

if ($teamId <= 0 || $approvedByTabNum <= 0) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'message' => 'Некорректные данные',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$result = $pg_db->Query("
    select *
    from canban.approve_team_result($teamId, $approvedByTabNum)
", true);

$pg_db->Close();

if ($result === false || count($result) === 0) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'message' => 'Не удалось принять результат команды',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode([
    'ok' => true,
    'message' => 'Результат команды принят',
    'data' => $result[0],
], JSON_UNESCAPED_UNICODE);
?>