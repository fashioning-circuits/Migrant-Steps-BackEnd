const mongoose = require('mongoose');


/*
Functionality: The TokenSchema that is passed from the FitBit API
Params:
    -> access_token: The token we use for fetching all types of fitbit data (valid only for 8 hours)
    -> expires_in: The time in seconds before the access_token expires (max: 8 hours)
    -> refresh_token: The token used for refreshing the access token once expired (this token never expires)
    -> scope: the type of data whose permission we fetch from the user
    -> token_type: Bearer token
    -> user_id: The Fitbit's assigned user id
Returns: TokenSchema
*/
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