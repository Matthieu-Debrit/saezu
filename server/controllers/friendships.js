'use strict';
const Friendship = require('../models/friendship');
const {handleSuccess, handleError} = require('../src/helpers');
const RequestError = require('../src/RequestError');


exports.create = function (req, res) {
    let promise;

    if (req.query.user_id) {
        promise = Friendship.createById(req.user.id, req.query.user_id);
    } else if (req.query.username) {
        promise = Friendship.createByUsername(req.user.id, req.query.username);
    } else {
        return handleError(res, new RequestError(400, 'Invalid query'));
    }
    promise.then(done => handleSuccess(res, {done}))
        .catch(error => handleError(res, error));
};

exports.destroy = function (req, res) {
    let promise;

    if (req.query.user_id) {
        promise = Friendship.destroyById(req.user.id, req.query.user_id);
    } else if (req.query.username) {
        promise = Friendship.destroyByUsername(req.user.id, req.query.username);
    } else {
        return handleError(res, new RequestError(400, 'Invalid query'));
    }
    promise.then(done => handleSuccess(res, {done}))
        .catch(error => handleError(res, error));
};

exports.getFollowersList = function (req, res) {
    let promise;

    if (req.query.user_id) {
        promise = Friendship.getFollowersListById(req.query.user_id);
    } else if (req.query.username) {
        promise = Friendship.getFollowersListByUsername(req.query.username);
    } else {
        return handleError(res, new RequestError(400, 'Invalid query'));
    }
    promise.then(list => handleSuccess(res, {data: list}))
        .catch(error => handleError(res, error));
};

exports.getFollowingList = function (req, res) {
    let promise;

    if (req.query.user_id) {
        promise = Friendship.getFollowingListById(req.query.user_id);
    } else if (req.query.username) {
        promise = Friendship.getFollowingListByUsername(req.query.username);
    } else {
        return handleError(res, new RequestError(400, 'Invalid query'));
    }
    promise.then(list => handleSuccess(res, {data: list}))
        .catch(error => handleError(res, error));
};