import axios from "axios";

const axiosInstance = axios.create({
  // baseURL: "http://127.0.0.1:8000/api/"
   baseURL:" https://coworking-space-2.onrender.com/api/"
});

// ADD TOKEN AUTOMATICALLY
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");

  if (token && token !=="null") {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default axiosInstance;