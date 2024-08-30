$(document).ready(function() {
    $('#submit-button').on('click', function(e) {
      e.preventDefault();
  
      // Gather form data
      const name = $('#name-field').val();
      const email = $('#email-field').val();
      const subject = $('#subject-field').val();
      const message = $('#message-field').val();
  
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
        success: function(response) {
          $('.sent-message').text(response).show(); // Show success message
          $('.error-message').hide();
        },
        error: function(jqXHR, textStatus, errorThrown) {
          $('.error-message').text('An error occurred. Please try again.').show(); // Show error message
          $('.sent-message').hide();
        }
      });
    });
  });