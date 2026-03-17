import { http, HttpResponse } from "msw"

const API_URL = "http://localhost:3000"

export const handlers = [
  http.get(`${API_URL}/matches`, () => {
    return HttpResponse.json([
      {
        id: "match-1",
        matchDate: new Date().toISOString(),
        state: "upcoming",
        bestOf: 3,
        teamAScore: null,
        teamBScore: null,
        teamA: {
          id: "team-a",
          name: "Team Alpha",
          tag: "TLA",
          logoUrl: "https://example.com/tla.png",
        },
        teamB: {
          id: "team-b",
          name: "Team Beta",
          tag: "TLB",
          logoUrl: "https://example.com/tlb.png",
        },
        tournament: {
          id: "tournament-1",
          name: "Spring Split",
          league: {
            id: "league-1",
            name: "LEC",
          },
        },
        myPrediction: null,
      },
    ])
  }),

  http.get(`${API_URL}/matches/:id`, ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      matchDate: new Date().toISOString(),
      state: "upcoming",
      bestOf: 3,
      teamAScore: null,
      teamBScore: null,
      teamA: {
        id: "team-a",
        name: "Team Alpha",
        tag: "TLA",
        logoUrl: "https://example.com/tla.png",
      },
      teamB: {
        id: "team-b",
        name: "Team Beta",
        tag: "TLB",
        logoUrl: "https://example.com/tlb.png",
      },
      tournament: {
        id: "tournament-1",
        name: "Spring Split",
        league: { id: "league-1", name: "LEC" },
      },
      myPrediction: null,
    })
  }),

  http.get(`${API_URL}/matches/:id/predictions`, () => {
    return HttpResponse.json({
      myPrediction: null,
      predictions: [],
    })
  }),

  http.post(
    `${API_URL}/matches/:id/predictions`,
    async ({ request, params }) => {
      const body = (await request.json()) as {
        teamId: string
        predictedTeamAScore: number
        predictedTeamBScore: number
      }
      return HttpResponse.json({
        id: "pred-1",
        userId: "user-1",
        matchId: params.id,
        teamId: body.teamId,
        predictedTeamAScore: body.predictedTeamAScore,
        predictedTeamBScore: body.predictedTeamBScore,
        isCorrect: null,
        isExact: null,
        points: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        team: {
          id: body.teamId,
          name: "Team Alpha",
          tag: "TLA",
          logoUrl: "https://example.com/tla.png",
        },
      })
    }
  ),

  http.get(`${API_URL}/leagues`, () => {
    return HttpResponse.json([
      {
        id: "league-1",
        name: "LEC",
        imageUrl: "https://example.com/lec.png",
        tournaments: [
          { id: "tournament-1", name: "Spring Split" },
          { id: "tournament-2", name: "Summer Split" },
        ],
      },
      {
        id: "league-2",
        name: "LCK",
        imageUrl: "https://example.com/lck.png",
        tournaments: [{ id: "tournament-3", name: "Spring Split" }],
      },
    ])
  }),

  http.get(`${API_URL}/users/me/preferences`, () => {
    return HttpResponse.json({ leagueId: null, tournamentId: null })
  }),

  http.put(`${API_URL}/users/me/preferences`, async ({ request }) => {
    const body = (await request.json()) as {
      leagueId?: string | null
      tournamentId?: string | null
    }
    return HttpResponse.json({
      leagueId: body.leagueId ?? null,
      tournamentId: body.tournamentId ?? null,
    })
  }),

  http.get(`${API_URL}/ranking`, () => {
    return HttpResponse.json({
      rankings: [
        {
          userId: "user-1",
          rank: 1,
          displayName: "Alice",
          image: null,
          totalPoints: 150,
          totalPredictions: 20,
          correctPredictions: 15,
          exactPredictions: 5,
          correctnessPercentage: 75,
        },
        {
          userId: "user-2",
          rank: 2,
          displayName: "Bob",
          image: null,
          totalPoints: 100,
          totalPredictions: 18,
          correctPredictions: 10,
          exactPredictions: 3,
          correctnessPercentage: 55,
        },
      ],
    })
  }),
]
