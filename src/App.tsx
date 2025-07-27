import React, { useEffect, useState } from 'react';
import './App.css';
import ShuttleScene from './ShuttleScene';

const launchCode = [
  'Initializing sequence ALGORITHM... [INTACT]',
  'Checking machine engine status... [UPDATED]',
  'Verifying Graphics thermal levels... [MODERATE]',
  'Loading the Boot loader diagnostics... [DONE]',
  'Establishing communication link... [OK]',
  'Calibrating navigation systems... [OK]',
  'Testing the CPCFTG controls... [OK]',
  'Activating guidance computer... [DONE]',
  'Securing payload bay... [SECURED]',
  'CONTROL NAV_LINK systems check... [DONE]',
  'Final wiring check... [NORMAL]',
  'AI ready for the COLD launch.',
  'BOOT-LOADING 10%.. 9%.. 8%.. 7%.. 6%.. 5%.. 4%.. 3%.. 2%.. 1%.. 0%..',
  'ARE YOU READY?FOR THE ---PORFOLIO---',























  '-----IBM-75.23.65.3.4.32.84----SYSTEM-READY--------------BOOTING-UP-...----------WORKING---------------',
];

function App() {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showShuttle, setShowShuttle] = useState(false);

  // Calculate the delay so the total animation is about 2 seconds
  const totalDuration = 2000; // ms
  const lineDelay = totalDuration / launchCode.length;

  useEffect(() => {
    if (currentLine < launchCode.length) {
      const timeout = setTimeout(() => {
        setDisplayedLines((prev) => [...prev, launchCode[currentLine]]);
        setCurrentLine((prev) => prev + 1);
      }, lineDelay);
      return () => clearTimeout(timeout);
    } else {
      setTimeout(() => setIsComplete(true), 400); // short pause at end
    }
  }, [currentLine, lineDelay]);

  useEffect(() => {
    if (isComplete) {
      // Instantly switch to the shuttle scene after CLI
      setShowShuttle(true);
    }
  }, [isComplete]);

  if (showShuttle) {
    return <ShuttleScene />;
  }

  return (
    <div className="terminal-bg">
      <div className="terminal-window small-text">
        {displayedLines.map((line, idx) => (
          <div key={idx} className="terminal-line">{line}</div>
        ))}
        {!isComplete && <div className="terminal-cursor">|</div>}
      </div>
    </div>
  );
}

export default App;
