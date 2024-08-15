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
    // Clear the search input
    $("#searchInp").val('');

    // Check which tab is active and load the appropriate data
    if ($("#personnelBtn").hasClass("active")) {
        loadPersonnel();
    } else if ($("#departmentsBtn").hasClass("active")) {
        loadDepartments();
    } else {
        loadLocations();
    }

    // Optionally, manually trigger the keyup event to reset the filtering
    $("#searchInp").trigger("keyup");
    
    // Option to clear filters if needed
    // $("#filterDepartment").val('');
    // $("#filterLocation").val('');
    // $("#applyFilterBtn").trigger("click");
});

$("#filterBtn").click(function () {
  // Fetch departments and locations to populate dropdowns
  $.ajax({
      url: "libs/php/getAllDepartments.php",
      type: "GET",
      dataType: "json",
      success: function (result) {
          if (result.status.name == "ok") {
              $("#filterDepartment").empty().append('<option value="">All Departments</option>');
              result.data.forEach(department => {
                  $("#filterDepartment").append(`<option value="${department.id}">${department.name}</option>`);
              });
          }
      },
      error: function (jqXHR, textStatus, errorThrown) {
          console.log("Error: ", textStatus, errorThrown);
      }
  });

  $.ajax({
      url: "libs/php/getAllLocations.php",
      type: "GET",
      dataType: "json",
      success: function (result) {
          if (result.status.name == "ok") {
              $("#filterLocation").empty().append('<option value="">All Locations</option>');
              result.data.forEach(location => {
                  $("#filterLocation").append(`<option value="${location.id}">${location.name}</option>`);
              });
          }
      },
      error: function (jqXHR, textStatus, errorThrown) {
          console.log("Error: ", textStatus, errorThrown);
      }
  });

  // Show the modal
  $("#filterModal").modal("show");
});

$("#applyFilterBtn").click(function () {
  const selectedDepartment = $("#filterDepartment").val();
  const selectedLocation = $("#filterLocation").val();

  $.ajax({
      url: "libs/php/getFilteredPersonnel.php",
      type: "POST",
      dataType: "json",
      data: {
          departmentID: selectedDepartment,
          locationID: selectedLocation
      },
      success: function (result) {
          if (result.status.name == "ok") {
              $("#personnelTableBody .personnel-row:not(.d-none)").remove(); // Clear existing rows except the template
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
              $("#filterModal").modal("hide");
          }
      },
      error: function (jqXHR, textStatus, errorThrown) {
          console.log("Error: ", textStatus, errorThrown);
      }
  });
});

