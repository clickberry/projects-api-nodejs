var mongoose = require('mongoose');
var moment = require('moment');
var Schema = mongoose.Schema;

var projectSchema = new Schema({
    userId: String,
    name: String,
    description: String,
    imageUri: String,
    created: Date,
    isPrivate: {type: Boolean, default: false},
    videos: [new Schema({
        contentType: String,
        uri: String,
        width: Number,
        height: Number
    }, {_id: false})]
});

projectSchema.statics.create = function (userId, data, callback) {
    var project = new Project({
        userId: userId,
        name: data.name,
        description: data.description,
        imageUri: data.imageUri,
        videos: data.videos,
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
            _id: {$gt: lastProjectId}
        }, null, {
            sort: {created: 1},
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

projectSchema.statics.edit = function (projectId, userId, editedFields, callback) {
    Project.getById(projectId, userId, function (err, project) {
        if (err) {
            return callback(err);
        }

        if (project.userId != userId) {
            return callback(new Error('Forbidden to edit project.'));
        }

        project.updateFields(editedFields, function (err, newProject) {
            callback(err, newProject);
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

projectSchema.methods.updateFields = function (editedFields, callback) {
    var project = this;

    if (editedFields.name) {
        project.name = editedFields.name;
    }
    if (editedFields.description) {
        project.description = editedFields.description;
    }
    if (editedFields.imageUri) {
        project.imageUri = editedFields.imageUri;
    }
    if (editedFields.isPrivate) {
        project.isPrivate = editedFields.isPrivate;
    }

    project.save(function (err, status) {
        callback(err, project, status);
    });
};

var Project = module.exports = mongoose.model('Project', projectSchema);