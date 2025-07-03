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

  // Convert difficulty to points
  const getPoints = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 50;
      case 'medium': return 100;
      case 'hard': return 200;
      default: return 0;
    }
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
            <PointsBadge>
              {getPoints(question.difficulty)}
            </PointsBadge>
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
  width: 110%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  transform: ${props => props.isFlipped ? 'rotateY(180deg)' : 'rotateY(0)'};
  box-shadow: none;
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
  border: none;
  background-color: transparent;
  background-size: cover;
  background-position: center;
  transition: all 0.3s ease;
`;

const CardFront = styled(CardSide)`
  transform: rotateY(0deg);
  background-image: url('/src/public/gamecard.png');
  
  &:hover {
    box-shadow: var(--shadow-heavy);
    transform: translateY(-5px);
  }
`;

const CardBack = styled(CardSide)`
  transform: rotateY(180deg);
  background-image: url('/src/assets/gamecard.png');
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

// Updated PointsBadge - moved to top left with new color
const PointsBadge = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  font-family: 'Special Elite', cursive;
  font-size: 0.9rem;
  font-weight: bold;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  background-color: #9a4221;
  color: white;
  border: none;
  z-index: 2;
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