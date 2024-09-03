$(document).ready(function () {
  $('#submit-button').on('click', function (e) {
    e.preventDefault();

    // Gather form data
    const name = $('#name-field').val();
    const email = $('#email-field').val();
    const subject = $('#subject-field').val();
    const message = $('#message-field').val();

    // Hide any previous messages
    $('.error-message').hide();
    $('.sent-message').hide();

    // Show loading message
    $('.loading').show();

    // AJAX request
    $.ajax({
      url: 'forms/send_email.php', // Path to your PHP file
      type: 'POST',
      data: {
        name: name,
        email: email,
        subject: subject,
        message: message
      },
      success: function (response) {
        // Hide loading message
        $('.loading').hide();

        // Show success message
        $('.sent-message').text(response).show();

        $('#subject-field').val('');
        $('#message-field').val('');

        // Hide success message after 1 second
        setTimeout(function () {
          $('.sent-message').fadeOut();
        }, 1000);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        // Hide loading message
        $('.loading').hide();

        // Show error message
        $('.error-message').text('An error occurred. Please try again.').show();
      }
    });
  });
});