import { Router, Request, Response } from "express"
import { auth } from "../lib/auth"
import { getUserPredictions } from "../services/prediction.service"
import {
  getUserPreferences,
  upsertUserPreferences,
} from "../services/preferences.service"
import { UpdateUserPreferencesSchema } from "../dto/preferences.dto"

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

usersRouter.get("/me/preferences", async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user) return res.status(401).json({ error: "Unauthorized" })
    const preferences = await getUserPreferences(session.user.id)
    res.json(preferences)
  } catch (error) {
    console.error("Error fetching user preferences:", error)
    res.status(500).json({ error: "Failed to fetch preferences" })
  }
})

usersRouter.put("/me/preferences", async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user) return res.status(401).json({ error: "Unauthorized" })
    const parsed = UpdateUserPreferencesSchema.safeParse(req.body)
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid body", details: parsed.error.format() })
    }
    const preferences = await upsertUserPreferences(
      session.user.id,
      parsed.data
    )
    res.json(preferences)
  } catch (error) {
    console.error("Error updating user preferences:", error)
    res.status(500).json({ error: "Failed to update preferences" })
  }
})
