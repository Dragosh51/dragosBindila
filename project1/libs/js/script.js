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

var earthquakeBtn = L.easyButton("fa-mountain fa-xl", function (btn, map) {
  $("#earthquakeModal").modal("show");
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
  earthquakeBtn.addTo(map);
  weatherBtn.addTo(map);

  // Populate the country dropdown
  populateCountryDropdown();
  getExchangeRates();

  // Add change event listener to the country dropdown
  $('#countrySelect').change(function() {
      const selectedCountryCode = $(this).val();
      const selectedOption = $(`#countrySelect option[value="${selectedCountryCode}"]`);
      const lat = selectedOption.data('latitude');
      const lng = selectedOption.data('longitude');
      const countryName = selectedOption.text();

      updateWeatherModal(countryName);
      updateInfoModal(countryName, selectedOption);
  });
});

function populateCountryDropdown() {
  
  $.ajax({
      url: 'libs/php/getCountryInfo.php',
      method: 'GET',
      success: function(data) {
          if (data.status.code === "200") {
              var options = '';
              data.data.forEach(function(country) {
                  options += `<option value="${country.countryCode}" > ${country.countryName}</option>`;
              });
              $('#countrySelect').html(options);
          } else {
              console.error('Error fetching country data:', data.status.description);
          }
      },
      error: function(err) {
          console.log("Error: ", err);
      }
  });
}

function updateWeatherModal(countryName) {
  // Encode the countryName
  var encodedCountryName = encodeURIComponent(countryName);

  $.ajax({
      url: 'libs/php/getWeatherInfo.php',
      method: 'GET',
      data: { q: encodedCountryName }, // Use the encoded countryName
      success: function(data) {
          console.log('Response data:', data);
          if (data.status && data.status.code === "200") {
              var weatherContent = '<ul>';
              weatherContent += '<li><strong>Country:</strong> ' + data.data.country + '</li>';
              weatherContent += '<li><strong>Temperature (C):</strong> ' + data.data.temp_c + '</li>';
              weatherContent += '<li><strong>Condition:</strong> ' + data.data.condition + '</li>';
              weatherContent += '</ul>';
              $('#weatherModal .modal-body').html(weatherContent);
          } else {
              console.error('Error fetching weather data:', data.status ? data.status.description : 'Unknown error');
          }
      },
      error: function(xhr, status, error) {
          console.error('Error fetching weather data:', error);
      }
  });
}


function getExchangeRates() {
  $.ajax({
      url: "libs/php/getExchangeRates.php",
      type: 'GET',
      dataType: 'json',
      success: function(result) {
          console.log("exchange",result);
          if (result.status !== 'error') {
              var options = '';
              $.each(result.rates, function(currency, rate) {
                options += `<option value="${rate}" data-currency="${currency}">${currency}</option>`;
              });
              $('#exchangeRatesSelect').html(options);
          } else {
              console.error("Error: " + result.message);
          }
      },
      error: function(jqXHR, textStatus, errorThrown) {
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
      alert('Please enter a valid amount and select a currency.');
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
      success: function(data) {
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
      error: function(xhr, status, error) {
          console.error('Error fetching geocode data:', error);
      }
  });
}