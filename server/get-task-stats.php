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

if ($taskId <= 0) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'message' => 'Некорректный task_id'], JSON_UNESCAPED_UNICODE);
    exit;
}

$chartQuery = "
    WITH dates AS (
        SELECT generate_series(
            current_date - interval '13 days',
            current_date,
            '1 day'::interval
        )::date AS view_date
    )
    SELECT 
        to_char(d.view_date, 'DD.MM') as date_label,
        count(v.id)::integer as views,
        COALESCE(
            json_agg(
                json_build_object(
                    'tab_num', u.tab_num,
                    'fio', u.fio,
                    'time', to_char(v.viewed_at, 'HH24:MI')
                ) ORDER BY v.viewed_at DESC
            ) FILTER (WHERE v.id IS NOT NULL), '[]'::json
        ) as viewers
    FROM dates d
    LEFT JOIN canban.canban_task_view v 
        ON v.task_id = $taskId 
       AND v.viewed_at::date = d.view_date
    LEFT JOIN canban.canban_user u 
        ON u.tab_num = v.tab_num
    GROUP BY d.view_date
    ORDER BY d.view_date
";
$chartDataRaw = $pg_db->Query($chartQuery, true) ?: [];

$chartData = array_map(function($row) {
    $row['views'] = (int)$row['views'];
    $row['viewers'] = is_string($row['viewers']) ? json_decode($row['viewers'], true) : $row['viewers'];
    return $row;
}, $chartDataRaw);

$favQuery = "
    SELECT 
        u.tab_num, 
        u.fio 
    FROM canban.canban_task_favorite f
    JOIN canban.canban_user u ON u.tab_num = f.tab_num
    WHERE f.task_id = $taskId
    ORDER BY f.created_at DESC
";
$favoritesData = $pg_db->Query($favQuery, true) ?: [];

$pg_db->Close();

echo json_encode([
    'ok' => true,
    'data' => [
        'chart' => $chartData,
        'favorites' => $favoritesData
    ]
], JSON_UNESCAPED_UNICODE);
?>