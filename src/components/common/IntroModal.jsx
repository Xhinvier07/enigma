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
  const [showStamp, setShowStamp] = useState(false);

  // Typewriter effect
  useEffect(() => {
    if (!isOpen || !isTyping) return;

    if (currentIndex < content.length) {
      const timeout = setTimeout(() => {
        setTypedContent(prev => prev + content[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 50); // Typing speed

      return () => clearTimeout(timeout);
    } else {
      setIsTyping(false);
      // Show stamp after typing is complete
      setTimeout(() => {
        setShowStamp(true);
      }, 200);
    }
  }, [isOpen, isTyping, currentIndex, content]);

  // Skip typing animation
  const handleSkipTyping = () => {
    setTypedContent(content);
    setIsTyping(false);
    setCurrentIndex(content.length);
    // Show stamp immediately when skipping
    setTimeout(() => {
      setShowStamp(true);
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            // Close only if clicking the overlay, not the modal itself
            if (e.target === e.currentTarget && !isTyping) {
              onClose();
            }
          }}
        >
          <ModalContainer
            initial={{ scale: 0.8, y: -50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            onClick={(e) => e.stopPropagation()}
          >
            <FilmGrain />
            <ClipCorner position="top-left" />
            <ClipCorner position="top-right" />
            
            <ModalHeader>
              <RedLine />
              <TitleWrapper>
                <h2>{title}</h2>
                <FileNumber>FILE #29</FileNumber>
              </TitleWrapper>
              <RedLine />
            </ModalHeader>
            
            <ModalContent>
              <p>{typedContent}</p>
              {isTyping && (
                <TypewriterCursor />
              )}
              
              <AnimatePresence>
                {showStamp && (
                  <ConfidentialStamp
                    initial={{ opacity: 0, scale: 1.5, rotate: -8 }}
                    animate={{ opacity: 1, scale: 1, rotate: -8 }}
                    transition={{ duration: 1 }}
                  >
                    CONFIDENTIAL
                  </ConfidentialStamp>
                )}
              </AnimatePresence>
            </ModalContent>
            
            <ModalFooter>
              <ButtonWrapper>
                {isTyping ? (
                  <VintageButton onClick={handleSkipTyping}>Skip Typing</VintageButton>
                ) : (
                  <VintageButton 
                    onClick={onClose}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {buttonText}
                  </VintageButton>
                )}
              </ButtonWrapper>
              <FooterDecoration />
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
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
  padding: 1rem;
  overflow-y: auto;
  overflow-x: hidden;
  /* Hide scrollbar for all browsers */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none;  /* IE 10+ */
  &::-webkit-scrollbar { display: none; }
`;

const ModalContainer = styled(motion.div)`
  background-color: var(--aged-paper);
  border: 3px solid var(--dark-accents);
  border-radius: 8px;
  padding: 2rem;
  max-width: 98vw;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  overflow-x: hidden;
  box-shadow: var(--shadow-heavy);
  position: relative;
  margin: auto;
  @media (max-width: 768px) {
    padding: 1.2rem;
    max-height: 85vh;
  }
  /* Hide scrollbar for all browsers */
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar { display: none; }
`;

// Make ClipCorner stretch to modal's full width/height
const ClipCorner = styled.div`
  position: absolute;
  width: 40px;
  height: 40px;
  background-color: #1a1a1a;
  z-index: 2;
  ${({ position }) => {
    if (position === 'top-left') {
      return `
        top: 0;
        left: 0;
        clip-path: polygon(0 0, 100% 0, 0 100%);
      `;
    } else if (position === 'top-right') {
      return `
        top: 0;
        right: 0;
        clip-path: polygon(100% 0, 0 0, 100% 100%);
      `;
    } else if (position === 'bottom-left') {
      return `
        bottom: 0;
        left: 0;
        clip-path: polygon(0 100%, 100% 100%, 0 0);
      `;
    } else if (position === 'bottom-right') {
      return `
        bottom: 0;
        right: 0;
        clip-path: polygon(100% 100%, 0 100%, 100% 0);
      `;
    }
  }}
  @media (max-width: 768px) {
    width: 24px;
    height: 24px;
  }
`;

const FilmGrain = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 35%;
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
`;

const TitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0.5rem 0;
  
  @media (max-width: 576px) {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  h2 {
    font-family: 'Special Elite', cursive;
    color: var(--dark-accents);
    font-size: 1.8rem;
    letter-spacing: 2px;
    margin: 0;
    text-align: left;
    flex: 1;
    
    @media (max-width: 576px) {
      font-size: 1.5rem;
      text-align: center;
    }
  }
`;

const FileNumber = styled.div`
  font-family: 'Special Elite', cursive;
  color: var(--secondary-brown);
  font-size: 1rem;
  border: 1px solid var(--secondary-brown);
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  opacity: 0.8;
  
  @media (max-width: 576px) {
    align-self: center;
  }
`;

const RedLine = styled.div`
  height: 2px;
  background-color: rgba(139, 0, 0, 0.7);
  width: 100%;
  margin: 0.5rem 0;
`;

const ModalContent = styled.div`
  margin-bottom: 2rem;
  position: relative;
  min-height: 100px;
  padding: 1rem;
  border: 1px dashed var(--secondary-brown);
  background-color: rgba(245, 241, 227, 0.5);
  
  p {
    font-family: 'Special Elite', cursive;
    font-size: 1.2rem;
    line-height: 1.8;
    white-space: pre-line;
    position: relative;
    z-index: 2;
    
    @media (max-width: 576px) {
      font-size: 1rem;
      line-height: 1.6;
    }
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

const ConfidentialStamp = styled(motion.div)`
  position: absolute;
  top: 20%;
  left: 20%;
  transform: translate(-50%, -50%) rotate(-8deg);
  font-family: 'Impact', sans-serif;
  font-size: 7vw;
  min-font-size: 2.5rem;
  color: rgba(139, 0, 0, 0.6);
  border: 7px solid rgba(139, 0, 0, 0.6);
  padding: 0.7rem 2.5rem;
  text-transform: uppercase;
  letter-spacing: 4px;
  pointer-events: none;
  z-index: 10;
  opacity: 0.85;
  text-align: center;
  background: transparent;

  @media (max-width: 768px) {
    font-size: 12vw;
    border-width: 4px;
    padding: 0.5rem 1.2rem;
  }
  @media (max-width: 480px) {
    font-size: 16vw;
    border-width: 3px;
    padding: 0.3rem 0.5rem;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ButtonWrapper = styled.div`
  margin-bottom: 1rem;
`;

const VintageButton = styled(motion.button)`
  font-family: 'Special Elite', cursive;
  background-color: var(--primary-dark-brown);
  color: var(--aged-paper);
  border: 2px solid var(--dark-accents);
  padding: 0.8rem 2rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 4px;
  box-shadow: var(--shadow-light);
  letter-spacing: 1px;
  
  &:hover {
    background-color: var(--secondary-brown);
    transform: translateY(-2px);
    box-shadow: var(--shadow-medium);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const FooterDecoration = styled.div`
  width: 100%;
  height: 10px;
  background-image: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="10" viewBox="0 0 80 10" fill="none"%3E%3Cpath d="M0 0L10 5L0 10M20 0L30 5L20 10M40 0L50 5L40 10M60 0L70 5L60 10" stroke="%235C4033" stroke-opacity="0.5"/%3E%3C/svg%3E');
  background-repeat: repeat-x;
  opacity: 0.5;
`;

export default IntroModal;