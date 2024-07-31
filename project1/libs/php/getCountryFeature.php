<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

$jsonFilePath = '../../countryBorders.geo.json';

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

if (!isset($_GET['code'])) {
    echo json_encode([
        "status" => [
            "code" => "400",
            "name" => "fail",
            "description" => "Country code not provided"
        ]
    ]);
    exit;
}

$countryCode = $_GET['code'];
$countryFeature = array_filter($decodedData['features'], function ($feature) use ($countryCode) {
    return $feature['properties']['iso_a2'] === $countryCode;
});

if (empty($countryFeature)) {
    echo json_encode([
        "status" => [
            "code" => "404",
            "name" => "fail",
            "description" => "Country not found"
        ]
    ]);
    exit;
}

echo json_encode([
    "status" => [
        "code" => "200",
        "name" => "ok",
        "description" => "success",
        "returnedIn" => intval((microtime(true) - $executionStartTime) * 1000) . " ms"
    ],
    "data" => array_values($countryFeature)[0]
]);
?>
