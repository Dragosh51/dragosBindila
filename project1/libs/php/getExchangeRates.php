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
    echo 'Error:' . curl_error($ch);
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
    echo json_encode($data);
} else {
    // Return an error if the data is not present
    echo json_encode(['status' => 'error', 'message' => 'Unable to fetch exchange rates.']);
}
?>
