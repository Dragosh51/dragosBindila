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
        $('#preloader').fadeOut('slow', function () {
          
    
          // Handle the location data once it's ready
          locationPromise.then(function (coords) {
            var lat = coords.lat;
            var lng = coords.lng;
    
            // Reverse geocode using OpenCage API
            $.getJSON(`https://api.opencagedata.com/geocode/v1/json?q=${lat},${lng}&key=54edf32071d4421eae034f79c1a135a5`, function (data) {
              var countryCode = data.results[0].components.country_code.toUpperCase();
              var countryName = data.results[0].components.country;
    
              $('#countrySelect').val(countryCode).change(); // Select the country in the dropdown
    
              // Update info modal and set map view
              var selectedOption = $(`#countrySelect option[value="${countryCode}"]`);
              updateInfoModal(countryName, selectedOption);
              updateWeatherModal(countryName);
              fetchWikipediaData(countryCode);
              fetchNewsData(countryCode);
    
              // Initialize the app
              initializeMap();
              setupEventListeners();
              getExchangeRates();
              loadAirports();
              loadCities();
            });
          }).catch(function (error) {
            console.error(error);
    
            // Initialize the app without user location
            initializeMap();
            setupEventListeners();
            getExchangeRates();
            loadAirports();
            loadCities();
          });
          $(this).remove(); // Remove preloader element after fade out
        });
      }, function (error) {
        reject("Geolocation error: " + error.message);
      });
    } else {
      reject("Geolocation is not supported by this browser.");
    }
  });

  // Show preloader for 1.5 seconds
  // setTimeout(function () {
  //   $('#preloader').fadeOut('slow', function () {
  //     $(this).remove(); // Remove preloader element after fade out

  //     // Handle the location data once it's ready
  //     locationPromise.then(function (coords) {
  //       var lat = coords.lat;
  //       var lng = coords.lng;

  //       // Reverse geocode using OpenCage API
  //       $.getJSON(`https://api.opencagedata.com/geocode/v1/json?q=${lat},${lng}&key=54edf32071d4421eae034f79c1a135a5`, function (data) {
  //         var countryCode = data.results[0].components.country_code.toUpperCase();
  //         var countryName = data.results[0].components.country;

  //         $('#countrySelect').val(countryCode).change(); // Select the country in the dropdown

  //         // Update info modal and set map view
  //         var selectedOption = $(`#countrySelect option[value="${countryCode}"]`);
  //         updateInfoModal(countryName, selectedOption);
  //         updateWeatherModal(countryName);
  //         fetchWikipediaData(countryCode);
  //         fetchNewsData(countryCode);

  //         // Initialize the app
  //         initializeMap();
  //         setupEventListeners();
  //         getExchangeRates();
  //         loadAirports();
  //         loadCities();
  //       });
  //     }).catch(function (error) {
  //       console.error(error);

  //       // Initialize the app without user location
  //       initializeMap();
  //       setupEventListeners();
  //       getExchangeRates();
  //       loadAirports();
  //       loadCities();
  //     });
  //   });
  // }, 4000); // 1.5 seconds
});

var airportsData = [];
var citiesData = [];
var airportMarkers = L.markerClusterGroup();
var cityMarkers = L.markerClusterGroup();
var map;
var countryBorders;
var countryBordersLayer;

function initializeMap() {
  map = L.map("map", {
    layers: [streets] // Default layer
  }).setView([54.5, -4], 6);

  var layerControl = L.control.layers(basemaps, null, { collapsed: false }).addTo(map);

  var checkboxControl = L.control({ position: 'topright' });
  checkboxControl.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
    div.innerHTML = '<label><input type="checkbox" id="airportCheckbox"> Show Airports</label><br>' +
      '<label><input type="checkbox" id="cityCheckbox"> Show Cities</label>';

    L.DomEvent.on(div.querySelector('#airportCheckbox'), 'change', function () {
      if (this.checked) {
        updateAirportMarkers($('#countrySelect').val());
      } else {
        removeAirportMarkers();
      }
    });

    L.DomEvent.on(div.querySelector('#cityCheckbox'), 'change', function () {
      if (this.checked) {
        updateCityMarkers($('#countrySelect').val());
      } else {
        removeCityMarkers();
      }
    });

    return div;
  };
  checkboxControl.addTo(map);

  infoBtn.addTo(map);
  weatherBtn.addTo(map);
  newsBtn.addTo(map);
  wikiBtn.addTo(map);
  exchangeBtn.addTo(map);
}

