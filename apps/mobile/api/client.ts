import Axios, { AxiosRequestConfig } from "axios";
import { Platform } from "react-native";

// For WSL, use the Windows host IP
// You can find it with: cat /etc/resolv.conf | grep nameserver | awk '{print $2}'
// Or use your local network IP: 192.168.1.116
const API_BASE_URL = "http://192.168.1.116:3000";

export const AXIOS_INSTANCE = Axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add request interceptor for debugging
AXIOS_INSTANCE.interceptors.request.use(
  (config) => {
    console.log("API Request:", config.method?.toUpperCase(), config.url, config.baseURL);
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
