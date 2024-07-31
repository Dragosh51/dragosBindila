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

$countries = array_map(function ($country) {
    return [
        'code' => $country['properties']['iso_a2'],
        'name' => $country['properties']['name']
    ];
}, $decodedData['features']);

usort($countries, function ($a, $b) {
    return strcmp($a['name'], $b['name']);
});

echo json_encode([
    "status" => [
        "code" => "200",
        "name" => "ok",
        "description" => "success",
        "returnedIn" => intval((microtime(true) - $executionStartTime) * 1000) . " ms"
    ],
    "data" => $countries
]);
?>
