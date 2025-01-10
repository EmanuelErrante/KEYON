import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Avatar, Button } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';

export default function CustomHeader() {
  //const { nombre, signOut } = useContext(AuthContext);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <View style={styles.header}>
      {/* <View style={styles.userInfo}>
        <Avatar.Icon size={40} icon="account-circle" />
        <View>
          <Text style={styles.greeting}>
            {`Hola, ${nombre || 'Usuario'}`}
          </Text>
          <Text style={styles.subtitle}>Bienvenido de nuevo</Text>
        </View>
      </View> */}

      {/* Botón de cerrar sesión */}
      {/* <Button 
        mode="outlined" 
        onPress={() => {
           
          signOut();
        }}
        compact
      >
        Cerrar sesión
      </Button> */}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    elevation: 3,  // Sombra
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b6b6b',
  },
});
