import axios from "axios";
const api = axios.create({
    baseURL: '/api/accounts/',
    withCredentials:true,
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.data &&
      error.response.data.code === "token_not_valid" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        await api.post("refresh/");
        // return api(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
      }
    }

    return Promise.reject(error);
  }
);
export const login = (credentials) => api.post('login/',credentials);
export const getUser = () => api.get('user/')
export const logout = () => api.post('logout/')