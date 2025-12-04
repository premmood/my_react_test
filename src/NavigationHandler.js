import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from './UserContext';

const NavigationHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, entryPoint, setEntryPoint, isRegistering } = useUser();

  useEffect(() => {
    const fullPath = location.pathname + location.search; // Preserving the full URL including query parameters

    // Handling unauthenticated users trying to access non-public pages
    if (!user && !['/signin', '/register', '/verify', '/business-case-builder'].includes(location.pathname)) {
      if (user === null) { // Ensure the user is truly unauthenticated (not in a loading state)
        setEntryPoint(fullPath); // Save the full URL as the entry point for post-authentication redirection
        navigate('/signin');
      }
    } 
    // Redirecting authenticated users to their preserved entry point
    else if (user && entryPoint) {
      if (fullPath !== entryPoint) {
        navigate(entryPoint); // Navigate to the full entry point URL
      } else {
        setEntryPoint(null); // Clear the entry point once reached
      }
    } 
    // Redirecting authenticated users at /signin to the home page
    else if (user && fullPath === '/signin' && !isRegistering) {
      navigate('/');
    }
  }, [user, navigate, location, entryPoint, setEntryPoint, isRegistering]);

  useEffect(() => {
    // Handle token expiry events
    const handleTokenExpiryEvent = () => {
      navigate('/signin');
      setEntryPoint('/'); // Reset entry point on token expiry
    };

    window.addEventListener('token-expired', handleTokenExpiryEvent);
    return () => window.removeEventListener('token-expired', handleTokenExpiryEvent);
  }, [navigate, setEntryPoint]);

  return null;
};

export default NavigationHandler;
