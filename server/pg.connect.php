<?php
ini_set("max_execution_time", 3600);
ini_set("display_errors", 1);
ini_set("display_startup_errors", 1);
error_reporting(E_ALL);

require_once(__DIR__ . '/pg.class.php');

$host = '127.0.0.1';
$port = '5432';
$user = 'postgres';
$pass = 'REMOVED_SECRET';
$base = 'kanban';

$connect_string = "host={$host} port={$port} dbname={$base} user={$user} password={$pass}";
$pg_db = new PG_database($connect_string);
?>