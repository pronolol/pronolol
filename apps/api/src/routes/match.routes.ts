import { Router, Request, Response } from "express"
import { ZodError } from "zod"
import { GetMatchesQuerySchema } from "../dto/match.dto"
import { getMatches, getMatchById } from "../services/match.service"
import { predictionRouter } from "./prediction.routes"

export const matchRouter = Router()

matchRouter.use("/:id/predictions", predictionRouter)

matchRouter.get("/", async (req: Request, res: Response) => {
  console.log("[Matches GET] Fetching matches with query:", req.query)
  try {
    const query = GetMatchesQuerySchema.parse(req.query)
    const matches = await getMatches(query)
    res.json(matches)
  } catch (error) {
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json({ error: "Invalid query parameters", details: error.issues })
    }
    console.error("Error fetching matches:", error)
    res.status(500).json({ error: "Failed to fetch matches" })
  }
})

matchRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const match = await getMatchById(req.params.id)
    if (!match) return res.status(404).json({ error: "Match not found" })
    res.json(match)
  } catch (error) {
    console.error("Error fetching match:", error)
    res.status(500).json({ error: "Failed to fetch match" })
  }
})
