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
$fromTabNum = (int)($input['from_tab_num'] ?? 0);
$toTabNum = (int)($input['to_tab_num'] ?? 0);
$taskId = (int)($input['task_id'] ?? 0);
$score = (int)($input['score'] ?? 0);
$comment = trim($input['comment'] ?? '');

if ($fromTabNum <= 0 || $toTabNum <= 0 || $taskId <= 0 || $score <= 0 || $fromTabNum === $toTabNum) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'message' => 'Некорректные данные для перевода'], JSON_UNESCAPED_UNICODE);
    exit;
}

$year = (int)date('Y');
$quarter = ceil((int)date('n') / 3);

$balanceQuery = "
    WITH period AS (
        SELECT
            make_date($year, (($quarter - 1) * 3) + 1, 1) AS date_from,
            make_date($year, (($quarter - 1) * 3) + 1, 1) + interval '3 month' AS date_to
    )
    SELECT 
        (
            coalesce((SELECT sum(csa.score) FROM canban.canban_score_accrual csa JOIN canban.canban_team ct ON ct.id = csa.team_id JOIN canban.canban_task t ON t.id = ct.task_id CROSS JOIN period p WHERE csa.tab_num = $fromTabNum AND t.deadline >= p.date_from AND t.deadline < p.date_to), 0)
            + coalesce((SELECT sum(isa.score) FROM canban.canban_initiator_score_accrual isa CROSS JOIN period p WHERE isa.initiator_tab_num = $fromTabNum AND isa.deadline_at >= p.date_from AND isa.deadline_at < p.date_to), 0)
            + coalesce((SELECT sum(d.score) FROM canban.canban_donation d CROSS JOIN period p WHERE d.to_tab_num = $fromTabNum AND d.created_at >= p.date_from AND d.created_at < p.date_to), 0)
            - coalesce((SELECT sum(d.score) FROM canban.canban_donation d CROSS JOIN period p WHERE d.from_tab_num = $fromTabNum AND d.created_at >= p.date_from AND d.created_at < p.date_to), 0)
        ) as current_balance
";

$balanceResult = $pg_db->Query($balanceQuery, true);
$currentBalance = (int)($balanceResult[0]['current_balance'] ?? 0);

if ($currentBalance < $score) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'message' => "Недостаточно баллов. Ваш баланс: $currentBalance"], JSON_UNESCAPED_UNICODE);
    exit;
}

$commentSql = $comment ? "'" . pg_escape_string($pg_db->link, $comment) . "'" : "NULL";
$pg_db->Query("INSERT INTO canban.canban_donation (from_tab_num, to_tab_num, task_id, score, comment) VALUES ($fromTabNum, $toTabNum, $taskId, $score, $commentSql)");

$pg_db->Close();

echo json_encode(['ok' => true, 'message' => 'Баллы успешно переведены!'], JSON_UNESCAPED_UNICODE);
?>