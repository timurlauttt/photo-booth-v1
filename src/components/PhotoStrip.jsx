import { forwardRef } from 'react';

const PhotoStrip = forwardRef(({ photos, photoCount, livePreview, gifMode, allStrips, videoUrl }, ref) => {
  // Jika mode GIF dan ada strips, tampilkan semua strips + GIF preview
  if (gifMode && allStrips && allStrips.length > 0) {
    return (
      <div className="preview-section">
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Photo Sessions</h2>
        <div className="all-strips-container">
          {allStrips.map((strip, stripIndex) => (
            <div key={stripIndex} className="photo-strip-wrapper">
              <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>Session {stripIndex + 1}</h3>
              <div className="photo-strip">
                <div className="strip-border">
                  <div className={`photo-grid photo-grid-${strip.length}`}>
                    {strip.map((photo, photoIndex) => (
                      <div key={photoIndex} className="photo-slot">
                        <img
                          src={photo}
                          alt={`Session ${stripIndex + 1} - Photo ${photoIndex + 1}`}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="strip-footer">

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
          ))}
        </div>

        {/* Video Preview */}
        {videoUrl && (
          <div className="gif-preview-section">
            <h2 style={{ textAlign: 'center', marginTop: '30px', marginBottom: '20px' }}>🎬 Video Preview</h2>
            <div className="gif-preview">
              <video src={videoUrl} controls loop autoPlay muted style={{ maxWidth: '100%', borderRadius: '4px' }} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Mode normal: tampilkan single strip
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