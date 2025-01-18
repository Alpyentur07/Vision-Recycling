import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement
} from 'chart.js';
import './RegionalCharts.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement
);

function RegionalCharts({ recycledItems, navigateToUserProfile, currentUser }) {
  // Bölgelere göre geri dönüşüm performansını hesapla
  const calculateRegionPerformance = () => {
    // Tüm ilçeleri içeren sabit liste
    const allDistricts = {
      'İzmit': 0,
      'Derince': 0,
      'Körfez': 0,
      'Gebze': 0,
      'Gölcük': 0,
      'Karamürsel': 0,
      'Kandıra': 0,
      'Başiskele': 0,
      'Kartepe': 0,
      'Çayırova': 0,
      'Darıca': 0,
      'Dilovası': 0,
      'Umuttepe': 0
    };

    // Adresten ilçe adını çıkaran yardımcı fonksiyon
    const extractDistrict = (location) => {
      const parts = location.split(',').map(part => part.trim());
      for (const district of Object.keys(allDistricts)) {
        if (parts.some(part => part.includes(district))) {
          return district;
        }
      }
      return null;
    };

    // Verileri işle
    recycledItems.forEach(item => {
      const district = extractDistrict(item.lokasyon);
      if (district && district in allDistricts) {
        allDistricts[district] += parseFloat(item.miktar);
      }
    });

    return allDistricts;
  };

  // Yıllık hedefleri ve mevcut durumu hesapla
  const calculateYearlyGoals = () => {
    const currentYear = new Date().getFullYear();
    const yearlyGoals = {
      'Plastik': 1200,
      'Kağıt': 1000,
      'Cam': 800,
      'Metal': 600
    };

    const currentProgress = {};
    recycledItems.forEach(item => {
      const itemYear = new Date(item.tarih).getFullYear();
      if (itemYear === currentYear) {
        if (!currentProgress[item.atikturuadi]) {
          currentProgress[item.atikturuadi] = 0;
        }
        currentProgress[item.atikturuadi] += parseFloat(item.miktar);
      }
    });

    return { goals: yearlyGoals, progress: currentProgress };
  };

  // Ayın en çok atık dönüştüren kullanıcılarını hesapla
  const calculateTopRecyclers = async () => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Kullanıcı bazında toplam miktarları hesapla
      const userTotals = {};
      
      recycledItems.forEach(item => {
        const itemDate = new Date(item.tarih);
        if (itemDate >= startOfMonth && itemDate <= endOfMonth) {
          const userId = item.kullaniciid;
          
          if (!userTotals[userId]) {
            userTotals[userId] = {
              kullaniciid: userId,
              ad: item.kullaniciad || 'Kullanıcı',
              soyad: item.kullanicisoyad || userId,
              email: item.kullaniciemail || '',
              toplamMiktar: 0
            };
          }
          
          userTotals[userId].toplamMiktar += parseFloat(item.miktar || 0);
        }
      });

      // Object değerlerini diziye çevir ve sırala
      const sortedUsers = Object.values(userTotals)
        .filter(user => user.toplamMiktar > 0)
        .sort((a, b) => b.toplamMiktar - a.toplamMiktar)
        .slice(0, 10);

      console.log('İşlenmiş kullanıcı verileri:', sortedUsers);
      return sortedUsers;
    } catch (error) {
      console.error('Top recyclers verisi alınamadı:', error);
      return [];
    }
  };

  // Profil sayfasına yönlendirme fonksiyonu
  const handleProfileClick = (selectedUser) => {
    // Seçilen kullanıcının profiline git ama navbar'daki kullanıcıyı değiştirme
    navigateToUserProfile({
      ...selectedUser,
      isVisitingProfile: true // Profil ziyareti olduğunu belirt
    });
  };

  const [topRecyclers, setTopRecyclers] = useState([]);
  const [currentMonth] = useState(new Date().toLocaleString('tr-TR', { month: 'long' }));

  useEffect(() => {
    calculateTopRecyclers().then(data => {
      console.log('Top recyclers data:', data); // Debug için
      setTopRecyclers(data);
    });
  }, []);

  const regionPerformance = calculateRegionPerformance();
  const yearlyData = calculateYearlyGoals();

  // Bölge performans verisi
  const regionData = {
    labels: Object.keys(regionPerformance),
    datasets: [
      {
        label: 'Bölgesel Geri Dönüşüm (kg)',
        data: Object.values(regionPerformance),
        backgroundColor: [
          '#4CAF50', // İzmit
          '#2196F3', // Derince
          '#9C27B0', // Körfez
          '#FF9800', // Gebze
          '#795548', // Gölcük
          '#607D8B', // Karamürsel
          '#E91E63', // Kandıra
          '#3F51B5', // Başiskele
          '#009688', // Kartepe
          '#FFC107', // Çayırova
          '#673AB7', // Darıca
          '#FF5722'  // Dilovası
        ],
        borderColor: '#3F51B5',
        borderWidth: 1,
      }
    ]
  };

  // Yıllık hedef verisi
  const yearlyGoalsData = {
    labels: Object.keys(yearlyData.goals),
    datasets: [
      {
        label: 'Hedef',
        data: Object.values(yearlyData.goals),
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        borderColor: '#4CAF50',
        borderWidth: 2,
        type: 'line',
      },
      {
        label: 'Mevcut Durum',
        data: Object.keys(yearlyData.goals).map(type => 
          yearlyData.progress[type] || 0
        ),
        backgroundColor: '#2196F3',
        borderColor: '#2196F3',
        borderWidth: 1,
        type: 'bar',
      }
    ]
  };

  const regionOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Bölgelere Göre Geri Dönüşüm Performansı',
        font: {
          size: 16
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Toplam Miktar (kg)'
        }
      },
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

  const yearlyOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Yıllık Hedefler ve Mevcut Durum'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Miktar (kg)'
        }
      }
    }
  };

  return (
    <div className="regional-charts-container">
      <h2 className="text-center mb-4">
        <i className="fas fa-chart-area me-2"></i>
        Bölgesel İstatistikler
      </h2>
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="chart-card">
            <Bar data={regionData} options={{
              ...regionOptions,
              maintainAspectRatio: false,
              aspectRatio: 1.5
            }} 
            height={300}
            />
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="chart-card">
            <Bar data={yearlyGoalsData} options={{
              ...yearlyOptions,
              maintainAspectRatio: false,
              aspectRatio: 1.5
            }}
            height={300}
            />
          </div>
        </div>
      </div>

      {/* Top Recyclers Section */}
      <div className="top-recyclers-section mt-4">
        <h3 className="text-center mb-4">
          <i className="fas fa-crown me-2 text-warning"></i>
          {currentMonth} Ayının En İyi Geri Dönüştürücüleri
        </h3>
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="top-recyclers-card">
              {topRecyclers && topRecyclers.length > 0 ? (
                topRecyclers.map((recycler, index) => (
                  <div 
                    key={recycler.kullaniciid} 
                    className={`top-recycler-item ${index === 0 ? 'top-recycler-winner' : ''}`}
                    onClick={() => handleProfileClick(recycler)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="rank">
                      {index === 0 && <i className="fas fa-trophy text-warning"></i>}
                      {index + 1}
                    </div>
                    <div className="recycler-info">
                      <span className="name">
                        {recycler.ad} {recycler.soyad}
                        <small className="text-muted ms-2">{recycler.email}</small>
                      </span>
                      <span className="amount">{recycler.toplamMiktar.toFixed(2)} kg</span>
                    </div>
                    {index === 0 && (
                      <div className="winner-badge">
                        <i className="fas fa-award text-warning"></i>
                        {currentMonth} Ayının Birincisi
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-info-circle text-muted mb-2"></i>
                  <p className="text-muted">Henüz veri bulunmamaktadır.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegionalCharts; 