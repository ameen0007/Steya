import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

const api = axios.create({
  baseURL: apiUrl,
  timeout: 10000,
});

// ✅ Request interceptor to always attach token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("authToken"); // must match storage key
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const userId = await AsyncStorage.getItem("userId");
      console.log("Retrying with refresh token for userId:", userId);

      if (!userId) return Promise.reject(error);

      try {
        const res = await axios.post(`${apiUrl}/api/auth/refresh`, { userId });
        console.log("Refresh response:", res.data);

        const newAccessToken = res.data.accessToken;
        if (!newAccessToken) throw new Error("No accessToken returned from refresh");

        // Update AsyncStorage
        await AsyncStorage.setItem("authToken", newAccessToken);
        console.log("Updated authToken in AsyncStorage");

        // Attach new token and retry original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        console.error("Refresh failed:", refreshErr);
        // Optional: logout user if refresh fails
      }
    }

    return Promise.reject(error);
  }
);

export default api;
