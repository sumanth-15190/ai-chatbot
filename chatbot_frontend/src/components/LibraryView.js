import React, { useState, useEffect } from 'react';
import { getLibrary, API_BASE_URL } from '../services/api';
import TopHeader from './TopHeader';
import './Views.css';

const LibraryView = ({ isSidebarOpen, onToggleSidebar, user, onLoginClick, onProfileClick, onSettingsClick }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const data = await getLibrary();
        setFiles(data.files || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLibrary();
  }, []);

  return (
    <div className={`chat-area ${isSidebarOpen ? '' : 'sidebar-closed'}`} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'hidden' }}>
      <TopHeader 
        title="📚 Document Library"
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
          Here you can view all documents (PDFs, TXT, etc.) that have been uploaded to the knowledge base.
        </p>

        {loading ? (
          <div style={{ color: 'var(--text-secondary)' }}>Loading library...</div>
        ) : error ? (
          <div style={{ color: '#ef4444' }}>Error loading library: {error}</div>
        ) : files.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)' }}>No documents found in the library.</div>
        ) : (
          <div className="file-grid">
            {files.map((file, idx) => (
              <div key={idx} className="file-card">
                <div className="file-icon">📄</div>
                <div className="file-name" title={file.name}>{file.name}</div>
                <a href={`${API_BASE_URL}${file.url}`} target="_blank" rel="noreferrer" className="file-download-btn">
                  View
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryView;
