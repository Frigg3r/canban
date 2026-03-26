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

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $input = json_decode(file_get_contents("php://input"), true);

    $name = $input['name'];
    $description = $input['description'];
    $score = (int) $input['score'];
    $quota = (int) $input['quota'];
    $deadline = $input['deadline'];
    $created_by_tab_num = (int)($input['created_by_tab_num'] ?? 0);

    $query = "
        insert into canban.canban_task (
            name,
            description,
            score,
            quota,
            deadline,
            status_id,
            is_archived,
            created_at,
            created_by_tab_num
        )
        values (
            '{$name}',
            '{$description}',
            {$score},
            {$quota},
            '{$deadline}'::timestamp,
            1,
            false,
            now(),
            {$created_by_tab_num}
        )
        returning
            id,
            name,
            description,
            score,
            quota,
            to_char(deadline, 'DD.MM') as deadline_short,
            to_char(deadline, 'YYYY-MM-DD') as deadline_full,
            0 as participants_count,
            'backlog' as board_status
    ";

    $data = $pg_db->Query($query, true);
    $pg_db->Close();

    echo json_encode([
        "ok" => true,
        "data" => $data[0]
    ], JSON_UNESCAPED_UNICODE);
}
?>