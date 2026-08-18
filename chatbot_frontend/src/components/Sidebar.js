import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquarePlus, Mic, Volume2, BookOpen, Image as ImageIcon, 
  Clock, Search, PanelLeftClose, MessageSquare, Trash2, 
  Inbox, User, Settings, Sun, Moon, LogOut 
} from 'lucide-react';
import LogoutModal from './LogoutModal';

/**
 * Sidebar — Glassmorphic sidebar with branding, new chat, conversation history,
 * and profile/login section at the bottom.
 */
const Sidebar = ({
  conversations,
  activeSessionId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onSearchClick,
  user,
  onLoginClick,
  onLogout,
  theme,
  onToggleTheme,
  currentView,
  setCurrentView,
  isOpen,
  onToggleSidebar,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /**
   * Group conversations by date (Today, Yesterday, Previous 7 Days, Older)
   */
  const groupConversations = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const groups = {
      today: [],
      yesterday: [],
      week: [],
      older: [],
    };

    conversations.forEach((conv) => {
      const convDate = new Date(conv.updatedAt);
      if (convDate >= today) {
        groups.today.push(conv);
      } else if (convDate >= yesterday) {
        groups.yesterday.push(conv);
      } else if (convDate >= weekAgo) {
        groups.week.push(conv);
      } else {
        groups.older.push(conv);
      }
    });

    return groups;
  };

  const groups = groupConversations();

  const renderGroup = (title, items) => {
    if (items.length === 0) return null;
    return (
      <div key={title}>
        <div className="sidebar-section-title">{title}</div>
        {items.map((conv) => (
          <div
            key={conv.id}
            className={`conversation-item ${conv.id === activeSessionId ? 'active' : ''}`}
            onClick={() => onSelectConversation(conv.id)}
          >
            <span className="conversation-item-icon"><MessageSquare size={16} /></span>
            <div className="conversation-item-content">
              <div className="conversation-item-title">{conv.title}</div>
              <div className="conversation-item-time">
                {new Date(conv.updatedAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
            <button
              className="conversation-item-delete"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteConversation(conv.id);
              }}
              title="Delete conversation"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    );
  };

  const hasConversations = conversations.length > 0;

  return (
    <div className={`sidebar ${!isOpen ? 'collapsed' : ''}`}>
      {/* Header with logo and close button */}
      <div className="sidebar-header" style={{ display: 'flex', justifyContent: isOpen ? 'space-between' : 'center', alignItems: 'center', padding: isOpen ? '20px' : '20px 0' }}>
        <div className="sidebar-logo" style={{ marginBottom: 0, justifyContent: 'center', cursor: 'pointer' }} onClick={!isOpen ? onToggleSidebar : undefined} title={!isOpen ? "Open sidebar" : ""}>
          <img src="/logo.png" alt="Logo" className="sidebar-logo-icon" style={{ width: '28px', height: '28px', borderRadius: '8px', filter: !isOpen ? 'brightness(1.2) grayscale(1)' : 'none' }} />
          {isOpen && <div className="sidebar-logo-text" style={{ fontSize: '1.2rem' }}>OmniChat</div>}
        </div>
        {isOpen && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onSearchClick} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Search">
              <Search size={20} />
            </button>
            <button onClick={onToggleSidebar} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Close sidebar">
              <PanelLeftClose size={20} />
            </button>
          </div>
        )}
      </div>

      <div style={{ padding: isOpen ? '0 16px' : '0 8px', marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
        <button className="chatgpt-menu-btn" onClick={onNewChat} style={{ background: isOpen ? 'var(--glass-bg)' : 'transparent', border: isOpen ? '1px solid var(--glass-border)' : 'none', padding: isOpen ? '12px 16px' : '12px', justifyContent: isOpen ? 'flex-start' : 'center', width: '100%' }} title={!isOpen ? "New chat" : ""}>
          <span className="chatgpt-menu-icon" style={{ display: 'flex' }}><MessageSquarePlus size={18} /></span>
          {isOpen && (
            <>
              <span className="chatgpt-menu-text">New chat</span>
              <span style={{ opacity: 0.5 }}>+</span>
            </>
          )}
        </button>
      </div>

      <div className="chatgpt-menu" style={{ padding: isOpen ? '16px' : '16px 8px' }}>
        <button 
          className="chatgpt-menu-btn" 
          onClick={() => { onSearchClick(); if (!isOpen) onToggleSidebar(); }}
          style={{ background: 'transparent', padding: isOpen ? '12px 16px' : '12px', justifyContent: isOpen ? 'flex-start' : 'center', width: '100%' }}
          title={!isOpen ? "Search" : ""}
        >
          <span className="chatgpt-menu-icon" style={{ display: 'flex' }}><Search size={18} /></span>
          {isOpen && <span className="chatgpt-menu-text">Search</span>}
        </button>
        <button 
          className="chatgpt-menu-btn" 
          onClick={() => { setCurrentView('stt'); if (!isOpen) onToggleSidebar(); }}
          style={{ background: currentView === 'stt' ? 'var(--glass-bg-hover)' : 'transparent', padding: isOpen ? '12px 16px' : '12px', justifyContent: isOpen ? 'flex-start' : 'center', width: '100%' }}
          title={!isOpen ? "Speech-to-Text" : ""}
        >
          <span className="chatgpt-menu-icon" style={{ display: 'flex' }}><Mic size={18} /></span>
          {isOpen && <span className="chatgpt-menu-text">Speech-to-Text</span>}
        </button>
        <button 
          className="chatgpt-menu-btn"
          onClick={() => { setCurrentView('tts'); if (!isOpen) onToggleSidebar(); }}
          style={{ background: currentView === 'tts' ? 'var(--glass-bg-hover)' : 'transparent', padding: isOpen ? '12px 16px' : '12px', justifyContent: isOpen ? 'flex-start' : 'center', width: '100%' }}
          title={!isOpen ? "Text-to-Speech" : ""}
        >
          <span className="chatgpt-menu-icon" style={{ display: 'flex' }}><Volume2 size={18} /></span>
          {isOpen && <span className="chatgpt-menu-text">Text-to-Speech</span>}
        </button>
        <button 
          className="chatgpt-menu-btn"
          onClick={() => { setCurrentView('library'); if (!isOpen) onToggleSidebar(); }}
          style={{ background: currentView === 'library' ? 'var(--glass-bg-hover)' : 'transparent', padding: isOpen ? '12px 16px' : '12px', justifyContent: isOpen ? 'flex-start' : 'center', width: '100%' }}
          title={!isOpen ? "Library" : ""}
        >
          <span className="chatgpt-menu-icon" style={{ display: 'flex', transform: 'rotate(45deg)' }}><BookOpen size={18} /></span>
          {isOpen && <span className="chatgpt-menu-text">Library</span>}
        </button>
        {user && (
          <button 
            className="chatgpt-menu-btn"
            onClick={() => { setShowHistory(!showHistory); if (!isOpen) onToggleSidebar(); }}
            style={{ background: showHistory ? 'var(--glass-bg-hover)' : 'transparent', padding: isOpen ? '12px 16px' : '12px', justifyContent: isOpen ? 'flex-start' : 'center', width: '100%' }}
            title={!isOpen ? "History" : ""}
          >
            <span className="chatgpt-menu-icon" style={{ display: 'flex' }}><MessageSquare size={18} /></span>
            {isOpen && <span className="chatgpt-menu-text">History</span>}
          </button>
        )}
      </div>

      {/* Conversation history */}
      {showHistory && user && isOpen && (
        <div className="sidebar-conversations">
        {hasConversations ? (
          <>
            {renderGroup('Today', groups.today)}
            {renderGroup('Yesterday', groups.yesterday)}
            {renderGroup('Previous 7 Days', groups.week)}
            {renderGroup('Older', groups.older)}
          </>
        ) : (
          <div className="empty-conversations">
            <div className="empty-conversations-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}><Inbox size={32} /></div>
            <div className="empty-conversations-text">
              No conversations yet.
              <br />
              Start a new chat to begin!
            </div>
          </div>
        )}
        </div>
      )}

      {/* Spacer to push footer to bottom if needed */}
      <div style={{ flex: 1 }}></div>

      {/* Footer login button if not logged in */}
      {!user && (
        <div className="sidebar-footer" style={{ padding: isOpen ? '16px' : '16px 8px', display: 'flex', justifyContent: 'center' }}>
          <button className="login-btn" onClick={onLoginClick} style={{ width: '100%', padding: isOpen ? '10px 16px' : '10px', display: 'flex', justifyContent: 'center' }}>
            {isOpen ? '✨ Sign In / Sign Up' : '✨'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
