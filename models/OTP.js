const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

const OTPSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date, 
        expires: '5m', 
        default: Date.now 
    }
});

OTPSchema.pre("save", async function (next) {
    console.log("New OTP saved");
    if (this.isNew) {
        try {
            // Create a Transporter to send emails
            let transporter = nodemailer.createTransport({
                service: 'gmail', // Need proper authentication in order to send email
                auth: {
                    user: process.env.EMAIL_SENDER,
                    pass: process.env.EMAIL_PASS
                }
            });
            console.log("Transporter created");
            // Send emails to users
            await transporter.sendMail({
                from: process.env.EMAIL_SENDER,
                to: this.email,
                subject: "OTP Verification Email", // We can change subject and message as well
                html: `<h1>Please confirm your OTP</h1>
                       <p>Here is your OTP for verification: ${otp}</p>
                       <br>
                       <em>Do not reply to this email. This email address is being monitered.</em>`,
            });
            console.log("Email sent successfully: ", mailResponse);
        } catch (error) {
            res.status(500).json({ message : error });
        }
    }
    next();
  });

module.exports = mongoose.model("OTP", OTPSchema);