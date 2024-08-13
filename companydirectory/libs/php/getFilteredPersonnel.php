<?php

include("config.php");

$departmentID = isset($_POST['departmentID']) ? $_POST['departmentID'] : '';
$locationID = isset($_POST['locationID']) ? $_POST['locationID'] : '';

$query = 'SELECT p.id, p.firstName, p.lastName, p.jobTitle, p.email, d.name as department, l.name as location 
          FROM personnel p 
          LEFT JOIN department d ON p.departmentID = d.id 
          LEFT JOIN location l ON d.locationID = l.id 
          WHERE 1=1';

if ($departmentID != '') {
    $query .= ' AND p.departmentID = ' . intval($departmentID);
}

if ($locationID != '') {
    $query .= ' AND d.locationID = ' . intval($locationID);
}

$query .= ' ORDER BY p.lastName, p.firstName, d.name, l.name';

$result = $conn->query($query);

$data = [];
while ($row = mysqli_fetch_assoc($result)) {
    $data[] = $row;
}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['data'] = $data;

mysqli_close($conn);

echo json_encode($output);

?>
