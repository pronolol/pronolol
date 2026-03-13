import axios, { AxiosRequestConfig } from "axios"
import { Platform } from "react-native"
import * as storage from "@/lib/storage"
import { API_BASE_URL } from "@/config/env"

export const AXIOS_INSTANCE = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  // On web, send cookies automatically for cross-origin requests
  withCredentials: Platform.OS === "web",
})

// Add request interceptor to include auth headers
AXIOS_INSTANCE.interceptors.request.use(
  async (config) => {
    console.log(
      "API Request:",
      config.method?.toUpperCase(),
      config.url,
      config.baseURL
    )

    // On web, cookies are sent automatically via withCredentials
    // On native, we need to manually get the token from storage
    if (Platform.OS !== "web") {
      // Get all stored keys to debug
      const keys = [
        "pronolol_session_token",
        "pronolol.session_token",
        "pronolol_session",
        "pronolol.session",
      ]

      let sessionToken = null
      for (const key of keys) {
        const value = await storage.getItem(key)
        if (value) {
          console.log(`Found auth token at key: ${key}`)
          sessionToken = value
          break
        }
      }

      if (sessionToken) {
        // Better-auth expects the token in a cookie named after the session cookie name
        config.headers.Cookie = `better_call_token=${sessionToken}`
      } else {
        console.log("No auth token found in storage")
      }
    }

    return config
  },
  (error) => {
    console.error("API Request Error:", error)
    return Promise.reject(error)
  }
)

// Add response interceptor for debugging
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
  // eslint-disable-next-line import/no-named-as-default-member
  const source = axios.CancelToken.source()
  const promise = AXIOS_INSTANCE({
    ...config,
    cancelToken: source.token,
  }).then(({ data }) => data)

  // @ts-expect-error – cancel is not in the Promise type but is used by react-query
  promise.cancel = () => {
    source.cancel("Query was cancelled")
  }

  return promise
}

export default customInstance
