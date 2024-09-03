<?php
// Load Composer's autoloader
require '../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Check if data is received via POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Sanitize input
    $name = htmlspecialchars($_POST['name']);
    $email = htmlspecialchars($_POST['email']);
    $subject = htmlspecialchars($_POST['subject']);
    $message = htmlspecialchars($_POST['message']);

    // Create a new PHPMailer instance for sending email to you
    $mail = new PHPMailer(true);

    try {
        // Server settings
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'dragosh.bindila@gmail.com'; // Your Gmail address
        $mail->Password = 'jyvi kvwy osrz oevb'; // The 16-digit app password from Google
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // Use TLS encryption
        $mail->Port = 587; // TLS port

        // Recipients
        $mail->setFrom($email, $name); // User's email
        $mail->addAddress('your-email@example.com', 'Your Name'); // Your receiving email

        // Content
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = '<p><strong>Name:</strong> ' . $name . '</p><p><strong>Email:</strong> ' . $email . '</p><p><strong>Message:</strong> ' . $message . '</p>';
        $mail->AltBody = "Name: $name\nEmail: $email\nMessage: $message";

        $mail->send();

        // Send auto-reply to the user
        $autoReply = new PHPMailer(true);
        $autoReply->isSMTP();
        $autoReply->Host = 'smtp.gmail.com';
        $autoReply->SMTPAuth = true;
        $autoReply->Username = 'dragosh.bindila@gmail.com'; // Your Gmail address
        $autoReply->Password = 'jyvi kvwy osrz oevb'; // The 16-digit app password from Google
        $autoReply->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $autoReply->Port = 587;

        // Recipients for auto-reply
        $autoReply->setFrom('dragosh.bindila@gmail.com', 'Dragos Bindila'); // Your email and name
        $autoReply->addAddress($email, $name); // User's email

        // Auto-reply content
        $autoReply->isHTML(true);
        $autoReply->Subject = 'Thank you for contacting me';
        $autoReply->Body = '<p>Hello!</p><p>Thank you so much for wanting to get in contact with me!</p><p>This is an automatic reply but I will get back to you as soon as I can!</p><p>Kind regards,<br>Dragos</p>';
        $autoReply->AltBody = "Hello!\n\nThank you so much for wanting to get in contact with me!\nThis is an automatic reply but I will get back to you as soon as I can!\n\nKind regards,\nDragos";

        $autoReply->send();

        echo 'Message has been sent and an auto-reply has been sent to the user.';
    } catch (Exception $e) {
        echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
    }
} else {
    echo 'Invalid request';
}
?>
