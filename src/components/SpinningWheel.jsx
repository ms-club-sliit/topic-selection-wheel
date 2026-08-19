import React, { useState, useRef, useEffect } from 'react';
import CelebrationModal from './CelebrationModal';

// Returns a CSS scale factor so the wheel fits the screen width
function useWheelScale() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth;
      if (vw < 360)       setScale(0.58);
      else if (vw < 420)  setScale(0.66);
      else if (vw < 480)  setScale(0.74);
      else if (vw < 640)  setScale(0.84);
      else if (vw < 768)  setScale(0.92);
      else if (vw < 1024) setScale(1.0);
      else if (vw < 1280) setScale(1.05);
      else if (vw < 1536) setScale(1.15);
      else                setScale(1.25);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return scale;
}

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

    // Gradient colour pairs: light → dark, cycling Blue→Cyan→Purple→Pink→Mint
    const gradientPairs = [
      { light: '#69CDFB', dark: '#557FFB' }, // Blue
      { light: '#67DED5', dark: '#5CD1A9' }, // Cyan/Mint
      { light: '#BC7DF9', dark: '#8468F2' }, // Purple
      { light: '#EE7DDF', dark: '#E050D4' }, // Pink
      { light: '#69CDFB', dark: '#557FFB' }, // Blue (repeat)
      { light: '#BC7DF9', dark: '#8468F2' }, // Purple
      { light: '#67DED5', dark: '#5CD1A9' }, // Cyan
      { light: '#EE7DDF', dark: '#E050D4' }, // Pink
    ];
    // Retry uses pink
    const retryPair = { light: '#EE7DDF', dark: '#E050D4' };

    segments.forEach((segment, index) => {
      const startAngle = (index * segmentAngle - 90) * (Math.PI / 180);
      const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180);
      const midAngle = (startAngle + endAngle) / 2;

      // Build a linear gradient from inner-edge to outer-edge of the segment
      const pair = segment.isRetry ? retryPair : gradientPairs[index % gradientPairs.length];
      const gx1 = centerX + (radius * 0.25) * Math.cos(midAngle);
      const gy1 = centerY + (radius * 0.25) * Math.sin(midAngle);
      const gx2 = centerX + radius * Math.cos(midAngle);
      const gy2 = centerY + radius * Math.sin(midAngle);
      const grad = ctx.createLinearGradient(gx1, gy1, gx2, gy2);
      grad.addColorStop(0, pair.light);
      grad.addColorStop(1, pair.dark);

      // Segment background
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text label
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(midAngle);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      const fontSize = segments.length > 8 ? 18 : 22;
      ctx.font = segment.isRetry
        ? `bold ${fontSize - 1}px Inter, Arial`
        : `bold ${fontSize}px Inter, Arial`;
      ctx.shadowColor = 'rgba(0,0,0,0.18)';
      ctx.shadowBlur = 3;
      ctx.fillText(segment.label, radius * 0.65, 7);
      ctx.shadowBlur = 0;
      ctx.restore();
    });

    // Draw center hub circle (visual background for the overlay button)
    ctx.beginPath();
    ctx.arc(centerX, centerY, HUB_RADIUS, 0, 2 * Math.PI);
    const hubGrad = ctx.createRadialGradient(
      centerX - 8, centerY - 8, 4,
      centerX, centerY, HUB_RADIUS
    );
    hubGrad.addColorStop(0, '#ffffff');
    hubGrad.addColorStop(1, '#eef2ff');
    ctx.fillStyle = hubGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(84, 127, 251, 0.3)';
    ctx.lineWidth = 2.5;
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

  // Responsive scale
  const wheelScale = useWheelScale();
  // Scaled height for the wrapper so it doesn't leave empty space
  const CANVAS_SIZE = 420;
  const scaledSize = CANVAS_SIZE * wheelScale;

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

            {/* Pointer/Arrow at top — SVG gradient with white glow */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 z-10">
              <svg width="36" height="28" viewBox="0 0 36 28" style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.95)) drop-shadow(0 0 3px rgba(130,80,255,0.8))' }}>
                <defs>
                  <linearGradient id="ptrGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
                <polygon points="18,28 0,0 36,0" fill="url(#ptrGrad)" />
              </svg>
            </div>

            {/* Canvas + hub overlay wrapper — CSS-scaled for mobile */}
            <div
              style={{
                width: `${scaledSize}px`,
                height: `${scaledSize}px`,
                position: 'relative',
              }}
            >
              {/* Inner div stays at native 420px, scaled down */}
              <div
                style={{
                  width: `${CANVAS_SIZE}px`,
                  height: `${CANVAS_SIZE}px`,
                  transform: `scale(${wheelScale})`,
                  transformOrigin: 'top left',
                  position: 'relative',
                }}
              >

              {/* Outer colour bloom — wide soft halo */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background: 'conic-gradient(from 0deg, rgba(217,107,160,0.35), rgba(144,121,196,0.35), rgba(92,141,232,0.35), rgba(60,201,163,0.35), rgba(217,107,160,0.35))',
                  transform: 'scale(1.22)',
                  filter: 'blur(18px)',
                  zIndex: 0,
                }}
              />

              {/* Inner bright white ring glow — tight and sharp */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  boxShadow: '0 0 0 6px rgba(255,255,255,0.55), 0 0 18px 4px rgba(200,180,255,0.4)',
                  borderRadius: '50%',
                  transform: 'scale(1.01)',
                  zIndex: 2,
                }}
              />

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
                  position: 'relative',
                  zIndex: 1,
                  borderRadius: '50%',
                  boxShadow: '0 12px 35px rgba(74,91,180,0.18), 0 0 25px rgba(119,111,255,0.15)',
                }}
              />

              {/* Glowing ring behind the hub */}
              <div
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: `${hubPx + 24}px`,
                  height: `${hubPx + 24}px`,
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.9) 40%, rgba(196,181,253,0.5) 70%, transparent 100%)',
                  filter: 'blur(6px)',
                  zIndex: 19,
                }}
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
                  background: 'radial-gradient(circle at 38% 35%, #ffffff 0%, #eef2ff 100%)',
                  border: '2.5px solid rgba(84,127,251,0.25)',
                  boxShadow: isSpinning
                    ? '0 0 0 6px rgba(84,127,251,0.08), 0 8px 25px rgba(84,127,251,0.2)'
                    : '0 0 0 6px rgba(84,127,251,0.12), 0 8px 25px rgba(84,127,251,0.25)',
                  cursor: isSpinning ? 'not-allowed' : 'pointer',
                  transition: 'box-shadow 0.3s ease',
                  zIndex: 20,
                }}
              >
                {isSpinning ? (
                  <span style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    color: '#304BFF',
                  }}>
                    SPINNING…
                  </span>
                ) : (
                  <>
                    <span style={{
                      display: 'block',
                      fontSize: '20px',
                      fontWeight: 900,
                      letterSpacing: '0.04em',
                      lineHeight: 1.05,
                      color: '#304BFF',
                    }}>
                      SPIN
                    </span>
                    <span style={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.09em',
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
              </div> {/* end inner 420px scale div */}
            </div> {/* end outer sized wrapper */}
          </div> {/* end wheel wrapper */}
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
