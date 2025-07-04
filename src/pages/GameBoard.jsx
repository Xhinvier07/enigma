import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { fetchQuestions, shuffleArray, verifyAnswer, updateStudentScore, getLeaderboard } from '../utils/gameUtils';
import { getStudentSession, logoutStudent } from '../utils/authUtils';
import supabase from '../services/supabase';

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
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  
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
        
        // Initial fetch of student data including end_time
        await fetchStudentData(session.studentId);
      } catch (err) {
        console.error('Error initializing game:', err);
        setError('Failed to load game data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    initGame();
  }, [navigate]);

  // Set up polling to check for updates to student session
  useEffect(() => {
    if (!studentData?.studentId) return;
    
    // Initial fetch
    fetchStudentData(studentData.studentId);
    
    // Set up polling interval (every 10 seconds)
    const interval = setInterval(() => {
      fetchStudentData(studentData.studentId);
    }, 10000);
    
    return () => clearInterval(interval);
  }, [studentData?.studentId]);

  // Fetch student data including end_time
  const fetchStudentData = async (studentId) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        // Update points from database
        setPoints(data.points || 0);
        
        // Update completed puzzles
        if (data.completed_puzzles) {
          setCompletedQuestions(data.completed_puzzles);
        }
        
        // Check if end_time is set
        if (data.end_time) {
          setGameEndTime(new Date(data.end_time));
          
          // Check if game has already ended
          if (new Date() > new Date(data.end_time)) {
            handleGameEnd();
          }
        } else {
          // If no end_time is set, use default (30 minutes from now)
          const endTime = new Date();
          endTime.setMinutes(endTime.getMinutes() + 30);
          setGameEndTime(endTime);
        }
      }
    } catch (err) {
      console.error('Error fetching student data:', err);
    }
  };
  
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
  const handleGameEnd = async () => {
    if (gameEnded) return; // Prevent multiple calls
    
    setGameEnded(true);
    
    // Fetch leaderboard data for the student's section
    if (studentData?.section) {
      try {
        const leaderboardData = await getLeaderboard(studentData.section);
        setLeaderboard(leaderboardData);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      }
    }
  };

  // Handle end game early
  const handleEndGameEarly = () => {
    if (window.confirm('Are you sure you want to end the game? Your current score will be submitted.')) {
      handleGameEnd();
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    logoutStudent();
    navigate('/');
  };

  // Toggle between leaderboard and game summary
  const toggleLeaderboard = () => {
    setShowLeaderboard(!showLeaderboard);
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
          
          <TimerContainer>
            <GameTimer 
              endTime={gameEndTime} 
              onTimeUp={handleGameEnd} 
            />
            <EndGameButton onClick={handleEndGameEarly}>End Game </EndGameButton>
          </TimerContainer>
        </GameStats>
      </TopBar>
      
      <GameTitle>
        <h1>Enigma 29: The Caseboard</h1>
        <Subtitle>Each clue brings you closer to the truth.</Subtitle>
      </GameTitle>
      
      {gameEnded ? (
        <GameOverContainer>
          <GameOverCard
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {showLeaderboard ? (
              <>
                <LeaderboardTitle>
                  <TrophyIcon>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M5 3h14a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2v3a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4v-3H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm13 2h-4v10a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V5zm-6 0H6v10a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V5zM5 5v3h2V5H5zm12 0v3h2V5h-2z"/>
                    </svg>
                  </TrophyIcon>
                  <h2>Class Leaderboard</h2>
                  <SectionDisplay>{studentData?.section}</SectionDisplay>
                </LeaderboardTitle>
                
                <TopThreeGrid>
                  {leaderboard.slice(0, 3).map((student, index) => (
                    <TopThreeItem key={student.id} position={index + 1} isCurrentUser={student.id === studentData?.studentId}>
                      <RankBadge position={index + 1}>
                        {index === 0 ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                          </svg>
                        ) : index === 1 ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                          </svg>
                        )}
                      </RankBadge>
                      <RankNumber>{index + 1}</RankNumber>
                      <StudentName>{student.name}</StudentName>
                      <StudentScore>{student.points}</StudentScore>
                    </TopThreeItem>
                  ))}
                </TopThreeGrid>
                
                <OtherRankingsContainer>
                  {leaderboard.slice(3, 10).map((student, index) => (
                    <RankingItem key={student.id} isCurrentUser={student.id === studentData?.studentId}>
                      <RankPosition>{index + 4}</RankPosition>
                      <RankStudentName>{student.name}</RankStudentName>
                      <RankStudentScore>{student.points}</RankStudentScore>
                    </RankingItem>
                  ))}
                </OtherRankingsContainer>
              </>
            ) : (
              <>
                <h2>Investigation Complete</h2>
                <p>Time's up! You've solved {completedQuestions.length} out of {questions.length} cases.</p>
                <FinalScore>Total Score: {points}</FinalScore>
              </>
            )}
            
            <ButtonContainer>
              <LeaderboardToggleButton onClick={toggleLeaderboard}>
                {showLeaderboard ? (
                  <>
                    <SummaryIcon>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 4h18v2H3V4zm0 7h12v2H3v-2zm0 7h18v2H3v-2z"/>
                      </svg>
                    </SummaryIcon>
                    Show Summary
                  </>
                ) : (
                  <>
                    <LeaderboardIcon>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7.5 21L2 15.5L3.4 14.1L7.5 18.2L20.6 5.1L22 6.5L7.5 21Z"/>
                      </svg>
                    </LeaderboardIcon>
                    Show Leaderboard
                  </>
                )}
              </LeaderboardToggleButton>
              <GameOverButton onClick={handleLogout}>Return to HQ</GameOverButton>
            </ButtonContainer>
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
      
      <FooterTrademark>
        Developed by Detective <XhinvierName>Xhinvier</XhinvierName>
      </FooterTrademark>
    </GameContainer>
  );
};

