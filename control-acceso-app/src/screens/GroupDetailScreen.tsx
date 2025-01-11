import React, { useEffect, useState, useContext } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Card, Text, Avatar, Divider, List, IconButton, FAB, Button } from 'react-native-paper';
import { fetchGroupDetail } from '../api/groups';
import { AuthContext } from '../context/AuthContext';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';

type GroupDetailScreenProps = {
  route: RouteProp<RootStackParamList, 'GroupDetail'>;
};

export default function GroupDetailScreen({ route }: GroupDetailScreenProps) {
  const { grupoId } = route.params;
  const [data, setData] = useState<any>(null);
  const [expandedSubgrupo, setExpandedSubgrupo] = useState<string | null>(null);
  const { userToken, nombre } = useContext(AuthContext);

  useEffect(() => {
    const obtenerDetalle = async () => {
      try {
        if (userToken) {
          const response = await fetchGroupDetail(grupoId, userToken);
          setData(response);

        //Parche: como es usuario colaborador y siempre tiene solo un subgrupo el subgrupo sale expandido
        if (response.subgrupos.length === 1) {
            setExpandedSubgrupo(response.subgrupos[0].id);
          }



        }
      } catch (error) {
        console.error('Error obteniendo detalle del grupo:', error);
      }
    };

    obtenerDetalle();
  }, [grupoId, userToken]);

  if (!data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text variant="bodyMedium">Cargando...</Text>
      </View>
    );
  }

  const isAdmin = data.usuariosGrupoPrincipal.some(
    (user: any) => user.nombre === nombre && user.rol === 'admin'
  );

  const handleToggleSubgrupo = (subgrupoId: string) => {
    console.log('Toggle Subgrupo:', subgrupoId);
    setExpandedSubgrupo((prev) => (prev === subgrupoId ? null : subgrupoId));
  };

  const handleAgregarSubgrupo = () => {
    console.log('Agregar Subgrupo para grupo:', grupoId);
  };

  const handleEditarGrupo = () => {
    console.log('Editar Grupo:', grupoId);
  };

  const handleEliminarGrupo = () => {
    console.log('Eliminar Grupo:', grupoId);
  };

  const handleEditarUsuario = (usuarioId: string) => {
    console.log('Editar Usuario:', usuarioId, 'en grupo:', grupoId);
  };

  const handlePausarUsuario = (usuarioId: string) => {
    console.log('Pausar Usuario:', usuarioId, 'en grupo:', grupoId);
  };

  const handleEliminarUsuario = (usuarioId: string) => {
    console.log('Eliminar Usuario:', usuarioId, 'en grupo:', grupoId);
  };

  const handleEditarSubgrupoUsuario = (subgrupoId: string, usuarioId: string) => {
    console.log('Editar Usuario en Subgrupo:', usuarioId, 'en subgrupo:', subgrupoId);
  };

  const handlePausarSubgrupoUsuario = (subgrupoId: string, usuarioId: string) => {
    console.log('Pausar Usuario en Subgrupo:', usuarioId, 'en subgrupo:', subgrupoId);
  };

  const handleEliminarSubgrupoUsuario = (subgrupoId: string, usuarioId: string) => {
    console.log('Eliminar Usuario en Subgrupo:', usuarioId, 'en subgrupo:', subgrupoId);
  };

  return (
    <View style={styles.container}>
      {/* Información principal del grupo */}
      <Card style={styles.card}>
        <Card.Title
          title={data.nombre}
          subtitle={data.descripcion || 'Sin descripción'}
          left={(props) => <Avatar.Icon {...props} icon="folder" />}
        />
        <Card.Content>
          {/* {data.fechaInicio && (
            <Text style={styles.detailText}>
              Desde: {new Date(data.fechaInicio).toLocaleDateString()}
            </Text>
          )}
          {data.fechaFin && (
            <Text style={styles.detailText}>
              Hasta: {new Date(data.fechaFin).toLocaleDateString()}
            </Text>
          )} */}
{data.acceso.ilimitado ? (
    <Text style={styles.detailText}>Duración: Ilimitada</Text>
  ) : (
    <>
      {data.acceso.desde && (
        <Text style={styles.detailText}>
          Desde: {new Date(data.acceso.desde).toLocaleString()}
        </Text>
      )}
      {data.acceso.hasta && (
        <Text style={styles.detailText}>
          Hasta: {new Date(data.acceso.hasta).toLocaleString()}
        </Text>
      )}
    </>
  )}

        </Card.Content>
        {isAdmin && (
          <Card.Actions>
            <IconButton icon="pencil" size={24} onPress={handleEditarGrupo} />
            <IconButton icon="delete" size={24} onPress={handleEliminarGrupo} />
            <Button mode="contained" icon="folder-plus" onPress={handleAgregarSubgrupo}>
              Subgrupo
            </Button>
          </Card.Actions>
        )}
      </Card>

      {/* Usuarios del grupo principal */}
      <Text variant="titleLarge" style={styles.sectionTitle}>
        Usuarios y Subgrupos
      </Text>
      <View>
        {data.usuariosGrupoPrincipal.map((user: any) => (
          <List.Item
            key={user.id}
            title={user.nombre}
            description={`Email: ${user.email}`}
            left={(props) => <Avatar.Text {...props} label={user.nombre.charAt(0)} />}
            right={(props) =>
              isAdmin && (
                <View style={styles.userActions}>
                  <IconButton icon="pencil" size={20} onPress={() => handleEditarUsuario(user.id)} />
                  <IconButton icon="pause-circle" size={20} onPress={() => handlePausarUsuario(user.id)} />
                  <IconButton icon="trash-can" size={20} onPress={() => handleEliminarUsuario(user.id)} />
                </View>
              )
            }
          />
        ))}
      </View>

      {/* Subgrupos */}
      {data.subgrupos.map((sub: any) => (
        <Card key={sub.id} style={styles.subgroupCard}>
          <Card.Title
            title={sub.nombre}
            subtitle={sub.descripcion || 'Sin descripción'}
            right={(props) => (
              <IconButton
                {...props}
                icon={expandedSubgrupo === sub.id ? 'chevron-up' : 'chevron-down'}
                onPress={() => handleToggleSubgrupo(sub.id)}
              />
            )}
          />
          {expandedSubgrupo === sub.id &&
            sub.usuarios.map((user: any) => (
              <List.Item
                key={user.id}
                title={user.nombre}
                description={`Email: ${user.email}`}
                left={(props) => <Avatar.Text {...props} label={user.nombre.charAt(0)} />}
                right={(props) => (
                  <View style={styles.userActions}>
                    <IconButton
                      icon="pencil"
                      size={20}
                      onPress={() => handleEditarSubgrupoUsuario(sub.id, user.id)}
                    />
                    <IconButton
                      icon="pause-circle"
                      size={20}
                      onPress={() => handlePausarSubgrupoUsuario(sub.id, user.id)}
                    />
                    <IconButton
                      icon="trash-can"
                      size={20}
                      onPress={() => handleEliminarSubgrupoUsuario(sub.id, user.id)}
                    />
                  </View>
                )}
              />
            ))}
        </Card>
      ))}

      {/* Botón flotante para agregar usuario */}
      <FAB
        style={styles.fab}
        icon="account-plus"
        label={expandedSubgrupo ? "Agregar Usuario al Subgrupo" : "Agregar Usuario"}
        onPress={() => {
          if (expandedSubgrupo) {
            console.log('Agregar Usuario al subgrupo:', expandedSubgrupo);
          } else {
            console.log('Agregar Usuario al grupo:', grupoId);
          }
        }}
      />
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
  subgroupCard: {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 2,
  },
});
