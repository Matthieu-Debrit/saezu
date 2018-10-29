'use strict';
const Comment = require('../models/comment');
const {handleSuccess, handleError} = require('../src/helpers');
const RequestError = require('../src/RequestError');


exports.create = function (req, res) {
    if (!req.query.in_reply_to) {
        return handleError(res, new RequestError(400, 'Invalid query'));
    }
    Comment.create(req.user.id, req.body.content, req.query.in_reply_to)
        .then(id => handleSuccess(res, {data: {id}}))
        .catch(error => handleError(res, error));
};

exports.edit = function (req, res) {
    if (!req.params.comment_id) {
        return handleError(res, new RequestError(400, 'Invalid query'));
    }
    Comment.edit(req.user.id, req.params.comment_id, req.body.content)
        .then(() => handleSuccess(res, null, 204))
        .catch(error => handleError(res, error));
};

exports.destroy = function (req, res) {
    if (!req.params.comment_id) {
        return handleError(res, new RequestError(400, 'Invalid query'));
    }
    Comment.destroy(req.user.id, req.params.comment_id)
        .then(() => handleSuccess(res, null, 204))
        .catch(error => handleError(res, error));
};

exports.getById = function (req, res) {
    Comment.getById(req.params.comment_id, (req.user ? req.user.id : null))
        .then(comment => handleSuccess(res, {data: comment}))
        .catch(error => handleError(res, error));
};

exports.getPostComments = function (req, res) {
    if (!req.params.post_id) {
        return handleError(res, new RequestError(400, 'Invalid query'));
    }
    Comment.getByPostId(req.params.post_id, (req.user ? req.user.id : null))
        .then(comments => handleSuccess(res, {data: comments}))
        .catch(error => handleError(res, error));
};
