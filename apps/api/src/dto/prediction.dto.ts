import { z } from "zod"

export const TeamSchema = z.object({
  id: z.string(),
  tag: z.string(),
  logoUrl: z.string(),
})

export const MyPredictionSchema = z.object({
  matchId: z.string(),
  teamId: z.string(),
  predictedTeamAScore: z.number().int(),
  predictedTeamBScore: z.number().int(),
  isCorrect: z.boolean().nullable(),
  isExact: z.boolean().nullable(),
  points: z.number().nullable(),
  team: TeamSchema,
})

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
