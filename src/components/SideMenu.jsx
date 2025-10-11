import React, { useState } from 'react';

export default function SideMenu({ 
  topicCount, 
  setTopicCount, 
  retryProbability, 
  setRetryProbability,
  excludedNumbers,
  onToggleExclusion,
  onResetExclusions,
  selectedHistory,
  topicNames,
  setTopicNames
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        
        // Validate that it's an object with number keys
        if (typeof json !== 'object' || Array.isArray(json)) {
          setUploadError('Invalid format: JSON must be an object with number keys');
          return;
        }

        // Convert all keys to numbers and validate
        const mappings = {};
        for (const [key, value] of Object.entries(json)) {
          const num = parseInt(key);
          if (isNaN(num)) {
            setUploadError(`Invalid key "${key}": must be a number`);
            return;
          }
          if (typeof value !== 'string') {
            setUploadError(`Invalid value for "${key}": must be a string`);
            return;
          }
          mappings[num] = value;
        }

        setTopicNames(mappings);
        setUploadError(null);
        
        // Reset file input
        event.target.value = '';
      } catch (error) {
        setUploadError('Invalid JSON file: ' + error.message);
      }
    };
    reader.readAsText(file);
  };

  const handleClearTopicNames = () => {
    setTopicNames({});
    setUploadError(null);
  };

  // Generate array of all topic numbers
  const allTopics = Array.from({ length: topicCount }, (_, i) => i + 1);

  // Get available (not excluded) numbers count
  const availableCount = allTopics.filter(n => !excludedNumbers.includes(n)).length;

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 right-6 z-50 p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-all transform hover:scale-110"
        aria-label="Toggle menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-700"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Side Menu */}
      <div
        className={`fixed top-0 right-0 h-full bg-white shadow-2xl transition-transform duration-300 ease-in-out z-40 overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: '380px' }}
      >
        <div className="p-8 pt-20 pb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Wheel Settings</h2>

          {/* JSON File Upload */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Upload Topic Names (JSON)
            </label>
            <div className="space-y-2">
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
              {Object.keys(topicNames).length > 0 && (
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="text-xs text-green-700">
                    ✓ {Object.keys(topicNames).length} topic(s) loaded
                  </span>
                  <button
                    onClick={handleClearTopicNames}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Clear
                  </button>
                </div>
              )}
              {uploadError && (
                <p className="text-xs text-red-500">{uploadError}</p>
              )}
              <p className="text-xs text-gray-500">
                Format: {`{"1": "Topic Name", "2": "Another Topic"}`}
              </p>
            </div>
          </div>

          {/* Topic Count Setting */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Topic Count
            </label>
            <div className="flex items-center gap-4 mb-2">
              <input
                type="range"
                min="3"
                max="30"
                value={topicCount}
                onChange={(e) => setTopicCount(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-2xl font-bold text-blue-600 min-w-[50px] text-center">
                {topicCount}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Numbers 1 to {topicCount} will appear on the wheel
            </p>
          </div>

          {/* Retry Probability Setting */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Retry Probability
            </label>
            <div className="flex items-center gap-4 mb-2">
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={retryProbability}
                onChange={(e) => setRetryProbability(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-2xl font-bold text-red-500 min-w-[50px] text-center">
                {retryProbability}%
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {retryProbability === 0 
                ? 'No retry segment on the wheel' 
                : `${retryProbability}% chance to land on retry`}
            </p>
          </div>

          {/* Manual Exclusion Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-semibold text-gray-700">
                Exclude Topics
              </label>
              <button
                onClick={onResetExclusions}
                className="text-xs px-3 py-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                Reset All
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Available: {availableCount} / {topicCount}
            </p>
            <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto p-2 bg-gray-50 rounded-lg">
              {allTopics.map(num => (
                <button
                  key={num}
                  onClick={() => onToggleExclusion(num)}
                  className={`p-2 rounded font-semibold text-sm transition-all transform hover:scale-105 ${
                    excludedNumbers.includes(num)
                      ? 'bg-red-500 text-white'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                  title={excludedNumbers.includes(num) ? 'Click to include' : 'Click to exclude'}
                >
                  {num}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Green: Available | Red: Excluded
            </p>
          </div>

          {/* Selected History */}
          {selectedHistory.length > 0 && (
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Selection History
              </label>
              <div className="max-h-32 overflow-y-auto p-3 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  {selectedHistory.slice().reverse().map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-blue-600">Topic {item.number}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Overlay when menu is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

