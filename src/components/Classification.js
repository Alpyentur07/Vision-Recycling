import React, { useState } from 'react';
import './Classification.css';

function Classification({ navigateToHome }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Dosya tipini kontrol et
      if (!file.type.match('image/(jpeg|jpg|png)')) {
        setError('Lütfen sadece JPG, JPEG veya PNG formatında resim yükleyin.');
        return;
      }
      
      // Dosyayı önizle
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const classifyImage = async () => {
    if (!selectedImage) {
      setError('Lütfen önce bir resim yükleyin');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Base64'ten Blob'a çevir
      const response = await fetch(selectedImage);
      const blob = await response.blob();

      // FormData oluştur
      const formData = new FormData();
      formData.append('image', blob, 'uploaded-image.jpg');

      const res = await fetch('http://localhost:3002/api/model/classify', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Sınıflandırma başarısız oldu');
      }

      const data = await res.json();
      setPrediction(data);
    } catch (error) {
      console.error('Sınıflandırma hatası:', error);
      setError('Sınıflandırma sırasında bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="classification-container">
      <h2 className="text-center mb-4">
        <i className="fas fa-upload me-2"></i>
        Resim Yükleyerek Sınıflandır
      </h2>

      <div className="upload-container">
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleImageUpload}
          className="file-input"
          id="imageUpload"
        />
        <label htmlFor="imageUpload" className="upload-label">
          <i className="fas fa-cloud-upload-alt"></i>
          <span>Resim Seç veya Sürükle Bırak</span>
          <small>JPG, JPEG veya PNG</small>
        </label>

        {selectedImage && (
          <div className="preview-container">
            <h4>Seçilen Resim:</h4>
            <img src={selectedImage} alt="Preview" className="preview-image" />
            <button 
              className="btn btn-primary mt-3"
              onClick={classifyImage}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Sınıflandırılıyor...
                </>
              ) : (
                <>
                  <i className="fas fa-magic me-2"></i>
                  Sınıflandır
                </>
              )}
            </button>
          </div>
        )}

        {error && (
          <div className="alert alert-danger mt-3">
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
          </div>
        )}

        {prediction && !error && (
          <div className="alert alert-success mt-4">
            <div className="prediction-details">
              <h4>Sınıflandırma Sonucu:</h4>
              <p className="mb-2">
                Bu atık <strong>{prediction.class.toUpperCase()}</strong>!
              </p>
              <div className="confidence-bar">
                <div className="progress" style={{height: "25px"}}>
                  <div 
                    className="progress-bar" 
                    role="progressbar" 
                    style={{width: `${prediction.confidence}%`, backgroundColor: '#2E7D32'}}
                    aria-valuenow={prediction.confidence} 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  >
                    {prediction.confidence.toFixed(2)}% Güven
                  </div>
                </div>
              </div>
              
              {/* Tüm sınıfların olasılıkları - Kontrol ekledik */}
              {prediction.all_probabilities && (
                <div className="all-probabilities mt-3">
                  <h5>Tüm Sınıf Olasılıkları:</h5>
                  {Object.entries(prediction.all_probabilities).map(([className, prob]) => (
                    <div key={className} className="probability-item">
                      <span className="class-name">{className.toUpperCase()}</span>
                      <div className="progress mt-1 mb-2">
                        <div 
                          className="progress-bar" 
                          role="progressbar"
                          style={{
                            width: `${prob}%`,
                            backgroundColor: className === prediction.class ? '#2E7D32' : '#FF9D23'
                          }}
                          aria-valuenow={prob}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        > 
                          {prob.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <button 
          className="btn btn-secondary mt-4"
          onClick={navigateToHome}
        >
          <i className="fas fa-arrow-left me-2"></i>
          Anasayfaya Dön
        </button>
      </div>
    </div>
  );
}

export default Classification; 