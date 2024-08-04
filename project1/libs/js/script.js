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

// function convertCurrency() {
//   var amount = parseFloat($('#amount').val()) || 1;
//   var rate = parseFloat($('#exchangeRatesSelect').val());
//   var currency = $('#exchangeRatesSelect option:selected').data('currency');

//   if (isNaN(rate)) {
//       $('#result').val('0');
//       return;
//   }

//   var convertedAmount = amount * rate;
//   $('#result').val(convertedAmount.toFixed(2) + ' ' + currency);
// }

// // AJAX Call Function: Get Currency Code
// function getCurrencyCode(countryCode, callback) {
//   $.ajax({
//       url: 'libs/php/getCountryInfo.php',
//       type: 'GET',
//       data: { countryCode: countryCode },
//       success: function (result) {
//           if (result.status.code === "200" && result.data && result.data.currencyCode) {
//               console.log("Currency Code fetched: ", result.data.currencyCode); // Debugging line
//               callback(result.data.currencyCode);
//           } else {
//               console.error("Error: " + result.status.description);
//           }
//       },
//       error: function (jqXHR, textStatus, errorThrown) {
//           console.error("Error: " + textStatus + " - " + errorThrown);
//           console.log(jqXHR.responseText);
//       }
//   });
// }

// // AJAX Call Function: Get Exchange Rates
// function getExchangeRates(callback) {
//   $.ajax({
//     url: "libs/php/getExchangeRates.php",
//     type: 'GET',
//     dataType: 'json',
//     success: function (result) {
//       console.log("Exchange rates fetched: ", result); // Debugging line
//       if (result.status !== 'error') {
//         var options = '';
//         $.each(result.data, function (index, currencyData) {
//           options += `<option value="${currencyData.rate}" data-currency="${currencyData.code.trim()}">${currencyData.name}</option>`;
//         });
//         $('#exchangeRatesSelect').html(options);
//         if (callback) callback();
//       } else {
//         console.error("Error: " + result.message);
//       }
//     },
//     error: function (jqXHR, textStatus, errorThrown) {
//       console.error("Error: " + textStatus + " - " + errorThrown);
//       console.log(jqXHR.responseText);
//     }
//   });
// }

// // DOM Manipulation Function: Update Exchange Rates Modal
// function updateExchangeRatesModal(selectedCurrency) {
//   getExchangeRates(function () {
//     updateCurrencyDropdown(selectedCurrency);
//     convertCurrency(); // Ensure conversion happens with the selected currency
//   });
// }

// // DOM Manipulation Function: Update Currency Dropdown
// function updateCurrencyDropdown(currencyCode) {
//   console.log("Updating currency dropdown for code:", currencyCode); // Debugging line
//   if (currencyCode) {
//     // Ensure the currency code is trimmed and in uppercase
//     currencyCode = currencyCode.trim().toUpperCase();
//     console.log("Looking for currency code in dropdown:", currencyCode); // Debugging line
    
//     // Log all available options in the dropdown for comparison
//     $('#exchangeRatesSelect option').each(function() {
//       console.log("Dropdown option:", $(this).attr('data-currency'), $(this).text());
//     });
    
//     const option = $(`#exchangeRatesSelect option[data-currency="${currencyCode}"]`);
//     if (option.length) {
//       console.log("Currency option found: ", option.text()); // Debugging line
//       const value = option.val();
//       $('#exchangeRatesSelect').val(value);
//       console.log("Selected value set to:", $('#exchangeRatesSelect').val()); // Debugging line
//       convertCurrency();
//     } else {
//       console.error("Currency code not found in dropdown");
//     }
//   }
// }

// // Event Listener Function: Setup Event Listeners
// function setupEventListeners() {
//   $('#countrySelect').change(function () {
//       const selectedCountryCode = $(this).val();
//       const selectedOption = $(`#countrySelect option[value="${selectedCountryCode}"]`);
//       const countryName = selectedOption.text();

