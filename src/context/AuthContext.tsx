import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as loginService, register as registerService } from '../services';
import { AuthResponse, User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStorage = async () => {
      try {
        const [userRaw, token] = await Promise.all([
          AsyncStorage.getItem('user'),
          AsyncStorage.getItem('token'),
        ]);
        
        if (userRaw && token) {
          setUser(JSON.parse(userRaw) as User);
        } else {
          // If either is missing, clear both to be safe
          await AsyncStorage.multiRemove(['user', 'token']);
        }
      } catch (e) {
        console.error('Failed to load auth state:', e);
      } finally {
        setLoading(false);
      }
    };
    loadStorage();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await loginService(email, password);
    console.log('Login success, user:', res.user.name);
    
    if (!res.token) {
      throw new Error('Server tidak memberikan token akses');
    }

    await AsyncStorage.setItem('token', res.token);
    await AsyncStorage.setItem('user', JSON.stringify(res.user));
    setUser(res.user);
  };

  const register = async (name: string, email: string, password: string, passwordConfirmation: string) => {
    const res = await registerService(name, email, password, passwordConfirmation);
    console.log('Register success, user:', res.user.name);

    if (!res.token) {
      // If backend doesn't return token, it's not a failure but requires manual login
      console.warn('No token received on register');
      throw new Error('Registrasi berhasil, silakan login manual');
    }

    await AsyncStorage.setItem('token', res.token);
    await AsyncStorage.setItem('user', JSON.stringify(res.user));
    setUser(res.user);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
