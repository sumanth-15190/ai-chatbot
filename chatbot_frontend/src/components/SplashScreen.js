import React, { useEffect, useState } from 'react';

const SplashScreen = ({ onFinish }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate some random particles
    const newParticles = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: `${Math.random() * 4 + 2}px`,
      animationDuration: `${Math.random() * 2 + 2}s`,
      animationDelay: `${Math.random() * 1}s`,
    }));
    setParticles(newParticles);

    // Start fade out at 2.2s (animation takes 0.8s)
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 2200);

    // Finish completely at 3s
    const finishTimer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className={`splash-screen ${isFadingOut ? 'fade-out' : ''}`}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animation: `particleFloat ${p.animationDuration} ease-in-out infinite`,
            animationDelay: p.animationDelay,
          }}
        />
      ))}
      <div className="splash-logo-container">
        <img src="/logo.png" alt="Logo" className="splash-icon" style={{ width: '128px', height: '128px', borderRadius: '24px' }} />
        <h1 className="splash-text">OmniChat</h1>
      </div>
    </div>
  );
};

export default SplashScreen;
