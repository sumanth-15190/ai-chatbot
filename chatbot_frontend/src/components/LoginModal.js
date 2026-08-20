import React, { useState } from 'react';
import MockGoogleLogin from './MockGoogleLogin';
import { API_BASE_URL } from '../services/api';

/**
 * LoginModal — Glassmorphic modal with Login/Sign Up tabs.
 * Uses localStorage for mock auth (demo-ready, no real backend needed).
 */
const LoginModal = ({ onClose, onLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [showMockGoogle, setShowMockGoogle] = useState(false);

  const handleGoogleSuccess = (mockUser) => {
    // Treat as successful login
    localStorage.setItem('nexusai_user', JSON.stringify(mockUser));
    
    // Simulate sending a welcome email
    alert(`📧 Email sent to ${mockUser.email}!\n\nThanks for logging on to OmniChat! You're going to love it here.`);
    
    onLogin(mockUser);
    onClose();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (formData.password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    try {
      const endpoint = '/auth/login';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Authentication failed');
        return;
      }

      // Store in localStorage
      const user = {
        name: data.user.name || data.user.email.split('@')[0],
        email: data.user.email,
        avatar: data.user.name
          ? data.user.name.charAt(0).toUpperCase()
          : data.user.email.charAt(0).toUpperCase(),
        id: data.user.id
      };

      localStorage.setItem('nexusai_user', JSON.stringify(user));
      onLogin(user);
      onClose();
    } catch (err) {
      setError('Failed to connect to the server');
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="login-modal">
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '500', margin: '0 0 12px 0' }}>Log in or sign up</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', margin: 0 }}>
            You'll get smarter responses and can<br/>upload files, images, and more.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          <button
            type="button"
            onClick={() => setShowMockGoogle(true)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
              padding: '14px', background: 'transparent',
              border: '1px solid var(--glass-border)', borderRadius: '24px',
              color: 'var(--text-primary)', fontSize: '16px', fontWeight: '500',
              cursor: 'pointer', transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'var(--glass-bg-hover)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" style={{ width: '20px', height: '20px' }} />
            Continue with Google
          </button>
          
          <button
            type="button"
            onClick={() => alert('Apple login not implemented yet')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
              padding: '14px', background: 'transparent',
              border: '1px solid var(--glass-border)', borderRadius: '24px',
              color: 'var(--text-primary)', fontSize: '16px', fontWeight: '500',
              cursor: 'pointer', transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'var(--glass-bg-hover)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontSize: '20px' }}></span>
            Continue with Apple
          </button>

          <button
            type="button"
            onClick={() => alert('Phone login not implemented yet')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
              padding: '14px', background: 'transparent',
              border: '1px solid var(--glass-border)', borderRadius: '24px',
              color: 'var(--text-primary)', fontSize: '16px', fontWeight: '500',
              cursor: 'pointer', transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'var(--glass-bg-hover)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontSize: '20px' }}>📞</span>
            Continue with phone
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', color: 'var(--text-secondary)' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
          <span style={{ padding: '0 16px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            style={{
              width: '100%', padding: '16px', background: 'transparent',
              border: '1px solid var(--glass-border)', borderRadius: '12px',
              color: 'var(--text-primary)', fontSize: '16px', boxSizing: 'border-box'
            }}
          />
          
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            style={{
              width: '100%', padding: '16px', background: 'transparent',
              border: '1px solid var(--glass-border)', borderRadius: '12px',
              color: 'var(--text-primary)', fontSize: '16px', boxSizing: 'border-box'
            }}
          />

          {error && (
            <div style={{ color: '#ef4444', fontSize: '14px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            style={{
              width: '100%', padding: '16px', background: '#fff',
              border: 'none', borderRadius: '24px',
              color: '#000', fontSize: '16px', fontWeight: '500',
              cursor: 'pointer', marginTop: '8px'
            }}
          >
            Continue
          </button>
        </form>
      </div>
      
      {showMockGoogle && (
        <MockGoogleLogin 
          onClose={() => setShowMockGoogle(false)} 
          onSuccess={handleGoogleSuccess} 
        />
      )}
    </div>
  );
};

export default LoginModal;
