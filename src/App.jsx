import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import GlobalStyles from './styles/GlobalStyles';
import { getStudentSession } from './utils/authUtils';
import styled from 'styled-components';

// Import pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import GameBoard from './pages/GameBoard';
import NotFound from './pages/NotFound';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

// Import protected routes
import AdminRoute from './components/common/AdminRoute';

// Protected Route Component for students
const ProtectedRoute = ({ children }) => {
  const session = getStudentSession();
  
  if (!session.isLoggedIn) {
    return <Navigate to="/auth" replace />;
  }
  
  return children;
};

function App() {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading assets/fonts
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (loading) {
    return (
      <LoadingScreen>
        <LoadingText>Loading...</LoadingText>
      </LoadingScreen>
    );
  }

  return (
    <>
      <GlobalStyles />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/game" element={
            <ProtectedRoute>
              <GameBoard />
            </ProtectedRoute>
          } />
          {/* Admin routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}

// Styled Components
const LoadingScreen = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--aged-paper, #F5F1E3);
`;

const LoadingText = styled.div`
  font-family: 'Special Elite', cursive;
  font-size: 1.5rem;
  color: var(--primary-dark-brown, #5C4033);
  letter-spacing: 3px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
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

export default App;
