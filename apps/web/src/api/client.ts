import axios, { AxiosRequestConfig } from "axios"
import { API_BASE_URL } from "@/config/env"

export const AXIOS_INSTANCE = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
})

AXIOS_INSTANCE.interceptors.request.use(
  (config) => {
    console.log("API Request:", config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => {
    console.error("API Request Error:", error)
    return Promise.reject(error)
  }
)

AXIOS_INSTANCE.interceptors.response.use(
  (response) => {
    console.log("API Response:", response.status, response.config.url)
    return response
  },
  (error) => {
    console.error("API Response Error:", {
      message: error.message,
      code: error.code,
      url: error.config?.url,
    })
    return Promise.reject(error)
  }
)

export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  const source = axios.CancelToken.source()
  const execute = async (): Promise<T> => {
    const { data } = await AXIOS_INSTANCE<T>({
      ...config,
      cancelToken: source.token,
    })
    return data
  }
  const promise = execute()

  // @ts-expect-error – cancel is not in the Promise type but used by react-query
  promise.cancel = () => {
    source.cancel("Query was cancelled")
  }

  return promise
}

export default customInstance
