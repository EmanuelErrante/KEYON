import React, { useState, useContext } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';
import { LoginScreenProps } from '../types/navigationTypes';

const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useContext(AuthContext);

  const handleLogin = async () => {
    const success = await signIn(email, password);
    if (!success) {
      alert('Login fallido. Verifica tus credenciales.');
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      
      {/* Título Corregido */}
      <Text variant="headlineLarge" style={styles.title}>
        Iniciar Sesión
      </Text>

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
        mode="outlined"
      />

      <TextInput
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        mode="outlined"
      />

      <Button
        mode="contained"
        onPress={handleLogin}
        style={styles.button}
      >
        Ingresar
      </Button>

      <Text
        style={styles.link}
        onPress={() => navigation.navigate('Register')}
      >
        ¿No tienes una cuenta?
        <Text style={[styles.link, styles.linkBold]}> Regístrate</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
  },
  link: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
  },
  linkBold: {
    fontWeight: 'bold',
  },
});

export default LoginScreen;
