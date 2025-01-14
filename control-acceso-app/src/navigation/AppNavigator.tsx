import React, { useContext, useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import GroupDetailScreen from '../screens/GroupDetailScreen';
import CreateGroupScreen from '../screens/CreateGroupScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { AuthContext } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import CustomHeader from '../components/CustomHeader';  // Importamos el CustomHeader
import EditGroupScreen from '../screens/EditGroupScreen';
import AddSubgroupScreen from '../screens/AddSubgroupScreen';



export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  GroupDetail: { grupoId: string };
  CreateGroup: undefined;
  Profile: undefined;
  EditGroup: { grupoId: string }; // Nueva ruta para editar grupo
  AddSubgroup: { groupId: string }; 
  
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { userToken, isLoading } = useContext(AuthContext);
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | undefined>(undefined);

  useEffect(() => {
    if (!isLoading) {
      setInitialRoute(userToken ? 'Home' : 'Login');
    }
  }, [userToken, isLoading]);

  if (isLoading || !initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator initialRouteName={initialRoute}>
      {userToken ? (
        <>
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{
              title: 'Inicio',
              headerRight: () => <CustomHeader />,  // CustomHeader aparece en el header
            }} 
          />
          <Stack.Screen 
            name="GroupDetail" 
            component={GroupDetailScreen} 
            options={{
              title: 'Detalle del Grupo',
              headerRight: () => <CustomHeader />,
            }} 
          />
          <Stack.Screen 
            name="CreateGroup" 
            component={CreateGroupScreen} 
            options={{
              title: 'Crear Grupo',
              headerRight: () => <CustomHeader />,
            }} 
          />
          <Stack.Screen name="EditGroup" component={EditGroupScreen} />
          <Stack.Screen 
    name="AddSubgroup" 
    component={AddSubgroupScreen} 
    options={{ title: 'Agregar Subgrupo' }}
  />

          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen} 
            options={{
              title: 'Perfil',
              headerRight: () => <CustomHeader />,
            }} 
          />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