$("#addBtn").click(function () {
    $(".add-form").addClass("d-none"); // Hide all forms by default

    if ($("#personnelBtn").hasClass("active")) {
        // Update modal for adding personnel
        $("#addModalLabel").text("Add Personnel");
        $("#addPersonnelForm").removeClass("d-none");

        // Populate department dropdown
        $.ajax({
            url: "libs/php/getAllDepartments.php",
            type: "GET",
            dataType: "json",
            success: function (result) {
                if (result.status.name == "ok") {
                    $("#addPersonnelDepartment").empty();
                    result.data.forEach(department => {
                        $("#addPersonnelDepartment").append(`<option value="${department.id}">${department.name}</option>`);
                    });
                    $("#addModal").modal("show");
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("Error: ", textStatus, errorThrown);
            }
        });

    } else if ($("#departmentsBtn").hasClass("active")) {
        // Update modal for adding department
        $("#addModalLabel").text("Add Department");
        $("#addDepartmentForm").removeClass("d-none");

        // Populate location dropdown
        $.ajax({
            url: "libs/php/getAllLocations.php",
            type: "GET",
            dataType: "json",
            success: function (result) {
                if (result.status.name == "ok") {
                    $("#addDepartmentLocation").empty();
                    result.data.forEach(location => {
                        $("#addDepartmentLocation").append(`<option value="${location.id}">${location.name}</option>`);
                    });
                    $("#addModal").modal("show");
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("Error: ", textStatus, errorThrown);
            }
        });

    } else if ($("#locationsBtn").hasClass("active")) {
        // Update modal for adding location
        $("#addModalLabel").text("Add Location");
        $("#addLocationForm").removeClass("d-none");
        $("#addModal").modal("show");
    }
});

// Save button functionality
$("#saveBtn").click(function () {
    if ($("#addPersonnelForm").is(":visible")) {
        // Save new personnel
        const firstName = $("#addPersonnelFirstName").val();
        const lastName = $("#addPersonnelLastName").val();
        const email = $("#addPersonnelEmail").val();
        const departmentID = $("#addPersonnelDepartment").val();

        $.ajax({
            url: "libs/php/insertPersonnel.php",
            type: "POST",
            dataType: "json",
            data: {
                firstName,
                lastName,
                email,
                departmentID
            },
            success: function (result) {
                if (result.status.name == "ok") {
                    $("#addModal").modal("hide");
                    loadPersonnel(); // Refresh the personnel table
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("Error: ", textStatus, errorThrown);
            }
        });

    } else if ($("#addDepartmentForm").is(":visible")) {
        // Save new department
        const name = $("#addDepartmentName").val();
        const locationID = $("#addDepartmentLocation").val();

        $.ajax({
            url: "libs/php/insertDepartment.php",
            type: "POST",
            dataType: "json",
            data: {
                name,
                locationID
            },
            success: function (result) {
                if (result.status.name == "ok") {
                    $("#addModal").modal("hide");
                    loadDepartments(); // Refresh the departments table
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("Error: ", textStatus, errorThrown);
            }
        });

    } else if ($("#addLocationForm").is(":visible")) {
        // Save new location
        const name = $("#addLocationName").val();

        $.ajax({
            url: "libs/php/insertLocation.php",
            type: "POST",
            dataType: "json",
            data: {
                name
            },
            success: function (result) {
                if (result.status.name == "ok") {
                    $("#addModal").modal("hide");
                    loadLocations(); // Refresh the locations table
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("Error: ", textStatus, errorThrown);
            }
        });
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
                    // console.log("all id's", person.id);
                    let $row = $("#personnelTableBody .personnel-row.d-none").clone().removeClass("d-none");
                    $row.find(".personnel-name").text(`${person.firstName} ${person.lastName}`);
                    $row.find(".personnel-jobTitle").text(person.department); // Update this line to use department instead of job title
                    $row.find(".personnel-location").text(person.location);
                    $row.find(".personnel-email").text(person.email);
                    $row.find(".edit-personnel-btn").attr("data-id", person.id); // Set the personnel ID
                    $row.find(".delete-personnel-btn").attr("data-id", person.id); // Set the personnel ID for delete button if needed
                    $("#personnelTableBody").append($row);
                });
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log("Error: ", textStatus, errorThrown);
        }
    });
}

// Event listener for edit button
$(document).on("click", ".edit-personnel-btn", function () {
    const personnelID = $(this).data("id"); // Retrieve the personnel ID from the button's data-id attribute
    console.log("Personnel ID:", personnelID);

    // Here you would typically make an AJAX call to get the personnel details by ID
    // For now, let's just log the personnel ID to the console
});

// Event listener to show the Edit Personnel Modal with the selected employee's details
$("#editPersonnelModal").on("show.bs.modal", function (e) {
    const personnelID = $(e.relatedTarget).attr("data-id"); // Get the personnel ID from the button
    console.log("Editing personnel with ID:", personnelID); // Debug log to verify the ID

    $.ajax({
        url: "libs/php/getPersonnelByID.php",
        type: "POST",
        dataType: "json",
        data: {
            id: personnelID // Pass the personnel ID to the server
        },
        success: function (result) {
            if (result.status.name == "ok") {
                const personnel = result.data.personnel[0];
                const departments = result.data.department;

                // Populate the modal form fields with existing data
                $("#editPersonnelEmployeeID").val(personnel.id);
                $("#editPersonnelFirstName").val(personnel.firstName);
                $("#editPersonnelLastName").val(personnel.lastName);
                $("#editPersonnelJobTitle").val(personnel.jobTitle);
                $("#editPersonnelEmailAddress").val(personnel.email);

                // Populate the department dropdown
                $("#editPersonnelDepartment").empty();
                departments.forEach(department => {
                    $("#editPersonnelDepartment").append(
                        $("<option>", {
                            value: department.id,
                            text: department.name,
                            selected: department.id == personnel.departmentID
                        })
                    );
                });
            } else {
                console.error("Error retrieving data:", result.status.description);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("Error retrieving data:", textStatus, errorThrown);
        }
    });
});

// Event listener to handle form submission for editing personnel
$("#editPersonnelForm").on("submit", function (e) {
    e.preventDefault(); // Prevent the default form submission

    const personnelID = $("#editPersonnelEmployeeID").val();
    const firstName = $("#editPersonnelFirstName").val();
    const lastName = $("#editPersonnelLastName").val();
    const jobTitle = $("#editPersonnelJobTitle").val();
    const email = $("#editPersonnelEmailAddress").val();
    const departmentID = $("#editPersonnelDepartment").val();

    $.ajax({
        url: "libs/php/updatePersonnel.php",
        type: "POST",
        dataType: "json",
        data: {
            id: personnelID,
            firstName: firstName,
            lastName: lastName,
            jobTitle: jobTitle,
            email: email,
            departmentID: departmentID
        },
        success: function (result) {
            if (result.status.name == "ok") {
                // Close the modal
                $("#editPersonnelModal").modal("hide");

                // Refresh the personnel table to reflect changes
                loadPersonnel();
            } else {
                console.error("Error updating data:", result.status.description);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("Error updating data:", textStatus, errorThrown);
        }
    });
});

// Global variable to store the personnel ID to delete
let deletePersonnelID = null;

// Event listener for delete button click
$(document).on("click", ".delete-personnel-btn", function () {
    deletePersonnelID = $(this).data("id"); // Store the personnel ID
    console.log("Delete Personnel ID:", deletePersonnelID); // Debug log to check ID
    $("#deletePersonnelModal").modal("show"); // Show the delete confirmation modal
});

// Event listener for confirming delete action
$("#confirmDeletePersonnelBtn").click(function () {
    if (deletePersonnelID !== null) {
        $.ajax({
            url: "libs/php/deletePersonnel.php", // You need to create this PHP file
            type: "POST",
            dataType: "json",
            data: {
                id: deletePersonnelID // Send the personnel ID to be deleted
            },
            success: function (result) {
                if (result.status.name == "ok") {
                    // Close the modal
                    $("#deletePersonnelModal").modal("hide");

                    // Refresh the personnel table to reflect the changes
                    loadPersonnel();
                } else {
                    console.error("Error deleting personnel:", result.status.description);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error("Error deleting personnel:", textStatus, errorThrown);
            }
        });
    }
});

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

// Event listener to show the Edit Department Modal with the selected department's details
$("#editDepartmentModal").on("show.bs.modal", function (e) {
    const departmentID = $(e.relatedTarget).attr("data-id"); // Get the department ID from the button

    $.ajax({
        url: "libs/php/getDepartmentByID.php", // You need to create this PHP file to fetch the department by ID
        type: "POST",
        dataType: "json",
        data: {
            id: departmentID // Pass the department ID to the server
        },
        success: function (result) {
            if (result.status.name == "ok") {
                const department = result.data.department[0];
                const locations = result.data.locations;

                // Populate the modal form fields with existing data
                $("#editDepartmentID").val(department.id);
                $("#editDepartmentName").val(department.name);

                // Populate the location dropdown
                $("#editDepartmentLocation").empty();
                locations.forEach(location => {
                    $("#editDepartmentLocation").append(
                        $("<option>", {
                            value: location.id,
                            text: location.name,
                            selected: location.id == department.locationID
                        })
                    );
                });
            } else {
                console.error("Error retrieving data:", result.status.description);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("Error retrieving data:", textStatus, errorThrown);
        }
    });
});

// Event listener to handle form submission for editing department
$("#editDepartmentForm").on("submit", function (e) {
    e.preventDefault(); // Prevent the default form submission

    const departmentID = $("#editDepartmentID").val();
    const name = $("#editDepartmentName").val();
    const locationID = $("#editDepartmentLocation").val();

    $.ajax({
        url: "libs/php/updateDepartment.php", // You need to create this PHP file to update the department
        type: "POST",
        dataType: "json",
        data: {
            id: departmentID,
            name: name,
            locationID: locationID
        },
        success: function (result) {
            if (result.status.name == "ok") {
                // Close the modal
                $("#editDepartmentModal").modal("hide");

                // Refresh the departments table to reflect changes
                loadDepartments();
            } else {
                console.error("Error updating data:", result.status.description);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("Error updating data:", textStatus, errorThrown);
        }
    });
});

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

// Event listener to show the Edit Location Modal with the selected location's details
$("#editLocationModal").on("show.bs.modal", function (e) {
    const locationID = $(e.relatedTarget).attr("data-id"); // Get the location ID from the button

    $.ajax({
        url: "libs/php/getLocationByID.php", // You need to create this PHP file to fetch the location by ID
        type: "POST",
        dataType: "json",
        data: {
            id: locationID // Pass the location ID to the server
        },
        success: function (result) {
            if (result.status.name == "ok") {
                const location = result.data.location[0];

                // Populate the modal form fields with existing data
                $("#editLocationID").val(location.id);
                $("#editLocationName").val(location.name);
            } else {
                console.error("Error retrieving data:", result.status.description);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("Error retrieving data:", textStatus, errorThrown);
        }
    });
});

// Event listener to handle form submission for editing location
$("#editLocationForm").on("submit", function (e) {
    e.preventDefault(); // Prevent the default form submission

    const locationID = $("#editLocationID").val();
    const name = $("#editLocationName").val();

    $.ajax({
        url: "libs/php/updateLocation.php", // You need to create this PHP file to update the location
        type: "POST",
        dataType: "json",
        data: {
            id: locationID,
            name: name
        },
        success: function (result) {
            if (result.status.name == "ok") {
                // Close the modal
                $("#editLocationModal").modal("hide");

                // Refresh the locations table to reflect changes
                loadLocations();
            } else {
                console.error("Error updating data:", result.status.description);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("Error updating data:", textStatus, errorThrown);
        }
    });
});

// Global variables to store the department and location IDs to delete
let deleteDepartmentID = null;
let deleteLocationID = null;

// Event listener for delete department button click
$(document).on("click", ".delete-department-btn", function () {
    deleteDepartmentID = $(this).data("id"); // Store the department ID
    console.log("Delete Department ID:", deleteDepartmentID); // Debug log to check ID

    // Check if the department has employees
    $.ajax({
        url: "libs/php/checkDepartment.php", // You need to create this PHP file
        type: "POST",
        dataType: "json",
        data: {
            id: deleteDepartmentID
        },
        success: function (result) {
            if (result.status.name == "ok") {
                if (result.data.hasEmployees) {
                    $("#deleteDepartmentMessage").text("The department is not empty! It cannot be deleted!");
                    $("#confirmDeleteDepartmentBtn").addClass("d-none");
                } else {
                    $("#deleteDepartmentMessage").text("Are you sure you want to delete this department?");
                    $("#confirmDeleteDepartmentBtn").removeClass("d-none");
                }
                $("#deleteDepartmentModal").modal("show");
            } else {
                console.error("Error checking department:", result.status.description);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("Error checking department:", textStatus, errorThrown);
        }
    });
});

// Event listener for confirming delete department action
$("#confirmDeleteDepartmentBtn").click(function () {
    if (deleteDepartmentID !== null) {
        $.ajax({
            url: "libs/php/deleteDepartment.php", // You need to create this PHP file
            type: "POST",
            dataType: "json",
            data: {
                id: deleteDepartmentID // Send the department ID to be deleted
            },
            success: function (result) {
                if (result.status.name == "ok") {
                    $("#deleteDepartmentModal").modal("hide");
                    loadDepartments(); // Refresh the departments table
                } else {
                    console.error("Error deleting department:", result.status.description);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error("Error deleting department:", textStatus, errorThrown);
            }
        });
    }
});

// Event listener for delete location button click
$(document).on("click", ".delete-location-btn", function () {
    deleteLocationID = $(this).data("id"); // Store the location ID
    console.log("Delete Location ID:", deleteLocationID); // Debug log to check ID

    // Check if the location has departments
    $.ajax({
        url: "libs/php/checkLocation.php", // You need to create this PHP file
        type: "POST",
        dataType: "json",
        data: {
            id: deleteLocationID
        },
        success: function (result) {
            if (result.status.name == "ok") {
                if (result.data.hasDepartments) {
                    $("#deleteLocationMessage").text("The location still has a department! It cannot be deleted!");
                    $("#confirmDeleteLocationBtn").addClass("d-none");
                } else {
                    $("#deleteLocationMessage").text("Are you sure you want to delete this location?");
                    $("#confirmDeleteLocationBtn").removeClass("d-none");
                }
                $("#deleteLocationModal").modal("show");
            } else {
                console.error("Error checking location:", result.status.description);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("Error checking location:", textStatus, errorThrown);
        }
    });
});

// Event listener for confirming delete location action
$("#confirmDeleteLocationBtn").click(function () {
    if (deleteLocationID !== null) {
        $.ajax({
            url: "libs/php/deleteLocation.php", // You need to create this PHP file
            type: "POST",
            dataType: "json",
            data: {
                id: deleteLocationID // Send the location ID to be deleted
            },
            success: function (result) {
                if (result.status.name == "ok") {
                    $("#deleteLocationModal").modal("hide");
                    loadLocations(); // Refresh the locations table
                } else {
                    console.error("Error deleting location:", result.status.description);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error("Error deleting location:", textStatus, errorThrown);
            }
        });
    }
});

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