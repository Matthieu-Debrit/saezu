'use strict';
const CommentLike = require('../models/comment_like');
const {handleSuccess, handleError} = require('../src/helpers');
const RequestError = require('../src/RequestError');


exports.likeComment = function (req, res) {
    if (!req.params.comment_id) {
        return handleError(res, new RequestError(400, 'Invalid query'));
    }
    CommentLike.create(req.user.id, req.params.comment_id)
        .then(done => handleSuccess(res, {done}))
        .catch(error => handleError(res, error));
};

exports.unlikeComment = function (req, res) {
    if (!req.params.comment_id) {
        return handleError(res, new RequestError(400, 'Invalid query'));
    }
    CommentLike.destroy(req.user.id, req.params.comment_id)
        .then(done => handleSuccess(res, {done}))
        .catch(error => handleError(res, error));
};
