import React from 'react';

/**
 * WelcomeScreen — Landing screen shown when no messages exist.
 * Features animated heading and clickable prompt suggestion cards.
 */
const WelcomeScreen = ({ onSendPrompt }) => {
  const suggestions = [
    {
      icon: '🌤️',
      title: 'Check the Weather',
      desc: 'Get real-time weather data for any city worldwide',
      prompt: "What's the weather like in Tokyo right now?",
    },
    {
      icon: '🔍',
      title: 'Search the Web',
      desc: 'Find the latest news, facts, and current events',
      prompt: 'Search for the latest developments in AI technology',
    },
    {
      icon: '💻',
      title: 'Code & Create',
      desc: 'Get help with coding, debugging, and building projects',
      prompt: 'Explain how React hooks work with a simple example',
    },
    {
      icon: '💡',
      title: 'Brainstorm Ideas',
      desc: 'Think through problems and explore creative solutions',
      prompt: 'Help me brainstorm unique project ideas for my portfolio',
    },
  ];

  return (
    <div className="welcome-screen">
      <div className="welcome-icon">✨</div>
      <h1 className="welcome-title">Hello, I'm NexusAI</h1>
      <p className="welcome-subtitle">
        Your intelligent assistant powered by GPT-4o with real-time tools.
        I can check weather, search the web, and remember our conversations.
      </p>
      <div className="welcome-cards">
        {suggestions.map((card, index) => (
          <div
            key={index}
            className="welcome-card"
            onClick={() => onSendPrompt(card.prompt)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="welcome-card-icon">{card.icon}</div>
            <div className="welcome-card-title">{card.title}</div>
            <div className="welcome-card-desc">{card.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WelcomeScreen;
