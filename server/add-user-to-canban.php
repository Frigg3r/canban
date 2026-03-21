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

$input = json_decode(file_get_contents('php://input'), true);

$tabNum = isset($input['tab_num']) ? (int) $input['tab_num'] : 0;
$fullName = isset($input['fio']) ? trim($input['fio']) : '';
$email = isset($input['email']) ? trim($input['email']) : '';
$roleId = isset($input['role_id']) ? (int) $input['role_id'] : 0;

if ($tabNum <= 0 || $fullName === '' || $email === '' || $roleId <= 0) {
    http_response_code(400);

    echo json_encode([
        'ok' => false,
        'message' => 'Не все обязательные поля переданы',
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

$fullNameEscaped = str_replace("'", "''", $fullName);
$emailEscaped = str_replace("'", "''", $email);

$pg_db->Query("
    insert into canban.canban_user (
        tab_num,
        fio,
        email,
        role_id
    )
    values (
        {$tabNum},
        '{$fullNameEscaped}',
        '{$emailEscaped}',
        {$roleId}
    )
");

$pg_db->Close();

echo json_encode([
    'ok' => true,
    'data' => null,
], JSON_UNESCAPED_UNICODE);
?>