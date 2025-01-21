import { StackScreenProps } from '@react-navigation/stack'; // Importación correcta

export type RootStackParamList = {
  Login: undefined;
  Home: { token: string };
};

// Asegurate de que estas usando `StackScreenProps`
export type HomeScreenProps = StackScreenProps<RootStackParamList, 'Home'>;
export type LoginScreenProps = StackScreenProps<RootStackParamList, 'Login'>;
