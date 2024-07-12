<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

if (!isset($_GET['lat']) || !isset($_GET['lng'])) {
    echo json_encode(["status" => ["code" => "400", "name" => "fail", "description" => "Missing parameters"]]);
    exit;
}

$lat = urlencode($_GET['lat']);
$lng = urlencode($_GET['lng']);
$apiKey = '54edf32071d4421eae034f79c1a135a5';

$url = "https://api.opencagedata.com/geocode/v1/json?q=$lat,$lng&key=$apiKey";

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);

if ($result === false) {
    echo json_encode(["status" => ["code" => "500", "name" => "error", "description" => curl_error($ch)]]);
    curl_close($ch);
    exit;
}

curl_close($ch);

$decode = json_decode($result, true);
if ($decode === null) {
    echo json_encode(["status" => ["code" => "500", "name" => "error", "description" => json_last_error_msg()]]);
    exit;
}

if (empty($decode['results'])) {
    echo json_encode(["status" => ["code" => "404", "name" => "fail", "description" => "No results found"]]);
    exit;
}

$output = [
    "status" => [
        "code" => "200",
        "name" => "ok",
        "description" => "success",
        "returnedIn" => intval((microtime(true) - $executionStartTime) * 1000) . " ms"
    ],
    "data" => [
        "country_code" => strtoupper($decode['results'][0]['components']['country_code']),
        "country" => $decode['results'][0]['components']['country']
    ]
];

header('Content-Type: application/json; charset=UTF-8');
echo json_encode($output);
?>