//       console.log('Country selected:', countryName);
//       console.log('Country code:', selectedCountryCode);

//       updateInfoModal(countryName, selectedOption);

//       if (countryBordersLayer) {
//           map.removeLayer(countryBordersLayer);
//       }

//       $.ajax({
//           url: 'libs/php/getCountryFeature.php',
//           method: 'GET',
//           dataType: 'json',
//           data: { code: selectedCountryCode },
//           success: function (response) {
//               if (response.status && response.status.code === "200") {
//                   const selectedCountry = response.data;

//                   countryBordersLayer = L.geoJSON(selectedCountry, {
//                       style: {
//                           color: 'blue',
//                           weight: 2,
//                           opacity: 0.3,
//                           fillOpacity: 0.3
//                       }
//                   }).addTo(map);

//                   map.once('zoomend', function () {
//                       map.fitBounds(countryBordersLayer.getBounds(), {
//                           padding: [20, 20],
//                           maxZoom: 10
//                       });
//                   });

//                   updateWeatherModal(selectedCountryCode);
//                   fetchWikipediaData(countryName.replace(/\s+/g, '').toLowerCase());
//                   fetchNewsData(selectedCountryCode);

//                   updateAirportMarkers(selectedCountryCode);
//                   updateCityMarkers(selectedCountryCode);

//                   // Fetch the currency code and update the exchange rates modal
//                   getCurrencyCode(selectedCountryCode, function (currencyCode) {
//                       updateExchangeRatesModal(currencyCode);
//                   });
//               } else {
//                   console.error('Error from PHP API:', response.status.description);
//               }
//           },
//           error: function (jqXHR, textStatus, errorThrown) {
//               console.error('AJAX error:', textStatus, ' - ', errorThrown);
//           }
//       });
//   });

//   // Event listeners for checkboxes
//   $('#airportCheckbox').change(function () {
//       if ($(this).is(':checked')) {
//           updateAirportMarkers($('#countrySelect').val());
//       } else {
//           removeAirportMarkers();
//       }
//   });

//   $('#cityCheckbox').change(function () {
//       if ($(this).is(':checked')) {
//           updateCityMarkers($('#countrySelect').val());
//       } else {
//           removeCityMarkers();
//       }
//   });

//   $('#amount').val('1');
//   $('#amount').on('input', convertCurrency);
//   $('#exchangeRatesSelect').on('change', convertCurrency);
// }

// // Document Ready Function
// $(document).ready(function () {
//   // Start fetching user's location immediately
//   var locationPromise = new Promise(function (resolve, reject) {
//       if (navigator.geolocation) {
//           navigator.geolocation.getCurrentPosition(function (position) {
//               resolve({
//                   lat: position.coords.latitude,
//                   lng: position.coords.longitude
//               });
//           }, function (error) {
//               reject("Geolocation error: " + error.message);
//           });
//       } else {
//           reject("Geolocation is not supported by this browser.");
//       }
//   });

//   // Show the preloader initially
//   $('#preloader').show();

//   // Start loading process
//   locationPromise.then(function (coords) {
//       var lat = coords.lat;
//       var lng = coords.lng;

//       // Make AJAX call to the PHP file
//       $.ajax({
//           url: 'libs/php/getCountryCode.php',
//           method: 'GET',
//           data: {
//               lat: lat,
//               lng: lng
//           },
//           success: function (data) {
//               if (data.status.code === "200") {
//                   var countryCode = data.data.country_code;
//                   var countryName = data.data.country;

//                   console.log('Country Code:', countryCode);
//                   console.log('Country Name:', countryName);

//                   // Initialize the app and set up event listeners
//                   initializeMap();
//                   setupEventListeners();

