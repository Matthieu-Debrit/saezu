'use strict';
const config = require('../config');
const bcrypt = require('bcryptjs');
const db = require('../src/database');
const jwt = require('jsonwebtoken');
const {wrapError} = require('../src/helpers');
const RequestError = require('../src/RequestError');
const {checkRules, usernameRules, nameRules, passwordRules} = require('../../common/inputRules');
const SALT_ROUNDS = 12;


const Queries = {
    existsUser: (user_id = '$1') => `EXISTS(SELECT 1 FROM users WHERE id=$1)`,
    insertUser: (username = '$1', password = '$2', name = '$3') => `INSERT INTO users VALUES(DEFAULT, ${username}, ${password}, ${name}) RETURNING id`,
    deleteUser: () => 'DELETE FROM users WHERE id = $1',
    selectUserById: (columns = '*', user_id = '$1') => `SELECT ${columns} FROM users WHERE users.id = ${user_id} LIMIT 1`,
    selectUserByUsername: (columns = '*', username = '$1') => `SELECT ${columns} FROM users WHERE LOWER(users.username) = LOWER(${username}) LIMIT 1`,
    updateUser: (params, user_id = '$1') => `UPDATE users SET ${params} WHERE id=${user_id}`,
    selectSearchUser: (columns = '*', query = '$1') => `SELECT ${columns} FROM users WHERE (username ILIKE ${query} OR name ILIKE ${query})`
};
exports.queries = Queries;

exports.create = function (user) {
    try {
        let error;
        // Assignment in the followings conditions are deliberate
        if (error = checkRules(user.username, usernameRules)) {
            return Promise.reject(new RequestError(400, `Username: ${error}`));
        }
        if (error = checkRules(user.name, nameRules)) {
            return Promise.reject(new RequestError(400, `Name: ${error}`));
        }
        if (error = checkRules(user.password, passwordRules)) {
            return Promise.reject(new RequestError(400, `Password: ${error}`));
        }
        // End
    } catch (e) {
        return Promise.reject(e);
    }
    return bcrypt.genSalt(SALT_ROUNDS)
        .then(salt => bcrypt.hash(user.password, salt))
        .then(hash => db.query(Queries.insertUser(), [user.username, hash, user.name.trim()]))
        .then(result => result.rows[0].id)
        .catch(error => {
            if (error.code === '23505' && error.constraint === 'users_username_key') {
                throw new RequestError(400, 'Username already in use');
            } else {
                wrapError(error);
            }
        });
};

function verifyPassword(username, password) {
    let user;

    return db.query(Queries.selectUserByUsername(), [username])
        .then(result => {
            user = result.rows[0];
            if (!user) {
                throw new RequestError(404, 'The username or password don\'t match');
            }
            return bcrypt.compare(password, user.password);
        })
        .then(isCorrect => {
            if (isCorrect) {
                return Promise.resolve(user);
            } else {
                throw new RequestError(404, 'The username or password don\'t match');
            }
        })
        .catch(wrapError);
}

function createIdToken(user) {
    return jwt.sign({
            id: user.id,
            username: user.username,
            name: user.name,
            birthday: user.birthday,
            profile_image_url: user.profile_image_url,
            created_at: user.created_at
        },
        config.secretJwt,
        {
            algorithm: 'HS256',
            expiresIn: 86400, // 24 hours
            audience: config.audience,
            issuer: config.issuer,
            jwtid: genJti()
        });
}

function genJti() {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let jti = '';
    for (let i = 0; i < 16; i++) {
        jti += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return jti;
}

exports.generateTokens = function (username, password) {
    if (!username) {
        return Promise.reject(new RequestError(400, 'Needs username'));
    }
    if (!password) {
        return Promise.reject(new RequestError(400, 'Needs password'));
    }
    username = username.trim();

    return verifyPassword(username, password)
        .then(user => {
            return {id_token: createIdToken(user)};
        })
        .catch(wrapError);
};

exports.getById = function (id, columns) {
    const columnsString = columns ? columns.join(', ') : '*';
    return db.query(Queries.selectUserById(columnsString), [id])
        .then(result => {
            const user = result.rows[0];
            if (!user) {
                throw new RequestError(404, 'No user correspond to this parameters');
            }
            delete user.password; // Never give password
            return user;
        })
        .catch(wrapError);
};

exports.getByUsername = function (username, columns) {
    username = username.trim();
    const columnsString = columns ? columns.join(', ') : '*';
    return db.query(Queries.selectUserByUsername(columnsString), [username])
        .then(result => {
            const user = result.rows[0];
            if (!user) {
                throw new RequestError(404, 'No user correspond to this parameters');
            }
            delete user.password; // Never give password
            return user;
        })
        .catch(wrapError);
};

exports.update = function (id, data) {
    const newData = {
        username: data.username,
        password: data.password,
        name: data.name.trim(),
        birthday: data.birthday
    };
    let error;
    // Assignment in the followings conditions are deliberate
    if (newData.username && (error = checkRules(newData.username, usernameRules))) {
        return Promise.reject(new RequestError(400, `Username: ${error}`));
    }
    if (newData.name) {
        if (error = checkRules(newData.name, nameRules)) {
            return Promise.reject(new RequestError(400, `Name: ${error}`));
        }
        newData.name = newData.name;
    }
    if (newData.password) {
        if (error = checkRules(newData.password, passwordRules)) {
            return Promise.reject(new RequestError(400, `Password: ${error}`));
        }
        const salt = bcrypt.genSaltSync(SALT_ROUNDS);
        newData.password = bcrypt.hashSync(newData.password, salt);
    }
    // End

    const params = [];
    const values = [id];
    let offset = 2;
    for (let key in newData) {
        if (newData.hasOwnProperty(key) && newData[key]) {
            params.push(`${key}=\$${offset++}`);
            values.push(newData[key]);
        }
    }
    if (params.length > 0) {
        return db.query(Queries.updateUser(params.join(', ')), values)
            .catch(wrapError);
    } else {
        return Promise.resolve();
    }
};

function deleteUser(id) {
    return db.query(Queries.deleteUser(), [id])
        .then(result => result.rowCount > 0)
        .catch(wrapError);
};
exports.delete = deleteUser;
/*
exports.secureDelete = function (username, password) {
  return verifyPassword(username, password)
      .then(() => deleteUser)
      .catch(wrapError);
};
*/
exports.search = function (query, columns) {
    query = `%${query}%`;
    const columnsString = columns ? columns.join(', ') : '*';
    return db.query(Queries.selectSearchUser(columnsString), [query])
        .then(result => {
            for (let user of result.rows) {
                delete user.password; // Never give password
            }
            return result.rows;
        })
        .catch(wrapError);
};