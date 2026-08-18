import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import LoginModal from './components/LoginModal';
import LogoutModal from './components/LogoutModal';
import UserProfileModal from './components/UserProfileModal';
import SettingsModal from './components/SettingsModal';
import SearchModal from './components/SearchModal';
import STTView from './components/STTView';
import TTSView from './components/TTSView';
import LibraryView from './components/LibraryView';
import ImagesView from './components/ImagesView';
import SplashScreen from './components/SplashScreen';
import { sendMessage } from './services/api';
import './App.css';

/**
 * App — Main orchestrator for the OmniChat chatbot.
 * Manages conversations, sessions, auth state, and coordinates all child components.
 * Persists state in localStorage for cross-refresh persistence.
 */
function App() {
  // --- Auth State ---
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('nexusai_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('nexusai_theme') || 'dark';
  });

  const [isAppLoaded, setIsAppLoaded] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  const [currentView, setCurrentView] = useState('chat'); // 'chat' | 'stt' | 'tts'

  // --- Advanced Features State ---
  const [isTTSActive] = useState(false);
  const [isSTTActive] = useState(false);

  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nexusai_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // --- Conversations State ---
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem('nexusai_conversations');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeSessionId, setActiveSessionId] = useState(null);

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
    setCurrentView('chat');
    setConversations((prev) => {
      const emptySession = prev.find(c => c.messages.length === 0 && c.title === 'New Chat');
      if (emptySession) {
        setActiveSessionId(emptySession.id);
        return prev;
      }

      const newId = uuidv4();
      const newConversation = {
        id: newId,
        title: 'New Chat',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setActiveSessionId(newId);
      return [newConversation, ...prev];
    });
  }, []);

  // --- Select existing conversation ---
  const handleSelectConversation = useCallback((sessionId) => {
    setActiveSessionId(sessionId);
    setCurrentView('chat');
  }, []);

  // --- Delete conversation ---
  const handleDeleteConversation = useCallback(
    (sessionId) => {
      setConversations((prev) => prev.filter((c) => c.id !== sessionId));
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
      }
    },
    [activeSessionId, isTTSActive, isSTTActive]
  );

  // --- Send message ---
  const handleSendMessage = useCallback(
    async (messageText) => {
      if (!user) {
        setShowLoginModal(true);
        return;
      }

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

        if (isTTSActive) {
          speakText(response.response);
        }

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
    [activeSessionId, user]
  );

  // --- Auth handlers ---
  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('nexusai_user');
  };

  const handleUpdateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('nexusai_user', JSON.stringify(newUser));
  };

  // --- Session title ---
  const sessionTitle = activeConversation?.title || 'New Chat';

  return (
    <>
      {!isAppLoaded && <SplashScreen onFinish={() => setIsAppLoaded(true)} />}

      <div className={`app-container ${isAppLoaded ? 'app-reveal' : ''}`} style={{ display: isAppLoaded ? 'flex' : 'none' }}>
        <Sidebar
          isOpen={isSidebarOpen}
          onToggleSidebar={toggleSidebar}
          conversations={conversations}
          activeSessionId={activeSessionId}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          onDeleteConversation={handleDeleteConversation}
          onSearchClick={() => setShowSearchModal(true)}
          user={user}
          onLoginClick={() => setShowLoginModal(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
          currentView={currentView}
          setCurrentView={setCurrentView}
        />

        {currentView === 'chat' && (
          <ChatArea
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={toggleSidebar}
            messages={activeMessages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            sessionTitle={sessionTitle}
            isSTTActive={isSTTActive}
            user={user}
            onLoginClick={() => setShowLoginModal(true)}
            onProfileClick={() => setShowProfileModal(true)}
            onSettingsClick={() => setShowSettings(true)}
          />
        )}

        {currentView === 'stt' && (
          <STTView
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={toggleSidebar}
            user={user}
            onLoginClick={() => setShowLoginModal(true)}
            onProfileClick={() => setShowProfileModal(true)}
            onSettingsClick={() => setShowSettings(true)}
          />
        )}

        {currentView === 'tts' && (
          <TTSView
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={toggleSidebar}
            user={user}
            onLoginClick={() => setShowLoginModal(true)}
            onProfileClick={() => setShowProfileModal(true)}
            onSettingsClick={() => setShowSettings(true)}
          />
        )}

        {currentView === 'library' && (
          <LibraryView
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={toggleSidebar}
            user={user}
            onLoginClick={() => setShowLoginModal(true)}
            onProfileClick={() => setShowProfileModal(true)}
            onSettingsClick={() => setShowSettings(true)}
          />
        )}

        {currentView === 'image' && (
          <ImagesView
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={toggleSidebar}
            user={user}
            onLoginClick={() => setShowLoginModal(true)}
            onProfileClick={() => setShowProfileModal(true)}
            onSettingsClick={() => setShowSettings(true)}
          />
        )}

        {showLoginModal && (
          <LoginModal
            onClose={() => setShowLoginModal(false)}
            onLogin={handleLogin}
          />
        )}
      </div>
      {showProfileModal && user && (
        <UserProfileModal
          user={user}
          onClose={() => setShowProfileModal(false)}
          theme={theme}
          onToggleTheme={toggleTheme}
          onSettingsClick={() => {
            setShowProfileModal(false);
            setShowSettings(true);
          }}
          onLogout={() => {
            setShowProfileModal(false);
            setShowLogoutModal(true);
          }}
          onUpdateUser={handleUpdateUser}
        />
      )}

      {showLogoutModal && user && (
        <LogoutModal
          user={user}
          onConfirm={() => {
            setShowLogoutModal(false);
            handleLogout();
          }}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}

      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}

      {showSearchModal && (
        <SearchModal
          conversations={conversations}
          onSelectConversation={(id) => {
            handleSelectConversation(id);
            setShowSearchModal(false);
          }}
          onClose={() => setShowSearchModal(false)}
        />
      )}
    </>
  );
}

export default App;
