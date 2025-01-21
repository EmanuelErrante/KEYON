import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login} from '../api/auth';

interface AuthContextType {
  userToken: string | null;
  nombre?: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType>({
  userToken: null,
  isLoading: true,
  signIn: async () => false,
  signOut: () => {},
});

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [nombre, setNombre] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar token y nombre al iniciar la app
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        const storedNombre = await AsyncStorage.getItem('nombreUsuario');  // Cargar nombre
        if (storedToken) {
          setUserToken(storedToken);
          if (storedNombre) {
            setNombre(storedNombre);  // Restaurar el nombre
          }
        }
      } catch (error) {
        console.error('Error al cargar el token o nombre:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await login(email, password);
      if (response && response.token) {
        setUserToken(response.token);
        setNombre(response.nombre);  // Guarda el nombre en el estado
        await AsyncStorage.setItem('userToken', response.token);
        await AsyncStorage.setItem('nombreUsuario', response.nombre);  // Guardar el nombre en AsyncStorage
        
        return true;
      }
    } catch (error) {
      console.error('Error en el login:', error);
    }
    return false;
  };

  const signOut = async () => {
    try {
      setUserToken(null);
      console.log('Sesión cerrada correctamente');
      setNombre(null);
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('nombreUsuario');  // Eliminar el nombre al cerrar sesión
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ signIn, signOut, userToken, isLoading, nombre }}>
      {children}
    </AuthContext.Provider>
  );
};
