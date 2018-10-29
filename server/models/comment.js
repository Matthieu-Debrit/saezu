'use strict';
const db = require('../src/database');
const {checkRules, postRules} = require('../../common/inputRules');
const CommentLike = require('../models/comment_like');
const {wrapError} = require('../src/helpers');
const RequestError = require('../src/RequestError');
const POST_SELECT_COLUMNS = [
    'comments.id',
    'comments.post_id',
    'comments.content',
    'comments.modified_at',
    'comments.created_at',
    'comments.like_count',
    'comments.author_id',
    'users.username AS author_username',
    'users.name AS author_name'
].join(', ');


const Queries = {
    /*
    * Parameters:
    *  content
    *  author_id
    *  post_id
    */
    insertComment: () => `INSERT INTO comments VALUES(DEFAULT, $1, $2, $3) RETURNING id`,

    /*
    * Parameters:
    *  comment_id
    */
    selectCommentAuthorId: () => `SELECT author_id FROM comments WHERE id = $1`,

    /*
    * Parameters:
    *  content
    *  comment_id
    *  author_id
    */
    updateComment: () => `UPDATE comments SET content = $1 WHERE id = $2 AND author_id = $3`,

    /*
    * Parameters:
    *  comment_id
    *  author_id
    */
    deleteComment: () => `DELETE FROM comments WHERE id = $1 AND author_id = $2`,

    /*
    * Parameters:
    *  comment_id
    *  (user_id)
    */
    selectCommentById: (isAuth) => `SELECT ${POST_SELECT_COLUMNS}${isAuth ? ', EXISTS(SELECT 1 FROM comment_likes WHERE user_id = $2 AND comment_id = comments.id) AS liked' : ''}
FROM comments
INNER JOIN users ON comments.author_id = users.id
WHERE comments.id = $1
LIMIT 1`,

    /*
    * Parameters:
    *  post_id
    *  (user_id)
    */
    selectCommentsByPostId: (isAuth) => `SELECT ${POST_SELECT_COLUMNS}${isAuth ? ', EXISTS(SELECT 1 FROM comment_likes WHERE user_id = $2 AND comment_id = comments.id) AS liked' : ''}
FROM comments
INNER JOIN users ON comments.author_id = users.id
WHERE comments.post_id = $1
ORDER BY created_at DESC`
};
exports.queries = Queries;

exports.create = function (user_id, content, post_id) {
    let error;
    // Assignment in the followings conditions are deliberate
    if (error = checkRules(content, postRules)) {
        return Promise.reject(new RequestError(400, `Comment content: ${error}`));
    }
    // End
    return db.query(Queries.insertComment(), [content, user_id, post_id])
        .then(result => result.rows[0].id)
        .catch(error => {
            if (error.code === '23503' && error.constraint === 'comments_post_id_fkey') {
                // Post referring by post_id doesn't exists
                throw new RequestError(404, 'Replying to a post that doesn\'t exists');
            } else if (error.code === '23503' && error.constraint === 'comments_author_id_fkey') {
                // Author doesn't exists
                throw wrapError(new RequestError(404, 'Logged user doesn\'t exists (anymore)'));
            } else {
                wrapError(error);
            }
        });
};

function requireAuthorization(user_id, post_id) {
    return db.query(Queries.selectCommentAuthorId(), [post_id])
        .then(result => {
            if (result.rowCount === 0) {
                throw new RequestError(404, 'No comment correspond to these parameters');
            } else if (result.rows[0].author_id !== user_id) {
                throw new RequestError(403, 'Not authorized');
            }
        })
        .catch(wrapError);
}

exports.edit = function (user_id, post_id, content) {
    let error;
    // Assignment in the followings conditions are deliberate
    if (error = checkRules(content, postRules)) {
        return Promise.reject(new RequestError(400, `Comment content: ${error}`));
    }
    // End
    return requireAuthorization(user_id, post_id)
        .then(() => db.query(Queries.updateComment(), [content, post_id, user_id]))
        .then(result => result.rowCount > 0)
        .catch(wrapError);
};

exports.destroy = function (user_id, post_id) {
    return requireAuthorization(user_id, post_id)
        .then(() => db.query(Queries.deleteComment(), [post_id, user_id]))
        .then(result => result.rowCount > 0)
        .catch(wrapError);
};

exports.getById = function (id, auth_user_id) {
    const query = Queries.selectCommentById(!!auth_user_id);
    const values = [id];
    if (auth_user_id) {
        values.push(auth_user_id);
    }
    return db.query(query, values)
        .then(result => {
            const comment = result.rows[0];
            if (!comment) {
                throw new RequestError(404, 'No comment correspond to these parameters');
            }
            return comment;
        })
        .catch(wrapError);
};

exports.getByPostId = function (post_id, auth_user_id) {
    const query = Queries.selectCommentsByPostId(!!auth_user_id);
    const values = [post_id];
    if (auth_user_id) {
        values.push(auth_user_id);
    }
    return db.query(query, values)
        .then(result => result.rows)
        .catch(wrapError);
};
