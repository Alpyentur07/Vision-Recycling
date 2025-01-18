const express = require('express');
const cors = require('cors');
const authService = require('./services/authService');
const db = require('./db/db');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

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

// Materyal routes
app.post('/api/materyal/create', async (req, res) => {
  try {
    const { kullaniciId, atikTuruId, atikDetay, miktar, lokasyon } = req.body;

    // Kullanıcı kontrolü
    const userExists = await db.query(
      'SELECT * FROM Kullanici WHERE KullaniciID = $1',
      [kullaniciId]
    );

    if (userExists.rows.length === 0) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Atık türü kontrolü
    const wasteTypeExists = await db.query(
      'SELECT * FROM AtikTurleri WHERE AtikTuruID = $1',
      [atikTuruId]
    );

    if (wasteTypeExists.rows.length === 0) {
      return res.status(404).json({ message: 'Geçersiz atık türü' });
    }

    // Materyal oluştur
    const result = await db.query(
      'INSERT INTO Materyal (KullaniciID, AtikTuruID, AtikDetay, Miktar, Lokasyon) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [kullaniciId, atikTuruId, atikDetay, miktar, lokasyon]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Materyal oluşturma hatası:', error);
    res.status(500).json({ message: 'Materyal oluşturulurken bir hata oluştu' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Bir hata oluştu!' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 