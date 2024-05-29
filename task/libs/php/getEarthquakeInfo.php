<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

$url = 'http://api.geonames.org/earthquakesJSON?formatted=true&north=44.1&south=-9.9&east=-22.4&west=55.2&username=flightltd&style=full';

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
$output['data'] = $decode['earthquakes'];

header('Content-Type: application/json; charset=UTF-8');
echo json_encode($output);
?>