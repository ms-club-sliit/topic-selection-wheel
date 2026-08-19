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

      {/* Everything above the blobs */}
      <div className="relative z-10 flex flex-col items-center w-full px-6 py-6 md:px-12">

        {/* Header */}
        <header className="flex items-center justify-between w-full max-w-6xl mb-6">
          <img src="/main-logo.png" alt="MS Club x Mini Hackathon 26" className="h-12 md:h-14" />
        </header>

        {/* Title outside the card */}
        <div className="flex items-center gap-3 mb-1">
          <Sparkle className="w-5 h-5 text-violet-400" />
          <Sparkle className="w-4 h-4 text-violet-300" />
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            Topic Selector Wheel
          </h1>
          <Sparkle className="w-4 h-4 text-emerald-300" />
          <Sparkle className="w-5 h-5 text-emerald-400" />
        </div>
        <p className="text-base text-slate-600 mb-6">
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
        <div className="relative w-full max-w-4xl bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-2xl px-6 py-8 md:px-12 md:py-10 flex flex-col items-center">

          {/* Corner sparkle decorations inside the card */}
          <Sparkle className="absolute top-6 left-8 w-4 h-4 text-violet-300 opacity-70" />
          <Sparkle className="absolute top-12 left-14 w-3 h-3 text-violet-400 opacity-50" />
          <Sparkle className="absolute top-6 right-8 w-4 h-4 text-emerald-300 opacity-70" />
          <Sparkle className="absolute bottom-16 left-10 w-3 h-3 text-violet-400 opacity-60" />
          <Sparkle className="absolute bottom-16 right-10 w-4 h-4 text-emerald-400 opacity-60" />

          <SpinningWheel
            topicCount={topicCount}
            retryProbability={retryProbability}
            excludedNumbers={excludedNumbers}
            topicNames={topicNames}
            onSpin={handleSpin}
          />

          {/* Tagline bar (using your exported slogan-card image) */}
          <div className="mt-6 w-full max-w-xl">
            <img src="/slogan-card.png" alt="Innovation starts here" className="w-full h-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}