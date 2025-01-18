import React, { useState, useEffect } from 'react';
import './RecycledItems.css';
import Swal from 'sweetalert2';

function RecycledItems({ user, navigateToHome }) {
  const [recycledItems, setRecycledItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedWasteType, setSelectedWasteType] = useState(null);
  const [formData, setFormData] = useState({
    atikTuru: '',
    miktar: '',
    lokasyon: '',
    atikDetay: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    fetchRecycledItems();
  }, [user.kullaniciid]);

  useEffect(() => {
    if (selectedWasteType) {
      const filtered = recycledItems.filter(item => item.atikturuadi === selectedWasteType);
      setFilteredItems(filtered);
      const filteredTotal = filtered.reduce((acc, item) => acc + parseFloat(item.miktar), 0);
      setTotalAmount(filteredTotal);
    } else {
      setFilteredItems(recycledItems);
      const total = recycledItems.reduce((acc, item) => acc + parseFloat(item.miktar), 0);
      setTotalAmount(total);
    }
  }, [selectedWasteType, recycledItems]);

  const handleWasteTypeClick = (wasteType) => {
    setSelectedWasteType(selectedWasteType === wasteType ? null : wasteType);
  };

  const fetchRecycledItems = async () => {
    try {
      const response = await fetch(`http://localhost:3002/api/materyal/user/${user.kullaniciid}`);
      if (response.ok) {
        const data = await response.json();
        setRecycledItems(data);
        
        // Toplam miktarı hesapla
        const total = data.reduce((acc, item) => acc + parseFloat(item.miktar), 0);
        setTotalAmount(total);
      } else {
        throw new Error('Veriler getirilemedi');
      }
    } catch (error) {
      setError('Veriler yüklenirken bir hata oluştu');
      console.error('Veri getirme hatası:', error);
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

  const getLocation = async () => {
    setLoadingLocation(true);
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      
      const { latitude, longitude } = position.coords;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=tr`
      );
      
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          lokasyon: data.display_name
        }));
      }
    } catch (error) {
      console.error('Konum alma hatası:', error);
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        kullaniciId: user.kullaniciid,
        atikTuruId: parseInt(formData.atikTuru),
        miktar: parseFloat(formData.miktar),
        lokasyon: formData.lokasyon,
        atikDetay: formData.atikDetay || null
      };

      const response = await fetch('http://localhost:3002/api/materyal/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // Formu temizle
        setFormData({
          atikTuru: '',
          miktar: '',
          lokasyon: '',
          atikDetay: ''
        });
        
        // Listeyi güncelle
        fetchRecycledItems();
        
        // Başarı mesajı göster
        showSuccessAlert('Geri dönüşüm kaydı başarıyla oluşturuldu!');
      } else {
        throw new Error(data.message || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Form gönderme hatası:', error);
      showErrorAlert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const showSuccessAlert = (message) => {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `
      <i class="fas fa-check-circle me-2"></i>
      ${message}
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

  const handleDelete = async (materialId) => {
    const result = await Swal.fire({
      title: 'Emin misiniz?',
      text: "Bu geri dönüşüm kaydını silmek istediğinizden emin misiniz?",
      icon: 'question',
      iconColor: '#d33',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Evet, sil!',
      cancelButtonText: 'İptal'
    });

    if (result.isConfirmed) {
      try {
        console.log('Silinecek materyal ID:', materialId);
        const response = await fetch(`http://localhost:3002/api/materyal/delete/${materialId}`, {
          method: 'DELETE',
        });

        const data = await response.json();
        console.log('Silme işlemi yanıtı:', data);

        if (response.ok) {
          // UI'dan öğeyi kaldır
          setRecycledItems(prevItems => {
            const updatedItems = prevItems.filter(item => item.materyalid !== materialId);
            console.log('Güncellenmiş liste:', updatedItems);
            return updatedItems;
          });

          // Toplam miktarı güncelle
          const updatedItems = recycledItems.filter(item => item.materyalid !== materialId);
          const newTotal = updatedItems.reduce((acc, item) => acc + parseFloat(item.miktar), 0);
          setTotalAmount(newTotal);
          
          // Başarılı silme mesajı
          Swal.fire({
            title: 'Silindi!',
            text: 'Kayıt başarıyla silindi.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
        } else {
          throw new Error(data.message || 'Kayıt silinirken bir hata oluştu');
        }
      } catch (error) {
        console.error('Silme hatası detayı:', error);
        Swal.fire({
          title: 'Hata!',
          text: error.message || 'Kayıt silinirken bir hata oluştu.',
          icon: 'error',
          timer: 1500,
          showConfirmButton: false
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
        </div>
        <button 
          className="btn btn-primary"
          onClick={navigateToHome}
        >
          <i className="fas fa-home me-2"></i>
          Anasayfaya Dön
        </button>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row mb-4">
        <div className="col">
          <h2 className="mb-4">
            <i className="fas fa-recycle me-2"></i>
            Geri Dönüşüm
          </h2>
          <div className="d-flex align-items-center">
            <h4 className="mb-0 me-3">Seçilen Atığın Toplam Miktarı:</h4>
            <span className="badge bg-success fs-5">{totalAmount.toFixed(2)} kg</span>
          </div>
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

      <div className="row">
        {/* Form Bölümü */}
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-4">Yeni Geri Dönüşüm Kaydı</h5>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="atikTuru" className="form-label">Atık Türü</label>
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
                </div>

                {formData.atikTuru === '6' && (
                  <div className="mb-3">
                    <label htmlFor="atikDetay" className="form-label">Atık Detayı</label>
                    <input
                      type="text"
                      className="form-control"
                      id="atikDetay"
                      name="atikDetay"
                      value={formData.atikDetay}
                      onChange={handleChange}
                      required
                    />
                  </div>
                )}

                <div className="mb-3">
                  <label htmlFor="miktar" className="form-label">Miktar (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    id="miktar"
                    name="miktar"
                    value={formData.miktar}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="atikDetay" className="form-label">Detay</label>
                  <textarea
                    className="form-control"
                    id="atikDetay"
                    name="atikDetay"
                    value={formData.atikDetay}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Atık hakkında ek bilgi girebilirsiniz..."
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="lokasyon" className="form-label">Lokasyon</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      id="lokasyon"
                      name="lokasyon"
                      value={formData.lokasyon}
                      onChange={handleChange}
                      required
                    />
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
                  className="btn btn-primary w-100"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-plus-circle me-2"></i>
                      Kaydet
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Liste Bölümü */}
        <div className="col-md-8">
          {/* Tüm Zamanlar Toplam İstatistik Kartı */}
          <div className="card bg-primary text-white mb-4">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col">
                  <h4 className="card-title mb-0">Tüm Zamanlar Toplamı</h4>
                  <small>Bugüne kadar geri dönüştürülen toplam miktar</small>
                </div>
                <div className="col-auto">
                  <h2 className="mb-0">{recycledItems.reduce((acc, item) => acc + parseFloat(item.miktar), 0).toFixed(2)} kg</h2>
                </div>
              </div>
            </div>
          </div>

          {/* Seçili Atık Türü İstatistik Kartı */}
          <div className="card bg-success text-white mb-4">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col">
                  <h4 className="card-title mb-0">
                    {selectedWasteType ? `${selectedWasteType} Toplamı` : 'Tüm Atıklar Toplamı'}
                  </h4>
                  <small>
                    {selectedWasteType 
                      ? `Seçilen atık türü için toplam miktar` 
                      : 'Tüm atık türleri için toplam miktar'}
                  </small>
                </div>
                <div className="col-auto">
                  <h2 className="mb-0">{totalAmount.toFixed(2)} kg</h2>
                </div>
              </div>
            </div>
          </div>

          {recycledItems.length === 0 ? (
            <div className="alert alert-info" role="alert">
              <i className="fas fa-info-circle me-2"></i>
              Henüz geri dönüştürülmüş atık bulunmuyor.
            </div>
          ) : (
            <>
              <div className="filter-container">
                <i className="fas fa-filter"></i>
                <select
                  className="waste-type-filter"
                  value={selectedWasteType || ''}
                  onChange={(e) => setSelectedWasteType(e.target.value || null)}
                >
                  <option value="">Tüm Atık Türleri</option>
                  {[...new Set(recycledItems.map(item => item.atikturuadi))].map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Tarih</th>
                      <th>
                        Atık Türü {selectedWasteType && <i className="fas fa-filter text-primary ms-1"></i>}
                      </th>
                      <th>Miktar (kg)</th>
                      <th>Lokasyon</th>
                      <th>Detay</th>
                      <th>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => (
                      <tr key={item.materyalid}>
                        <td>{new Date(item.tarih).toLocaleDateString('tr-TR')}</td>
                        <td>
                          <span className="badge bg-primary">
                            {item.atikturuadi}
                          </span>
                        </td>
                        <td>{parseFloat(item.miktar).toFixed(2)} kg</td>
                        <td>{item.lokasyon}</td>
                        <td>{item.atikdetay || '-'}</td>
                        <td>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(item.materyalid)}
                            title="Sil"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecycledItems; 