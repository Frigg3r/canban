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

$_POST = json_decode(file_get_contents("php://input"), true);

$teamId = (int)($_POST['team_id'] ?? 0);
$text = trim($_POST['text'] ?? '');
$authorTabNum = (int)($_POST['author_tab_num'] ?? 0);

$textSql = pg_escape_literal($pg_db->link, $text);

$query = "
    insert into canban.canban_comment (team_id, author_tab_num, text)
    values ($teamId, $authorTabNum, $textSql)
    returning
        id,
        text,
        to_char(created_at, 'DD.MM.YYYY HH24:MI') as created_at,
        author_tab_num,
        (
            select fio
            from canban.canban_user
            where tab_num = canban.canban_comment.author_tab_num
        ) as author_name
";

$result = $pg_db->Query($query, true);

$comment = $result[0];

$comment['id'] = (int)$comment['id'];
$comment['author_tab_num'] = (int)$comment['author_tab_num'];
$comment['can_delete'] = true;

echo json_encode([
    'ok' => true,
    'data' => $comment,
], JSON_UNESCAPED_UNICODE);

$pg_db->Close();