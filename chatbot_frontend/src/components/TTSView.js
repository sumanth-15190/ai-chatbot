import React, { useState, useEffect } from 'react';
import { Volume2, Square, Trash2 } from 'lucide-react';
import TopHeader from './TopHeader';

const TTSView = ({ isSidebarOpen, onToggleSidebar, user, onLoginClick, onProfileClick, onSettingsClick }) => {
  const [text, setText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [history, setHistory] = useState([]);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');

  useEffect(() => {
    const updateVoices = () => {
      if (!window.speechSynthesis) return;
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(availableVoices[0].name);
      }
    };

    updateVoices();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [selectedVoice]);

  const handlePlay = () => {
    if (!window.speechSynthesis) return;
    
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    if (!text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (selectedVoice) {
      const voice = voices.find(v => v.name === selectedVoice);
      if (voice) utterance.voice = voice;
    }
    
    utterance.onend = () => {
      setIsPlaying(false);
    };

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="chat-area" style={{ display: 'flex', flexDirection: 'column', height: '100vh', position: 'relative' }}>
      <TopHeader 
        title="Text-to-Speech Mode"
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={onToggleSidebar}
        user={user}
        onLoginClick={onLoginClick}
        onProfileClick={onProfileClick}
        onSettingsClick={onSettingsClick}
      />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', overflowY: 'auto' }}>
        {voices.length > 0 && (
        <select 
          value={selectedVoice} 
          onChange={(e) => setSelectedVoice(e.target.value)}
          style={{
            width: '90%',
            maxWidth: '800px',
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-md)',
            padding: '12px',
            marginBottom: '16px',
            color: 'var(--text-primary)',
            fontSize: '1rem',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          {voices.map(voice => (
            <option key={voice.name} value={voice.name} style={{ background: '#1a1a2e', color: 'white' }}>
              {voice.name} ({voice.lang})
            </option>
          ))}
        </select>
      )}

      <textarea 
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type or paste text here to have it read aloud..."
        style={{
          width: '90%',
          maxWidth: '800px',
          minHeight: '200px',
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          marginBottom: '40px',
          color: 'var(--text-primary)',
          fontSize: '1.2rem',
          lineHeight: '1.6',
          resize: 'vertical',
          fontFamily: 'inherit'
        }}
      />

      <button 
        onClick={handlePlay}
        disabled={!text.trim()}
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          border: 'none',
          background: isPlaying ? 'var(--accent-red)' : (text.trim() ? 'var(--accent-purple)' : 'var(--glass-bg)'),
          color: text.trim() ? 'white' : 'var(--text-muted)',
          fontSize: '2rem',
          cursor: text.trim() ? 'pointer' : 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isPlaying ? '0 0 20px var(--accent-red)' : (text.trim() ? '0 0 15px rgba(139, 92, 246, 0.4)' : 'none'),
          transition: 'all 0.3s ease'
        }}
        title="Play / Stop"
      >
        {isPlaying ? <Square size={32} fill="currentColor" /> : <Volume2 size={32} />}
      </button>
      <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>
        {isPlaying ? 'Playing... Click to stop.' : 'Click to hear the text'}
      </p>

      {text && (
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button 
            onClick={() => {
              setHistory(prev => [{ text, date: new Date() }, ...prev]);
              setText('');
            }}
            style={{ background: 'var(--accent-purple)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: '500' }}
          >
            Save to History
          </button>
          <button 
            onClick={() => setText('')}
            style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', padding: '8px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
          >
            Clear Text
          </button>
        </div>
      )}

      {history.length > 0 && (
        <div style={{ width: '90%', maxWidth: '800px', marginTop: '40px', textAlign: 'left' }}>
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: '16px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>Text-to-Speech History</h3>
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
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => setText(item.text)}
                    style={{ background: 'var(--accent-purple)', border: 'none', color: 'white', cursor: 'pointer', padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}
                    title="Load into textarea"
                  >
                    Load
                  </button>
                  <button 
                    onClick={() => setHistory(prev => prev.filter((_, i) => i !== index))}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default TTSView;
