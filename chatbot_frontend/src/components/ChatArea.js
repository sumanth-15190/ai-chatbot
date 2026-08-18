import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Mic, Square } from 'lucide-react';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import WelcomeScreen from './WelcomeScreen';
import LibraryModal from './LibraryModal';
import TopHeader from './TopHeader';

/**
 * ChatArea — Main chat interface with header, messages, and input.
 * Shows WelcomeScreen when no messages exist.
 */
const ChatArea = ({
  messages,
  isLoading,
  onSendMessage,
  sessionTitle,
  isSidebarOpen,
  onToggleSidebar,
  user,
  onLoginClick,
  onProfileClick,
  onSettingsClick,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const attachMenuRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setInputValue(prev => prev + (prev ? ' ' : '') + currentTranscript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(event.target)) {
        setIsAttachMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    
    let finalMessage = trimmed;
    if (attachedFile) {
      finalMessage = `[Attached File: ${attachedFile.name}]\n${trimmed}`;
    }
    
    onSendMessage(finalMessage);
    setInputValue('');
    setAttachedFile(null); // Clear attached file after sending
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Set the attached file to show in the UI
      setAttachedFile({ name: file.name, type: response.data.category });
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload the file.');
    } finally {
      setIsUploading(false);
      // Reset input so the same file can be uploaded again if needed
      e.target.value = '';
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="chat-area">
      <TopHeader 
        title={sessionTitle || 'New Chat'}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={onToggleSidebar}
        user={user}
        onLoginClick={onLoginClick}
        onProfileClick={onProfileClick}
        onSettingsClick={onSettingsClick}
      />

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
          <div className="attach-container" ref={attachMenuRef} style={{ position: 'relative' }}>
            <input 
              type="file" 
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileUpload}
              accept=".txt,.pdf,.png,.jpg,.jpeg,.gif,.webp,.ppt,.pptx,.doc,.docx,.csv"
            />
            <button 
              className="attach-btn"
              onClick={() => setIsAttachMenuOpen(!isAttachMenuOpen)}
              disabled={isLoading || isUploading}
              title="Attach"
            >
              {isUploading ? '⏳' : '📎'}
            </button>
            
            {isAttachMenuOpen && (
              <div className="attach-menu">
                <button className="attach-menu-item" onClick={() => { setIsAttachMenuOpen(false); fileInputRef.current?.click(); }}>
                  <span className="attach-icon" style={{ background: '#fce7f3' }}>📄</span>
                  Photos & Files
                </button>
                <button className="attach-menu-item" onClick={() => { setIsAttachMenuOpen(false); setIsLibraryModalOpen(true); }}>
                  <span className="attach-icon" style={{ background: '#e0f2fe' }}>📚</span>
                  Add from Library
                </button>
                <button className="attach-menu-item" onClick={() => { alert('Not implemented yet'); setIsAttachMenuOpen(false); }}>
                  <span className="attach-menu-icon">🌐</span> Web Search
                </button>
                <button className="attach-menu-item" onClick={() => { alert('Not implemented yet'); setIsAttachMenuOpen(false); }}>
                  <span className="attach-menu-icon">🐱</span> GitHub
                </button>
              </div>
            )}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {attachedFile && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: '16px',
                padding: '6px 12px',
                margin: '8px 0',
                width: 'fit-content',
                fontSize: '0.85rem'
              }}>
                <span>{attachedFile.type === 'image' ? '🖼️' : '📄'}</span>
                <span style={{ fontWeight: '500', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {attachedFile.name}
                </span>
                <button 
                  onClick={() => setAttachedFile(null)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginLeft: '4px' }}
                >
                  ✕
                </button>
              </div>
            )}
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Send a message to OmniChat..."
              rows={1}
              disabled={isLoading || isUploading}
              style={{ width: '100%', marginTop: attachedFile ? '0' : '8px' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              onClick={toggleRecording}
              disabled={isLoading || isUploading}
              title={isRecording ? "Stop Recording" : "Voice Input (Speech to Text)"}
              style={{ 
                background: 'transparent', border: 'none', color: isRecording ? '#ef4444' : 'var(--text-secondary)',
                cursor: 'pointer', padding: '0 12px 0 8px', fontSize: '18px',
                transition: 'color 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              {isRecording ? <Square size={20} fill="currentColor" /> : <Mic size={20} />}
            </button>
            <button
              className="send-btn"
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading || isUploading}
              title="Send message"
            >
              {isLoading ? '⏳' : '↑'}
            </button>
          </div>
        </div>
      </div>
      
      {isLibraryModalOpen && (
        <LibraryModal 
          onClose={() => setIsLibraryModalOpen(false)}
          onSelect={(filename, category) => {
            setAttachedFile({ name: filename, type: category });
          }}
        />
      )}
    </div>
  );
};

export default ChatArea;
