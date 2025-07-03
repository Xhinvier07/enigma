import { useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ResultFeedback - Shows success/failure feedback after answering a question
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the feedback is open
 * @param {boolean} props.isCorrect - Whether the answer was correct
 * @param {Function} props.onClose - Function to call when feedback is closed
 * @param {number} props.points - Points earned (if correct)
 */
const ResultFeedback = ({
  isOpen = false,
  isCorrect = false,
  onClose,
  points = 0
}) => {
  // Automatically close feedback after delay
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 1000); // Reduced from 3000ms to 1800ms
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <FeedbackContainer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <FeedbackCard
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: -20 }}
            isCorrect={isCorrect}
          >
            {isCorrect ? (
              <>
                <StampWatermark>SOLVED</StampWatermark>
                <SuccessIcon>✓</SuccessIcon>
                <Title>Case Solved!</Title>
                <Message>Excellent detective work!</Message>
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
  margin-bottom: 1rem;
  color: var(--dark-accents);
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