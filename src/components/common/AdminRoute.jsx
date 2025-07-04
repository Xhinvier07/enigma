import { Navigate } from 'react-router-dom';

/**
 * Protected route for admin-only pages
 * Redirects to admin login if not authenticated as admin
 */
const AdminRoute = ({ children }) => {
  const isAdmin = localStorage.getItem('enigma_admin_session') === 'true';
  
  if (!isAdmin) {
    return <Navigate to="/admin" replace />;
  }
  
  return children;
};

export default AdminRoute; 