import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { currentUser } = useAuth();

  // If user is logged in, redirect to dashboard, otherwise to login page
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Navigate to="/login" replace />;
};

export default Index;
