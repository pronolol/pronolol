-- AlterTable: add Discord notification fields to user_preferences
ALTER TABLE "user_preferences"
  ADD COLUMN "discordNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "discordWelcomeNotified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "lastNotificationSentAt" TIMESTAMPTZ;
