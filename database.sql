-- Veritabanını oluştur
CREATE DATABASE vision_recycling;

-- Veritabanına bağlan
\c vision_recycling;

-- Kullanıcı Tablosu
CREATE TABLE Kullanici (
    KullaniciID SERIAL PRIMARY KEY,
    Ad VARCHAR(50) NOT NULL,
    Soyad VARCHAR(50) NOT NULL,
    Eposta VARCHAR(100) NOT NULL UNIQUE,
    Sifre VARCHAR(100) NOT NULL,
    KayitTarihi TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Atık Türleri Tablosu
CREATE TABLE AtikTurleri (
    AtikTuruID SERIAL PRIMARY KEY,
    Adi VARCHAR(50) NOT NULL,
    Aciklama TEXT
);

-- Materyal Tablosu
CREATE TABLE Materyal (
    MateryalID SERIAL PRIMARY KEY,
    KullaniciID INTEGER NOT NULL,
    AtikTuruID INTEGER NOT NULL,
    Miktar FLOAT NOT NULL,
    Tarih TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Lokasyon VARCHAR(100),
    FOREIGN KEY (KullaniciID) REFERENCES Kullanici(KullaniciID),
    FOREIGN KEY (AtikTuruID) REFERENCES AtikTurleri(AtikTuruID)
);

-- Geri Dönüşüm İşlemleri Tablosu
CREATE TABLE GeriDonusumIslemleri (
    IslemID SERIAL PRIMARY KEY,
    MateryalID INTEGER NOT NULL,
    GeriDonusumTarihi TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    YeniUrun VARCHAR(100),
    IslemNotu TEXT,
    FOREIGN KEY (MateryalID) REFERENCES Materyal(MateryalID)
);

-- Örnek atık türleri ekleyelim
INSERT INTO AtikTurleri (Adi, Aciklama) VALUES
    ('Plastik', 'PET şişeler, plastik ambalajlar vb.'),
    ('Kağıt', 'Gazete, dergi, karton kutular vb.'),
    ('Cam', 'Cam şişeler, kavanozlar vb.'),
    ('Metal', 'Alüminyum kutular, konserve kutuları vb.'),
    ('Organik', 'Yiyecek atıkları, bahçe atıkları vb.'); 