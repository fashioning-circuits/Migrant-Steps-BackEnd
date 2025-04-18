const mongoose = require('mongoose');

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

module.exports = mongoose.model("OTP", OTPSchema);