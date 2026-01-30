import { z } from "zod"

export const CreatePredictionSchema = z
  .object({
    teamId: z.string().min(1, "Team selection is required"),
    predictedTeamAScore: z.number().int().min(0),
    predictedTeamBScore: z.number().int().min(0),
  })
  .refine((data) => data.predictedTeamAScore !== data.predictedTeamBScore, {
    message: "Scores cannot be tied - one team must win",
  })

export type CreatePredictionDto = z.infer<typeof CreatePredictionSchema>
