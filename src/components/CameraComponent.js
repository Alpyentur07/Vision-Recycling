import React, { useState, useRef } from 'react';
import './CameraComponent.css';

function CameraComponent() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setIsStreaming(true);
    } catch (err) {
      console.error("Kamera açılamadı:", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      setIsStreaming(false);
      setCapturedImage(null);
    }
  };

  const captureImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg');
    setCapturedImage(imageData);
  };

  const classifyImage = async () => {
    if (!capturedImage) return;

    // Base64 görüntüyü Blob'a çevir
    const response = await fetch(capturedImage);
    const blob = await response.blob();

    // FormData oluştur
    const formData = new FormData();
    formData.append('image', blob, 'captured-image.jpg');

    try {
      const res = await fetch('http://localhost:3002/api/model/classify', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setPrediction(data);
    } catch (error) {
      console.error('Sınıflandırma hatası:', error);
    }
  };

  return (
    <div className="camera-container">
      <div className="camera-controls">
        {!isStreaming ? (
          <button onClick={startCamera}>Kamerayı Aç</button>
        ) : (
          <>
            <button onClick={stopCamera}>Kamerayı Kapat</button>
            <button onClick={captureImage}>Görüntü Al</button>
          </>
        )}
      </div>

      <div className="camera-view">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{ display: isStreaming ? 'block' : 'none' }}
        />
        {capturedImage && (
          <div className="captured-image">
            <img src={capturedImage} alt="Captured" />
            <button onClick={classifyImage}>Sınıflandır</button>
          </div>
        )}
      </div>

      {prediction && (
        <div className="prediction-result">
          <h3>Sınıflandırma Sonucu:</h3>
          <p>Tür: {prediction.class}</p>
          <p>Güven: {prediction.confidence.toFixed(2)}%</p>
        </div>
      )}
    </div>
  );
}

export default CameraComponent; 