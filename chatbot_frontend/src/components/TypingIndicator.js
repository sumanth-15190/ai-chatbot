import React from 'react';

/**
 * TypingIndicator — Animated 3-dot indicator shown while waiting for AI response.
 */
const TypingIndicator = () => {
  return (
    <div className="typing-indicator">
      <div className="message-avatar">🤖</div>
      <div className="typing-dots">
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
      </div>
    </div>
  );
};

export default TypingIndicator;
