const { Pool } = require('pg');
const { db } = require('./env');

const pool = new Pool({
  host: db.host,
  port: db.port,
  database: db.database,
  user: db.user,
  password: db.password,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};