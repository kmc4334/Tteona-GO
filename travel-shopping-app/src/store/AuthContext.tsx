import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// .env의 EXPO_PUBLIC_API_BASE_URL을 우선 사용하고,
// 없으면 현재 호스트 기준으로 자동 감지합니다.
const _envBase = process.env.EXPO_PUBLIC_API_BASE_URL;
const _autoBase = (() => {
  if (typeof window !== 'undefined' && window.location) {
    return `${window.location.protocol}//${window.location.hostname}:5000/api`;
  }
  return 'http://localhost:5000/api';
})();
export const API_BASE = _envBase || _autoBase;
const API_URL = `${API_BASE}/auth`;

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (name: string, nickname: string, email: string, password: string) => Promise<void>;
  completeOnboarding: () => void;
  updateUser: (updatedUser: any) => void;
  isOnboarded: boolean;
  updateProfile: (profileData: { name?: string; nickname?: string; phoneNumber?: string }) => Promise<void>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);

  // Check for stored auth data on mount
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');
        const storedOnboarding = await AsyncStorage.getItem('isOnboarded');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        }
        
        if (storedOnboarding === 'true') {
          setIsOnboarded(true);
        }
      } catch (error) {
        console.error('Failed to load auth data from storage:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAuthData();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '로그인에 실패했습니다.');
      }
      
      const userToken = data.token;
      const userData = data.user;

      setIsAuthenticated(true);
      setUser(userData);
      setToken(userToken);
      setIsOnboarded(data.isOnboarded || true); // Default to true for logins

      // Save to storage
      await AsyncStorage.setItem('token', userToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('isOnboarded', 'true');
    } catch (error: any) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
      setIsOnboarded(false);
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('isOnboarded');
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  };

  const signup = async (name: string, nickname: string, email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, nickname, email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '회원가입에 실패했습니다.');
      }
      
      const userToken = data.token;
      const userData = data.user;

      setUser(userData);
      setToken(userToken);
      setIsAuthenticated(true); // Signup should probably log the user in

      // Save to storage
      await AsyncStorage.setItem('token', userToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (error: any) {
      throw error;
    }
  };

  const completeOnboarding = async () => {
    try {
      setIsOnboarded(true);
      await AsyncStorage.setItem('isOnboarded', 'true');
    } catch (error) {
      console.error('Failed to save onboarding state:', error);
    }
  };

  const updateUser = (updatedUser: any) => {
    setUser(updatedUser);
    AsyncStorage.setItem('user', JSON.stringify(updatedUser)).catch(error => {
      console.error('Failed to update stored user data:', error);
    });
  };

  const updateProfile = async (profileData: { name?: string; nickname?: string; phoneNumber?: string }) => {
    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });
      
      if (response.status === 401) {
        logout();
        throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '프로필 업데이트에 실패했습니다.');
      }
      
      if (data.success && data.user) {
        updateUser(data.user);
      }
    } catch (error: any) {
      throw error;
    }
  };


  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      token, 
      loading, 
      login, 
      logout, 
      signup, 
      completeOnboarding, 
      updateUser, 
      isOnboarded,
      updateProfile 
    }}>

      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
