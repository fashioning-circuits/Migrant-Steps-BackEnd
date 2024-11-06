const mongoose = require('mongoose');


// Holds the email of user and type (FitBit or Manual)
const UserSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true
    },
    user_type: {
        type: String,
        required: true,
        enum: ['Manual', 'FitBit']
    }
});

module.exports = mongoose.model('User', UserSchema);

async function sendVerificationEmail(email, otp) {
    try {
        // Create a Transporter to send emails
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        });
        // Send emails to users
        let mailResponse = await transporter.sendMail({
            from: '', // What email to send from?
            to: email,
            subject: "Verification Email", // We can change subject and message as well
            html: `<h1>Please confirm your OTP</h1>
                   <p>Here is your OTP code: ${otp}</p>`,
        });
        console.log("Email sent successfully: ", mailResponse);
    } catch (error) {
      console.log("Error occurred while sending email: ", error);
      throw error;
    }
}