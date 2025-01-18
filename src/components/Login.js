import React, { useState } from 'react';
import './Login.css';

function Login({ onSwitchToRegister, onLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3002/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eposta: formData.email,
          sifre: formData.password
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Başarılı giriş
        console.log('Giriş başarılı, kullanıcı bilgileri:', {
          id: data.kullaniciid,
          ad: data.ad,
          soyad: data.soyad,
          eposta: data.eposta
        });
        onLogin(data);
        // Başarılı giriş bildirimi
        showSuccessAlert();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'E-posta veya şifre hatalı');
        showErrorAlert(errorData.message || 'E-posta veya şifre hatalı');
      }
    } catch (error) {
      console.error('Giriş hatası:', error);
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      showErrorAlert('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const showSuccessAlert = () => {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `
      <i class="fas fa-check-circle me-2"></i>
      Giriş başarılı! Anasayfaya yönlendiriliyorsunuz.
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-lg border-0">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <i className="fas fa-user-circle fa-3x text-primary"></i>
                <h2 className="mt-3 mb-4">Giriş Yap</h2>
              </div>
              {error && (
                <div className="alert alert-danger mb-4" role="alert">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <div className="form-floating">
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                    />
                    <label htmlFor="email">E-posta Adresi</label>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="form-floating">
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      autoComplete="current-password"
                    />
                    <label htmlFor="password">Şifre</label>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary w-100 py-2 mb-3">
                  <i className="fas fa-sign-in-alt me-2"></i>
                  Giriş Yap
                </button>
              </form>
              <div className="text-center">
                <p className="mb-0">Hesabınız yok mu?</p>
                <button 
                  onClick={onSwitchToRegister} 
                  className="btn btn-link text-decoration-none"
                >
                  <i className="fas fa-user-plus me-2"></i>
                  Yeni Hesap Oluştur
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login; 