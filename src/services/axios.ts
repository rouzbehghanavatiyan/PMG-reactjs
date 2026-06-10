import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    config.headers.Authorization = `Bearer ${token}`;

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const statusCode = error?.response?.status;
    const message = error?.response?.data?.message;
    if (statusCode === 401 || statusCode === 500) {
      toast.error(message || "خطای سرور");
      localStorage.removeItem("token");
      // window.location.replace("/");
    }
    return Promise.reject(error);
  },
);

export default api;
