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

$input = json_decode(file_get_contents("php://input"), true) ?? [];

$teamId = (int)($input['team_id'] ?? 0);
$status = trim($input['status'] ?? '');

if ($teamId <= 0 || !$status) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'message' => 'Некорректные данные',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$statusMap = [
    'inProgress' => 1,
    'review' => 2,
];

if (!isset($statusMap[$status])) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'message' => 'Недопустимый статус',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$statusId = $statusMap[$status];

$updateQuery = "
    update canban.canban_team
    set status_id = $statusId
    where id = $teamId
";

$pg_db->Query($updateQuery);

$pg_db->Close();

echo json_encode([
    'ok' => true,
    'message' => 'Статус команды изменён',
], JSON_UNESCAPED_UNICODE);
?>