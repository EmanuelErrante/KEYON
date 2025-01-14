import React, { useState, useContext } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { createSubgroup } from '../api/groups';

type AddSubgroupScreenProps = StackScreenProps<RootStackParamList, 'AddSubgroup'>;

export default function AddSubgroupScreen({ route, navigation }: AddSubgroupScreenProps) {
  const { groupId } = route.params;
  const { userToken } = useContext(AuthContext);

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const handleCreateSubgroup = async () => {
    if (!nombre) {
      Alert.alert('Error', 'El nombre del subgrupo es obligatorio.');
      return;
    }

    try {
      await createSubgroup(groupId, { nombre, descripcion }, userToken || '');
      Alert.alert('Éxito', 'Subgrupo creado con éxito');
      navigation.goBack(); // Regresa al detalle del grupo
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el subgrupo');
      console.error('Error al crear subgrupo:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TextInput
        label="Nombre del subgrupo"
        value={nombre}
        onChangeText={setNombre}
        mode="outlined"
        style={styles.input}
      />
      <HelperText type="error" visible={!nombre}>
        Este campo es obligatorio
      </HelperText>

      <TextInput
        label="Descripción"
        value={descripcion}
        onChangeText={setDescripcion}
        mode="outlined"
        style={styles.input}
        multiline
      />

      <Button mode="contained" onPress={handleCreateSubgroup} style={styles.submitButton}>
        Crear Subgrupo
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    marginBottom: 15,
  },
  submitButton: {
    marginTop: 20,
  },
});
