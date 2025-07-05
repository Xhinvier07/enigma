import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';

/**
 * GameTimer - Displays and manages game countdown timer
 * 
 * @param {Object} props
 * @param {Date} props.endTime - When the game will end
 * @param {Function} props.onTimeUp - Function to call when time runs out
 */
const GameTimer = ({ endTime, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState({ minutes: 120, seconds: 0 }); // Default to 120 minutes
  const [isWarning, setIsWarning] = useState(false);
  const [isLowTime, setIsLowTime] = useState(false);
  const timerIdRef = useRef(null);
  const continuousTimerRef = useRef(null);
  const backupTimerRef = useRef(null);
  const endTimeRef = useRef(null);
  const lastUpdateRef = useRef(Date.now());
  const timeUpCalledRef = useRef(false);

  // Force recalculation of time left
  const forceUpdateTimeLeft = () => {
    if (!endTimeRef.current) {
      console.log('Timer: No end time reference available');
      return false;
    }
    
    const now = new Date();
    const end = new Date(endTimeRef.current); // Ensure it's a Date object
    const difference = end - now;
    
    // Debug logging
    console.log(`Timer update at ${now.toISOString()}`);
    console.log(`End time: ${end.toISOString()}`);
    console.log(`Time difference: ${difference}ms`);
    
    // Update the last update timestamp
    lastUpdateRef.current = Date.now();
    
    if (difference <= 0) {
      console.log('Timer expired - calling onTimeUp');
      setTimeLeft({ minutes: 0, seconds: 0 });
      
      // Only call onTimeUp once
      if (!timeUpCalledRef.current && onTimeUp) {
        timeUpCalledRef.current = true;
        onTimeUp();
      }
      return false;
    }
    
    // Convert to minutes and seconds
    const totalSeconds = Math.floor(difference / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    console.log(`Time left: ${minutes}m ${seconds}s`);
    setTimeLeft({ minutes, seconds });
    
    // Set warning states based on time remaining
    setIsLowTime(minutes < 5);
    setIsWarning(minutes < 2);
    
    return true;
  };

  // Check if timer updates are stalled and force an update if needed
  const checkTimerHealth = () => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;
    
    if (timeSinceLastUpdate > 2000) {
      console.log(`Timer health check: Last update was ${timeSinceLastUpdate}ms ago. Forcing update.`);
      forceUpdateTimeLeft();
    }
  };

  // Initialize timer when endTime changes
  useEffect(() => {
    if (!endTime) {
      console.log('Timer: No endTime provided');
      return;
    }
    
    // Reset the timeUpCalled flag when endTime changes
    timeUpCalledRef.current = false;
    
    // Always convert to Date object for consistency
    const end = new Date(endTime);
    console.log(`Setting up timer with end time: ${end.toISOString()}`);
    
    // Store end time in ref for access from other functions
    endTimeRef.current = end;
    
    // Calculate initial time
    forceUpdateTimeLeft();
    
    // Clear any existing timers
    if (timerIdRef.current) {
      clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }
    
    if (continuousTimerRef.current) {
      clearInterval(continuousTimerRef.current);
      continuousTimerRef.current = null;
    }
    
    if (backupTimerRef.current) {
      clearInterval(backupTimerRef.current);
      backupTimerRef.current = null;
    }
    
    // Set up interval for timer updates (primary timer)
    timerIdRef.current = setInterval(forceUpdateTimeLeft, 1000);
    
    // Set up health check timer (checks every 2 seconds)
    backupTimerRef.current = setInterval(checkTimerHealth, 2000);
    
    return () => {
      if (timerIdRef.current) {
        clearInterval(timerIdRef.current);
        timerIdRef.current = null;
      }
      
      if (continuousTimerRef.current) {
        clearInterval(continuousTimerRef.current);
        continuousTimerRef.current = null;
      }
      
      if (backupTimerRef.current) {
        clearInterval(backupTimerRef.current);
        backupTimerRef.current = null;
      }
    };
  }, [endTime, onTimeUp]);
  
  // Additional continuous timer as backup to ensure updates
  useEffect(() => {
    // Start a continuous timer that updates every second regardless of props
    continuousTimerRef.current = setInterval(() => {
      forceUpdateTimeLeft();
    }, 1000);
    
    return () => {
      if (continuousTimerRef.current) {
        clearInterval(continuousTimerRef.current);
        continuousTimerRef.current = null;
      }
    };
  }, []);
  
  // For debugging - force update on component render
  useEffect(() => {
    console.log('Timer component rendered, forcing time update');
    forceUpdateTimeLeft();
  });

  // Use requestAnimationFrame as a last resort backup
  useEffect(() => {
    let frameId;
    
    const updateFrame = () => {
      forceUpdateTimeLeft();
      frameId = requestAnimationFrame(updateFrame);
    };
    
    frameId = requestAnimationFrame(updateFrame);
    
    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, []);

  return (
    <TimerContainer isWarning={isWarning} isLowTime={isLowTime}>
      <TimerLabel>Time Remaining:</TimerLabel>
      <TimeDisplay>
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </TimeDisplay>
      <ClockEndTime>
        {endTime && `Ends at ${format(new Date(endTime), 'h:mm a')}`}
      </ClockEndTime>
    </TimerContainer>
  );
};

// Styled Components
const TimerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${props => {
    if (props.isWarning) return 'rgba(244, 67, 54, 0.15)';
    if (props.isLowTime) return 'rgba(255, 152, 0, 0.15)';
    return 'rgba(210, 180, 140, 0.2)';
  }};
  border: 2px solid ${props => {
    if (props.isWarning) return '#c62828';
    if (props.isLowTime) return '#e65100';
    return 'var(--secondary-brown)';
  }};
  border-radius: 8px;
  padding: 0.8rem 1.5rem;
  transition: all 0.3s ease;
  position: relative;
  
  ${props => props.isWarning && `
    animation: pulse-warning 1s infinite;
    
    @keyframes pulse-warning {
      0% { box-shadow: 0 0 0 0 rgba(198, 40, 40, 0.4); }
      70% { box-shadow: 0 0 0 8px rgba(198, 40, 40, 0); }
      100% { box-shadow: 0 0 0 0 rgba(198, 40, 40, 0); }
    }
  `}
  
  &::before {
    content: '';
    position: absolute;
    top: 4px;
    left: 4px;
    right: 4px;
    bottom: 4px;
    border: 1px dashed ${props => {
      if (props.isWarning) return 'rgba(198, 40, 40, 0.3)';
      if (props.isLowTime) return 'rgba(230, 81, 0, 0.3)';
      return 'rgba(92, 64, 51, 0.3)';
    }};
    border-radius: 5px;
    pointer-events: none;
  }
`;

const TimerLabel = styled.div`
  font-family: 'Special Elite', cursive;
  font-size: 0.8rem;
  color: var(--dark-accents);
  margin-bottom: 0.3rem;
`;

const TimeDisplay = styled.div`
  font-family: 'Special Elite', cursive;
  font-size: 1.8rem;
  color: var(--dark-accents);
  font-weight: bold;
  letter-spacing: 2px;
`;

const ClockEndTime = styled.div`
  font-family: 'Crimson Text', serif;
  font-size: 0.8rem;
  font-style: italic;
  margin-top: 0.3rem;
  opacity: 0.7;
`;

export default GameTimer; 