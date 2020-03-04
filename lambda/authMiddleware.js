const jwt = require('jsonwebtoken');

module.exports = {

    isAuthenticated: (req, res, next) => {
        if (typeof req.headers.authorization !== "undefined") {
        } else {

        }

    }

};

