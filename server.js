// ============================================================
//  ShopifyDescribe — Express Backend
//  File: server.js (root of your project)
//
//  Setup:
//    npm install express cors dotenv helmet express-rate-limit @clerk/express pg stripe
//    node server.js
// ============================================================

require("dotenv").config();
const express      = require("express");
const cors         = require("cors");
const helmet       = require("helmet");
const rateLimit    = require("express-rate-limit");
const { requireAuth, clerkMiddleware, getAuth } = require("@clerk/express");
const stripe       = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { Pool }     = require("pg");

const { generateWithCategory } = require("./lib/categories");

const app  = express();app.set('trust proxy', 1);
app.use(clerkMiddleware());
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ── MIDDLEWARE ────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ 
  origin: [
    "http://localhost:5173",
    "https://dablin.vercel.app",
    "https://dablin-backend-production.up.railway.app",
    "https://dablin.co",
    "https://www.dablin.co"
  ]
}));

// Raw body needed for Stripe webhooks — must come BEFORE express.json()
app.use("/api/webhook/stripe", express.raw({ type: "application/json" }));
app.use(express.json());

// Rate limiter on generate endpoint
const generateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,             // max 10 requests per minute per IP
  message: { error: "Too many requests, slow down." }
});

// ── DB HELPERS ────────────────────────────────────────────────
async function getOrCreateUser(clerkId, email) {
  const existing = await pool.query(
    "SELECT * FROM users WHERE clerk_id = $1", [clerkId]
  );
  if (existing.rows[0]) return existing.rows[0];

  const created = await pool.query(
    "INSERT INTO users (clerk_id, email, credits) VALUES ($1, $2, 3) RETURNING *",
    [clerkId, email]
  );
  return created.rows[0]; // New users get 3 free credits
}

// ── ROUTES ───────────────────────────────────────────────────

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── GET /api/credits ─────────────────────────────────────────
// Returns current credit balance for logged-in user
app.get("/api/credits", requireAuth(), async (req, res) => {
  try {
    const clerkId = req.auth?.userId;
console.log("Auth object:", JSON.stringify(req.auth));
if (!clerkId) {
  return res.status(401).json({ error: "Unauthorized - no userId" });
}
const authObj = getAuth(req);
console.log("AUTH DEBUG getAuth:", JSON.stringify(authObj));
req.auth = authObj;
    const user = await getOrCreateUser(
  clerkId,
  req.auth.sessionClaims?.email
);
    res.json({ credits: user.credits });
  } catch (err) {
    console.error("GET /api/credits error:", err);
    res.status(500).json({ error: "Failed to fetch credits" });
  }
});

// ── POST /api/generate ───────────────────────────────────────
// Generate a single product description, deduct 1 credit
app.post("/api/generate", requireAuth(), generateLimiter, async (req, res) => {
  const { productName, category, features, targetAudience, tone, brandName } = req.body;

  if (!productName || !category || !features) {
    return res.status(400).json({ error: "productName, category, and features are required" });
  }

  try {
    // 1. Get user + check credits
    const authObj = getAuth(req);
console.log("AUTH DEBUG getAuth:", JSON.stringify(authObj));
req.auth = authObj;
    const user = await getOrCreateUser(
      req.auth?.userId,
      req.auth.sessionClaims?.email
    );

    if (user.credits < 1) {
      return res.status(402).json({
        error: "Insufficient credits",
        credits: 0,
        upgradeUrl: "/pricing"
      });
    }

    // 2. Generate description
    const result = await generateWithCategory({
      productName, category, features,
      targetAudience, tone: tone || "professional", brandName
    });

    // 3. Deduct credit + save to history (atomic)
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        "UPDATE users SET credits = credits - 1 WHERE clerk_id = $1",
        [req.auth.userId]
      );
      await client.query(
        `INSERT INTO generations (clerk_id, input_json, output_json)
         VALUES ($1, $2, $3)`,
        [req.auth?.userId, JSON.stringify(req.body), JSON.stringify(result)]
      );
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }

    // 4. Return result with updated balance
    const updated = await pool.query(
      "SELECT credits FROM users WHERE clerk_id = $1", [req.auth.userId]
    );

    res.json({ ...result, creditsRemaining: updated.rows[0].credits });

  } catch (err) {
    console.error("POST /api/generate error:", err);
    res.status(500).json({ error: "Generation failed. Please try again." });
  }
});

