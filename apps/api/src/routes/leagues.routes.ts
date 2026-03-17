import { Router, Request, Response } from "express"
import { getLeagues } from "../services/league.service"

export const leaguesRouter = Router()

leaguesRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const leagues = await getLeagues()
    res.json(leagues)
  } catch (error) {
    console.error("Error fetching leagues:", error)
    res.status(500).json({ error: "Failed to fetch leagues" })
  }
})
