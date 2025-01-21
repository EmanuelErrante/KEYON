import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { HomeScreenProps } from '../types/navigationTypes';

const HomeScreen: React.FC<HomeScreenProps> = ({ route, navigation }) => {

  
  //const { token } = route.params; // Recibe el token correctamente
  const token = ((route.params as unknown) as { token: string })?.token ?? 'No hay token disponible';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Token de Autenticación</Text>
      <Text style={styles.token}>{token}</Text>
      <Button mode="contained" onPress={() => navigation.goBack()} style={styles.button}>
        Volver al Login
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  token: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  button: {
    marginTop: 16,
  },
});

export default HomeScreen;
