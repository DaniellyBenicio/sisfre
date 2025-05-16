import api from "./api";

export const login = async (email, password) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    const { token, username } = response.data;
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    return { token, username };
  } catch (error) {
    const message = error.response?.data?.message || "Falha na autenticação";
    throw new Error(message);
  }
};

export const logout = (setAuthenticated) => {
  try {
    localStorage.removeItem("token");
    setAuthenticated(false);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