//                   // Populate the country dropdown and then set the value and trigger the change event
//                   populateCountryDropdown(function () {
//                       // Programmatically select the country in the dropdown
//                       $('#countrySelect').val(countryCode);
//                       console.log('Dropdown value set to:', $('#countrySelect').val());

//                       // Manually trigger the change event
//                       $('#countrySelect').trigger('change');

//                       // Ensure the modals and other updates are triggered
//                       updateInfoModal($('#countrySelect option:selected').text(), $('#countrySelect option:selected'));
//                       updateWeatherModal($('#countrySelect option:selected').text());
//                       fetchWikipediaData(countryCode);
//                       fetchNewsData(countryCode);

//                       // Fetch the currency code and update the exchange rates modal
//                       getCurrencyCode(countryCode, function(currencyCode) {
//                           updateExchangeRatesModal(currencyCode);
//                       });

//                       // Automatically load markers
//                       updateAirportMarkers(countryCode);
//                       updateCityMarkers(countryCode);

//                       // Set the checkboxes to checked by default
//                       $('#airportCheckbox').prop('checked', true);
//                       $('#cityCheckbox').prop('checked', true);

//                       // Hide the preloader after everything is loaded
//                       $('#preloader').fadeOut('slow', function () {
//                           $(this).remove(); // Remove preloader element after fade out
//                       });
//                   });

//                   // Load other data
//                   loadAirports();
//                   loadCities();
//               } else {
//                   console.error("Error from PHP API: " + data.status.description);

//                   // Initialize the app without user location
//                   initializeAppWithoutGeolocation();
//               }
//           },
//           error: function (jqXHR, textStatus, errorThrown) {
//               console.error("AJAX error: " + textStatus + " - " + errorThrown);

//               // Initialize the app without user location
//               initializeAppWithoutGeolocation();
//           }
//       });
//   }).catch(function (error) {
//       console.error(error);

//       // Initialize the app without user location
//       initializeAppWithoutGeolocation();
//   });

//   function initializeAppWithoutGeolocation() {
//       initializeMap();
//       setupEventListeners();
//       getExchangeRates();
//       loadAirports();
//       loadCities();

//       // Automatically load markers for the initial view (e.g., default country)
//       const initialCountryCode = $('#countrySelect').val();
//       if (initialCountryCode) {
//           updateAirportMarkers(initialCountryCode);
//           updateCityMarkers(initialCountryCode);
//       }

//       // Set the checkboxes to checked by default
//       $('#airportCheckbox').prop('checked', true);
//       $('#cityCheckbox').prop('checked', true);

