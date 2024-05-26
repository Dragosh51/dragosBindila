$(document).ready(function() {
    $('#btnWeather').click(function() {
        $.ajax({
            url: "../libs/php/getWeatherInfo.php",
            type: 'POST',
            dataType: 'json',
            data: {
                lat: $('#weatherLat').val(),
                lng: $('#weatherLng').val()
            },
            success: function(result) {
                console.log(result);
                if (result.status.name == "ok") {
                    $('#result').html('<b>Weather Result:</b><br>' +
                        'Datetime: ' + result['data'][0]['datetime'] + '<br>' +
                        'Temperature: ' + result['data'][0]['temperature'] + '<br>' +
                        'Humidity: ' + result['data'][0]['humidity']);
                } else {
                    console.error("Error: " + result.status.description);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error("Error: " + textStatus + " - " + errorThrown);
                console.log(jqXHR.responseText);
            }
        });
    });

    $('#btnTimezone').click(function() {
        $.ajax({
            url: "../libs/php/getTimezoneInfo.php",
            type: 'POST',
            dataType: 'json',
            data: {
                lat: $('#timezoneLat').val(),
                lng: $('#timezoneLng').val()
            },
            success: function(result) {
                console.log(result);
                if (result.status.name == "ok") {
                    $('#result').html('<b>Timezone Result:</b><br>' +
                        'Country Name: ' + result['data']['countryName'] + '<br>' +
                        'Timezone ID: ' + result['data']['timezoneId'] + '<br>' +
                        'Time: ' + result['data']['time']);
                } else {
                    console.error("Error: " + result.status.description);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error("Error: " + textStatus + " - " + errorThrown);
                console.log(jqXHR.responseText);
            }
        });
    });

    $('#btnEarthquake').click(function() {
        $.ajax({
            url: "../libs/php/getEarthquakeInfo.php",
            type: 'POST',
            dataType: 'json',
            data: {
                lat: $('#earthquakeLat').val(),
                lng: $('#earthquakeLng').val()
            },
            success: function(result) {
                console.log(result);
                if (result.status.name == "ok") {
                    $('#result').html('<b>Earthquake Result:</b><br>' +
                        'Datetime: ' + result['data'][0]['datetime'] + '<br>' +
                        'Depth: ' + result['data'][0]['depth'] + '<br>' +
                        'Magnitude: ' + result['data'][0]['magnitude']);
                } else {
                    console.error("Error: " + result.status.description);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error("Error: " + textStatus + " - " + errorThrown);
                console.log(jqXHR.responseText);
            }
        });
    });
});