var jwt = require('jsonwebtoken');

function RelationToken(secret) {
    this.secret = secret;
}

RelationToken.prototype.create = function (relationId, ownerId, userId) {
    var relationToken = jwt.sign({
        id: relationId,
        ownerId: ownerId,
        userId: userId
    }, this.secret);

    return relationToken;
};

module.exports = RelationToken;