'use strict';
const db = require('../src/database');
const User = require('../models/user');
const {wrapError} = require('../src/helpers');
const RequestError = require('../src/RequestError');


const Queries = {
    insertFriendship: (source_id = '$1', target_id = '$2') => `INSERT INTO friendships VALUES(${source_id}, ${target_id})`,
    deleteFriendship: (source_id = '$1', target_id = '$2') => `DELETE FROM friendships WHERE source_id=${source_id} AND target_id=${target_id}`,
    existsFriendship: (source_id = '$1', target_id = '$2') => `SELECT EXISTS(SELECT 1 FROM friendships WHERE source_id=${source_id} AND target_id=${target_id})`,
    selectFollowing: (source_id = '$1') => `SELECT target_id FROM friendships WHERE source_id=${source_id}`,

    selectFollowingList: (source_id = '$1') => `SELECT users.id, users.username, users.name, users.profile_image_url
FROM friendships
INNER JOIN users ON friendships.target_id = users.id
WHERE friendships.source_id=${source_id}
ORDER BY friendships.since DESC`,

    selectFollowerList: (target_id = '$1') => `SELECT users.id, users.username, users.name, users.profile_image_url
FROM friendships
INNER JOIN users ON friendships.source_id = users.id
WHERE friendships.target_id=${target_id}
ORDER BY friendships.since DESC`
};
exports.queries = Queries;

function create(source_id, target_id) {
    if (Number(source_id) === Number(target_id)) {
        return Promise.reject(new RequestError(400, 'Can\'t follow yourself'));
    }
    return db.query(Queries.insertFriendship(), [source_id, target_id])
        .then(() => true)
        .catch(error => {
            if (error.code === '23505' && error.constraint === 'friendships_source_id_target_id_key') {
                // Friendship already exists
                return false;
            } else if (error.code === '23503' && error.constraint === 'friendships_source_id_fkey') {
                // Source doesn't exists
                throw wrapError(new RequestError(404, 'Logged user doesn\'t exists (anymore)'));
            } else if (error.code === '23503' && error.constraint === 'friendships_target_id_fkey') {
                // Target doesn't exists
                throw wrapError(new RequestError(404, 'User doesn\'t exists (anymore)'));
            } else {
                wrapError(error);
            }
        });
}

exports.createById = create;

function destroy(source_id, target_id) {
    if (Number(source_id) === Number(target_id)) {
        return Promise.reject(new RequestError(400, 'Can\'t unfollow yourself'));
    }
    return db.query(Queries.deleteFriendship(), [source_id, target_id])
        .then(result => result.rowCount > 0)
        .catch(wrapError);
}

exports.destroyById = destroy;

exports.createByUsername = function (source_id, target_username) {
    return User.getByUsername(target_username, ['id'])
        .then(user => create(source_id, user.id))
        .catch(wrapError);
};

exports.destroyByUsername = function (source_id, target_username) {
    return User.getByUsername(target_username, ['id'])
        .then(user => destroy(source_id, user.id))
        .catch(wrapError);
};

exports.isFollowing = function (source_id, target_id) {
    return db.query(Queries.existsFriendship(), [source_id, target_id])
        .then(result => result.rows[0].exists)
        .catch(wrapError);
};

exports.getFollowing = function (user_id) {
    return db.query(Queries.selectFollowing(), [user_id])
        .then(result => {
            const ids = [];
            for (let friendship of result.rows) {
                ids.push(friendship.target_id);
            }
            return ids;
        })
        .catch(wrapError);
};

exports.getFollowersListById = function (user_id) {
    return User.getById(user_id, ['id'])
        .then(user => db.query(Queries.selectFollowerList(), [user.id]))
        .then(result => {
            for (let user of result.rows) {
                delete user.password; // Never give password
            }
            return result.rows;
        })
        .catch(wrapError);
};

exports.getFollowersListByUsername = function (username) {
    return User.getByUsername(username, ['id'])
        .then(user => db.query(Queries.selectFollowerList(), [user.id]))
        .then(result => {
            for (let user of result.rows) {
                delete user.password; // Never give password
            }
            return result.rows;
        })
        .catch(wrapError);
};

exports.getFollowingListById = function (user_id) {
    return User.getById(user_id, ['id'])
        .then(user => db.query(Queries.selectFollowingList(), [user.id]))
        .then(result => {
            for (let user of result.rows) {
                delete user.password; // Never give password
            }
            return result.rows;
        })
        .catch(wrapError);
};

exports.getFollowingListByUsername = function (user_id) {
    return User.getByUsername(user_id, ['id'])
        .then(user => db.query(Queries.selectFollowingList(), [user.id]))
        .then(result => {
            for (let user of result.rows) {
                delete user.password; // Never give password
            }
            return result.rows;
        })
        .catch(wrapError);
};
