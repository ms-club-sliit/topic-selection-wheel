import React, { useState, useRef, useEffect } from 'react';
import CelebrationModal from './CelebrationModal';

export default function SpinningWheel({ topicCount, retryProbability, excludedNumbers = [], topicNames = {}, onSpin }) {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const canvasRef = useRef(null);

  // Generate segments including retry option
  const generateSegments = () => {
    const segments = [];
    const hasRetry = retryProbability > 0;
    
    // Add numbered segments (excluding excluded numbers)
    for (let i = 1; i <= topicCount; i++) {
      if (!excludedNumbers.includes(i)) {
        segments.push({ value: i, label: i.toString(), isRetry: false });
      }
    }
    
    // Add just 1 retry segment if enabled
    if (hasRetry && segments.length > 0) {
      segments.push({ value: 'retry', label: 'Retry', isRetry: true });
    }
    
    return segments;
  };

  const segments = generateSegments();
  const segmentAngle = segments.length > 0 ? 360 / segments.length : 0;

  // Draw the wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw segments
    // Banner/Clip art colors
    const colors = [
      '#D53F34', // Red
      '#E4AB09', // Yellow/Gold
      '#31994E', // Green
      '#3F7ADF', // Blue
    ];

    segments.forEach((segment, index) => {
      const startAngle = (index * segmentAngle - 90) * (Math.PI / 180);
      const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180);

      // Segment background
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      
      // Use banner colors, cycling through them
      if (segment.isRetry) {
        ctx.fillStyle = '#D53F34'; // Red for retry
      } else {
        ctx.fillStyle = colors[index % colors.length];
      }
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate((startAngle + endAngle) / 2);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.font = segment.isRetry ? 'bold 20px Arial' : 'bold 24px Arial';
      ctx.fillText(segment.label, radius * 0.65, 8);
      ctx.restore();
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.stroke();
  }, [segments.length, topicCount, retryProbability, excludedNumbers]);

  const spinWheel = () => {
    if (isSpinning || segments.length === 0) return;

    setIsSpinning(true);
    setSelectedNumber(null);

    // Determine if we should land on retry based on probability
    const shouldRetry = Math.random() * 100 < retryProbability;
    
    // Find retry segment index if it exists
    const retryIndex = segments.findIndex(seg => seg.isRetry);
    const hasRetrySegment = retryIndex !== -1;
    
    // Determine target segment
    let targetSegmentIndex;
    if (shouldRetry && hasRetrySegment) {
      // Land on retry segment
      targetSegmentIndex = retryIndex;
    } else {
      // Land on a random non-retry segment
      const nonRetryIndices = segments
        .map((seg, idx) => (!seg.isRetry ? idx : -1))
        .filter(idx => idx !== -1);
      targetSegmentIndex = nonRetryIndices[Math.floor(Math.random() * nonRetryIndices.length)];
    }

    // Calculate rotation to land on target segment
    // Segments are drawn starting at -90deg (top), with segment 0 at the top
    // After rotation R, segment i center is at: -90 + i*segmentAngle + segmentAngle/2 + R
    // For segment i to be at the pointer (top = -90deg), we need:
    // -90 + i*segmentAngle + segmentAngle/2 + R = -90
    // Therefore: R = -(i*segmentAngle + segmentAngle/2)
    
    // Target total rotation to position segment at pointer
    const segmentCenterOffset = targetSegmentIndex * segmentAngle + segmentAngle / 2;
    let targetRotation = -segmentCenterOffset;
    
    // Normalize to positive and ensure we rotate forward from current position
    const currentRotation = rotation % 360;
    while (targetRotation <= currentRotation) {
      targetRotation += 360;
    }
    
    // Random spins between 5 and 10 full rotations
    const minSpins = 5;
    const maxSpins = 10;
    const spins = Math.floor(Math.random() * (maxSpins - minSpins + 1)) + minSpins;
    
    // Add full rotations to make it more exciting
    targetRotation += spins * 360;
    
    // Add random offset within segment for natural look
    const segmentOffset = (Math.random() - 0.5) * segmentAngle * 0.6;
    
    // Calculate additional rotation needed
    const additionalRotation = targetRotation - rotation + segmentOffset;
    
    const selected = segments[targetSegmentIndex];
    
    // Debug logging
    const finalRotation = rotation + additionalRotation;
    const finalSegmentPos = (-90 + segmentCenterOffset + finalRotation) % 360;
    console.log('Spin details:', {
      shouldRetry,
      targetSegmentIndex,
      selected: selected.value,
      isRetry: selected.isRetry,
      segmentCenterOffset: segmentCenterOffset.toFixed(2),
      currentRotation: currentRotation.toFixed(2),
      finalRotation: (finalRotation % 360).toFixed(2),
      segmentWillBeAt: finalSegmentPos.toFixed(2) + '° (should be near -90° or 270°)',
      segments: segments.map((s, i) => `${i}:${s.value}`)
    });
    
    setRotation(rotation + additionalRotation);

    // After animation completes
    setTimeout(() => {
      setIsSpinning(false);
      setSelectedNumber(selected);
      setShowModal(true);
    }, 4000);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    
    // Wait a moment before removing from wheel to allow modal to close smoothly
    setTimeout(() => {
      if (selectedNumber && onSpin) {
        onSpin(selectedNumber);
      }
      setSelectedNumber(null);
    }, 300);
  };

  // Check if all numbers are excluded
  const allNumbersExcluded = segments.length === 0;

  return (
    <div className="flex flex-col items-center justify-center gap-8 w-full">
      {allNumbersExcluded ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-xl">
          <p className="text-3xl font-bold text-red-500 mb-4">⚠️ No Topics Available</p>
          <p className="text-lg text-gray-600 text-center">
            All topics have been excluded or selected.
            <br />
            Use the reset button in the menu to start over.
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-24 w-full">
          {/* Spin Button - Far Left */}
          <button
            onClick={spinWheel}
            disabled={isSpinning}
            className={`px-12 py-4 text-2xl font-bold text-white rounded-full shadow-lg transition-all transform hover:scale-105 ${
              isSpinning
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
            }`}
          >
            {isSpinning ? 'SPINNING...' : 'SPIN THE WHEEL!'}
          </button>

          {/* Wheel - Centered */}
          <div className="relative">
            {/* Pointer/Arrow at top */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 z-10">
              <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[30px] border-t-yellow-400 drop-shadow-lg"></div>
            </div>

            {/* Spinning Wheel */}
            <div className="relative">
              <canvas
                ref={canvasRef}
                width="550"
                height="550"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
                }}
                className="drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Spacer for balance */}
          <div className="w-[280px]"></div>
        </div>
      )}

      {/* Celebration Modal */}
      {showModal && selectedNumber && (
        <CelebrationModal
          selectedNumber={selectedNumber.value}
          topicName={topicNames[selectedNumber.value]}
          isRetry={selectedNumber.isRetry}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

