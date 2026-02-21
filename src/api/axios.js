import axios from "axios";
import { getAuthToken } from "../utils/auth";

const API = axios.create({
  baseURL: "https://carwash-backend-1k0a.onrender.com/api",
});

API.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
