import React, { useState } from 'react';

/**
 * MockGoogleLogin - A realistic simulation of the Google OAuth popup.
 * Provides mock accounts to choose from for demonstration purposes.
 */
const MockGoogleLogin = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const mockAccounts = [
    {
      id: 'g_1',
      name: 'Maddula Sumanth',
      email: 'maddulasumanth443@gmail.com',
      avatar: 'M',
      color: '#1a73e8'
    },
    {
      id: 'g_2',
      name: 'Dhoni',
      email: 'dhoni612202@gmail.com',
      avatar: 'D',
      color: '#e65100'
    }
  ];

  const handleSelectAccount = (account) => {
    setLoading(true);
    // Simulate network delay
    setTimeout(() => {
      onSuccess(account);
    }, 1200);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 10000,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      fontFamily: '"Google Sans", Roboto, Arial, sans-serif'
    }} onClick={onClose}>
      <div style={{
        background: '#202124',
        borderRadius: '16px',
        width: '840px',
        maxWidth: '90%',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
        overflow: 'hidden',
        color: '#e8eaed',
        border: '1px solid #3c4043'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Top Header */}
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '12px', 
          padding: '16px 24px', borderBottom: '1px solid #3c4043' 
        }}>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" 
            alt="Google" 
            style={{ width: '20px', height: '20px' }} 
          />
          <span style={{ fontSize: '16px', fontWeight: '500' }}>Sign in with Google</span>
        </div>

        {/* Main Content: 2-column layout */}
        <div style={{ display: 'flex', minHeight: '340px' }}>
          
          {/* Left Column */}
          <div style={{ flex: 1, padding: '40px', borderRight: '1px solid #3c4043' }}>
            <img src="/logo.png" alt="Logo" style={{ width: '48px', height: '48px', borderRadius: '12px', marginBottom: '24px', background: '#fff', padding: '4px' }} />
            <h1 style={{ margin: '0 0 12px 0', fontSize: '36px', fontWeight: '400', lineHeight: '1.2' }}>Choose an account</h1>
            <p style={{ margin: 0, fontSize: '18px', color: '#9aa0a6' }}>
              to continue to <span style={{ color: '#8ab4f8' }}>OmniChat</span>
            </p>
          </div>

          {/* Right Column */}
          <div style={{ flex: 1, padding: '40px 32px' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <div style={{
                  width: '32px', height: '32px', border: '3px solid #3c4043',
                  borderTop: '3px solid #8ab4f8', borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {mockAccounts.map((account, index) => (
                  <div 
                    key={account.id}
                    onClick={() => handleSelectAccount(account)}
                    style={{
                      display: 'flex', alignItems: 'center', padding: '16px 0',
                      cursor: 'pointer', borderBottom: '1px solid #3c4043',
                      transition: 'opacity 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                    onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: account.color, color: '#fff', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: '16px',
                      fontWeight: '500', marginRight: '16px', flexShrink: 0
                    }}>
                      {account.avatar}
                    </div>
                    <div>
                      <div style={{ fontWeight: '500', fontSize: '15px', color: '#e8eaed', marginBottom: '4px' }}>{account.name}</div>
                      <div style={{ fontSize: '13px', color: '#9aa0a6' }}>{account.email}</div>
                    </div>
                  </div>
                ))}

                <div style={{
                  display: 'flex', alignItems: 'center', padding: '16px 0',
                  cursor: 'pointer', color: '#e8eaed', fontWeight: '500', fontSize: '15px',
                  borderBottom: '1px solid #3c4043', transition: 'opacity 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                onClick={onClose}
                >
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    border: '2px solid #9aa0a6', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', marginRight: '22px', marginLeft: '6px'
                  }}>
                    <div style={{ width: '10px', height: '2px', background: '#9aa0a6', position: 'absolute' }}></div>
                    <div style={{ width: '10px', height: '2px', background: '#9aa0a6', position: 'absolute', transform: 'rotate(90deg)' }}></div>
                  </div>
                  Use another account
                </div>

                <div style={{ fontSize: '13px', color: '#9aa0a6', marginTop: '32px', lineHeight: '1.5' }}>
                  Before using this app, you can review OmniChat's <span style={{ color: '#8ab4f8', cursor: 'pointer' }}>Privacy Policy</span> and <span style={{ color: '#8ab4f8', cursor: 'pointer' }}>Terms of Service</span>.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', padding: '16px 24px',
          borderTop: '1px solid #3c4043', fontSize: '13px', color: '#9aa0a6',
          background: '#1a1b1e'
        }}>
          <div style={{ cursor: 'pointer' }}>English (United Kingdom) ▼</div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <span style={{ cursor: 'pointer' }}>Help</span>
            <span style={{ cursor: 'pointer' }}>Privacy</span>
            <span style={{ cursor: 'pointer' }}>Terms</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockGoogleLogin;
