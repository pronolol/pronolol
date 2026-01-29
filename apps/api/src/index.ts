import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import swaggerUi from "swagger-ui-express";
import { prisma } from "@pronolol/database";
import { GetMatchesQuerySchema } from "./dto/match.dto";
import { CreatePredictionSchema } from "./dto/prediction.dto";
import { ZodError } from "zod";
import { openApiDocument } from "./openapi";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import cors from "cors";

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;
const host = process.env.HOST || "0.0.0.0";


app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}))

app.use("/api/auth", toNodeHandler(auth));

// Auth middleware helper
const getSession = async (req: Request) => {
    const session = await auth.api.getSession({
        headers: req.headers as any,
    });
    return session;
};

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
app.get("/openapi.json", (req: Request, res: Response) => {
    res.json(openApiDocument);
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ZodError) {
        return res.status(400).json({
            error: "Validation error",
            details: err.issues,
        });
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
});

app.get("/", (req: Request, res: Response) => {
    res.json({ message: "Welcome to the Pronolol API!" });
});

// GET /matches - Get all matches with filters
app.get("/matches", async (req: Request, res: Response) => {
    try {
        const query = GetMatchesQuerySchema.parse(req.query);

        const where: any = {};

        if (query.tournamentId) {
            where.tournamentId = query.tournamentId;
        }

        if (query.state) {
            const now = new Date();
            switch (query.state) {
                case "upcoming":
                    where.matchDate = { gte: now };
                    where.state = { not: "completed" };
                    break;
                case "completed":
                    where.state = "completed";
                    break;
                case "inProgress":
                    where.matchDate = { lte: now };
                    where.state = { not: "completed" };
                    break;
            }
        }

        const matches = await prisma.match.findMany({
            where,
            include: {
                teamA: {
                    select: {
                        id: true,
                        name: true,
                        tag: true,
                        logoUrl: true,
                    },
                },
                teamB: {
                    select: {
                        id: true,
                        name: true,
                        tag: true,
                        logoUrl: true,
                    },
                },
                winner: {
                    select: {
                        id: true,
                        name: true,
                        tag: true,
                        logoUrl: true,
                    },
                },
                tournament: {
                    select: {
                        id: true,
                        name: true,
                        league: {
                            select: {
                                id: true,
                                name: true,
                                imageUrl: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                matchDate: query.state === "completed" ? "desc" : "asc",
            },
            ...(query.limit && { take: query.limit }),
            ...(query.offset && { skip: query.offset }),
        });

        res.json(matches);
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                error: "Invalid query parameters",
                details: error.issues,
            });
        }
        console.error("Error fetching matches:", error);
        res.status(500).json({ error: "Failed to fetch matches" });
    }
});

app.get("/matches/:id", async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (!id || typeof id !== "string") {
            return res.status(400).json({ error: "Invalid match ID" });
        }

        const match = await prisma.match.findUnique({
            where: { id },
            include: {
                teamA: true,
                teamB: true,
                winner: true,
                tournament: {
                    include: {
                        league: true,
                    },
                },
                predictions: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        if (!match) {
            return res.status(404).json({ error: "Match not found" });
        }

        res.json(match);
    } catch (error) {
        console.error("Error fetching match:", error);
        res.status(500).json({ error: "Failed to fetch match" });
    }
});

// POST /matches/:id/predictions - Create or update a prediction
app.post("/matches/:id/predictions", async (req: Request, res: Response) => {
    try {
        const session = await getSession(req);
        if (!session?.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const matchId = req.params.id;
        if (!matchId || typeof matchId !== "string") {
            return res.status(400).json({ error: "Invalid match ID" });
        }

        console.log(`[Predictions POST] Creating prediction for match: ${matchId}`);

        const body = CreatePredictionSchema.parse(req.body);

        // Get the match to validate
        const match = await prisma.match.findUnique({
            where: { id: matchId },
            include: { teamA: true, teamB: true },
        });

        if (!match) {
            console.log(`[Predictions POST] Match not found: ${matchId}`);
            return res.status(404).json({ error: "Match not found" });
        }

        console.log(`[Predictions POST] Match found, validating prediction`);

        // Check if predictions are still allowed (5 min after match start)
        const lockTime = new Date(match.matchDate.getTime() + 5 * 60 * 1000);
        if (new Date() > lockTime) {
            return res.status(400).json({ error: "Predictions are locked for this match" });
        }

        // Validate that teamId is one of the match teams
        if (body.teamId !== match.teamAId && body.teamId !== match.teamBId) {
            return res.status(400).json({ error: "Invalid team selection" });
        }

        // Validate score based on bestOf
        const maxScore = Math.ceil(match.bestOf / 2);
        const winnerScore = Math.max(body.predictedTeamAScore, body.predictedTeamBScore);
        const loserScore = Math.min(body.predictedTeamAScore, body.predictedTeamBScore);

        if (winnerScore !== maxScore) {
            return res.status(400).json({ 
                error: `Winner must have exactly ${maxScore} wins for a best of ${match.bestOf}` 
            });
        }

        if (loserScore >= maxScore) {
            return res.status(400).json({ error: "Invalid score - loser cannot have winning score" });
        }

        // Validate that the predicted winner matches the teamId
        const predictedWinnerId = body.predictedTeamAScore > body.predictedTeamBScore 
            ? match.teamAId 
            : match.teamBId;
        
        if (predictedWinnerId !== body.teamId) {
            return res.status(400).json({ error: "Selected team must match the predicted winner based on scores" });
        }

        // Upsert prediction
        const prediction = await prisma.prediction.upsert({
            where: {
                userId_matchId: {
                    userId: session.user.id,
                    matchId,
                },
            },
            update: {
                teamId: body.teamId,
                predictedTeamAScore: body.predictedTeamAScore,
                predictedTeamBScore: body.predictedTeamBScore,
            },
            create: {
                userId: session.user.id,
                matchId,
                teamId: body.teamId,
                predictedTeamAScore: body.predictedTeamAScore,
                predictedTeamBScore: body.predictedTeamBScore,
            },
            include: {
                team: true,
            },
        });

        res.json(prediction);
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                error: "Validation error",
                details: error.issues,
            });
        }
        console.error("Error creating prediction:", error);
        res.status(500).json({ error: "Failed to create prediction" });
    }
});

