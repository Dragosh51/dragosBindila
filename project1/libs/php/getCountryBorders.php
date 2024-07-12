<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

// Adjust the path to your JSON file
$jsonFilePath = '../../countryBorders.geo.json';

// Check if the file exists
if (!file_exists($jsonFilePath)) {
    echo json_encode([
        "status" => [
            "code" => "404",
            "name" => "fail",
            "description" => "File not found"
        ]
    ]);
    exit;
}

// Read the file contents
$jsonData = file_get_contents($jsonFilePath);
if ($jsonData === false) {
    echo json_encode([
        "status" => [
            "code" => "500",
            "name" => "error",
            "description" => "Error reading file"
        ]
    ]);
    exit;
}

// Decode the JSON data to check if it's valid
$decodedData = json_decode($jsonData, true);
if ($decodedData === null) {
    echo json_encode([
        "status" => [
            "code" => "500",
            "name" => "error",
            "description" => json_last_error_msg()
        ]
    ]);
    exit;
}

// Return the JSON data
echo json_encode([
    "status" => [
        "code" => "200",
        "name" => "ok",
        "description" => "success",
        "returnedIn" => intval((microtime(true) - $executionStartTime) * 1000) . " ms"
    ],
    "data" => $decodedData
]);
?>
