const { Pool } = require('pg');

// Ana veritabanına bağlan
const mainPool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: '123',
  port: 5432,
});

async function setupDatabase() {
  try {
    // Önce mevcut bağlantıları kapat
    const dropConnections = `
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = 'vision_recycling'
      AND pid <> pg_backend_pid();
    `;
    await mainPool.query(dropConnections);

    // Veritabanını sil (eğer varsa)
    await mainPool.query('DROP DATABASE IF EXISTS vision_recycling');

    // Veritabanını oluştur
    await mainPool.query('CREATE DATABASE vision_recycling');
    console.log('Veritabanı oluşturuldu');

    // Yeni veritabanına bağlan
    const db = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'vision_recycling',
      password: '123',
      port: 5432,
    });

    // Kullanıcı tablosunu oluştur
    await db.query(`
      CREATE TABLE Kullanici (
        KullaniciID SERIAL PRIMARY KEY,
        Ad VARCHAR(50) NOT NULL,
        Soyad VARCHAR(50) NOT NULL,
        Eposta VARCHAR(100) NOT NULL UNIQUE,
        Sifre VARCHAR(100) NOT NULL,
        KayitTarihi TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Kullanıcı tablosu oluşturuldu');

    // Atık türleri tablosunu oluştur
    await db.query(`
      CREATE TABLE AtikTurleri (
        AtikTuruID SERIAL PRIMARY KEY,
        Adi VARCHAR(50) NOT NULL,
        Aciklama TEXT
      );
    `);
    console.log('Atık türleri tablosu oluşturuldu');

    // Materyal tablosunu oluştur
    await db.query(`
      CREATE TABLE Materyal (
        MateryalID SERIAL PRIMARY KEY,
        KullaniciID INTEGER NOT NULL,
        AtikTuruID INTEGER NOT NULL,
        AtikDetay TEXT,
        Miktar FLOAT NOT NULL,
        Tarih TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        Lokasyon VARCHAR(255),
        FOREIGN KEY (KullaniciID) REFERENCES Kullanici(KullaniciID),
        FOREIGN KEY (AtikTuruID) REFERENCES AtikTurleri(AtikTuruID)
      );
    `);
    console.log('Materyal tablosu oluşturuldu');

    // Atık türlerini ekle
    await db.query(`
      INSERT INTO AtikTurleri (Adi, Aciklama) VALUES
        ('Plastik', 'Pet şişeler, plastik poşetler, plastik ambalajlar ve diğer plastik atıklar'),
        ('Kağıt', 'Gazete, dergi, karton kutular, kağıt ambalajlar ve diğer kağıt atıklar'),
        ('Cam', 'Cam şişeler, kavanozlar ve diğer cam atıklar'),
        ('Metal', 'Alüminyum kutular, konserve kutuları, metal kapaklar ve diğer metal atıklar'),
        ('Organik', 'Yiyecek atıkları, meyve-sebze atıkları, bahçe atıkları ve diğer organik atıklar'),
        ('Diğer', 'Diğer sınıflandırılamayan atık türleri');
    `);
    console.log('Atık türleri eklendi');

    console.log('Veritabanı kurulumu tamamlandı!');
    process.exit(0);
  } catch (error) {
    console.error('Hata:', error);
    process.exit(1);
  }
}

setupDatabase(); 