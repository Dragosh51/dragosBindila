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
            // Automatically load markers
            updateAirportMarkers(countryCode);
            updateCityMarkers(countryCode);

            // Set the checkboxes to checked by default
            $('#airportCheckbox').prop('checked', true);
            $('#cityCheckbox').prop('checked', true);

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

    // Automatically load markers for the initial view (e.g., default country)
    const initialCountryCode = $('#countrySelect').val();
    if (initialCountryCode) {
      updateAirportMarkers(initialCountryCode);
      updateCityMarkers(initialCountryCode);
    }

    // Set the checkboxes to checked by default
    $('#airportCheckbox').prop('checked', true);
    $('#cityCheckbox').prop('checked', true);

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

          // Automatically load markers for the selected country
          updateAirportMarkers(selectedCountryCode);
          updateCityMarkers(selectedCountryCode);

          // Ensure checkboxes reflect current state
          $('#airportCheckbox').prop('checked', true);
          $('#cityCheckbox').prop('checked', true);
        } else {
          console.error('Error from PHP API:', response.status.description);
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error('AJAX error:', textStatus, ' - ', errorThrown);
      }
    });
  });

  // Event listeners for checkboxes
  $('#airportCheckbox').change(function () {
    if ($(this).is(':checked')) {
      updateAirportMarkers($('#countrySelect').val());
    } else {
      removeAirportMarkers();
    }
  });

  $('#cityCheckbox').change(function () {
    if ($(this).is(':checked')) {
      updateCityMarkers($('#countrySelect').val());
    } else {
      removeCityMarkers();
    }
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
    prefix: 'fa',
    icon: 'fa-plane',
    iconColor: 'black',
    markerColor: 'white',
    shape: 'square'
  });
}

function addAirportMarkers() {
  airportMarkers.clearLayers();

  var airportIcon = createAirportMarkerIcon();

  airportsData.forEach(function (airport) {
    var marker = L.marker([airport.lat, airport.lng], {
      icon: airportIcon
    }).bindTooltip(airport.name, {
      direction: "top",
      sticky: true
    });

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
    prefix: 'fa',
    icon: 'fa-city',
    markerColor: 'green',
    shape: 'square'
  });
}

function addCityMarkers() {
  cityMarkers.clearLayers();

  var cityIcon = createCityMarkerIcon();

  citiesData.forEach(function (city) {
    var marker = L.marker([city.lat, city.lng], {
      icon: cityIcon
    }).bindTooltip(`<strong>${city.name}</strong>`, {
      direction: "top",
      sticky: true
    });

    cityMarkers.addLayer(marker);
  });

  map.addLayer(cityMarkers);
}

function removeCityMarkers() {
  cityMarkers.clearLayers();
}

