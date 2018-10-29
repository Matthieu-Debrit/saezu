'use strict';
const request = require('supertest');
const config = require('../config');
config.databaseUrl = config.databaseUrlTest;
const app = require('../app');
const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');
const db = require('../src/database');


const users = [
    {
        username: 'doraemon',
        password: 'nobita',
        name: 'Doraemon'
    },
    {
        username: 'totoro',
        password: 'chatbus',
        name: 'Totoro'
    }
];

// TODO: Seems to be a better way to clear the database
function clearDatabase() {
    const promises = [
        /* Clear database */
        db.query('DELETE FROM users'),
        // Cause deadlock. Cleared anyway if users table is wipe
        // db.query('DELETE FROM posts'),
        // db.query('DELETE FROM comments'),
        // db.query('DELETE FROM likes'),
        // db.query('DELETE FROM comment_likes'),
        // db.query('DELETE FROM friendships'),
        /* Zeroing all ids */
        db.query('ALTER SEQUENCE users_id_seq RESTART WITH 1;'),
        db.query('ALTER SEQUENCE posts_id_seq RESTART WITH 1;'),
        db.query('ALTER SEQUENCE comments_id_seq RESTART WITH 1;')
    ];
    return Promise.all(promises);
}

describe('Authentification and registration', function () {
    beforeEach(function (done) {
        clearDatabase()
            .then(() => {
                return User.create(users[0]);
            })
            .then(() => done())
            .catch(err => {
                console.error(err);
                done(err);
            });
    });
    it('Sign up new user', function (done) {
        request(app)
            .post('/users')
            .send(users[1])
            .expect(200)
            .end(done);
    });
    it('Sign up new user with already reserved username', function (done) {
        request(app)
            .post('/users')
            .send(users[0])
            .expect(400)
            .end(done);
    });
    it('Sign up new user no username', function (done) {
        request(app)
            .post('/users')
            .send({password: users[1].password, name: users[1].name})
            .expect(400)
            .end(done);
    });
    it('Sign up new user with username too short', function (done) {
        request(app)
            .post('/users')
            .send({username: 'a', password: users[1].password, name: users[1].name})
            .expect(400)
            .end(done);
    });
    it('Sign up new user with username too long', function (done) {
        request(app)
            .post('/users')
            .send({
                username: 'ausernamethatiswaytoolongandididntsaythatlithlyitisreallylongcallingshortwillbeablatentmistakestillitshardtocomeupwithideatofillthislongassstringitmustbereallylong',
                password: users[1].password, name: users[1].name
            })
            .expect(400)
            .end(done);
    });
    it('Sign up new user with forbidden characters 1', function (done) {
        request(app)
            .post('/users')
            .send({
                username: 'test user',
                password: users[1].password, name: users[1].name
            })
            .expect(400)
            .end(done);
    });
    it('Sign up new user with forbidden characters 2', function (done) {
        request(app)
            .post('/users')
            .send({
                username: 'test-user',
                password: users[1].password, name: users[1].name
            })
            .expect(400)
            .end(done);
    });
    it('Sign up new user with forbidden characters 3', function (done) {
        request(app)
            .post('/users')
            .send({
                username: 'français',
                password: users[1].password, name: users[1].name
            })
            .expect(400)
            .end(done);
    });
    it('Sign up with no password', function (done) {
        request(app)
            .post('/users')
            .send({username: users[1].username, name: users[1].name})
            .expect(400)
            .end(done);
    });
    it('Sign up with password too short', function (done) {
        request(app)
            .post('/users')
            .send({username: users[1].username, password: 'a', name: users[1].name})
            .expect(400)
            .end(done);
    });
    it('Sign up new user with password too long', function (done) {
        request(app)
            .post('/users')
            .send({
                username: users[1].username,
                password: 'whatdoyouwhattoachievewithalongasspasswordlikethattruesecurityyouwillonlyddosourserverstopthatpleasebeforesomeonegethurtAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                name: users[1].name
            })
            .expect(400)
            .end(done);
    });
    it('Sign up new user with no name', function (done) {
        request(app)
            .post('/users')
            .send({username: users[1].username, password: users[1].password})
            .expect(400)
            .end(done);
    });
    it('Sign up new user with name too short', function (done) {
        request(app)
            .post('/users')
            .send({username: users[1].username, password: users[1].password, name: ''})
            .expect(400)
            .end(done);
    });
    it('Sign up new user with name too long', function (done) {
        request(app)
            .post('/users')
            .send({
                username: users[1].username, password: users[1].password,
                name: 'mqfoimeqwidmfwqipdowqdpiqwdjqwjdwiqjdiqwdijqwdijpmpqwfoiuroakoiwdwajqoewfdjiqwfouqwodiuqjdwoqincnqvnoqwincoiqwjfdjiowqjfoiwjqpifjwoquhfwqoijfoqwiuhdokwqpoifjwiqjfoqwifpwjqfouqoimdxwqidqwomfdoiqwjfpowqfoiewfiuekferhufeoqfkjnfeqwjfoqiwdopqwdwpdaqwpdwqqwjpidiwqjdqwijdwqpidpqwijdjqiwdijwqdijqwpdjqwpidjqwipjdpqwijdpiqwjdpiqwjdpijqwdipqwjdpijwqdipwqpfjpqiwjdiewfnenvqounwjedhoijdqowjdouqwswhdeqqwsqwswiodheowswqsqdhewid'
            })
            .expect(400)
            .end(done);
    });
    it('Sign up new user with only whitespace character', function (done) {
        request(app)
            .post('/users')
            .send({username: users[1].username, password: users[1].password, name: '         '})
            .expect(400)
            .end(done);
    });
    it('Login user', function (done) {
        request(app)
            .post('/connect')
            .send({username: users[0].username, password: users[0].password})
            .expect(200)
            .end(done);
    });
    it('Login with unknown username', function (done) {
        request(app)
            .post('/connect')
            .send({username: 'UNKN0WN', password: users[0].password})
            .expect(404)
            .end(done);
    });
    it('Login with incorrect password', function (done) {
        request(app)
            .post('/connect')
            .send({username: users[0].username, password: 'B4DF00D'})
            .expect(404)
            .end(done);
    });
});

