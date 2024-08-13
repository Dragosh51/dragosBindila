// Function to filter table based on search input
function filterTable(tableBodyId, searchTerm) {
  const rows = $(`#${tableBodyId} tr`);
  rows.each(function() {
      const rowText = $(this).text().toLowerCase();
      if (rowText.indexOf(searchTerm.toLowerCase()) !== -1) {
          $(this).show();
      } else {
          $(this).hide();
      }
  });
}

// Event listener for search input
$("#searchInp").on("keyup", function() {
  const searchTerm = $(this).val();
  
  if ($("#personnelBtn").hasClass("active")) {
      filterTable("personnelTableBody", searchTerm);
  } else if ($("#departmentsBtn").hasClass("active")) {
      filterTable("departmentTableBody", searchTerm);
  } else if ($("#locationsBtn").hasClass("active")) {
      filterTable("locationTableBody", searchTerm);
  }
});

// Refresh button functionality
$("#refreshBtn").click(function () {
  if ($("#personnelBtn").hasClass("active")) {
      loadPersonnel();
  } else if ($("#departmentsBtn").hasClass("active")) {
      loadDepartments();
  } else {
      loadLocations();
  }
});

// Load Personnel Table
function loadPersonnel() {
  $.ajax({
      url: "libs/php/getAll.php",
      type: "GET",
      dataType: "json",
      success: function (result) {
          if (result.status.name == "ok") {
              $("#personnelTableBody .personnel-row:not(.d-none)").remove(); // Clear existing rows
              result.data.forEach(person => {
                  let $row = $("#personnelTableBody .personnel-row.d-none").clone().removeClass("d-none");
                  $row.find(".personnel-name").text(`${person.firstName} ${person.lastName}`);
                  $row.find(".personnel-jobTitle").text(person.jobTitle);
                  $row.find(".personnel-location").text(person.location);
                  $row.find(".personnel-email").text(person.email);
                  $row.find(".edit-personnel-btn").attr("data-id", person.id);
                  $row.find(".delete-personnel-btn").attr("data-id", person.id);
                  $("#personnelTableBody").append($row);
              });
          }
      },
      error: function (jqXHR, textStatus, errorThrown) {
          console.log("Error: ", textStatus, errorThrown);
      }
  });
}

// Load Departments Table
function loadDepartments() {
  $.ajax({
      url: "libs/php/getAllDepartments.php",
      type: "GET",
      dataType: "json",
      success: function (result) {
          if (result.status.name == "ok") {
              $("#departmentTableBody .department-row:not(.d-none)").remove(); // Clear existing rows
              result.data.forEach(department => {
                  let $row = $("#departmentTableBody .department-row.d-none").clone().removeClass("d-none");
                  $row.find(".department-name").text(department.name);
                  $row.find(".department-location").text(department.location);
                  $row.find(".edit-department-btn").attr("data-id", department.id);
                  $row.find(".delete-department-btn").attr("data-id", department.id);
                  $("#departmentTableBody").append($row);
              });
          }
      },
      error: function (jqXHR, textStatus, errorThrown) {
          console.log("Error: ", textStatus, errorThrown);
      }
  });
}

// Load Locations Table
function loadLocations() {
  $.ajax({
      url: "libs/php/getAllLocations.php",
      type: "GET",
      dataType: "json",
      success: function (result) {
          if (result.status.name == "ok") {
              $("#locationTableBody .location-row:not(.d-none)").remove(); // Clear existing rows
              result.data.forEach(location => {
                  let $row = $("#locationTableBody .location-row.d-none").clone().removeClass("d-none");
                  $row.find(".location-name").text(location.name);
                  $row.find(".edit-location-btn").attr("data-id", location.id);
                  $row.find(".delete-location-btn").attr("data-id", location.id);
                  $("#locationTableBody").append($row);
              });
          }
      },
      error: function (jqXHR, textStatus, errorThrown) {
          console.log("Error: ", textStatus, errorThrown);
      }
  });
}

// Event listeners to load the data when tabs are clicked
$("#personnelBtn").click(function () {
  loadPersonnel();
});

$("#departmentsBtn").click(function () {
  loadDepartments();
});

$("#locationsBtn").click(function () {
  loadLocations();
});

// Load the default tab data (Personnel) when the page loads
$(document).ready(function () {
  loadPersonnel();
});