import React, { useState, useEffect } from 'react';
import { getImages } from '../services/api';
import TopHeader from './TopHeader';
import './Views.css';

const ImagesView = ({ isSidebarOpen, onToggleSidebar, user, onLoginClick, onProfileClick, onSettingsClick }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const data = await getImages();
        setImages(data.files || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  return (
    <div className={`chat-area ${isSidebarOpen ? '' : 'sidebar-closed'}`} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'hidden' }}>
      <TopHeader 
        title="🖼️ Images"
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={onToggleSidebar}
        user={user}
        onLoginClick={onLoginClick}
        onProfileClick={onProfileClick}
        onSettingsClick={onSettingsClick}
      />

      {/* Content */}
      <div className="view-content" style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Here you can view all uploaded images.
        </p>

        {loading ? (
          <div style={{ color: 'var(--text-secondary)' }}>Loading images...</div>
        ) : error ? (
          <div style={{ color: '#ef4444' }}>Error loading images: {error}</div>
        ) : images.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)' }}>No images found.</div>
        ) : (
          <div className="image-grid">
            {images.map((image, idx) => (
              <div key={idx} className="image-card">
                <img 
                  src={`http://localhost:5000/api${image.url}`} 
                  alt={image.name} 
                  className="image-thumbnail"
                />
                <div className="image-name" title={image.name}>{image.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagesView;
