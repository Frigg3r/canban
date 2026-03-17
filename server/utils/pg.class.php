<?php 
global $pg_db;

interface iSQL {
    function __construct($connect);
    public function Query($sql, $needReturn = false);
    public function SendQuery($sql, $sms = "Операция прошла успешно");
    public function Insert($tbl, $data);
    public function InsertClasters($tbl, $data, $claster);
    public function Update($tbl, $values, $where = "");
    public function DeleteRows($tbl, $where = "");
    public function ClearTable($tbl);
    public function Close();
}

class PG_database implements iSQL {
    public $link;
    public function __construct($connect) {
        $this -> link = pg_connect($connect . " options='--client_encoding=UTF8'");

        if (!$this -> link) {
            echo 'Невозможно подключиться к глобальным спискам<br>';
            die (print_r(pg_last_error(), true));
            echo '<br>';
            exit;
        }
    }

    public function Query($sql, $needReturn = false) {
        $result = pg_query($this -> link, $sql);
        if ($result === false) return false;
        if ($needReturn) return $this -> GetDataQuery($result);
        return true;
    }

    public function SendQuery($sql, $sms = "Операция прошла успешно"):bool {
        if (pg_send_query($this -> link, $sql)) {
            $result = pg_get_result($this -> link);
            if ($result) {
                $state = pg_result_error_field($result, PGSQL_DIAG_SQLSTATE);
                
                if ($state == 0) {
                    header("HTTP/1.1 200 OK");
                    header("Content-type: application/json");
                }    
                else { 
                    header("HTTP/1.1 500 Internal Server Error");
                    header("Content-Type: application/json");
                    echo json_encode(["message" => pg_result_error($result), "code" => 500]);
                }
            }
            else {
                return false;
            }
            return true;
        }
        return false;
    }

    public function Insert($tbl, $data):void {
        if (count($data) > 0) {
            $values = [];
            $keys = [];
            foreach ($data as $name => $value) {
                $keys[] = $name;
            
                if (gettype($value) == 'string') {
                    $values[] = "'" . $this -> ProtectVariable($value) . "'";
                } 
                else {
                    $values[] = $this -> ProtectVariable($value);
                }
            }
            $keys = implode(',', $keys);
            $values = implode(',', $values);
            $sql = "INSERT INTO " . $tbl . " (" . $keys . ") VALUES (" . $values . ");";
            $this -> Query($sql);
        }
    }

    public function InsertClasters($tbl, $data, $claster):void {
        if (count($data) > 0) {
            $values = [];
            $keys = [];

            $i = 0;
            $sql = "";

            foreach($data as $name => $value) {
                $keys[] = $name;
                $i++;
                
                if (gettype($value) == 'string') {
                    $values[] = "'".$this->ProtectVariable($value)."'";
                } 
                else {
                    $values[] = $this->ProtectVariable($value);
                }
                
                if ($i == $claster) {
                    $keys = implode(',', $keys);
                    $values = implode(',', $values);
                    
                    $sql .= "INSERT INTO " . $tbl . " (" . $keys . ") VALUES (" . $values . ");";
                    
                    $values = [];
                    $keys = [];
                    $i = 0;
                }
            }
            $this -> Query($sql);
        }
    }

    public function Update($tbl, $values, $where = ""):void {
        if (count($values) > 0){
            $sql = "UPDATE " . $tbl . " SET ";

            foreach ($values as $key => $value) {
                if (gettype($value) == 'string') {
                    $sql .= $key." = '" . $this -> ProtectVariable($value) . "',";
                } 
                else {
                    $sql .= $key . " = " . $this -> ProtectVariable($value) . ",";
                }
            }
            $sql = substr($sql, 0, -1);
            $sql .= $where;
            $this -> Query($sql);
        }
    }

    public function DeleteRows($tbl, $where = ""):void {
        $sql = "DELETE FROM " . $tbl . " " . $where;
        $this -> Query($sql);
    }

    public function ClearTable($tbl):void {
        $sql = "TRUNCATE " . $tbl;
        $this -> Query($sql);
    }

    public function Close():void {
        pg_close($this ->link);
    }

    public function makeBoolFromPg($value):bool {
        switch ($value) {
            case 't': $value = true; break;
            case 'f': $value = false; break;
        }
        return $value;
    }

    private function ProtectVariable($variable) {
        return '\\' . $variable . '\\';
    }

    private function GetDataQuery($result):array {
        $data = [];
        while ($row = pg_fetch_array($result, null, PGSQL_ASSOC)) {
            $data[] = $row;
        }
        return $data;
    }
}

?>