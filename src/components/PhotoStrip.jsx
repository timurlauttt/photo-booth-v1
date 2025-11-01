import { forwardRef } from 'react';

const PhotoStrip = forwardRef(({ photos, photoCount, livePreview }, ref) => {
  return (
    <div className="preview-section">
      <div ref={ref} className="photo-strip">
        <div className="strip-border">
          <div className={`photo-grid photo-grid-${photoCount}`}>
            {Array.from({ length: photoCount }).map((_, index) => (
              <div key={index} className="photo-slot">
                {photos[index] ? (
                  <img
                    src={photos[index]}
                    alt={`Photo ${index + 1}`}
                  />
                ) : livePreview && index === photos.length ? (
                  <img
                    src={livePreview}
                    alt="Live preview"
                    className="live-preview"
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
            <p className="strip-title">Photography is the story I fail to put into words</p>
            <p className="strip-subtitle">~ Destin Sparks</p>
            <p className="strip-date">
              {new Date().toLocaleString('id-ID', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

PhotoStrip.displayName = 'PhotoStrip';

export default PhotoStrip;