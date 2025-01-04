export const loginApi = async (email: string, password: string) => {
    try {
      //const response = await fetch('http://localhost:5000/api/auth/login', {
      const response = await fetch('http://192.168.1.38:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      return await response.json();
    } catch (error) {
      console.error('Error en el login:', error);
      return null;
    }
  };
  