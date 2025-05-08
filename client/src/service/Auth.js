import axios from "axios";

// Configuração do Axios
const api = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 5000, // Tempo de espera para a requisição
});

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Função para login
export const login = async (email, password) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    return response.data; // Retorna o token JWT
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};
