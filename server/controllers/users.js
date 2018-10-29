'use strict';
const User = require('../models/user');
const Friendship = require('../models/friendship');
const {handleSuccess, handleError} = require('../src/helpers');
const RequestError = require('../src/RequestError');


function getFriendship(source_id, target_id) {
    let result = {};
    return Friendship.isFollowing(source_id, target_id)
        .then(following => {
            result.following = following;
            return Friendship.isFollowing(target_id, source_id);
        })
        .then(followed => {
            result.followed = followed;
            return result;
        });
}

exports.createUser = function (req, res) {
    User.create(req.body)
        .then(id => handleSuccess(res, {data: id}, 200))
        .catch(error => handleError(res, error));
};

exports.connectUser = function (req, res) {
    User.generateTokens(req.body.username, req.body.password)
        .then(tokens => handleSuccess(res, {data: tokens}))
        .catch(error => handleError(res, error));
};

exports.getUserInfo = function (req, res) {
    let promise, user;

    if (req.query.user_id) {
        if (isNaN(Number(req.query.user_id))) {
            return handleError(res, new RequestError(400, 'Invalid query: "user_id" must be a number'));
        }
        promise = User.getById(req.query.user_id);
    } else if (req.query.username) {
        promise = User.getByUsername(req.query.username);
    } else {
        return handleError(res, new RequestError(400, 'Invalid query'));
    }
    promise
        .then(result => {
            user = result;
            if (req.user && req.user.id !== user.id) {
                return getFriendship(req.user.id, user.id);
            }
        })
        .then(friendship => {
            if (friendship) {
                user.following = friendship.following;
                user.followed = friendship.followed;
            }
            handleSuccess(res, {data: user});
        })
        .catch(error => handleError(res, error));
};

exports.getMyUserInfo = function (req, res) {
    User.getById(req.user.id)
        .then(user => handleSuccess(res, {data: user}))
        .catch(error => handleError(res, error));
};

exports.updateMyUserInfo = function (req, res) {
    User.update(req.user.id, req.body)
        .then(() => handleSuccess(res, null, 204))
        .catch(error => handleError(res, error));
};

exports.deleteUser = function (req, res) {
    // TODO: secureDelete
    User.delete(req.user.id)
        .then(() => handleSuccess(res, null, 204))
        .catch(error => handleError(res, error));
};