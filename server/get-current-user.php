<?php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$allowedOrigin = 'http://localhost:5173';

if (isset($_SERVER['HTTP_ORIGIN']) && $_SERVER['HTTP_ORIGIN'] === $allowedOrigin) {
    header("Access-Control-Allow-Origin: $allowedOrigin");
}

header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once(__DIR__ . '/utils/pg.connect.php');

$tabNum = (int)($_GET['tab_num'] ?? 0);

if ($tabNum <= 0) {
    http_response_code(400);

    echo json_encode([
        "ok" => false,
        "message" => "Не передан tab_num"
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

$query = "
    select
        cu.tab_num,
        cu.fio,
        cu.email,
        cr.id as role_id,
        cr.name as role_name
    from canban.canban_user cu
    inner join canban.canban_role cr
        on cr.id = cu.role_id
    where cu.tab_num = {$tabNum}
    limit 1
";

$data = $pg_db->Query($query, true);
$pg_db->Close();

if (!$data || count($data) === 0) {
    http_response_code(404);

    echo json_encode([
        "ok" => false,
        "message" => "Пользователь не найден"
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

echo json_encode([
    "ok" => true,
    "data" => $data[0]
], JSON_UNESCAPED_UNICODE);
?>