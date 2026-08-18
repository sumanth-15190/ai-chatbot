import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Mic } from 'lucide-react';
import TopHeader from './TopHeader';

const STTView = ({ isSidebarOpen, onToggleSidebar, user, onLoginClick, onProfileClick, onSettingsClick }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [history, setHistory] = useState([]);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(prev => prev + (prev ? ' ' : '') + currentTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  return (
    <div className="chat-area" style={{ display: 'flex', flexDirection: 'column', height: '100vh', position: 'relative' }}>
      <TopHeader 
        title="Speech-to-Text Mode"
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={onToggleSidebar}
        user={user}
        onLoginClick={onLoginClick}
        onProfileClick={onProfileClick}
        onSettingsClick={onSettingsClick}
      />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', overflowY: 'auto' }}>
        <div 
        style={{
          width: '90%',
          maxWidth: '800px',
          minHeight: '200px',
          maxHeight: '400px',
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          marginBottom: '40px',
          color: 'var(--text-primary)',
          fontSize: '1.2rem',
          lineHeight: '1.6',
          overflowY: 'auto',
          textAlign: 'left'
        }}
      >
        {transcript || <span style={{ color: 'var(--text-muted)' }}>Your speech will appear here...</span>}
      </div>

      <button 
        onClick={toggleRecording}
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          border: 'none',
          background: isRecording ? 'var(--accent-red)' : 'var(--accent-purple)',
          color: 'white',
          fontSize: '2rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isRecording ? '0 0 20px var(--accent-red)' : '0 0 15px rgba(139, 92, 246, 0.4)',
          transition: 'all 0.3s ease'
        }}
        title="Toggle Recording"
      >
        <Mic size={32} />
      </button>
      <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>
        {isRecording ? 'Listening... Click to stop.' : 'Click the microphone to start speaking'}
      </p>
      
      {transcript && (
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button 
            onClick={() => {
              setHistory(prev => [{ text: transcript, date: new Date() }, ...prev]);
              setTranscript('');
            }}
            style={{ background: 'var(--accent-purple)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: '500' }}
          >
            Save to History
          </button>
          <button 
            onClick={() => setTranscript('')}
            style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', padding: '8px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
          >
            Discard
          </button>
        </div>
      )}

      {history.length > 0 && (
        <div style={{ width: '90%', maxWidth: '800px', marginTop: '40px', textAlign: 'left' }}>
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: '16px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>Transcription History</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {history.map((item, index) => (
              <div key={index} style={{ background: 'var(--glass-bg)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    {item.date.toLocaleString()}
                  </div>
                  <div style={{ color: 'var(--text-primary)', lineHeight: '1.5' }}>
                    {item.text}
                  </div>
                </div>
                <button 
                  onClick={() => setHistory(prev => prev.filter((_, i) => i !== index))}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default STTView;
