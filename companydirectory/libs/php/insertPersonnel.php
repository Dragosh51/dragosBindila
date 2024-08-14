<?php
include("config.php");

$executionStartTime = microtime(true);

$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port);

if (mysqli_connect_errno()) {
    $output['status']['code'] = "300";
    $output['status']['name'] = "failure";
    $output['status']['description'] = "database unavailable";
    $output['data'] = [];
    echo json_encode($output);
    exit;
}

$query = $conn->prepare('INSERT INTO personnel (firstName, lastName, email, departmentID) VALUES (?, ?, ?, ?)');

$query->bind_param("sssi", $_POST['firstName'], $_POST['lastName'], $_POST['email'], $_POST['departmentID']);

$query->execute();

if (false === $query) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "executed";
    $output['status']['description'] = "query failed";    
    echo json_encode($output); 
    exit;
}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";

echo json_encode($output);
?>