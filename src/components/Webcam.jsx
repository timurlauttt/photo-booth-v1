import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import html2canvas from 'html2canvas';
import './App.css';

function App() {
    const webcamRef = useRef(null);
    const stripRef = useRef(null);
    const [photos, setPhotos] = useState([]);
    const [countdown, setCountdown] = useState(null);
    const [isCapturing, setIsCapturing] = useState(false);

    // Ambil 1 foto
    const capturePhoto = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setPhotos(prev => [...prev, imageSrc]);
        }
    }, []);

    // Ambil 6 foto dengan countdown
    const startPhotoSession = useCallback(async () => {
        setPhotos([]);
        setIsCapturing(true);

        for (let i = 0; i < 6; i++) {
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
    }, [capturePhoto]);

    // Download hasil sebagai gambar
    const downloadStrip = useCallback(async () => {
        if (stripRef.current) {
            const canvas = await html2canvas(stripRef.current, {
                backgroundColor: '#ffffff',
                scale: 2
            });

            const link = document.createElement('a');
            link.download = `photostrip-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
    }, []);

    return (
        <div className="app">
            <div className="container">
                <h1>📸 Photo Booth</h1>

                {/* Webcam Section */}
                <div className="webcam-section">
                    <div className="webcam-wrapper">
                        <Webcam
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{
                                width: 640,
                                height: 480,
                                facingMode: "user"
                            }}
                        />

                        {/* Countdown Overlay */}
                        {countdown && (
                            <div className="countdown-overlay">
                                <span className="countdown-number">{countdown}</span>
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="controls">
                        <button
                            onClick={startPhotoSession}
                            disabled={isCapturing}
                            className="btn btn-primary"
                        >
                            📸 Mulai Sesi Foto (6 Foto)
                        </button>

                        {photos.length === 6 && (
                            <>
                                <button
                                    onClick={() => setPhotos([])}
                                    className="btn btn-secondary"
                                >
                                    🔄 Ulangi
                                </button>
                                <button
                                    onClick={downloadStrip}
                                    className="btn btn-success"
                                >
                                    💾 Download
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Photo Strip Preview */}
                {photos.length > 0 && (
                    <div className="preview-section">
                        <h2>Preview:</h2>
                        <div ref={stripRef} className="photo-strip">
                            <div className="strip-border">
                                <div className="photo-grid">
                                    {Array.from({ length: 6 }).map((_, index) => (
                                        <div key={index} className="photo-slot">
                                            {photos[index] ? (
                                                <img
                                                    src={photos[index]}
                                                    alt={`Photo ${index + 1}`}
                                                />
                                            ) : (
                                                <div className="photo-placeholder">
                                                    {index + 1}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="strip-footer">
                                    <p className="strip-title">photobooth</p>
                                    <p className="strip-date">
                                        {new Date().toLocaleDateString('id-ID', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;