<?php

ini_set('display_errors', 'on');
error_reporting(E_ALL);

header('Content-Type: application/json; charset=UTF-8');

$executionStartTime = microtime(true);

$apiUrl = 'https://v6.exchangerate-api.com/v6/3b652174080c33484dc4a589/codes';

// Initialize cURL session
$ch = curl_init();

// Set cURL options
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $apiUrl);

// Execute the cURL session and fetch the response
$response = curl_exec($ch);

$cURLERROR = curl_errno($ch);

curl_close($ch);

if ($cURLERROR) {
    $output['status']['code'] = $cURLERROR;
    $output['status']['name'] = "Failure - cURL";
    $output['status']['description'] = curl_strerror($cURLERROR);
    $output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
    $output['data'] = null;

    echo json_encode($output);
    exit;
}

$data = json_decode($response, true);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
$output['data'] = $data['supported_codes'];

echo json_encode($output);

?>