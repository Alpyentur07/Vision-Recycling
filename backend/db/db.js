const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'vision_recycling',
  password: '123',
  port: 5432,
});

// Test veritabanı bağlantısı
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Veritabanı bağlantı hatası:', err);
  } else {
    console.log('Veritabanı bağlantısı başarılı');
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
}; 