const mongoose = require('mongoose');

const ExcerptSchema = new mongoose.Schema({
    titleOfWork: { type: String, required: true }, // 'Title of the Work'
    notedBy: { type: String, required: true }, // 'Noted by'
    location: { type: String, default: null }, // Optional: 'Location'
    briefDescription: { type: String, required: true }, // 'Brief Description'
    containsWalkingOrRunning: { type: String, enum: ['Yes', 'No'], required: true }, // 'Does this excerpt contain walking or running?'
    reasonsForMigration: { type: String, enum: ['Yes', 'No'], default: null }, // Optional: 'Reasons for migration?'
    bureaucracyAroundMigration: { type: String, enum: ['Yes', 'No'], default: null }, // Optional: 'Bureaucracy around migration?'
    dayToDayMigrationExperience: { type: String, enum: ['Yes', 'No'], default: null }, // Optional: 'Day-to-day migration journey experience?'
    livesPostMigration: { type: String, enum: ['Yes', 'No'], default: null }, // Optional: 'Lives post-migration?'
    barriersOrWalls: { type: String, enum: ['Yes', 'No'], default: null }, // Optional: 'Barriers or walls?'
    landscapeRelationToMigration: { type: String, enum: ['Yes', 'No'], default: null }, // Optional: 'Landscape in relation to migration?'
    weatherRelationToMigration: { type: String, enum: ['Yes', 'No'], default: null }, // Optional: 'Weather in relation to migration?'
    noteworthyThemesOrTopics: { type: String, enum: ['Yes', 'No'], default: null }, // Optional: 'Other noteworthy themes or topics?'
    explainOther: { type: String, default: null }, // Optional: 'Explain Other (if any)'
    prioritizeExcerpt: { type: String, enum: ['Y', 'N'], required: true }, // 'Prioritize Excerpt?'
    excerptLink: { type: String, default: null }, // Optional: 'Excerpt (if any; link to file)'
    associatedNumberForWorkshop: { type: Number, default: null }, // Optional: 'Number the content is associated to for the workshop'
    altTextForImageExcerpts: { type: String, default: null }, // Optional: 'Alt text for any image excerpts'
    requiresContentWarnings: { type: String, enum: ['Yes', 'No'], default: null }, // Optional: 'Does this work require any content warnings?'
    contentWarning: { type: String, default: null }, // Optional: 'Content warning (if any)'
    attributionForMaterial: { type: String, default: null }, // Optional: 'Attribution for paratextual material'
    keywords: { type: String, default: null }, // Optional: 'Keywords (3 Maximum)'
    usedInPaperPrototypeWorkshop: { type: String, enum: ['Yes', 'No'], default: null }, // Optional: 'Used in Paper Prototype Workshop'
    thumbnailLink: { type: String, default: null }, // Optional: 'Link to thumbnail'
    thumbnailAltText: { type: String, default: null }, // Optional: 'Alt text for thumbnail'
    synopsis: { type: String, required: true }, // 'Synopsis'
    analysis: { type: String, required: true }, // 'Analysis'
    linksToIncludeInApp: { type: String, default: null }, // Optional: 'Links to include in app'
    reflectionQuestions: { // Optional group of reflection questions
        question1: { type: String, default: null }, // 'Reflection Question 1'
        question2: { type: String, default: null }, // 'Reflection Question 2'
        question3: { type: String, default: null }  // 'Reflection Question 3'
    }
}, {
    collection: 'Excerpt', // Explicitly specify the collection name
    timestamps: true       // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Excerpt', ExcerptSchema);
