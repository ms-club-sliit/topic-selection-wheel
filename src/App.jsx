import React, { useState, useEffect } from "react";
import SpinningWheel from "./components/SpinningWheel";
import SideMenu from "./components/SideMenu";

const STORAGE_KEY = 'topic_selector_state';

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
    return { topicCount: 10, retryProbability: 20, excludedNumbers: [], selectedHistory: [], topicNames: {} };
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
        <div className="absolute -left-36 -bottom-20 w-[400px] h-[400px] lg:w-[600px] lg:h-[600px] rounded-full bg-violet-600/75 blur-[170px]" />
        <div className="absolute -right-40 -top-32 w-[400px] h-[400px] lg:w-[600px] lg:h-[600px] rounded-full bg-emerald-500/70 blur-[180px]" />
        <div className="absolute left-[42%] top-[28%] w-[300px] h-[300px] lg:w-[500px] lg:h-[500px] rounded-full bg-sky-500/65 blur-[150px]" />
        <div className="absolute left-[12%] top-[18%] w-[300px] h-[300px] lg:w-[450px] lg:h-[450px] rounded-full bg-fuchsia-500/50 blur-[130px]" />
        <div className="absolute right-[14%] bottom-[8%] w-[300px] h-[300px] lg:w-[450px] lg:h-[450px] rounded-full bg-lime-400/50 blur-[130px]" />
      </div>

      {/* Logo — absolutely positioned top-left */}
      <header className="absolute top-3 left-3 z-20 sm:top-4 sm:left-5 md:top-5 md:left-8 xl:top-6 xl:left-12">
        <img
          src="/main-logo.png"
          alt="MS Club x Mini Hackathon 26"
          className="h-7 sm:h-9 md:h-11 lg:h-12 xl:h-14"
        />
      </header>

      {/* Main content wrapper — top padding accounts for logo height */}
      <div className="relative z-10 flex flex-col items-center w-full
                      px-3 pt-12 pb-4
                      sm:px-5 sm:pt-14 sm:pb-5
                      md:px-8 md:pt-16 md:pb-8
                      lg:px-12 lg:pt-20 lg:pb-10
                      xl:px-16 xl:pt-20 xl:pb-12">

        {/* Title */}
        <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 mb-0.5 sm:mb-1">
          <Sparkle className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-violet-400" />
          <Sparkle className="hidden sm:block w-3 h-3 lg:w-4 lg:h-4 text-violet-300" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight leading-none">
            <span className="text-gray-900">Topic Selector </span>
            <span className="text-blue-600">Wheel</span>
          </h1>
          <Sparkle className="hidden sm:block w-3 h-3 lg:w-4 lg:h-4 text-emerald-300" />
          <Sparkle className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-emerald-400" />
        </div>

        <p className="text-xs sm:text-sm md:text-base lg:text-lg text-slate-600 mb-3 sm:mb-4 lg:mb-6 xl:mb-8">
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
        <div className="relative w-full
                        max-w-xs sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl
                        bg-white/60 backdrop-blur-xl
                        rounded-2xl sm:rounded-[1.75rem] lg:rounded-[2rem]
                        shadow-2xl flex flex-col items-center overflow-hidden">

          {/* Wheel content area */}
          <div className="relative w-full
                          px-3 pt-5 pb-3
                          sm:px-6 sm:pt-8 sm:pb-5
                          md:px-10 md:pt-10 md:pb-8
                          lg:px-14 lg:pt-12 lg:pb-10
                          flex flex-col items-center">

            {/* Corner sparkle decorations */}
            <Sparkle className="hidden sm:block absolute top-5 left-5 w-3.5 h-3.5 lg:w-4 lg:h-4 text-violet-400 opacity-75" />
            <Sparkle className="hidden md:block absolute top-9 left-10 w-2.5 h-2.5 text-violet-300 opacity-55" />
            <Sparkle className="hidden sm:block absolute top-5 right-5 w-3 h-3 lg:w-3.5 lg:h-3.5 text-emerald-400 opacity-75" />
            <Sparkle className="hidden sm:block absolute bottom-5 left-6 w-3 h-3 text-violet-400 opacity-65" />
            <Sparkle className="hidden sm:block absolute bottom-5 right-6 w-3.5 h-3.5 text-emerald-400 opacity-65" />

            <SpinningWheel
              topicCount={topicCount}
              retryProbability={retryProbability}
              excludedNumbers={excludedNumbers}
              topicNames={topicNames}
              onSpin={handleSpin}
            />
          </div>

          {/* Slogan footer bar */}
          <div className="w-full px-3 pb-3 sm:px-4 sm:pb-4 lg:px-6 lg:pb-5">
            <div
              className="w-full flex items-center justify-center rounded-xl px-4 py-2 sm:px-6 sm:py-3"
              style={{
                background: 'rgba(255,255,255,0.5)',
                border: '1px solid rgba(200,190,255,0.35)',
              }}
            >
              <Sparkle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-violet-400 mr-3 sm:mr-4 flex-shrink-0" />
              <img
                src="/slogan-card.png"
                alt="Innovation starts here"
                className="h-5 sm:h-6 md:h-7 lg:h-8 object-contain"
              />
              <Sparkle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 ml-3 sm:ml-4 flex-shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}