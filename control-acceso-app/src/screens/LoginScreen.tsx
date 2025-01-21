import React, { useState } from 'react';
import { View, StyleSheet, Alert, Image, Platform } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { LoginScreenProps } from '../types/navigationTypes';
import { login } from '../api/auth'; // Llamada al backend

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const response = await login(email, password);
      console.log("✅ Respuesta del backend en la app:", response); // 👈 Ver qué llega

      if (response.token) {
        console.log("Token recibido:", response.token);
        navigation.navigate('Home', { token: response.token } as never); 
        // Ahora el nombre es "Home"
      }  else {
        Alert.alert("Error", "Credenciales inválidas");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Algo salió mal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/logo.png')} // Ruta asegurada
        style={styles.logo}
        resizeMode="contain" // Asegura que el logo no se recorte
      />
      <Text style={styles.title}>Inicio de Sesión</Text>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button
        mode="contained"
        onPress={handleLogin}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        Iniciar Sesión
      </Button>
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
    
    width: Platform.OS === 'web' ? 200 : 150, // Tamaño para web y otros dispositivos
    height: Platform.OS === 'web' ? 200 : 150,
    marginBottom: 20,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
});

export default LoginScreen;
