import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

// create authentication context for global state management
const AuthContext = createContext(null);

// provider component wrapping the app to manage user session and auth methods
export const AuthProvider = ({ children }) => {
  // store current authenticated user object
  const [user, setUser] = useState(null);
  // track initial session verification status
  const [loading, setLoading] = useState(true);

  // verify existing token on initial page load
  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem('token');
      // stop loading if no stored token is found
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // fetch authenticated user profile from backend
        const res = await api.get('/profile');
        setUser(res.data.user);
      } catch (err) {
        // clear invalid or expired token from storage
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        // mark session verification as complete
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  // authenticate user credentials and persist jwt token
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  // register a new user account and persist jwt token
  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  // clear user session and remove stored token
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // expose auth state and actions to child components
  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// custom hook for consuming authentication context
export const useAuth = () => useContext(AuthContext);