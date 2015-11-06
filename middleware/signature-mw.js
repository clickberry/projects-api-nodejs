var error = require('clickberry-http-errors');
var config = require('../config');
var Signature = require('../lib/signature');
var secret = config.get('sign:secret');
var signature = new Signature(secret);

exports.checkVideos = function (req, res, next) {
    var videos = req.body.videos || [];

    var result = videos.every(checkUriSign);

    if (!result) {
        next(new error.BadRequest());
    } else {
        next();
    }
};

function checkUriSign(item) {
    var sign = item.sign;
    var message = item.uri;

    return signature.verify(message, sign);

}