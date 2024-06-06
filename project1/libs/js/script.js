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
  $("#exampleModal").modal("show");
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

var exchangeBtn = L.easyButton("fa-clock fa-xl", function (btn, map) {
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
      updateCountryModal(selectedOption.data());
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
                  options += `<option value="${country.countryCode}" data-capital="${country.capital}" data-population="${country.population}" data-area="${country.areaInSqKm}" data-continent="${country.continentName}" data-postal="${country.postalCodeFormat}">${country.countryName}</option>`;
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
              $('#weatherModal').modal('show');
          } else {
              console.error('Error fetching weather data:', data.status ? data.status.description : 'Unknown error');
          }
      },
      error: function(xhr, status, error) {
          console.error('Error fetching weather data:', error);
      }
  });
}

function updateCountryModal(countryData) {
  console.log("Country Data", countryData); // Check the received data

  var countryContent = '<table class="table table-striped">';
  countryContent += '<tr><td><strong>Country Code:</strong></td><td>' + countryData.countryCode + '</td></tr>';
  countryContent += '<tr><td><strong>Country Name:</strong></td><td>' + countryData.countryName + '</td></tr>';
  countryContent += '<tr><td><strong>Capital:</strong></td><td>' + countryData.capital + '</td></tr>';
  countryContent += '<tr><td><strong>Population:</strong></td><td>' + countryData.population + '</td></tr>';
  countryContent += '<tr><td><strong>Area (sq km):</strong></td><td>' + countryData.area + '</td></tr>'; // Use 'area' instead of 'areaInSqKm'
  countryContent += '<tr><td><strong>Continent:</strong></td><td>' + countryData.continent + '</td></tr>'; // Use 'continent' instead of 'continentName'
  countryContent += '<tr><td><strong>Postal Code Format:</strong></td><td>' + countryData.postal + '</td></tr>'; // Use 'postal' instead of 'postalCodeFormat'
  countryContent += '</table>';

  $('#exampleModal .modal-body').html(countryContent);
  $('#exampleModal').modal('show');
}

function getExchangeRates() {
  $.ajax({
      url: "libs/php/getExchangeRates.php", 
      type: 'GET',
      dataType: 'json',
      success: function(result) {
          console.log(result);
          if (result.status !== 'error') {
              // Display exchange rates in a modal or other UI element
              $('#exchangeRatesModal .modal-body').html(JSON.stringify(result.rates, null, 2));
              $('#exchangeRatesModal').modal('show');
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