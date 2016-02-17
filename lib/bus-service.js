var util = require('util');
var Publisher = require('clickberry-nsq-publisher');

function Bus(options) {
    Publisher.call(this, options);
}

util.inherits(Bus, Publisher);

Bus.prototype.publishProjectCreate = function (message, callback) {
    if (!callback) {
        callback = function () {}
    }

    this.publish('project-creates', message, function (err) {
        if (err) return callback(err);
        callback();
    });
};

Bus.prototype.publishProjectEdit = function (message, callback) {
    if (!callback) {
        callback = function () {}
    }

    this.publish('project-updates', message, function (err) {
        if (err) return callback(err);
        callback();
    });
};

Bus.prototype.publishProjectDelete = function (message, callback) {
    if (!callback) {
        callback = function () {}
    }

    this.publish('project-deletes', message, function (err) {
        if (err) return callback(err);
        callback();
    });
};

Bus.prototype.publishCounterDelete = function (message, callback) {
    if (!callback) {
        callback = function () {}
    }

    this.publish('relation-deletes', message, function (err) {
        if (err) return callback(err);
        callback();
    });
};

module.exports = Bus;