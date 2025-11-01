import { forwardRef } from 'react';
import Webcam from 'react-webcam';

const WebcamComponent = forwardRef(({ 
  filter, 
  countdown, 
  isCapturing, 
  onStartSession, 
  onReset, 
  onDownload, 
  photoCount, 
  setPhotoCount,
  setFilter,
  photos
}, ref) => {
  return (
    <div className="webcam-section">
      <div className={`webcam-wrapper filter-${filter}`}>
        <Webcam
          ref={ref}
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

      {/* Filter Controls */}
      <div className="filter-controls">
        <button 
          onClick={() => setFilter('none')}
          className={`btn-filter ${filter === 'none' ? 'active' : ''}`}
        >
          Normal
        </button>
        <button 
          onClick={() => setFilter('grayscale')}
          className={`btn-filter ${filter === 'grayscale' ? 'active' : ''}`}
        >
          Black & White
        </button>
      </div>

      {/* Photo Count Controls */}
      <div className="photo-count-controls">
        <button 
          onClick={() => setPhotoCount(4)}
          className={`btn-filter ${photoCount === 4 ? 'active' : ''}`}
          disabled={isCapturing}
        >
          4 Photos
        </button>
        <button 
          onClick={() => setPhotoCount(6)}
          className={`btn-filter ${photoCount === 6 ? 'active' : ''}`}
          disabled={isCapturing}
        >
          6 Photos
        </button>
      </div>

      {/* Controls */}
      <div className="controls">
        <button 
          onClick={onStartSession}
          disabled={isCapturing}
          className="btn btn-primary"
        >
          Start Photo Session ({photoCount} Photos)
        </button>
        
        {photos.length === photoCount && (
          <>
            <button 
              onClick={onReset}
              className="btn btn-secondary"
            >
              Reset
            </button>
            
            <button 
              onClick={onDownload}
              className="btn btn-success"
            >
              Download
            </button>
          </>
        )}
      </div>
    </div>
  );
});

WebcamComponent.displayName = 'WebcamComponent';

export default WebcamComponent;