<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

$url = 'http://api.geonames.org/countryInfoJSON?formatted=true&lang=&country=&username=bindil01&style=full';
// $url = 'https://api.opencagedata.com/geocode/v1/json?q=52.3877830%2C9.7334394&key=54edf32071d4421eae034f79c1a135a5';

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

$countries = [];
if (isset($decode['geonames'])) {
    foreach ($decode['geonames'] as $country) {
        $countries[] = [
            'countryCode' => $country['countryCode'],
            'countryName' => $country['countryName'],
            // 'capital' => $country['capital'],
            // 'population' => $country['population'],
            // 'areaInSqKm' => $country['areaInSqKm'],
            // 'north' => $country['north'],
            // 'south' => $country['south'],
            // 'east' => $country['east'],
            // 'west' => $country['west'],
            // 'continentName' => $country['continentName'],
            // 'postalCodeFormat' => $country['postalCodeFormat']
        ];
    }
}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
$output['data'] = $countries;

header('Content-Type: application/json; charset=UTF-8');
echo json_encode($output);
?>