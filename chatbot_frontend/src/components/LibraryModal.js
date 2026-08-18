import React, { useState, useEffect } from 'react';
import { getLibrary, getImages } from '../services/api';
import { FileText, Image as ImageIcon, X } from 'lucide-react';

const LibraryModal = ({ onClose, onSelect }) => {
  const [activeTab, setActiveTab] = useState('library');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      try {
        if (activeTab === 'library') {
          const data = await getLibrary();
          setFiles(data.files || []);
        } else {
          const data = await getImages();
          setFiles(data.files || []);
        }
      } catch (error) {
        console.error('Error fetching files:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, [activeTab]);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: 'var(--bg-secondary)', width: '90%', maxWidth: '600px',
        borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)',
        display: 'flex', flexDirection: 'column', maxHeight: '80vh'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid var(--glass-border)' }}>
          <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.2rem' }}>Add from Library</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)' }}>
          <button 
            onClick={() => setActiveTab('library')}
            style={{ flex: 1, padding: '12px', background: activeTab === 'library' ? 'var(--glass-bg-hover)' : 'transparent', border: 'none', color: activeTab === 'library' ? 'var(--text-primary)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Documents
          </button>
          <button 
            onClick={() => setActiveTab('images')}
            style={{ flex: 1, padding: '12px', background: activeTab === 'images' ? 'var(--glass-bg-hover)' : 'transparent', border: 'none', color: activeTab === 'images' ? 'var(--text-primary)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Images
          </button>
        </div>

        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>Loading...</div>
          ) : files.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
              No {activeTab === 'library' ? 'documents' : 'images'} found in your library.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {files.map((file, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const filename = typeof file === 'string' ? file : file.name;
                    onSelect(filename, activeTab === 'library' ? 'document' : 'image');
                    onClose();
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                    background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-primary)',
                    textAlign: 'left', transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'var(--glass-bg-hover)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'var(--glass-bg)'}
                >
                  {activeTab === 'library' ? <FileText size={20} color="var(--accent-blue)" /> : <ImageIcon size={20} color="var(--accent-green)" />}
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {typeof file === 'string' ? file : file.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LibraryModal;
