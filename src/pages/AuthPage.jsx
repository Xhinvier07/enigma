import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { validateAccessCode, registerStudent } from '../utils/authUtils';

/**
 * AuthPage - Where students enter their access code and name
 */
const AuthPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [studentData, setStudentData] = useState({
    name: '',
    accessCode: '',
    section: ''
  });

  // Validation schema for the form
  const validationSchema = Yup.object({
    accessCode: Yup.string()
      .required('Access code is required')
      .min(4, 'Access code must be at least 4 characters'),
    name: Yup.string()
      .required('Your name is required')
      .min(2, 'Name must be at least 2 characters')
  });

  // Handle form submission
  const handleSubmit = async (values) => {
    setError('');
    setLoading(true);
    
    try {
      // Validate access code first
      const result = await validateAccessCode(values.accessCode);
      
      if (!result.valid) {
        setError(result.error);
        setLoading(false);
        return;
      }
      
      // Set data for confirmation
      setStudentData({
        name: values.name,
        accessCode: values.accessCode,
        section: result.section
      });
      
      // Show confirmation modal
      setShowConfirmation(true);
    } catch (err) {
      console.error('Auth error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle confirmation
  const handleConfirm = async () => {
    setLoading(true);
    
    try {
      const result = await registerStudent(studentData);
      
      if (!result.success) {
        setError(result.error);
        setShowConfirmation(false);
        setLoading(false);
        return;
      }
      
      // Navigate to game board on success
      navigate('/game');
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to register. Please try again.');
      setShowConfirmation(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  return (
    <PageContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AuthCard
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <CardHeader>
          <TitleAccent />
          <h2>ACCESS VERIFICATION</h2>
        </CardHeader>
        
        {!showConfirmation ? (
          <Formik
            initialValues={{ accessCode: '', name: '' }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <StyledForm>
                {error && <ErrorAlert>{error}</ErrorAlert>}
                
                <FieldGroup>
                  <Label htmlFor="accessCode">Access Code</Label>
                  <StyledField 
                    id="accessCode"
                    name="accessCode" 
                    type="text" 
                    placeholder="Enter your access code" 
                  />
                  <StyledErrorMessage name="accessCode" component="div" />
                </FieldGroup>
                
                <FieldGroup>
                  <Label htmlFor="name">Full Name</Label>
                  <StyledField 
                    id="name"
                    name="name" 
                    type="text" 
                    placeholder="Enter your name" 
                  />
                  <StyledErrorMessage name="name" component="div" />
                </FieldGroup>
                
                <SubmitButton 
                  type="submit" 
                  disabled={isSubmitting || loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? 'Verifying...' : 'Continue'}
                </SubmitButton>
              </StyledForm>
            )}
          </Formik>
        ) : (
          <ConfirmationContainer>
            <h3>Please Confirm Your Details</h3>
            
            <InfoGrid>
              <InfoLabel>Name:</InfoLabel>
              <InfoValue>{studentData.name}</InfoValue>
              
              <InfoLabel>Access Code:</InfoLabel>
              <InfoValue>{studentData.accessCode}</InfoValue>
              
              <InfoLabel>Section:</InfoLabel>
              <InfoValue>{studentData.section}</InfoValue>
            </InfoGrid>
            
            <p>Once confirmed, you will proceed to the game.</p>
            
            <ButtonGroup>
              <CancelButton 
                onClick={handleCancel}
                whileTap={{ scale: 0.95 }}
              >
                Go Back
              </CancelButton>
              <ConfirmButton 
                onClick={handleConfirm}
                disabled={loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {loading ? 'Processing...' : 'Confirm & Start'}
              </ConfirmButton>
            </ButtonGroup>
          </ConfirmationContainer>
        )}
      </AuthCard>
      
      <Stamp>
        CONFIDENTIAL
        <StampDate>CS0029</StampDate>
      </Stamp>
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

const AuthCard = styled(motion.div)`
  background-color: var(--aged-paper);
  border: 2px solid var(--dark-accents);
  border-radius: 8px;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  box-shadow: var(--shadow-medium);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -10px;
    left: -10px;
    right: -10px;
    bottom: -10px;
    border: 1px dashed var(--secondary-brown);
    border-radius: 12px;
    opacity: 0.5;
    z-index: -1;
  }
`;

const CardHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
  
  h2 {
    font-family: 'Special Elite', cursive;
    color: var(--dark-accents);
    font-size: 1.8rem;
    margin: 0;
    letter-spacing: 2px;
  }
`;

const TitleAccent = styled.div`
  height: 2px;
  background-color: var(--secondary-brown);
  margin: 0 auto 1rem;
  width: 50%;
  opacity: 0.7;
  
  &::before, &::after {
    content: '★';
    position: absolute;
    top: -8px;
    font-size: 1.2rem;
    color: var(--secondary-brown);
  }
  
  &::before {
    left: 25%;
  }
  
  &::after {
    right: 25%;
  }
`;

const StyledForm = styled(Form)`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-family: 'Libre Baskerville', serif;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: var(--dark-accents);
`;

const StyledField = styled(Field)`
  font-family: 'Special Elite', cursive;
  padding: 0.8rem;
  border: 1px solid var(--secondary-brown);
  border-radius: 4px;
  background-color: rgba(245, 241, 227, 0.8);
  color: var(--dark-accents);
  font-size: 1.1rem;
  letter-spacing: 1px;
  
  &:focus {
    outline: none;
    border-color: var(--primary-dark-brown);
    box-shadow: 0 0 0 2px rgba(92, 64, 51, 0.2);
  }
  
  &::placeholder {
    color: rgba(47, 36, 23, 0.5);
  }
`;

const StyledErrorMessage = styled(ErrorMessage)`
  color: #a83232;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  font-family: 'Crimson Text', serif;
`;

const ErrorAlert = styled.div`
  background-color: rgba(168, 50, 50, 0.1);
  border: 1px solid #a83232;
  color: #a83232;
  padding: 0.8rem;
  border-radius: 4px;
  font-family: 'Crimson Text', serif;
  margin-bottom: 1rem;
`;

const SubmitButton = styled(motion.button)`
  font-family: 'Special Elite', cursive;
  background-color: var(--primary-dark-brown);
  color: var(--aged-paper);
  border: 2px solid var(--dark-accents);
  padding: 0.8rem;
  font-size: 1.1rem;
  cursor: pointer;
  border-radius: 4px;
  margin-top: 1rem;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-light);
  letter-spacing: 1px;
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  &:hover:not(:disabled) {
    background-color: var(--secondary-brown);
    box-shadow: var(--shadow-medium);
  }
`;

const ConfirmationContainer = styled.div`
  display: flex;
  flex-direction: column;
  
  h3 {
    font-family: 'Libre Baskerville', serif;
    color: var(--primary-dark-brown);
    margin-bottom: 1.5rem;
    text-align: center;
  }
  
  p {
    text-align: center;
    margin: 1.5rem 0;
    font-style: italic;
    opacity: 0.8;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 0.8rem;
  margin: 0.5rem 0 1rem;
  background-color: rgba(210, 180, 140, 0.2);
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid var(--vintage-sepia);
`;

const InfoLabel = styled.span`
  font-weight: bold;
  color: var(--primary-dark-brown);
  font-family: 'Libre Baskerville', serif;
`;

const InfoValue = styled.span`
  font-family: 'Special Elite', cursive;
  color: var(--dark-accents);
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
`;

const ConfirmButton = styled(motion.button)`
  flex: 2;
  font-family: 'Special Elite', cursive;
  background-color: var(--primary-dark-brown);
  color: var(--aged-paper);
  border: 2px solid var(--dark-accents);
  padding: 0.8rem;
  font-size: 1.1rem;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-light);
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  &:hover:not(:disabled) {
    background-color: var(--secondary-brown);
    box-shadow: var(--shadow-medium);
  }
`;

const CancelButton = styled(motion.button)`
  flex: 1;
  font-family: 'Special Elite', cursive;
  background-color: transparent;
  color: var(--primary-dark-brown);
  border: 1px solid var(--primary-dark-brown);
  padding: 0.8rem;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(92, 64, 51, 0.1);
  }
`;

const Stamp = styled.div`
  position: absolute;
  bottom: 40px;
  right: 40px;
  font-family: 'Special Elite', cursive;
  color: rgba(92, 64, 51, 0.7);
  transform: rotate(-15deg);
  border: 2px solid rgba(92, 64, 51, 0.3);
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 5px;
  
  @media (max-width: 768px) {
    bottom: 20px;
    right: 20px;
    transform: rotate(-10deg) scale(0.8);
  }
`;

const StampDate = styled.span`
  font-size: 0.8rem;
  margin-top: 0.3rem;
`;

export default AuthPage; 