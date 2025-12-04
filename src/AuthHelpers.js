import jwt_decode from 'jwt-decode';

export const decodeToken = (token) => {
  try {
    if (!token) {
      // console.log('[decodeToken] No token provided');
      return null;
    }
    const decoded = jwt_decode(token);
    // console.log('[decodeToken] Decoded Token:', decoded);
    return decoded;
  } catch (error) {
    console.error('Failed to decode JWT', error);
    return null;
  }
};

export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  const expired = decoded && Date.now() >= decoded.exp * 1000;
  // console.log(`[isTokenExpired] Token expired: ${expired}`);
  return expired;
};

export const getCookie = (name) => {
  // console.log(`[getCookie] Retrieving cookie: ${name}`);
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  // console.log(`[getCookie] Retrieved cookie value: ${cookieValue}`);
  return cookieValue;
};

export const setCookie = (name, value, options = {}) => {
  // console.log(`[setCookie] Setting cookie: ${name}, Value: ${value}, Options:`, options);
  let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

  for (let optionKey in options) {
    updatedCookie += "; " + optionKey;
    let optionValue = options[optionKey];
    if (optionValue !== true) {
      updatedCookie += "=" + optionValue;
    }
  }

  document.cookie = updatedCookie;
  // console.log(`[setCookie] Cookie set: ${document.cookie}`);
};

export const clearAllCookies = () => {
  // console.log('[clearAllCookies] Clearing all cookies');
  document.cookie.split(";").forEach((c) => {
    const clearedCookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    // console.log(`[clearAllCookies] Clearing cookie: ${clearedCookie}`);
    document.cookie = clearedCookie;
  });
};


export const getDecodedTokenFromLocalStorage = (key) => {
  // console.log(`[getDecodedTokenFromLocalStorage] Retrieving token from localStorage: ${key}`);
  const token = localStorage.getItem(key);
  const decoded = token ? decodeToken(token) : null;
  // console.log(`[getDecodedTokenFromLocalStorage] Decoded Token from localStorage:`, decoded);
  return decoded;
};

export const clearLocalStorageItems = (...keys) => {
  // console.log(`[clearLocalStorageItems] Clearing localStorage items: ${keys.join(', ')}`);
  keys.forEach(key => localStorage.removeItem(key));
};
