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