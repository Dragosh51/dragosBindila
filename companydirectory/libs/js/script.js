// Function to filter table based on search input
function filterTable(tableBodyId, searchTerm) {
    const rows = $(`#${tableBodyId} tr`);
    rows.each(function () {
        const rowText = $(this).text().toLowerCase();
        if (rowText.indexOf(searchTerm.toLowerCase()) !== -1) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
}

// Event listener for search input
$("#searchInp").on("keyup", function () {
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

$("#filterPersonnelModal").on("show.bs.modal", function () {
    // Populate the Department dropdown
    $.ajax({
        url: "libs/php/getAllDepartments.php",
        type: "GET",
        dataType: "json",
        success: function (result) {
            if (result.status.name == "ok") {
                $("#filterPersonnelByDepartment").empty().append('<option value="0">All Departments</option>');
                result.data.forEach(department => {
                    $("#filterPersonnelByDepartment").append(`<option value="${department.id}">${department.name}</option>`);
                });
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log("Error: ", textStatus, errorThrown);
        }
    });

    // Populate the Location dropdown
    $.ajax({
        url: "libs/php/getAllLocations.php",
        type: "GET",
        dataType: "json",
        success: function (result) {
            if (result.status.name == "ok") {
                $("#filterPersonnelByLocation").empty().append('<option value="0">All Locations</option>');
                result.data.forEach(location => {
                    $("#filterPersonnelByLocation").append(`<option value="${location.id}">${location.name}</option>`);
                });
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log("Error: ", textStatus, errorThrown);
        }
    });
});

// Handle Department selection
$("#filterPersonnelByDepartment").change(function () {
    const selectedDepartment = $(this).val();
    $("#filterPersonnelByLocation").val("0"); // Reset location to "All Locations"

    filterPersonnel(selectedDepartment, null); // Apply filter based on selected department
});

// Handle Location selection
$("#filterPersonnelByLocation").change(function () {
    const selectedLocation = $(this).val();
    $("#filterPersonnelByDepartment").val("0"); // Reset department to "All Departments"

    filterPersonnel(null, selectedLocation); // Apply filter based on selected location
});

// Function to apply the filter based on selected department or location
function filterPersonnel(departmentID, locationID) {
    $.ajax({
        url: "libs/php/getFilteredPersonnel.php",
        type: "POST",
        dataType: "json",
        data: {
            departmentID: departmentID !== "0" ? departmentID : null,
            locationID: locationID !== "0" ? locationID : null
        },
        success: function (result) {
            if (result.status.name == "ok") {
                // Clear the existing personnel list
                $("#personnelTableBody .personnel-row:not(.d-none)").remove();

                if (result.data.length === 0) {
                    console.log("No data found for the selected filter.");
                }

                // Populate the personnel table with the filtered results
                result.data.forEach(person => {
                    let $row = $("#personnelTableBody .personnel-row.d-none").clone().removeClass("d-none");
                    $row.find(".personnel-name").text(`${person.lastName} ${person.firstName}`);
                    $row.find(".personnel-jobTitle").text(person.department);
                    $row.find(".personnel-location").text(person.location);
                    $row.find(".personnel-email").text(person.email);
                    $row.find(".edit-personnel-btn").attr("data-id", person.id);
                    $row.find(".delete-personnel-btn").attr("data-id", person.id);
                    $("#personnelTableBody").append($row);
                });
            } else {
                console.log("Error: ", result.status.description);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log("Error: ", textStatus, errorThrown);
        }
    });
}

$("#addModal").on("show.bs.modal", function () {
    $(".add-form").addClass("d-none");

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
    }
});

// Save button functionality remains the same
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
                $("#personnelTableBody .personnel-row:not(.d-none)").remove();
                result.data.forEach(person => {
                    // console.log("all id's", person.id);
                    let $row = $("#personnelTableBody .personnel-row.d-none").clone().removeClass("d-none");
                    $row.find(".personnel-name").text(`${person.lastName} ${person.firstName}`);
                    $row.find(".personnel-jobTitle").text(person.department); // Update this line to use department instead of job title
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

// Event listener for edit button
$(document).on("click", ".edit-personnel-btn", function () {
    const personnelID = $(this).data("id");
    // console.log("Personnel ID:", personnelID);


});

// Event listener to show the Edit Personnel Modal with the selected employee's details
$("#editPersonnelModal").on("show.bs.modal", function (e) {
    const personnelID = $(e.relatedTarget).attr("data-id");
    console.log("Editing personnel with ID:", personnelID);

    $.ajax({
        url: "libs/php/getPersonnelByID.php",
        type: "POST",
        dataType: "json",
        data: {
            id: personnelID
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
    deletePersonnelID = $(this).data("id");
    const personnelName = $(this).closest("tr").find(".personnel-name").text();

    // Update modal content
    $("#deletePersonnelModal .modal-body").html(`Are you sure that you want to remove the entry for <strong>${personnelName}</strong>?`);
    $("#deletePersonnelModal").modal("show");
});

// Event listener for confirming delete action
$("#confirmDeletePersonnelBtn").click(function () {
    if (deletePersonnelID !== null) {
        $.ajax({
            url: "libs/php/deletePersonnel.php",
            type: "POST",
            dataType: "json",
            data: { id: deletePersonnelID },
            success: function (result) {
                if (result.status.name == "ok") {
                    $("#deletePersonnelModal").modal("hide");
                    loadPersonnel(); // Refresh personnel table
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
                $("#departmentTableBody .department-row:not(.d-none)").remove();
                result.data.forEach(department => {
                    let $row = $("#departmentTableBody .department-row.d-none").clone().removeClass("d-none");
                    $row.find(".department-name").text(department.name);
                    $row.find(".department-location").text(department.location);

                    // Set the data-id and data-name attributes
                    $row.find(".delete-department-btn").attr("data-id", department.id);
                    $row.find(".delete-department-btn").attr("data-name", department.name);

                    $row.find(".edit-department-btn").attr("data-id", department.id);
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
    const departmentID = $(e.relatedTarget).attr("data-id");

    $.ajax({
        url: "libs/php/getDepartmentByID.php",
        type: "POST",
        dataType: "json",
        data: {
            id: departmentID
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
    e.preventDefault();

    const departmentID = $("#editDepartmentID").val();
    const name = $("#editDepartmentName").val();
    const locationID = $("#editDepartmentLocation").val();

    $.ajax({
        url: "libs/php/updateDepartment.php",
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
                $("#locationTableBody .location-row:not(.d-none)").remove();
                result.data.forEach(location => {
                    let $row = $("#locationTableBody .location-row.d-none").clone().removeClass("d-none");
                    $row.find(".location-name").text(location.name);

                    // Set the data-id and data-name attributes
                    $row.find(".delete-location-btn").attr("data-id", location.id);
                    $row.find(".delete-location-btn").attr("data-name", location.name);

                    $row.find(".edit-location-btn").attr("data-id", location.id);
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
    const locationID = $(e.relatedTarget).attr("data-id");

    $.ajax({
        url: "libs/php/getLocationByID.php",
        type: "POST",
        dataType: "json",
        data: {
            id: locationID
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
    e.preventDefault();

    const locationID = $("#editLocationID").val();
    const name = $("#editLocationName").val();

    $.ajax({
        url: "libs/php/updateLocation.php",
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
    const departmentID = $(this).attr("data-id");
    const departmentName = $(this).attr("data-name");

    $.ajax({
        url: "libs/php/checkDepartment.php",
        type: "POST",
        dataType: "json",
        data: { id: departmentID },
        success: function (result) {
            if (result.status.name == "ok") {
                if (result.data.hasEmployees) {
                    const employeeCount = result.data.employeeCount;
                    $("#deleteDepartmentMessage").text(`You cannot remove the entry for ${departmentName} because it has ${employeeCount} employees assigned to it.`);
                    $("#deleteDepartmentModalLabel").text("Cannot remove department ...");
                    $("#confirmDeleteDepartmentBtn").addClass("d-none");
                    $("#deleteDepartmentFooter button[data-bs-dismiss='modal']").text("OK");
                } else {
                    $("#deleteDepartmentMessage").text(`Are you sure that you want to remove the entry for ${departmentName}?`);
                    $("#deleteDepartmentModalLabel").text("Remove department?");
                    $("#confirmDeleteDepartmentBtn").removeClass("d-none").data("id", departmentID);
                    $("#deleteDepartmentFooter button[data-bs-dismiss='modal']").text("No");
                }
                $("#deleteDepartmentModal").modal("show");
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("Error checking department:", textStatus, errorThrown);
        }
    });
});

// Event listener for confirming delete department action
$("#confirmDeleteDepartmentBtn").click(function () {
    const departmentID = $(this).data("id");

    $.ajax({
        url: "libs/php/deleteDepartment.php",
        type: "POST",
        dataType: "json",
        data: { id: departmentID },
        success: function (result) {
            if (result.status.name == "ok") {
                $("#deleteDepartmentModal").modal("hide");
                loadDepartments(); // Reload the departments list
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("Error deleting department:", textStatus, errorThrown);
        }
    });
});

// Event listener for delete location button click
$(document).on("click", ".delete-location-btn", function () {
    const locationID = $(this).attr("data-id");
    const locationName = $(this).attr("data-name");

    $.ajax({
        url: "libs/php/checkLocation.php",
        type: "POST",
        dataType: "json",
        data: { id: locationID },
        success: function (result) {
            if (result.status.name == "ok") {
                if (result.data.hasDepartments) {
                    const departmentCount = result.data.departmentCount;
                    $("#deleteLocationMessage").text(`You cannot remove the entry for ${locationName} because it has ${departmentCount} departments assigned to it.`);
                    $("#deleteLocationModalLabel").text("Cannot remove location ...");
                    $("#confirmDeleteLocationBtn").addClass("d-none");
                    $("#deleteLocationFooter button[data-bs-dismiss='modal']").text("OK");
                } else {
                    $("#deleteLocationMessage").text(`Are you sure that you want to remove the entry for ${locationName}?`);
                    $("#deleteLocationModalLabel").text("Remove location?");
                    $("#confirmDeleteLocationBtn").removeClass("d-none").data("id", locationID);
                    $("#deleteLocationFooter button[data-bs-dismiss='modal']").text("No");
                }
                $("#deleteLocationModal").modal("show");
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("Error checking location:", textStatus, errorThrown);
        }
    });
});

// Event listener for confirming delete location action
$("#confirmDeleteLocationBtn").click(function () {
    const locationID = $(this).data("id");

    $.ajax({
        url: "libs/php/deleteLocation.php",
        type: "POST",
        dataType: "json",
        data: { id: locationID },
        success: function (result) {
            if (result.status.name == "ok") {
                $("#deleteLocationModal").modal("hide");
                loadLocations(); // Reload the locations list
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("Error deleting location:", textStatus, errorThrown);
        }
    });
});

// Event listeners to load the data when tabs are clicked
$("#personnelBtn").click(function () {
    loadPersonnel();
    $("#filterBtn").attr("disabled", false);
});

$("#departmentsBtn").click(function () {
    loadDepartments();
    $("#filterBtn").attr("disabled", true);
});

$("#locationsBtn").click(function () {
    loadLocations();
    $("#filterBtn").attr("disabled", true);
});

// Load the default tab data (Personnel) when the page loads
$(document).ready(function () {
    loadPersonnel();
});