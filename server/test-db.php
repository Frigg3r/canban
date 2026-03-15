<?php
header('Content-Type: application/json; charset=utf-8');

require_once(__DIR__ . '/pg.connect.php');

$query = "select 1 as ok";
$data = $pg_db->Query($query, true);
$pg_db->Close();

echo json_encode($data, JSON_UNESCAPED_UNICODE);
?>