import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 백엔드 API 서버 포트
const API_PORT = 5000;

// API 서버 주소를 런타임에 자동으로 결정합니다.
// IP가 바뀌어도 접속한 호스트를 기준으로 알아서 맞춰지므로 .env를 고칠 필요가 없습니다.
function resolveApiBase(): string {
  // 1) .env(EXPO_PUBLIC_API_BASE_URL)에 명시한 값이 있으면 그것을 최우선으로 사용 (수동 지정용)
  const envBase = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (envBase) return envBase;

  // 2) 웹: 브라우저가 접속한 호스트를 그대로 사용 → IP가 바뀌어도 자동으로 일치
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.hostname) {
    return `http://${window.location.hostname}:${API_PORT}/api`;
  }

  // 3) Expo Go(실기기/에뮬레이터): Metro(dev 서버) 호스트 IP를 그대로 사용
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).expoGoConfig?.debuggerHost ||
    (Constants as any).manifest?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
  if (hostUri) {
    const host = String(hostUri).split(':')[0]; // "192.168.x.x:8081" -> "192.168.x.x"
    if (host) return `http://${host}:${API_PORT}/api`;
  }

  // 4) 최후 fallback (iOS 시뮬레이터 등)
  return `http://localhost:${API_PORT}/api`;
}

export const API_BASE = resolveApiBase();
const API_URL = `${API_BASE}/auth`;

if (__DEV__) {
  console.log('[API_BASE] 자동 감지된 서버 주소:', API_BASE);
}

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
      setIsOnboarded(data.isOnboarded ?? true); // nullish coalescing: false면 false 그대로 유지

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
