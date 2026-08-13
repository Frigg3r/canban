<?php

    ini_set("max_execution_time", 3600);
    ini_set("display_errors", 1);
    ini_set("display_startup_errors", 1);
    error_reporting(E_ALL);

    require_once(__DIR__ . '/pg.class.php');

    $config = require(__DIR__ . '/../config/db.php');

    $host = $config['host'];
    $port = $config['port'];
    $user = $config['user'];
    $pass = $config['password'];
    $base = $config['dbname'];

    $connect_string = "host={$host} port={$port} dbname={$base} user={$user} password={$pass}";

    $pg_db = new PG_database($connect_string);
?>