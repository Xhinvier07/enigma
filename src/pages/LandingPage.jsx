import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import IntroModal from '../components/common/IntroModal';

/**
 * LandingPage - Main entry point for the application
 * Displays the logo and enter button, followed by intro modal
 */
const LandingPage = () => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleEnterClick = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    // Navigate to auth page after modal closes
    navigate('/auth');
  };

  const briefingText = `CASE BRIEF: CS0029

Greetings, Detective. You have been selected for a special assignment that will test your intellect, problem-solving skills, and attention to detail.

A series of puzzles and riddles have been carefully prepared, each containing clues that must be decoded to solve the mystery.

This is not just a test of knowledge, but of wit and perseverance. You'll need to think critically and creatively to unlock each challenge.

Remember:
• Time is limited
• Each solved puzzle brings you closer to the truth
• Hints are available, but use them wisely

Good luck, Detective. The case awaits.`;

  return (
    <PageContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <PaperTexture />
      <LogoContainer>
        <Title
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          ENIGMA 29
        </Title>
        <Subtitle
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Capture the Clues
        </Subtitle>
        <Tagline
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          Solve the Case
        </Tagline>
        <EnterButton
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleEnterClick}
        >
          ENTER
        </EnterButton>
      </LogoContainer>
      
      <VintageStamp>CS0029</VintageStamp>
      <BottomAccent />
      
      {/* Intro Modal */}
      <IntroModal 
        isOpen={showModal} 
        onClose={handleModalClose}
        title="CONFIDENTIAL: DETECTIVE BRIEFING"
        content={briefingText}
        buttonText="ACCEPT MISSION"
      />
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--aged-paper);
  position: relative;
  overflow: hidden;
  padding: 2rem;
`;

const PaperTexture = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.15" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%" height="100%" filter="url(%23noise)" opacity="0.4"/%3E%3C/svg%3E');
  opacity: 0.4;
  pointer-events: none;
`;

const LogoContainer = styled.div`
  text-align: center;
  z-index: 1;
`;

const Title = styled(motion.h1)`
  font-family: 'Playfair Display', serif;
  font-size: clamp(3rem, 10vw, 5rem);
  color: var(--primary-dark-brown);
  margin-bottom: 0.5rem;
  letter-spacing: 6px;
  font-weight: 700;
  text-shadow: 3px 3px 0px var(--vintage-sepia);
  
  @media (max-width: 768px) {
    font-size: clamp(2.5rem, 8vw, 4rem);
  }
`;

const Subtitle = styled(motion.h2)`
  font-family: 'Libre Baskerville', serif;
  font-size: clamp(1.5rem, 5vw, 2.5rem);
  color: var(--secondary-brown);
  margin-bottom: 1rem;
  font-weight: 400;
  letter-spacing: 2px;
  
  @media (max-width: 768px) {
    font-size: clamp(1.2rem, 4vw, 2rem);
  }
`;

const Tagline = styled(motion.p)`
  font-family: 'Special Elite', cursive;
  font-size: clamp(1rem, 3vw, 1.5rem);
  color: var(--dark-accents);
  margin-bottom: 2.5rem;
  letter-spacing: 1px;
`;

const EnterButton = styled(motion.button)`
  font-family: 'Special Elite', cursive;
  font-size: 1.2rem;
  padding: 0.8rem 2.5rem;
  background-color: var(--primary-dark-brown);
  color: var(--aged-paper);
  border: 2px solid var(--dark-accents);
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 4px;
  box-shadow: var(--shadow-light);
  letter-spacing: 2px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: 0.5s;
  }
  
  &:hover::before {
    left: 100%;
  }
`;

const VintageStamp = styled.div`
  position: absolute;
  bottom: 30px;
  right: 40px;
  font-family: 'Special Elite', cursive;
  color: var(--primary-dark-brown);
  font-size: 1.2rem;
  transform: rotate(-5deg);
  border: 1px solid var(--secondary-brown);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  opacity: 0.8;
  
  &::before {
    content: '';
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    border: 1px dashed var(--secondary-brown);
    border-radius: 6px;
    opacity: 0.5;
    z-index: -1;
  }
`;

const BottomAccent = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 15px;
  background-color: var(--dark-accents);
  opacity: 0.5;
  
  &::before {
    content: '';
    position: absolute;
    top: -15px;
    left: 0;
    width: 100%;
    height: 15px;
    background: repeating-linear-gradient(
      -45deg,
      var(--dark-accents),
      var(--dark-accents) 10px,
      var(--secondary-brown) 10px,
      var(--secondary-brown) 20px
    );
    opacity: 0.3;
  }
`;

export default LandingPage; 