describe('User information', function (done) {
    let token, userId;
    before(function (done) {
        clearDatabase()
            .then(() => {
                return User.create(users[0]);
            })
            .then(user_id => {
                userId = user_id;
                return User.generateTokens(users[0].username, users[0].password);
            })
            .then(tkns => {
                token = tkns.id_token;
                done();
            })
            .catch(err => {
                console.error(err);
                done(err);
            });
    });
    it('Get user info without query parameters', function (done) {
        request(app)
            .get('/users/show')
            .expect(400)
            .end(done);
    });
    it('Get user info with id', function (done) {
        request(app)
            .get(`/users/show?user_id=${userId}`)
            .expect(200)
            .end(done);
    });
    it('Get user info with inexistant id', function (done) {
        request(app)
            .get('/users/show?user_id=1337')
            .expect(404)
            .end(done);
    });
    it('Get user info with invalid id', function (done) {
        request(app)
            .get('/users/show?user_id=invalid')
            .expect(400)
            .end(done);
    });
    it('Get user info with username', function (done) {
        request(app)
            .get(`/users/show?username=${users[0].username}`)
            .expect(200)
            .end(done);
    });
    it('Get user info with inexistant username', function (done) {
        request(app)
            .get(`/users/show?username=UNKNOWN`)
            .expect(404)
            .end(done);
    });
    it('Get own user info without authentication', function (done) {
        request(app)
            .get('/users/me')
            .expect(401)
            .end(done);
    });
    it('Get own user info', function (done) {
        request(app)
            .get('/users/me')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .end(done);
    });
});

