import React, { useState, useEffect } from "react";
import SpinningWheel from "./components/SpinningWheel";
import SideMenu from "./components/SideMenu";

const STORAGE_KEY = 'topic_selector_state';

export default function App() {
  // Load initial state from localStorage or use defaults
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

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const state = {
      topicCount,
      retryProbability,
      excludedNumbers,
      selectedHistory,
      topicNames
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [topicCount, retryProbability, excludedNumbers, selectedHistory, topicNames]);

  const handleSpin = (result) => {
    console.log('Spin result:', result);
    
    // If not a retry, exclude this number from future spins
    if (!result.isRetry) {
      setExcludedNumbers(prev => {
        if (!prev.includes(result.value)) {
          return [...prev, result.value];
        }
        return prev;
      });
      
      // Add to history
      setSelectedHistory(prev => [...prev, {
        number: result.value,
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const handleToggleExclusion = (number) => {
    setExcludedNumbers(prev => {
      if (prev.includes(number)) {
        return prev.filter(n => n !== number);
      } else {
        return [...prev, number];
      }
    });
  };

  const handleResetExclusions = () => {
    setExcludedNumbers([]);
    setSelectedHistory([]);
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full min-h-screen bg-white overflow-hidden">
  {/* Gradient mesh background */}
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    <div className="absolute -left-36 -bottom-20 w-[500px] h-[500px] rounded-full bg-violet-600/75 blur-[170px]" />
    <div className="absolute -right-40 -top-32 w-[500px] h-[500px] rounded-full bg-emerald-500/70 blur-[180px]" />
    <div className="absolute left-[42%] top-[28%] w-[400px] h-[400px] rounded-full bg-sky-500/65 blur-[150px]" />
    <div className="absolute left-[12%] top-[18%] w-[400px] h-[400px] rounded-full bg-fuchsia-500/50 blur-[130px]" />
    <div className="absolute right-[14%] bottom-[8%] w-[400px] h-[400px] rounded-full bg-lime-400/50 blur-[130px]" />
  </div>

  {/* wrap your existing content in a relative z-10 div so it sits above the blobs */}
      {/* Side Menu */}
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

      {/* Main Content */}
      <div className="flex flex-col items-center w-full p-8 mt-[20px]">
        <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
          Topic Selector Wheel
        </h1>
        <p className="text-xl text-white mb-32 drop-shadow-md">
          Spin the wheel to randomly select a topic!
        </p>
        
        <SpinningWheel
          topicCount={topicCount}
          retryProbability={retryProbability}
          excludedNumbers={excludedNumbers}
          topicNames={topicNames}
          onSpin={handleSpin}
        />
      </div>
    </div>
  );
}
