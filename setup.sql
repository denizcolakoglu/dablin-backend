-- ============================================================
--  ShopifyDescribe — Database Setup
--  Run this once on your Railway PostgreSQL database
--  Command: psql $DATABASE_URL -f db/setup.sql
-- ============================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id    VARCHAR(255) UNIQUE NOT NULL,
  email       VARCHAR(255),
  credits     INTEGER NOT NULL DEFAULT 3,
  shopify_token  VARCHAR(500),
  shopify_domain VARCHAR(255),
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- Generations history table
CREATE TABLE IF NOT EXISTS generations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id    VARCHAR(255) NOT NULL REFERENCES users(clerk_id) ON DELETE CASCADE,
  input_json  JSONB NOT NULL,
  output_json JSONB NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id       VARCHAR(255) NOT NULL REFERENCES users(clerk_id) ON DELETE CASCADE,
  credits_added  INTEGER NOT NULL,
  amount_cents   INTEGER NOT NULL,
  stripe_session VARCHAR(500) UNIQUE NOT NULL,
  created_at     TIMESTAMP DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_users_clerk_id       ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_generations_clerk_id ON generations(clerk_id);
CREATE INDEX IF NOT EXISTS idx_generations_created  ON generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchases_clerk_id   ON purchases(clerk_id);

-- Confirm
SELECT 'Database setup complete ✅' AS status;
