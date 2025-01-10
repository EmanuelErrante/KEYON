import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Button, Avatar, FAB, IconButton } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';
import { fetchGroups } from '../api/groups';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const { signOut, userToken, nombre } = useContext(AuthContext);  // Obtener nombre real
  const [groups, setGroups] = useState<any[]>([]);
  const navigation = useNavigation<HomeScreenNavigationProp>();

  useEffect(() => {
    const obtenerGrupos = async () => {
      if (!userToken) return;
      try {
        const data = await fetchGroups(userToken as string);
        setGroups(data);
      } catch (error) {
        console.error('Error obteniendo grupos:', error);
      }
    };
    obtenerGrupos();
  }, [userToken]);

  const handleShowQR = (groupId: string) => {
    console.log(`Mostrar QR para grupo: ${groupId}`);
    // Aquí se abriría el modal o lógica para mostrar el QR
  };

  return (
    <View style={styles.container}>
      {/* Header con el nombre del usuario y botón de cerrar sesión */}
      <Card style={styles.headerCard}>
        <Card.Title
          title={`Hola, ${nombre || 'Usuario'}`}  // Muestra el nombre real
          subtitle="Bienvenido de nuevo"
          left={(props) => <Avatar.Icon {...props} icon="account-circle" />}
          right={(props) => (
            <Button onPress={signOut} compact>
              Cerrar sesión
            </Button>
          )}
        />
      </Card>

      <Text style={styles.title}>Mis Accesos</Text>

      {/* Lista de accesos */}
      <FlatList
        data={groups}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Card style={styles.groupItem}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.groupInfo}>
                <Text
                  style={styles.groupName}
                  onPress={() => navigation.navigate('GroupDetail', { grupoId: item._id })}
                >
                  {item.nombre}
                </Text>
                <Text>Rol: {item.rolUsuarioActual}</Text>
              </View>

              {/* Botón QR separado */}
              <IconButton
                icon="qrcode"
                size={30}
                onPress={() => handleShowQR(item._id)}
                style={styles.qrButton}
              />
            </Card.Content>
          </Card>
        )}
      />

      {/* Botón flotante para crear un grupo */}
      <FAB
        style={styles.fab}
        icon="plus"
        label="Crear Grupo"
        onPress={() => navigation.navigate('CreateGroup')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  headerCard: {
    marginBottom: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  groupItem: {
    marginVertical: 8,
    borderRadius: 10,
    elevation: 2,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupInfo: {
    flexDirection: 'column',
  },
  qrButton: {
    alignSelf: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 20,
  },
});