// Styled Components
const GameContainer = styled.div`
  min-height: 100vh;
  background-image: url('/bg2.png');
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
  font-size: 1.2rem;
  color: var(--secondary-brown);
`;

const DetectiveName = styled.div`
  font-family: 'Yeseva One', cursive;
  font-size: 1.5rem;
  color: var(--primary-dark-brown);
  font-weight: bold;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const GameStats = styled.div`
  display: flex;
  align-items: flex-start;
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
    font-family: 'Yeseva One', cursive;
    font-size: clamp(3rem, 5vw, 3.2rem);
    color: var(--primary-dark-brown);
    margin-bottom: 0.5rem;
  }
  
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
  }
`;

const Subtitle = styled.p`
  font-family: 'Special Elite', cursive;
  font-size: 1.5rem;
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
    font-family: 'Yeseva One', serif;
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

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  
  @media (max-width: 500px) {
    flex-direction: column;
    align-items: center;
  }
`;

const GameOverButton = styled.button`
  font-family: 'Special Elite', cursive;
  background-color: var(--primary-dark-brown);
  color: var(--aged-paper);
  border: 2px solid var(--dark-accents);
  padding: 1rem 2rem;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 4px;
  box-shadow: var(--shadow-medium);
  flex: 1;
  
  &:hover {
    background-color: var(--secondary-brown);
    transform: translateY(-3px);
    box-shadow: var(--shadow-heavy);
  }
  
  &:active {
    transform: translateY(-1px);
  }
`;

const LeaderboardToggleButton = styled(GameOverButton)`
  background-color: var(--secondary-brown);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const LeaderboardTitle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
  position: relative;
  
  h2 {
    margin-bottom: 0.5rem;
  }
`;

const TrophyIcon = styled.div`
  width: 50px;
  height: 50px;
  color: #d4af37;
  margin-bottom: 0.5rem;
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

const SummaryIcon = styled.div`
  width: 20px;
  height: 20px;
  color: var(--aged-paper);
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

const LeaderboardIcon = styled.div`
  width: 20px;
  height: 20px;
  color: var(--aged-paper);
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

