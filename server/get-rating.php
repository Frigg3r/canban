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
    )
    select
        row_number() over (
            order by coalesce(sum(csa.score), 0) desc, cu.fio asc
        ) as place,
        cu.tab_num,
        cu.fio,
        cu.email,
        cr.id as role_id,
        cr.name as role_name,
        coalesce(sum(csa.score), 0) as total_score
    from canban.canban_user cu
    inner join canban.canban_role cr
        on cr.id = cu.role_id
    cross join period p
    left join canban.canban_score_accrual csa
        on csa.tab_num = cu.tab_num
       and csa.accrued_at >= p.date_from
       and csa.accrued_at < p.date_to
    group by
        cu.tab_num,
        cu.fio,
        cu.email,
        cr.id,
        cr.name
    order by
        total_score desc,
        cu.fio asc
";

$data = $pg_db->Query($query, true);
$pg_db->Close();

echo json_encode([
    "ok" => true,
    "data" => $data
], JSON_UNESCAPED_UNICODE);
?>