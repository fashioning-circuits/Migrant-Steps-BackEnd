const mongoose = require('mongoose');

const TokenSchema = mongoose.Schema({
    access_token: {
        type: String,
        required: true
    },
    expires_in: {
        type: Number,
        required: true
    },
    refresh_token: {
        type: String,
        required: true
    },
    scope: {
        type: String,
        required: true
    },
    token_type: {
        type: String,
        required: true
    },
    user_id: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Token', TokenSchema);