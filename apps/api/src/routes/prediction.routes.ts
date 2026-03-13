import { Router, Request, Response } from "express"
import { ZodError } from "zod"
import { auth } from "../lib/auth"
import { CreatePredictionSchema } from "../dto/prediction.dto"
import { findMatchById } from "../services/match.service"
import {
  isPredictionLocked,
  validatePrediction,
  upsertPrediction,
  getMatchPredictions,
} from "../services/prediction.service"

const getSession = (req: Request) =>
  auth.api.getSession({ headers: req.headers })

export const predictionRouter = Router({ mergeParams: true })

predictionRouter.post("/", async (req: Request, res: Response) => {
  try {
    const session = await getSession(req)
    if (!session?.user) return res.status(401).json({ error: "Unauthorized" })

    const { id: matchId } = req.params
    console.log(`[Predictions POST] Creating prediction for match: ${matchId}`)

    const body = CreatePredictionSchema.parse(req.body)

    const match = await findMatchById(matchId)
    if (!match) {
      console.log(`[Predictions POST] Match not found: ${matchId}`)
      return res.status(404).json({ error: "Match not found" })
    }

    if (isPredictionLocked(match.matchDate)) {
      return res
        .status(400)
        .json({ error: "Predictions are locked for this match" })
    }

    const validation = validatePrediction(body, match)
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error })
    }

    const prediction = await upsertPrediction(session.user.id, matchId, body)
    res.json(prediction)
  } catch (error) {
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json({ error: "Validation error", details: error.issues })
    }
    console.error("Error creating prediction:", error)
    res.status(500).json({ error: "Failed to create prediction" })
  }
})

predictionRouter.get("/", async (req: Request, res: Response) => {
  try {
    const session = await getSession(req)
    if (!session?.user) return res.status(401).json({ error: "Unauthorized" })

    const { id: matchId } = req.params
    console.log(`[Predictions GET] Fetching predictions for match: ${matchId}`)

    const match = await findMatchById(matchId)
    if (!match) {
      console.log(`[Predictions GET] Match not found: ${matchId}`)
      return res.status(404).json({ error: "Match not found" })
    }

    const result = await getMatchPredictions(session.user.id, matchId, match)
    res.json(result)
  } catch (error) {
    console.error("Error fetching predictions:", error)
    res.status(500).json({ error: "Failed to fetch predictions" })
  }
})
