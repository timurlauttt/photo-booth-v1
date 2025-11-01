import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import WebcamComponent from './components/Webcam';
import PhotoStrip from './components/PhotoStrip';
import './App.css';

function App() {
  const webcamRef = useRef(null);
  const stripRef = useRef(null);
  const [photos, setPhotos] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [filter, setFilter] = useState('none');
  const [photoCount, setPhotoCount] = useState(6);
  const [livePreview, setLivePreview] = useState(null);

  // Apply filter to image
  const applyFilter = useCallback((imageSrc, filterType) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, img.height);
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Mirror/flip horizontal
          ctx.translate(size, 0);
          ctx.scale(-1, 1);
          
          // Crop ke center square
          const startX = (img.width - size) / 2;
          const startY = (img.height - size) / 2;
          ctx.drawImage(img, startX, startY, size, size, 0, 0, size, size);

          // Reset transform untuk filter
          ctx.setTransform(1, 0, 0, 1, 0, 0);

          // Apply filter
          if (filterType === 'grayscale') {
            const imageData = ctx.getImageData(0, 0, size, size);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
              const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
              data[i] = avg;
              data[i + 1] = avg;
              data[i + 2] = avg;
            }
            ctx.putImageData(imageData, 0, 0);
          } else if (filterType === 'vintage') {
            // Low res vintage effect
            const tempCanvas = document.createElement('canvas');
            const tempSize = Math.floor(size / 3); // Low resolution
            tempCanvas.width = tempSize;
            tempCanvas.height = tempSize;
            const tempCtx = tempCanvas.getContext('2d');
            
            if (tempCtx) {
              // Draw small
              tempCtx.drawImage(canvas, 0, 0, tempSize, tempSize);
              
              // Apply sepia
              const imageData = tempCtx.getImageData(0, 0, tempSize, tempSize);
              const data = imageData.data;
              for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
                data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
                data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
              }
              tempCtx.putImageData(imageData, 0, 0);
              
              // Draw back large (pixelated effect)
              ctx.imageSmoothingEnabled = false;
              ctx.drawImage(tempCanvas, 0, 0, size, size);
            }
          }

          resolve(canvas.toDataURL('image/jpeg'));
        }
      };
      img.src = imageSrc;
    });
  }, []);

  // Update live preview from webcam
  useEffect(() => {
    const interval = setInterval(async () => {
      if (webcamRef.current && photos.length < photoCount) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          // Process live preview with same filter and flip as captured photos
          const processedPreview = await applyFilter(imageSrc, filter);
          setLivePreview(processedPreview);
        }
      }
    }, 100); // Update every 100ms for smooth preview

    return () => clearInterval(interval);
  }, [photos.length, photoCount, filter, applyFilter]);

  // Ambil 1 foto
  const capturePhoto = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      const processedImage = await applyFilter(imageSrc, filter);
      setPhotos(prev => [...prev, processedImage]);
    }
  }, [filter, applyFilter]);

  // Ambil 6 foto dengan countdown
  const startPhotoSession = useCallback(async () => {
    setPhotos([]);
    setIsCapturing(true);

    for (let i = 0; i < photoCount; i++) {
      // Countdown 3 detik
      for (let j = 3; j > 0; j--) {
        setCountdown(j);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setCountdown(null);
      capturePhoto();

      // Delay 1 detik sebelum foto berikutnya
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsCapturing(false);
  }, [capturePhoto, photoCount]);

  // Download hasil sebagai gambar
  const downloadStrip = useCallback(async () => {
    if (photos.length === photoCount) {
      // Buat canvas manual untuk hasil yang konsisten
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      // Ukuran canvas
      const photoSize = 180;
      const gap = 8;
      const padding = 24;
      const borderWidth = 8;
      const footerHeight = 80;

      const canvasWidth = (photoSize * 2) + gap + (padding * 2) + (borderWidth * 2);
      const rows = photoCount === 4 ? 2 : 3;
      const canvasHeight = (photoSize * rows) + (gap * (rows - 1)) + (padding * 2) + (borderWidth * 2) + footerHeight;

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Background putih
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Border hitam
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Area dalam putih
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(borderWidth, borderWidth, canvasWidth - (borderWidth * 2), canvasHeight - (borderWidth * 2));

      // Load dan draw semua foto
      const loadImage = (src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });
      };

      const images = await Promise.all(photos.map(src => loadImage(src)));

      // Draw foto dalam grid 2x3
      images.forEach((img, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);

        const x = borderWidth + padding + (col * (photoSize + gap));
        const y = borderWidth + padding + (row * (photoSize + gap));

        // Background abu untuk slot foto
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(x, y, photoSize, photoSize);

        // Draw foto - pastikan fill seluruh area
        ctx.drawImage(img, x, y, photoSize, photoSize);
      });

      // Footer
      const footerY = borderWidth + padding + (photoSize * rows) + (gap * (rows - 1)) + 12;

      // Garis pemisah
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(borderWidth + padding, footerY);
      ctx.lineTo(canvasWidth - borderWidth - padding, footerY);
      ctx.stroke();

      // Quote text
      ctx.fillStyle = '#000000';
      ctx.font = 'italic 11px Arial';
      ctx.textAlign = 'center';
      const quoteText = "Photography is the story I fail to put into words";
      ctx.fillText(quoteText, canvasWidth / 2, footerY + 20);

      // Author
      ctx.font = '10px Arial';
      ctx.fillStyle = '#666666';
      ctx.fillText('~ Destin Sparks', canvasWidth / 2, footerY + 35);

      // Date and time
      ctx.font = '10px Arial';
      ctx.fillStyle = '#666666';
      const dateStr = new Date().toLocaleString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      ctx.fillText(dateStr, canvasWidth / 2, footerY + 50);

      // Download
      const link = document.createElement('a');
      link.download = `photostrip-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  }, [photos, photoCount]);

  return (
    <div className="app">
      <div className="container">
        {/* Main Content - Side by Side */}
        <div className="main-content">
          {/* Webcam Component */}
          <WebcamComponent
            ref={webcamRef}
            filter={filter}
            countdown={countdown}
            isCapturing={isCapturing}
            onStartSession={startPhotoSession}
            onReset={() => setPhotos([])}
            onDownload={downloadStrip}
            photoCount={photoCount}
            setPhotoCount={setPhotoCount}
            setFilter={setFilter}
            photos={photos}
          />

          {/* Photo Strip Component */}
          <PhotoStrip
            ref={stripRef}
            photos={photos}
            photoCount={photoCount}
            livePreview={livePreview}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
