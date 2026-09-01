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

$tabNum = (int)($_GET['tab_num'] ?? 0);
$year = (int)($_GET['year'] ?? 0);
$quarter = (int)($_GET['quarter'] ?? 0);
$type = $_GET['type'] ?? 'performers';

if ($tabNum <= 0 || $year <= 0 || $quarter < 1 || $quarter > 4) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'message' => 'Некорректные параметры'], JSON_UNESCAPED_UNICODE);
    exit;
}

$data = [];

if ($type === 'performers') {
    $query = "
        WITH period AS (
            SELECT
                make_date($year, (($quarter - 1) * 3) + 1, 1) AS date_from,
                make_date($year, (($quarter - 1) * 3) + 1, 1) + interval '3 month' AS date_to
        )
        SELECT
            t.id,
            t.name,
            csa.score,
            to_char(t.deadline, 'DD.MM.YYYY') as deadline,
            t.deadline as sort_date,
            NULL as comment,
            false as is_donation,
            NULL as donation_user_name
        FROM canban.canban_score_accrual csa
        JOIN canban.canban_team ct ON ct.id = csa.team_id
        JOIN canban.canban_task t ON t.id = ct.task_id
        CROSS JOIN period p
        WHERE csa.tab_num = $tabNum
          AND t.deadline >= p.date_from
          AND t.deadline < p.date_to

        UNION ALL

        SELECT
            t.id,
            t.name,
            d.score,
            to_char(d.created_at, 'DD.MM.YYYY') as deadline,
            d.created_at as sort_date,
            d.comment,
            true as is_donation,
            u.fio as donation_user_name
        FROM canban.canban_donation d
        JOIN canban.canban_task t ON t.id = d.task_id
        JOIN canban.canban_user u ON u.tab_num = d.from_tab_num
        CROSS JOIN period p
        WHERE d.to_tab_num = $tabNum
          AND d.created_at >= p.date_from
          AND d.created_at < p.date_to

        UNION ALL

        SELECT
            t.id,
            t.name,
            -d.score as score,
            to_char(d.created_at, 'DD.MM.YYYY') as deadline,
            d.created_at as sort_date,
            d.comment,
            true as is_donation,
            u.fio as donation_user_name
        FROM canban.canban_donation d
        JOIN canban.canban_task t ON t.id = d.task_id
        JOIN canban.canban_user u ON u.tab_num = d.to_tab_num
        CROSS JOIN period p
        WHERE d.from_tab_num = $tabNum
          AND d.created_at >= p.date_from
          AND d.created_at < p.date_to

        ORDER BY sort_date DESC
    ";
    $data = $pg_db->Query($query, true) ?: [];
} else {
    $query = "
        WITH period AS (
            SELECT
                make_date($year, (($quarter - 1) * 3) + 1, 1) AS date_from,
                make_date($year, (($quarter - 1) * 3) + 1, 1) + interval '3 month' AS date_to
        )
        SELECT
            t.id,
            t.name,
            isa.score,
            to_char(isa.deadline_at, 'DD.MM.YYYY') as deadline,
            NULL as comment,
            false as is_donation,
            NULL as donation_user_name
        FROM canban.canban_initiator_score_accrual isa
        JOIN canban.canban_task t ON t.id = isa.task_id
        CROSS JOIN period p
        WHERE isa.initiator_tab_num = $tabNum
          AND isa.deadline_at >= p.date_from
          AND isa.deadline_at < p.date_to
        ORDER BY isa.deadline_at DESC
    ";
    $data = $pg_db->Query($query, true) ?: [];
}

$data = array_map(function($row) {
    $row['is_donation'] = $row['is_donation'] === 't' || $row['is_donation'] === true;
    return $row;
}, $data);

$pg_db->Close();

echo json_encode([
    'ok' => true,
    'data' => $data
], JSON_UNESCAPED_UNICODE);
?>