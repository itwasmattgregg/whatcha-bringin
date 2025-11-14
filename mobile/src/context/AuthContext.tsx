import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    loadAuth();
  }, []);
  
  const loadAuth = async () => {
    try {
      setIsLoading(true);
      
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem('authToken'),
        AsyncStorage.getItem('user'),
      ]);
      
      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Ensure user object has correct types and sanitize it
          if (parsedUser && typeof parsedUser === 'object' && parsedUser._id) {
            // Create a clean user object with only expected fields
            const cleanUser: User = {
              _id: String(parsedUser._id),
              phoneNumber: String(parsedUser.phoneNumber || ''),
              name: parsedUser.name ? String(parsedUser.name) : undefined,
              createdAt: String(parsedUser.createdAt || ''),
            };
            setToken(String(storedToken));
            setUser(cleanUser);
          } else {
            // Invalid user data, clear it
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('user');
          }
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
          // Clear corrupted data
          await AsyncStorage.removeItem('authToken');
          await AsyncStorage.removeItem('user');
        }
      }
    } catch (error) {
      console.error('Error loading auth:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const setAuth = async (user: User, token: string) => {
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    setToken(token);
  };
  
  const logout = async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };
  
  // Ensure all values are properly typed and serialized
  // Use useMemo to prevent unnecessary re-renders and ensure stable reference
  const contextValue: AuthContextType = React.useMemo(() => ({
    user,
    token,
    isLoading: isLoading === true, // Explicit boolean conversion
    setAuth,
    logout,
  }), [user, token, isLoading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

