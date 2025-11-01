import axios from "axios";
import { toaster } from "../components/ui/toaster";

// Create an Axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_ENDPOINT_URL + "api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Request interceptor
api.interceptors.request.use(
  (config) => {
    // Example: attach a token if exists
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Example: handle 401 globally
    if (error.response && error.response.status === 401) {
      toaster.error("Unauthorized! Please log in again.");
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default api;
