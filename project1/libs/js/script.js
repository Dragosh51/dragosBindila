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

var sunBtn = L.easyButton("fa-sun fa-xl", function (btn, map) {
  alert('Sun button clicked!');
});

// ---------------------------------------------------------
// EVENT HANDLERS
// ---------------------------------------------------------

// initialise and add controls once DOM is ready

$(document).ready(function () {
  map = L.map("map", {
      layers: [streets]
  }).setView([54.5, -4], 6);
  
  // setView is not required in your application as you will be
  // deploying map.fitBounds() on the country border polygon

  layerControl = L.control.layers(basemaps).addTo(map);

  infoBtn.addTo(map);
  sunBtn.addTo(map);

  // Call the function to populate the country dropdown
  
  populateCountryDropdown();
});

// Function to populate the country dropdown
function populateCountryDropdown() {
  
  $.ajax({
      url: "libs/php/getCountryInfo.php",
      type: 'POST',
      dataType: 'json',
      success: function(result) {
          console.log(result);
          if (result.status.name === "ok") {
              var dropdown = $('#countrySelect');
              dropdown.empty();
              dropdown.append('<option selected="true" disabled>Choose Country</option>');
              
              $.each(result.data, function(key, entry) {
                  
                  dropdown.append($('<option></option>').attr('value', entry.countryCode).text(entry.countryName));
              });
          } else {
              console.error("Error: " + result.status.description);
          }
      },
      error: function(jqXHR, textStatus, errorThrown) {
          console.error("Error: " + textStatus + " - " + errorThrown);
          console.log(jqXHR.responseText);
      }
  });
}