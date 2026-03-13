import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { username } from "better-auth/plugins"
import { expo } from "@better-auth/expo"

import { prisma } from "@pronolol/database"

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  basePath: "/auth",
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    discord: {
      enabled: true,
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    },
  },
  trustedOrigins: [
    "pronolol://",
    "https://pronolol.fr",
    ...(process.env.NODE_ENV === "development"
      ? [
          "exp://",
          "exp://**",
          "exp://192.168.*.*:*/**",
          "http://localhost:5173",
        ]
      : []),
  ],
  advanced: {
    crossSubDomainCookies: {
      enabled: process.env.NODE_ENV === "production",
      domain: ".pronolol.fr",
    },
    useSecureCookies: process.env.NODE_ENV === "production",
    defaultCookieAttributes: {
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    },
  },
  plugins: [expo(), username()],
})
