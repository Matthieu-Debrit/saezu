'use strict';
const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth');
const userController = require('../controllers/users');
const postController = require('../controllers/posts');
const likeController = require('../controllers/likes');
const commentController = require('../controllers/comments');
const commentLikeController = require('../controllers/comment_likes');
const friendshipController = require('../controllers/friendships');
const searchController = require('../controllers/searches');


/*
 * ============================================================================
 * =                                USERS                                     =
 * ============================================================================
 */

router.route('/connect')
    .post(userController.connectUser);
router.route('/users')
    .post(userController.createUser);

router.route('/users/show')
    .get(authController.setAuthentication, userController.getUserInfo);
router.route('/users/me')
    .get(authController.isAuthenticated, userController.getMyUserInfo)
    .put(authController.isAuthenticated, userController.updateMyUserInfo)
    .delete(authController.isAuthenticated, userController.deleteUser);

/*
 * ============================================================================
 * =                                POSTS                                     =
 * ============================================================================
 */

router.route('/posts/create')
    .post(authController.isAuthenticated, postController.create);
router.route('/posts/edit/:post_id')
    .put(authController.isAuthenticated, postController.edit);
router.route('/posts/destroy/:post_id')
    .post(authController.isAuthenticated, postController.destroy);
router.route('/posts/show/:post_id')
    .get(authController.setAuthentication, postController.getById);

router.route('/posts/like/create/:post_id')
    .post(authController.isAuthenticated, likeController.likePost);
router.route('/posts/like/destroy/:post_id')
    .post(authController.isAuthenticated, likeController.unlikePost);

router.route('/posts/user_timeline')
    .get(authController.setAuthentication, postController.getTimeline);
router.route('/posts/home_timeline')
    .get(authController.isAuthenticated, postController.getHomeTimeline);

/*
 * ============================================================================
 * =                               COMMENTS                                   =
 * ============================================================================
 */

router.route('/comments/create')
    .post(authController.isAuthenticated, commentController.create);
router.route('/comments/edit/:comment_id')
    .put(authController.isAuthenticated, commentController.edit);
router.route('/comments/destroy/:comment_id')
    .post(authController.isAuthenticated, commentController.destroy);
router.route('/comments/show/:comment_id')
    .get(authController.setAuthentication, commentController.getById);

router.route('/comments/like/create/:comment_id')
    .post(authController.isAuthenticated, commentLikeController.likeComment);
router.route('/comments/like/destroy/:comment_id')
    .post(authController.isAuthenticated, commentLikeController.unlikeComment);

router.route('/comments/reply/:post_id')
    .get(authController.setAuthentication, commentController.getPostComments);

/*
 * ============================================================================
 * =                              FRIENDSHIPS                                 =
 * ============================================================================
 */

router.route('/friendships/create')
    .post(authController.isAuthenticated, friendshipController.create);
router.route('/friendships/destroy')
    .post(authController.isAuthenticated, friendshipController.destroy);
router.route('/followers/list')
    .get(friendshipController.getFollowersList);
router.route('/friends/list')
    .get(friendshipController.getFollowingList);

/*
 * ============================================================================
 * =                                  OTHER                                   =
 * ============================================================================
 */

router.route('/search')
    .get(searchController.search);

module.exports = router;