// ---------------------------------------------------------
// GLOBAL DECLARATIONS
// ---------------------------------------------------------

var map, countryBorders, countryBordersLayer;

// tile layers

var streets = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
  attribution: "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012"
}
);

var satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
  attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
}
);

var basemaps = {
  "Streets": streets,
  "Satellite": satellite
};

// buttons

var infoBtn = L.easyButton("fa-info fa-xl", function (btn, map) {
  $("#infoModal").modal("show");
});

var weatherBtn = L.easyButton("fa-sun fa-xl", function (btn, map) {
  $("#weatherModal").modal("show");
});

var newsBtn = L.easyButton("fa-newspaper fa-xl", function (btn, map) {
  $("#newsModal").modal("show");
});

var wikiBtn = L.easyButton("fa-w fa-xl", function (btn, map) {
  $("#wikiModal").modal("show");
});

var exchangeBtn = L.easyButton("fa-money-bill-wave fa-xl", function (btn, map) {
  $("#exchangeRatesModal").modal("show");
  convertCurrency();
});


// ---------------------------------------------------------
// EVENT HANDLERS
// ---------------------------------------------------------

// initialise and add controls once DOM is ready

$(document).ready(function () {
  // Start fetching user's location immediately
  var locationPromise = new Promise(function (resolve, reject) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      }, function (error) {
        reject("Geolocation error: " + error.message);
      });
    } else {
      reject("Geolocation is not supported by this browser.");
    }
  });

  // Show the preloader initially
  $('#preloader').show();

  // Start loading process
  locationPromise.then(function (coords) {
    var lat = coords.lat;
    var lng = coords.lng;

    // Make AJAX call to the PHP file
    $.ajax({
      url: 'libs/php/getCountryCode.php',
      method: 'GET',
      data: {
        lat: lat,
        lng: lng
      },
      success: function (data) {
        if (data.status.code === "200") {
          var countryCode = data.data.country_code;
          var countryName = data.data.country;

          console.log('Country Code:', countryCode);
          console.log('Country Name:', countryName);

          // Initialize the app and set up event listeners
          initializeMap();
          setupEventListeners();

          // Populate the country dropdown and then set the value and trigger the change event
          populateCountryDropdown(function () {
            // Programmatically select the country in the dropdown
            $('#countrySelect').val(countryCode);
            console.log('Dropdown value set to:', $('#countrySelect').val());

            // Manually trigger the change event
            $('#countrySelect').trigger('change');

            // Ensure the modals and other updates are triggered
            updateInfoModal($('#countrySelect option:selected').text(), $('#countrySelect option:selected'));
            updateWeatherModal($('#countrySelect option:selected').text());
            fetchWikipediaData(countryCode);
            fetchNewsData(countryCode);

            // Fetch the currency code and update the exchange rates modal
            getCurrencyCode(countryCode, function(currencyCode) {
              updateExchangeRatesModal(currencyCode);
            });

            // Hide the preloader after everything is loaded
            $('#preloader').fadeOut('slow', function () {
              $(this).remove(); // Remove preloader element after fade out
            });
          });

          // Load other data
          loadAirports();
          loadCities();
        } else {
          console.error("Error from PHP API: " + data.status.description);

          // Initialize the app without user location
          initializeAppWithoutGeolocation();
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error("AJAX error: " + textStatus + " - " + errorThrown);

        // Initialize the app without user location
        initializeAppWithoutGeolocation();
      }
    });
  }).catch(function (error) {
    console.error(error);

    // Initialize the app without user location
    initializeAppWithoutGeolocation();
  });

  function initializeAppWithoutGeolocation() {
    initializeMap();
    setupEventListeners();
    getExchangeRates();
    loadAirports();
    loadCities();

    // Hide the preloader in case of error
    $('#preloader').fadeOut('slow', function () {
      $(this).remove(); 
    });
  }
});

