import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';

/**
 * NotFound - 404 page that matches the vintage detective theme
 */
const NotFound = () => {
  const navigate = useNavigate();
  
  return (
    <Container>
      <ContentCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <FileStamp>X</FileStamp>
        <Title>Case File Missing</Title>
        <ErrorCode>Error Code: 404</ErrorCode>
        <Message>
          The evidence you're looking for seems to have been misplaced or never existed.
          Our best detectives are on the case.
        </Message>
        <ButtonGroup>
          <BackButton 
            onClick={() => navigate(-1)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Go Back
          </BackButton>
          <HomeButton 
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Return to HQ
          </HomeButton>
        </ButtonGroup>
      </ContentCard>
      
      <MagnifyingGlass>🔍</MagnifyingGlass>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--aged-paper);
  padding: 2rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.15" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%" height="100%" filter="url(%23noise)" opacity="0.4"/%3E%3C/svg%3E');
    opacity: 0.3;
    z-index: -1;
  }
`;

const ContentCard = styled(motion.div)`
  background-color: var(--aged-paper);
  border: 3px solid var(--dark-accents);
  border-radius: 8px;
  padding: 2.5rem;
  max-width: 550px;
  width: 90%;
  text-align: center;
  box-shadow: var(--shadow-heavy);
  position: relative;
  z-index: 2;
  
  &::before {
    content: '';
    position: absolute;
    top: 8px;
    left: 8px;
    right: 8px;
    bottom: 8px;
    border: 1px dashed var(--secondary-brown);
    border-radius: 6px;
    pointer-events: none;
    z-index: -1;
  }
`;

const FileStamp = styled.div`
  position: absolute;
  top: -25px;
  right: -25px;
  width: 70px;
  height: 70px;
  background-color: var(--secondary-brown);
  color: var(--aged-paper);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Special Elite', cursive;
  font-size: 2.5rem;
  transform: rotate(15deg);
  box-shadow: var(--shadow-medium);
  font-weight: bold;
  border: 3px solid var(--dark-accents);
  
  @media (max-width: 576px) {
    width: 60px;
    height: 60px;
    font-size: 2rem;
    top: -15px;
    right: -15px;
  }
`;

const Title = styled.h1`
  font-family: 'Playfair Display', serif;
  color: var(--primary-dark-brown);
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  
  @media (max-width: 576px) {
    font-size: 2rem;
  }
`;

const ErrorCode = styled.div`
  font-family: 'Special Elite', cursive;
  font-size: 1.2rem;
  color: var(--secondary-brown);
  margin-bottom: 1.5rem;
  padding: 0.3rem 1rem;
  background-color: rgba(139, 69, 19, 0.1);
  display: inline-block;
  border-radius: 4px;
`;

const Message = styled.p`
  font-family: 'Libre Baskerville', serif;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  color: var(--dark-accents);
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const Button = styled(motion.button)`
  font-family: 'Special Elite', cursive;
  padding: 0.8rem 1.5rem;
  font-size: 1.1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  @media (max-width: 576px) {
    width: 100%;
  }
`;

const BackButton = styled(Button)`
  background-color: transparent;
  color: var(--primary-dark-brown);
  border: 2px solid var(--primary-dark-brown);
  
  &:hover {
    background-color: rgba(92, 64, 51, 0.1);
  }
`;

const HomeButton = styled(Button)`
  background-color: var(--primary-dark-brown);
  color: var(--aged-paper);
  border: 2px solid var(--dark-accents);
  box-shadow: var(--shadow-light);
  
  &:hover {
    background-color: var(--secondary-brown);
    box-shadow: var(--shadow-medium);
  }
`;

const MagnifyingGlass = styled.div`
  position: absolute;
  font-size: 15rem;
  opacity: 0.08;
  transform: rotate(-15deg);
  bottom: -80px;
  right: -50px;
  z-index: 1;
  
  @media (max-width: 768px) {
    font-size: 10rem;
    bottom: -50px;
    right: -30px;
  }
`;

export default NotFound; 