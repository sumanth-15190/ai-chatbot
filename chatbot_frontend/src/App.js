import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import LoginModal from './components/LoginModal';
import { sendMessage } from './services/api';
import './App.css';

/**
 * App — Main orchestrator for the NexusAI chatbot.
 * Manages conversations, sessions, auth state, and coordinates all child components.
 * Persists state in localStorage for cross-refresh persistence.
 */
function App() {
  // --- Auth State ---
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('nexusai_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [showLoginModal, setShowLoginModal] = useState(false);

  // --- Conversations State ---
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem('nexusai_conversations');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    const saved = localStorage.getItem('nexusai_active_session');
    return saved || null;
  });

  const [isLoading, setIsLoading] = useState(false);

  // --- Persist to localStorage ---
  useEffect(() => {
    localStorage.setItem('nexusai_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem('nexusai_active_session', activeSessionId);
    }
  }, [activeSessionId]);

  // --- Get active conversation ---
  const activeConversation = conversations.find((c) => c.id === activeSessionId);
  const activeMessages = activeConversation?.messages || [];

  // --- Generate title from first message ---
  const generateTitle = (message) => {
    const maxLen = 35;
    const title = message.length > maxLen ? message.substring(0, maxLen) + '...' : message;
    return title;
  };

  // --- Create new chat ---
  const handleNewChat = useCallback(() => {
    const newId = uuidv4();
    const newConversation = {
      id: newId,
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setConversations((prev) => [newConversation, ...prev]);
    setActiveSessionId(newId);
  }, []);

  // --- Select existing conversation ---
  const handleSelectConversation = useCallback((sessionId) => {
    setActiveSessionId(sessionId);
  }, []);

  // --- Delete conversation ---
  const handleDeleteConversation = useCallback(
    (sessionId) => {
      setConversations((prev) => prev.filter((c) => c.id !== sessionId));
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
      }
    },
    [activeSessionId]
  );

  // --- Send message ---
  const handleSendMessage = useCallback(
    async (messageText) => {
      let currentSessionId = activeSessionId;

      // If no active session, create one
      if (!currentSessionId) {
        const newId = uuidv4();
        const newConversation = {
          id: newId,
          title: generateTitle(messageText),
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setConversations((prev) => [newConversation, ...prev]);
        setActiveSessionId(newId);
        currentSessionId = newId;
      }

      // Add user message to conversation
      const userMessage = {
        role: 'user',
        content: messageText,
        timestamp: new Date().toISOString(),
        toolsUsed: [],
      };

      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === currentSessionId) {
            const isFirstMessage = conv.messages.length === 0;
            return {
              ...conv,
              messages: [...conv.messages, userMessage],
              title: isFirstMessage ? generateTitle(messageText) : conv.title,
              updatedAt: new Date().toISOString(),
            };
          }
          return conv;
        })
      );

      // Send to AI
      setIsLoading(true);
      try {
        const response = await sendMessage(currentSessionId, messageText);

        const assistantMessage = {
          role: 'assistant',
          content: response.response,
          timestamp: new Date().toISOString(),
          toolsUsed: response.tools_used || [],
        };

        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id === currentSessionId) {
              return {
                ...conv,
                messages: [...conv.messages, assistantMessage],
                updatedAt: new Date().toISOString(),
              };
            }
            return conv;
          })
        );
      } catch (error) {
        // Add error message as assistant response
        const errorMessage = {
          role: 'assistant',
          content: `⚠️ **Error:** ${error.message}\n\nPlease make sure all backend services are running:\n1. FastAPI: \`uvicorn main:app --port 8000\`\n2. Express: \`node server.js\``,
          timestamp: new Date().toISOString(),
          toolsUsed: [],
        };

        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id === currentSessionId) {
              return {
                ...conv,
                messages: [...conv.messages, errorMessage],
                updatedAt: new Date().toISOString(),
              };
            }
            return conv;
          })
        );
      } finally {
        setIsLoading(false);
      }
    },
    [activeSessionId]
  );

  // --- Auth handlers ---
  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('nexusai_user');
  };

  // --- Session title ---
  const sessionTitle = activeConversation?.title || 'New Chat';

  return (
    <div className="app-container">
      <Sidebar
        conversations={conversations}
        activeSessionId={activeSessionId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        user={user}
        onLoginClick={() => setShowLoginModal(true)}
        onLogout={handleLogout}
      />

      <ChatArea
        messages={activeMessages}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        sessionTitle={sessionTitle}
      />

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
        />
      )}
    </div>
  );
}

export default App;
