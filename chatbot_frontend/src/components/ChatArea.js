import React, { useState, useRef, useEffect } from 'react';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import WelcomeScreen from './WelcomeScreen';

/**
 * ChatArea — Main chat interface with header, messages, and input.
 * Shows WelcomeScreen when no messages exist.
 */
const ChatArea = ({
  messages,
  isLoading,
  onSendMessage,
  sessionTitle,
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputValue]);

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setInputValue('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleWelcomePrompt = (prompt) => {
    onSendMessage(prompt);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="chat-area">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-title">
          <h2>{sessionTitle || 'New Chat'}</h2>
          <span className="model-badge">Grok-2</span>
        </div>
        <div className="chat-header-actions">
          <button className="header-action-btn" title="Clear chat">
            🗑️
          </button>
          <button className="header-action-btn" title="Settings">
            ⚙️
          </button>
        </div>
      </div>

      {/* Messages or Welcome Screen */}
      {hasMessages ? (
        <div className="messages-container">
          {messages.map((msg, index) => (
            <Message key={index} message={msg} />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      ) : (
        <WelcomeScreen onSendPrompt={handleWelcomePrompt} />
      )}

      {/* Input Area */}
      <div className="input-area">
        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a message to NexusAI..."
            rows={1}
            disabled={isLoading}
          />
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            title="Send message"
          >
            {isLoading ? '⏳' : '↑'}
          </button>
        </div>
        <div className="input-hint">
          <kbd>Enter</kbd> to send · <kbd>Shift + Enter</kbd> for new line
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
