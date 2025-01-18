import React, { useState } from 'react';
import './Register.css';

function Register({ onSwitchToLogin, onLogin }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Şifreler eşleşmiyor!');
      return;
    }

    try {
      // Kayıt işlemi
      const registerResponse = await fetch('http://localhost:3002/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ad: formData.firstName,
          soyad: formData.lastName,
          eposta: formData.email,
          sifre: formData.password
        }),
      });

      if (registerResponse.ok) {
        // Kayıt başarılı, şimdi otomatik giriş yapalım
        const loginResponse = await fetch('http://localhost:3002/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eposta: formData.email,
            sifre: formData.password
          }),
        });

        if (loginResponse.ok) {
          const userData = await loginResponse.json();
          onLogin(userData);
        } else {
          onSwitchToLogin();
        }
      } else {
        const error = await registerResponse.json();
        alert(error.message || 'Kayıt olurken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Kayıt hatası:', error);
      alert('Kayıt olurken bir hata oluştu.');
    }
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
                <i className="fas fa-user-plus fa-3x text-primary"></i>
                <h2 className="mt-3 mb-4">Yeni Hesap Oluştur</h2>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <div className="form-floating">
                    <input
                      type="text"
                      className="form-control"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      autocomplete="off"
                    />
                    <label htmlFor="firstName">Ad</label>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="form-floating">
                    <input
                      type="text"
                      className="form-control"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      autocomplete="off"
                    />
                    <label htmlFor="lastName">Soyisim</label>
                  </div>
                </div>
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
                      autocomplete="email"
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
                      autocomplete="off"
                    />
                    <label htmlFor="password">Şifre</label>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="form-floating">
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      autocomplete="off"
                    />
                    <label htmlFor="confirmPassword">Şifre Tekrar</label>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary w-100 py-2 mb-3">
                  <i className="fas fa-user-plus me-2"></i>
                  Kayıt Ol
                </button>
              </form>
              <div className="text-center">
                <p className="mb-0">Zaten hesabınız var mı?</p>
                <button 
                  onClick={onSwitchToLogin} 
                  className="btn btn-link text-decoration-none"
                >
                  <i className="fas fa-sign-in-alt me-2"></i>
                  Giriş Yap
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register; 