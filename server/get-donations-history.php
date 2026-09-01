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
    SELECT 
        d.id,
        d.score,
        d.comment,
        to_char(d.created_at, 'DD.MM.YYYY HH24:MI') as created_at,
        uf.fio as from_user,
        ut.fio as to_user,
        t.name as task_name
    FROM canban.canban_donation d
    JOIN canban.canban_user uf ON uf.tab_num = d.from_tab_num
    JOIN canban.canban_user ut ON ut.tab_num = d.to_tab_num
    JOIN canban.canban_task t ON t.id = d.task_id
    ORDER BY d.created_at DESC
    LIMIT 100
";

$data = $pg_db->Query($query, true) ?: [];
$pg_db->Close();

echo json_encode(['ok' => true, 'data' => $data], JSON_UNESCAPED_UNICODE);
?>