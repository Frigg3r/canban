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
$teamId = isset($_GET['team_id']) && $_GET['team_id'] !== '' ? (int)$_GET['team_id'] : null;
$tabNum = isset($_GET['tab_num']) && $_GET['tab_num'] !== '' ? (int)$_GET['tab_num'] : null;

$teamSql = $teamId === null ? 'null' : $teamId;
$tabNumSql = $tabNum === null ? 'null' : $tabNum;

$query = "select canban.f_get_task_details($taskId, $teamSql, $tabNumSql) as data";
$result = $pg_db->Query($query, true);
$pg_db->Close();

$data = $result[0]['data'] ?? null;

echo json_encode([
    "ok" => true,
    "data" => is_string($data) ? json_decode($data, true) : $data
], JSON_UNESCAPED_UNICODE);
?>