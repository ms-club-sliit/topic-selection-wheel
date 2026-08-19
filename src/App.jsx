import React, { useState, useEffect } from "react";
import SpinningWheel from "./components/SpinningWheel";
import SideMenu from "./components/SideMenu";

const STORAGE_KEY = 'topic_selector_state';

// Simple sparkle icon (matches the ✦✦ accents in the reference design)
const Sparkle = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0c.552 3.978 1.766 6.822 3.65 8.706C17.534 10.59 20.378 11.804 24 12c-3.622.196-6.466 1.41-8.35 3.294C13.766 17.178 12.552 20.022 12 24c-.552-3.978-1.766-6.822-3.65-8.706C6.466 13.41 3.622 12.196 0 12c3.622-.196 6.466-1.41 8.35-3.294C10.234 6.822 11.448 3.978 12 0z" />
  </svg>
);

export default function App() {
  const loadState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          topicCount: parsed.topicCount || 10,
          retryProbability: parsed.retryProbability || 20,
          excludedNumbers: parsed.excludedNumbers || [],
          selectedHistory: parsed.selectedHistory || [],
          topicNames: parsed.topicNames || {}
        };
      }
    } catch (error) {
      console.error('Error loading state:', error);
    }
    return {
      topicCount: 10,
      retryProbability: 20,
      excludedNumbers: [],
      selectedHistory: [],
      topicNames: {}
    };
  };

  const initialState = loadState();
  const [topicCount, setTopicCount] = useState(initialState.topicCount);
  const [retryProbability, setRetryProbability] = useState(initialState.retryProbability);
  const [excludedNumbers, setExcludedNumbers] = useState(initialState.excludedNumbers);
  const [selectedHistory, setSelectedHistory] = useState(initialState.selectedHistory);
  const [topicNames, setTopicNames] = useState(initialState.topicNames || {});

  useEffect(() => {
    const state = { topicCount, retryProbability, excludedNumbers, selectedHistory, topicNames };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [topicCount, retryProbability, excludedNumbers, selectedHistory, topicNames]);

  const handleSpin = (result) => {
    if (!result.isRetry) {
      setExcludedNumbers(prev => prev.includes(result.value) ? prev : [...prev, result.value]);
      setSelectedHistory(prev => [...prev, { number: result.value, timestamp: new Date().toISOString() }]);
    }
  };

  const handleToggleExclusion = (number) => {
    setExcludedNumbers(prev => prev.includes(number) ? prev.filter(n => n !== number) : [...prev, number]);
  };

  const handleResetExclusions = () => {
    setExcludedNumbers([]);
    setSelectedHistory([]);
  };

  return (
    <div className="relative flex flex-col items-center w-full min-h-screen bg-white overflow-hidden">
      {/* Gradient mesh background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -left-36 -bottom-20 w-[500px] h-[500px] rounded-full bg-violet-600/75 blur-[170px]" />
        <div className="absolute -right-40 -top-32 w-[500px] h-[500px] rounded-full bg-emerald-500/70 blur-[180px]" />
        <div className="absolute left-[42%] top-[28%] w-[400px] h-[400px] rounded-full bg-sky-500/65 blur-[150px]" />
        <div className="absolute left-[12%] top-[18%] w-[400px] h-[400px] rounded-full bg-fuchsia-500/50 blur-[130px]" />
        <div className="absolute right-[14%] bottom-[8%] w-[400px] h-[400px] rounded-full bg-lime-400/50 blur-[130px]" />
      </div>

      {/* Logo — absolutely positioned top-left, out of flow */}
      <header className="absolute top-3 left-4 z-20 md:top-5 md:left-10">
        <img src="/main-logo.png" alt="MS Club x Mini Hackathon 26" className="h-8 sm:h-10 md:h-12" />
      </header>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center w-full px-3 pt-3 pb-4 sm:px-6 sm:pt-4 sm:pb-6 md:px-12">

        {/* Title outside the card */}
        <div className="flex items-center gap-2 sm:gap-3 mb-0.5 sm:mb-1">
          <Sparkle className="w-3 h-3 sm:w-5 sm:h-5 text-violet-400" />
          <Sparkle className="hidden sm:block w-4 h-4 text-violet-300" />
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            <span className="text-gray-900">Topic Selector </span>
            <span className="text-blue-600">Wheel</span>
          </h1>
          <Sparkle className="hidden sm:block w-4 h-4 text-emerald-300" />
          <Sparkle className="w-3 h-3 sm:w-5 sm:h-5 text-emerald-400" />
        </div>
        <p className="text-xs sm:text-base text-slate-600 mb-3 sm:mb-6">
          Spin the wheel to randomly select a topic!
        </p>

        <SideMenu
          topicCount={topicCount}
          setTopicCount={setTopicCount}
          retryProbability={retryProbability}
          setRetryProbability={setRetryProbability}
          excludedNumbers={excludedNumbers}
          onToggleExclusion={handleToggleExclusion}
          onResetExclusions={handleResetExclusions}
          selectedHistory={selectedHistory}
          topicNames={topicNames}
          setTopicNames={setTopicNames}
        />

        {/* Card container */}
        <div className="relative w-full max-w-4xl bg-white/60 backdrop-blur-xl rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl flex flex-col items-center overflow-hidden">

          {/* Wheel content area */}
          <div className="relative w-full px-3 pt-4 pb-3 sm:px-8 sm:pt-8 sm:pb-6 md:px-12 md:pt-10 md:pb-8 flex flex-col items-center">

            {/* Corner sparkle decorations — hidden on very small screens */}
            <Sparkle className="hidden sm:block absolute top-5 left-6 w-4 h-4 text-violet-400 opacity-75" />
            <Sparkle className="hidden sm:block absolute top-10 left-12 w-2.5 h-2.5 text-violet-300 opacity-55" />
            <Sparkle className="hidden sm:block absolute top-5 right-6 w-3 h-3 text-emerald-400 opacity-75" />
            <Sparkle className="hidden sm:block absolute bottom-6 left-7 w-3 h-3 text-violet-400 opacity-65" />
            <Sparkle className="hidden sm:block absolute bottom-6 right-7 w-3.5 h-3.5 text-emerald-400 opacity-65" />

            <SpinningWheel
              topicCount={topicCount}
              retryProbability={retryProbability}
              excludedNumbers={excludedNumbers}
              topicNames={topicNames}
              onSpin={handleSpin}
            />
          </div>

          {/* Slogan footer bar — flush at card bottom */}
          <div className="w-full px-4 pb-4">
            <div
              className="w-full flex items-center justify-center rounded-xl px-6 py-3"
              style={{
                background: 'rgba(255,255,255,0.5)',
                border: '1px solid rgba(200,190,255,0.35)',
              }}
            >
              <Sparkle className="w-3.5 h-3.5 text-violet-400 mr-4 flex-shrink-0" />
              <img src="/slogan-card.png" alt="Innovation starts here" className="h-6 md:h-7 object-contain" />
              <Sparkle className="w-3.5 h-3.5 text-emerald-400 ml-4 flex-shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}