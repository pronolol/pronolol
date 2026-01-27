import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import swaggerUi from "swagger-ui-express";
import { prisma } from "@pronolol/database";
import { GetMatchesQuerySchema } from "./dto/match.dto";
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
        const { id } = req.params;

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

app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
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
