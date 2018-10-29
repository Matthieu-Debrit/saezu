'use strict';
const User = require('../models/user');
const {handleSuccess, handleError} = require('../src/helpers');
const RequestError = require('../src/RequestError');


exports.search = function (req, res) {
    if (!req.query.q) {
        return handleError(res, new RequestError(400, 'No query'));
    }
    User.search(decodeURIComponent(req.query.q), ['id', 'username', 'name', 'profile_image_url'])
        .then(results => handleSuccess(res, {data: results}))
        .catch(error => handleError(res, error));
};