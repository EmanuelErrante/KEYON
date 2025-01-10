import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../context/AuthContext';
import { createGroup } from '../api/groups';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type CreateGroupScreenProps = StackScreenProps<RootStackParamList, 'CreateGroup'>;

export default function CreateGroupScreen({ navigation }: CreateGroupScreenProps) {
  const { userToken } = useContext(AuthContext);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [direccion, setDireccion] = useState('');
  const [tipo, setTipo] = useState('evento');  // Valor por defecto
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const handleCreateGroup = async () => {
    if (!nombre || !descripcion || !direccion || !tipo) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios.');
      return;
    }

    const nuevoGrupo = {
      nombre,
      descripcion,
      direccion,
      tipo,
      fechaInicio: tipo === 'evento' ? fechaInicio : null,
      fechaFin: tipo === 'evento' ? fechaFin : null,
    };

    try {
      const data = await createGroup(nuevoGrupo, userToken || '');
      Alert.alert('Éxito', 'Grupo creado con éxito');
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el grupo');
      console.error('Error al crear grupo:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Grupo</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre del grupo"
        value={nombre}
        onChangeText={setNombre}
      />

      <TextInput
        style={styles.input}
        placeholder="Descripción"
        value={descripcion}
        onChangeText={setDescripcion}
      />

      <TextInput
        style={styles.input}
        placeholder="Dirección"
        value={direccion}
        onChangeText={setDireccion}
      />

      <Text style={styles.label}>Selecciona el tipo de grupo:</Text>
      <Picker
        selectedValue={tipo}
        onValueChange={(itemValue) => setTipo(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Evento" value="evento" />
        <Picker.Item label="Establecimiento" value="establecimiento" />
        <Picker.Item label="Barrio/Consorcio" value="barrio/consorcio" />
      </Picker>

      {tipo === 'evento' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Fecha de inicio (YYYY-MM-DD)"
            value={fechaInicio}
            onChangeText={setFechaInicio}
          />
          <TextInput
            style={styles.input}
            placeholder="Fecha de fin (YYYY-MM-DD)"
            value={fechaFin}
            onChangeText={setFechaFin}
          />
        </>
      )}

      <Button title="Crear Grupo" onPress={handleCreateGroup} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 15,
  },
});
