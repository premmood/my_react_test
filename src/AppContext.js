import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from './UserContext';
import { Dimmer, Loader } from 'semantic-ui-react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { logout, userId, userRole } = useUser();
  const [isTokenExpiredModalOpen, setIsTokenExpiredModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Log the initial state values
  useEffect(() => {
    // console.log('[AppProvider] Initial States:', { userId, userRole, isLoading });

    // Simulate a delay (replace this with your actual data loading logic)
    setTimeout(() => {
      setIsLoading(false); // Set isLoading to false when loading is complete
    }, 500); // Replace 2000 with the actual loading time in milliseconds
  }, [userId, userRole, isLoading]);

  // Token expiry event listener
  useEffect(() => {
    // console.log('[AppProvider] Checking if user is logged in, userId:', userId);

    if (userId) {
      setIsLoading(false);
      // console.log('[AppProvider] User is logged in, setting isLoading to false');
    } else {
      // console.log('[AppProvider] User is not logged in');
    }

    const handleTokenExpiryEvent = () => {
      // console.log('[AppProvider] Token expired event triggered');
      setIsTokenExpiredModalOpen(true);
    };

    // console.log('[AppProvider] Adding token-expired event listener');
    window.addEventListener('token-expired', handleTokenExpiryEvent);

    return () => {
      // console.log('[AppProvider] Removing token-expired event listener');
      window.removeEventListener('token-expired', handleTokenExpiryEvent);
    };
  }, [userId]);

  return (
    <AppContext.Provider
      value={{
        userRole,
        isTokenExpiredModalOpen,
        setIsTokenExpiredModalOpen,
        logout,
        isLoading
      }}
    >
      <Dimmer active={isLoading}>
        <Loader>Loading...</Loader>
      </Dimmer>
      {children}
    </AppContext.Provider>
  );
};


export const useApp = () => useContext(AppContext);
