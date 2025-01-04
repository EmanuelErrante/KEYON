import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function HomeScreen() {
  const { signOut, userToken } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido</Text>
      <Text>Token: {userToken}</Text>
      <Button title="Cerrar Sesión" onPress={signOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 28,
    marginBottom: 16,
  },
});
