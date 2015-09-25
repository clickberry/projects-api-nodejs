var express = require('express');

var Bus = require('../lib/bus-service');
var bus = new Bus({});

var router = express.Router();

module.exports = function (passport) {
    router.get('/heartbeat', function (req, res) {
        res.send();
    });

    router.post('/',
        passport.authenticate('access-token', {session: false, assignProperty: 'payload'}),
        function(req,res, next){

    });

    router.get('/',
        passport.authenticate('access-token', {session: false, assignProperty: 'payload'}),
        function(req,res, next){

    });

    router.get('/all',
        function(req,res, next){

        });

    router.get('/:projectId',
        passport.authenticate('access-token', {session: false, assignProperty: 'payload'}),
        function(req,res, next){

    });

    router.put('/:projectId',
        passport.authenticate('access-token', {session: false, assignProperty: 'payload'}),
        function(req,res, next){

        });

    router.delete('/:projectId',
        passport.authenticate('access-token', {session: false, assignProperty: 'payload'}),
        function(req,res, next){

    });

    return router;
};
