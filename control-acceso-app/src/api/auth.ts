import API_URL from './config';

export const loginApi = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const data = await response.json();

    //   if (!data.token || !data.nombre) {
    //     throw new Error('Faltan datos en la respuesta del servidor');
    //   }

      return {
        token: data.token,
        nombre: data.nombre,  // Devolvemos el nombre recibido del backend
      };
      
    } catch (error) {
      console.error('Error en el login:', error);
      return null;
    }
};


