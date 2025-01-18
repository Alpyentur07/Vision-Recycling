const express = require('express');
const router = express.Router();
const recycleService = require('../services/recycleService');
const db = require('../db/db');

// Kullanıcının materyallerini getir
router.get('/user/:kullaniciId', async (req, res) => {
  try {
    const { kullaniciId } = req.params;

    // Kullanıcı kontrolü
    const userExists = await db.query(
      'SELECT * FROM Kullanici WHERE KullaniciID = $1',
      [kullaniciId]
    );

    if (userExists.rows.length === 0) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Kullanıcının materyallerini getir
    const query = `
      SELECT 
        m.*,
        at.Adi as atikturuadi
      FROM Materyal m
      JOIN AtikTurleri at ON m.AtikTuruID = at.AtikTuruID
      WHERE m.KullaniciID = $1
      ORDER BY m.Tarih DESC
    `;

    const result = await db.query(query, [kullaniciId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Materyal getirme hatası:', error);
    res.status(500).json({ 
      message: 'Materyaller getirilirken bir hata oluştu',
      error: error.message 
    });
  }
});

// Toplam miktarı getir
router.get('/toplam-miktar', async (req, res) => {
  try {
    const toplamMiktar = await recycleService.getToplamMiktar();
    res.json({ toplamMiktar });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Atık türlerini getir
router.get('/atik-turleri', async (req, res) => {
  try {
    const atikTurleri = await recycleService.getAtikTurleri();
    res.json(atikTurleri);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Yeni materyal oluştur
router.post('/create', async (req, res) => {
  try {
    const { kullaniciId, atikTuruId, atikDetay, miktar, lokasyon } = req.body;
    console.log('Gelen istek verisi:', req.body);

    // Gerekli alanların kontrolü
    if (!kullaniciId || !atikTuruId || !miktar || !lokasyon) {
      console.log('Eksik alanlar:', { kullaniciId, atikTuruId, miktar, lokasyon });
      return res.status(400).json({ message: 'Tüm alanları doldurunuz' });
    }

    // Değerlerin tiplerini kontrol et
    if (isNaN(parseInt(kullaniciId)) || isNaN(parseInt(atikTuruId)) || isNaN(parseFloat(miktar))) {
      console.log('Geçersiz veri tipleri:', { kullaniciId, atikTuruId, miktar });
      return res.status(400).json({ message: 'Geçersiz veri tipleri' });
    }

    const materyal = await recycleService.addMateryal({
      kullaniciId: parseInt(kullaniciId),
      atikTuruId: parseInt(atikTuruId),
      atikDetay,
      miktar: parseFloat(miktar),
      lokasyon
    });

    console.log('Oluşturulan materyal:', materyal);
    res.status(201).json(materyal);
  } catch (error) {
    console.error('Materyal oluşturma hatası:', error);
    res.status(500).json({ 
      message: 'Materyal oluşturulurken bir hata oluştu',
      error: error.message 
    });
  }
});

// Materyal silme endpoint'i - En sona taşındı
router.delete('/delete/:materyalid', async (req, res) => {
  try {
    const { materyalid } = req.params;
    console.log('Silme isteği alındı. Materyal ID:', materyalid);

    // Önce materyalin var olup olmadığını kontrol et
    const checkQuery = 'SELECT * FROM Materyal WHERE MateryalID = $1';
    const checkResult = await db.query(checkQuery, [materyalid]);
    console.log('Materyal kontrol sonucu:', checkResult.rows);

    if (checkResult.rows.length === 0) {
      console.log('Materyal bulunamadı');
      return res.status(404).json({ message: 'Materyal bulunamadı' });
    }

    // Materyali sil
    const deleteQuery = 'DELETE FROM Materyal WHERE MateryalID = $1 RETURNING *';
    const deleteResult = await db.query(deleteQuery, [materyalid]);
    console.log('Silme işlemi sonucu:', deleteResult.rows[0]);

    res.json({ 
      message: 'Materyal başarıyla silindi', 
      materyal: deleteResult.rows[0] 
    });
  } catch (error) {
    console.error('Materyal silme hatası detayı:', error);
    res.status(500).json({ 
      message: 'Materyal silinirken bir hata oluştu',
      error: error.message 
    });
  }
});

module.exports = router; 