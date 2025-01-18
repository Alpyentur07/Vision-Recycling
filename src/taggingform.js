import React, { useState } from 'react';
import './taggingform.css';

function TaggingForm({ navigateToHome, user }) {
  const [formData, setFormData] = useState({
    atikTuru: '',
    digerAtikDetay: '',
    miktar: '',
    lokasyon: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Form verisi:', formData);
      const requestData = {
        kullaniciId: user.kullaniciid,
        atikTuruId: parseInt(formData.atikTuru),
        atikDetay: formData.atikTuru === '6' ? formData.digerAtikDetay : null,
        miktar: parseFloat(formData.miktar),
        lokasyon: formData.lokasyon
      };
      console.log('Gönderilen veri:', requestData);

      const response = await fetch('http://localhost:3001/api/materyal/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      console.log('Sunucu cevabı:', data);

      if (response.ok) {
        showSuccessAlert();
        // Form verilerini sıfırla
        setFormData({
          atikTuru: '',
          digerAtikDetay: '',
          miktar: '',
          lokasyon: ''
        });
      } else {
        showErrorAlert(data.message || 'Etiket oluşturulurken bir hata oluştu');
      }
    } catch (error) {
      console.error('Form gönderme hatası:', error);
      showErrorAlert('Sunucu ile iletişim kurulamadı. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getLocation = () => {
    setLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Reverse geocoding için OpenStreetMap Nominatim API kullanıyoruz
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
            .then(res => res.json())
            .then(data => {
              const address = data.display_name;
              setFormData(prev => ({
                ...prev,
                lokasyon: address
              }));
              setLoadingLocation(false);
            })
            .catch(error => {
              console.error('Konum çözümleme hatası:', error);
              setFormData(prev => ({
                ...prev,
                lokasyon: `${latitude}, ${longitude}`
              }));
              setLoadingLocation(false);
            });
        },
        (error) => {
          console.error('Konum alma hatası:', error);
          showErrorAlert('Konum alınamadı. Lütfen manuel giriş yapın.');
          setLoadingLocation(false);
        }
      );
    } else {
      showErrorAlert('Tarayıcınız konum özelliğini desteklemiyor.');
      setLoadingLocation(false);
    }
  };

  const showSuccessAlert = () => {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `
      <i class="fas fa-check-circle me-2"></i>
      Etiket başarıyla oluşturuldu!
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
  };

  const showErrorAlert = (message) => {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `
      <i class="fas fa-exclamation-circle me-2"></i>
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
  };

  return (
    <div className="container py-5">
      <div className="row mb-4">
        <div className="col">
          <h2 className="mb-4">
            <i className="fas fa-recycle me-2"></i>
            Geri Dönüşüm
          </h2>
          <p className="lead">
            Geri dönüştürdüğünüz atıkları kaydedin ve çevreye katkınızı takip edin.
          </p>
        </div>
        <div className="col-auto">
          <button 
            className="btn btn-outline-primary"
            onClick={navigateToHome}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Anasayfaya Dön
          </button>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-lg border-0">
            <div className="card-body p-5">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <div className="form-floating">
                    <select
                      className="form-select"
                      id="atikTuru"
                      name="atikTuru"
                      value={formData.atikTuru}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seçiniz</option>
                      <option value="1">Plastik</option>
                      <option value="2">Kağıt</option>
                      <option value="3">Cam</option>
                      <option value="4">Metal</option>
                      <option value="5">Organik</option>
                      <option value="6">Diğer</option>
                    </select>
                    <label htmlFor="atikTuru">Atık Türü</label>
                  </div>
                </div>

                {formData.atikTuru === '6' && (
                  <div className="mb-4">
                    <div className="form-floating">
                      <input
                        type="text"
                        className="form-control"
                        id="digerAtikDetay"
                        name="digerAtikDetay"
                        placeholder="Atık türü detayı"
                        value={formData.digerAtikDetay}
                        onChange={handleChange}
                        required
                      />
                      <label htmlFor="digerAtikDetay">Atık Türü Detayı</label>
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <div className="form-floating">
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      id="miktar"
                      name="miktar"
                      placeholder="Miktar (kg)"
                      value={formData.miktar}
                      onChange={handleChange}
                      required
                    />
                    <label htmlFor="miktar">Miktar (kg)</label>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="input-group">
                    <div className="form-floating flex-grow-1">
                      <input
                        type="text"
                        className="form-control"
                        id="lokasyon"
                        name="lokasyon"
                        placeholder="Lokasyon"
                        value={formData.lokasyon}
                        onChange={handleChange}
                        required
                      />
                      <label htmlFor="lokasyon">Lokasyon</label>
                    </div>
                    <button 
                      type="button" 
                      className="btn btn-outline-primary"
                      onClick={getLocation}
                      disabled={loadingLocation}
                    >
                      {loadingLocation ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      ) : (
                        <i className="fas fa-location-dot"></i>
                      )}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-100 py-2 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Oluşturuluyor...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-plus-circle me-2"></i>
                      Etiket Oluştur
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaggingForm;
