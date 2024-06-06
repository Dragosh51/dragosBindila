<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

$north = isset($_GET['north']) ? $_GET['north'] : '';
$south = isset($_GET['south']) ? $_GET['south'] : '';
$east = isset($_GET['east']) ? $_GET['east'] : '';
$west = isset($_GET['west']) ? $_GET['west'] : '';

if (empty($north) || empty($south) || empty($east) || empty($west)) {
    echo json_encode([
        "status" => [
            "code" => "400",
            "name" => "fail",
            "description" => "Missing parameters"
        ]
    ]);
    exit;
}

$url = 'http://api.geonames.org/earthquakesJSON?formatted=true&north=' . $north . '&south=' . $south . '&east=' . $east . '&west=' . $west . '&username=bindil01&style=full';

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);

if ($result === false) {
    echo json_encode([
        "status" => [
            "code" => "500",
            "name" => "error",
            "description" => curl_error($ch)
        ]
    ]);
    curl_close($ch);
    exit;
}

curl_close($ch);

$decode = json_decode($result, true);
if ($decode === null) {
    echo json_encode([
        "status" => [
            "code" => "500",
            "name" => "error",
            "description" => json_last_error_msg()
        ]
    ]);
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