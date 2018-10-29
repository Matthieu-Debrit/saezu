'use strict';
const db = require('../src/database');
const {checkRules, postRules} = require('../../common/inputRules');
const User = require('../models/user');
const Friendship = require('../models/friendship');
const Like = require('../models/like');
const {wrapError} = require('../src/helpers');
const RequestError = require('../src/RequestError');
const POST_SELECT_COLUMNS = [
    'posts.id',
    'posts.content',
    'posts.modified_at',
    'posts.created_at',
    'posts.comment_count',
    'posts.like_count',
    'posts.author_id',
    'users.username AS author_username',
    'users.name AS author_name'
].join(', ');


const Queries = {
    insertPost: (content = '$1', author_id = '$2') => `INSERT INTO posts VALUES(DEFAULT, ${content}, ${author_id}) RETURNING id`,
    selectPostAuthorId: (post_id = '$1') => `SELECT author_id FROM posts WHERE id=${post_id}`,
    updatePost: (content = '$1', post_id = '$2', author_id = '$3') => `UPDATE posts SET content=${content}
WHERE id=${post_id} AND author_id=${author_id}`,
    deletePost: (post_id = '$1', author_id = '$2') => `DELETE FROM posts WHERE id=${post_id} AND author_id=${author_id}`,
    selectPostById: (post_id = '$1') => `SELECT ${POST_SELECT_COLUMNS}
FROM posts
INNER JOIN users ON posts.author_id = users.id
WHERE posts.id=${post_id}
LIMIT 1`,

    selectPostByIdAuth: (post_id = '$1', user_id = '$2') => `SELECT ${POST_SELECT_COLUMNS},
EXISTS(${Like.queries.selectLiked(user_id, post_id)}) AS liked
FROM posts
INNER JOIN users ON posts.author_id = users.id
WHERE posts.id=${post_id}
LIMIT 1`,

    selectPostByAuthorIds: (author_ids = '$1') => `SELECT ${POST_SELECT_COLUMNS}
FROM posts
INNER JOIN users ON posts.author_id = users.id
WHERE posts.author_id=ANY(${author_ids})
ORDER BY created_at DESC`,

    selectPostByAuthorIdsAuth: (author_ids = '$1', user_id = '$2') => `SELECT ${POST_SELECT_COLUMNS}, EXISTS(SELECT 1 FROM likes WHERE user_id=${user_id} AND post_id=posts.id) AS liked
FROM posts
INNER JOIN users ON posts.author_id = users.id
WHERE posts.author_id=ANY(${author_ids})
ORDER BY posts.created_at DESC`
};
exports.queries = Queries;

exports.create = function (user_id, content) {
    let error;
    // Assignment in the followings conditions are deliberate
    if (error = checkRules(content, postRules)) {
        return Promise.reject(new RequestError(400, `Post content: ${error}`));
    }
    // End
    return db.query(Queries.insertPost(), [content, user_id])
        .then(result => result.rows[0].id)
        .catch(error => {
            if (error.code === '23503' && error.constraint === 'posts_author_id_fkey') {
                // User doesn't exists
                throw wrapError(new RequestError(404, 'Logged user doesn\'t exists (anymore)'));
            } else {
                wrapError(error);
            }
        });
};

function requireAuthorization(user_id, post_id) {
    return db.query(Queries.selectPostAuthorId(), [post_id])
        .then(result => {
            if (result.rowCount === 0) {
                throw new RequestError(404, 'No post correspond to these parameters');
            } else if (result.rows[0].author_id != user_id) {
                throw new RequestError(403, 'Not authorized');
            }
        })
        .catch(wrapError);
}

exports.edit = function (user_id, post_id, content) {
    let error;
    // Assignment in the followings conditions are deliberate
    if (error = checkRules(content, postRules)) {
        return Promise.reject(new RequestError(400, `Post content: ${error}`));
    }
    // End
    return requireAuthorization(user_id, post_id)
        .then(() => db.query(Queries.updatePost(), [content, post_id, user_id]))
        .then(result => result.rowCount > 0)
        .catch(wrapError);
};

exports.destroy = function (user_id, post_id) {
    return requireAuthorization(user_id, post_id)
        .then(() => db.query(Queries.deletePost(), [post_id, user_id]))
        .then(result => result.rowCount > 0)
        .catch(wrapError);
};

exports.getById = function (id, auth_user_id) {
    const params = [id];
    let query;
    if (auth_user_id) {
        params.push(auth_user_id);
        query = Queries.selectPostByIdAuth();
    } else {
        query = Queries.selectPostById();
    }
    return db.query(query, params)
        .then(result => {
            const user = result.rows[0];
            if (!user) {
                throw new RequestError(404, 'No post correspond to these parameters');
            }
            delete user.password;
            return user;
        })
        .catch(wrapError);
};

exports.getByAuthor = function (author_id, auth_user_id) {
    // Check if the author_id exists
    return db.query(`SELECT ${User.queries.existsUser()}`, [author_id])
        .then(result => {
            if (!result.rows[0].exists) {
                throw new RequestError(404, 'No user correspond to these parameters');
            }
            let query;
            const params = [[author_id]];
            if (auth_user_id) {
                params.push(auth_user_id);
                query = Queries.selectPostByAuthorIdsAuth();
            } else {
                query = Queries.selectPostByAuthorIds();
            }
            return db.query(query, params);
        })
        .then(result => result.rows)
        .catch(wrapError);
};

exports.getTimeline = function (user_id, auth_user_id) {
    return Friendship.getFollowing(user_id)
        .then(ids => {
            ids.push(user_id);
            let query;
            const params = [ids];
            if (auth_user_id) {
                params.push(auth_user_id);
                query = Queries.selectPostByAuthorIdsAuth();
            } else {
                query = Queries.selectPostByAuthorIds();
            }
            return db.query(query, params);
        })
        .then(result => result.rows)
        .catch(wrapError);
};