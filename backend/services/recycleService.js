const db = require('../db/db');

const recycleService = {
  // Atık türlerini getir
  async getAtikTurleri() {
    const query = 'SELECT * FROM AtikTurleri';
    try {
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      throw new Error('Atık türleri veritabanından getirilemedi');
    }
  },

  // Toplam geri dönüşüm miktarını getir
  async getToplamMiktar() {
    const query = `
      SELECT COALESCE(SUM(Miktar), 0) as ToplamMiktar
      FROM Materyal
    `;
    try {
      const result = await db.query(query);
      return result.rows[0].toplammiktar;
    } catch (error) {
      throw new Error('Toplam miktar veritabanından getirilemedi');
    }
  },

  // Yeni materyal ekle
  async addMateryal(materyalData) {
    const { kullaniciId, atikTuruId, atikDetay, miktar, lokasyon } = materyalData;
    console.log('Gelen materyal verisi:', materyalData);
    
    const query = `
      INSERT INTO Materyal (KullaniciID, AtikTuruID, AtikDetay, Miktar, Lokasyon)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    try {
      console.log('SQL Query:', query);
      console.log('Query parametreleri:', [kullaniciId, atikTuruId, atikDetay, miktar, lokasyon]);
      
      const result = await db.query(query, [kullaniciId, atikTuruId, atikDetay, miktar, lokasyon]);
      console.log('Veritabanı cevabı:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('Veritabanı hatası:', error);
      throw new Error(`Materyal eklenirken hata oluştu: ${error.message}`);
    }
  },

  // Kullanıcının materyallerini getir
  async getUserMateryaller(kullaniciId) {
    const query = `
      SELECT m.*, at.Adi as AtikTuruAdi
      FROM Materyal m
      JOIN AtikTurleri at ON m.AtikTuruID = at.AtikTuruID
      WHERE m.KullaniciID = $1
      ORDER BY m.Tarih DESC
    `;
    try {
      const result = await db.query(query, [kullaniciId]);
      return result.rows;
    } catch (error) {
      throw new Error('Kullanıcının atık materyalleri veritabanından getirilemedi');
    }
  },

  // Geri dönüşüm işlemi ekle
  async addGeriDonusumIslemi(islemData) {
    const { materyalId, yeniUrun, islemNotu } = islemData;
    const query = `
      INSERT INTO GeriDonusumIslemleri (MateryalID, YeniUrun, IslemNotu)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    try {
      const result = await db.query(query, [materyalId, yeniUrun, islemNotu]);
      return result.rows[0];
    } catch (error) {
      throw new Error('Geri dönüşüm işlemi veritabanına eklenemedi');
    }
  },

  // Kullanıcının geri dönüşüm işlemlerini getir
  async getUserGeriDonusumIslemleri(kullaniciId) {
    const query = `
      SELECT gi.*, m.Miktar, at.Adi as AtikTuruAdi
      FROM GeriDonusumIslemleri gi
      JOIN Materyal m ON gi.MateryalID = m.MateryalID
      JOIN AtikTurleri at ON m.AtikTuruID = at.AtikTuruID
      WHERE m.KullaniciID = $1
      ORDER BY gi.GeriDonusumTarihi DESC
    `;
    try {
      const result = await db.query(query, [kullaniciId]);
      return result.rows;
    } catch (error) {
      throw new Error('Kullanıcının geri dönüşüm işlemleri veritabanından getirilemedi');
    }
  },

  // Materyal sil
  async deleteMateryal(materyalId) {
    const query = 'DELETE FROM Materyal WHERE MateryalID = $1 RETURNING *';
    try {
      const result = await db.query(query, [materyalId]);
      if (result.rows.length === 0) {
        throw new Error('Materyal bulunamadı');
      }
      return result.rows[0];
    } catch (error) {
      throw new Error(`Materyal silinirken hata oluştu: ${error.message}`);
    }
  }
};

module.exports = recycleService; 