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

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode([
        "ok" => false,
        "message" => "Метод не разрешён"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);

$name = str_replace("'", "''", trim($input['name'] ?? ''));
$description = str_replace("'", "''", trim($input['description'] ?? ''));
$score = (int)($input['score'] ?? 0);
$quota = (int)($input['quota'] ?? 0);
$deadline = $input['deadline'] ?? '';
$created_by_tab_num = (int)($input['created_by_tab_num'] ?? 0);
$initiator_tab_num = (int)($input['initiator_tab_num'] ?? 0);

// если инициатора не выбрали — инициатором становится создатель карточки
if ($initiator_tab_num <= 0) {
    $initiator_tab_num = $created_by_tab_num;
}

if (
    $name === '' ||
    $description === '' ||
    $score <= 0 ||
    $quota <= 0 ||
    $deadline === '' ||
    $created_by_tab_num <= 0
) {
    http_response_code(400);
    echo json_encode([
        "ok" => false,
        "message" => "Некорректные данные для создания карточки"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

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
        created_by_tab_num,
        initiator_tab_num
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
        {$created_by_tab_num},
        {$initiator_tab_num}
    )
    returning
        id,
        name,
        description,
        score,
        quota,
        created_by_tab_num,
        initiator_tab_num,
        to_char(deadline, 'DD.MM') as deadline_short,
        to_char(deadline, 'YYYY-MM-DD') as deadline_full,
        0 as participants_count,
        'backlog' as board_status
";

$data = $pg_db->Query($query, true);
$pg_db->Close();

if ($data === false || count($data) === 0) {
    http_response_code(400);
    echo json_encode([
        "ok" => false,
        "message" => "Не удалось создать карточку"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode([
    "ok" => true,
    "data" => $data[0]
], JSON_UNESCAPED_UNICODE);
?>