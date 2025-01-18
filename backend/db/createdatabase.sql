-- Önce tabloları silelim
DROP TABLE IF EXISTS GeriDonusumIslemleri;
DROP TABLE IF EXISTS Materyal;
DROP TABLE IF EXISTS AtikTurleri;
DROP TABLE IF EXISTS Kullanici;

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
    AtikDetay TEXT,
    Miktar FLOAT NOT NULL,
    Tarih TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Lokasyon VARCHAR(255),
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

-- Atık türlerini ekle
INSERT INTO AtikTurleri (Adi, Aciklama) VALUES
    ('Plastik', 'Pet şişeler, plastik poşetler, plastik ambalajlar ve diğer plastik atıklar'),
    ('Kağıt', 'Gazete, dergi, karton kutular, kağıt ambalajlar ve diğer kağıt atıklar'),
    ('Cam', 'Cam şişeler, kavanozlar ve diğer cam atıklar'),
    ('Metal', 'Alüminyum kutular, konserve kutuları, metal kapaklar ve diğer metal atıklar'),
    ('Organik', 'Yiyecek atıkları, meyve-sebze atıkları, bahçe atıkları ve diğer organik atıklar'),
    ('Diğer', 'Diğer sınıflandırılamayan atık türleri'); 