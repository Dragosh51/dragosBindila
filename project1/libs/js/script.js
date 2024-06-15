// ---------------------------------------------------------
// GLOBAL DECLARATIONS
// ---------------------------------------------------------

var map;

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
  // Initialize the map
  map = L.map("map", {
      layers: [streets]
  }).setView([54.5, -4], 6);

  layerControl = L.control.layers(basemaps).addTo(map);

  infoBtn.addTo(map);
  weatherBtn.addTo(map);
  newsBtn.addTo(map);
  wikiBtn.addTo(map);
  exchangeBtn.addTo(map);
  weatherBtn.addTo(map);

  // Populate the country dropdown
  populateCountryDropdown();
  getExchangeRates();

  // Add change event listener to the country dropdown
  $('#countrySelect').change(function () {
      const selectedCountryCode = $(this).val();
      const selectedOption = $(`#countrySelect option[value="${selectedCountryCode}"]`);
      const lat = selectedOption.data('latitude');
      const lng = selectedOption.data('longitude');
      const countryName = selectedOption.text();

      updateWeatherModal(countryName);
      updateInfoModal(countryName, selectedOption);
      fetchWikipediaData(countryName);
      fetchNewsData(selectedCountryCode);
  });

  $('#amount').on('input', convertCurrency);
  $('#exchangeRatesSelect').on('change', convertCurrency);
});

function populateCountryDropdown() {
  $.getJSON('countryBorders.geo.json', function(data) {
      console.log('Loaded country borders:', data);

      var options = '';
      data.features.forEach(function (country) {
          var countryCode = country.properties.iso_a2;
          var countryName = country.properties.name;
          var lat = country.geometry.coordinates[0][0][1]; // Adjust based on your JSON structure
          var lng = country.geometry.coordinates[0][0][0]; // Adjust based on your JSON structure

          options += `<option value="${countryCode}" data-latitude="${lat}" data-longitude="${lng}">${countryName}</option>`;
      });
      $('#countrySelect').html(options);
  }).fail(function() {
      console.error('Error loading country borders JSON file.');
  });
}

// $(document).ready(function () {
//   // Initialize the map
//   map = L.map("map", {
//     layers: [streets]
//   }).setView([54.5, -4], 6);

//   layerControl = L.control.layers(basemaps).addTo(map);

//   infoBtn.addTo(map);
//   weatherBtn.addTo(map);
//   newsBtn.addTo(map);
//   wikiBtn.addTo(map);
//   exchangeBtn.addTo(map);
//   weatherBtn.addTo(map);

//   // Populate the country dropdown
//   populateCountryDropdown();
//   getExchangeRates();

//   // Add change event listener to the country dropdown
//   $('#countrySelect').change(function () {
//     const selectedCountryCode = $(this).val();
//     const selectedOption = $(`#countrySelect option[value="${selectedCountryCode}"]`);
//     const lat = selectedOption.data('latitude');
//     const lng = selectedOption.data('longitude');
//     const countryName = selectedOption.text();

//     updateWeatherModal(countryName);
//     updateInfoModal(countryName, selectedOption);
//     fetchWikipediaData(countryName);
//     fetchNewsData(selectedCountryCode);
//   });

//   $('#amount').on('input', convertCurrency);
//   $('#exchangeRatesSelect').on('change', convertCurrency);
// });



// function populateCountryDropdown() {

//   $.ajax({
//     url: 'libs/php/getCountryInfo.php',
//     method: 'GET',
//     success: function (data) {
//       if (data.status.code === "200") {
//         var options = '';
//         data.data.forEach(function (country) {
//           options += `<option value="${country.countryCode}" > ${country.countryName}</option>`;
//         });
//         $('#countrySelect').html(options);
//       } else {
//         console.error('Error fetching country data:', data.status.description);
//       }
//     },
//     error: function (err) {
//       console.log("Error: ", err);
//     }
//   });
// }

function updateWeatherModal(countryName) {
  var encodedCountryName = encodeURIComponent(countryName);

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

function updateInfoModal(countryName, selectedOption) {
  // Encode the countryName
  var encodedCountryName = encodeURIComponent(countryName);
  console.log('country info opencage', countryName);

  $.ajax({
    url: 'libs/php/getInfo.php',
    method: 'GET',
    data: { q: encodedCountryName }, // Use the encoded countryName
    success: function (data) {
      console.log('Response data:', data);
      if (data.status && data.status.code === "200") {
        var results = data.data.results[0]; // Assuming the first result is the most relevant

        var countryData = {
          countryCode: selectedOption.val(),
          countryName: selectedOption.text(),
          carOrientation: results.annotations.roadinfo.drive_on,
          capital: results.components.state || 'Unknown', // Assuming state as capital
          currency: results.annotations.currency.name, // Replace with actual population data if available
          timeZone: results.annotations.timezone.name, // Replace with actual area data if available
          continent: results.components.continent,
          postal: 'Unknown' // Replace with actual postal code format if available
        };

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
          wikiContent += `<h5>${entry.title}</h5>`;
          wikiContent += `<p>${entry.summary}</p>`;
          wikiContent += `<a href="${entry.wikipediaUrl}" target="_blank">Read more</a><hr>`;
        });
        $('#wikiModal .modal-body').html(wikiContent);
        // $('#wikiModal').modal('show');
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
