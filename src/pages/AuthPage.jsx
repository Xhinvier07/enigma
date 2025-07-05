import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import { validateAccessCode, registerGroup } from '../utils/authUtils';
import bgLanding from '../assets/bg_landing.png';
import magnifier from '../assets/magnifying.png';

/**
 * AuthPage - Where students enter their access code and name
 */
const AuthPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [groupData, setGroupData] = useState({
    members: [''],
    accessCode: '',
    section: '',
    teamName: ''
  });

  // Validation schema for the form
  const validationSchema = Yup.object({
    accessCode: Yup.string()
      .required('Access code is required')
      .min(4, 'Access code must be at least 4 characters'),
    teamName: Yup.string()
      .required('Team name is required')
      .min(2, 'Team name must be at least 2 characters'),
    members: Yup.array()
      .of(Yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'))
      .min(1, 'At least one member is required')
      .max(8, 'Maximum 8 members allowed')
  });

  // Handle form submission
  const handleSubmit = async (values) => {
    setError('');
    setLoading(true);
    
    try {
      // Filter out empty member names
      const filteredMembers = values.members.filter(name => name && name.trim() !== '');
      
      if (filteredMembers.length === 0) {
        setError('At least one member name is required');
        setLoading(false);
        return;
      }
      
      // Validate access code first, passing team name to check for existing group
      const result = await validateAccessCode(values.accessCode, values.teamName);
      
      if (!result.valid) {
        setError(result.error);
        setLoading(false);
        return;
      }
      
      // Set data for confirmation
      setGroupData({
        members: filteredMembers,
        accessCode: values.accessCode,
        section: result.section,
        teamName: values.teamName
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
      const result = await registerGroup(groupData);
      
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
      <DetectiveSeal>
        <SealIcon>🕵️‍♂️</SealIcon>
        <SealText>Detective Bureau</SealText>
      </DetectiveSeal>
      <AuthCard
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <PaperClip />
        <CardHeader>
          <TitleAccent />
          <h2>CASE FILE ACCESS</h2>
        </CardHeader>
        
        <BriefcaseSection>
          <BriefcaseIcon>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 6h-3V4c0-1.11-.89-2-2-2H9c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zM9 4h6v2H9V4zm11 15H4v-2h16v2zm0-5H4V8h3v2h2V8h6v2h2V8h3v6z"/>
            </svg>
          </BriefcaseIcon>
          <BriefcaseText>
            Before starting your investigation, get your <BriefcaseLink href="/HERE.zip" download>briefcase </BriefcaseLink> with the evidence and tools needed for this case.
          </BriefcaseText>
        </BriefcaseSection>
        
        {!showConfirmation ? (
          <Formik
            initialValues={{ accessCode: '', teamName: '', members: [''] }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, isSubmitting, touched, errors }) => (
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
                  <Label htmlFor="teamName">Team Name</Label>
                  <StyledField 
                    id="teamName"
                    name="teamName" 
                    type="text" 
                    placeholder="Enter your team name" 
                  />
                  <StyledErrorMessage name="teamName" component="div" />
                </FieldGroup>

                <FieldArray name="members">
                  {({ remove, push }) => (
                    <div>
                      <MembersHeader>
                        <Label>Group Members</Label>
                        {values.members.length < 8 && (
                          <AddMemberButton
                            type="button"
                            onClick={() => push('')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            + Add Member
                          </AddMemberButton>
                        )}
                      </MembersHeader>
                      
                      <MembersList>
                        {values.members.map((member, index) => (
                          <MemberItem key={index}>
                            <MemberField>
                              <StyledField
                                name={`members.${index}`}
                                type="text"
                                placeholder={`Member ${index + 1} name`}
                              />
                              {index > 0 && (
                                <RemoveMemberButton
                                  type="button"
                                  onClick={() => remove(index)}
                                  aria-label="Remove member"
                                >
                                  ✕
                                </RemoveMemberButton>
                              )}
                            </MemberField>
                            <StyledErrorMessage name={`members.${index}`} component="div" />
                          </MemberItem>
                        ))}
                      </MembersList>
                      
                      {touched.members && errors.members && typeof errors.members === 'string' && (
                        <ErrorMessage name="members" component={StyledErrorMessage} />
                      )}
                    </div>
                  )}
                </FieldArray>
                
                <SubmitButton 
                  type="submit" 
                  disabled={isSubmitting || loading}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <MagnifierIcon src={magnifier} alt="magnifier" />
                  {loading ? 'Verifying...' : 'Begin Investigation'}
                </SubmitButton>
              </StyledForm>
            )}
          </Formik>
        ) : (
          <ConfirmationContainer>
            <h3>Confirm Group Details</h3>
            
            <InfoGrid>
              <InfoLabel>Access Code:</InfoLabel>
              <InfoValue>{groupData.accessCode}</InfoValue>
              
              <InfoLabel>Section:</InfoLabel>
              <InfoValue>{groupData.section}</InfoValue>
              
              <InfoLabel>Team Name:</InfoLabel>
              <InfoValue>{groupData.teamName}</InfoValue>
              
              <InfoLabel>Members:</InfoLabel>
              <InfoValue>
                <MembersList>
                  {groupData.members.map((name, index) => (
                    <MemberName key={index}>{name}</MemberName>
                  ))}
                </MembersList>
              </InfoValue>
            </InfoGrid>
            
            <p>Once confirmed, you will proceed to the case board.</p>
            
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
const DetectiveSeal = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(245, 241, 227, 0.85);
  border: 2px solid var(--secondary-brown);
  border-radius: 50px;
  padding: 0.5rem 2rem 0.5rem 1.2rem;
  box-shadow: 0 2px 12px #0002;
  font-family: 'Special Elite', cursive;
  font-size: 1.2rem;
  color: var(--primary-dark-brown);
  margin-bottom: 1.5rem;
  letter-spacing: 2px;
  user-select: none;
  position: relative;
  z-index: 2;
  
  @media (max-width: 600px) {
    font-size: 1rem;
    padding: 0.3rem 1rem 0.3rem 0.7rem;
  }
`;

const SealIcon = styled.span`
  font-size: 2rem;
  filter: grayscale(0.2) drop-shadow(0 2px 2px #0002);
`;

const SealText = styled.span`
  font-weight: bold;
`;

const MembersHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const MembersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const MemberItem = styled.div`
  margin-bottom: 0.5rem;
`;

const MemberField = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const RemoveMemberButton = styled.button`
  background-color: #8b0000;
  color: white;
  border: none;
  width: 30px;
  height: 36px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0.8;
  transition: all 0.2s;

  &:hover {
    opacity: 1;
  }
`;

const AddMemberButton = styled(motion.button)`
  background-color: var(--secondary-brown);
  color: white;
  border: none;
  padding: 0.3rem 0.7rem;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  font-family: 'Special Elite', cursive;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
`;

const MemberName = styled.div`
  padding: 0.3rem 0;
  border-bottom: 1px dashed #ccc;
  font-family: 'Crimson Text', serif;
  
  &:last-child {
    border-bottom: none;
  }
`;

const BriefcaseSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: rgba(210, 180, 140, 0.13);
  border: 1.5px dashed #bfa76a;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 2rem;
  position: relative;
  z-index: 2;
`;

const BriefcaseIcon = styled.div`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  color: #bfa76a;
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

const BriefcaseText = styled.p`
  font-family: 'Crimson Text', serif;
  font-size: 1rem;
  color: var(--primary-dark-brown);
  margin: 0;
  line-height: 1.4;
`;

const BriefcaseLink = styled.a`
  color: #a83232;
  font-weight: bold;
  text-decoration: underline;
  position: relative;
  transition: all 0.2s;
  
  &:hover {
    color: #8a2828;
    text-decoration: none;
  }
  
  &::after {
    content: '📁';
    font-size: 0.9em;
    margin-left: 0.3em;
    position: relative;
    top: -1px;
  }
`;

const PaperClip = styled.div`
  position: absolute;
  top: -22px;
  left: 32px;
  width: 38px;
  height: 38px;
  background: url('https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4ce.png') no-repeat center/contain;
  z-index: 3;
  opacity: 0.7;
  
  @media (max-width: 600px) {
    left: 10px;
    width: 28px;
    height: 28px;
    top: -14px;
  }
`;

const PageContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  /* Use the landing background image */
  background-image: url(${bgLanding});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
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
  background: repeating-linear-gradient(135deg, #f5f1e3 0 2px, #f3e7c9 2px 8px);
  border: 2.5px solid var(--primary-dark-brown);
  border-radius: 12px;
  padding: 2.5rem 2rem 2rem 2rem;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 8px 32px #0003, 0 1.5px 0 #bfa76a;
  position: relative;
  margin-bottom: 2.5rem;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    border: 1.5px dashed var(--secondary-brown);
    border-radius: 12px;
    opacity: 0.4;
    z-index: 1;
    pointer-events: none;
  }
`;

const CardHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
  
  h2 {
    font-family: 'Special Elite', cursive;
    color: var(--primary-dark-brown);
    font-size: 1.7rem;
    margin: 0;
    letter-spacing: 2px;
    text-shadow: 0 2px 8px #bfa76a33;
  }
`;

const TitleAccent = styled.div`
  height: 2.5px;
  background: repeating-linear-gradient(90deg, #bfa76a 0 8px, transparent 8px 16px);
  margin: 0 auto 1.1rem;
  width: 60%;
  opacity: 0.7;
`;

const StyledForm = styled(Form)`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  z-index: 2;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-family: 'Special Elite', cursive;
  font-size: 1.08rem;
  margin-bottom: 0.5rem;
  color: var(--primary-dark-brown);
  letter-spacing: 1.2px;
`;

const StyledField = styled(Field)`
  font-family: 'Special Elite', cursive;
  padding: 0.85rem 1rem;
  border: 1.5px solid var(--secondary-brown);
  border-radius: 5px;
  background-color: rgba(245, 241, 227, 0.92);
  color: var(--primary-dark-brown);
  font-size: 1.13rem;
  letter-spacing: 1.2px;
  box-shadow: 0 1px 6px #0001;
  transition: border 0.2s, box-shadow 0.2s;
  
  &:focus {
    outline: none;
    border-color: #bfa76a;
    box-shadow: 0 0 0 2px #bfa76a33;
  }
  
  &::placeholder {
    color: #bfa76a99;
    font-style: italic;
    opacity: 0.8;
  }
`;

const StyledErrorMessage = styled(ErrorMessage)`
  color: #a83232;
  font-size: 0.95rem;
  margin-top: 0.5rem;
  font-family: 'Crimson Text', serif;
`;

const ErrorAlert = styled.div`
  background-color: rgba(168, 50, 50, 0.08);
  border: 1.5px solid #a83232;
  color: #a83232;
  padding: 0.8rem;
  border-radius: 4px;
  font-family: 'Crimson Text', serif;
  margin-bottom: 1rem;
`;

const SubmitButton = styled(motion.button)`
  font-family: 'Special Elite', cursive;
  background-color: #1a1a1a;
  color: #f5f1e3;
  border: 2px solid #bfa76a;
  padding: 0.9rem 1.5rem 0.9rem 2.5rem;
  font-size: 1.13rem;
  cursor: pointer;
  border-radius: 5px;
  margin-top: 1rem;
  transition: all 0.3s cubic-bezier(.4,2,.3,1);
  box-shadow: 0 2px 16px #0002;
  letter-spacing: 1.2px;
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  &:hover:not(:disabled) {
    background: linear-gradient(90deg, #1a1a1a 60%, #bfa76a 100%);
    color: #fffbe7;
    box-shadow: 0 6px 24px #0003;
    filter: brightness(1.08);
  }
`;

const MagnifierIcon = styled.img`
  width: 1.3em;
  height: 1.3em;
  filter: drop-shadow(0 1px 2px #0002);
  margin-right: 0.2em;
`;

const ConfirmationContainer = styled.div`
  display: flex;
  flex-direction: column;
  z-index: 2;
  
  h3 {
    font-family: 'Special Elite', cursive;
    color: #bfa76a;
    margin-bottom: 1.5rem;
    text-align: center;
    letter-spacing: 1.5px;
    font-size: 1.2rem;
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
  background-color: rgba(210, 180, 140, 0.13);
  padding: 1rem;
  border-radius: 4px;
  border: 1.5px solid #bfa76a;
`;

const InfoLabel = styled.span`
  font-weight: bold;
  color: #bfa76a;
  font-family: 'Special Elite', cursive;
`;

const InfoValue = styled.span`
  font-family: 'Special Elite', cursive;
  color: var(--primary-dark-brown);
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
  background-color: #1a1a1a;
  color: #f5f1e3;
  border: 2px solid #bfa76a;
  padding: 0.8rem;
  font-size: 1.1rem;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s cubic-bezier(.4,2,.3,1);
  box-shadow: 0 2px 16px #0002;
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  &:hover:not(:disabled) {
    background: linear-gradient(90deg, #1a1a1a 60%, #bfa76a 100%);
    color: #fffbe7;
    box-shadow: 0 6px 24px #0003;
    filter: brightness(1.08);
  }
`;

const CancelButton = styled(motion.button)`
  flex: 1;
  font-family: 'Special Elite', cursive;
  background-color: transparent;
  color: #bfa76a;
  border: 1.5px solid #bfa76a;
  padding: 0.8rem;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s cubic-bezier(.4,2,.3,1);
  
  &:hover {
    background-color: #bfa76a22;
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
  background: rgba(245, 241, 227, 0.85);
  box-shadow: 0 2px 8px #0001;
  
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