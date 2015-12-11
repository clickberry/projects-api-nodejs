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

    this.publish('project-edits', message, function (err) {
        if (err) return callback(err);
        callback();
    });
};

Bus.prototype.publishProjectRemove = function (message, callback) {
    if (!callback) {
        callback = function () {}
    }

    this.publish('project-removes', message, function (err) {
        if (err) return callback(err);
        callback();
    });
};

module.exports = Bus;