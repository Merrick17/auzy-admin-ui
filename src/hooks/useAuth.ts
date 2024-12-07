import { useAtom } from 'jotai';
import { currentUserAtom, authTokenAtom, isLoadingAuthAtom } from '../atoms/auth';
import axios from 'axios';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useAtom(currentUserAtom);
  const [token, setToken] = useAtom(authTokenAtom);
  const [isLoading, setIsLoading] = useAtom(isLoadingAuthAtom);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      setToken(response.data.token);
      setCurrentUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await axios.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
  };

  return {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    login,
    register,
    logout,
  };
}; 