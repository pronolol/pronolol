-- 20260905162700_add_issuer_to_account was written with a literal "\n", so the
-- whole file is a single SQL comment: Prisma marks it applied but the column is
-- never created. IF NOT EXISTS keeps this a no-op on databases where "issuer"
-- was already added by hand (production).
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "issuer" TEXT;
