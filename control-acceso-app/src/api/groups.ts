import API_URL from './config';
const API_URL2 = `${API_URL}/api/grupos`;





// Obtener todos los grupos donde el usuario tiene acceso
export const fetchGroups = async (token: string) => {
    try {
      //const response = await fetch('http://192.168.1.09:5000/api/grupos', {
      const response = await fetch(`${API_URL2}`, {
        method: 'GET',
        headers: {
         // Authorization: `Bearer ${token}`,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
     console.log("xxxxxxxxxxxxx",token);
      console.log('Respuesta completa:', response);
      if (!response.ok) {
        throw new Error('Error al obtener grupos');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error en fetchGroups:', error);
      return null;
    }
  };
  
// Obtener detalles de un grupo específico por ID
export const fetchGroupDetail = async (grupoId: string, token: string) => {
  try {
    const response = await fetch(`${API_URL2}/${grupoId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        //Authorization': `${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener detalle del grupo');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en fetchGroupDetail:', error);
    throw error;
  }
};

// Obtener grupos del usuario autenticado
export const getUserGroups = async (token: string) => {
  try {
    const response = await fetch(`${API_URL2}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener grupos');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en getUserGroups:', error);
    return null;
  }
};

// Crear Grupo
export const createGroup = async (nuevoGrupo: any, token: string) => {
    const response = await fetch(`${API_URL2}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token}`,
      },
      body: JSON.stringify(nuevoGrupo),
    });
  
    if (!response.ok) {
      throw new Error('Error al crear el grupo');
    }
    
    return await response.json();
  };
  