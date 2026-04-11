import api from "../api/axios";

export const signupUser = async (userData) => {
  const response = await api.post("/auth/signup", userData);
  return response.data;
};

export const loginUser = async (data) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const logoutUserWithApi = async () => {
  try {
    await api.post("/auth/logout");
    localStorage.removeItem("userLoginTimestamp");
  } catch {
    console.warn("Backend logout failed");
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userLoginTimestamp");
    window.location.href = "/";
  }
};