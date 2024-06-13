<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

if (!isset($_GET['q'])) {
    echo json_encode(["status" => ["code" => "400", "name" => "fail", "description" => "Missing parameters"]]);
    exit;
}

$d = urlencode($_GET['q']);
$apiKey = 'e2e0f048738e4321b0240957a343ac09';

// if (strlen($b) !== 2) {
//     echo json_encode(["status" => ["code" => "400", "name" => "fail", "description" => "Invalid country code"]]);
//     exit;
// }

$url = "https://newsapi.org/v2/top-headlines?country=$d&apiKey=$apiKey"; 

// error_log("Calling URL: $url");

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'User-Agent: dragosbindila.in' // Replace with your application's name or identifier
]);

$result = curl_exec($ch);

if ($result === false) {
    echo json_encode(["status" => ["code" => "500", "name" => "error", "description" => curl_error($ch)]]);
    curl_close($ch);
    exit;
}

curl_close($ch);

// error_log("API Response: $result");

$decode = json_decode($result, true);
if ($decode === null) {
    echo json_encode(["status" => ["code" => "500", "name" => "error", "description" => json_last_error_msg()]]);
    exit;
}

if (!isset($decode['articles']) || empty($decode['articles'])) {
    echo json_encode(["status" => ["code" => "404", "name" => "fail", "description" => "No articles found"]]);
    exit;
}

$output = [];
$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
$output['data'] = $decode['articles'];

header('Content-Type: application/json; charset=UTF-8');
echo json_encode($output);
?>