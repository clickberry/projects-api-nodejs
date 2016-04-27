var mongoose = require('mongoose');
var moment = require('moment');
var error = require('clickberry-http-errors');
var shortId = require('shortid');

var Schema = mongoose.Schema;

var counterSchema = new Schema({
    id: String,
    name: String
});

var projectSchema = new Schema({
    userId: String,
    videoId: String,
    name: String,
    nameSort: String,
    description: String,
    imageUri: String,
    created: {type: Date, default: moment.utc},
    isPrivate: Boolean,
    isHidden: Boolean,
    deleted: Date,
    videos: [new Schema({
        contentType: String,
        uri: String,
        width: Number,
        height: Number
    }, {_id: false})],
    views: {type: Number, default: 0},
    reshares: {type: Number, default: 0},
    viewsCounter: counterSchema,
    resharesCounter: counterSchema,
    counters: [new Schema({
        id: String,
        name: String,
        created: {type: Date, default: moment.utc}
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
        videos: data.videos.encoded,
        videoId: data.videos.id,
        viewsCounter: {id: 'views', name: 'Views counter'},
        resharesCounter: {id: 'reshares', name: 'Reshares counter'}
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

    if (!top) {
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
    getById(projectId, function (err, project) {
        if (err) {
            return callback(err);
        }

        if (project.isPrivate && project.userId != userId) {
            return callback(new error.Forbidden());
        }

        callback(null, project);
    });
};

projectSchema.statics.edit = function (projectId, userId, editedFields, callback) {
    getOwnById(projectId, userId, function (err, project) {
        if (err) {
            return callback(err);
        }

        project.updateFields(editedFields, function (err, newProject) {
            callback(err, newProject);
        });
    });
};

projectSchema.statics.delete = function (projectId, userId, callback) {
    getOwnById(projectId, userId, function (err, project) {
        if (err) {
            return callback(err);
        }

        if (!project.deleted) {
            project.update({deleted: moment.utc()}, function (err) {
                callback(err);
            });
        } else {
            callback(null);
        }
    });
};

projectSchema.statics.addCounter = function (projectId, userId, name, callback) {
    getOwnById(projectId, userId, function (err, project) {
        if (err) {
            return callback(err);
        }

        var counter = {
            id: shortId.generate(),
            name: name,
            created: moment.utc()
        };

        project.update({$push: {counters: counter}}, function (err) {
            if (err) {
                return callback(err);
            }

            callback(null, counter);
        });
    });
};

projectSchema.statics.editCounter = function (projectId, userId, counterId, name, callback) {
    getOwnById(projectId, userId, function (err, project) {
        if (err) {
            return callback(err);
        }

        Project.update(
            {_id: projectId, 'counters.id': counterId},
            {$set: {'counters.$.name': name}},
            function (err, affected) {
                if (err) {
                    return callback(err);
                }

                if (!affected.n) {
                    return callback(new error.NotFound());
                }

                callback(null);
            });
    });
};

projectSchema.statics.deleteCounter = function (projectId, userId, counterId, callback) {
    getOwnById(projectId, userId, function (err, project) {
        if (err) {
            return callback(err);
        }

        project.update({$pull: {counters: {id: counterId}}}, function (err, affected) {
            if (err) {
                return callback(err);
            }

            if (!affected.nModified) {
                return callback(new error.NotFound());
            }

            callback(null);
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

function getById(projectId, callback) {
    Project.findById(projectId, function (err, project) {
        if (err) {
            return callback(err);
        }

        if (!project) {
            return callback(new error.NotFound());
        }

        callback(null, project);
    });
}

function getOwnById(projectId, userId, callback) {
    getById(projectId, function (err, project) {
        if (err) {
            return callback(err);
        }

        if (project.userId != userId) {
            return callback(new error.Forbidden());
        }

        callback(null, project);
    });
}

function notFound(project, callback) {
    if (!project) {
        return callback(new error.NotFound());
    }

    callback(null, project);
}

function forbidden(project, callback) {
    if (project.userId != userId) {
        return callback(new error.Forbidden());
    }

    callback(null, project);
}


var Project = module.exports = mongoose.model('Project', projectSchema);