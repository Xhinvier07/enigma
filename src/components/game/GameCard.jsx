import { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

/**
 * GameCard - Flippable card component for game tiles
 * 
 * @param {Object} props
 * @param {Object} props.question - Question data
 * @param {Function} props.onCardClick - Function to call when card is clicked
 * @param {boolean} props.isCompleted - Whether the card has been completed
 * @param {number} props.index - Card index for animation delay
 */
const GameCard = ({ 
  question, 
  onCardClick, 
  isCompleted = false,
  index = 0 
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    if (isCompleted) return;
    
    // Flip card animation then call the parent handler
    setIsFlipped(true);
    
    // Delay to allow the flip animation to show
    setTimeout(() => {
      onCardClick(question);
      // Reset card flip after some time
      setTimeout(() => {
        setIsFlipped(false);
      }, 500);
    }, 600);
  };

  return (
    <CardContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 + 0.2 }}
      isCompleted={isCompleted}
    >
      <CardInner isFlipped={isFlipped}>
        <CardFront onClick={handleClick}>
          <CardNumber>{index + 1}</CardNumber>
          {isCompleted && <CompletedStamp>SOLVED</CompletedStamp>}
          {!isCompleted && (
            <DifficultyBadge difficulty={question.difficulty}>
              {question.difficulty}
            </DifficultyBadge>
          )}
        </CardFront>
        <CardBack>
          <QuestionIcon>?</QuestionIcon>
        </CardBack>
      </CardInner>
    </CardContainer>
  );
};

// Styled Components
const CardContainer = styled(motion.div)`
  width: 100%;
  aspect-ratio: 3/4;
  perspective: 1000px;
  cursor: ${props => props.isCompleted ? 'default' : 'pointer'};
  opacity: ${props => props.isCompleted ? 0.8 : 1};
`;

const CardInner = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  transform: ${props => props.isFlipped ? 'rotateY(180deg)' : 'rotateY(0)'};
  box-shadow: var(--shadow-medium);
`;

const CardSide = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  border: 2px solid var(--dark-accents);
  background-color: var(--aged-paper);
  background-image: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.15" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%" height="100%" filter="url(%23noise)" opacity="0.4"/%3E%3C/svg%3E');
  background-repeat: repeat;
  transition: all 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: 5px;
    left: 5px;
    right: 5px;
    bottom: 5px;
    border: 1px dashed var(--secondary-brown);
    border-radius: 5px;
    opacity: 0.4;
    z-index: 0;
    pointer-events: none;
  }
`;

const CardFront = styled(CardSide)`
  transform: rotateY(0deg);
  
  &:hover {
    box-shadow: var(--shadow-heavy);
    transform: translateY(-5px);
  }
`;

const CardBack = styled(CardSide)`
  transform: rotateY(180deg);
  background-color: var(--vintage-sepia);
`;

const CardNumber = styled.div`
  font-family: 'Special Elite', cursive;
  font-size: 2.5rem;
  color: var(--primary-dark-brown);
  font-weight: bold;
  text-shadow: 1px 1px 0 var(--vintage-sepia);
  position: relative;
  z-index: 1;
`;

const QuestionIcon = styled.div`
  font-family: 'Playfair Display', serif;
  font-size: 3.5rem;
  font-style: italic;
  color: var(--dark-accents);
  opacity: 0.7;
`;

const DifficultyBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  font-family: 'Special Elite', cursive;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  background-color: ${props => {
    switch (props.difficulty) {
      case 'easy': return 'rgba(76, 175, 80, 0.2)';
      case 'medium': return 'rgba(255, 152, 0, 0.2)';
      case 'hard': return 'rgba(244, 67, 54, 0.2)';
      default: return 'rgba(0, 0, 0, 0.1)';
    }
  }};
  color: ${props => {
    switch (props.difficulty) {
      case 'easy': return '#2e7d32';
      case 'medium': return '#e65100';
      case 'hard': return '#c62828';
      default: return 'var(--dark-accents)';
    }
  }};
  border: 1px solid currentColor;
`;

const CompletedStamp = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-15deg);
  font-family: 'Special Elite', cursive;
  font-size: 1.2rem;
  color: rgba(92, 64, 51, 0.7);
  border: 2px solid rgba(92, 64, 51, 0.3);
  padding: 0.3rem 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-radius: 4px;
  pointer-events: none;
`;

export default GameCard; 