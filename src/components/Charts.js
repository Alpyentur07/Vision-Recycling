import React from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
} from 'chart.js';
import './Charts.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

function Charts({ recycledItems }) {
  // Ay ay toplanan materyal miktarını hesapla
  const calculateMonthlyData = () => {
    const monthlyData = {};
    recycledItems.forEach(item => {
      const date = new Date(item.tarih);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          total: 0,
          byType: {}
        };
      }
      monthlyData[monthYear].total += parseFloat(item.miktar);
      
      if (!monthlyData[monthYear].byType[item.atikturuadi]) {
        monthlyData[monthYear].byType[item.atikturuadi] = 0;
      }
      monthlyData[monthYear].byType[item.atikturuadi] += parseFloat(item.miktar);
    });
    return monthlyData;
  };

  // Atık türlerine göre toplam miktarı hesapla
  const calculateTotalsByType = () => {
    const totals = {};
    recycledItems.forEach(item => {
      if (!totals[item.atikturuadi]) {
        totals[item.atikturuadi] = 0;
      }
      totals[item.atikturuadi] += parseFloat(item.miktar);
    });
    return totals;
  };

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
      // Kullanımı: "Kocaeli, İzmit, Yahya Kaptan Mah." -> "İzmit"
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
      'Plastik': 1200, // Yıllık 1200 kg hedef
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

  const monthlyData = calculateMonthlyData();
  const totalsByType = calculateTotalsByType();
  const regionPerformance = calculateRegionPerformance();
  const yearlyData = calculateYearlyGoals();

  // Çubuk grafik verisi
  const barData = {
    labels: Object.keys(monthlyData),
    datasets: [
      {
        label: 'Toplam Miktar (kg)',
        data: Object.values(monthlyData).map(data => data.total),
        backgroundColor: '#00224D',
        borderColor: '#00224D',
        borderWidth: 1,
      }
    ]
  };

  // Pasta grafik verisi
  const pieData = {
    labels: Object.keys(totalsByType),
    datasets: [
      {
        data: Object.values(totalsByType),
        backgroundColor: [
          '#4CAF50', // Yeşil
          '#2196F3', // Mavi
          '#9C27B0', // Mor
          '#FF9800', // Turuncu
        ],
        borderWidth: 1,
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Aylık Geri Dönüşüm Miktarı'
      }
    }
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Atık Türlerine Göre Dağılım'
      }
    }
  };

  return (
    <div className="charts-container">
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="chart-card">
            <Bar data={barData} options={options} />
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="chart-card">
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Charts; 