import { prisma } from "@pronolol/database"

export const getLeagues = async () => {
  return prisma.league.findMany({
    select: {
      id: true,
      name: true,
      imageUrl: true,
      tournaments: {
        select: { id: true, name: true },
        orderBy: { startDate: "desc" },
      },
    },
    orderBy: { name: "asc" },
  })
}
