import React from 'react';

/**
 * LogoutModal - Confirmation dialog for logging out.
 * Matches the requested dark theme UI.
 */
const LogoutModal = ({ user, onConfirm, onCancel }) => {
  if (!user) return null;

  // Simple hash function to generate consistent colors based on email
  const getAvatarColor = (email) => {
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ['#9c27b0', '#673ab7', '#3f51b5', '#009688', '#e91e63', '#ff9800', '#f44336'];
    return colors[Math.abs(hash) % colors.length];
  };

  const avatarColor = getAvatarColor(user.email);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 10000,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      fontFamily: '"Google Sans", Roboto, Arial, sans-serif'
    }} onClick={onCancel}>
      <div style={{
        background: '#202124',
        borderRadius: '16px',
        width: '400px',
        maxWidth: '90%',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
        padding: '32px',
        color: '#e8eaed',
        border: '1px solid #3c4043',
        textAlign: 'center'
      }} onClick={(e) => e.stopPropagation()}>
        
        <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: '500', lineHeight: '1.3' }}>
          Are you sure you<br/>want to log out?
        </h2>

        {/* Profile Card */}
        <div style={{
          display: 'flex', alignItems: 'center', padding: '16px',
          border: '1px solid #3c4043', borderRadius: '12px',
          marginBottom: '24px', textAlign: 'left', background: '#202124'
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: avatarColor, color: '#fff', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: '16px',
            fontWeight: '500', marginRight: '16px', flexShrink: 0
          }}>
            {user.avatar || user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: '500', fontSize: '15px', color: '#e8eaed', marginBottom: '2px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user.name}
            </div>
            <div style={{ fontSize: '14px', color: '#9aa0a6', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user.email}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={onConfirm}
            style={{
              width: '100%', padding: '14px', background: '#fff',
              border: 'none', borderRadius: '24px',
              color: '#000', fontSize: '15px', fontWeight: '500',
              cursor: 'pointer', transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#f1f3f4'}
            onMouseOut={(e) => e.currentTarget.style.background = '#fff'}
          >
            Log out
          </button>
          
          <button
            onClick={onCancel}
            style={{
              width: '100%', padding: '14px', background: 'transparent',
              border: '1px solid #3c4043', borderRadius: '24px',
              color: '#fff', fontSize: '15px', fontWeight: '500',
              cursor: 'pointer', transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#303134'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
