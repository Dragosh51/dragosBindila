<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

if (!isset($_GET['q'])) {
    echo json_encode(["status" => ["code" => "400", "name" => "fail", "description" => "Missing parameters"]]);
    exit;
}

$q = $_GET['q'];
$apiKey = 'e56d35fb8bf84a05bd6115208240606';

$url = "http://api.weatherapi.com/v1/forecast.json?key=$apiKey&q=$q&days=3&aqi=yes&alerts=no";

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

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
$output['data'] = $decode;

header('Content-Type: application/json; charset=UTF-8');
echo json_encode($output);
?>
