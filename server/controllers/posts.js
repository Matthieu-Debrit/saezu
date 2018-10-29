'use strict';
const Post = require('../models/post');
const {handleSuccess, handleError} = require('../src/helpers');
const RequestError = require('../src/RequestError');


exports.create = function (req, res) {
    Post.create(req.user.id, req.body.content)
        .then(id => handleSuccess(res, {data: {id}}))
        .catch(error => handleError(res, error));
};

exports.edit = function (req, res) {
    if (!req.params.post_id) {
        return handleError(res, new RequestError(400, 'Invalid query'));
    }
    Post.edit(req.user.id, req.params.post_id, req.body.content)
        .then(() => handleSuccess(res, null, 204))
        .catch(error => handleError(res, error));
};

exports.destroy = function (req, res) {
    if (!req.params.post_id) {
        return handleError(res, new RequestError(400, 'Invalid query'));
    }
    Post.destroy(req.user.id, req.params.post_id)
        .then(() => handleSuccess(res, null, 204))
        .catch(error => handleError(res, error));
};

exports.getById = function (req, res) {
    Post.getById(req.params.post_id, (req.user ? req.user.id : null))
        .then(post => handleSuccess(res, {data: post}))
        .catch(error => handleError(res, error));
};

exports.getTimeline = function (req, res) {
    if (!req.query.user_id) {
        return handleError(res, new RequestError(400, 'Invalid query'));
    }
    Post.getByAuthor(req.query.user_id, (req.user ? req.user.id : null))
        .then(posts => handleSuccess(res, {data: posts}))
        .catch(error => handleError(res, error));
};

exports.getHomeTimeline = function (req, res) {
    Post.getTimeline(req.user.id, (req.user ? req.user.id : null))
        .then(posts => handleSuccess(res, {data: posts}))
        .catch(error => handleError(res, error));
};
