import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import QuestionManager from '../components/admin/QuestionManager';
import SectionManager from '../components/admin/SectionManager';
import SessionManager from '../components/admin/SessionManager';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('questions');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('enigma_admin_session');
    navigate('/admin');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'questions':
        return <QuestionManager />;
      case 'sections':
        return <SectionManager />;
      case 'sessions':
        return <SessionManager />;
      default:
        return <QuestionManager />;
    }
  };

  return (
    <AdminDashboardContainer>
      <SideNavbar>
        <LogoArea>
          <Logo>Enigma 29</Logo>
          <Subtitle>Admin Panel</Subtitle>
        </LogoArea>
        
        <NavMenu>
          <NavItem 
            active={activeTab === 'questions'} 
            onClick={() => setActiveTab('questions')}
          >
            <IconWrapper>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
              </svg>
            </IconWrapper>
            Questions
          </NavItem>
          <NavItem 
            active={activeTab === 'sections'} 
            onClick={() => setActiveTab('sections')}
          >
            <IconWrapper>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 0 1-1.125-1.125v-3.75ZM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-8.25ZM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25A1.125 1.125 0 0 1 2.25 18.375v-2.25Z" />
              </svg>
            </IconWrapper>
            Sections
          </NavItem>
          <NavItem 
            active={activeTab === 'sessions'} 
            onClick={() => setActiveTab('sessions')}
          >
            <IconWrapper>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
            </IconWrapper>
            Sessions
          </NavItem>
        </NavMenu>
        
        <LogoutButton onClick={handleLogout}>
          <IconWrapper>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
            </svg>
          </IconWrapper>
          Logout
        </LogoutButton>
      </SideNavbar>
      
      <MainContent>
        <ContentHeader>
          <HeaderTitle>
            {activeTab === 'questions' && 'Question Management'}
            {activeTab === 'sections' && 'Section Management'}
            {activeTab === 'sessions' && 'Active Sessions'}
          </HeaderTitle>
        </ContentHeader>
        
        <TabContent>
          {isLoading ? (
            <LoadingIndicator>Loading...</LoadingIndicator>
          ) : (
            renderTabContent()
          )}
        </TabContent>
      </MainContent>
    </AdminDashboardContainer>
  );
};

// Styled Components
const AdminDashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: var(--aged-paper);
  color: var(--text-dark);
    * {
    cursor: default !important;
  }
  
  button {
    cursor: pointer !important;
  }
`;

const SideNavbar = styled.aside`
  width: 260px;
  background-color: var(--primary-dark-brown);
  color: var(--text-light);
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-medium);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    width: 6px;
    background: linear-gradient(to right, rgba(0,0,0,0.2), transparent);
  }
`;

const LogoArea = styled.div`
  margin-bottom: 3rem;
  text-align: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(245, 241, 227, 0.2);
`;

const Logo = styled.h1`
  font-family: 'Yeseva One', serif;
  font-size: 2.2rem;
  margin-bottom: 0.2rem;
  color: var(--aged-paper);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
`;

const Subtitle = styled.p`
  font-family: 'Special Elite', cursive;
  font-size: 0.9rem;
  letter-spacing: 1px;
  color: var(--vintage-sepia);
`;

const NavMenu = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
`;

const IconWrapper = styled.span`
  width: 20px;
  height: 20px;
  margin-right: 0.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

const NavItem = styled.button`
  background-color: ${props => props.active ? 'rgba(245, 241, 227, 0.2)' : 'transparent'};
  color: ${props => props.active ? 'var(--parchment-light)' : 'var(--parchment-dark)'};
  border: none;
  border-left: ${props => props.active ? '4px solid var(--accent-gold)' : '4px solid transparent'};
  padding: 0.8rem 1rem;
  text-align: left;
  font-family: 'Special Elite', cursive;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  
  &:hover {
    background-color: rgba(245, 241, 227, 0.1);
    border-left-color: ${props => props.active ? 'var(--accent-gold)' : 'var(--vintage-sepia)'};
  }
`;

const LogoutButton = styled.button`
  margin-top: auto;
  background-color: rgba(220, 53, 69, 0.2);
  color: var(--parchment-light);
  border: 1px solid rgba(220, 53, 69, 0.4);
  border-radius: 4px;
  padding: 0.8rem;
  font-family: 'Special Elite', cursive;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: rgba(220, 53, 69, 0.3);
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 0;
  display: flex;
  flex-direction: column;
  background-image: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.15" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%" height="100%" filter="url(%23noise)" opacity="0.1"/%3E%3C/svg%3E');
  background-blend-mode: multiply;
`;

const ContentHeader = styled.header`
  background-color: var(--parchment-dark);
  padding: 1.5rem 2rem;
  box-shadow: var(--shadow-light);
  border-bottom: 1px solid var(--soft-edges);
`;

const HeaderTitle = styled.h2`
  font-family: 'Playfair Display', serif;
  color: var(--primary-dark-brown);
  font-size: 1.8rem;
`;

const TabContent = styled.div`
  padding: 2rem;
  flex: 1;
  overflow-y: auto;
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  font-family: 'Special Elite', cursive;
  font-size: 1.2rem;
  color: var(--primary-dark-brown);
  letter-spacing: 2px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: var(--primary-dark-brown);
    animation: loading 2s infinite;
  }
  
  @keyframes loading {
    0% { width: 0; }
    50% { width: 100%; }
    100% { width: 0; }
  }
`;

export default AdminDashboard;