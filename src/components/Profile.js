import React from 'react';
import './Profile.css';
import Swal from 'sweetalert2';

function Profile({ user, recycledItems, navigateToHome, onPhotoUpdate }) {
  // Kullanıcının geri dönüşüm istatistiklerini hesapla
  const calculateStats = () => {
    const stats = {
      totalRecycled: 0,
      totalByType: {},
      lastRecycled: null
    };

    recycledItems.forEach(item => {
      const amount = parseFloat(item.miktar);
      stats.totalRecycled += amount;

      if (!stats.totalByType[item.atikturuadi]) {
        stats.totalByType[item.atikturuadi] = 0;
      }
      stats.totalByType[item.atikturuadi] += amount;

      const itemDate = new Date(item.tarih);
      if (!stats.lastRecycled || itemDate > new Date(stats.lastRecycled)) {
        stats.lastRecycled = item.tarih;
      }
    });

    return stats;
  };

  // Kazanılan rozetleri hesapla
  const calculateEarnedBadges = () => {
    const totals = {
      plastic: 0,
      paper: 0,
      glass: 0,
      metal: 0,
      total: 0
    };

    recycledItems.forEach(item => {
      const amount = parseFloat(item.miktar);
      totals.total += amount;

      switch (item.atikturuadi.toLowerCase()) {
        case 'plastik':
          totals.plastic += amount;
          break;
        case 'kağıt':
          totals.paper += amount;
          break;
        case 'cam':
          totals.glass += amount;
          break;
        case 'metal':
          totals.metal += amount;
          break;
        default:
          break;
      }
    });

    const badges = [
      {
        name: "Plastik Kahramanı",
        description: "100 Kg Plastik Geri Dönüştüren",
        icon: "fas fa-award",
        color: "#4CAF50",
        earned: totals.plastic >= 100
      },
      {
        name: "Kağıt Ustası",
        description: "50 Kg Kağıt Geri Dönüştüren",
        icon: "fas fa-scroll",
        color: "#2196F3",
        earned: totals.paper >= 50
      },
      {
        name: "Cam Koleksiyoncusu",
        description: "75 Kg Cam Geri Dönüştüren",
        icon: "fas fa-wine-bottle",
        color: "#9C27B0",
        earned: totals.glass >= 75
      },
      {
        name: "Metal Şampiyonu",
        description: "60 Kg Metal Geri Dönüştüren",
        icon: "fas fa-medal",
        color: "#FF9800",
        earned: totals.metal >= 60
      },
      {
        name: "Çevre Dostu",
        description: "Toplam 500 Kg Atık Geri Dönüştüren",
        icon: "fas fa-leaf",
        color: "#4CAF50",
        earned: totals.total >= 500
      }
    ];

    return badges.filter(badge => badge.earned);
  };

  const stats = calculateStats();
  const earnedBadges = calculateEarnedBadges();

  return (
    <div className="profile-container">
      <div className="container py-5">
        {/* Üst Bilgi Kartı */}
        <div className="profile-header card mb-4">
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-auto">
                <div className="profile-photo-container">
                  {user.photoUrl ? (
                    <img 
                      src={user.photoUrl} 
                      alt="Profil" 
                      className="profile-photo"
                    />
                  ) : (
                    <i className="fas fa-user-circle"></i>
                  )}
                </div>
              </div>
              <div className="col">
                <h2 className="mb-1">{user.ad} {user.soyad}</h2>
                <p className="text-muted mb-0">{user.email}</p>
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
          </div>
        </div>

        <div className="row">
          {/* İstatistikler */}
          <div className="col-md-4 mb-4">
            <div className="card h-100">
              <div className="card-body">
                <h3 className="card-title h5 mb-4">
                  <i className="fas fa-chart-line me-2"></i>
                  Geri Dönüşüm İstatistikleri
                </h3>
                <div className="stats-list">
                  <div className="stat-item">
                    <span className="stat-label">Toplam Geri Dönüşüm</span>
                    <span className="stat-value">{stats.totalRecycled.toFixed(2)} kg</span>
                  </div>
                  {Object.entries(stats.totalByType).map(([type, amount]) => (
                    <div key={type} className="stat-item">
                      <span className="stat-label">{type}</span>
                      <span className="stat-value">{amount.toFixed(2)} kg</span>
                    </div>
                  ))}
                  <div className="stat-item">
                    <span className="stat-label">Son Geri Dönüşüm</span>
                    <span className="stat-value">
                      {stats.lastRecycled ? new Date(stats.lastRecycled).toLocaleDateString('tr-TR') : '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Kazanılan Rozetler */}
          <div className="col-md-8 mb-4">
            <div className="card h-100">
              <div className="card-body">
                <h3 className="card-title h5 mb-4">
                  <i className="fas fa-trophy me-2"></i>
                  Kazanılan Rozetler
                </h3>
                <div className="badges-grid">
                  {earnedBadges.length > 0 ? (
                    earnedBadges.map((badge, index) => (
                      <div 
                        key={index} 
                        className="earned-badge"
                        style={{ '--badge-color': badge.color }}
                      >
                        <div className="badge-icon">
                          <i className={badge.icon}></i>
                        </div>
                        <div className="badge-info">
                          <h4>{badge.name}</h4>
                          <p>{badge.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-badges">
                      <i className="fas fa-award text-muted"></i>
                      <p>Henüz rozet kazanılmamış</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile; 