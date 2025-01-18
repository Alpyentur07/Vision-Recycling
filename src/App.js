import React, { useRef, useState, useEffect } from "react";
import './App.css';
import './theme.css';
import TaggingForm from './taggingform';
import Login from './components/Login';
import Register from './components/Register';
import RecycledItems from './RecycledItems';
import Badges from './components/Badges';
import Profile from './components/Profile';
import RegionalCharts from './components/RegionalCharts';
import Classification from './components/Classification';
import Swal from 'sweetalert2';

// Header Component
function Header({ darkMode, toggleDarkMode, user, onLogout, onLoginClick, onRegisterClick, onRecycledClick, onBadgesClick, onRegionalChartsClick, onProfileClick, onHomeClick }) {
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Çıkış yapmak istiyor musunuz?',
      text: "Oturumunuz sonlandırılacak.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Evet, çıkış yap',
      cancelButtonText: 'İptal'
    });

    if (result.isConfirmed) {
      onLogout();
      Swal.fire(
        'Çıkış Yapıldı!',
        'Başarıyla çıkış yaptınız.',
        'success'
      );
    }
  };

  return (
    <header className="navbar navbar-expand-lg navbar-dark bg-primary py-3">
      <div className="container">
        <button 
          className="navbar-brand d-flex align-items-center" 
          onClick={onHomeClick}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <i className="fas fa-recycle me-2"></i>
          VisionRecycling
        </button>
        <div className="d-flex align-items-center gap-3">
          {user && (
            <>
              <button 
                className="btn btn-outline-light me-2"
                onClick={onRecycledClick}
              >
                <i className="fas fa-list-ul me-2"></i>
                Geri Dönüştürülenler
              </button>
              <button 
                className="btn btn-outline-light me-2"
                onClick={onBadgesClick}
              >
                <i className="fas fa-trophy me-2"></i>
                Rozetler
              </button>
              <button 
                className="btn btn-outline-light me-2"
                onClick={onRegionalChartsClick}
              >
                <i className="fas fa-chart-area me-2"></i>
                Bölgesel İstatistikler
              </button>
            </>
          )}
          <button 
            className="btn btn-link text-light p-0 border-0" 
            onClick={toggleDarkMode}
            title={darkMode ? 'Açık Mod' : 'Koyu Mod'}
          >
            <i className={`fas fa-${darkMode ? 'sun' : 'moon'} fs-5`}></i>
          </button>
          {user ? (
            <div className="d-flex align-items-center gap-3">
              <button 
                className="btn btn-outline-light d-flex align-items-center gap-2"
                onClick={onProfileClick}
              >
                {user.photoUrl ? (
                  <img 
                    src={user.photoUrl} 
                    alt="Profil" 
                    className="header-profile-photo"
                  />
                ) : (
                  <i className="fas fa-user-circle fs-4"></i>
                )}
                <strong>{user.ad} {user.soyad}</strong>
              </button>
              <button 
                className="btn btn-outline-light" 
                onClick={handleLogout}
              >
                <i className="fas fa-sign-out-alt me-2"></i>
                Çıkış
              </button>
            </div>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <button 
                className="btn btn-outline-light" 
                onClick={onLoginClick}
              >
                <i className="fas fa-sign-in-alt me-2"></i>
                Giriş Yap
              </button>
              <button 
                className="btn btn-outline-light" 
                onClick={onRegisterClick}
              >
                <i className="fas fa-user-plus me-2"></i>
                Kayıt Ol
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// Home Page Component
function HomePage({ navigateToClassification, navigateToTagging }) {
  return (
    <div className="container py-5">
      <section className="hero text-center py-5">
        <h1 className="display-4 mb-4">
          <i className="fas fa-recycle text-primary me-3"></i>
          VisionRecycling
        </h1>
        <p className="lead mb-5">
          Yapay zeka destekli atıkların üretimi ve geri dönüşüm takip sistemi ile çevreyi paylaşma katkısı bulunun.
          <br />
          <span className="mt-3 d-block">Kamera ile Sınıflandırmaya tıklayarak atıklarınızı sınıflandırın.</span>
        </p>
        <div className="d-flex justify-content-center gap-3">
          <button 
            className="btn btn-primary btn-lg"
            onClick={navigateToClassification}
          >
            <i className="fas fa-upload me-2"></i>
            Resim Yükleyerek Sınıflandır
          </button>
          <button 
            className="btn btn-outline-primary btn-lg"
            onClick={navigateToTagging}
          >
            <i className="fas fa-recycle me-2"></i>
            Geri Dönüşüm
          </button>
        </div>
      </section>

      <section className="features py-5">
        <h2 className="text-center mb-5">Nasıl Çalışır?</h2>
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body text-center">
                <i className="fas fa-camera-retro text-primary fs-1 mb-3"></i>
                <h3 className="card-title h5">Fotoğraf Çek</h3>
                <p className="card-text">
                  Geri dönüştürmek istediğiniz atığın fotoğrafını çekin veya manuel olarak giriş yapın.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body text-center">
                <i className="fas fa-magic text-primary fs-1 mb-3"></i>
                <h3 className="card-title h5">Yapay Zeka Analizi</h3>
                <p className="card-text">
                  Yapay zeka teknolojimiz atığın türünü otomatik olarak belirler.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body text-center">
                <i className="fas fa-chart-line text-primary fs-1 mb-3"></i>
                <h3 className="card-title h5">Takip Et</h3>
                <p className="card-text">
                  Geri dönüşüm katkınızı takip edin ve çevresel etkinizi görün.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Main App Component
function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    // localStorage'dan sayfa bilgisini al
    return localStorage.getItem('currentPage') || "home";
  });
  
  // Sayfa değiştiğinde localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('currentPage', currentPage);
  }, [currentPage]);

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState(() => {
    // localStorage'dan kullanıcı bilgilerini al
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [visitingUser, setVisitingUser] = useState(null);
  const [recycledItems, setRecycledItems] = useState([]);
  const [allRecycledItems, setAllRecycledItems] = useState([]);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Kullanıcı bilgileri değiştiğinde localStorage'a kaydet
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Sayfa yüklendiğinde ve kullanıcı varsa verileri çek
  useEffect(() => {
    if (user) {
      fetchRecycledItems();
      fetchAllRecycledItems();
    }
  }, [user]);

  const fetchRecycledItems = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`http://localhost:3002/api/materyal/user/${user.kullaniciid}`);
      if (response.ok) {
        const data = await response.json();
        setRecycledItems(data);
      }
    } catch (error) {
      console.error('Veriler yüklenirken bir hata oluştu:', error);
    }
  };

  const fetchAllRecycledItems = async () => {
    try {
      // Kullanıcının kendi verilerini kullan
      const response = await fetch(`http://localhost:3002/api/materyal/user/${user.kullaniciid}`);
      if (!response.ok) {
        console.error('Veriler alınamadı. Status:', response.status);
        throw new Error('Veriler alınamadı');
      }
      const data = await response.json();
      console.log('Materyal verileri:', data);
      
      // Kullanıcı bilgilerini ekle
      const itemsWithUserInfo = data.map(item => ({
        ...item,
        kullaniciad: user.ad,
        kullanicisoyad: user.soyad,
        kullaniciemail: user.eposta
      }));

      setAllRecycledItems(itemsWithUserInfo);
    } catch (error) {
      console.error('Tüm veriler yüklenirken bir hata oluştu:', error);
    }
  };

  const navigateToClassification = () => {
    if (user) {
      setCurrentPage("classification");
    } else {
      setShowLogin(true);
    }
  };
  
  const navigateToTagging = () => {
    if (user) {
      setCurrentPage("taggingForm");
    } else {
      setShowLogin(true);
    }
  };
  
  const navigateToHome = () => setCurrentPage("home");

  const navigateToRecycled = () => {
    if (user) {
      setCurrentPage("recycledItems");
    } else {
      setShowLogin(true);
    }
  };

  const navigateToBadges = () => {
    if (user) {
      setCurrentPage("badges");
    } else {
      setShowLogin(true);
    }
  };

  const navigateToProfile = () => {
    if (user) {
      setCurrentPage("profile");
    } else {
      setShowLogin(true);
    }
  };

  const navigateToRegionalCharts = () => {
    if (user) {
      setCurrentPage("regionalCharts");
    } else {
      setShowLogin(true);
    }
  };

  const navigateToUserProfile = (selectedUser) => {
    if (selectedUser.isVisitingProfile) {
      setCurrentPage("profile");
      setVisitingUser(selectedUser);
    } else {
      setUser(selectedUser);
      setCurrentPage("profile");
    }
  };

  const handleLogin = (userData) => {
    console.log('handleLogin çağrıldı, userData:', userData);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setShowLogin(false);
    setShowRegister(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setCurrentPage("home");
  };

  const handleLoginClick = () => {
    setShowLogin(true);
    setShowRegister(false);
  };

  const handleRegisterClick = () => {
    setShowLogin(false);
    setShowRegister(true);
  };

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handlePhotoUpdate = (photoUrl) => {
    setUser(prevUser => ({
      ...prevUser,
      photoUrl
    }));
  };

  return (
    <div className="app">
      <Header 
        darkMode={theme === 'dark'}
        toggleDarkMode={toggleTheme}
        user={user}
        onLogout={handleLogout}
        onLoginClick={handleLoginClick}
        onRegisterClick={handleRegisterClick}
        onRecycledClick={navigateToRecycled}
        onBadgesClick={navigateToBadges}
        onRegionalChartsClick={navigateToRegionalCharts}
        onProfileClick={navigateToProfile}
        onHomeClick={navigateToHome}
      />
      <main className="main-content">
        {showLogin && !user && (
          <Login
            onSwitchToRegister={() => {
              setShowLogin(false);
              setShowRegister(true);
            }}
            onLogin={handleLogin}
          />
        )}
        {showRegister && !user && (
          <Register
            onSwitchToLogin={() => {
              setShowRegister(false);
              setShowLogin(true);
            }}
            onLogin={handleLogin}
          />
        )}
        {!showLogin && !showRegister && (
          <>
            {currentPage === "home" && (
              <HomePage
                navigateToClassification={navigateToClassification}
                navigateToTagging={navigateToTagging}
              />
            )}
            {currentPage === "classification" && (
              <Classification 
                navigateToHome={navigateToHome}
                user={user}
              />
            )}
            {currentPage === "taggingForm" && (
              <TaggingForm 
                navigateToHome={navigateToHome}
                user={user}
              />
            )}
            {currentPage === "recycledItems" && (
              <RecycledItems 
                user={user}
                navigateToHome={navigateToHome}
              />
            )}
            {currentPage === "badges" && (
              <Badges 
                recycledItems={recycledItems}
              />
            )}
            {currentPage === "profile" && (
              <Profile 
                user={visitingUser || user}
                recycledItems={recycledItems}
                navigateToHome={navigateToHome}
                isVisitingProfile={!!visitingUser}
                onPhotoUpdate={handlePhotoUpdate}
              />
            )}
            {currentPage === "regionalCharts" && (
              <RegionalCharts 
                recycledItems={allRecycledItems}
                navigateToUserProfile={navigateToUserProfile}
                currentUser={user}
              />
            )}
          </>
        )}
      </main>
      <footer className="footer">
        <p>© 2024 VisionRecycling. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
}

export default App;
