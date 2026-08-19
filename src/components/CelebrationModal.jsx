import React, { useEffect, useState } from 'react';

export default function CelebrationModal({ selectedNumber, topicName, onClose, isRetry }) {
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    if (!isRetry) {
      // Generate confetti pieces with banner colors
      const pieces = [];
      const bannerColors = ['#D53F34', '#E4AB09', '#31994E', '#3F7ADF'];
      for (let i = 0; i < 50; i++) {
        pieces.push({
          id: i,
          left: Math.random() * 100,
          animationDelay: Math.random() * 0.5,
          animationDuration: 2 + Math.random() * 2,
          color: bannerColors[Math.floor(Math.random() * bannerColors.length)]
        });
      }
      setConfetti(pieces);
    }
  }, [isRetry]);

  if (!selectedNumber) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Confetti */}
      {!isRetry && confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute top-0 w-2 h-2 animate-fall"
          style={{
            left: `${piece.left}%`,
            animationDelay: `${piece.animationDelay}s`,
            animationDuration: `${piece.animationDuration}s`,
            backgroundColor: piece.color,
          }}
        />
      ))}

      {/* Balloons */}
      {!isRetry && (
        <>
          {[...Array(8)].map((_, i) => {
            const bannerColors = ['#D53F34', '#E4AB09', '#31994E', '#3F7ADF'];
            return (
              <div
                key={`balloon-${i}`}
                className="absolute animate-float"
                style={{
                  left: `${10 + i * 12}%`,
                  bottom: '-100px',
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '4s',
                }}
              >
                <div
                  className="relative w-12 h-16 rounded-full opacity-80"
                  style={{
                    backgroundColor: bannerColors[i % bannerColors.length],
                  }}
                >
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gray-400"></div>
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* Modal Content */}
      <div className="relative z-10 bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-10 md:p-12 max-w-sm sm:max-w-lg w-full mx-3 sm:mx-4 transform animate-scale-in">
        {/* Ribbons */}
        {!isRetry && (
          <>
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-20 animate-pulse"></div>
            
            {/* Ribbon decoration */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <div className="w-32 h-12 bg-gradient-to-r from-red-500 via-yellow-400 to-red-500 transform rotate-12"></div>
                <div className="absolute top-0 left-0 w-32 h-12 bg-gradient-to-r from-blue-500 via-purple-400 to-blue-500 transform -rotate-12"></div>
              </div>
            </div>
          </>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mt-6 sm:mt-8">
          {isRetry ? (
            <>
              <h2 className="text-4xl sm:text-6xl font-bold text-red-500 mb-4 sm:mb-6 animate-bounce">
                RETRY!
              </h2>
              <p className="text-lg sm:text-2xl text-gray-600 mb-6 sm:mb-8">
                Oops! Try spinning again!
              </p>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-lg font-bold rounded-full hover:from-red-600 hover:to-pink-600 transform hover:scale-105 transition-all shadow-lg"
              >
                Spin Again
              </button>
            </>
          ) : (
            <>
              <div className="mb-3 sm:mb-4">
                <span className="text-4xl sm:text-6xl animate-bounce inline-block">🎉</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-700 mb-3 sm:mb-4">
                Selected Topic
              </h2>
              <div className="relative mb-4 sm:mb-6">
                <div className="text-7xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient">
                  {selectedNumber}
                </div>
                <div className="absolute inset-0 text-7xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 blur-xl opacity-50 animate-gradient">
                  {selectedNumber}
                </div>
              </div>
              {topicName && (
                <div className="mb-6 px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200">
                  <p className="text-2xl font-bold text-gray-800 text-center leading-relaxed">
                    {topicName}
                  </p>
                </div>
              )}
              <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
                <span className="text-xl sm:text-2xl">🎊</span>
                <p className="text-sm sm:text-lg text-gray-600 font-semibold animate-pulse">
                  MiniHackathon 2026 - Let's Build Something Amazing!
                </p>
                <span className="text-xl sm:text-2xl">🎊</span>
              </div>
              <button
                onClick={onClose}
                className="px-8 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-lg sm:text-xl font-bold rounded-full hover:from-purple-600 hover:to-blue-600 transform hover:scale-105 transition-all shadow-lg"
              >
                Continue
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

