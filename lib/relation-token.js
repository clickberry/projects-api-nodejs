var jwt = require('jsonwebtoken');

function RelationToken(secret) {
    this.secret = secret;
}

RelationToken.prototype.create = function (relationId, ownerId) {
    var relationToken = jwt.sign({
        id: relationId,
        ownerId: ownerId
    }, this.secret);

    return relationToken;
};

module.exports = RelationToken;