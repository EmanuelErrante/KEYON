import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText, Switch } from 'react-native-paper';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../context/AuthContext';
import { fetchGroupDetail, updateGroup } from '../api/groups';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type EditGroupScreenProps = StackScreenProps<RootStackParamList, 'EditGroup'>;

export default function EditGroupScreen({ route, navigation }: EditGroupScreenProps) {
  const { grupoId } = route.params;
  const { userToken } = useContext(AuthContext);

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [direccion, setDireccion] = useState('');
  const [tipo, setTipo] = useState('elija_opcion');
  const [latitud, setLatitud] = useState('');
  const [longitud, setLongitud] = useState('');
  const [ilimitado, setIlimitado] = useState(true);
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  const [fechaFin, setFechaFin] = useState<Date | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [pickerMode, setPickerMode] = useState<'start' | 'end' | null>(null);

  useEffect(() => {
    const fetchGroupData = async () => {
        if (!grupoId || !userToken) {
            Alert.alert('Error', 'El ID del grupo o el token de usuario no son válidos.');
            return;
          }
      try {
        const response = await fetchGroupDetail(grupoId, userToken); // API para obtener los detalles del grupo
        setNombre(response.nombre);
        setDescripcion(response.descripcion);
        setDireccion(response.direccion);
        setTipo(response.tipo);
        setLatitud(response.coordenadas?.latitud?.toString() || '');
        setLongitud(response.coordenadas?.longitud?.toString() || '');
        setIlimitado(response.acceso.ilimitado);
        setFechaInicio(response.acceso.desde ? new Date(response.acceso.desde) : null);
        setFechaFin(response.acceso.hasta ? new Date(response.acceso.hasta) : null);
      } catch (error) {
        Alert.alert('Error', 'No se pudo cargar el grupo.');
        console.error('Error al cargar grupo:', error);
      }
    };

    fetchGroupData();
  }, [grupoId, userToken]);

  const handleUpdateGroup = async () => {

    if (!grupoId || !userToken) {
        Alert.alert('Error', 'El ID del grupo o el token de usuario no son válidos.');
        return;
      }
    


    if (
      !nombre ||
      tipo === 'elija_opcion' ||
      (!ilimitado && (!fechaInicio || !fechaFin)) ||
      (tipo === 'evento' && (!fechaInicio || !fechaFin))
    ) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios.');
      return;
    }

    const grupoActualizado = {
      nombre,
      descripcion,
      direccion,
      tipo,
      coordenadas: {
        latitud: latitud ? parseFloat(latitud) : null,
        longitud: longitud ? parseFloat(longitud) : null,
      },
      acceso: {
        ilimitado,
        desde: ilimitado ? null : fechaInicio,
        hasta: ilimitado ? null : fechaFin,
      },
    };

    try {
      await updateGroup(grupoId, grupoActualizado, userToken); // API para actualizar el grupo
      Alert.alert('Éxito', 'Grupo actualizado con éxito');
      navigation.navigate('GroupDetail', { grupoId }); // Redirige al detalle del grupo
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el grupo');
      console.error('Error al actualizar grupo:', error);
    }
  };

  const showDatePicker = (mode: 'start' | 'end') => {
    setPickerMode(mode);
    setDatePickerVisibility(true);
  };

  const handleConfirm = (date: Date) => {
    setDatePickerVisibility(false);
    if (pickerMode === 'start') setFechaInicio(date);
    if (pickerMode === 'end') setFechaFin(date);
  };

  const renderDatePicker = (label: string, date: Date | null, mode: 'start' | 'end') => {
    if (Platform.OS === 'web') {
      return (
        <View style={styles.input}>
          <Text>{label}</Text>
          <input
            type="datetime-local"
            value={date ? date.toISOString().slice(0, 16) : ''}
            onChange={(e) =>
              mode === 'start' ? setFechaInicio(new Date(e.target.value)) : setFechaFin(new Date(e.target.value))
            }
            style={styles.webInput}
          />
        </View>
      );
    } else {
      return (
        <>
          <Text variant="labelLarge">{label}</Text>
          <Button mode="outlined" onPress={() => showDatePicker(mode)} style={styles.dateButton}>
            {date ? date.toLocaleString() : 'Seleccionar Fecha y Hora'}
          </Button>
        </>
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Editar Grupo</Text>

      <TextInput
        label="Nombre del grupo"
        value={nombre}
        onChangeText={setNombre}
        mode="outlined"
        style={styles.input}
      />
      <HelperText type="error" visible={!nombre}>
        Este campo es obligatorio
      </HelperText>

      <Text variant="labelLarge">Selecciona el tipo de grupo:</Text>
      <Picker
        selectedValue={tipo}
        onValueChange={(value) => setTipo(value)}
        style={styles.picker}
      >
        <Picker.Item label="Elija opción" value="elija_opcion" />
        <Picker.Item label="Evento" value="evento" />
        <Picker.Item label="Establecimiento" value="establecimiento" />
        <Picker.Item label="Barrio/Consorcio" value="barrio/consorcio" />
      </Picker>
      <HelperText type="error" visible={tipo === 'elija_opcion'}>
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

      <TextInput
        label="Dirección"
        value={direccion}
        onChangeText={setDireccion}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Latitud"
        value={latitud}
        onChangeText={setLatitud}
        mode="outlined"
        style={styles.input}
        keyboardType="numeric"
      />
      <TextInput
        label="Longitud"
        value={longitud}
        onChangeText={setLongitud}
        mode="outlined"
        style={styles.input}
        keyboardType="numeric"
      />

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Acceso Ilimitado:</Text>
        <Switch value={ilimitado} onValueChange={setIlimitado} disabled={tipo === 'evento'} />
      </View>

      {(!ilimitado || tipo === 'evento') && (
        <>
          {renderDatePicker('Fecha y Hora de Inicio', fechaInicio, 'start')}
          {renderDatePicker('Fecha y Hora de Fin', fechaFin, 'end')}
        </>
      )}

      <Button mode="contained" onPress={handleUpdateGroup} style={styles.submitButton}>
        Actualizar Grupo
      </Button>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        onConfirm={handleConfirm}
        onCancel={() => setDatePickerVisibility(false)}
      />
    </ScrollView>
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
    marginBottom: 15,
  },
  webInput: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  picker: {
    height: 50,
    marginBottom: 15,
  },
  dateButton: {
    marginBottom: 15,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  switchLabel: {
    fontSize: 16,
  },
  submitButton: {
    marginTop: 20,
  },
});
