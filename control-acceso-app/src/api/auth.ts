import axios from 'axios';
import API_URL from './config';

export const login = async (email: string, password: string) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/auth/login`,
      { email, password },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    console.log("🔹 Respuesta del backend:", response.data); // 👈 Ver qué devuelve exactamente

    return response.data;
  } catch (error: any) {
    console.error("❌ Error en login:", error.response?.data || error.message);
    throw new Error(error.response?.data?.mensaje || "Error de autenticación");
  }
};