function populateCountryDropdown(callback) {
  $.ajax({
    url: 'libs/php/getCountryCodesAndNames.php',
    method: 'GET',
    dataType: 'json',
    success: function (response) {
      console.log('Full Response from PHP:', response); 

      if (response.status && response.status.code === "200") {
        var countries = response.data;

        var options = '';
        countries.forEach(function (country) {
          options += `<option value="${country.code}">${country.name}</option>`;
        });

        $('#countrySelect').html(options);

        if (typeof callback === 'function') {
          callback();
        }
      } else {
        console.error('Error from PHP API:', response.status.description);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.error('AJAX error:', textStatus, ' - ', errorThrown);
    }
  });
}

var airportsData = [];
var citiesData = [];
var airportMarkers = L.markerClusterGroup();
var cityMarkers = L.markerClusterGroup();
var map;
var countryBorders;
var countryBordersLayer;



function setupEventListeners() {
  $('#countrySelect').change(function () {
    const selectedCountryCode = $(this).val();
    const selectedOption = $(`#countrySelect option[value="${selectedCountryCode}"]`);
    const countryName = selectedOption.text();

    console.log('Country selected:', countryName);
    console.log('Country code:', selectedCountryCode);

    updateInfoModal(countryName, selectedOption);

    if (countryBordersLayer) {
      map.removeLayer(countryBordersLayer);
    }

    $.ajax({
      url: 'libs/php/getCountryFeature.php',
      method: 'GET',
      dataType: 'json',
      data: { code: selectedCountryCode },
      success: function (response) {
        if (response.status && response.status.code === "200") {
          const selectedCountry = response.data;

          countryBordersLayer = L.geoJSON(selectedCountry, {
            style: {
              color: 'blue',
              weight: 2,
              opacity: 0.3,
              fillOpacity: 0.3
            }
          }).addTo(map);

          // Use the map.once function to ensure fitBounds is called only once.
          map.once('zoomend', function () {
            map.fitBounds(countryBordersLayer.getBounds(), {
              padding: [20, 20],
              maxZoom: 10
            });
          });

          updateWeatherModal(selectedCountryCode);
          fetchWikipediaData(countryName);
          fetchNewsData(selectedCountryCode);

          if ($('#airportCheckbox').is(':checked')) {
            updateAirportMarkers(selectedCountryCode);
          }

          if ($('#cityCheckbox').is(':checked')) {
            updateCityMarkers(selectedCountryCode);
          }
        } else {
          console.error('Error from PHP API:', response.status.description);
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error('AJAX error:', textStatus, ' - ', errorThrown);
      }
    });
  });

  $('#amount').val('1');
  $('#amount').on('input', convertCurrency);
  $('#exchangeRatesSelect').on('change', convertCurrency);
}

function initializeMap() {
  map = L.map("map", {
    layers: [streets]
  });

  var airports = L.layerGroup([]);
  var cities = L.layerGroup([]);
  var overlayMaps = {
    "Airports": airports,
    "Cities": cities
  };

  var layerControl = L.control.layers(basemaps, overlayMaps, { collapsed: false }).addTo(map);

  map.on('overlayadd', function (eventLayer) {
    if (eventLayer.name === 'Airports') {
      updateAirportMarkers($('#countrySelect').val());
    }
    if (eventLayer.name === 'Cities') {
      updateCityMarkers($('#countrySelect').val());
    }
  });

  map.on('overlayremove', function (eventLayer) {
    if (eventLayer.name === 'Airports') {
      removeAirportMarkers();
    }
    if (eventLayer.name === 'Cities') {
      removeCityMarkers();
    }
  });

  infoBtn.addTo(map);
  weatherBtn.addTo(map);
  newsBtn.addTo(map);
  wikiBtn.addTo(map);
  exchangeBtn.addTo(map);
}

function loadAirports() {
  $.ajax({
    url: 'libs/php/getLocations.php',
    method: 'GET',
    data: {
      q: 'airport',
      country: ''
    },
    success: function (data) {
      console.log('Loaded airports data:', data);
      airportsData = data.data.geonames;
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.error("Error loading airports data: " + textStatus + " - " + errorThrown);
      console.log(jqXHR.responseText);
    }
  });
}

function loadCities() {
  $.ajax({
    url: 'libs/php/getLocations.php',
    method: 'GET',
    data: {
      q: 'city',
      country: ''
    },
    success: function (data) {
      console.log('Loaded cities data:', data);
      citiesData = data.data.geonames;
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.error("Error loading cities data: " + textStatus + " - " + errorThrown);
      console.log(jqXHR.responseText);
    }
  });
}

function createAirportMarkerIcon() {
  return L.ExtraMarkers.icon({
    icon: 'fa-plane', // FontAwesome plane icon
    markerColor: 'blue', // Marker color
    shape: 'circle', 
    prefix: 'fa' 
  });
}

function addAirportMarkers() {
  airportMarkers.clearLayers();

  var airportIcon = createAirportMarkerIcon();

  airportsData.forEach(function (airport) {
    var marker = L.marker([airport.lat, airport.lng], {
      icon: airportIcon
    }).bindPopup(`<b>${airport.name}</b><br>${airport.countryName}`);

    airportMarkers.addLayer(marker);
  });

  map.addLayer(airportMarkers);
}

function removeAirportMarkers() {
  airportMarkers.clearLayers();
}

function updateAirportMarkers(countryCode) {
  removeAirportMarkers();
  
  $.ajax({
    url: 'libs/php/getLocations.php',
    method: 'GET',
    data: {
      q: 'airport',
      country: countryCode
    },
    success: function (data) {
      console.log('Loaded airports data for country:', data);
      airportsData = data.data.geonames;
      addAirportMarkers();
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.error("Error loading airports data for country: " + textStatus + " - " + errorThrown);
      console.log(jqXHR.responseText);
    }
  });

  console.log('Updating airport markers for', countryCode);
}

function createCityMarkerIcon() {
  return L.ExtraMarkers.icon({
    icon: 'fa-building', // FontAwesome building icon
    markerColor: 'green', // Marker color
    shape: 'circle',
    prefix: 'fa'
  });
}

// Function to add city markers using Leaflet ExtraMarkers
function addCityMarkers() {
  cityMarkers.clearLayers(); // Clear existing city markers

  var cityIcon = createCityMarkerIcon();

  citiesData.forEach(function (city) {
    var marker = L.marker([city.lat, city.lng], {
      icon: cityIcon
    }).bindPopup(`<b>${city.name}</b><br>${city.countryName}`);

    cityMarkers.addLayer(marker); // Add each marker to the marker cluster group
  });

  map.addLayer(cityMarkers); // Add the entire cluster group to the map
}

// Function to remove city markers
function removeCityMarkers() {
  cityMarkers.clearLayers(); // Clear all city markers from the map
}

// Function to update city markers based on country code
function updateCityMarkers(countryCode) {
  removeCityMarkers(); // Clear existing city markers

  $.ajax({
    url: 'libs/php/getLocations.php',
    method: 'GET',
    data: {
      q: 'city',
      country: countryCode
    },
    success: function (data) {
      console.log('Loaded city data for country:', data);
      citiesData = data.data.geonames; // Update citiesData with new data
      addCityMarkers(); // Add updated city markers to the map
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.error("Error loading city data for country: " + textStatus + " - " + errorThrown);
      console.log(jqXHR.responseText);
    }
  });

  console.log('Updating city markers for', countryCode);
}

function updateWeatherModal(countryCode) {
  // Fetch the capital city of the selected country
  $.ajax({
    url: 'libs/php/getCountryInfo.php',
    method: 'GET',
    data: { countryCode: countryCode },
    success: function (countryData) {
      if (countryData.status && countryData.status.code === "200") {
        var capitalCity = countryData.data.capital;
        if (!capitalCity) {
          console.error('Capital city not found for', countryData.data.countryName);
          return;
        }

        var encodedCityName = encodeURIComponent(capitalCity);
        console.log("City Name", encodedCityName);

        // Fetch weather data for the capital city
        $.ajax({
          url: 'libs/php/getWeatherInfo.php',
          method: 'GET',
          data: { q: encodedCityName },
          success: function (data) {
            console.log('Response data:', data);
            if (data.status && data.status.code === "200") {
              var weatherData = data.data;

              // Location info content
              var locationInfo = `
                <div>
                  <h5>${weatherData.location.country}, ${weatherData.location.name}</h5>
                </div>
              `;

              // Current weather content
              var currentWeather = `
                <div>
                  <h5>Today</h5>
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <p>Overcast</p>
                    <p>${weatherData.current.temp_c}°C</p>
                    <img src="https:${weatherData.current.condition.icon}" alt="Weather Icon">
                  </div>
                </div>
              `;

              // Forecast content
              var forecastContent = '<h5 style="text-align: center;">Forecast</h5>';
              weatherData.forecast.forecastday.forEach(day => {
                let date = new Date(day.date);
                let dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                let dayNumber = date.getDate();
                let monthName = date.toLocaleDateString('en-US', { month: 'short' });
                let formattedDate = `${dayName}, ${dayNumber}${getOrdinalSuffix(dayNumber)} ${monthName}`;

                forecastContent += `
                  <div style="display: flex; align-items: center; flex-direction: column; border-bottom: 1px solid #ccc; padding: 5px 0;">
                    <p><strong>${formattedDate}</strong></p>
                    <div style="display: flex; align-items: center; justify-content: center;">
                      <p style="margin-right: 10px;">${day.day.avgtemp_c}°C</p>
                      <img src="https:${day.day.condition.icon}" alt="Forecast Icon">
                    </div>
                  </div>
                `;
              });

              $('#locationInfo').html(locationInfo);
              $('#currentWeather').html(currentWeather);
              $('#forecastWeather').html(forecastContent);
            } else {
              console.error('Error fetching weather data:', data.status ? data.status.description : 'Unknown error');
            }
          },
          error: function (xhr, status, error) {
            console.error('Error fetching weather data:', error);
          }
        });
      } else {
        console.error('Error fetching country data:', countryData.status ? countryData.status.description : 'Unknown error');
      }
    },
    error: function (xhr, status, error) {
      console.error('Error fetching country data:', error);
    }
  });
}

function getOrdinalSuffix(day) {
  if (day > 3 && day < 21) return 'th'; // Teens
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

function getCurrencyCode(countryCode, callback) {
  $.ajax({
    url: 'libs/php/getCountryInfo.php',
    type: 'GET',
    data: { countryCode: countryCode },
    success: function (result) {
      if (result.status.code === "200" && result.data && result.data.currencyCode) {
        callback(result.data.currencyCode);
      } else {
        console.error("Error: " + result.status.description);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.error("Error: " + textStatus + " - " + errorThrown);
      console.log(jqXHR.responseText);
    }
  });
}

function updateExchangeRatesModal(selectedCurrency) {
  $.ajax({
    url: "libs/php/getExchangeRates.php",
    type: 'GET',
    dataType: 'json',
    success: function (result) {
      console.log(result);
      if (result.status !== 'error') {
        var options = '';
        $.each(result.rates, function (currency, rate) {
          var selected = currency === selectedCurrency ? ' selected' : '';
          options += `<option value="${rate}" data-currency="${currency}"${selected}>${currency}</option>`;
        });
        $('#exchangeRatesSelect').html(options);
        convertCurrency();
      } else {
        console.error("Error: " + result.message);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.error("Error: " + textStatus + " - " + errorThrown);
      console.log(jqXHR.responseText);
    }
  });
}

function getExchangeRates() {
  $.ajax({
    url: "libs/php/getExchangeRates.php",
    type: 'GET',
    dataType: 'json',
    success: function (result) {
      console.log(result);
      if (result.status !== 'error') {
        var options = '';
        $.each(result.rates, function (currency, rate) {
          options += `<option value="${rate}" data-currency="${currency}">${currency}</option>`;
        });
        $('#exchangeRatesSelect').html(options);
        convertCurrency();
      } else {
        console.error("Error: " + result.message);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.error("Error: " + textStatus + " - " + errorThrown);
      console.log(jqXHR.responseText);
    }
  });
}

function convertCurrency() {
  var amount = parseFloat($('#amount').val()) || 1;
  var rate = parseFloat($('#exchangeRatesSelect').val());
  var currency = $('#exchangeRatesSelect option:selected').data('currency');

  if (isNaN(rate)) {
    $('#result').val('0');
    return;
  }

  var convertedAmount = amount * rate;
  $('#result').val(convertedAmount.toFixed(2) + ' ' + currency);
}

function updateCurrencyDropdown(currencyCode) {
  if (currencyCode) {
    $('#exchangeRatesSelect').val($(`#exchangeRatesSelect option[data-currency="${currencyCode}"]`).val());
    convertCurrency();
  }
}

function updateInfoModal(countryName, selectedOption) {
  // Encode the countryName
  var encodedCountryName = encodeURIComponent(countryName);
  console.log('country info opencage', countryName);

  $.ajax({
    url: 'libs/php/getInfo.php',
    method: 'GET',
    data: { q: encodedCountryName },
    success: function (data) {
      console.log('Response data:', data);
      if (data.status && data.status.code === "200") {
        var results = data.data.results[0];
        lat = results.geometry.lat;
        lng = results.geometry.lng;
        map.setView([lat, lng], 5);
        var countryData = {
          countryCode: selectedOption.val(),
          countryName: selectedOption.text(),
          carOrientation: results.annotations.roadinfo.drive_on,
          capital: results.components.state || 'Unknown',
          currency: results.annotations.currency.name,
          timeZone: results.annotations.timezone.name,
          continent: results.components.continent,
          postal: 'Unknown'
        };

        selectedCurrencyCode = results.annotations.currency.iso_code;

        // Combine country info into one modal content
        var countryContent = '<table class="table table-striped">';
        countryContent += '<tr><td class="text-center"><i class="fa-solid fa-car fa-xl text-success"></i></td><td><strong>Driving side:</strong></td><td class="text-end">' + countryData.carOrientation + '</td></tr>';
        countryContent += '<tr><td class="text-center"><i class="fa-solid fa-heart fa-xl text-success"></i></td><td><strong>Latitude:</strong></td><td class="text-end">' + results.geometry.lat + '</td></tr>';
        countryContent += '<tr><td class="text-center"><i class="fa-solid fa-car fa-xl text-success"></i></td><td><strong>Longitude:</strong></td><td class="text-end">' + results.geometry.lng + '</td></tr>';
        countryContent += '<tr><td class="text-center"><i class="fa-solid fa-globe fa-xl text-success"></i></td><td><strong>Country:</strong></td><td class="text-end">' + countryData.countryName + '</td></tr>';
        countryContent += '<tr><td class="text-center"><i class="fa-solid fa-flag fa-xl text-success"></i></td><td><strong>Country Code:</strong></td><td class="text-end">' + countryData.countryCode + '</td></tr>';
        // countryContent += '<tr><td class="text-center"><i class="fa-solid fa-city fa-xl text-success"></i></td><td><strong>Capital:</strong></td><td class="text-end">' + countryData.capital + '</td></tr>';
        countryContent += '<tr><td class="text-center"><i class="fa-solid fa-money-bill-wave fa-xl text-success"></i></td><td><strong>Currency:</strong></td><td class="text-end">' + countryData.currency + '</td></tr>';
        countryContent += '<tr><td class="text-center"><i class="fa-solid fa-clock fa-xl text-success"></i></td><td><strong>Time Zone:</strong></td><td class="text-end">' + countryData.timeZone + '</td></tr>';
        countryContent += '<tr><td class="text-center"><i class="fa-solid fa-globe-europe fa-xl text-success"></i></td><td><strong>Continent:</strong></td><td class="text-end">' + countryData.continent + '</td></tr>';
        // countryContent += '<tr><td class="text-center"><i class="fa-solid fa-mail-bulk fa-xl text-success"></i></td><td><strong>Postal Code Format:</strong></td><td class="text-end">' + countryData.postal + '</td></tr>';
        countryContent += '</table>';

        $('#infoModal .modal-body').html(countryContent);

        updateCurrencyDropdown(selectedCurrencyCode);
      } else {
        console.error('Error fetching geocode data:', data.status ? data.status.description : 'Unknown error');
      }
    },
    error: function (xhr, status, error) {
      console.error('Error fetching geocode data:', error);
    }
  });
}

function fetchWikipediaData(query) {
  $.ajax({
    url: 'libs/php/getWikiData.php',
    method: 'GET',
    data: { q: query, maxRows: 10 },
    success: function (data) {
      if (data.status.code === "200") {
        var wikiContent = '';
        data.data.geonames.forEach(function (entry) {
          // Ensure the URL has a protocol
          let wikipediaUrl = entry.wikipediaUrl.startsWith('http') ? entry.wikipediaUrl : 'http://' + entry.wikipediaUrl;
          
          // Add thumbnail image if present
          let thumbnailImg = entry.thumbnailImg ? `<img src="${entry.thumbnailImg}" alt="${entry.title} thumbnail" class="img-thumbnail" style="max-width: 100px; margin-right: 10px;">` : '';
          
          wikiContent += `<div class="wiki-entry" style="display: flex; align-items: flex-start;">`;
          wikiContent += `${thumbnailImg}<div>`;
          wikiContent += `<h5>${entry.title}</h5>`;
          wikiContent += `<p>${entry.summary}</p>`;
          wikiContent += `<a href="${wikipediaUrl}" target="_blank">Read more</a>`;
          wikiContent += `</div></div><hr>`;
        });
        $('#wikiModal .modal-body').html(wikiContent);

      } else {
        console.error('Error fetching Wikipedia data:', data.status.description);
        $('#wikiModal .modal-body').html('<p>Error fetching Wikipedia data.</p>');
      }
    },
    error: function (err) {
      console.log("Error: ", err);
      $('#wikiModal .modal-body').html('<p>Error fetching Wikipedia data.</p>');
    }
  });
}

function fetchNewsData(countryCode) {
  var encodedCountryCode = encodeURIComponent(countryCode);
  console.log('Country code news', countryCode)

  $.ajax({
    url: 'libs/php/getNewsData.php',
    method: 'GET',
    data: { q: encodedCountryCode },
    success: function (data) {
      console.log('API Response:', data);

      if (data.status.code === "200") {
        var newsContent = '';
        data.data.forEach(function (article) {
          newsContent += `<h5>${article.title}</h5>`;
          newsContent += `<p>${article.publishedAt}</p>`;
          newsContent += `<a href="${article.url}" target="_blank">Read more</a><hr>`;
        });
        $('#newsModal .modal-body').html(newsContent);

      } else {
        console.error('Error fetching news data:', data.message);
        $('#newsModal .modal-body').html('<p>Error fetching news data.</p>');
      }
    },
    error: function (xhr, status, error) {
      console.error("AJAX Error:", status, error);
      $('#newsModal .modal-body').html('<p>Error fetching news data.</p>');
    }
  });
}

function getLocationAndSelectCountry() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      var lat = position.coords.latitude;
      var lng = position.coords.longitude;

      $.ajax({
        url: 'libs/php/getCountryCode.php',
        method: 'GET',
        data: {
          lat: lat,
          lng: lng
        },
        success: function (data) {
          if (data.status.code === 200) {
            var countryCode = data.data.countryCode;
            $('#countrySelect').val(countryCode).change();
          } else {
            console.error('Error fetching country code:', data.status.description);
          }
        },
        error: function (xhr, status, error) {
          console.error('Error fetching country code:', error);
        }
      });
    }, function (error) {
      console.error('Error getting location:', error);
    });
  } else {
    console.error('Geolocation is not supported by this browser.');
  }
}