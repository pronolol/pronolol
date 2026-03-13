import { Router, Request, Response } from "express"
import { ZodError } from "zod"
import { GetRankingQuerySchema } from "../dto/ranking.dto"
import {
  computeRankings,
  fetchRankingPredictions,
} from "../services/ranking.service"

export const rankingRouter = Router()

rankingRouter.get("/", async (req: Request, res: Response) => {
  try {
    const query = GetRankingQuerySchema.parse(req.query)
    const predictions = await fetchRankingPredictions(query)
    const rankings = computeRankings(predictions)

    res.json({
      rankings,
      filters: {
        leagueId: query.leagueId ?? null,
        tournamentId: query.tournamentId ?? null,
      },
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json({ error: "Validation error", details: error.issues })
    }
    console.error("Error fetching ranking:", error)
    res.status(500).json({ error: "Failed to fetch ranking" })
  }
})
