import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import IntroModal from '../components/common/IntroModal';
import bgLanding from '../assets/bg_landing.png';

const ENIGMA_TEXT = "ENIGMA 29";
const RANDOM_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/**
 * LandingPage - Main entry point for the application
 * Displays the logo and enter button, followed by intro modal
 */
const LandingPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const [animDone, setAnimDone] = useState(false);
  const navigate = useNavigate();
  const intervalRef = useRef();

  useEffect(() => {
    // Simulate assets loading
    setTimeout(() => setLoaded(true), 500);
  }, []);

  // Cryptic animation for ENIGMA 29
  useEffect(() => {
    let frame = 0;
    if (loaded) {
      intervalRef.current = setInterval(() => {
        let text = '';
        for (let i = 0; i < ENIGMA_TEXT.length; i++) {
          if (frame > i * 3) {
            text += ENIGMA_TEXT[i];
          } else if (ENIGMA_TEXT[i] === ' ') {
            text += ' ';
          } else {
            text += RANDOM_CHARS[Math.floor(Math.random() * RANDOM_CHARS.length)];
          }
        }
        setDisplayText(text);
        frame++;
        if (frame > ENIGMA_TEXT.length * 3 + 2) {
          clearInterval(intervalRef.current);
          setDisplayText(ENIGMA_TEXT);
          setAnimDone(true);
        }
      }, 50);
    }
    return () => clearInterval(intervalRef.current);
  }, [loaded]);

  const handleEnterClick = () => setShowModal(true);

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
      <EnigmaTitle
        initial={{ opacity: 0, y: 30 }}
        animate={loaded ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.3, duration: 0.8 }}
        $animDone={animDone}
      >
        {displayText}
      </EnigmaTitle>
      <Subtitle
        initial={{ opacity: 0, y: 10 }}
        animate={animDone ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 1.2, duration: 0.7 }}
      >
        Capture the Clues. <span>Solve the Case</span>
      </Subtitle>
      <CourseInfo
        initial={{ opacity: 0 }}
        animate={animDone ? { opacity: 1 } : {}}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        CS0029: Capture the Flag
      </CourseInfo>
      <EnterButton
        initial={{ opacity: 0, scale: 0.95 }}
        animate={animDone ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: 1.8, duration: 0.5 }}
        whileHover={{
          scale: 1.07,
          boxShadow: "0 6px 18px rgba(0,0,0,0.25)"
        }}
        whileTap={{ scale: 0.97 }}
        onClick={handleEnterClick}
      >
        ENTER THE ROOM
      </EnterButton>
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
  min-height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-image: url(${bgLanding});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  padding: 2rem;
  overflow: hidden;
`;

const crypticGlow = keyframes`
  0%, 100% { text-shadow: 0 0 8px #fff2, 0 0 32px #e6d6b3; }
  50% { text-shadow: 0 0 24px #ffe082, 0 0 64px #fff; }
`;

const EnigmaTitle = styled(motion.h1)`
  font-family: 'Yeseva One';
  font-size: clamp(3.5rem, 10vw, 6.5rem);
  color: #1a1a1a;
  letter-spacing: 0.10em;
  margin: 0 0 0rem 0; /* Reduced bottom margin */
  text-align: center;
  user-select: none;
  animation: ${crypticGlow} 2.5s infinite;
  filter: ${({ $animDone }) => $animDone ? 'drop-shadow(0 0 18px #ffe082)' : 'none'};
  transition: filter 0.5s;
`;

const wowEffect = keyframes`
  0% { letter-spacing: 0.2em; opacity: 0.7; }
  40% { letter-spacing: 0.4em; opacity: 1; }
  100% { letter-spacing: 0.2em; opacity: 1; }
`;

const Subtitle = styled(motion.h2)`
  font-family: 'Yeseva One';
  font-size: clamp(1.3rem, 3vw, 2.5rem);
  color: #333;
  margin: 0 0 1rem 0; /* Reduced bottom margin */
  font-weight: 400;
  text-align: center;
  animation: ${wowEffect} 1.5s;
  span {
    color: var(--primary-dark-brown, #5C4033);
    font-weight: bold;
    text-shadow: 0 2px 8px #fff7;
    font-size: 1.1em;
  }
`;

const CourseInfo = styled(motion.p)`
  font-family: 'Special Elite', cursive;
  font-size: 1.4rem;
  color: #666;
  margin: 0 0 5rem 0;
  letter-spacing: 0.5px;
  font-style: italic;
  text-align: center;
`;

const EnterButton = styled(motion.button)`
  font-family: 'Special Elite', cursive;
  font-size: 2rem;
  padding: 1.5rem 3.5rem;
  background-color: #1a1a1a;
  color: #f5f1e3;
  border: none;
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(.4,2,.3,1);
  letter-spacing: 2px;
  font-weight: bold;
  box-shadow: 0 2px 24px #0003;
  outline: none;
  position: relative;
  overflow: hidden;
  &:hover, &:focus {
    background: linear-gradient(90deg, #1a1a1a 60%, #bfa76a 100%);
    color: #fffbe7;
    box-shadow: 0 8px 32px #0004;
    filter: brightness(1.08);
  }
  &:active {
    filter: brightness(0.95);
  }
  @media (max-width: 500px) {
    width: 100%;
    font-size: 1.3rem;
    padding: 1rem 1.2rem;
  }
`;

export default LandingPage;