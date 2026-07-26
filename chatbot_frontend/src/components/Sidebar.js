import React from 'react';

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
  user,
  onLoginClick,
  onLogout,
}) => {
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
            <span className="conversation-item-icon">💬</span>
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
              🗑️
            </button>
          </div>
        ))}
      </div>
    );
  };

  const hasConversations = conversations.length > 0;

  return (
    <div className="sidebar">
      {/* Header with logo and new chat */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🔮</div>
          <div>
            <div className="sidebar-logo-text">NexusAI</div>
          </div>
          <span className="sidebar-logo-badge">PRO</span>
        </div>

        <button className="new-chat-btn" onClick={onNewChat}>
          <span className="icon">+</span>
          New Chat
        </button>
      </div>

      {/* Conversation history */}
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
            <div className="empty-conversations-icon">🌌</div>
            <div className="empty-conversations-text">
              No conversations yet.
              <br />
              Start a new chat to begin!
            </div>
          </div>
        )}
      </div>

      {/* Footer with profile/login */}
      <div className="sidebar-footer">
        {user ? (
          <div className="profile-section">
            <div className="profile-avatar">
              {user.avatar}
              <span className="status-dot"></span>
            </div>
            <div className="profile-info">
              <div className="profile-name">{user.name}</div>
              <div className="profile-email">{user.email}</div>
            </div>
            <button className="logout-btn" onClick={onLogout} title="Sign out">
              🚪
            </button>
          </div>
        ) : (
          <button className="login-btn" onClick={onLoginClick}>
            ✨ Sign In / Sign Up
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
