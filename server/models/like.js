'use strict';
const db = require('../src/database');
const {wrapError} = require('../src/helpers');
const RequestError = require('../src/RequestError');


const Queries = {
    insertLike: (user_id = '$1', post_id = '$2') => `INSERT INTO likes VALUES(${user_id}, ${post_id})`,
    deleteLike: (user_id = '$1', post_id = '$2') => `DELETE FROM likes WHERE user_id=${user_id} AND post_id=${post_id}`,
    selectLiked: (user_id = '$1', post_id = '$2') => `SELECT 1 FROM likes WHERE user_id=${user_id} AND post_id=${post_id}`
};
exports.queries = Queries;

exports.create = function (user_id, post_id) {
    const query = Queries.insertLike();
    return db.query(query, [user_id, post_id])
        .then(() => true)
        .catch(error => {
            if (error.code === '23505' && error.constraint === 'likes_user_id_post_id_key') {
                // Post already liked
                return false;
            } else if (error.code === '23503' && error.constraint == 'likes_post_id_fkey') {
                // Post doesn't exists
                throw wrapError(new RequestError(404, 'Can\'t like a post that doesn\'t exists (anymore)'));
            } else {
                throw wrapError(error);
            }
        });
};

exports.destroy = function (user_id, post_id) {
    const query = Queries.deleteLike();
    return db.query(query, [user_id, post_id])
        .then(result => result.rowCount > 0)
        .catch(wrapError);
};