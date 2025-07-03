import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import IntroModal from '../components/common/IntroModal';
import bgLanding from '../assets/bg_landing.png';

/**
 * LandingPage - Main entry point for the application
 * Displays the logo and enter button, followed by intro modal
 */
const LandingPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate assets loading
    setTimeout(() => {
      setLoaded(true);
    }, 500);
  }, []);

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
      <CaseFileContainer
        initial={{ opacity: 0, y: 20 }}
        animate={loaded ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <Title>ENIGMA 29</Title>
        <Subtitle>Capture the Clues. Solve the Case</Subtitle>
        <CourseInfo>CS0029: Capture the Flag</CourseInfo>
        
        <EnterButton
          initial={{ opacity: 0 }}
          animate={loaded ? { opacity: 1 } : {}}
          transition={{ delay: 0.8, duration: 0.5 }}
          whileHover={{ 
            scale: 1.05, 
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)" 
          }}
          whileTap={{ scale: 0.95 }}
          onClick={handleEnterClick}
        >
          ENTER THE ROOM
        </EnterButton>
      </CaseFileContainer>
      
      {/* Intro Modal */}
      <AnimatePresence>
        {showModal && (
          <IntroModal 
            isOpen={showModal} 
            onClose={handleModalClose}
            title="CONFIDENTIAL: DETECTIVE BRIEFING"
            content={briefingText}
            buttonText="ACCEPT MISSION"
          />
        )}
      </AnimatePresence>
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
  position: relative;
  padding: 2rem;
  background-image: url(${bgLanding});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;

const CaseFileContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2.5rem 3rem;
  background-color: rgba(245, 241, 227, 0.95);
  border-radius: 2px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  max-width: 90%;
  width: 800px;
  height: 300px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 10px;
    left: 10px;
    right: 10px;
    bottom: 10px;
    border: 1px solid rgba(92, 64, 51, 0.3);
    pointer-events: none;
  }
`;

const Title = styled.h1`
  font-family: 'Playfair Display', serif;
  font-size: 2.8rem;
  color: #1a1a1a;
  margin: 0 0 0.5rem;
  letter-spacing: 1px;
  font-weight: 700;
  line-height: 1.1;
  
  @media (max-width: 768px) {
    font-size: 2.4rem;
  }
`;

const Subtitle = styled.h2`
  font-family: 'Libre Baskerville', serif;
  font-size: 1.1rem;
  color: #333;
  margin: 0 0 1rem;
  font-weight: 400;
  letter-spacing: 0.5px;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const CourseInfo = styled.p`
  font-family: 'Special Elite', cursive;
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 2rem;
  letter-spacing: 0.5px;
  font-style: italic;
`;

const EnterButton = styled(motion.button)`
  font-family: 'Special Elite', cursive;
  font-size: 1rem;
  padding: 0.8rem 1.5rem;
  background-color: #1a1a1a;
  color: #f5f1e3;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 1px;
  width: 100%;
  
  &:hover {
    background-color: #333;
  }
`;

export default LandingPage; 