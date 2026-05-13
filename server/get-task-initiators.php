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

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    http_response_code(405);
    echo json_encode([
        "ok" => false,
        "message" => "Метод не разрешён"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$query = "
    select
        tab_num,
        fio,
        email
    from canban.canban_user
    where is_task_initiator = true
    order by fio
";

$data = $pg_db->Query($query, true);
$pg_db->Close();

echo json_encode([
    "ok" => true,
    "data" => $data ?: []
], JSON_UNESCAPED_UNICODE);
?>