function setupEventListeners() {
  populateCountryDropdown();

  $('#countrySelect').change(function () {
    const selectedCountryCode = $(this).val();
    const selectedOption = $(`#countrySelect option[value="${selectedCountryCode}"]`);
    const countryName = selectedOption.text();

    updateInfoModal(countryName, selectedOption);

    if (countryBordersLayer) {
      map.removeLayer(countryBordersLayer);
    }

    const selectedCountry = countryBorders.features.find(feature => feature.properties.iso_a2 === selectedCountryCode);
    countryBordersLayer = L.geoJSON(selectedCountry, {
      style: {
        color: 'blue',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.5
      }
    }).addTo(map);

    updateWeatherModal(countryName);
    fetchWikipediaData(countryName);
    fetchNewsData(selectedCountryCode);

    if ($('#airportCheckbox').is(':checked')) {
      updateAirportMarkers(selectedCountryCode);
    }

    if ($('#cityCheckbox').is(':checked')) {
      updateCityMarkers(selectedCountryCode);
    }
  });

  $('#amount').on('input', convertCurrency);
  $('#exchangeRatesSelect').on('change', convertCurrency);
}

function populateCountryDropdown() {
  $.getJSON('countryBorders.geo.json', function (data) {
    console.log('Loaded country borders:', data);
    countryBorders = data;

    var countries = data.features.map(function (country) {
      return {
        code: country.properties.iso_a2,
        name: country.properties.name,
        lat: country.geometry.coordinates[0][0][1], // Adjust based on your JSON structure
        lng: country.geometry.coordinates[0][0][0]  // Adjust based on your JSON structure
      };
    });

    // Sort countries alphabetically by name
    countries.sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });

    var options = '';
    countries.forEach(function (country) {
      options += `<option value="${country.code}" data-latitude="${country.lat}" data-longitude="${country.lng}">${country.name}</option>`;
    });

    $('#countrySelect').html(options);
  }).fail(function () {
    console.error('Error loading country borders JSON file.');
  });
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

function addAirportMarkers() {
  airportMarkers.clearLayers();
  airportsData.forEach(function (airport) {
    var marker = L.marker([airport.lat, airport.lng], {
      icon: L.divIcon({
        html: '<i class="fas fa-plane" style="color: blue; font-size: 24px;"></i>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      })
    }).bindPopup(`<b>${airport.name}</b><br>${airport.countryName}`);
    airportMarkers.addLayer(marker);
  });
  map.addLayer(airportMarkers);
}

function removeAirportMarkers() {
  map.removeLayer(airportMarkers);
}

function updateAirportMarkers(countryCode) {
  removeAirportMarkers();
  if ($('#airportCheckbox').is(':checked')) {
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
  }
}

function addCityMarkers() {
  citiesData.forEach(function (city) {
    var lat = city.lat;
    var lng = city.lng;

    var marker = L.marker([city.lat, city.lng], {
      icon: L.divIcon({
        html: '<i class="fas fa-building" style="color: green; font-size: 24px;"></i>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      })
    }).bindPopup(`<b>${city.name}</b><br>${city.countryName}`);

    cityMarkers.addLayer(marker); // Add each marker individually
  });

  // Don't add all markers at once, just add the cluster group once outside the loop
  map.addLayer(cityMarkers); // Add the entire cluster group to the map
}

function removeCityMarkers() {
  map.removeLayer(cityMarkers);
}

function updateCityMarkers(countryCode) {
  removeCityMarkers();
  if ($('#cityCheckbox').is(':checked')) {
    $.ajax({
      url: 'libs/php/getLocations.php',
      method: 'GET',
      data: {
        q: 'city',
        country: countryCode
      },
      success: function (data) {
        console.log('Loaded cities data for country:', data);
        citiesData = data.data.geonames;
        addCityMarkers();
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error("Error loading cities data for country: " + textStatus + " - " + errorThrown);
        console.log(jqXHR.responseText);
      }
    });
  }
}





function updateWeatherModal(countryName) {
  var encodedCountryName = encodeURIComponent(countryName);
  console.log("COUNTRY NAME", encodedCountryName)

  $.ajax({
    url: 'libs/php/getWeatherInfo.php',
    method: 'GET',
    data: { q: encodedCountryName },
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
  var amount = parseFloat($('#amount').val());
  var rate = parseFloat($('#exchangeRatesSelect').val());
  var currency = $('#exchangeRatesSelect option:selected').data('currency');

  if (isNaN(amount) || isNaN(rate)) {
    $('#result').val('0');
    return;
  }

  var convertedAmount = amount * rate;
  $('#result').val(convertedAmount.toFixed(2) + ' ' + currency);
}

function updateCurrencyDropdown(currencyCode) {
  if (currencyCode) {
    $('#exchangeRatesSelect').val($(`#exchangeRatesSelect option[data-currency="${currencyCode}"]`).val());
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
          wikiContent += `<h5>${entry.title}</h5>`;
          wikiContent += `<p>${entry.summary}</p>`;
          wikiContent += `<a href="${wikipediaUrl}" target="_blank">Read more</a><hr>`;
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