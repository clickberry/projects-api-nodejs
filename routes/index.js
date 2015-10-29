var express = require('express');
var signature=require('../middleware/signature-mw');

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
        signature.checkVideos,
        function (req, res, next) {
            var userId = req.payload.userId;
            var data = req.body;

            Project.create(userId, data, function (err, project) {
                if (err) {
                    return next(err);
                }

                var projectDto = projectMapper(project);
                bus.publishProjectCreate(projectDto, function(err){
                    if (err) {
                        return next(err);
                    }

                    res.status(201);
                    res.send(projectDto);
                });
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
            var editedFields = req.body;

            Project.edit(projectId, userId, editedFields, function (err, project) {
                if (err) {
                    return next(err);
                }

                var projectDto = projectMapper(project);
                bus.publishProjectEdit(projectDto, function(err){
                    if (err) {
                        return next(err);
                    }

                    res.send(projectDto);
                });
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

                bus.publishProjectRemove({projectId: projectId}, function(err){
                    if (err) {
                        return next(err);
                    }

                    res.sendStatus(200);
                });
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
        imageUri: project.imageUri,
        videos: project.videos,
        isPrivate: project.isPrivate,
        created: project.created
    };
}