const SectionDisplay = styled.div`
  background-color: var(--primary-dark-brown);
  color: var(--aged-paper);
  padding: 0.3rem 1rem;
  border-radius: 20px;
  font-family: 'Special Elite', cursive;
  font-size: 0.9rem;
  display: inline-block;
`;

const TopThreeGrid = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (max-width: 500px) {
    gap: 0.5rem;
  }
`;

const TopThreeItem = styled.div`
  width: ${props => props.position === 1 ? '150px' : props.position === 2 ? '150px' : '150px'};
  height: ${props => props.position === 1 ? '200px' : props.position === 2 ? '180px' : '160px'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.isCurrentUser ? 'rgba(154, 66, 33, 0.2)' : 'rgba(210, 180, 140, 0.2)'};
  border: 2px solid ${props => props.isCurrentUser ? '#9a4221' : 'var(--secondary-brown)'};
  border-radius: 8px;
  padding: 1rem 0.5rem;
  position: relative;
  box-shadow: var(--shadow-medium);
  
  @media (max-width: 500px) {
    width: ${props => props.position === 1 ? '110px' : props.position === 2 ? '100px' : '90px'};
    height: ${props => props.position === 1 ? '120px' : props.position === 2 ? '100px' : '90px'};
  }
`;

const RankBadge = styled.div`
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: ${props => 
    props.position === 1 ? '#FFD700' : 
    props.position === 2 ? '#C0C0C0' : 
    '#CD7F32'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  
  svg {
    width: 20px;
    height: 20px;
    color: ${props => 
      props.position === 1 ? '#9a4221' : 
      props.position === 2 ? '#555' : 
      '#8B4513'};
  }
`;

const RankNumber = styled.div`
  font-family: 'Yeseva One', cursive;
  font-size: 2.2rem;
  color: #9a4221;
  margin-bottom: 0.3rem;
  line-height: 1;
`;

const StudentName = styled.div`
  font-family: 'Special Elite', cursive;
  font-size: 0.9rem;
  color: var(--dark-accents);
  text-align: center;
  margin-bottom: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`;

const StudentScore = styled.div`
  font-family: 'Special Elite', cursive;
  font-size: 1.3rem;
  color: var(--primary-dark-brown);
  font-weight: bold;
`;

const OtherRankingsContainer = styled.div`
  border: 2px solid var(--secondary-brown);
  border-radius: 8px;
  overflow: hidden;
  background-color: rgba(210, 180, 140, 0.1);
  margin-bottom: 1rem;
`;

const RankingItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.7rem 1rem;
  background-color: ${props => props.isCurrentUser ? 'rgba(154, 66, 33, 0.1)' : 'transparent'};
  border-bottom: 1px solid var(--secondary-brown);
  
  &:last-child {
    border-bottom: none;
  }
`;

const RankPosition = styled.div`
  font-family: 'Special Elite', cursive;
  font-size: 1rem;
  color: #9a4221;
  width: 30px;
`;

const RankStudentName = styled.div`
  font-family: 'Special Elite', cursive;
  font-size: 0.9rem;
  color: var(--dark-accents);
  flex: 1;
`;

const RankStudentScore = styled.div`
  font-family: 'Special Elite', cursive;
  font-size: 1rem;
  color: var(--primary-dark-brown);
  font-weight: bold;
  margin-left: 1rem;
`;

const TimerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

const EndGameButton = styled.button`
  font-family: 'Special Elite', cursive;
  font-size: 0.8rem;
  color: var(--aged-paper);
  background-color: #a83232;
  border: none;
  border-radius: 4px;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-light);
  
  &:hover {
    background-color: #8a2828;
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const FooterTrademark = styled.div`
  font-family: 'Special Elite', cursive;
  font-size: 0.85rem;
  color: var(--secondary-brown);
  text-align: center;
  padding: 1.5rem 0;
  opacity: 0.8;
  margin-top: 2rem;
`;

const XhinvierName = styled.span`
  font-weight: bold;
  color: var(--primary-dark-brown);
`;

export default GameBoard;