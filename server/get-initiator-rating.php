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

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    http_response_code(405);
    echo json_encode([
        "ok" => false,
        "message" => "Метод не разрешен"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

require_once(__DIR__ . '/utils/pg.connect.php');

$year = (int)($_GET['year'] ?? 0);
$quarter = (int)($_GET['quarter'] ?? 0);

if ($year <= 0 || $quarter < 1 || $quarter > 4) {
    http_response_code(400);
    echo json_encode([
        "ok" => false,
        "message" => "Некорректный год или квартал"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$query = "
    select *
    from canban.f_get_initiator_rating({$year}, {$quarter})
";

$data = $pg_db->Query($query, true);
$pg_db->Close();

if ($data === false) {
    http_response_code(500);
    echo json_encode([
        "ok" => false,
        "message" => "Не удалось загрузить рейтинг инициаторов"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode([
    "ok" => true,
    "data" => $data
], JSON_UNESCAPED_UNICODE);
?>