const { Pool } = require('pg');

const dbPool = new Pool({
  database: 'personal_web',
  port: 8000,
  user: 'postgres',
  password: 'admin',
});

module.exports = dbPool;
