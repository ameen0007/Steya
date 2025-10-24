import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

const api = axios.create({
  baseURL: apiUrl,
  timeout: 10000,
});

// Track if we're currently refreshing to prevent race conditions
let isRefreshing = false;
let refreshSubscribers = [];

// Queue failed requests while refreshing
const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

// ✅ Request interceptor
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor with proper queue handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 errors and prevent retry loops
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const userId = await AsyncStorage.getItem("userId");
        
        if (!userId) {
          throw new Error("No userId found");
        }

        console.log("🔄 Refreshing token for userId:", userId);

        // Use base axios (not api instance) to avoid interceptor loop
        const res = await axios.post(`${apiUrl}/api/auth/refresh`, { userId });

        const newAccessToken = res.data.accessToken;
        
        if (!newAccessToken) {
          throw new Error("No accessToken returned");
        }

        // Update storage
        await AsyncStorage.setItem("authToken", newAccessToken);
        console.log("✅ Token refreshed successfully");

        // Update original request and notify queued requests
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        onRefreshed(newAccessToken);

        return api(originalRequest);

      } catch (refreshErr) {
        console.error("❌ Refresh failed:", refreshErr.message);
        
        // Clear auth data on refresh failure
        await AsyncStorage.multiRemove(["authToken", "userId"]);
        
        // Optional: Navigate to login screen here
        // navigation.navigate('Login');
        
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;