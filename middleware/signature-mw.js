var error = require('clickberry-http-errors');
var config = require('clickberry-config');
var Signature = require('../lib/signature');
var secret = config.get('sign:secret');
var signature = new Signature(secret);

exports.checkVideos = function (req, res, next) {
    var videos = req.body.videos;
    if (!videos) {
        req.body.videos = {};
        return next();
    }

    var id = videos.id;
    videos.encoded = videos.encoded || [];

    var str = videos.encoded
        .map(function (video) {
            return video.uri;
        })
        .concat(id)
        .join(",");

    var result = signature.verify(str, videos.sign);

    if (!result) {
        next(new error.BadRequest());
    } else {
        next();
    }
};