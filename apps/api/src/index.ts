import "dotenv/config"
import express, { Request, Response } from "express"
import swaggerUi from "swagger-ui-express"
import { prisma } from "@pronolol/database"
import { openApiDocument } from "./openapi"
import { toNodeHandler } from "better-auth/node"
import { auth } from "./lib/auth"
import cors from "cors"
import { matchRouter } from "./routes/match.routes"
import { rankingRouter } from "./routes/ranking.routes"

const app = express()
const port = Number(process.env.API_PORT) || 3000
const host = process.env.API_HOST || "0.0.0.0"

app.use(
  cors({
    origin: [
      "http://localhost:8081",
      "http://localhost:3000",
      "https://pronolol.fr",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
)

app.all("/auth/*splat", toNodeHandler(auth))
app.use(express.json())

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument))
app.get("/openapi.json", (_req: Request, res: Response) => {
  res.json(openApiDocument)
})
app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Welcome to the Pronolol API!" })
})

app.use("/matches", matchRouter)
app.use("/ranking", rankingRouter)

app.listen(port, host, () => {
  const baseUrl = process.env.BETTER_AUTH_URL || `http://${host}:${port}`
  const isBaseUrlConfigured = !!process.env.BETTER_AUTH_URL

  console.log(`\n🚀 Server started successfully!`)
  console.log(`   Environment: ${process.env.NODE_ENV || "development"}`)
  console.log(`   Listening on: http://${host}:${port}`)
  console.log(
    `   Base URL: ${baseUrl}${isBaseUrlConfigured ? " ✓" : " (default)"}`
  )
  console.log(`\n📚 Documentation:`)
  console.log(`   API Docs: ${baseUrl}/api-docs`)
  console.log(`   OpenAPI Spec: ${baseUrl}/openapi.json`)

  if (!isBaseUrlConfigured) {
    console.log(`\n💡 Tip: Configure BETTER_AUTH_URL in .env for mobile access`)
    console.log(`   Example: BETTER_AUTH_URL=http://YOUR_LOCAL_IP:${port}`)
  }
})

process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...")
  await prisma.$disconnect()
  process.exit(0)
})

process.on("SIGTERM", async () => {
  console.log("Shutting down gracefully...")
  await prisma.$disconnect()
  process.exit(0)
})
