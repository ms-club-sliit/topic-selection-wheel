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

  // Hub radius in canvas pixels (must match the overlay button size)
  const HUB_RADIUS = 52;

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

    // Segment fill colors (4 cycling colors matching the banner)
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

      ctx.fillStyle = segment.isRetry ? '#D53F34' : colors[index % colors.length];
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw text label
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate((startAngle + endAngle) / 2);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      const fontSize = segments.length > 8 ? 20 : 24;
      ctx.font = segment.isRetry
        ? `bold ${fontSize - 2}px Arial`
        : `bold ${fontSize}px Arial`;
      ctx.fillText(segment.label, radius * 0.65, 8);
      ctx.restore();
    });

    // Draw center hub circle (visual background for the overlay button)
    ctx.beginPath();
    ctx.arc(centerX, centerY, HUB_RADIUS, 0, 2 * Math.PI);
    const hubGrad = ctx.createRadialGradient(
      centerX - 10, centerY - 10, 4,
      centerX, centerY, HUB_RADIUS
    );
    hubGrad.addColorStop(0, '#ffffff');
    hubGrad.addColorStop(1, '#ede9fe');
    ctx.fillStyle = hubGrad;
    ctx.fill();
    ctx.strokeStyle = '#a78bfa';
    ctx.lineWidth = 3.5;
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
      targetSegmentIndex = retryIndex;
    } else {
      const nonRetryIndices = segments
        .map((seg, idx) => (!seg.isRetry ? idx : -1))
        .filter(idx => idx !== -1);
      targetSegmentIndex = nonRetryIndices[Math.floor(Math.random() * nonRetryIndices.length)];
    }

    // Calculate rotation to land on target segment
    const segmentCenterOffset = targetSegmentIndex * segmentAngle + segmentAngle / 2;
    let targetRotation = -segmentCenterOffset;

    // Ensure we rotate forward from current position
    const currentRotation = rotation % 360;
    while (targetRotation <= currentRotation) {
      targetRotation += 360;
    }

    // Random spins between 5 and 10 full rotations
    const spins = Math.floor(Math.random() * 6) + 5;
    targetRotation += spins * 360;

    // Add random offset within segment for natural look
    const segmentOffset = (Math.random() - 0.5) * segmentAngle * 0.6;
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

    setTimeout(() => {
      if (selectedNumber && onSpin) {
        onSpin(selectedNumber);
      }
      setSelectedNumber(null);
    }, 300);
  };

  // Check if all numbers are excluded
  const allNumbersExcluded = segments.length === 0;

  // Hub overlay size in px (= HUB_RADIUS * 2, matching canvas draw)
  const hubPx = HUB_RADIUS * 2; // 104px

  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full">
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
        <div className="flex items-center justify-center w-full">
          {/* Wheel wrapper */}
          <div className="relative">

            {/* Pointer/Arrow at top */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-3 z-10">
              <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[24px] border-t-violet-600 drop-shadow-lg" />
            </div>

            {/* Canvas + hub overlay wrapper */}
            <div className="relative">
              <canvas
                ref={canvasRef}
                width="420"
                height="420"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: isSpinning
                    ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)'
                    : 'none',
                  display: 'block',
                }}
                className="drop-shadow-2xl"
              />

              {/* Center hub overlay — acts as the spin button, stays fixed (not spinning) */}
              <button
                onClick={spinWheel}
                disabled={isSpinning}
                aria-label="Spin the wheel"
                className="absolute rounded-full flex flex-col items-center justify-center"
                style={{
                  width: `${hubPx}px`,
                  height: `${hubPx}px`,
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #ede9fe 100%)',
                  border: '3.5px solid #a78bfa',
                  boxShadow: isSpinning
                    ? '0 0 0 5px rgba(167,139,250,0.25), inset 0 2px 10px rgba(0,0,0,0.08)'
                    : '0 6px 24px rgba(139,92,246,0.4), inset 0 2px 10px rgba(0,0,0,0.06)',
                  cursor: isSpinning ? 'not-allowed' : 'pointer',
                  transition: 'box-shadow 0.3s ease, transform 0.3s ease',
                  zIndex: 20,
                }}
              >
                {isSpinning ? (
                  <span style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>
                    SPINNING…
                  </span>
                ) : (
                  <>
                    <span style={{
                      display: 'block',
                      fontSize: '19px',
                      fontWeight: 900,
                      letterSpacing: '0.04em',
                      lineHeight: 1.1,
                      background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}>
                      SPIN
                    </span>
                    <span style={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      lineHeight: 1.3,
                      background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}>
                      THE WHEEL
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
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
