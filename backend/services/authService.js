const bcrypt = require('bcrypt');
const db = require('../db/db');

const register = async (userData) => {
  const { ad, soyad, eposta, sifre } = userData;

  // E-posta kontrolü
  const existingUser = await db.query(
    'SELECT * FROM Kullanici WHERE Eposta = $1',
    [eposta]
  );

  if (existingUser.rows.length > 0) {
    throw new Error('Bu e-posta adresi zaten kullanımda');
  }

  // Şifreyi hashle
  const hashedPassword = await bcrypt.hash(sifre, 10);

  // Kullanıcıyı kaydet
  const result = await db.query(
    'INSERT INTO Kullanici (Ad, Soyad, Eposta, Sifre) VALUES ($1, $2, $3, $4) RETURNING KullaniciID as kullaniciid, Ad as ad, Soyad as soyad, Eposta as eposta',
    [ad, soyad, eposta, hashedPassword]
  );

  return result.rows[0];
};

const login = async (userData) => {
  const { eposta, sifre } = userData;

  // Kullanıcıyı bul
  const result = await db.query(
    'SELECT KullaniciID as kullaniciid, Ad as ad, Soyad as soyad, Eposta as eposta, Sifre as sifre FROM Kullanici WHERE Eposta = $1',
    [eposta]
  );

  if (result.rows.length === 0) {
    throw new Error('E-posta veya şifre hatalı');
  }

  const user = result.rows[0];

  // Şifreyi kontrol et
  const isValid = await bcrypt.compare(sifre, user.sifre);

  if (!isValid) {
    throw new Error('E-posta veya şifre hatalı');
  }

  // Şifreyi çıkart ve kullanıcı bilgilerini döndür
  const { sifre: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

module.exports = {
  register,
  login
}; 