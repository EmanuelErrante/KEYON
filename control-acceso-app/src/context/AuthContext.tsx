import React, { createContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginApi } from '../api/auth';

// 1. Definir tipos para el contexto
interface AuthContextType {
  userToken: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => void;
}

// 2. Definir props del Provider
interface AuthProviderProps {
  children: ReactNode;
}

// 3. Crear el contexto con un valor por defecto
export const AuthContext = createContext<AuthContextType>({
  userToken: null,
  signIn: async () => false,
  signOut: () => {},
});

// 4. Implementar el Provider
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [userToken, setUserToken] = useState<string | null>(null);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await loginApi(email, password);
      if (response && response.token) {
        setUserToken(response.token);
        await AsyncStorage.setItem('userToken', response.token);
        return true;
      }
    } catch (error) {
      console.error('Error en el login:', error);
    }
    return false;
  };

  const signOut = async () => {
    setUserToken(null);
    await AsyncStorage.removeItem('userToken');
  };

  return (
    <AuthContext.Provider value={{ signIn, signOut, userToken }}>
      {children}
    </AuthContext.Provider>
  );
};
