import { useState, useEffect } from "react";
import "./CountDown.css";

export default function Timer({ Till }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Time calculations
  const diff = Math.max(0, Till - now);
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Exact clock-hand angles based on current time calculations
  const hourAngle = ((hours % 12) + minutes / 60) * 30;
  const minuteAngle = (minutes + seconds / 60) * 6;
  const secondAngle = seconds * 6;

  // Format digital string with zero padding for clean aesthetics
  const pad = (num) => String(num).padStart(2, "0");
  const digital = `${hours}h ${pad(minutes)}m ${pad(seconds)}s`;

  return (
    <div className="countdown-container">
      <div className="clock-outer">
        <div className="clock-face">
          {/* Subtle tick markers for 12, 3, 6, and 9 o'clock */}
          <div className="clock-tick tick-3" />
          <div className="clock-tick tick-6" />
          <div className="clock-tick tick-9" />
          <div className="clock-tick tick-12" />

          {/* Clock Hands */}
          <div
            className="clock-hand hour-hand"
            style={{ transform: `rotate(${hourAngle}deg)` }}
          />
          <div
            className="clock-hand minute-hand"
            style={{ transform: `rotate(${minuteAngle}deg)` }}
          />
          <div
            className="clock-hand second-hand"
            style={{ transform: `rotate(${secondAngle}deg)` }}
          />
          
          {/* Center Pin */}
          <div className="clock-center-pin" />
        </div>
      </div>

      {/* Floating glassmorphic digital timer badge overlay */}
      <div className="digital-badge">
        <span>{digital}</span>
      </div>
    </div>
  );
}