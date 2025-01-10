import React, { useEffect, useState, useContext } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Card, Text, Button, Avatar, Divider, List, IconButton, FAB } from 'react-native-paper';
import { fetchGroupDetail } from '../api/groups';
import { AuthContext } from '../context/AuthContext';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';

type GroupDetailScreenProps = {
  route: RouteProp<RootStackParamList, 'GroupDetail'>;
};

export default function GroupDetailScreen({ route }: GroupDetailScreenProps) {
  const { grupoId } = route.params;
  const [group, setGroup] = useState<any>(null);
  const { userToken, nombre } = useContext(AuthContext);

  useEffect(() => {
    const obtenerGrupo = async () => {
      try {
        if (userToken) {
          const data = await fetchGroupDetail(grupoId, userToken);
          setGroup(data);
        }
      } catch (error) {
        console.error('Error obteniendo detalle del grupo:', error);
      }
    };

    obtenerGrupo();
  }, [grupoId, userToken]);

  if (!group) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text variant="bodyMedium">Cargando...</Text>
      </View>
    );
  }

  const esAdmin = group.usuariosConRoles.some(
    (user: any) => user.usuarioId.nombre === nombre && (user.rol === 'admin' || user.rol === 'superadmin')
  );

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <>
            {/* Card con detalles del grupo */}
            <Card style={styles.card}>
              <Card.Title
                title={group.nombre}
                subtitle={group.tipo}
                left={(props) => <Avatar.Icon {...props} icon="folder" />}
              />
              <Card.Content>
                <Text variant="bodyMedium">{group.descripcion}</Text>
                <Text style={styles.detailText}>
                  Dirección: {group.direccion || 'No especificada'}
                </Text>
                <Text style={styles.detailText}>
                  Desde: {group.fechaInicio ? new Date(group.fechaInicio).toLocaleDateString() : 'No disponible'}
                </Text>
                <Text style={styles.detailText}>
                  Hasta: {group.fechaFin ? new Date(group.fechaFin).toLocaleDateString() : 'Sin fecha de finalización'}
                </Text>
              </Card.Content>

              {esAdmin && (
                <Card.Actions>
                  <Button mode="contained" icon="pencil" onPress={() => {}}>
                    Editar
                  </Button>
                  <Button mode="outlined" icon="delete" onPress={() => {}}>
                    Eliminar
                  </Button>
                </Card.Actions>
              )}
            </Card>

            {/* Título para la lista de usuarios */}
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Usuarios con acceso
            </Text>
          </>
        }
        data={group.usuariosConRoles}
        keyExtractor={(item) => item.usuarioId._id}
        renderItem={({ item }) => (
          <List.Item
            title={item.usuarioId.nombre}
            description={`Rol: ${item.rol} | Email: ${item.usuarioId.email}`}
            left={(props) => <Avatar.Text {...props} label={item.usuarioId.nombre.charAt(0)} />}
            right={(props) =>
              esAdmin && (
                <View style={styles.userActions}>
                  <IconButton icon="pencil" size={20} onPress={() => {}} />
                  <IconButton icon="pause-circle" size={20} onPress={() => {}} />
                  <IconButton icon="trash-can" size={20} onPress={() => {}} />
                </View>
              )
            }
          />
        )}
        ItemSeparatorComponent={() => <Divider />}
      />

      {/* Botón flotante para agregar usuarios (solo visible para admin) */}
      {esAdmin && (
        <FAB
          style={styles.fab}
          icon="account-plus"
          label="Agregar Usuario"
          onPress={() => {}}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    margin: 16,
    borderRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },
  detailText: {
    marginTop: 8,
    fontSize: 16,
  },
  sectionTitle: {
    marginVertical: 16,
    marginLeft: 16,
    fontWeight: 'bold',
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 30,
  },
});
