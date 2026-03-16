import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AXIOS_INSTANCE } from "./client"

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

const getPredictions = async (
  matchId: string
): Promise<PredictionsResponse> => {
  const response = await AXIOS_INSTANCE.get<PredictionsResponse>(
    `/matches/${matchId}/predictions`
  )
  return response.data
}

const createPrediction = async (
  matchId: string,
  data: CreatePredictionDto
): Promise<Prediction> => {
  const response = await AXIOS_INSTANCE.post<Prediction>(
    `/matches/${matchId}/predictions`,
    data
  )
  return response.data
}

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
      queryClient.invalidateQueries({ queryKey: ["matchesFeed"] })
    },
  })
}
