<?php

// Define the API endpoint and your app ID
$apiUrl = 'https://openexchangerates.org/api/latest.json?app_id=be57d2af40f642c38a40d25141cb9107';

// Initialize cURL session
$ch = curl_init();

// Set cURL options
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

// Execute the cURL session and fetch the response
$response = curl_exec($ch);

// Check for errors
if (curl_errno($ch)) {
    echo json_encode(['status' => 'error', 'message' => 'Error:' . curl_error($ch)]);
    exit;
}

// Close the cURL session
curl_close($ch);

// Decode the JSON response
$data = json_decode($response, true);

// Check if the response contains the necessary data
if (isset($data['rates'])) {
    // Set the response header to JSON
    header('Content-Type: application/json');

    // Return the data as a JSON object
    echo json_encode([
        'status' => 'ok',
        'rates' => $data['rates'],
        'base' => $data['base']
    ]);
} else {
    // Return an error if the data is not present
    echo json_encode(['status' => 'error', 'message' => 'Unable to fetch exchange rates.']);
}

// ini_set('display_errors', 'on');
// error_reporting(E_ALL);

// header('Content-Type: application/json; charset=UTF-8');

// $executionStartTime = microtime(true);

// $app_id = 'be57d2af40f642c38a40d25141cb9107'; 
// $url = "https://openexchangerates.org/api/latest.json?app_id=$app_id";

// $ch = curl_init();
// curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
// curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
// curl_setopt($ch, CURLOPT_URL, $url);

// $result = curl_exec($ch);

// $cURLERROR = curl_errno($ch);

//  curl_close($ch);

// if ($cURLERROR) {
//     $output['status']['code'] = $cURLERROR;
//     $output['status']['name'] = "Failure - cURL";
//     $output['status']['description'] = curl_strerror($cURLERROR);
//     $output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
//     $output['data'] = null;

//     echo json_encode($output);
//     exit;
// }

// $rates = json_decode($result, true);

// $url = "https://openexchangerates.org/api/currencies.json?app_id=$app_id";

// $ch = curl_init();
// curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
// curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
// curl_setopt($ch, CURLOPT_URL, $url);

// $result = curl_exec($ch);

// $cURLERROR = curl_errno($ch);

// curl_close($ch);

// if ($cURLERROR) {
//     $output['status']['code'] = $cURLERROR;
//     $output['status']['name'] = "Failure - cURL";
//     $output['status']['description'] = curl_strerror($cURLERROR);
//     $output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
//     $output['data'] = null;

//     echo json_encode($output);
//     exit;
// }

// $codes = json_decode($result, true);

// $output['status']['code'] = "200";
// $output['status']['name'] = "ok";
// $output['status']['description'] = "success";
// $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

// $output['data'] = [];
// foreach ($rates['rates'] as $code => $rate) {
//     if (isset($codes[$code])) {
//         $output['data'][] = [
//             'code' => $code,
//             'name' => $codes[$code],
//             'rate' => $rate
//         ];
//     }
// }

// echo json_encode($output);

?>
