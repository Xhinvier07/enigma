import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { validateAdmin } from '../utils/authUtils';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate admin credentials
      const result = await validateAdmin(username, password);
      
      if (!result.valid) {
        setError(result.error || 'Invalid credentials');
        setIsLoading(false);
        return;
      }
      
      // Set admin session
      localStorage.setItem('enigma_admin_session', 'true');
      localStorage.setItem('enigma_admin_username', username);
      
      // Navigate to admin dashboard
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Admin login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLoginContainer>
      <AdminLoginBox>
        <AdminTitle>Admin Access</AdminTitle>
        <AdminSubtitle>Authorized Personnel Only</AdminSubtitle>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <AdminForm onSubmit={handleSubmit}>
          <InputGroup>
            <Label>Username</Label>
            <Input
              type="text"
              placeholder="Enter admin username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </InputGroup>
          
          <InputGroup>
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </InputGroup>
          
          <ButtonGroup>
            <AdminButton type="submit" disabled={isLoading}>
              {isLoading ? 'Authenticating...' : 'Access Dashboard'}
            </AdminButton>
            
            <HelpButton type="button" onClick={() => setShowHelp(!showHelp)}>
              {showHelp ? 'Hide Help' : 'Need Help?'}
            </HelpButton>
          </ButtonGroup>
          
          {showHelp && (
            <HelpPanel>
              <HelpTitle>Admin Login Information</HelpTitle>
              <HelpText>
                <p>To access the admin dashboard, use the admin credentials:</p>
                <ul>
                  <li><strong>Default Username:</strong> adminCS0029</li>
                  <li><strong>Default Password:</strong> <i>"Ask Jansen for Password"</i></li>
                </ul>
                <p>These credentials are set in the database during initialization.</p>
              </HelpText>
            </HelpPanel>
          )}
        </AdminForm>
      </AdminLoginBox>
    </AdminLoginContainer>
  );
};

// Styled Components
const AdminLoginContainer = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--aged-paper);
  background-image: url('/bg2.png');
  background-size: cover;
  background-position: center;
  position: relative;
  padding: 20px;
`;

const AdminLoginBox = styled.div`
  background-color: var(--parchment-light);
  padding: 2.5rem;
  border-radius: 8px;
  box-shadow: var(--shadow-heavy);
  max-width: 500px;
  width: 100%;
  position: relative;
  border: 1px solid var(--primary-dark-brown);
  
  &::before {
    content: '';
    position: absolute;
    top: 10px;
    right: 10px;
    width: 40px;
    height: 40px;
    background-image: url('/magnifying.png');
    background-size: contain;
    background-repeat: no-repeat;
    opacity: 0.6;
  }
`;

const AdminTitle = styled.h1`
  font-family: 'Playfair Display', serif;
  text-align: center;
  margin-bottom: 0.5rem;
  color: var(--primary-dark-brown);
`;

const AdminSubtitle = styled.p`
  font-family: 'Special Elite', cursive;
  text-align: center;
  margin-bottom: 1.5rem;
  color: var(--ink-faded);
  font-size: 1.1rem;
  letter-spacing: 1px;
`;

const AdminForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-family: 'Special Elite', cursive;
  margin-bottom: 0.3rem;
  color: var(--primary-dark-brown);
`;

const Input = styled.input`
  padding: 0.7rem;
  border: 1px solid var(--soft-edges);
  border-radius: 4px;
  font-family: 'Special Elite', cursive;
  background-color: rgba(245, 241, 227, 0.8);
  
  &:focus {
    outline: none;
    border-color: var(--accent-gold);
    box-shadow: 0 0 0 2px rgba(218, 165, 32, 0.2);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const AdminButton = styled.button`
  margin-top: 1rem;
  padding: 0.8rem;
  background-color: var(--primary-dark-brown);
  color: var(--parchment-light);
  border: none;
  border-radius: 4px;
  font-family: 'Special Elite', cursive;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;
  flex: 1;
  
  &:hover {
    background-color: var(--secondary-brown);
    transform: translateY(-2px);
  }
  
  &:disabled {
    background-color: var(--pencil-gray);
    cursor: not-allowed;
    transform: none;
  }
`;

const HelpButton = styled.button`
  margin-top: 1rem;
  padding: 0.8rem;
  background-color: transparent;
  color: var(--secondary-brown);
  border: 1px solid var(--secondary-brown);
  border-radius: 4px;
  font-family: 'Special Elite', cursive;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background-color: rgba(139, 69, 19, 0.1);
  }
`;

const ErrorMessage = styled.div`
  background-color: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
  color: #721c24;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-family: 'Special Elite', cursive;
  font-size: 0.9rem;
`;

const HelpPanel = styled.div`
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: rgba(245, 241, 227, 0.9);
  border: 1px dashed var(--secondary-brown);
  border-radius: 4px;
`;

const HelpTitle = styled.h3`
  font-family: 'Special Elite', cursive;
  margin-bottom: 1rem;
  color: var(--primary-dark-brown);
  font-size: 1rem;
`;

const HelpText = styled.div`
  font-family: 'Crimson Text', serif;
  font-size: 0.9rem;
  color: var(--text-dark);
  
  p {
    margin-bottom: 1rem;
  }
  
  ol, ul {
    margin-left: 1.5rem;
    margin-bottom: 1rem;
  }
  
  li {
    margin-bottom: 0.5rem;
  }
  
  code {
    background-color: rgba(0, 0, 0, 0.05);
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
    font-family: monospace;
    font-size: 0.9em;
  }
`;

export default AdminLogin; 