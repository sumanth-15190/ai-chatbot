import React from 'react';

/**
 * Message — Individual chat message bubble with different styles for user/assistant.
 * Shows tool usage badges (weather, search) when the agent used tools.
 */
const Message = ({ message }) => {
  const { role, content, timestamp, toolsUsed = [] } = message;
  const isUser = role === 'user';

  /**
   * Format message content — handle basic markdown-like formatting
   */
  const formatContent = (text) => {
    if (!text) return '';

    // Split by code blocks first
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      // Code block
      if (part.startsWith('```') && part.endsWith('```')) {
        const codeContent = part.slice(3, -3);
        const firstNewline = codeContent.indexOf('\n');
        const code = firstNewline > -1 ? codeContent.slice(firstNewline + 1) : codeContent;
        return (
          <pre key={index}>
            <code>{code}</code>
          </pre>
        );
      }

      // Regular text — handle inline formatting
      const lines = part.split('\n');
      return lines.map((line, lineIndex) => {
        // Bold
        let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Inline code
        formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');
        // Bullet points
        if (formatted.startsWith('• ') || formatted.startsWith('- ')) {
          formatted = formatted.replace(/^[•-]\s/, '');
          return (
            <p key={`${index}-${lineIndex}`} style={{ paddingLeft: '12px', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0 }}>•</span>
              <span dangerouslySetInnerHTML={{ __html: formatted }} />
            </p>
          );
        }

        if (formatted.trim() === '') {
          return lineIndex < lines.length - 1 ? <br key={`${index}-${lineIndex}`} /> : null;
        }

        return (
          <p key={`${index}-${lineIndex}`} dangerouslySetInnerHTML={{ __html: formatted }} />
        );
      });
    });
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    try {
      const date = new Date(ts);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const getToolBadge = (toolName) => {
    switch (toolName) {
      case 'get_weather':
        return (
          <span className="tool-badge weather" key={toolName}>
            🌤️ Weather
          </span>
        );
      case 'web_search':
        return (
          <span className="tool-badge search" key={toolName}>
            🔍 Search
          </span>
        );
      default:
        return (
          <span className="tool-badge search" key={toolName}>
            🔧 {toolName}
          </span>
        );
    }
  };

  return (
    <div className={`message ${isUser ? 'user' : 'assistant'}`}>
      <div className="message-avatar">
        {isUser ? '👤' : '🤖'}
      </div>
      <div>
        <div className="message-content">
          {formatContent(content)}
        </div>
        <div className="message-meta">
          {toolsUsed.length > 0 && (
            <>
              {toolsUsed.map(tool => getToolBadge(tool))}
            </>
          )}
          <span>{formatTime(timestamp)}</span>
        </div>
      </div>
    </div>
  );
};

export default Message;