describe('Post posts', function (done) {
    let token, userId;
    before(function (done) {
        clearDatabase()
            .then(() => {
                return User.create(users[0]);
            })
            .then(user_id => {
                userId = user_id;
                return User.generateTokens(users[0].username, users[0].password);
            })
            .then(tkns => {
                token = tkns.id_token;
                done();
            })
            .catch(err => {
                console.error(err);
                done(err);
            });
    });
    it('Post', function (done) {
        request(app)
            .post('/posts/create')
            .send({content: 'Ceci est un test'})
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .end(done);
    });
    it('Post without authentication', function (done) {
        request(app)
            .post('/posts/create')
            .send({content: 'Ceci est un test'})
            .expect(401)
            .end(done);
    });
    it('Post with no content', function (done) {
        request(app)
            .post('/posts/create')
            .set('Authorization', `Bearer ${token}`)
            .expect(400)
            .end(done);
    });
    it('Post empty', function (done) {
        request(app)
            .post('/posts/create')
            .send({content: ''})
            .set('Authorization', `Bearer ${token}`)
            .expect(400)
            .end(done);
    });
    it('Post with only whitespace characters', function (done) {
        request(app)
            .post('/posts/create')
            .send({content: '           '})
            .set('Authorization', `Bearer ${token}`)
            .expect(400)
            .end(done);
    });
});

describe('Get posts', function (done) {
    let token, postId;
    before(function (done) {
        clearDatabase()
            .then(() => {
                return User.create(users[0]);
            })
            .then(user_id => {
                return Promise.all([
                    User.generateTokens(users[0].username, users[0].password),
                    Post.create(user_id, 'Ceci est le contenu d\'un poste')
                ]);
            })
            .then(results => {
                token = results[0].id_token;
                postId = results[1];
                done();
            })
            .catch(err => {
                console.error(err);
                done(err);
            });
    });
    it('Get post', function (done) {
        request(app)
            .get(`/posts/show/${postId}`)
            .expect(200)
            .end(done);
    });
    it('Get inexistant post', function (done) {
        request(app)
            .get('/posts/show/1337')
            .expect(404)
            .end(done);
    });
});

describe('Edit posts', function (done) {
    let token, postId, notOwnerPostId;
    before(function (done) {
        clearDatabase()
            .then(() => {
                return Promise.all([
                    User.create(users[0]),
                    User.create(users[1])
                ]);
            })
            .then(user_ids => {
                return Promise.all([
                    User.generateTokens(users[0].username, users[0].password),
                    Post.create(user_ids[0], 'Ceci est le contenu d\'un poste'),
                    Post.create(user_ids[1], 'Ceci est le contenu d\'un autre poste')
                ]);
            })
            .then(results => {
                token = results[0].id_token;
                postId = results[1];
                notOwnerPostId = results[2];
                done();
            })
            .catch(err => {
                console.error(err);
                done(err);
            });
    });
    it('Edit post', function (done) {
        request(app)
            .put(`/posts/edit/${postId}`)
            .send({content: 'Ce post a été modifié'})
            .set('Authorization', `Bearer ${token}`)
            .expect(204)
            .end(done);
    });
    it('Edit inexistant post', function (done) {
        request(app)
            .put('/posts/edit/1337')
            .send({content: 'Ce post a été modifié'})
            .set('Authorization', `Bearer ${token}`)
            .expect(404)
            .end(done);
    });
    it('Edit post without ownership', function (done) {
        request(app)
            .put(`/posts/edit/${notOwnerPostId}`)
            .send({content: 'Si le post est modifié, alors ce test est raté'})
            .set('Authorization', `Bearer ${token}`)
            .expect(403)
            .end(done);
    });
});

