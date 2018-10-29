'use strict';
const db = require('../src/database');
const {wrapError} = require('../src/helpers');
const RequestError = require('../src/RequestError');


const Queries = {
    /*
    * Query parameters:
    *   user_id
    *   comment_id
    */
    insertCommentLike: () => `INSERT INTO comment_likes VALUES($1, $2)`,

    /*
    * Query parameters:
    *   user_id
    *   comment_id
    */
    deleteCommentLike: () => `DELETE FROM comment_likes WHERE user_id = $1 AND comment_id = $2`,

    /*
    * Query parameters:
    *   user_id
    *   comment_id
    */
    selectCommentLiked: () => `SELECT 1 FROM comment_likes WHERE user_id=$1 AND comment_id=$2`
};
exports.queries = Queries;

exports.create = function (user_id, comment_id) {
    const query = Queries.insertCommentLike();
    return db.query(query, [user_id, comment_id])
        .then(() => true)
        .catch(error => {
            if (error.code === '23505' && error.constraint === 'comment_likes_user_id_comment_id_key') {
                // Comment already liked
                return false;
            } else if (error.code === '23503' && error.constraint == 'comment_likes_comment_id_fkey') {
                // Comment doesn't exists
                throw wrapError(new RequestError(404, 'Can\'t like a comment that doesn\'t exists (anymore)'));
            } else {
                throw wrapError(error);
            }
        });
};

exports.destroy = function (user_id, comment_id) {
    const query = Queries.deleteCommentLike();
    return db.query(query, [user_id, comment_id])
        .then(result => result.rowCount > 0)
        .catch(wrapError);
};