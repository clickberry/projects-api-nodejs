var express = require('express');

var Project = require('../models/project');

var Bus = require('../lib/bus-service');
var bus = new Bus({});

var router = express.Router();

module.exports = function (passport) {
    router.get('/heartbeat', function (req, res) {
        res.send();
    });

    router.post('/',
        passport.authenticate('access-token', {session: false, assignProperty: 'payload'}),
        //signature.checkVideo,
        function (req, res, next) {
            var userId = req.payload.userId;

            Project.create(userId, req.body, function (err, project) {
                if (err) {
                    return next(err);
                }

                var projectDto = projectMapper(project);
                res.status(201);
                res.send(projectDto);
            });
        });

    router.get('/',
        passport.authenticate('access-token', {session: false, assignProperty: 'payload'}),
        function (req, res, next) {
            var userId = req.payload.userId;
            Project.find({userId: userId}, function (err, projects) {
                if (err) {
                    return next(err);
                }

                var projectDtos = projects.map(projectMapper);
                res.send(projectDtos);
            });
        });

    router.get('/all',
        function (req, res, next) {
            var lastId = req.query.last;
            var top = req.query.top;

            Project.findNext(lastId, top, function (err, projects) {
                if (err) {
                    return next(err);
                }

                var projectDtos = projects.map(projectMapper);
                res.send(projectDtos);
            });
        });

    router.get('/:projectId',
        passport.authenticate('access-token', {session: false, assignProperty: 'payload'}),
        function (req, res, next) {
            var userId = req.payload.userId;
            var projectId = req.params.projectId;
            Project.getById(projectId, userId, function (err, project) {
                if (err) {
                    return next(err);
                }

                var projectDto = projectMapper(project);
                res.send(projectDto);
            });
        });

    router.put('/:projectId',
        passport.authenticate('access-token', {session: false, assignProperty: 'payload'}),
        function (req, res, next) {
            var userId = req.payload.userId;
            var projectId = req.params.projectId;
            var editedFields = mapToEditedFields(req.body);

            Project.edit(projectId, userId, editedFields, function (err, project) {
                if (err) {
                    return next(err);
                }

                var projectDto = projectMapper(project);
                res.send(projectDto);
            });
        });

    router.delete('/:projectId',
        passport.authenticate('access-token', {session: false, assignProperty: 'payload'}),
        function (req, res, next) {
            var userId = req.payload.userId;
            var projectId = req.params.projectId;
            Project.delete(projectId, userId, function (err) {
                if (err) {
                    return next(err);
                }

                res.sendStatus(200);
            });
        });

    return router;
};

function projectMapper(project) {
    return {
        id: project._id,
        userId: project.userId,
        name: project.name,
        description: project.description,
        metadataUri: project.metadataUri,
        videos: project.videos,
        screenshots: project.screenshots,
        images: project.images,
        created: project.created
    };
}

function mapToEditedFields(project) {
    var editedFields = {};
    if (project.name) {
        editedFields.name = project.name;
    }
    if (project.description) {
        editedFields.description = project.description;
    }
    if (project.metadataUri) {
        editedFields.metadataUri = project.metadataUri;
    }
    if (project.images) {
        editedFields.images = project.images;
    }

    return project;
    //return {
    //    name: project.name || undefined,
    //    description: project.description || undefined,
    //    metadataUri: project.metadataUri || undefined,
    //    images: project.images || undefined
    //}
}
