import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { fetchQuestions, shuffleArray, verifyAnswer, updateStudentScore } from '../utils/gameUtils';
import { getStudentSession, logoutStudent } from '../utils/authUtils';

// Components
import GameCard from '../components/game/GameCard';
import QuestionModal from '../components/game/QuestionModal';
import ResultFeedback from '../components/game/ResultFeedback';
import GameTimer from '../components/game/GameTimer';

/**
 * GameBoard - Main game page showing the grid of puzzle cards
 */
const GameBoard = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [completedQuestions, setCompletedQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState({ isCorrect: false, points: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [points, setPoints] = useState(0);
  const [gameEndTime, setGameEndTime] = useState(null);
  const [gameEnded, setGameEnded] = useState(false);
  
  // Fetch student session and questions on mount
  useEffect(() => {
    const initGame = async () => {
      try {
        // Get student session
        const session = getStudentSession();
        if (!session.isLoggedIn) {
          navigate('/auth');
          return;
        }
        
        setStudentData(session);
        
        // Fetch questions
        const allQuestions = await fetchQuestions();
        if (!allQuestions || allQuestions.length === 0) {
          setError('No questions available. Please try again later.');
          return;
        }
        
        // Shuffle and limit to 15 questions
        const shuffledQuestions = shuffleArray(allQuestions).slice(0, 15);
        setQuestions(shuffledQuestions);
        
        // Set game end time (30 minutes from now)
        const endTime = new Date();
        endTime.setMinutes(endTime.getMinutes() + 30); // 30-minute game
        setGameEndTime(endTime);
      } catch (err) {
        console.error('Error initializing game:', err);
        setError('Failed to load game data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    initGame();
  }, [navigate]);
  
  // Handle card click
  const handleCardClick = (question) => {
    setSelectedQuestion(question);
    setShowQuestionModal(true);
  };
  
  // Handle answer submission
  const handleAnswerSubmit = async (answer, hintsUsed) => {
    if (!selectedQuestion || !studentData) return;
    
    try {
      // Verify the answer
      const result = await verifyAnswer(selectedQuestion.id, answer);
      
      if (result.correct) {
        // Calculate points with penalty for hints used
        const pointsEarned = Math.max(1, result.points - (hintsUsed * 5));
        
        // Update student score in database
        await updateStudentScore(
          studentData.studentId, 
          selectedQuestion.id, 
          pointsEarned
        );
        
        // Update local state
        setCompletedQuestions([...completedQuestions, selectedQuestion.id]);
        setPoints(prevPoints => prevPoints + pointsEarned);
        
        // Show success feedback
        setFeedbackResult({
          isCorrect: true,
          points: pointsEarned
        });
      } else {
        // Show failure feedback
        setFeedbackResult({
          isCorrect: false,
          points: 0
        });
      }
      
      setShowQuestionModal(false);
      setShowFeedback(true);
    } catch (err) {
      console.error('Error processing answer:', err);
      setError('Failed to process your answer. Please try again.');
    }
  };
  
  // Handle question skip
  const handleSkipQuestion = () => {
    setShowQuestionModal(false);
  };
  
  // Handle feedback close
  const handleFeedbackClose = () => {
    setShowFeedback(false);
  };
  
  // Handle game end
  const handleGameEnd = () => {
    setGameEnded(true);
    // Additional end-game logic could be added here
  };
  
  // Handle logout
  const handleLogout = () => {
    logoutStudent();
    navigate('/');
  };
  
  if (loading) {
    return (
      <LoadingContainer>
        <LoadingText>Loading game...</LoadingText>
      </LoadingContainer>
    );
  }
  
  if (error) {
    return (
      <ErrorContainer>
        <ErrorMessage>{error}</ErrorMessage>
        <RetryButton onClick={() => window.location.reload()}>Retry</RetryButton>
      </ErrorContainer>
    );
  }

  return (
    <GameContainer>
      <TopBar>
        <GameInfo>
          <SectionInfo>Section: {studentData?.section}</SectionInfo>
          <DetectiveName>{studentData?.studentName}</DetectiveName>
        </GameInfo>
        
        <GameStats>
          <PointsDisplay>
            <PointsLabel>Points</PointsLabel>
            <PointsValue>{points}</PointsValue>
          </PointsDisplay>
          
          <GameTimer 
            endTime={gameEndTime} 
            onTimeUp={handleGameEnd} 
          />
        </GameStats>
      </TopBar>
      
      <GameTitle>
        <h1>Enigma 29: Capture the Clues</h1>
        <Subtitle>Solve the cases, detective.</Subtitle>
      </GameTitle>
      
      {gameEnded ? (
        <GameOverContainer>
          <GameOverCard
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2>Investigation Complete</h2>
            <p>Time's up! You've solved {completedQuestions.length} out of {questions.length} cases.</p>
            <FinalScore>Total Score: {points}</FinalScore>
            <GameOverButton onClick={handleLogout}>Return to HQ</GameOverButton>
          </GameOverCard>
        </GameOverContainer>
      ) : (
        <CardGrid>
          {questions.map((question, index) => (
            <GameCard
              key={question.id}
              question={question}
              index={index}
              isCompleted={completedQuestions.includes(question.id)}
              onCardClick={handleCardClick}
            />
          ))}
        </CardGrid>
      )}
      
      <QuestionModal
        isOpen={showQuestionModal}
        onClose={() => setShowQuestionModal(false)}
        question={selectedQuestion}
        onSubmit={handleAnswerSubmit}
        onSkip={handleSkipQuestion}
        studentId={studentData?.studentId}
      />
      
      <ResultFeedback
        isOpen={showFeedback}
        isCorrect={feedbackResult.isCorrect}
        points={feedbackResult.points}
        onClose={handleFeedbackClose}
      />
    </GameContainer>
  );
};

// Styled Components
const GameContainer = styled.div`
  min-height: 100vh;
  background-image: url('/src/assets/bg2.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  padding: 1.5rem;
  position: relative;
  
  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const GameInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const SectionInfo = styled.div`
  font-family: 'Special Elite', cursive;
  font-size: 0.9rem;
  color: var(--secondary-brown);
  margin-bottom: 0.5rem;
`;

const DetectiveName = styled.div`
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  color: var(--primary-dark-brown);
  font-weight: bold;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const GameStats = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const PointsDisplay = styled.div`
  background-color: rgba(210, 180, 140, 0.2);
  border: 2px solid var(--secondary-brown);
  border-radius: 8px;
  padding: 0.5rem 1.2rem;
  text-align: center;
`;

const PointsLabel = styled.div`
  font-family: 'Special Elite', cursive;
  font-size: 0.8rem;
  color: var(--dark-accents);
  margin-bottom: 0.2rem;
`;

const PointsValue = styled.div`
  font-family: 'Special Elite', cursive;
  font-size: 1.8rem;
  color: var(--primary-dark-brown);
  font-weight: bold;
`;

const GameTitle = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
  
  h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.8rem, 4vw, 2.5rem);
    color: var(--primary-dark-brown);
    margin-bottom: 0.5rem;
  }
  
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
  }
`;

const Subtitle = styled.p`
  font-family: 'Special Elite', cursive;
  font-size: 1.1rem;
  color: var(--dark-accents);
  opacity: 0.8;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 600px) {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
  }
`;

const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--aged-paper);
`;

const LoadingText = styled.div`
  font-family: 'Special Elite', cursive;
  font-size: 1.5rem;
  color: var(--primary-dark-brown);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -8px;
    width: 0;
    height: 3px;
    background-color: var(--primary-dark-brown);
    animation: loading 2s infinite;
  }
  
  @keyframes loading {
    0% { width: 0; }
    50% { width: 100%; }
    100% { width: 0; }
  }
`;

const ErrorContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: var(--aged-paper);
  padding: 2rem;
  text-align: center;
`;

const ErrorMessage = styled.div`
  font-family: 'Libre Baskerville', serif;
  font-size: 1.3rem;
  color: #a83232;
  margin-bottom: 2rem;
  max-width: 600px;
`;

const RetryButton = styled.button`
  font-family: 'Special Elite', cursive;
  background-color: var(--primary-dark-brown);
  color: var(--aged-paper);
  border: 2px solid var(--dark-accents);
  padding: 0.8rem 2rem;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 4px;
  
  &:hover {
    background-color: var(--secondary-brown);
    transform: translateY(-3px);
  }
  
  &:active {
    transform: translateY(-1px);
  }
`;

const GameOverContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const GameOverCard = styled(motion.div)`
  background-color: var(--aged-paper);
  border: 3px solid var(--dark-accents);
  border-radius: 8px;
  padding: 2.5rem;
  max-width: 600px;
  width: 100%;
  text-align: center;
  box-shadow: var(--shadow-heavy);
  position: relative;
  
  h2 {
    font-family: 'Playfair Display', serif;
    font-size: 2rem;
    color: var(--primary-dark-brown);
    margin-bottom: 1.5rem;
  }
  
  p {
    font-family: 'Libre Baskerville', serif;
    font-size: 1.2rem;
    color: var(--dark-accents);
    margin-bottom: 2rem;
    line-height: 1.7;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 10px;
    left: 10px;
    right: 10px;
    bottom: 10px;
    border: 1px dashed var(--secondary-brown);
    border-radius: 8px;
    z-index: 0;
    pointer-events: none;
  }
`;

const FinalScore = styled.div`
  font-family: 'Special Elite', cursive;
  font-size: 1.8rem;
  color: var(--primary-dark-brown);
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: rgba(210, 180, 140, 0.2);
  border: 2px solid var(--secondary-brown);
  border-radius: 8px;
  display: inline-block;
`;

const GameOverButton = styled.button`
  font-family: 'Special Elite', cursive;
  background-color: var(--primary-dark-brown);
  color: var(--aged-paper);
  border: 2px solid var(--dark-accents);
  padding: 1rem 2.5rem;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 4px;
  box-shadow: var(--shadow-medium);
  
  &:hover {
    background-color: var(--secondary-brown);
    transform: translateY(-3px);
    box-shadow: var(--shadow-heavy);
  }
  
  &:active {
    transform: translateY(-1px);
  }
`;

export default GameBoard;