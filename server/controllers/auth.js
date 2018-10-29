'use strict';
const config = require('../config');
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const {handleError} = require('../src/helpers');
const RequestError = require('../src/RequestError');


function authenticate(req) {
    return new Promise((resolve, reject) => {
        const token = req.headers['authorization'];
        if (!token) {
            return reject(new RequestError(401, 'Need authorization'));
        }
        const authToken = token.match(/\S+/g);
        if (!authToken || !authToken[1]) {
            return reject(new RequestError(401, 'Bad token format'));
        }
        jwt.verify(authToken[1], config.secretJwt, function (err, decoded) {
            if (err) {
                return reject(new RequestError(401, 'Token invalid'));
            }
            req.user = decoded;
            resolve(decoded);
        });
    });
}

exports.setAuthentication = function (req, res, next) {
    authenticate(req)
        .then(() => next())
        .catch(() => next());
};

exports.isAuthenticated = function (req, res, next) {
    authenticate(req)
        .then(() => next())
        .catch(error => handleError(res, error));
};