//       // Hide the preloader in case of error
//       $('#preloader').fadeOut('slow', function () {
//           $(this).remove(); 
//       });
//   }
// });

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
            //console.log('Dropdown value set to:', $('#countrySelect').val());

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
      //console.log('Full Response from PHP:', response); 

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
    //console.log('Country code:', selectedCountryCode);

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

          map.once('zoomend', function () {
            map.fitBounds(countryBordersLayer.getBounds(), {
              padding: [20, 20],
              maxZoom: 10
            });
          });

          updateWeatherModal(selectedCountryCode);
          fetchWikipediaData(countryName.replace(/\s+/g, '').toLowerCase());
          fetchNewsData(selectedCountryCode);

          updateAirportMarkers(selectedCountryCode);
          updateCityMarkers(selectedCountryCode);

          // // Fetch the currency code and update the exchange rates modal
          // getCurrencyCode(selectedCountryCode, function (currencyCode) {
          //   updateCurrencyDropdown(currencyCode);
          // });
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
      //console.log('Loaded airports data:', data);
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
      //console.log('Loaded cities data:', data);
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
      //console.log('Loaded airports data for country:', data);
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
      //console.log('Loaded cities data for country:', data);
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
        //console.log("City Name", encodedCityName);

        // Fetch weather data for the capital city
        $.ajax({
          url: 'libs/php/getWeatherInfo.php',
          method: 'GET',
          data: { q: encodedCityName },
          success: function (data) {
            //console.log('Response data:', data);
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

// function getCurrencyNames(callback) {
//   $.ajax({
//     url: "libs/php/getCurrencyNames.php",
//     type: 'GET',
//     dataType: 'json',
//     success: function (result) {
//       console.log("Currency names result:", result); // Debugging line
//       if (result.status && result.status.code === 200) {
//         callback(result.data);
//       } else {
//         console.error("Error fetching currency names: " + (result.message || 'Unknown error'));
//       }
//     },
//     error: function (jqXHR, textStatus, errorThrown) {
//       console.error("Error: " + textStatus + " - " + errorThrown);
//       console.log(jqXHR.responseText);
//     }
//   });
// }

function updateExchangeRatesModal(selectedCurrency) {
  $.ajax({
    url: "libs/php/getExchangeRates.php",
    type: 'GET',
    dataType: 'json',
    success: function (result) {
      //console.log(result);
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
      //console.log(result);
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
  var encodedCountryName = encodeURIComponent(countryName);
  console.log('country info opencage', countryName);

  $.ajax({
    url: 'libs/php/getInfo.php',
    method: 'GET',
    data: { q: encodedCountryName },
    success: function (data) {
      //console.log('Response data:', data);
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

        // Update the modal content
        $('#carOrientation').text(countryData.carOrientation);
        $('#latitude').text(results.geometry.lat);
        $('#longitude').text(results.geometry.lng);
        $('#countryName').text(countryData.countryName);
        $('#countryCode').text(countryData.countryCode);
        $('#currency').text(countryData.currency);
        $('#flag').text(countryData.flag);
        $('#continent').text(countryData.continent);

        // Show the rows in the table
        $('.info-row').removeClass('d-none');

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
  // Replace spaces with empty strings and convert to lowercase to format the query correctly
  var formattedQuery = query.replace(/\s+/g, '').toLowerCase();

  $.ajax({
    url: 'libs/php/getWikiData.php',
    method: 'GET',
    data: { q: formattedQuery, maxRows: 10 },
    success: function (data) {
      if (data.status.code === "200") {
        const wikiContent = $('#wikiContent');
        wikiContent.empty(); // Clear any existing content

        data.data.geonames.forEach(function (entry) {
          // Ensure the URL has a protocol
          const wikipediaUrl = entry.wikipediaUrl.startsWith('http') ? entry.wikipediaUrl : 'http://' + entry.wikipediaUrl;
          
          // Create a new entry element
          const entryElement = $('<div class="wiki-entry d-flex align-items-start mb-3"></div>');
          
          // Add thumbnail image if present
          if (entry.thumbnailImg) {
            entryElement.append(`<img src="${entry.thumbnailImg}" alt="${entry.title} thumbnail" class="img-thumbnail me-3" style="max-width: 100px;">`);
          }
          
          // Add the entry details
          const detailsElement = $('<div></div>');
          detailsElement.append(`<h5><a href="${wikipediaUrl}" target="_blank" class="text-decoration-none text-dark">${entry.title}</a></h5>`);
          detailsElement.append(`<p>${entry.summary}</p>`);
          
          entryElement.append(detailsElement);
          wikiContent.append(entryElement);
        });

      } else {
        console.error('Error fetching Wikipedia data:', data.status.description);
        $('#wikiContent').html('<p>Error fetching Wikipedia data.</p>');
      }
    },
    error: function (err) {
      console.log("Error: ", err);
      $('#wikiContent').html('<p>Error fetching Wikipedia data.</p>');
    }
  });
}

function fetchNewsData(countryCode) {
  var encodedCountryCode = encodeURIComponent(countryCode);
  //console.log('Country code news', countryCode);

  $.ajax({
    url: 'libs/php/getNewsData.php',
    method: 'GET',
    data: { q: encodedCountryCode },
    success: function (data) {
      //console.log('API Response:', data);

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