function updateCityMarkers(countryCode) {
  removeCityMarkers();
  
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
              var d = data.data;
              $('#weatherModalLabel').html(d.location.country + ", " + d.location.name);

              $('#todayConditions').html(d.current.condition.text);
              $('#todayIcon').attr("src", "https:" + d.current.condition.icon);
              $('#todayMaxTemp').html(Math.round(d.forecast.forecastday[0].day.maxtemp_c));
              $('#todayMinTemp').html(Math.round(d.forecast.forecastday[0].day.mintemp_c));

              var day1 = d.forecast.forecastday[1];
              $('#day1Date').text(new Date(day1.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }));
              $('#day1Icon').attr("src", "https:" + day1.day.condition.icon);
              $('#day1MinTemp').text(Math.round(day1.day.mintemp_c));
              $('#day1MaxTemp').text(Math.round(day1.day.maxtemp_c));

              var day2 = d.forecast.forecastday[2];
              $('#day2Date').text(new Date(day2.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }));
              $('#day2Icon').attr("src", "https:" + day2.day.condition.icon);
              $('#day2MinTemp').text(Math.round(day2.day.mintemp_c));
              $('#day2MaxTemp').text(Math.round(day2.day.maxtemp_c));

              $('#lastUpdated').text(d.current.last_updated);
              $('#pre-load').addClass('fadeOut');
            } else {
              console.error('Error in weather API response:', data);
            }
          },
          error: function (err) {
            console.error('Error fetching weather data:', err);
          }
        });
      } else {
        console.error('Error fetching country data:', countryData);
      }
    },
    error: function (err) {
      console.error('Error in country API request:', err);
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
          flag: results.annotations.flag,
          continent: results.components.continent,
          postal: 'Unknown'
        };

        selectedCurrencyCode = results.annotations.currency.iso_code;

        // Combine country info into one modal content
        var countryContent = '<table class="table table-striped">';
        countryContent += '<tr><td class="text-center"><i class="fa-solid fa-car fa-xl text-success"></i></td><td><strong>Driving side:</strong></td><td class="text-end">' + countryData.carOrientation + '</td></tr>';
        countryContent += '<tr><td class="text-center"><i class="fa-solid fa-arrows-up-down fa-xl text-success"></i></td><td><strong>Latitude:</strong></td><td class="text-end">' + results.geometry.lat + '</td></tr>';
        countryContent += '<tr><td class="text-center"><i class="fa-solid fa-arrows-left-right fa-xl text-success"></i></td><td><strong>Longitude:</strong></td><td class="text-end">' + results.geometry.lng + '</td></tr>';
        countryContent += '<tr><td class="text-center"><i class="fa-solid fa-globe fa-xl text-success"></i></td><td><strong>Country:</strong></td><td class="text-end">' + countryData.countryName + '</td></tr>';
        countryContent += '<tr><td class="text-center"><i class="fa-solid fa-hashtag fa-xl text-success"></i></td><td><strong>Country Code:</strong></td><td class="text-end">' + countryData.countryCode + '</td></tr>';
        // countryContent += '<tr><td class="text-center"><i class="fa-solid fa-city fa-xl text-success"></i></td><td><strong>Capital:</strong></td><td class="text-end">' + countryData.capital + '</td></tr>';
        countryContent += '<tr><td class="text-center"><i class="fa-solid fa-money-bill-wave fa-xl text-success"></i></td><td><strong>Currency:</strong></td><td class="text-end">' + countryData.currency + '</td></tr>';
        countryContent += '<tr><td class="text-center"><i class="fa-solid fa-flag fa-xl text-success"></i></td><td><strong>Flag:</strong></td><td class="text-end">' + countryData.flag + '</td></tr>';
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
  console.log('Country code news', countryCode);

  $.ajax({
    url: 'libs/php/getNewsData.php',
    method: 'GET',
    data: { q: encodedCountryCode },
    success: function (data) {
      console.log('API Response:', data);

      if (data.status.code === "200") {
        var newsContent = $('#newsContent');
        newsContent.empty(); // Clear any existing content

        data.data.forEach(function (article) {
          // Format the published date
          const publishDate = new Date(article.publishedAt);
          const options = { day: 'numeric', month: 'long' };
          const formattedDate = `${publishDate.getHours()}:${String(publishDate.getMinutes()).padStart(2, '0')} ${publishDate.toLocaleDateString('en-US', options)}`;

          // Clone the template and update its content
          var articleClone = $('.news-article-template').clone().removeClass('d-none news-article-template');
          articleClone.find('.news-title').text(article.title).attr('href', article.url);
          articleClone.find('.news-date').text(`Published at: ${formattedDate}`);
          
          // Append the cloned article to the news content
          newsContent.append(articleClone);
        });

        $('#pre-load-news').addClass('fadeOut');

      } else {
        console.error('Error fetching news data:', data.message);
        $('#newsContent').html('<p>Error fetching news data.</p>');
      }
    },
    error: function (xhr, status, error) {
      console.error("AJAX Error:", status, error);
      $('#newsContent').html('<p>Error fetching news data.</p>');
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