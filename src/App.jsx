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
          topicCount: parsed.topicCount || 15,
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
      topicCount: 15,
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
    <div
      className="flex flex-col items-center justify-center w-full min-h-screen bg-center bg-cover"
      style={{
        backgroundImage: `url(https://uploadthingy.s3.us-west-1.amazonaws.com/3swgVz7qTyyFqUQhK5yy43/Meeting_Banner.png)`,
        backgroundColor: "#1a1a1a",
      }}
    >
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
      <div className="flex flex-col items-center w-full p-8 mt-[-80px]">
        <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
          Topic Selector Wheel
        </h1>
        <p className="text-xl text-white mb-16 drop-shadow-md">
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
