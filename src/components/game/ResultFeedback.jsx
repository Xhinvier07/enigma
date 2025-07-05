import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { getStudentSession } from '../../utils/authUtils';

/**
 * ResultFeedback - Shows success/failure feedback after answering a question
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the feedback is open
 * @param {boolean} props.isCorrect - Whether the answer was correct
 * @param {Function} props.onClose - Function to call when feedback is closed
 * @param {number} props.points - Points earned (if correct)
 * @param {boolean} props.alreadySolved - Whether the question was already solved by a team member
 */
const ResultFeedback = ({
  isOpen = false,
  isCorrect = false,
  onClose,
  points = 0,
  alreadySolved = false
}) => {
  // Get team name from session
  const session = getStudentSession();
  const teamName = session?.teamName || '';
  
  // Track internal visibility state to handle animation
  const [visible, setVisible] = useState(false);
  
  // When isOpen changes, update internal visibility
  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      
      // Schedule auto-close after 1 second
      const timer = setTimeout(() => {
        setVisible(false);
        
        // Give time for exit animation before calling onClose
        setTimeout(() => {
          onClose();
        }, 400);
      }, 1000);
      
      return () => {
        clearTimeout(timer);
      };
    } else {
      setVisible(false);
    }
  }, [isOpen, onClose]);

  // Handle manual close button click
  const handleCloseClick = (e) => {
    e.stopPropagation();
    setVisible(false);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  return (
    <AnimatePresence>
      {isOpen && visible && (
        <FeedbackContainer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <FeedbackCard
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: -20 }}
            transition={{ duration: 0.3 }}
            isCorrect={isCorrect}
          >
            <CloseButton onClick={handleCloseClick}>×</CloseButton>
            
            {isCorrect ? (
              <>
                <StampWatermark>SOLVED</StampWatermark>
                <SuccessIcon>✓</SuccessIcon>
                <Title>Case Solved!</Title>
                {alreadySolved ? (
                  <Message>This case was already solved by your team.</Message>
                ) : (
                  <>
                    <Message>Excellent detective work!</Message>
                    {teamName && <TeamName>Team {teamName}</TeamName>}
                    <SyncNote>All team members will see this solved case.</SyncNote>
                  </>
                )}
                {points > 0 && (
                  <Points>+{points} points</Points>
                )}
              </>
            ) : (
              <>
                <StampWatermark>TRY AGAIN</StampWatermark>
                <FailureIcon>✗</FailureIcon>
                <Title>Incorrect Solution</Title>
                <Message>Keep investigating, detective.</Message>
                {teamName && <TeamName>Team {teamName}</TeamName>}
              </>
            )}
          </FeedbackCard>
        </FeedbackContainer>
      )}
    </AnimatePresence>
  );
};

// Styled Components
const FeedbackContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  pointer-events: none;
  background-color: rgba(0, 0, 0, 0.3);
`;

const FeedbackCard = styled(motion.div)`
  background-color: var(--aged-paper);
  border: 3px solid ${props => props.isCorrect ? '#2e7d32' : '#c62828'};
  border-radius: 8px;
  padding: 2rem;
  width: 90%;
  max-width: 400px;
  text-align: center;
  box-shadow: var(--shadow-heavy);
  position: relative;
  overflow: hidden;
  pointer-events: auto;
`;

const CloseButton = styled.button`
  --size: 2rem;

  position: absolute;
  top: 0.75rem;
  right: 0.75rem;

  width: var(--size);
  height: var(--size);
  aspect-ratio: 1;
  border-radius: 50%;

  background-color: var(--primary-dark-brown);
  color: var(--aged-paper);
  border: 2px solid var(--dark-accents);

  display: grid;
  place-items: center;

  font-family: 'Special Elite', cursive;
  font-size: 1.25rem;
  line-height: 1.7;
  padding: 0;
  margin: 0;

  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0 0 0 / 0.25);
  z-index: 10;
  transition: background-color var(--transition-fast), transform var(--transition-fast);

  &:hover {
    background-color: var(--secondary-brown);
    transform: scale(1.08);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const StampWatermark = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-30deg);
  font-family: 'Special Elite', cursive;
  font-size: 4rem;
  opacity: 0.07;
  color: var(--dark-accents);
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
`;

const SuccessIcon = styled.div`
  font-size: 3.5rem;
  color: #2e7d32;
  margin-bottom: 1rem;
`;

const FailureIcon = styled.div`
  font-size: 3.5rem;
  color: #c62828;
  margin-bottom: 1rem;
`;

const Title = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  color: var(--dark-accents);
`;

const Message = styled.p`
  font-family: 'Libre Baskerville', serif;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: var(--dark-accents);
`;

const TeamName = styled.p`
  font-family: 'Special Elite', cursive;
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: var(--dark-accents);
`;

const SyncNote = styled.p`
  font-family: 'Libre Baskerville', serif;
  font-size: 0.9rem;
  font-style: italic;
  margin-bottom: 1rem;
  color: var(--dark-accents);
  opacity: 0.8;
`;

const Points = styled.div`
  font-family: 'Special Elite', cursive;
  font-size: 1.5rem;
  color: #2e7d32;
  font-weight: bold;
  padding: 0.5rem 1rem;
  background-color: rgba(46, 125, 50, 0.1);
  border-radius: 4px;
  display: inline-block;
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`;

export default ResultFeedback;