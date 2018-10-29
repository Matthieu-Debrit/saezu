'use strict';
const config = require('../config');
const {Pool} = require('pg');


const pool = new Pool({
    connectionString: config.databaseUrl,
    statement_timeout: 10000,
    connectionTimeoutMillis: 10000
});

pool.on('error', (err) => {
    console.error(`PostgreSQL client pool error: ${err}`);
});

module.exports = pool;