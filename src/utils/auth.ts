// Authentication utilities

/**
 * Store authentication token in localStorage
 */
export const storeAuthToken = (token: string, tokenType: string = 'Bearer') => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('token_type', tokenType);
  }
};

/**
 * Get authentication token from localStorage
 */
export const getAuthToken = (): { token: string | null; tokenType: string | null } => {
  if (typeof window !== 'undefined') {
    return {
      token: localStorage.getItem('auth_token'),
      tokenType: localStorage.getItem('token_type') || 'Bearer'
    };
  }
  return { token: null, tokenType: null };
};

/**
 * Clear authentication token from localStorage
 */
export const clearAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token_type');
  }
};

/**
 * Get authorization header value
 */
export const getAuthHeader = (): string | null => {
  const { token, tokenType } = getAuthToken();
  if (!token) return null;
  return `${tokenType} ${token}`;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const { token } = getAuthToken();
  return !!token;
};