import axios from "axios";
import { getToken } from "../utils/auth";

const api = axios.create({
  baseURL: "/api",  // Utilise le path relatif en production et dev
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
