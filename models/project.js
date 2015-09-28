var mongoose = require('mongoose');
var moment = require('moment');

var projectSchema = mongoose.Schema({
    userId: String,
    name: String,
    description: String,
    metadataUri: String,
    created: Date,
    isPrivate: Boolean,
    videos: [new Schema({
        contentType: String,
        uri: String,
        width: Number,
        height: Number
    }, {_id: false})],
    screenshots: [new Schema({
        contentType: String,
        uri: String
    }, {_id: false})],
    images: [new Schema({
        contentType: String,
        uri: String
    }, {_id: false})]
});

var Project = module.exports = mongoose.model('Project', projectSchema);

projectSchema.statics.create = function (userId, data, callback) {
    var project = new Project({
        userId: userId,
        name: data.name,
        description: data.description,
        metadataUri: data.metadataUri,
        videos: data.videos,
        screenshots: data.screenshots,
        images: data.images,
        created: moment.utc()
    });

    project.save(function (err) {
        callback(err, project);
    });
};

projectSchema.statics.findNext = function (lastProjectId, top, callback) {
    Project.find(
        {
            isPrivate: false,
            _id: {$lt: lastProjectId}
        }, null, {
            sort: {created: -1},
            limit: top
        }, function (err, projects) {
            callback(err, projects);
        }
    );
};

projectSchema.statics.getById = function (projectId, userId, callback) {
    Project.findById(projectId, function (err, project) {
        if (err) {
            return callback(err);
        }

        if (!project) {
            return callback(new Error('Not found project.'));
        }

        if (project.userId != userId && project.isPrivate) {
            return callback(new Error('Forbidden to get project.'));
        }

        callback(null, project);
    });
};

projectSchema.statics.edit = function (userId, projectId, editedFields, callback) {
    Project.getById(projectId, userId, function (err, project) {
        if (err) {
            return callback(err);
        }

        if (project.userId != userId) {
            return callback(new Error('Forbidden to edit project.'));
        }

        project.update(editedFields, function (err, newProject) {
            if (err) {
                return callback(err);
            }

            callback(null, newProject);
        });
    });
};

projectSchema.statics.delete = function (projectId, userId, callback) {
    Project.getById(projectId, userId, function (err, project) {
        if (err) {
            return callback(err);
        }

        if (project.userId != userId) {
            return callback(new Error('Forbidden to delete project.'));
        }

        project.remove(function (err) {
            callback(err);
        });
    });
};