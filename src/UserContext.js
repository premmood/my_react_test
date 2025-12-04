import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { decodeToken, isTokenExpired, setCookie, clearAllCookies } from './AuthHelpers';
import apiWrapper from './apiWrapper';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [signInToken, setSignInToken] = useState(null);
  const [magicLinkToken, setMagicLinkToken] = useState(null);
  const [entryPoint, setEntryPoint] = useState(null);
  const [preferredPhoneNumber, setPreferredPhoneNumber] = useState(null);
  const [userId, setUserId] = useState(null);
  const [orgId, setOrgId] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);  // State for isAdmin
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const newIsAdmin = userRole?.includes('trustedAdmin') ||
      userRole?.includes('didgugoAdmin') ||
      userRole?.includes('orgAdmin');
    setIsAdmin(newIsAdmin);
  }, [userRole]);

  const handleSignInToken = useCallback((token) => {
    const decoded = decodeToken(token);
    if (decoded) {
      setUser({ userId: decoded.userId, orgId: decoded.orgId || null });
      setUserId(decoded.userId);
      setOrgId(decoded.orgId || null); // Set orgId to null if not present in the token
      setUserRole(decoded.role);
      setIsLoading(false);
  
      setCookie('signInToken', token, { path: '/', secure: true });
      localStorage.setItem('userId', decoded.userId.toString());
      if (decoded.orgId) {
        localStorage.setItem('orgId', decoded.orgId.toString());
      }
      localStorage.setItem('roles', decoded.role);
    }
  }, [setUser, setUserId, setOrgId, setUserRole]);

  // Initialize user data from localStorage or cookies on app load
  useEffect(() => {
    const initializeUser = async () => {
      const storedUserId = localStorage.getItem('userId');
      const storedOrgId = localStorage.getItem('orgId');
      const storedRoles = localStorage.getItem('roles');
      const storedSignInToken = document.cookie.split('; ').find(row => row.startsWith('signInToken='))?.split('=')[1];

      if (storedSignInToken && !isTokenExpired(storedSignInToken)) {
        await handleSignInToken(storedSignInToken);
      } else {
        setIsLoading(false);
      }

      if (storedUserId) setUserId(storedUserId);
      if (storedOrgId) setOrgId(storedOrgId);
      if (storedRoles) setUserRole(storedRoles);
    };

    initializeUser();
  }, [handleSignInToken]);

  const handleMagicLinkToken = useCallback((token) => {
    const decoded = decodeToken(token);
    if (decoded) {
      setUser(decoded.user);
      setPreferredPhoneNumber(decoded.preferredPhoneNumber);
      setUserId(decoded.userId);
      setOrgId(decoded.orgId);
      setMagicLinkToken(token);
      setUserRole(decoded.role); // Keeping roles as a string

      localStorage.setItem('preferredPhoneNumber', decoded.preferredPhoneNumber || '');
      localStorage.setItem('userId', decoded.userId || '');
      localStorage.setItem('orgId', decoded.orgId || '');
      localStorage.setItem('roles', decoded.role);
    }
  }, [setUser, setUserId, setOrgId, setUserRole]);

  const handleRegistrationToken = useCallback((token) => {
    const decoded = decodeToken(token);
    if (decoded) {
      setUser(decoded.user);
      setPreferredPhoneNumber(decoded.preferredPhoneNumber);
      setUserRole(decoded.role); // Keeping roles as a string
      setUserId(decoded.userId);
      setOrgId(decoded.orgId);
    }
  }, []);

  const logout = async () => {
    await apiWrapper.logoutUser();

    setUser(null);
    setUserRole(''); // Clear user roles
    setPreferredPhoneNumber(null);
    setUserId(null);
    setEntryPoint('/');
    setOrgId(null);
    setMagicLinkToken(null);
    setSignInToken(null);

    localStorage.removeItem('roles');
    localStorage.removeItem('preferredPhoneNumber');
    localStorage.removeItem('userId');
    localStorage.removeItem('magicLinkEntryPoint');
    localStorage.removeItem('entryPoint');
    localStorage.removeItem('orgId');
    localStorage.removeItem('magicLinkToken');
    localStorage.removeItem('signInToken');

    clearAllCookies();
  };

  return (
    <UserContext.Provider value={{
      user,
      setUser,
      signInToken,
      setSignInToken,
      magicLinkToken,
      setMagicLinkToken,
      isAdmin, // Provide isAdmin state
      userRole,
      entryPoint,
      setEntryPoint,
      preferredPhoneNumber,
      setPreferredPhoneNumber,
      userId,
      handleSignInToken,
      handleMagicLinkToken,
      handleRegistrationToken,
      orgId,
      setOrgId,
      decodeToken,
      isTokenExpired,
      isRegistering,
      setIsRegistering,
      logout,
      isLoading
    }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;