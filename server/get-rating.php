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

$year = (int)($_GET['year'] ?? date('Y'));
$quarter = (int)($_GET['quarter'] ?? 1);

if ($quarter < 1 || $quarter > 4) {
    http_response_code(400);

    echo json_encode([
        "ok" => false,
        "message" => "Некорректный quarter"
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

$query = "
    with period as (
        select
            make_date({$year}, (({$quarter} - 1) * 3) + 1, 1) as date_from,
            make_date({$year}, (({$quarter} - 1) * 3) + 1, 1) + interval '3 month' as date_to
    ),
    rating_base as (
        select
            cu.tab_num,
            cu.fio,
            cu.email,
            cr.id as role_id,
            cr.name as role_name,
            coalesce(sum(
                case
                    when t.id is not null then csa.score
                    else 0
                end
            ), 0) as total_score
        from canban.canban_user cu
        inner join canban.canban_role cr
            on cr.id = cu.role_id
        cross join period p
        left join canban.canban_score_accrual csa
            on csa.tab_num = cu.tab_num
        left join canban.canban_team ct
            on ct.id = csa.team_id
        left join canban.canban_task t
            on t.id = ct.task_id
           and t.deadline >= p.date_from
           and t.deadline < p.date_to
        group by
            cu.tab_num,
            cu.fio,
            cu.email,
            cr.id,
            cr.name
    ),
    positive_ranked as (
        select
            dense_rank() over (
                order by rating_base.total_score desc
            )::integer as place,
            rating_base.tab_num,
            rating_base.fio,
            rating_base.email,
            rating_base.role_id,
            rating_base.role_name,
            rating_base.total_score
        from rating_base
        where rating_base.total_score > 0
    )
    select
        case
            when rating_base.total_score > 0 then positive_ranked.place
            else null
        end as place,
        rating_base.tab_num,
        rating_base.fio,
        rating_base.email,
        rating_base.role_id,
        rating_base.role_name,
        rating_base.total_score
    from rating_base
    left join positive_ranked
        on positive_ranked.tab_num = rating_base.tab_num
    order by
        rating_base.total_score desc,
        rating_base.fio asc
";

$data = $pg_db->Query($query, true);
$pg_db->Close();

echo json_encode([
    "ok" => true,
    "data" => $data
], JSON_UNESCAPED_UNICODE);
?>