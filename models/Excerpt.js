const mongoose = require('mongoose');

/*
Functionality: Access the Excerpt collection from the database
Params:
Returns: ExcerptSchema
*/
const ExcerptSchema = mongoose.Schema({},
    {
        collection: 'Excerpt'
    }
);

module.exports = mongoose.model('Excerpt', ExcerptSchema);