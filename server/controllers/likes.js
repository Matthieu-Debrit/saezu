'use strict';
const Like = require('../models/like');
const {handleSuccess, handleError} = require('../src/helpers');


exports.likePost = function (req, res) {
    if (!req.params.post_id) {
        return handleError(res, new RequestError(400, 'Invalid query'));
    }
    Like.create(req.user.id, req.params.post_id)
        .then(done => handleSuccess(res, {done}))
        .catch(error => handleError(res, error));
};

exports.unlikePost = function (req, res) {
    if (!req.params.post_id) {
        return handleError(res, new RequestError(400, 'Invalid query'));
    }
    Like.destroy(req.user.id, req.params.post_id)
        .then(done => handleSuccess(res, {done}))
        .catch(error => handleError(res, error));
};
