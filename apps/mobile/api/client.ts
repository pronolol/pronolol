import Axios, { AxiosRequestConfig } from "axios";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

// For WSL, use the Windows host IP
// You can find it with: cat /etc/resolv.conf | grep nameserver | awk '{print $2}'
// Or use your local network IP: 192.168.1.116
const API_BASE_URL = "http://192.168.1.116:3000";

export const AXIOS_INSTANCE = Axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add request interceptor to include auth headers
AXIOS_INSTANCE.interceptors.request.use(
  async (config) => {
    console.log("API Request:", config.method?.toUpperCase(), config.url, config.baseURL);
    
    // Get all stored keys to debug
    const keys = [
      "pronolol_session_token",
      "pronolol.session_token",
      "pronolol_session",
      "pronolol.session",
    ];
    
    let sessionToken = null;
    for (const key of keys) {
      const value = await SecureStore.getItemAsync(key);
      if (value) {
        console.log(`Found auth token at key: ${key}`);
        sessionToken = value;
        break;
      }
    }
    
    if (sessionToken) {
      // Better-auth expects the token in a cookie named after the session cookie name
      config.headers.Cookie = `better_call_token=${sessionToken}`;
    } else {
      console.log("No auth token found in SecureStore");
    }
    
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
AXIOS_INSTANCE.interceptors.response.use(
  (response) => {
    console.log("API Response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("API Response Error:", {
      message: error.message,
      code: error.code,
      url: error.config?.url,
    });
    return Promise.reject(error);
  }
);

export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  const source = Axios.CancelToken.source();
  const promise = AXIOS_INSTANCE({
    ...config,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-ignore
  promise.cancel = () => {
    source.cancel("Query was cancelled");
  };

  return promise;
};

export default customInstance;
