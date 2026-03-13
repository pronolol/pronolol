import { Router, Request, Response } from "express"
import { auth } from "../lib/auth"
import { getUserPredictions } from "../services/prediction.service"

export const usersRouter = Router()

usersRouter.get("/me/predictions", async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user) return res.status(401).json({ error: "Unauthorized" })
    const predictions = await getUserPredictions(session.user.id)
    res.json(predictions)
  } catch (error) {
    console.error("Error fetching user predictions:", error)
    res.status(500).json({ error: "Failed to fetch predictions" })
  }
})
