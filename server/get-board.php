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

require_once(__DIR__ . '/pg.connect.php');

$query = "
    with team_info as (
        select
            ct.task_id,
            max(ct.status_id) as team_status_id,
            count(cut.tab_num) as participants_count
        from canban.canban_team ct
        left join canban.canban_user_team cut on cut.team_id = ct.id
        group by ct.task_id
    )
    select
        t.id,
        t.name,
        coalesce(t.description, '') as description,
        coalesce(t.score, 0) as score,
        coalesce(t.quota, 0) as quota,
        to_char(t.deadline, 'DD.MM') as deadline_short,
        to_char(t.deadline, 'YYYY-MM-DD') as deadline_full,
        coalesce(ti.participants_count, 0) as participants_count,
        case
            when t.status_id = 1 then 'backlog'
            when t.status_id = 3 then 'done'
            when coalesce(ti.team_status_id, 0) = 2 then 'review'
            when coalesce(ti.team_status_id, 0) = 3 then 'done'
            else 'inProgress'
        end as board_status
    from canban.canban_task t
    left join team_info ti on ti.task_id = t.id
    order by
        case
            when t.status_id = 1 then 1
            when t.status_id = 2 then 2
            when t.status_id = 3 then 4
            else 5
        end,
        t.deadline asc nulls last,
        t.id desc
";

$data = $pg_db->Query($query, true);
$pg_db->Close();

echo json_encode([
    "ok" => true,
    "data" => $data
], JSON_UNESCAPED_UNICODE);
?>