import { createContext, useContext, useEffect, useState } from 'react';
import {
  getAuthMe,
  loginUser,
  registerUser,
  googleAuthUser,
  requestRegisterOtp,
  verifyRegisterOtp,
  requestForgotPasswordOtp,
  resetPasswordVerify
} from '../services/apiClient.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('polar_auth_token') : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const data = await getAuthMe();
        if (data?.user) {
          setUser(data.user);
        } else {
          localStorage.removeItem('polar_auth_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err);
        localStorage.removeItem('polar_auth_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, [token]);

  const handleAuthSuccess = (data) => {
    if (data.token) {
      localStorage.setItem('polar_auth_token', data.token);
      setToken(data.token);
    }
    if (data.user) {
      setUser(data.user);
    }
    return data;
  };

  const login = async (email, password) => {
    const data = await loginUser(email, password);
    return handleAuthSuccess(data);
  };

  const register = async (name, email, password, role, confirmPassword) => {
    const data = await registerUser(name, email, password, role, confirmPassword);
    return handleAuthSuccess(data);
  };

  const sendRegisterOtp = async (payload) => {
    return requestRegisterOtp(payload);
  };

  const submitRegisterOtp = async (payload) => {
    const data = await verifyRegisterOtp(payload);
    return handleAuthSuccess(data);
  };

  const sendForgotOtp = async (email) => {
    return requestForgotPasswordOtp(email);
  };

  const submitResetPassword = async (payload) => {
    return resetPasswordVerify(payload);
  };

  const loginWithGoogle = async (googleToken, profile) => {
    const data = await googleAuthUser(googleToken, profile);
    return handleAuthSuccess(data);
  };

  const loginDemoScholar = async () => {
    // Instant authentic demo sign-in for testing without mandatory Google Console setup
    const demoProfile = {
      email: 'scholar.fellow@ncpor.gov.in',
      name: 'Dr. Ananya Sharma',
      picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      sub: 'google-oauth2-ncpor-demo-9921'
    };
    const data = await googleAuthUser(null, demoProfile);
    return handleAuthSuccess(data);
  };

  const logout = () => {
    localStorage.removeItem('polar_auth_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    loading,
    login,
    register,
    sendRegisterOtp,
    submitRegisterOtp,
    sendForgotOtp,
    submitResetPassword,
    loginWithGoogle,
    loginDemoScholar,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