describe('Delete posts', function (done) {
    let token, postId, notOwnerPostId;
    before(function (done) {
        clearDatabase()
            .then(() => {
                return Promise.all([
                    User.create(users[0]),
                    User.create(users[1])
                ]);
            })
            .then(user_ids => {
                return Promise.all([
                    User.generateTokens(users[0].username, users[0].password),
                    Post.create(user_ids[0], 'Ceci est le contenu d\'un poste'),
                    Post.create(user_ids[1], 'Ceci est le contenu d\'un autre poste')
                ]);
            })
            .then(results => {
                token = results[0].id_token;
                postId = results[1];
                notOwnerPostId = results[2];
                done();
            })
            .catch(err => {
                console.error(err);
                done(err);
            });
    });
    it('Delete post', function (done) {
        request(app)
            .post(`/posts/destroy/${postId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(204)
            .end(done);
    });
    it('Delete inexistant post', function (done) {
        request(app)
            .post('/posts/destroy/1337')
            .set('Authorization', `Bearer ${token}`)
            .expect(404)
            .end(done);
    });
    it('Delete post without ownership', function (done) {
        request(app)
            .post(`/posts/destroy/${notOwnerPostId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(403)
            .end(done);
    });
});

describe('Get timelines', function (done) {
    let token, userId, postId;
    before(function (done) {
        clearDatabase()
            .then(() => {
                return User.create(users[0]);
            })
            .then(user_id => {
                userId = user_id;
                return Promise.all([
                    User.generateTokens(users[0].username, users[0].password),
                    Post.create(user_id, 'Ceci est le contenu d\'un poste')
                ]);
            })
            .then(results => {
                token = results[0].id_token;
                postId = results[1];
                done();
            })
            .catch(err => {
                console.error(err);
                done(err);
            });
    });
    it('Get user timeline', function (done) {
        request(app)
            .get(`/posts/user_timeline?user_id=${userId}`)
            .expect(200)
            .end(done);
    });
    it('Get inexistant user timeline', function (done) {
        request(app)
            .get('/posts/user_timeline?user_id=1337')
            .expect(404)
            .end(done);
    });
    it('Get user timeline with no id', function (done) {
        request(app)
            .get('/posts/user_timeline')
            .expect(400)
            .end(done);
    });
    it('Get home timeline', function (done) {
        request(app)
            .get('/posts/home_timeline')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .end(done);
    });
    it('Get home timeline without authentication', function (done) {
        request(app)
            .get('/posts/home_timeline')
            .expect(401)
            .end(done);
    });
});

describe('Search', function (done) {
    let token;
    before(function (done) {
        clearDatabase()
            .then(() => {
                return User.create(users[0]);
            })
            .then(user_id => {
                return Promise.all([
                    User.generateTokens(users[0].username, users[0].password),
                    Post.create(user_id, 'Ceci est le contenu d\'un poste')
                ]);
            })
            .then(results => {
                token = results[0].id_token;
                done();
            })
            .catch(err => {
                console.error(err);
                done(err);
            });
    });
    it('Search', function (done) {
        request(app)
            .get('/search?q=dora')
            .expect(200)
            .end(done);
    });
    it('Search without query', function (done) {
        request(app)
            .get('/search')
            .expect(400)
            .end(done);
    });
});

describe('Friendships', function (done) {
    let token, userSourceId, userTargetId;
    before(function (done) {
        clearDatabase()
            .then(() => {
                return Promise.all([
                    User.create(users[0]),
                    User.create(users[1])
                ]);
            })
            .then(user_ids => {
                userSourceId = user_ids[0];
                userTargetId = user_ids[1];
                return User.generateTokens(users[0].username, users[0].password);
            })
            .then(tkns => {
                token = tkns.id_token;
                done();
            })
            .catch(err => {
                console.error(err);
                done(err);
            });
    });
    it('Follow user by id', function (done) {
        request(app)
            .post(`/friendships/create?user_id=${userTargetId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .end(done);
    });
    it('Follow user by username', function (done) {
        request(app)
            .post(`/friendships/create?username=${users[1].username}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .end(done);
    });
    it('Follow without id', function (done) {
        request(app)
            .post('/friendships/create')
            .set('Authorization', `Bearer ${token}`)
            .expect(400)
            .end(done);
    });
    it('Follow self', function (done) {
        request(app)
            .post(`/friendships/create?user_id=${userSourceId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(400)
            .end(done);
    });
    it('Follow without authentication', function (done) {
        request(app)
            .post(`/friendships/create?user_id=${userTargetId}`)
            .expect(401)
            .end(done);
    });
    it('Unfollow user by id', function (done) {
        request(app)
            .post(`/friendships/destroy?user_id=${userTargetId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .end(done);
    });
    it('Unfollow user by username', function (done) {
        request(app)
            .post(`/friendships/destroy?username=${users[1].username}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .end(done);
    });
    it('Unfollow without id', function (done) {
        request(app)
            .post('/friendships/destroy')
            .set('Authorization', `Bearer ${token}`)
            .expect(400)
            .end(done);
    });
    it('Unfollow self', function (done) {
        request(app)
            .post(`/friendships/destroy?user_id=${userSourceId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(400)
            .end(done);
    });
    it('Unfollow without authentication', function (done) {
        request(app)
            .post(`/friendships/destroy?user_id=${userSourceId}`)
            .expect(401)
            .end(done);
    });
    it('Get followers list with id', function (done) {
        request(app)
            .get(`/followers/list?user_id=${userSourceId}`)
            .expect(200)
            .end(done);
    });
    it('Get followers list with username', function (done) {
        request(app)
            .get(`/followers/list?username=${users[0].username}`)
            .expect(200)
            .end(done);
    });
    it('Get followers list with unknown id', function (done) {
        request(app)
            .get('/followers/list?user_id=1337')
            .expect(404)
            .end(done);
    });
    it('Get followers list without id', function (done) {
        request(app)
            .get('/followers/list')
            .expect(400)
            .end(done);
    });
    it('Get following list with id', function (done) {
        request(app)
            .get(`/friends/list?user_id=${userSourceId}`)
            .expect(200)
            .end(done);
    });
    it('Get following list with username', function (done) {
        request(app)
            .get(`/friends/list?user_id=${userSourceId}`)
            .expect(200)
            .end(done);
    });
    it('Get following list with unknown id', function (done) {
        request(app)
            .get('/friends/list?user_id=1337')
            .expect(404)
            .end(done);
    });
    it('Get following list without id', function (done) {
        request(app)
            .get('/friends/list')
            .expect(400)
            .end(done);
    });
});

describe('Likes', function (done) {
    let token, postId;
    before(function (done) {
        clearDatabase()
            .then(() => {
                return User.create(users[0]);
            })
            .then(user_id => {
                return Promise.all([
                    User.generateTokens(users[0].username, users[0].password),
                    Post.create(user_id, 'Ceci est le contenu d\'un poste')
                ]);
            })
            .then(results => {
                token = results[0].id_token;
                postId = results[1];
                done();
            })
            .catch(err => {
                console.error(err);
                done(err);
            });
    });
    it('Like post', function (done) {
        request(app)
            .post(`/posts/like/create/${postId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .end(done);
    });
    it('Like without authentication', function (done) {
        request(app)
            .post(`/posts/like/create/${postId}`)
            .expect(401)
            .end(done);
    });
    it('Unlike post', function (done) {
        request(app)
            .post(`/posts/like/destroy/${postId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .end(done);
    });
    it('Unlike without authentication', function (done) {
        request(app)
            .post(`/posts/like/destroy/${postId}`)
            .expect(401)
            .end(done);
    });
});

describe('Post comments', function (done) {
    let token, postId;
    before(function (done) {
        clearDatabase()
            .then(() => User.create(users[0]))
            .then(user_id => Promise.all([
                User.generateTokens(users[0].username, users[0].password),
                Post.create(user_id, 'Ceci est le contenu d\'un poste')
            ]))
            .then(results => {
                token = results[0].id_token;
                postId = results[1];
                done();
            })
            .catch(err => {
                console.error(err);
                done(err);
            });
    });
    it('Comment', function (done) {
        request(app)
            .post(`/comments/create?in_reply_to=${postId}`)
            .send({content: 'Ceci est un commentaire de test'})
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .end(done);
    });
    it('Comment without post id', function (done) {
        request(app)
            .post('/comments/create')
            .send({content: 'Ceci est un commentaire de test'})
            .set('Authorization', `Bearer ${token}`)
            .expect(400)
            .end(done);
    });
    it('Comment with inexistant post id', function (done) {
        request(app)
            .post('/comments/create?in_reply_to=1337')
            .send({content: 'Ceci est un commentaire de test'})
            .set('Authorization', `Bearer ${token}`)
            .expect(404)
            .end(done);
    });
    it('Comment without authentication', function (done) {
        request(app)
            .post(`/comments/create?in_reply_to=${postId}`)
            .send({content: 'Ceci est un test'})
            .expect(401)
            .end(done);
    });
    it('Comment with no content', function (done) {
        request(app)
            .post(`/comments/create?in_reply_to=${postId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(400)
            .end(done);
    });
    it('Comment empty', function (done) {
        request(app)
            .post(`/comments/create?in_reply_to=${postId}`)
            .send({content: ''})
            .set('Authorization', `Bearer ${token}`)
            .expect(400)
            .end(done);
    });
    it('Comment with only whitespace characters', function (done) {
        request(app)
            .post(`/comments/create?in_reply_to=${postId}`)
            .send({content: '           '})
            .set('Authorization', `Bearer ${token}`)
            .expect(400)
            .end(done);
    });
});

describe('Get comments', function (done) {
    let token, userId, commentId;
    before(function (done) {
        clearDatabase()
            .then(() => User.create(users[0]))
            .then(user_id => {
                userId = user_id;
                return Promise.all([
                    User.generateTokens(users[0].username, users[0].password),
                    Post.create(user_id, 'Ceci est le contenu d\'un poste')
                ]);
            })
            .then(results => {
                token = results[0].id_token;
                return Comment.create(userId, 'Ceci est le contenu d\'un commentaire', results[1]);
            })
            .then(comment_id => {
                commentId = comment_id;
                done();
            })
            .catch(err => {
                console.error(err);
                done(err);
            });
    });
    it('Get comment', function (done) {
        request(app)
            .get(`/comments/show/${commentId}`)
            .expect(200)
            .end(done);
    });
    it('Get inexistant comment', function (done) {
        request(app)
            .get('/comments/show/1337')
            .expect(404)
            .end(done);
    });
});

describe('Edit comments', function (done) {
    let token, userIds, commentId, notOwnerCommentId;
    before(function (done) {
        clearDatabase()
            .then(() => Promise.all([User.create(users[0]), User.create(users[1])]))
            .then(user_ids => {
                userIds = user_ids;
                return Promise.all([
                    User.generateTokens(users[0].username, users[0].password),
                    Post.create(userIds[0], 'Ceci est le contenu d\'un poste')
                ]);
            })
            .then(results => {
                token = results[0].id_token;
                return Promise.all([
                    Comment.create(userIds[0], 'Ceci est le contenu d\'un commentaire', results[1]),
                    Comment.create(userIds[1], 'Ceci est le contenu d\'un autre commentaire', results[1])
                ]);
            })
            .then(comment_ids => {
                commentId = comment_ids[0];
                notOwnerCommentId = comment_ids[1];
                done();
            })
            .catch(err => {
                console.error(err);
                done(err);
            });
    });
    it('Edit comment', function (done) {
        request(app)
            .put(`/comments/edit/${commentId}`)
            .send({content: 'Ce commentaire a été modifié'})
            .set('Authorization', `Bearer ${token}`)
            .expect(204)
            .end(done);
    });
    it('Edit inexistant comment', function (done) {
        request(app)
            .put('/comments/edit/1337')
            .send({content: 'Ce commentaire a été modifié'})
            .set('Authorization', `Bearer ${token}`)
            .expect(404)
            .end(done);
    });
    it('Edit comment without ownership', function (done) {
        request(app)
            .put(`/comments/edit/${notOwnerCommentId}`)
            .send({content: 'Si le commentaire est modifié, alors ce test est raté'})
            .set('Authorization', `Bearer ${token}`)
            .expect(403)
            .end(done);
    });
});

describe('Delete comments', function (done) {
    let token, userIds, commentId, notOwnerCommentId;
    before(function (done) {
        clearDatabase()
            .then(() => Promise.all([User.create(users[0]), User.create(users[1])]))
            .then(user_ids => {
                userIds = user_ids;
                return Promise.all([
                    User.generateTokens(users[0].username, users[0].password),
                    Post.create(userIds[0], 'Ceci est le contenu d\'un poste')
                ]);
            })
            .then(results => {
                token = results[0].id_token;
                return Promise.all([
                    Comment.create(userIds[0], 'Ceci est le contenu d\'un commentaire', results[1]),
                    Comment.create(userIds[1], 'Ceci est le contenu d\'un autre commentaire', results[1])
                ]);
            })
            .then(comment_ids => {
                commentId = comment_ids[0];
                notOwnerCommentId = comment_ids[1];
                done();
            })
            .catch(err => {
                console.error(err);
                done(err);
            });
    });
    it('Delete comment', function (done) {
        request(app)
            .post(`/comments/destroy/${commentId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(204)
            .end(done);
    });
    it('Delete inexistant comment', function (done) {
        request(app)
            .post('/comments/destroy/1337')
            .set('Authorization', `Bearer ${token}`)
            .expect(404)
            .end(done);
    });
    it('Delete comment without ownership', function (done) {
        request(app)
            .post(`/comments/destroy/${notOwnerCommentId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(403)
            .end(done);
    });
});

describe('Get post comments', function (done) {
    let token, userIds, postId;
    before(function (done) {
        clearDatabase()
            .then(() => Promise.all([User.create(users[0]), User.create(users[1])]))
            .then(user_ids => {
                userIds = user_ids;
                return Promise.all([
                    User.generateTokens(users[0].username, users[0].password),
                    Post.create(userIds[0], 'Ceci est le contenu d\'un poste')
                ]);
            })
            .then(results => {
                token = results[0].id_token;
                postId = results[1];
                return Promise.all([
                    Comment.create(userIds[0], 'Ceci est le contenu d\'un commentaire', postId),
                    Comment.create(userIds[1], 'Ceci est le contenu d\'un autre commentaire', postId)
                ]);
            })
            .then(() => done())
            .catch(err => {
                console.error(err);
                done(err);
            });
    });
    it('Get comments', function (done) {
        request(app)
            .get(`/comments/reply/${postId}`)
            .expect(200)
            .end(done);
    });
});

describe('Comment likes', function (done) {
    let token, userId, commentId;
    before(function (done) {
        clearDatabase()
            .then(() => User.create(users[0]))
            .then(user_id => {
                userId = user_id;
                return Promise.all([
                    User.generateTokens(users[0].username, users[0].password),
                    Post.create(user_id, 'Ceci est le contenu d\'un poste')
                ]);
            })
            .then(results => {
                token = results[0].id_token;
                return Comment.create(userId, 'Ceci est le contenu d\'un commentaire', results[1]);
            })
            .then(comment_id => {
                commentId = comment_id;
                done();
            })
            .catch(err => {
                console.error(err);
                done(err);
            });
    });
    it('Like comment', function (done) {
        request(app)
            .post(`/comments/like/create/${commentId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .end(done);
    });
    it('Like comment without authentication', function (done) {
        request(app)
            .post(`/comments/like/create/${commentId}`)
            .expect(401)
            .end(done);
    });
    it('Unlike comment', function (done) {
        request(app)
            .post(`/comments/like/destroy/${commentId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .end(done);
    });
    it('Unlike comment without authentication', function (done) {
        request(app)
            .post(`/comments/like/destroy/${commentId}`)
            .expect(401)
            .end(done);
    });
});
