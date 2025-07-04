import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

/**
 * Protected route for admin-only pages
 * Redirects to admin login if not authenticated as admin
 */
const AdminRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if admin is authenticated
    const checkAuth = () => {
      const isAdmin = localStorage.getItem('enigma_admin_session') === 'true';
      setIsAuthenticated(isAdmin);
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);
  
  // Show loading while checking authentication
  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingText>Verifying admin access...</LoadingText>
      </LoadingContainer>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }
  
  // Render children if authenticated
  return children;
};

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: var(--aged-paper, #F5F1E3);
`;

const LoadingText = styled.div`
  font-family: 'Special Elite', cursive;
  font-size: 1.2rem;
  color: var(--primary-dark-brown, #5C4033);
  padding: 1rem;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: var(--primary-dark-brown, #5C4033);
    animation: loading 2s infinite;
  }
  
  @keyframes loading {
    0% { width: 0; }
    50% { width: 100%; }
    100% { width: 0; }
  }
`;

export default AdminRoute; 