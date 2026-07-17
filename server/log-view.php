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

$input = json_decode(file_get_contents("php://input"), true);
$taskId = (int)($input['task_id'] ?? 0);
$tabNum = (int)($input['tab_num'] ?? 0);

if ($taskId <= 0 || $tabNum <= 0) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'message' => 'Некорректные данные'], JSON_UNESCAPED_UNICODE);
    exit;
}

$checkQuery = "
    SELECT 1 
    FROM canban.canban_task_view 
    WHERE task_id = $taskId 
      AND tab_num = $tabNum 
      AND viewed_at >= now() - interval '1 minute'
    LIMIT 1
";
$recentView = $pg_db->Query($checkQuery, true);

if (empty($recentView)) {
    $pg_db->Query("INSERT INTO canban.canban_task_view (task_id, tab_num) VALUES ($taskId, $tabNum)");
}

$pg_db->Close();

echo json_encode([
    'ok' => true,
    'data' => null
], JSON_UNESCAPED_UNICODE);
?>