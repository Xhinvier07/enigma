import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * IntroModal Component - Displays a vintage-styled detective briefing
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when the modal is closed
 * @param {string} props.title - Title text for the modal
 * @param {string} props.content - Main content text
 * @param {string} props.buttonText - Text for the skip button
 */
const IntroModal = ({ 
  isOpen = false, 
  onClose, 
  title = "ATTENTION, DETECTIVE", 
  content = "A mystery awaits your keen eye and sharp intellect. Are you ready to solve the case?",
  buttonText = "Skip Briefing"
}) => {
  const [typedContent, setTypedContent] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Typewriter effect
  useEffect(() => {
    if (!isOpen || !isTyping) return;

    if (currentIndex < content.length) {
      const timeout = setTimeout(() => {
        setTypedContent(prev => prev + content[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 30); // Typing speed

      return () => clearTimeout(timeout);
    } else {
      setIsTyping(false);
    }
  }, [isOpen, isTyping, currentIndex, content]);

  // Skip typing animation
  const handleSkipTyping = () => {
    setTypedContent(content);
    setIsTyping(false);
    setCurrentIndex(content.length);
  };

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
            <FilmGrain />
            <ModalHeader>
              <h2>{title}</h2>
            </ModalHeader>
            <ModalContent>
              <p>{typedContent}</p>
              {isTyping && (
                <TypewriterCursor />
              )}
            </ModalContent>
            <ModalFooter>
              {isTyping ? (
                <VintageButton onClick={handleSkipTyping}>Skip Typing</VintageButton>
              ) : (
                <VintageButton onClick={onClose}>{buttonText}</VintageButton>
              )}
            </ModalFooter>
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
`;

const ModalContainer = styled(motion.div)`
  background-color: var(--aged-paper);
  border: 3px solid var(--dark-accents);
  border-radius: 8px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  box-shadow: var(--shadow-heavy);
  position: relative;
  overflow: hidden;
`;

const FilmGrain = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.15;
  pointer-events: none;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 300%;
    height: 300%;
    background-image: url('data:image/svg+xml,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%" height="100%" filter="url(%23noise)" opacity="1"/%3E%3C/svg%3E');
    background-repeat: repeat;
    animation: grain 8s steps(10) infinite;
  }
  
  @keyframes grain {
    0%, 100% { transform: translate(0, 0) }
    10% { transform: translate(-5%, -5%) }
    20% { transform: translate(-10%, 5%) }
    30% { transform: translate(5%, -10%) }
    40% { transform: translate(-5%, 15%) }
    50% { transform: translate(-10%, 5%) }
    60% { transform: translate(15%, 0%) }
    70% { transform: translate(0%, 10%) }
    80% { transform: translate(-15%, 0%) }
    90% { transform: translate(10%, 5%) }
  }
`;

const ModalHeader = styled.div`
  margin-bottom: 1.5rem;
  text-align: center;
  
  h2 {
    font-family: 'Special Elite', cursive;
    color: var(--dark-accents);
    font-size: 2rem;
    letter-spacing: 2px;
    margin: 0;
  }
`;

const ModalContent = styled.div`
  margin-bottom: 2rem;
  position: relative;
  min-height: 100px;
  
  p {
    font-family: 'Special Elite', cursive;
    font-size: 1.2rem;
    line-height: 1.8;
    white-space: pre-line;
  }
`;

const TypewriterCursor = styled.span`
  display: inline-block;
  width: 12px;
  height: 24px;
  background-color: var(--dark-accents);
  margin-left: 2px;
  animation: blink 1s step-end infinite;
  
  @keyframes blink {
    from, to { opacity: 1; }
    50% { opacity: 0; }
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: center;
`;

const VintageButton = styled.button`
  font-family: 'Special Elite', cursive;
  background-color: var(--primary-dark-brown);
  color: var(--aged-paper);
  border: 2px solid var(--dark-accents);
  padding: 0.7rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 4px;
  box-shadow: var(--shadow-light);
  
  &:hover {
    background-color: var(--secondary-brown);
    transform: translateY(-2px);
    box-shadow: var(--shadow-medium);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export default IntroModal; 