import { useState, useEffect } from 'react';
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
  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0 });
  const [isWarning, setIsWarning] = useState(false);
  const [isLowTime, setIsLowTime] = useState(false);
  const [timerId, setTimerId] = useState(null);
  
  useEffect(() => {
    // Clear existing timer when endTime changes
    if (timerId) {
      clearInterval(timerId);
    }
    
    // Calculate time remaining
    const calculateTimeLeft = () => {
      if (!endTime) return false;
      
      const now = new Date();
      const end = new Date(endTime);
      const difference = end - now;
      
      if (difference <= 0) {
        // Time's up
        setTimeLeft({ minutes: 0, seconds: 0 });
        if (onTimeUp) onTimeUp();
        return false;
      }
      
      // Convert to minutes and seconds
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      
      setTimeLeft({ minutes, seconds });
      
      // Set warning states based on time remaining
      setIsLowTime(minutes < 5);
      setIsWarning(minutes < 2);
      
      return true;
    };
    
    // Calculate initial time
    const hasTimeLeft = calculateTimeLeft();
    
    // If no time left, don't start a new interval
    if (!hasTimeLeft) return;
    
    // Start new interval
    const newTimerId = setInterval(calculateTimeLeft, 1000);
    setTimerId(newTimerId);
    
    // Cleanup on unmount or when endTime changes
    return () => {
      if (newTimerId) clearInterval(newTimerId);
    };
  }, [endTime, onTimeUp]);

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