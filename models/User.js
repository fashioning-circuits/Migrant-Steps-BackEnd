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