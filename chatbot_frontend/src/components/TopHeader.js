import React from 'react';

const TopHeader = ({ title, isSidebarOpen, onToggleSidebar, user, onLoginClick, onProfileClick, onSettingsClick }) => {
  return (
    <div className="chat-header">
      <div className="chat-header-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {!isSidebarOpen && (
          <button 
            onClick={onToggleSidebar}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.2rem', padding: '4px' }}
            title="Open sidebar"
          >
            ◫
          </button>
        )}
        <h2>{title}</h2>
      </div>
      <div className="chat-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button className="header-action-btn" onClick={onSettingsClick} title="Settings" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '4px' }}>
          ⚙️
        </button>
        
        {user ? (
          <div 
            onClick={onProfileClick}
            style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: '#8a2be2', color: '#fff', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: '16px',
              fontWeight: '600', position: 'relative', cursor: 'pointer'
            }}>
              {user.avatar || user.name.charAt(0).toUpperCase()}
              <div style={{
                position: 'absolute', bottom: '0', right: '0',
                width: '10px', height: '10px', background: '#10b981',
                borderRadius: '50%', border: '2px solid var(--bg-primary)'
              }}></div>
          </div>
        ) : (
          <button className="login-btn" onClick={onLoginClick} style={{ padding: '8px 16px', borderRadius: '20px', background: 'var(--primary-color)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
            Sign In
          </button>
        )}
      </div>
    </div>
  );
};

export default TopHeader;
