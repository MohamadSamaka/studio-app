import { useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';

const useProtectedRoute = () => {
  const { isAuthenticated } = useAuthContext();

  useEffect(() => {
    // for future need just in case
  }, [isAuthenticated]);
};

export default useProtectedRoute;