// ── POST /api/generate/bulk ──────────────────────────────────
// Generate descriptions for multiple products (CSV upload)
app.post("/api/generate/bulk", requireAuth(), async (req, res) => {
  const { products } = req.body; // Array of product objects

  if (!products || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ error: "products array is required" });
  }

  if (products.length > 100) {
    return res.status(400).json({ error: "Maximum 100 products per bulk request" });
  }

  try {
    const authObj = getAuth(req);
    console.log("AUTH DEBUG getAuth:", JSON.stringify(authObj));
    req.auth = authObj;
    const user = await getOrCreateUser(
      req.auth?.userId,
      req.auth.sessionClaims?.email
    );

    if (user.credits < products.length) {
      return res.status(402).json({
        error: `Not enough credits. Need ${products.length}, have ${user.credits}.`,
        creditsNeeded: products.length,
        creditsAvailable: user.credits,
        upgradeUrl: "/pricing"
      });
    }

    const results = [];
    let successCount = 0;

    for (let i = 0; i < products.length; i++) {
      try {
        const result = await generateWithCategory({
          ...products[i],
          tone: products[i].tone || "professional"
        });
        results.push({ index: i, status: "success", data: result });
        successCount++;
      } catch (err) {
        results.push({ index: i, status: "error", error: err.message });
      }

      // Small delay to avoid rate limits
      if (i < products.length - 1) {
        await new Promise(r => setTimeout(r, 300));
      }
    }

    // Deduct only for successful generations
    if (successCount > 0) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query(
          "UPDATE users SET credits = credits - $1 WHERE clerk_id = $2",
          [successCount, req.auth.userId]
        );
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }
    }

    const updated = await pool.query(
      "SELECT credits FROM users WHERE clerk_id = $1", [req.auth.userId]
    );

    res.json({
      results,
      summary: {
        total: products.length,
        succeeded: successCount,
        failed: products.length - successCount,
        creditsUsed: successCount,
        creditsRemaining: updated.rows[0].credits,
      }
    });

  } catch (err) {
    console.error("POST /api/generate/bulk error:", err);
    res.status(500).json({ error: "Bulk generation failed. Please try again." });
  }
});

// ── GET /api/history ─────────────────────────────────────────
// Returns past generations for the logged-in user
app.get("/api/history", requireAuth(), async (req, res) => {
  try {const authObj = getAuth(req);
    req.auth = authObj;
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT id, input_json, output_json, created_at
       FROM generations
       WHERE clerk_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.auth?.userId, limit, offset]
    );

    const count = await pool.query(
      "SELECT COUNT(*) FROM generations WHERE clerk_id = $1",
      [req.auth.userId]
    );

    res.json({
      items: result.rows,
      total: parseInt(count.rows[0].count),
      page,
      pages: Math.ceil(count.rows[0].count / limit)
    });

  } catch (err) {
    console.error("GET /api/history error:", err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// ── POST /api/checkout ───────────────────────────────────────
// Creates a Stripe Checkout session for a credit package
const CREDIT_PACKAGES = {
  starter: { credits: 20,  priceUsd: 300,  label: "Starter — 20 credits" },
  pro:     { credits: 100, priceUsd: 1200, label: "Pro — 100 credits"    },
  studio:  { credits: 500, priceUsd: 4900, label: "Studio — 500 credits" },
};

app.post("/api/checkout", requireAuth(), async (req, res) => {
  const { packageId } = req.body;
  const pkg = CREDIT_PACKAGES[packageId];

  if (!pkg) {
    return res.status(400).json({ error: "Invalid package. Choose: starter, pro, or studio" });
  }

  try {
    const authObj = getAuth(req);
    console.log("AUTH DEBUG getAuth:", JSON.stringify(authObj));
    req.auth = authObj;
    const user = await getOrCreateUser(
      req.auth?.userId,
      req.auth.sessionClaims?.email
    );

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: pkg.label },
          unit_amount: pkg.priceUsd,
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/dashboard?payment=success&credits=${pkg.credits}`,
      cancel_url:  `${process.env.FRONTEND_URL}/pricing?payment=cancelled`,
      metadata: {
        clerk_id:  req.auth?.userId,
        credits:   pkg.credits.toString(),
        packageId,
      },
      ...(user.email ? { customer_email: user.email } : {}),
    });

    res.json({ checkoutUrl: session.url });

  } catch (err) {
    console.error("POST /api/checkout error:", err);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

// ── POST /api/webhook/stripe ─────────────────────────────────
// Listens for Stripe payment confirmation → adds credits
app.post("/api/webhook/stripe", async (req, res) => {
  const sig    = req.headers["stripe-signature"];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, secret);
  } catch (err) {
    console.error("Stripe webhook signature error:", err.message);
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  if (event.type === "checkout.session.completed") {
    const session  = event.data.object;
    const clerkId  = session.metadata.clerk_id;
    const credits  = parseInt(session.metadata.credits);

    try {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query(
          "UPDATE users SET credits = credits + $1 WHERE clerk_id = $2",
          [credits, clerkId]
        );
        await client.query(
          `INSERT INTO purchases (clerk_id, credits_added, amount_cents, stripe_session)
           VALUES ($1, $2, $3, $4)`,
          [clerkId, credits, session.amount_total, session.id]
        );
        await client.query("COMMIT");
        console.log(`Added ${credits} credits to user ${clerkId}`);
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error("Webhook DB error:", err);
      return res.status(500).json({ error: "Failed to add credits" });
    }
  }

  res.json({ received: true });
});

// ── START SERVER ─────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`ShopifyDescribe API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

