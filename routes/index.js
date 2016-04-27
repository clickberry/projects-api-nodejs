var express = require('express');
var config = require('clickberry-config');

var signature = require('../middleware/signature-mw');
var Project = require('../models/project');

var RelationToken = require('../lib/relation-token');
var relationToken = new RelationToken(config.get("token:relationSecret"));

var Bus = require('../lib/bus-service');
var bus = new Bus({
    mode: config.get('node:env'),
    address: config.get('nsqd:address'),
    port: config.getInt('nsqd:port')
});

bus.on('reconnect_failed', function (err) {
    console.log(err);
    process.exit(1);
});

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
                bus.publishProjectCreate(projectDto, function (err) {
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
            Project.find({userId: userId}, null, {sort: {created: -1}}, function (err, projects) {
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
        passport.authenticate(['access-token', 'anonymous'], {session: false, assignProperty: 'payload'}),
        function (req, res, next) {
            var userId = req.payload && req.payload.userId;
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
                bus.publishProjectEdit(projectDto, function (err) {
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

                bus.publishProjectDelete({id: projectId}, function (err) {
                    if (err) {
                        return next(err);
                    }

                    res.sendStatus(200);
                });
            });
        });

    router.get('/user/:userId', function (req, res, next) {
        var userId = req.params.userId;
        Project.find({
            userId: userId,
            isPrivate: false,
            isHidden: false
        }, null, {sort: {created: -1}}, function (err, projects) {
            if (err) {
                return next(err);
            }

            var projectDtos = projects.map(projectMapper);
            res.send(projectDtos);
        });
    });

    router.post('/:projectId/counters',
        passport.authenticate('access-token', {session: false, assignProperty: 'payload'}),
        function (req, res, next) {
            var userId = req.payload.userId;
            var projectId = req.params.projectId;
            Project.addCounter(projectId, userId, req.body.name, function (err, counter) {
                if (err) {
                    return next(err);
                }

                var counterDto=counterMapper(counter, projectId, userId);
                res.status(201);
                res.send(counterDto);
            });
        }
    );

    router.put('/:projectId/counters/:counterId',
        passport.authenticate('access-token', {session: false, assignProperty: 'payload'}),
        function (req, res, next) {
            var userId = req.payload.userId;
            var projectId = req.params.projectId;
            var counterId = req.params.counterId;

            Project.editCounter(projectId, userId, counterId, req.body.name, function (err) {
                if (err) {
                    return next(err);
                }

                res.send();
            });
        }
    );

    router.delete('/:projectId/counters/:counterId',
        passport.authenticate('access-token', {session: false, assignProperty: 'payload'}),
        function (req, res, next) {
            var userId = req.payload.userId;
            var projectId = req.params.projectId;
            var counterId = req.params.counterId;

            Project.deleteCounter(projectId, userId, counterId, function (err) {
                if (err) {
                    return next(err);
                }

                bus.publishCounterDelete({ownerId: projectId, id: counterId}, function (err) {
                    if (err) {
                        return next(err);
                    }

                    res.send();
                });
            });
        }
    );

    return router;
};

function projectMapper(project) {
    return {
        id: project._id,
        userId: project.userId,
        videoId: project.videoId,
        name: project.name,
        description: project.description,
        imageUri: project.imageUri,
        videos: project.videos,
        isPrivate: project.isPrivate || false,
        isHidden: project.isHidden || false,
        created: project.created,
        views: project.views,
        reshares: project.reshares,
        viewsCounter: counterMapper(project.viewsCounter, project._id, project.userId),
        resharesCounter: counterMapper(project.resharesCounter, project._id, project.userId),
        counters: project.counters.map(function(item){
            return counterMapper(item, project._id, project.userId);
        }),
        relationToken: relationToken.create(project._id, project.userId, project.userId)
    };
}

function counterMapper(counter, projectId, userId) {
    return {
        id: counter.id,
        name: counter.name,
        created: counter.created,
        relationToken: relationToken.create(counter.id, projectId, userId)
    };
}
