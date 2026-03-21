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

$query = "
    select
        d.tab_num,
        d.fio,
        d.email
    from canban.canban_employee_directory d
    where not exists (
        select 1
        from canban.canban_user u
        where u.tab_num = d.tab_num
    )
    order by d.fio
";

$data = $pg_db->Query($query, true);

$pg_db->Close();

echo json_encode([
    'ok' => true,
    'data' => $data,
], JSON_UNESCAPED_UNICODE);
?>