var mongoose = require('mongoose');

var projectSchema = mongoose.Schema({
    userId: String,
    name: String,
    description: String,
    metadataUri: String,
    created: Date,
    isPrivate: Boolean,
    videos: [],
    screenshots: [],
    images: []
});

module.exports = mongoose.model('Project', projectSchema);
