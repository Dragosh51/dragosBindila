<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

if (!isset($_GET['q']) || !isset($_GET['maxRows'])) {
    echo json_encode(["status" => ["code" => "400", "name" => "fail", "description" => "Missing parameters"]]);
    exit;
}

$q = urlencode($_GET['q']);
$maxRows = intval($_GET['maxRows']);
$apiKey = 'bindil01';

$url = "http://api.geonames.org/wikipediaSearchJSON?formatted=true&q=$q&maxRows=$maxRows&username=$apiKey&style=full";

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