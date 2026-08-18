import React, { useState } from 'react';
import { User, Settings, Sun, Moon, LogOut, X, Check, XCircle } from 'lucide-react';

const UserProfileModal = ({ user, onClose, onLogout, theme, onToggleTheme, onSettingsClick, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');

  if (!user) return null;

  const handleSave = () => {
    if (editName.trim() && editEmail.trim()) {
      onUpdateUser({ name: editName.trim(), email: editEmail.trim() });
      setIsEditing(false);
    }
  };

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
        width: '400px',
        maxWidth: '90%',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--glass-border)',
        overflow: 'hidden',
        color: 'var(--text-primary)'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--glass-border)' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Account Details</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Profile Info */}
        <div style={{ padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: '#8a2be2', color: '#fff', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: '32px',
            fontWeight: '600', marginBottom: '16px', position: 'relative'
          }}>
            {user.avatar || user.name.charAt(0).toUpperCase()}
            <div style={{
              position: 'absolute', bottom: '2px', right: '2px',
              width: '16px', height: '16px', background: '#10b981',
              borderRadius: '50%', border: '3px solid var(--bg-secondary)'
            }}></div>
          </div>
          
          {isEditing ? (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <input 
                type="text" 
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your Name"
                style={{
                  width: '80%', padding: '10px 14px', borderRadius: '8px',
                  background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                  color: 'var(--text-primary)', fontSize: '16px', outline: 'none', textAlign: 'center'
                }}
              />
              <input 
                type="email" 
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="Your Email"
                style={{
                  width: '80%', padding: '10px 14px', borderRadius: '8px',
                  background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                  color: 'var(--text-primary)', fontSize: '14px', outline: 'none', textAlign: 'center'
                }}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button onClick={handleSave} style={{
                  padding: '8px 16px', background: '#10b981', color: 'white', border: 'none',
                  borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '500'
                }}>
                  <Check size={16} /> Save
                </button>
                <button onClick={() => { setIsEditing(false); setEditName(user.name); setEditEmail(user.email); }} style={{
                  padding: '8px 16px', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)',
                  borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '500'
                }}>
                  <XCircle size={16} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '600' }}>{user.name}</h3>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>{user.email}</p>
            </>
          )}
        </div>

        {/* Actions */}
        <div style={{ padding: '12px' }}>
          {!isEditing && (
            <button style={{
              width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px',
              background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '15px',
              cursor: 'pointer', borderRadius: '8px', transition: 'background 0.2s'
            }} onClick={() => setIsEditing(true)} onMouseOver={(e) => e.currentTarget.style.background = 'var(--glass-bg-hover)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
              <User size={18} /> Edit Profile
            </button>
          )}
          
          <button style={{
            width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px',
            background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '15px',
            cursor: 'pointer', borderRadius: '8px', transition: 'background 0.2s'
          }} onClick={onSettingsClick} onMouseOver={(e) => e.currentTarget.style.background = 'var(--glass-bg-hover)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
            <Settings size={18} /> Settings
          </button>

          <button style={{
            width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px',
            background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '15px',
            cursor: 'pointer', borderRadius: '8px', transition: 'background 0.2s'
          }} onClick={onToggleTheme} onMouseOver={(e) => e.currentTarget.style.background = 'var(--glass-bg-hover)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />} {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>

          <div style={{ height: '1px', background: 'var(--glass-border)', margin: '8px 0' }}></div>

          <button style={{
            width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px',
            background: 'transparent', border: 'none', color: '#ef4444', fontSize: '15px',
            cursor: 'pointer', borderRadius: '8px', transition: 'background 0.2s'
          }} onClick={() => { onClose(); onLogout(); }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
