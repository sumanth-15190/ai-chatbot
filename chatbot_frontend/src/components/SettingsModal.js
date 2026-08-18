import React, { useState } from 'react';
import { X, Info, ShieldAlert, FileText } from 'lucide-react';

const SettingsModal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('about');

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 10000,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      fontFamily: '"Google Sans", Inter, sans-serif'
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: '16px',
        width: '600px',
        maxWidth: '95%',
        height: '500px',
        maxHeight: '90vh',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--glass-border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        color: 'var(--text-primary)'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--glass-border)' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Settings & Information</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Sidebar */}
          <div style={{ width: '200px', borderRight: '1px solid var(--glass-border)', background: 'var(--glass-bg)', padding: '16px 8px' }}>
            <button 
              onClick={() => setActiveTab('about')}
              style={{
                width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px',
                background: activeTab === 'about' ? 'var(--glass-bg-hover)' : 'transparent', border: 'none', 
                color: activeTab === 'about' ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: '15px',
                cursor: 'pointer', borderRadius: '8px', transition: 'all 0.2s', textAlign: 'left', fontWeight: activeTab === 'about' ? '500' : '400'
              }}
            >
              <Info size={18} /> About OmniChat
            </button>
            <button 
              onClick={() => setActiveTab('restrictions')}
              style={{
                width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px',
                background: activeTab === 'restrictions' ? 'var(--glass-bg-hover)' : 'transparent', border: 'none', 
                color: activeTab === 'restrictions' ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: '15px',
                cursor: 'pointer', borderRadius: '8px', transition: 'all 0.2s', textAlign: 'left', fontWeight: activeTab === 'restrictions' ? '500' : '400', marginTop: '4px'
              }}
            >
              <ShieldAlert size={18} /> Restrictions
            </button>
            <button 
              onClick={() => setActiveTab('privacy')}
              style={{
                width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px',
                background: activeTab === 'privacy' ? 'var(--glass-bg-hover)' : 'transparent', border: 'none', 
                color: activeTab === 'privacy' ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: '15px',
                cursor: 'pointer', borderRadius: '8px', transition: 'all 0.2s', textAlign: 'left', fontWeight: activeTab === 'privacy' ? '500' : '400', marginTop: '4px'
              }}
            >
              <FileText size={18} /> Privacy Policy
            </button>
          </div>

          {/* Main Panel */}
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
            {activeTab === 'about' && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                  <img src="/logo.png" alt="Logo" style={{ width: '64px', height: '64px', borderRadius: '16px' }} />
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '24px' }}>OmniChat</h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Version 1.0.0 (Beta)</p>
                  </div>
                </div>
                <p style={{ lineHeight: '1.6', color: 'var(--text-primary)', marginBottom: '16px' }}>
                  OmniChat is your intelligent, all-in-one conversational AI assistant. Designed with a stunning glassmorphic interface, it seamlessly blends advanced capabilities with an intuitive user experience.
                </p>
                <div style={{ background: 'var(--glass-bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Core Features:</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                    <li>Real-time Web Search & Weather</li>
                    <li>Advanced Speech-to-Text capabilities</li>
                    <li>Natural Text-to-Speech voices</li>
                    <li>Code generation and debugging</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'restrictions' && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldAlert size={24} color="#ef4444" /> Usage Restrictions
                </h3>
                <p style={{ lineHeight: '1.6', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                  To ensure a safe, fair, and optimal experience for everyone, OmniChat operates under the following guidelines and restrictions.
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#ef4444', fontSize: '16px' }}>Content Policy</h4>
                    <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', color: 'var(--text-primary)' }}>
                      OmniChat is strictly prohibited from generating illegal, harmful, sexually explicit, or hateful content. Violating these guidelines may result in account suspension.
                    </p>
                  </div>
                  
                  <div style={{ padding: '16px', background: 'var(--glass-bg)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)', fontSize: '16px' }}>Rate Limits</h4>
                    <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                      Free tier users are limited to <strong>50 messages per hour</strong>. Attachments are limited to <strong>10MB</strong> per file.
                    </p>
                  </div>

                  <div style={{ padding: '16px', background: 'var(--glass-bg)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)', fontSize: '16px' }}>API Usage</h4>
                    <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                      Automated scraping or reverse engineering of the OmniChat API endpoints is strictly prohibited.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FileText size={24} color="#3b82f6" /> Privacy Policy
                </h3>
                <p style={{ lineHeight: '1.6', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                  Your privacy is our priority. We are transparent about how your data is handled.
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ padding: '16px', background: 'var(--glass-bg)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)', fontSize: '16px' }}>Data Storage</h4>
                    <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                      Conversation histories are stored locally on your device for fast access and privacy. Only the data required to generate AI responses is sent to our secure backend temporarily.
                    </p>
                  </div>
                  
                  <div style={{ padding: '16px', background: 'var(--glass-bg)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)', fontSize: '16px' }}>No Data Selling</h4>
                    <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                      We <strong>never</strong> sell your personal data or conversation history to third-party advertisers.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
