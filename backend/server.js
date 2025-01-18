const express = require('express');
const cors = require('cors');
const path = require('path');
const materyal = require('./routes/materyal');
const model = require('./routes/model');
const authService = require('./services/authService');
const db = require('./db/db');

const app = express();
const port = 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Debug middleware - tüm istekleri logla
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  if (req.method === 'POST') {
    console.log('Request body:', req.body);
  }
  next();
});

// Uploads klasörünü oluştur
const uploadsDir = path.join(__dirname, 'uploads');
if (!require('fs').existsSync(uploadsDir)) {
  require('fs').mkdirSync(uploadsDir, { recursive: true });
}

// Statik dosya servisi
app.use('/uploads', express.static(uploadsDir));

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const user = await authService.register(req.body);
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

// Routes
app.use('/api/materyal', materyal);
app.use('/api/model', model);

// Test veritabanı bağlantısı
app.get('/test-db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({ message: 'Veritabanı bağlantısı başarılı', timestamp: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ message: 'Veritabanı bağlantı hatası', error: error.message });
  }
});

// Hata yakalama middleware'i
app.use((err, req, res, next) => {
  console.error('Hata detayı:', err);
  res.status(500).json({ 
    message: 'Sunucu hatası oluştu',
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(port, () => {
  console.log(`Server ${port} portunda çalışıyor`);
}); 