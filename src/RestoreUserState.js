import { useState, useEffect } from 'react';
import { decodeToken, isTokenExpired, getCookie } from './AuthHelpers';

const useRestoreUserState = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // console.log('[useRestoreUserState] Starting user state restoration');

        const restoreUserState = async () => {
            try {
                const savedSignInToken = getCookie('signInToken');
                // console.log('[useRestoreUserState] Retrieved signInToken from cookie:', savedSignInToken);
                
                if (savedSignInToken && !isTokenExpired(savedSignInToken)) {
                    // console.log('[useRestoreUserState] Token is valid, decoding');
                    const decoded = decodeToken(savedSignInToken);
                    // console.log('[useRestoreUserState] Decoded token:', decoded);
                    setUser({
                        userId: decoded.userId,
                        // Add other relevant user properties from the token
                    });
                } else {
                    // console.log('[useRestoreUserState] No signInToken found or token is expired, user is unauthenticated');
                    setUser(null);
                }
            } catch (error) {
                console.error('[useRestoreUserState] Error in restoring user state:', error);
                setUser(null); // In case of error, ensure user is set to null
            } finally {
                setIsLoading(false);
                // console.log('[useRestoreUserState] User state restoration complete, updating isLoading to false');
            }
        };

        restoreUserState();
    }, []);

    // Debugging the updated user state
    useEffect(() => {
        // console.log('[useRestoreUserState] Updated User State:', user);
    }, [user]);

    return { user, isLoading };
};

export default useRestoreUserState;
