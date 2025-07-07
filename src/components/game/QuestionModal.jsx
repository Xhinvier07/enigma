import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { getHint } from '../../utils/gameUtils';

/**
 * QuestionModal - Displays the question and answer input when a card is clicked
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when modal is closed
 * @param {Object} props.question - Question data
 * @param {Function} props.onSubmit - Function to call when answer is submitted
 * @param {Function} props.onSkip - Function to call when question is skipped
 * @param {string} props.studentId - ID of the current student
 */
const QuestionModal = ({
  isOpen,
  onClose,
  question,
  onSubmit,
  onSkip,
  studentId
}) => {
  const [answer, setAnswer] = useState('');
  const [hints, setHints] = useState([null, null, null]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hintCooldown, setHintCooldown] = useState(0);

  // Reset state when a new question is shown
  useEffect(() => {
    if (isOpen) {
      setAnswer('');
      setHintsUsed(0);
      setHints([null, null, null]);
      setError('');
    }
  }, [isOpen, question?.id]);

  // Start cooldown when hint is used
  const handleGetHint = async () => {
    if (hintsUsed >= 3 || !question?.id || hintCooldown > 0) return;

    setIsLoading(true);
    setHintCooldown(30); // Start 30s cooldown
    try {
      const result = await getHint(question.id, hintsUsed);
      
      if (result.error || !result.hint) {
        setError('Could not retrieve hint');
      } else {
        const newHints = [...hints];
        newHints[hintsUsed] = result.hint;
        setHints(newHints);
        setHintsUsed(prev => prev + 1);
      }
    } catch (err) {
      console.error('Error getting hint:', err);
      setError('Failed to get hint');
    } finally {
      setIsLoading(false);
    }
  };

  // Cooldown timer effect
  useEffect(() => {
    if (hintCooldown > 0) {
      const timer = setTimeout(() => setHintCooldown(hintCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [hintCooldown]);

  // Reset cooldown when modal closes or new question
  useEffect(() => {
    if (!isOpen) setHintCooldown(0);
  }, [isOpen, question?.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answer.trim()) {
      setError('Please enter an answer');
      return;
    }
    
    onSubmit(answer, hintsUsed);
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

  if (!question) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <ModalContainer
            initial={{ scale: 0.8, y: -50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
          >
            
            <ModalHeader>
              <PointsIndicator>
                {getPoints(question.difficulty)} POINTS
              </PointsIndicator>
              <h2>Case File #{question.id.substring(0,8)}</h2>
            </ModalHeader>

            <QuestionContent>
              <QuestionText>{question.question}</QuestionText>
              
              {question.image_url && (
                <QuestionImage 
                  src={question.image_url} 
                  alt="Question visual aid"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    console.error('Failed to load question image:', question.image_url);
                  }}
                />
              )}
              
              {hintsUsed > 0 && (
                <HintsContainer>
                  {hints.map((hint, index) => {
                    if (index >= hintsUsed || !hint) return null;
                    return (
                      <HintItem key={index}>
                        <HintLabel>Clue {index + 1}:</HintLabel>
                        <HintText>{hint}</HintText>
                      </HintItem>
                    );
                  })}
                </HintsContainer>
              )}
            </QuestionContent>

            <form onSubmit={handleSubmit}>
              <AnswerContainer>
                <AnswerLabel>Your Solution:</AnswerLabel>
                <AnswerInput 
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Enter your answer..."
                />
                {error && <ErrorText>{error}</ErrorText>}
              </AnswerContainer>

              <ButtonContainer>
                <HintButton
                  type="button"
                  onClick={handleGetHint}
                  disabled={hintsUsed >= 3 || isLoading || hintCooldown > 0}
                  whileTap={{ scale: 0.95 }}
                >
                  {isLoading
                    ? 'Loading...'
                    : hintCooldown > 0
                      ? `Hint (${hintCooldown}s)`
                      : <>Hint<br />({3 - hintsUsed} left)</>
                  }
                </HintButton>
                <SkipButton //test
                  type="button"
                  onClick={onSkip}
                  whileTap={{ scale: 0.95 }}
                >
                  Skip Case
                </SkipButton>
                <SubmitButton 
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Submit Answer
                </SubmitButton>
              </ButtonContainer>
            </form>
          </ModalContainer>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
};

// Styled Components
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContainer = styled(motion.div)`
  background-color: var(--aged-paper);
  border: 3px solid var(--dark-accents);
  border-radius: 8px;
  padding: 2rem;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-heavy);
  position: relative;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--primary-dark-brown);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--secondary-brown);
    border-radius: 4px;
  }
`;
 

const ModalHeader = styled.div`
  margin-bottom: 1.5rem;
  text-align: center;
  position: relative;
  
  h2 {
    font-family: 'Playfair Display', serif;
    color: var(--primary-dark-brown);
    font-size: 1.8rem;
    margin: 0;
    letter-spacing: 1px;
    
    &::after {
      content: '';
      display: block;
      width: 60%;
      height: 2px;
      background-color: var(--secondary-brown);
      margin: 0.8rem auto 0;
      opacity: 0.6;
    }
  }
`;

const DifficultyIndicator = styled.div`
  display: inline-block;
  font-family: 'Special Elite', cursive;
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
  padding: 0.2rem 0.8rem;
  letter-spacing: 1px;
  border-radius: 4px;
  border: 1px solid currentColor;
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
`;

const QuestionContent = styled.div`
  background-color: rgba(210, 180, 140, 0.2);
  border: 1px solid var(--vintage-sepia);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 6px;
    left: 6px;
    right: 6px;
    bottom: 6px;
    border: 1px dashed rgba(92, 64, 51, 0.3);
    border-radius: 6px;
    pointer-events: none;
  }
`;

const QuestionText = styled.p`
  font-family: 'Libre Baskerville', serif;
  font-size: 1.1rem;
  line-height: 1.7;
  margin-bottom: 1rem;
  color: var(--dark-accents);
  white-space: pre-line;
`;

const HintsContainer = styled.div`
  margin-top: 1.5rem;
  border-top: 1px dashed var(--secondary-brown);
  padding-top: 1rem;
`;

const HintItem = styled.div`
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const HintLabel = styled.div`
  font-family: 'Special Elite', cursive;
  font-size: 0.9rem;
  color: var(--primary-dark-brown);
  margin-bottom: 0.3rem;
  font-weight: bold;
`;

const HintText = styled.p`
  font-family: 'Crimson Text', serif;
  font-size: 1rem;
  font-style: italic;
  color: var(--dark-accents);
  margin: 0;
  padding-left: 0.5rem;
  border-left: 2px solid var(--accent-gold);
`;

const AnswerContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const AnswerLabel = styled.label`
  font-family: 'Special Elite', cursive;
  font-size: 1.1rem;
  display: block;
  margin-bottom: 0.5rem;
  color: var(--primary-dark-brown);
`;

const AnswerInput = styled.input`
  font-family: 'Special Elite', cursive;
  width: 100%;
  padding: 0.8rem;
  font-size: 1.1rem;
  border: 2px solid var(--secondary-brown);
  border-radius: 4px;
  background-color: rgba(245, 241, 227, 0.8);
  color: var(--dark-accents);
  
  &:focus {
    outline: none;
    border-color: var(--primary-dark-brown);
    box-shadow: 0 0 0 3px rgba(92, 64, 51, 0.2);
  }
`;

const ErrorText = styled.p`
  color: #a83232;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  margin-bottom: 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const SubmitButton = styled(motion.button)`
  flex: 2;
  font-family: 'Special Elite', cursive;
  background-color: var(--primary-dark-brown);
  color: var(--aged-paper);
  border: 2px solid var(--dark-accents);
  padding: 0.8rem 1rem;
  font-size: 1.1rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: var(--secondary-brown);
  }
`;

const SkipButton = styled(motion.button)`
  flex: 1;
  font-family: 'Special Elite', cursive;
  background-color: transparent;
  color: var(--dark-accents);
  border: 1px solid var(--dark-accents);
  padding: 0.8rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(47, 36, 23, 0.1);
  }
`;

const HintButton = styled(motion.button)`
  flex: 1;
  font-family: 'Special Elite', cursive;
  background-color: var(--vintage-sepia);
  color: var(--dark-accents);
  border: 1px solid var(--secondary-brown);
  padding: 0.8rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background-color: var(--accent-gold);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default QuestionModal;

// Replace DifficultyIndicator with PointsIndicator
const PointsIndicator = styled.div`
  display: inline-block;
  font-family: 'Special Elite', cursive;
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
  padding: 0.2rem 0.8rem;
  letter-spacing: 1px;
  border-radius: 4px;
  border: 1px solid var(--dark-accents);
  background-color: var(--primary-dark-brown);
  color: var(--aged-paper);
`;

const QuestionImage = styled.img`
  max-width: 100%;
  max-height: 400px;
  width: auto;
  height: auto;
  border-radius: 8px;
  margin: 1rem 0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border: 2px solid var(--secondary-brown);
  display: block;
  margin-left: auto;
  margin-right: auto;
`;