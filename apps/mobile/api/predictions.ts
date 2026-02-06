import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Platform } from "react-native"
import { authClient } from "@/lib/auth-client"
import { API_BASE_URL } from "@/config/env"

// Types
export interface Prediction {
  id: string
  userId: string
  matchId: string
  teamId: string
  predictedTeamAScore: number
  predictedTeamBScore: number
  isCorrect: boolean | null
  isExact: boolean | null
  points: number | null
  createdAt: string
  updatedAt: string
  team: {
    id: string
    name: string
    tag: string
    logoUrl: string
  }
  user?: {
    id: string
    displayUsername: string | null
    username: string | null
    name: string | null
    image: string | null
  }
}

export interface PredictionsResponse {
  myPrediction: Prediction | null
  predictions: Prediction[] | null
}

export interface CreatePredictionDto {
  teamId: string
  predictedTeamAScore: number
  predictedTeamBScore: number
}

// Helper to make authenticated requests using better-auth cookies
const authenticatedFetch = async <T>(
  path: string,
  options: RequestInit = {}
): Promise<T> => {
  // On web, use credentials: "include" to send cookies automatically
  // On native, manually set the Cookie header
  const isWeb = Platform.OS === "web"
  const cookies = !isWeb ? authClient.getCookie() : null

  console.log("[authenticatedFetch] Platform:", Platform.OS, "isWeb:", isWeb)
  console.log("[authenticatedFetch] URL:", `${API_BASE_URL}${path}`)
  console.log("[authenticatedFetch] credentials:", isWeb ? "include" : "omit")

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
      ...(cookies ? { Cookie: cookies } : {}),
    },
    credentials: isWeb ? "include" : "omit",
  })

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: response.statusText }))
    throw new Error(error.message || `Request failed: ${response.status}`)
  }

  return response.json()
}

// API functions
export const getPredictions = async (
  matchId: string
): Promise<PredictionsResponse> => {
  return authenticatedFetch(`/matches/${matchId}/predictions`)
}

export const createPrediction = async (
  matchId: string,
  data: CreatePredictionDto
): Promise<Prediction> => {
  return authenticatedFetch(`/matches/${matchId}/predictions`, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

// Hooks
export const useGetPredictions = (matchId: string) => {
  return useQuery({
    queryKey: ["predictions", matchId],
    queryFn: () => getPredictions(matchId),
    enabled: !!matchId,
  })
}

export const useCreatePrediction = (matchId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePredictionDto) => createPrediction(matchId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["predictions", matchId] })
    },
  })
}
