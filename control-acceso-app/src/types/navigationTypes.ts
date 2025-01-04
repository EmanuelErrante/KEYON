import { NativeStackScreenProps } from '@react-navigation/native-stack';

// Definir el stack de rutas
export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Register: undefined;
};

// Tipado de props para LoginScreen
export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
