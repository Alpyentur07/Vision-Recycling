const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

// Uploads klasörünü kontrol et ve oluştur
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Görüntü upload ayarları
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function(req, file, cb) {
    cb(null, 'image-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Sınıflandırma endpoint'i
router.post('/classify', upload.single('image'), (req, res) => {
  console.log('Sınıflandırma isteği alındı');
  console.log('Dosya bilgileri:', req.file);
  
  if (!req.file) {
    console.log('Dosya yok');
    return res.status(400).json({ message: 'Görüntü yüklenmedi' });
  }

  console.log('Dosya yolu:', req.file.path);

  const pythonProcess = spawn('python', [
    path.join(__dirname, '../model/predict.py'),
    req.file.path
  ]);

  let result = '';
  let error = '';

  pythonProcess.stdout.on('data', (data) => {
    console.log('Python çıktısı:', data.toString());
    result += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error('Python hatası:', data.toString());
    error += data.toString();
  });

  pythonProcess.on('close', (code) => {
    console.log('Python process kapandı, kod:', code);
    
    // Geçici dosyayı sil
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Dosya silinirken hata:', err);
    });

    try {
      if (code !== 0) {
        console.error('Model hatası:', error);
        return res.status(500).json({
          success: false,
          message: 'Model çalıştırma hatası',
          error: error
        });
      }

      // JSON çıktısını bul
      const jsonMatch = result.match(/\{.*\}/);
      if (!jsonMatch) {
        throw new Error('JSON çıktısı bulunamadı');
      }

      const prediction = JSON.parse(jsonMatch[0]);
      console.log('Tahmin sonucu:', prediction);

      // Tüm gerekli alanların var olduğundan emin ol
      if (!prediction.class || !prediction.confidence || !prediction.all_probabilities) {
        throw new Error('Eksik tahmin bilgisi');
      }

      res.json({
        success: true,
        class: prediction.class,
        confidence: prediction.confidence,
        all_probabilities: prediction.all_probabilities
      });
    } catch (error) {
      console.error('İşleme hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Sınıflandırma hatası',
        error: error.message
      });
    }
  });
});

module.exports = router; 