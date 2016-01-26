var mongoose = require('mongoose');
var moment = require('moment');
var error = require('clickberry-http-errors');

var Schema = mongoose.Schema;

var projectSchema = new Schema({
    userId: String,
    name: String,
    nameSort: String,
    description: String,
    imageUri: String,
    created: Date,
    isPrivate: {type: Boolean, default: false},
    isHidden: {type: Boolean, default: false},
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
        nameSort: data.name && data.name.toLowerCase(),
        description: data.description,
        isPrivate: data.isPrivate || false,
        isHidden: data.isHidden || false,
        imageUri: data.imageUri,
        videos: data.videos || [],
        created: moment.utc()
    });

    project.save(function (err) {
        callback(err, project);
    });
};

projectSchema.statics.findNext = function (lastProjectId, top, callback) {
    var query = {
        isPrivate: false,
        isHidden: false
    };

    if (lastProjectId) {
        query._id = {$lt: lastProjectId}
    }

    top = parseInt(top);
    top = isNaN(top) ? 0 : top;

    if(!top){
        return callback(null, []);
    }

    Project.find(query, null, {
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
            return callback(new error.NotFound());
        }

        if (project.isPrivate && project.userId != userId) {
            return callback(new error.Forbidden());
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
            return callback(new error.Forbidden());
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
            return callback(new error.Forbidden());
        }

        project.remove(function (err) {
            callback(err);
        });
    });
};

projectSchema.methods.updateFields = function (editedFields, callback) {
    var project = this;

    if ('name' in editedFields) {
        project.name = editedFields.name;
        project.nameSort = editedFields.name.toLowerCase();
    }
    if ('description' in editedFields) {
        project.description = editedFields.description;
    }
    if ('imageUri' in editedFields) {
        project.imageUri = editedFields.imageUri;
    }
    if ('isPrivate' in editedFields) {
        project.isPrivate = editedFields.isPrivate;
    }
    if ('isHidden' in editedFields) {
        project.isHidden = editedFields.isHidden;
    }

    project.save(function (err, status) {
        callback(err, project, status);
    });
};

var Project = module.exports = mongoose.model('Project', projectSchema);