// GET /matches/:id/predictions - Get predictions for a match
app.get("/matches/:id/predictions", async (req: Request, res: Response) => {
    try {
        const session = await getSession(req);
        if (!session?.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const matchId = req.params.id;
        if (!matchId || typeof matchId !== "string") {
            return res.status(400).json({ error: "Invalid match ID" });
        }

        console.log(`[Predictions GET] Fetching predictions for match: ${matchId}`);

        // Verify match exists
        const match = await prisma.match.findUnique({
            where: { id: matchId },
        });

        if (!match) {
            console.log(`[Predictions GET] Match not found: ${matchId}`);
            return res.status(404).json({ error: "Match not found" });
        }

        console.log(`[Predictions GET] Match found, fetching predictions`);

        // Get user's prediction
        const myPrediction = await prisma.prediction.findUnique({
            where: {
                userId_matchId: {
                    userId: session.user.id,
                    matchId,
                },
            },
            include: {
                team: true,
            },
        });

        // Get all predictions only if user has predicted
        let allPredictions = null;
        if (myPrediction) {
            allPredictions = await prisma.prediction.findMany({
                where: { matchId },
                include: {
                    user: {
                        select: {
                            id: true,
                            displayUsername: true,
                            username: true,
                            name: true,
                            image: true,
                        },
                    },
                    team: {
                        select: {
                            id: true,
                            name: true,
                            tag: true,
                            logoUrl: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
        }

        res.json({
            myPrediction,
            predictions: allPredictions,
        });
    } catch (error) {
        console.error("Error fetching predictions:", error);
        res.status(500).json({ error: "Failed to fetch predictions" });
    }
});

app.listen(Number(port), host, () => {
    console.log(`Server listening on http://${host}:${port}`);
    console.log(`API Documentation: http://localhost:${port}/api-docs`);
    console.log(`OpenAPI Spec: http://localhost:${port}/openapi.json`);
    console.log(`Mobile access: http://192.168.1.116:${port}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
    console.log("Shutting down gracefully...");
    await prisma.$disconnect();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    console.log("Shutting down gracefully...");
    await prisma.$disconnect();
    process.exit(0);
});
