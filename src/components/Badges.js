import React, { useState, useEffect } from 'react';
import './Badges.css';

const badges = [
  {
    id: 1,
    name: "Plastik Kahramanı",
    description: "100 Kg Plastik Geri Dönüştüren",
    icon: "fas fa-award",
    color: "#4CAF50",
    requirement: 100,
    type: "plastic"
  },
  {
    id: 2,
    name: "Kağıt Ustası",
    description: "50 Kg Kağıt Geri Dönüştüren",
    icon: "fas fa-scroll",
    color: "#2196F3",
    requirement: 50,
    type: "paper"
  },
  {
    id: 3,
    name: "Cam Koleksiyoncusu",
    description: "75 Kg Cam Geri Dönüştüren",
    icon: "fas fa-wine-bottle",
    color: "#9C27B0",
    requirement: 75,
    type: "glass"
  },
  {
    id: 4,
    name: "Metal Şampiyonu",
    description: "60 Kg Metal Geri Dönüştüren",
    icon: "fas fa-medal",
    color: "#FF9800",
    requirement: 60,
    type: "metal"
  },
  {
    id: 5,
    name: "Çevre Dostu",
    description: "Toplam 500 Kg Atık Geri Dönüştüren",
    icon: "fas fa-leaf",
    color: "#4CAF50",
    requirement: 500,
    type: "total"
  },
  {
    id: 6,
    name: "Sürdürülebilirlik Öncüsü",
    description: "30 Gün Boyunca Her Gün Geri Dönüşüm Yapan",
    icon: "fas fa-calendar-check",
    color: "#009688",
    requirement: 30,
    type: "streak"
  },
  {
    id: 7,
    name: "Bölge Lideri",
    description: "Bölgesinde En Çok Geri Dönüşüm Yapan İlk 10 Kişiden Biri",
    icon: "fas fa-map-marker-alt",
    color: "#E91E63",
    requirement: 1,
    type: "region"
  },
  {
    id: 8,
    name: "Yıllık Hedef Aşıldı",
    description: "Yıllık Geri Dönüşüm Hedefini Aşan",
    icon: "fas fa-bullseye",
    color: "#673AB7",
    requirement: 1000,
    type: "yearly"
  },
  {
    id: 9,
    name: "Çeşitlilik Uzmanı",
    description: "Her Türden En Az 20 Kg Geri Dönüşüm Yapan",
    icon: "fas fa-layer-group",
    color: "#795548",
    requirement: 20,
    type: "diversity"
  },
  {
    id: 10,
    name: "Topluluk Yıldızı",
    description: "Diğer Kullanıcıları Geri Dönüşüme Teşvik Eden",
    icon: "fas fa-star",
    color: "#FFC107",
    requirement: 5,
    type: "community"
  },
  {
    id: 11,
    name: "Ayın Birincisi",
    description: "Ayın En Çok Geri Dönüşüm Yapan Kullanıcısı",
    icon: "fas fa-crown",
    color: "#FFD700",
    requirement: 1,
    type: "monthly_winner",
    monthYear: new Date().toLocaleString('tr-TR', { month: 'long', year: 'numeric' })
  }
];

function Badges({ recycledItems }) {
  const [earnedBadges, setEarnedBadges] = useState([]);

  useEffect(() => {
    const fetchBadges = async () => {
      const totals = {
        plastic: 0,
        paper: 0,
        glass: 0,
        metal: 0,
        total: 0,
        streak: 0,
        region: 0,
        yearly: 0,
        diversity: 0,
        community: 0,
        monthly_winner: 0
      };

      // Ayın birincisi kontrolü
      try {
        const response = await fetch('http://localhost:3002/api/materyal/top-recyclers');
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0 && data[0].kullaniciid === recycledItems[0]?.kullaniciid) {
            totals.monthly_winner = 1;
          }
        }
      } catch (error) {
        console.error('Top recyclers verisi alınamadı:', error);
      }

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

      // Çeşitlilik Uzmanı rozeti için özel kontrol
      totals.diversity = (totals.plastic >= 20 && totals.paper >= 20 && 
                         totals.glass >= 20 && totals.metal >= 20) ? 1 : 0;

      const calculatedBadges = badges.map(badge => ({
        ...badge,
        earned: totals[badge.type] >= badge.requirement,
        progress: Math.min((totals[badge.type] / badge.requirement) * 100, 100)
      }));

      setEarnedBadges(calculatedBadges);
    };

    fetchBadges();
  }, [recycledItems]);

  return (
    <div className="badges-container">
      <h2 className="text-center mb-4">
        <i className="fas fa-trophy me-2"></i>
        Rozetleriniz
      </h2>
      <div className="badges-grid">
        {earnedBadges.map(badge => (
          <div 
            key={badge.id} 
            className={`badge-card ${badge.earned ? 'earned' : 'locked'}`}
            style={{ '--badge-color': badge.color }}
          >
            <div className="badge-icon">
              <i className={badge.icon}></i>
            </div>
            <div className="badge-info">
              <h3>{badge.name}</h3>
              <p>{badge.description}</p>
              <div className="progress">
                <div 
                  className="progress-bar" 
                  style={{ width: `${badge.progress}%` }}
                  role="progressbar" 
                  aria-valuenow={badge.progress} 
                  aria-valuemin="0" 
                  aria-valuemax="100"
                >
                  {badge.progress.toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Badges; 