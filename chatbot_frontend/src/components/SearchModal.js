import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MessageSquare, Clock } from 'lucide-react';

const SearchModal = ({ conversations, onSelectConversation, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    // Focus the input when modal opens
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Filter conversations by title or messages content
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    
    // Check title
    if (conv.title && conv.title.toLowerCase().includes(query)) {
      return true;
    }
    
    // Check messages
    if (conv.messages) {
      return conv.messages.some(msg => 
        msg.content && msg.content.toLowerCase().includes(query)
      );
    }
    
    return false;
  });

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 10000,
      display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
      paddingTop: '10vh',
      fontFamily: '"Google Sans", Inter, sans-serif',
      backdropFilter: 'blur(5px)'
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: '16px',
        width: '600px',
        maxWidth: '95%',
        maxHeight: '80vh',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--glass-border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        color: 'var(--text-primary)',
        animation: 'slideDown 0.3s ease-out'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Search Input Header */}
        <div style={{ 
          display: 'flex', alignItems: 'center', padding: '16px 24px', 
          borderBottom: '1px solid var(--glass-border)',
          background: 'var(--bg-primary)'
        }}>
          <Search size={22} color="var(--text-secondary)" />
          <input 
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search previous chats..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '18px',
              padding: '0 16px',
              outline: 'none'
            }}
          />
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex' }}>
            <X size={24} />
          </button>
        </div>

        {/* Results List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '300px' }}>
          {filteredConversations.length > 0 ? (
            filteredConversations.map(conv => (
              <div 
                key={conv.id}
                onClick={() => {
                  onSelectConversation(conv.id);
                  onClose();
                }}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '16px',
                  padding: '16px', borderRadius: '12px',
                  cursor: 'pointer', transition: 'background 0.2s',
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'var(--glass-bg-hover)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'var(--glass-bg)'}
              >
                <div style={{ padding: '8px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px', color: 'var(--accent-purple)' }}>
                  <MessageSquare size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '500' }}>{conv.title || 'New Chat'}</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={12} /> {formatDate(conv.updatedAt || conv.createdAt)}
                    <span style={{ margin: '0 4px' }}>•</span>
                    {conv.messages ? conv.messages.length : 0} messages
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', paddingTop: '40px' }}>
              <Search size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
              <p style={{ fontSize: '16px' }}>No conversations found</p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default SearchModal;
