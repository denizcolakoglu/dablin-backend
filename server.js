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
const Anthropic = require("@anthropic-ai/sdk");
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const { GoogleGenerativeAI } = require("@google/generative-ai");
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ── BREVO EMAIL ───────────────────────────────────────────────
const FROM_EMAIL = { email: "hello@dablin.co", name: "Dablin" };

async function sendEmail(toEmail, subject, htmlContent) {
  if (!process.env.BREVO_API_KEY || !toEmail) return;
  try {
    const fetch = (await import("node-fetch")).default;
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: FROM_EMAIL,
        to: [{ email: toEmail }],
        subject,
        htmlContent,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.warn("[email] Brevo error:", err);
    } else {
      console.log("[email] Sent to", toEmail, "-", subject);
    }
  } catch (err) {
    console.warn("[email] Send failed:", err.message);
  }
}

async function sendWelcomeEmail(toEmail) {
  await sendEmail(toEmail, "Welcome to Dablin — your AI visibility toolkit is ready", `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f7fbf7;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7fbf7;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;border:1px solid #d4e8d6;max-width:600px;width:100%;">
        <tr><td style="background:#0f1a10;padding:28px 40px;text-align:center;">
          <img src="https://dablin.co/logo.svg" alt="Dablin" height="40" style="display:block;margin:0 auto;" />
        </td></tr>
        <tr><td style="padding:40px 40px 32px;">
          <h1 style="font-size:24px;font-weight:800;color:#0f1a10;margin:0 0 12px;letter-spacing:-0.5px;">Welcome to Dablin 👋</h1>
          <p style="font-size:15px;color:#5a7a5e;line-height:1.7;margin:0 0 28px;">Your account is ready. Here's what you can do with Dablin right now:</p>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr><td style="padding:16px;background:#f7fbf7;border:1px solid #d4e8d6;border-radius:10px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="32" style="font-size:20px;vertical-align:top;padding-top:2px;">◎</td>
                  <td>
                    <strong style="font-size:14px;color:#0f1a10;display:block;margin-bottom:4px;">AI Visibility Check</strong>
                    <span style="font-size:13px;color:#5a7a5e;line-height:1.5;">See if ChatGPT, Gemini, and Claude mention your brand when buyers search for your product category.</span>
                  </td>
                </tr>
              </table>
            </td></tr>
            <tr><td style="height:8px;"></td></tr>
            <tr><td style="padding:16px;background:#f7fbf7;border:1px solid #d4e8d6;border-radius:10px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="32" style="font-size:20px;vertical-align:top;padding-top:2px;">⌕</td>
                  <td>
                    <strong style="font-size:14px;color:#0f1a10;display:block;margin-bottom:4px;">AI Visibility Audit</strong>
                    <span style="font-size:13px;color:#5a7a5e;line-height:1.5;">12 technical checks to find why AI engines can't find or understand your pages — with ready-to-copy fixes.</span>
                  </td>
                </tr>
              </table>
            </td></tr>
            <tr><td style="height:8px;"></td></tr>
            <tr><td style="padding:16px;background:#f7fbf7;border:1px solid #d4e8d6;border-radius:10px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="32" style="font-size:20px;vertical-align:top;padding-top:2px;">✓</td>
                  <td>
                    <strong style="font-size:14px;color:#0f1a10;display:block;margin-bottom:4px;">SEO Audit</strong>
                    <span style="font-size:13px;color:#5a7a5e;line-height:1.5;">13-point SEO check on any product page URL with AI-generated fixes for every issue.</span>
                  </td>
                </tr>
              </table>
            </td></tr>
            <tr><td style="height:8px;"></td></tr>
            <tr><td style="padding:16px;background:#f7fbf7;border:1px solid #d4e8d6;border-radius:10px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="32" style="font-size:20px;vertical-align:top;padding-top:2px;">✦</td>
                  <td>
                    <strong style="font-size:14px;color:#0f1a10;display:block;margin-bottom:4px;">Generate Product Description</strong>
                    <span style="font-size:13px;color:#5a7a5e;line-height:1.5;">SEO-ready title, meta description, feature bullets and full HTML in 30 seconds.</span>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>

          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="https://dablin.co" style="display:inline-block;background:#2d7a3a;color:white;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:15px;font-weight:700;letter-spacing:-0.2px;">Get started →</a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="background:#f7fbf7;border-top:1px solid #d4e8d6;padding:20px 40px;text-align:center;">
          <p style="font-size:12px;color:#9ab09c;margin:0;">© 2026 Dablin · <a href="https://dablin.co" style="color:#9ab09c;">dablin.co</a> · Pay per use, no subscription</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`);
}

async function sendReengagementEmail(toEmail) {
  await sendEmail(toEmail, "Does ChatGPT mention your brand? Check in 20 seconds", `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f7fbf7;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7fbf7;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;border:1px solid #d4e8d6;max-width:600px;width:100%;">
        <tr><td style="background:#0f1a10;padding:28px 40px;text-align:center;">
          <img src="https://dablin.co/logo.svg" alt="Dablin" height="40" style="display:block;margin:0 auto;" />
        </td></tr>
        <tr><td style="padding:40px 40px 32px;">
          <h1 style="font-size:24px;font-weight:800;color:#0f1a10;margin:0 0 12px;letter-spacing:-0.5px;">Your credits are still waiting</h1>
          <p style="font-size:15px;color:#5a7a5e;line-height:1.7;margin:0 0 28px;">You signed up for Dablin but haven't run your first check yet. Here's what's available:</p>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <!-- AI Visibility Check -->
            <tr><td style="padding:16px;background:#e8f5ea;border:1px solid #c8e6cb;border-radius:10px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="32" style="font-size:20px;vertical-align:top;padding-top:2px;">◎</td>
                  <td>
                    <strong style="font-size:14px;color:#0f1a10;display:block;margin-bottom:4px;">AI Visibility Check</strong>
                    <span style="font-size:13px;color:#5a7a5e;line-height:1.5;">Find out if ChatGPT, Gemini, and Claude mention your brand — and which competitors they recommend instead. Takes about 20 seconds.</span>
                  </td>
                </tr>
              </table>
            </td></tr>
            <tr><td style="height:8px;"></td></tr>
            <!-- AI Visibility Audit -->
            <tr><td style="padding:16px;background:#f7fbf7;border:1px solid #d4e8d6;border-radius:10px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="32" style="font-size:20px;vertical-align:top;padding-top:2px;">⌕</td>
                  <td>
                    <strong style="font-size:14px;color:#0f1a10;display:block;margin-bottom:4px;">AI Visibility Audit</strong>
                    <span style="font-size:13px;color:#5a7a5e;line-height:1.5;">12 technical checks to find why AI engines can't find your pages. Every failed check comes with a ready-to-copy fix.</span>
                  </td>
                </tr>
              </table>
            </td></tr>
            <tr><td style="height:8px;"></td></tr>
            <!-- SEO Audit -->
            <tr><td style="padding:16px;background:#f7fbf7;border:1px solid #d4e8d6;border-radius:10px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="32" style="font-size:20px;vertical-align:top;padding-top:2px;">✓</td>
                  <td>
                    <strong style="font-size:14px;color:#0f1a10;display:block;margin-bottom:4px;">SEO Audit</strong>
                    <span style="font-size:13px;color:#5a7a5e;line-height:1.5;">13-point SEO check on any product page URL. AI-generated fixes for every issue.</span>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>

          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="https://dablin.co" style="display:inline-block;background:#2d7a3a;color:white;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:15px;font-weight:700;letter-spacing:-0.2px;">Start your first check →</a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="background:#f7fbf7;border-top:1px solid #d4e8d6;padding:20px 40px;text-align:center;">
          <p style="font-size:12px;color:#9ab09c;margin:0;">© 2026 Dablin · <a href="https://dablin.co" style="color:#9ab09c;">dablin.co</a> · You're receiving this because you signed up at dablin.co</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`);
}

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
  // Ensure balance column exists
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS balance DECIMAL(10,4) DEFAULT 0`);
  const existing = await pool.query(
    "SELECT * FROM users WHERE clerk_id = $1", [clerkId]
  );
  if (existing.rows[0]) return existing.rows[0];

  const created = await pool.query(
    "INSERT INTO users (clerk_id, email, credits, balance) VALUES ($1, $2, 0, 0.50) RETURNING *",
    [clerkId, email]
  );
  // Send welcome email to new users
  if (email) sendWelcomeEmail(email).catch(() => {});
  return created.rows[0];
}

// ── ROUTES ───────────────────────────────────────────────────

// ── POST /api/sync-email ─────────────────────────────────────
// Called by frontend on login to store user email
app.post("/api/sync-email", requireAuth(), async (req, res) => {
  try {
    const authObj = getAuth(req); req.auth = authObj;
    const { email } = req.body;
    if (!email || !req.auth?.userId) return res.json({ ok: false });

    // Check if user already has an email
    const existing = await pool.query(
      `SELECT email, created_at FROM users WHERE clerk_id = $1`,
      [req.auth.userId]
    );

    const hadEmail = existing.rows[0]?.email;
    const createdAt = existing.rows[0]?.created_at;
    const isNewUser = createdAt && (Date.now() - new Date(createdAt).getTime()) < 5 * 60 * 1000; // within 5 min

    // Update email
    const result = await pool.query(
      `UPDATE users SET email = $1 WHERE clerk_id = $2`,
      [email, req.auth.userId]
    );

    // If no rows updated, user doesn't exist yet — create them
    if (result.rowCount === 0) {
      await pool.query(
        `INSERT INTO users (clerk_id, email, credits) VALUES ($1, $2, 7) ON CONFLICT (clerk_id) DO UPDATE SET email = $2`,
        [req.auth.userId, email]
      );
      // New user — send welcome email
      sendWelcomeEmail(email).catch(() => {});
    } else if (!hadEmail && isNewUser) {
      // Existing user just got email for first time within 5 min of signup
      sendWelcomeEmail(email).catch(() => {});
    }

    console.log("[sync-email] updated email for", req.auth.userId, email);
    res.json({ ok: true });
  } catch (err) {
    console.error("[sync-email] error:", err.message);
    res.json({ ok: false });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── GET /api/credits ─────────────────────────────────────────
// Returns current credit balance for logged-in user
app.get("/api/credits", requireAuth(), async (req, res) => {
  try {
    const authObj = getAuth(req);
    req.auth = authObj;
    const clerkId = req.auth?.userId;
    if (!clerkId) {
      return res.status(401).json({ error: "Unauthorized - no userId" });
    }
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
req.auth = authObj;
    const user = await getOrCreateUser(
      req.auth?.userId,
      req.auth.sessionClaims?.email
    );

    if (parseFloat(user.balance || 0) < 0.05) {
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
        "UPDATE users SET balance = balance - 0.05 WHERE clerk_id = $1",
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

// ── PRICING CONFIG ────────────────────────────────────────────
// Cost in USD per feature (API cost × 25)
const FEATURE_PRICES = {
  visibility_check: 0.35,  // AI Visibility Check
  ai_audit:         0.20,  // AI Visibility Audit
  seo_audit:        0.10,  // SEO Audit
  generate:         0.05,  // Generate Description
};

// ── GET /api/balance ─────────────────────────────────────────
app.get("/api/balance", requireAuth(), async (req, res) => {
  try {
    const authObj = getAuth(req); req.auth = authObj;
    const user = await getOrCreateUser(req.auth?.userId, req.auth.sessionClaims?.email);
    // Ensure balance column exists
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS balance DECIMAL(10,4) DEFAULT 0`);
    const result = await pool.query(`SELECT balance FROM users WHERE clerk_id = $1`, [req.auth?.userId]);
    res.json({ balance: parseFloat(result.rows[0]?.balance || 0).toFixed(4) });
  } catch (err) {
    console.error("GET /api/balance error:", err);
    res.status(500).json({ error: "Failed to fetch balance" });
  }
});

// ── GET /api/prices ──────────────────────────────────────────
app.get("/api/prices", (req, res) => {
  res.json(FEATURE_PRICES);
});

// ── POST /api/checkout ───────────────────────────────────────
// Creates a Stripe Checkout session for a balance top-up ($3-$50)
app.post("/api/checkout", requireAuth(), async (req, res) => {
  const { amount } = req.body; // amount in USD
  const amountNum = parseFloat(amount);

  if (!amountNum || amountNum < 3 || amountNum > 50) {
    return res.status(400).json({ error: "Amount must be between $3 and $50" });
  }

  const amountCents = Math.round(amountNum * 100);

  try {
    const authObj = getAuth(req); req.auth = authObj;
    const user = await getOrCreateUser(req.auth?.userId, req.auth.sessionClaims?.email);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: `Dablin Balance — $${amountNum.toFixed(2)}` },
          unit_amount: amountCents,
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/dashboard/credits?payment=success&amount=${amountNum}`,
      cancel_url:  `${process.env.FRONTEND_URL}/dashboard/credits`,
      metadata: {
        clerk_id: req.auth?.userId,
        amount_usd: amountNum.toString(),
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
    const session   = event.data.object;
    const clerkId   = session.metadata.clerk_id;
    const amountUsd = parseFloat(session.metadata.amount_usd || 0);

    try {
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS balance DECIMAL(10,4) DEFAULT 0`);
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query(
          "UPDATE users SET balance = balance + $1 WHERE clerk_id = $2",
          [amountUsd, clerkId]
        );
        await client.query(
          `INSERT INTO purchases (clerk_id, credits_added, amount_cents, stripe_session)
           VALUES ($1, $2, $3, $4)`,
          [clerkId, 0, session.amount_total, session.id]
        );
        await client.query("COMMIT");
        console.log(`Added $${amountUsd} balance to user ${clerkId}`);
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error("Webhook DB error:", err);
      return res.status(500).json({ error: "Failed to add balance" });
    }
  }

  res.json({ received: true });
});

// ── GET /api/test-fix ─────────────────────────────────────────
// Temporary debug endpoint — tests Claude fix generation
app.get("/api/test-fix", async (req, res) => {
  try {
    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 100,
      messages: [{ role: "user", content: "Say hello in one sentence." }],
    });
    res.json({ ok: true, response: msg.content[0].text.trim() });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ── POST /api/audit ──────────────────────────────────────────
// Fetches a product page URL and checks for SEO issues
app.post("/api/audit", requireAuth(), async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "url is required" });
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: "Invalid URL format" });
  }

  try {
    // 1. Get user + check credits
    const authObj = getAuth(req);
    req.auth = authObj;
    const user = await getOrCreateUser(
      req.auth?.userId,
      req.auth.sessionClaims?.email
    );

    if (parseFloat(user.balance || 0) < 0.10) {
      return res.status(402).json({
        error: "Insufficient credits. SEO Audit costs 5 credits.",
        credits: user.credits,
        upgradeUrl: "/pricing"
      });
    }

    // Fetch the page HTML
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; DablinSEOBot/1.0)" },
      timeout: 10000,
    });

    if (!response.ok) {
      return res.status(400).json({ error: response.status === 403 ? "This website blocks automated access. Try a different URL or a specific product page instead." : response.status === 404 ? "Page not found. Check the URL and try again." : `Unable to reach this page (error ${response.status}). Make sure the URL is public and try again.` });
    }

    const html = await response.text();
    const cheerio = require("cheerio");
    const $ = cheerio.load(html);

    // ── CHECK 1: Meta description ────────────────────────────
    const metaDesc = 
      $('meta[name="description"]').attr("content") ||
      $('meta[name="Description"]').attr("content") ||
      $('meta[property="description"]').attr("content") || "";
    const metaOk = metaDesc.length > 10 && metaDesc.length <= 155;
    console.log(`[audit] meta description: "${metaDesc.substring(0, 80)}" (${metaDesc.length} chars, ok=${metaOk})`);

    // ── CHECK 2: Schema markup ───────────────────────────────
    const schemaScripts = $('script[type="application/ld+json"]');
    const schemaOk = schemaScripts.length > 0;

    // ── CHECK 3: Image alt text ──────────────────────────────
    const images = $("img");
    let missingAlt = 0;
    images.each((_, el) => {
      const alt = $(el).attr("alt");
      if (!alt || alt.trim() === "") missingAlt++;
    });
    const altOk = images.length === 0 || missingAlt === 0;

    // ── CHECK 4: Heading structure ───────────────────────────
    const h1s = $("h1");
    const h3s = $("h3");
    const h2s = $("h2");
    const hasH3WithoutH2 = h3s.length > 0 && h2s.length === 0;
    const headingsOk = h1s.length === 1 && !hasH3WithoutH2;

    // ── CHECK 5: Word count ──────────────────────────────────
    const bodyText = $("body").text().replace(/\s+/g, " ").trim();
    const wordCount = bodyText.split(" ").filter(Boolean).length;
    const wordCountOk = wordCount >= 300;

    // ── CHECK 6: Canonical tag ───────────────────────────────
    const canonical = $('link[rel="canonical"]').attr("href") || "";
    const canonicalOk = canonical.length > 0;

    // ── CHECK 7: Robots noindex ──────────────────────────────
    const robotsMeta = $('meta[name="robots"]').attr("content") || "";
    const robotsOk = !robotsMeta.toLowerCase().includes("noindex");

    // ── CHECK 8: Open Graph tags ─────────────────────────────
    const ogTitle = $('meta[property="og:title"]').attr("content") || "";
    const ogDesc = $('meta[property="og:description"]').attr("content") || "";
    const ogImage = $('meta[property="og:image"]').attr("content") || "";
    const ogOk = ogTitle.length > 0 && ogDesc.length > 0 && ogImage.length > 0;

    // ── CHECK 9: Viewport meta tag ───────────────────────────
    const viewport = $('meta[name="viewport"]').attr("content") || "";
    const viewportOk = viewport.length > 0;

    // ── CHECK 10: Product schema type ────────────────────────
    let productSchemaOk = false;
    schemaScripts.each((_, el) => {
      try {
        const json = JSON.parse($(el).html());
        const types = Array.isArray(json) ? json.map(j => j["@type"]) : [json["@type"]];
        if (types.some(t => t === "Product")) productSchemaOk = true;
      } catch {}
    });

    // ── CHECK 11: Breadcrumb schema ──────────────────────────
    let breadcrumbOk = false;
    schemaScripts.each((_, el) => {
      try {
        const json = JSON.parse($(el).html());
        const types = Array.isArray(json) ? json.map(j => j["@type"]) : [json["@type"]];
        if (types.some(t => t === "BreadcrumbList")) breadcrumbOk = true;
      } catch {}
    });

    // ── CHECK 12: Review schema ──────────────────────────────
    let reviewSchemaOk = false;
    schemaScripts.each((_, el) => {
      try {
        const json = JSON.parse($(el).html());
        const hasReview = (obj) => obj?.review || obj?.aggregateRating;
        const items = Array.isArray(json) ? json : [json];
        if (items.some(hasReview)) reviewSchemaOk = true;
      } catch {}
    });

    // ── CHECK 13: Internal links ─────────────────────────────
    const parsedUrl = new URL(url);
    let internalLinks = 0;
    $("a[href]").each((_, el) => {
      const href = $(el).attr("href") || "";
      if (href.startsWith("/") || href.includes(parsedUrl.hostname)) internalLinks++;
    });
    const internalLinksOk = internalLinks > 0;

    // ── BUILD ISSUES ─────────────────────────────────────────
    const issues = {};
    if (!metaOk) {
      issues.meta = metaDesc.length === 0
        ? "No meta description found"
        : metaDesc.length > 155
        ? `Meta description too long (${metaDesc.length} chars, max 155)`
        : "Meta description too short";
    }
    if (!schemaOk) issues.schema = "No JSON-LD schema markup found — missing rich results eligibility";
    if (!altOk) issues.alt = `${missingAlt} image${missingAlt > 1 ? "s" : ""} missing alt text`;
    if (!headingsOk) {
      issues.headings = h1s.length === 0 ? "No H1 tag found"
        : h1s.length > 1 ? `Multiple H1 tags found (${h1s.length})`
        : "Heading structure skips levels (H3 without H2)";
    }
    if (!wordCountOk) issues.wordCount = `Only ${wordCount} words — thin content (min 300 recommended)`;
    if (!canonicalOk) issues.canonical = "No canonical tag found — risk of duplicate content penalties";
    if (!robotsOk) issues.robots = `Page is set to noindex — won't appear in search results`;
    if (!ogOk) {
      const missing = [!ogTitle && "og:title", !ogDesc && "og:description", !ogImage && "og:image"].filter(Boolean);
      issues.og = `Missing Open Graph tags: ${missing.join(", ")}`;
    }
    if (!viewportOk) issues.viewport = "No viewport meta tag — page may not be mobile-friendly";
    if (!productSchemaOk) issues.productSchema = "No Product schema found — missing Google Shopping eligibility";
    if (!breadcrumbOk) issues.breadcrumb = "No BreadcrumbList schema — navigation context missing for Google";
    if (!reviewSchemaOk) issues.reviewSchema = "No review/rating schema — missing star ratings in search results";
    if (!internalLinksOk) issues.internalLinks = "No internal links found — poor crawlability";

    const allChecks = {
      meta: metaOk, schema: schemaOk, alt: altOk, headings: headingsOk,
      wordCount: wordCountOk, canonical: canonicalOk, robots: robotsOk,
      og: ogOk, viewport: viewportOk, productSchema: productSchemaOk,
      breadcrumb: breadcrumbOk, reviewSchema: reviewSchemaOk, internalLinks: internalLinksOk,
    };

    // ── GENERATE AI FIXES FOR FAILED CHECKS ──────────────────
    const fixes = {};
    const failedKeys = Object.entries(allChecks).filter(([, v]) => !v).map(([k]) => k);

    if (failedKeys.length > 0) {
      try {
        const pageTitle = $("title").text().trim() || url;
        const h1Text = h1s.first().text().trim() || "";
        const rawSnippet = bodyText.substring(0, 800).trim();
        
        // Detect JS-rendered page (empty or just GTM/noscript content)
        const isJsRendered = rawSnippet.length < 100;
        const pageSnippet = isJsRendered
          ? `This page appears to be a JavaScript-rendered app. Use the URL and title to infer context.\nURL: ${url}\nTitle: ${pageTitle}`
          : rawSnippet;
        const contentContext = `URL: ${url}\nTitle: ${pageTitle}${h1Text ? `\nH1: ${h1Text}` : ""}${isJsRendered ? "" : `\nContent: ${pageSnippet}`}`;

        const fixPrompts = {
          meta: metaDesc.length === 0
            ? `Write a meta description for this page. Return ONLY the meta description text, 120-155 chars, no quotes.\n${contentContext}`
            : metaDesc.length > 155
            ? `This meta description is too long (${metaDesc.length} chars, max 155). Shorten it. Return ONLY the new text, no quotes.\nCurrent: ${metaDesc}`
            : `This meta description is too short (${metaDesc.length} chars). Expand to 120-155 chars. Return ONLY the new text, no quotes.\nCurrent: ${metaDesc}\n${contentContext}`,
          og: `Write Open Graph meta tags for this page. Return ONLY valid HTML meta tags for og:title, og:description, og:image (use a placeholder image URL). No explanation.\n${contentContext}`,
          schema: `Write a basic JSON-LD schema for this page. Return ONLY the <script type="application/ld+json"> block. No explanation.\n${contentContext}`,
          productSchema: `Write a complete JSON-LD Product schema with name, description, url, and offers. Return ONLY the <script type="application/ld+json"> block.\n${contentContext}`,
          breadcrumb: `Write a JSON-LD BreadcrumbList schema for this page. Return ONLY the <script type="application/ld+json"> block.\n${contentContext}`,
          reviewSchema: `Add aggregateRating to a Product schema (ratingValue: 4.5, reviewCount: 12). Return ONLY the <script type="application/ld+json"> block.\n${contentContext}`,
          canonical: `Return ONLY this HTML tag:\n<link rel="canonical" href="${url}" />`,
          viewport: `Return ONLY this HTML tag:\n<meta name="viewport" content="width=device-width, initial-scale=1">`,
          robots: `The robots meta tag is set to noindex. Return ONLY the corrected tag:\n<meta name="robots" content="index, follow">`,
          headings: `The page has this heading issue: ${issues.headings}. Suggest the corrected heading structure as HTML (h1/h2/h3 tags with placeholder text). Keep it concise.\n${contentContext}`,
          wordCount: `The page has only ${wordCount} words of visible content. Suggest 3 content sections (with titles) that could be added. Keep it brief.\n${contentContext}`,
          alt: `${missingAlt} images are missing alt text. In 2 sentences explain how to add alt text in Shopify/WordPress, then give 2 example formats for product images.`,
          internalLinks: `Suggest 3 internal link ideas for this page. Format as: "Link text → /suggested-url-path".\n${contentContext}`,
        };

        const fixRequests = failedKeys.filter(k => fixPrompts[k]);
        console.log("Generating fixes for:", fixRequests);

        await Promise.all(fixRequests.map(async (key) => {
          try {
            const msg = await anthropic.messages.create({
              model: "claude-haiku-4-5-20251001",
              max_tokens: 400,
              messages: [{ role: "user", content: fixPrompts[key] }],
            });
            fixes[key] = msg.content[0].text.trim();
          } catch (e) {
            console.error(`Fix generation failed for ${key}:`, e.message);
          }
        }));
      } catch (e) {
        console.error("AI fix generation skipped:", e.message, e.stack);
      }
    }

    // ── SAVE AUDIT TO DB + DEDUCT CREDITS ───────────────────────
    try {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query(
          "UPDATE users SET balance = balance - 0.10 WHERE clerk_id = $1",
          [req.auth?.userId]
        );
        await client.query(
          `INSERT INTO audits (clerk_id, url, checks, issues, created_at)
           VALUES ($1, $2, $3, $4, NOW())`,
          [req.auth?.userId, url, JSON.stringify(allChecks), JSON.stringify(issues)]
        );
        await client.query("COMMIT");
      } catch (dbErr) {
        await client.query("ROLLBACK");
        console.warn("Audit DB transaction failed:", dbErr.message);
      } finally {
        client.release();
      }
    } catch (dbErr) {
      console.warn("Audit DB insert skipped:", dbErr.message);
    }

    const updated = await pool.query(
      "SELECT credits FROM users WHERE clerk_id = $1", [req.auth?.userId]
    );

    res.json({
      url,
      checks: allChecks,
      issues,
      fixes,
      meta_description: metaDesc,
      images_total: images.length,
      images_missing_alt: missingAlt,
      word_count: wordCount,
      creditsRemaining: updated.rows[0]?.credits ?? null,
    });

  } catch (err) {
    console.error("POST /api/audit error:", err);
    res.status(500).json({ error: "Failed to audit page. Make sure the URL is publicly accessible." });
  }
});


// ── POST /api/ai-audit ──────────────────────────────────────
// AEO audit — 12 checks for AI engine visibility (5 credits)
app.post("/api/ai-audit", requireAuth(), async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "url is required" });
  try { new URL(url); } catch { return res.status(400).json({ error: "Invalid URL format" }); }

  try {
    const authObj = getAuth(req);
    req.auth = authObj;
    const user = await getOrCreateUser(req.auth?.userId, req.auth.sessionClaims?.email);

    if (parseFloat(user.balance || 0) < 0.10) {
      return res.status(402).json({ error: "Insufficient balance. AI Visibility Audit costs $0.20.", balance: user.balance });
    }

    const fetch = (await import("node-fetch")).default;
    const parsedUrl = new URL(url);
    const origin = `${parsedUrl.protocol}//${parsedUrl.hostname}`;
    const startTime = Date.now();

    // Fetch page HTML
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; DablinAEOBot/1.0)" },
      timeout: 10000,
    });
    const responseTime = Date.now() - startTime;

    if (!response.ok) return res.status(400).json({ error: response.status === 403 ? "This website blocks automated access. Try a different URL or a specific product page instead." : response.status === 404 ? "Page not found. Check the URL and try again." : `Unable to reach this page (error ${response.status}). Make sure the URL is public and try again.` });

    const html = await response.text();
    const cheerio = require("cheerio");
    const $ = cheerio.load(html);

    // ── CHECK 1: llms.txt ────────────────────────────────────
    let llmsTxtOk = false;
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 5000);
      const r = await fetch(`${origin}/llms.txt`, { method: "HEAD", headers: { "User-Agent": "Mozilla/5.0" }, signal: ctrl.signal });
      clearTimeout(t);
      llmsTxtOk = r.ok;
    } catch {}

    // ── CHECK 2: robots.txt allows AI crawlers ───────────────
    let aiCrawlersAllowed = false;
    try {
      const ctrl2 = new AbortController();
      const t2 = setTimeout(() => ctrl2.abort(), 5000);
      const r = await fetch(`${origin}/robots.txt`, { headers: { "User-Agent": "Mozilla/5.0" }, signal: ctrl2.signal });
      clearTimeout(t2);
      if (r.ok) {
        const robotsTxt = await r.text();
        const blockedBots = ["GPTBot", "ClaudeBot", "PerplexityBot", "anthropic-ai", "ChatGPT-User"];
        const lines = robotsTxt.toLowerCase().split("\n");
        let isBlocked = false;
        for (const bot of blockedBots) {
          const botLower = bot.toLowerCase();
          const disallowAll = lines.some(l => l.includes(`user-agent: ${botLower}`) || (l.includes("user-agent: *") && lines.some(ll => ll.includes("disallow: /"))));
          if (disallowAll) { isBlocked = true; break; }
        }
        aiCrawlersAllowed = !isBlocked;
      }
    } catch {}

    // ── CHECK 3: Organization schema ────────────────────────
    const schemaScripts = $('script[type="application/ld+json"]');
    let orgSchemaOk = false;
    let sameAsOk = false;
    let siteNameOk = false;
    schemaScripts.each((_, el) => {
      try {
        const json = JSON.parse($(el).html());
        const items = Array.isArray(json["@graph"]) ? json["@graph"] : (Array.isArray(json) ? json : [json]);
        for (const item of items) {
          if (item["@type"] === "Organization" || item["@type"] === "LocalBusiness") orgSchemaOk = true;
          if (item.sameAs && Array.isArray(item.sameAs) && item.sameAs.length > 0) sameAsOk = true;
          if (item["@type"] === "WebSite" && item.name) siteNameOk = true;
        }
      } catch {}
    });

    // ── CHECK 4: sameAs links (covered above) ───────────────

    // ── CHECK 5: WebSite schema with name (covered above) ───

    // ── CHECK 6: Clear H1 ───────────────────────────────────
    const h1s = $("h1");
    const h1Ok = h1s.length === 1 && h1s.first().text().trim().length > 3;

    // ── CHECK 7: Meta description ───────────────────────────
    const metaDesc = $('meta[name="description"]').attr("content") || $('meta[name="Description"]').attr("content") || "";
    const metaOk = metaDesc.length > 10 && metaDesc.length <= 155;

    // ── CHECK 8: No AI blocking meta tags ───────────────────
    let noAiBlock = true;
    $("meta").each((_, el) => {
      const name = ($(el).attr("name") || "").toLowerCase();
      const content = ($(el).attr("content") || "").toLowerCase();
      if (name === "robots" && (content.includes("noai") || content.includes("noimageai"))) noAiBlock = false;
    });

    // ── CHECK 9: Canonical URL ───────────────────────────────
    const canonical = $('link[rel="canonical"]').attr("href") || "";
    const canonicalOk = canonical.length > 0;

    // ── CHECK 10: Open Graph tags ────────────────────────────
    const ogTitle = $('meta[property="og:title"]').attr("content") || "";
    const ogDesc = $('meta[property="og:description"]').attr("content") || "";
    const ogImage = $('meta[property="og:image"]').attr("content") || "";
    const ogOk = ogTitle.length > 0 && ogDesc.length > 0 && ogImage.length > 0;

    // ── CHECK 11: Fast response time ─────────────────────────
    const speedOk = responseTime < 3000;

    // ── CHECK 12: HTTPS ──────────────────────────────────────
    const httpsOk = parsedUrl.protocol === "https:";

    const allChecks = {
      llmsTxt: llmsTxtOk,
      aiCrawlers: aiCrawlersAllowed,
      orgSchema: orgSchemaOk,
      sameAs: sameAsOk,
      siteName: siteNameOk,
      h1: h1Ok,
      metaDesc: metaOk,
      noAiBlock: noAiBlock,
      canonical: canonicalOk,
      openGraph: ogOk,
      speed: speedOk,
      https: httpsOk,
    };

    const issues = {};
    if (!llmsTxtOk) issues.llmsTxt = "No llms.txt file — AI engines can't identify your site's purpose";
    if (!aiCrawlersAllowed) issues.aiCrawlers = "AI crawlers (GPTBot, ClaudeBot, PerplexityBot) may be blocked in robots.txt";
    if (!orgSchemaOk) issues.orgSchema = "No Organization schema — AI engines can't verify your brand identity";
    if (!sameAsOk) issues.sameAs = "No sameAs links in schema — AI engines can't connect your social profiles to your brand";
    if (!siteNameOk) issues.siteName = "No WebSite schema with name field — AI engines may misidentify your site";
    if (!h1Ok) issues.h1 = h1s.length === 0 ? "No H1 tag — AI engines can't identify the page topic" : "Multiple H1 tags — ambiguous page topic for AI engines";
    if (!metaOk) issues.metaDesc = metaDesc.length === 0 ? "No meta description — AI engines use this for citations" : `Meta description ${metaDesc.length > 155 ? "too long" : "too short"} for AI citation use`;
    if (!noAiBlock) issues.noAiBlock = "noai meta tag found — AI engines are explicitly blocked from this page";
    if (!canonicalOk) issues.canonical = "No canonical URL — AI engines may index the wrong version of this page";
    if (!ogOk) issues.openGraph = `Missing Open Graph tags: ${[!ogTitle && "og:title", !ogDesc && "og:description", !ogImage && "og:image"].filter(Boolean).join(", ")}`;
    if (!speedOk) issues.speed = `Slow response time (${responseTime}ms) — AI crawlers may skip slow pages`;
    if (!httpsOk) issues.https = "Page is not served over HTTPS — AI engines deprioritise insecure pages";

    // ── GENERATE AI FIXES ────────────────────────────────────
    const fixes = {};
    const failedKeys = Object.entries(allChecks).filter(([, v]) => !v).map(([k]) => k);
    if (failedKeys.length > 0) {
      try {
        const pageTitle = $("title").text().trim() || url;
        const h1Text = h1s.first().text().trim() || "";
        const bodyText = $("body").text().replace(/\s+/g, " ").trim();
        const rawSnippet = bodyText.substring(0, 800).trim();
        const isJsRendered = rawSnippet.length < 100;
        const contentContext = `URL: ${url}\nTitle: ${pageTitle}${h1Text ? `\nH1: ${h1Text}` : ""}${isJsRendered ? "" : `\nContent: ${rawSnippet}`}`;

        const fixPrompts = {
          llmsTxt: `Generate an llms.txt file for this website. Include: # Title, > one-line description, ## About, ## Key Pages with URLs, ## Features or ## Products. Plain text only.\n${contentContext}`,
          aiCrawlers: `Write the robots.txt rules to explicitly allow GPTBot, ClaudeBot, PerplexityBot and anthropic-ai. Return ONLY the rules to add, no explanation.`,
          orgSchema: `Write a JSON-LD Organization schema for this site. Include name, url, logo (placeholder), description, and sameAs with placeholder social URLs. Return ONLY the <script type="application/ld+json"> block.\n${contentContext}`,
          sameAs: `Add sameAs array to this Organization schema with placeholder social profile URLs (LinkedIn, Twitter/X, Facebook, Instagram). Return ONLY the sameAs array as JSON.\n${contentContext}`,
          siteName: `Write a JSON-LD WebSite schema with name, url, and potentialAction (SearchAction). Return ONLY the <script type="application/ld+json"> block.\n${contentContext}`,
          h1: `Suggest a clear, descriptive H1 tag for this page. Return ONLY the <h1> HTML tag.\n${contentContext}`,
          metaDesc: metaDesc.length === 0
            ? `Write a meta description for AI engine citations. 120-155 chars, factual and descriptive. Return ONLY the text, no quotes.\n${contentContext}`
            : `This meta description needs improvement for AI citation use. Return ONLY the improved text, no quotes.\nCurrent: ${metaDesc}`,
          noAiBlock: `Return ONLY the corrected robots meta tag that allows AI engines:\n<meta name="robots" content="index, follow">`,
          canonical: `Return ONLY the canonical link tag for this URL:\n<link rel="canonical" href="${url}" />`,
          openGraph: `Write Open Graph meta tags for this page. Return ONLY the HTML meta tags for og:title, og:description, og:image (placeholder image). No explanation.\n${contentContext}`,
          speed: `List 3 specific actions to improve server response time for a ${parsedUrl.hostname} website. Be concise and actionable.`,
          https: `Explain in 2 sentences how to enable HTTPS on this site and why it matters for AI engine visibility.`,
        };

        await Promise.all(failedKeys.filter(k => fixPrompts[k]).map(async (key) => {
          try {
            const msg = await anthropic.messages.create({
              model: "claude-haiku-4-5-20251001",
              max_tokens: 400,
              messages: [{ role: "user", content: fixPrompts[key] }],
            });
            fixes[key] = msg.content[0].text.trim();
          } catch (e) {
            console.error(`AEO fix failed for ${key}:`, e.message);
          }
        }));
      } catch (e) {
        console.error("AEO fix generation skipped:", e.message);
      }
    }

    // ── SAVE + DEDUCT CREDITS ────────────────────────────────
    try {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query("UPDATE users SET balance = balance - 0.10 WHERE clerk_id = $1", [req.auth?.userId]);
        await client.query(
          `INSERT INTO audits (clerk_id, url, checks, issues, created_at) VALUES ($1, $2, $3, $4, NOW())`,
          [req.auth?.userId, url, JSON.stringify(allChecks), JSON.stringify(issues)]
        );
        await client.query("COMMIT");
      } catch (dbErr) {
        await client.query("ROLLBACK");
        console.warn("AEO audit DB transaction failed:", dbErr.message);
      } finally {
        client.release();
      }
    } catch (dbErr) {
      console.warn("AEO audit DB insert skipped:", dbErr.message);
    }

    const updated = await pool.query("SELECT credits FROM users WHERE clerk_id = $1", [req.auth?.userId]);

    res.json({
      url,
      checks: allChecks,
      issues,
      fixes,
      response_time_ms: responseTime,
      creditsRemaining: updated.rows[0]?.credits ?? null,
    });

  } catch (err) {
    console.error("POST /api/ai-audit error:", err);
    res.status(500).json({ error: "Failed to audit page. Make sure the URL is publicly accessible." });
  }
});

// ── GET /api/saved-queries ───────────────────────────────────
app.get("/api/saved-queries", requireAuth(), async (req, res) => {
  try {
    const authObj = getAuth(req); req.auth = authObj;
    await pool.query(`CREATE TABLE IF NOT EXISTS saved_queries (
      id SERIAL PRIMARY KEY, clerk_id TEXT NOT NULL, query TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    const result = await pool.query(
      `SELECT id, query, created_at FROM saved_queries WHERE clerk_id = $1 ORDER BY created_at DESC`,
      [req.auth?.userId]
    );
    res.json({ items: result.rows });
  } catch (err) { res.status(500).json({ error: "Failed to fetch saved queries" }); }
});

// ── POST /api/saved-queries ──────────────────────────────────
app.post("/api/saved-queries", requireAuth(), async (req, res) => {
  try {
    const authObj = getAuth(req); req.auth = authObj;
    const { query } = req.body;
    if (!query?.trim()) return res.status(400).json({ error: "query is required" });
    await pool.query(`CREATE TABLE IF NOT EXISTS saved_queries (
      id SERIAL PRIMARY KEY, clerk_id TEXT NOT NULL, query TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    // Check not duplicate
    const exists = await pool.query(
      `SELECT id FROM saved_queries WHERE clerk_id = $1 AND query = $2`,
      [req.auth?.userId, query.trim()]
    );
    if (exists.rows.length > 0) return res.json({ id: exists.rows[0].id, query: query.trim(), duplicate: true });
    const result = await pool.query(
      `INSERT INTO saved_queries (clerk_id, query, created_at) VALUES ($1, $2, NOW()) RETURNING id, query, created_at`,
      [req.auth?.userId, query.trim()]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: "Failed to save query" }); }
});

// ── DELETE /api/saved-queries/:id ───────────────────────────
app.delete("/api/saved-queries/:id", requireAuth(), async (req, res) => {
  try {
    const authObj = getAuth(req); req.auth = authObj;
    await pool.query(
      `DELETE FROM saved_queries WHERE id = $1 AND clerk_id = $2`,
      [req.params.id, req.auth?.userId]
    );
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: "Failed to delete query" }); }
});

// ── PATCH /api/saved-queries/:id ────────────────────────────
app.patch("/api/saved-queries/:id", requireAuth(), async (req, res) => {
  try {
    const authObj = getAuth(req); req.auth = authObj;
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "query is required" });
    await pool.query(
      `UPDATE saved_queries SET query = $1 WHERE id = $2 AND clerk_id = $3`,
      [query, req.params.id, req.auth?.userId]
    );
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: "Failed to update query" }); }
});

// ── POST /api/generate-queries-from-prompt ───────────────────
// Generates 7 queries from a user's text prompt. Free, no balance charged.
app.post("/api/generate-queries-from-prompt", requireAuth(), async (req, res) => {
  const { prompt, brand: brandHint } = req.body;
  if (!prompt) return res.status(400).json({ error: "prompt is required" });
  try {
    const authObj = getAuth(req); req.auth = authObj;
    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [{
        role: "user",
        content: `Based on this description, generate 7 search queries that a potential customer would type into ChatGPT, Gemini, or Claude when looking for this product or service.

Description: ${prompt}
${brandHint ? `Brand name: ${brandHint}` : ''}

Return ONLY valid JSON, no explanation:
{
  "brand": "BrandName",
  "queries": ["query 1","query 2","query 3","query 4","query 5","query 6","query 7"]
}

Rules:
- Queries 1-4: natural customer search terms (no brand name)
- Query 5: "best [category] tools/software/products"
- Query 6: "[category] reviews" or "[category] alternatives"
- Query 7: a comparison query like "[category] vs [competitor type]"
- Brand: extract from description or use provided brand name`
      }]
    });

    let brand = brandHint || "your brand", queries = [];
    try {
      const clean = msg.content[0].text.trim().replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(clean);
      brand = parsed.brand || brand;
      queries = parsed.queries || [];
    } catch(e) {
      return res.status(500).json({ error: "Failed to generate queries." });
    }
    res.json({ brand, queries });
  } catch(err) {
    console.error("POST /api/generate-queries-from-prompt error:", err);
    res.status(500).json({ error: "Failed to generate queries." });
  }
});

// ── POST /api/generate-queries ───────────────────────────────
// Scrapes URL, extracts brand + generates 7 queries. No credits charged.
app.post("/api/generate-queries", requireAuth(), async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "url is required" });
  try { new URL(url); } catch { return res.status(400).json({ error: "Invalid URL format" }); }
  try {
    const authObj = getAuth(req); req.auth = authObj;
    const fetch = (await import("node-fetch")).default;
    const pageRes = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; DablinBot/1.0)" },
      timeout: 10000,
    });
    if (!pageRes.ok) return res.status(400).json({ error: pageRes.status === 403 ? "This website blocks automated access. Try a different URL or a specific product page instead." : pageRes.status === 404 ? "Page not found. Check the URL and try again." : `Unable to reach this page (error ${pageRes.status}). Make sure the URL is public and try again.` });
    const html = await pageRes.text();
    const cheerio = require("cheerio");
    const $ = cheerio.load(html);
    const pageTitle = $("title").text().trim() || url;
    const metaDesc = $('meta[name="description"]').attr("content") || $('meta[property="og:description"]').attr("content") || "";
    const h1 = $("h1").first().text().trim() || "";
    const bodySnippet = $("body").text().replace(/\s+/g, " ").trim().substring(0, 600);
    const domain = new URL(url).hostname.replace("www.", "");

    const brandMsg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [{
        role: "user",
        content: `Extract the brand name and generate 7 search queries for this website.
URL: ${url}
Title: ${pageTitle}
Meta: ${metaDesc}
H1: ${h1}
Content: ${bodySnippet}

Return ONLY valid JSON, no explanation:
{
  "brand": "BrandName",
  "queries": ["query 1","query 2","query 3","query 4","query 5","query 6","query 7"]
}

Rules:
- Queries 1-4: how a potential customer searches for this product (natural language, no brand name)
- Query 5: "best [category] tools" or "top [category] software"
- Query 6: "[category] reviews"
- Query 7: "[category] alternatives"`
      }]
    });

    let brand = domain, queries = [];
    try {
      const clean = brandMsg.content[0].text.trim().replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(clean);
      brand = parsed.brand || domain;
      queries = parsed.queries || [];
    } catch(e) {
      return res.status(500).json({ error: "Failed to extract brand information." });
    }
    res.json({ brand, queries });
  } catch(err) {
    console.error("POST /api/generate-queries error:", err);
    res.status(500).json({ error: "Failed to generate queries." });
  }
});

// ── POST /api/visibility-check ───────────────────────────────
// Queries Claude, GPT-4o, Gemini with brand queries, returns mention table
app.post("/api/visibility-check", requireAuth(), async (req, res) => {
  const { url, savedQueries, brand: brandFromClient } = req.body;
  if (!url && (!savedQueries || savedQueries.length === 0)) {
    return res.status(400).json({ error: "Either url or savedQueries is required" });
  }
  if (url) { try { new URL(url); } catch { return res.status(400).json({ error: "Invalid URL format" }); } }

  try {
    const authObj = getAuth(req);
    req.auth = authObj;
    const user = await getOrCreateUser(req.auth?.userId, req.auth.sessionClaims?.email);

    if (parseFloat(user.balance || 0) < 1.00) {
      return res.status(402).json({ error: "Insufficient balance. AI Visibility Check costs €1.00.", balance: user.balance });
    }

    const domain = url ? new URL(url).hostname.replace("www.", "") : (brandFromClient || "brand");
    let brand = brandFromClient || domain;
    let queriesToRun = [];

    // If no queries provided, auto-generate from URL
    if (!savedQueries || savedQueries.length === 0) {
      if (!url) return res.status(400).json({ error: "url is required when no queries provided" });
      const fetch = (await import("node-fetch")).default;
      try {
        const pageRes = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; DablinBot/1.0)" },
          timeout: 10000,
        });
        if (pageRes.ok) {
          const html = await pageRes.text();
          const cheerio = require("cheerio");
          const $ = cheerio.load(html);
          const pageTitle = $("title").text().trim() || url;
          const metaDesc = $('meta[name="description"]').attr("content") || $('meta[property="og:description"]').attr("content") || "";
          const h1 = $("h1").first().text().trim() || "";
          const bodySnippet = $("body").text().replace(/\s+/g, " ").trim().substring(0, 600);

          const brandMsg = await anthropic.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 400,
            messages: [{ role: "user", content: `Extract the brand name and generate 7 search queries for this website.\nURL: ${url}\nTitle: ${pageTitle}\nMeta: ${metaDesc}\nH1: ${h1}\nContent: ${bodySnippet}\n\nReturn ONLY valid JSON:\n{"brand":"BrandName","queries":["query 1","query 2","query 3","query 4","query 5","query 6","query 7"]}` }]
          });
          const clean = brandMsg.content[0].text.trim().replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          const parsed = JSON.parse(clean);
          brand = parsed.brand || domain;
          queriesToRun = parsed.queries || [];
        }
      } catch(e) {
        console.error("Auto-generate queries failed:", e.message);
      }
      if (queriesToRun.length === 0) return res.status(400).json({ error: "Could not generate queries for this URL. Try adding them manually." });
    } else {
      queriesToRun = savedQueries.slice(0, 7);
      brand = brandFromClient || domain;
    }

    // Query each AI with each query in parallel
    const brandLower = brand.toLowerCase();

    const queryPrompt = (query) =>
      `${query}\n\nRespond ONLY with a valid JSON object, no explanation, no markdown:\n{"response": "your answer here listing 5+ specific named tools or services", "brands": ["BrandName1", "BrandName2"], "platforms": ["G2", "Reddit"]}\n\nRules:\n- "brands": only real product/company brand names that are direct competitors or alternatives (NOT generic words, NOT the user's brand "${brand}")\n- "platforms": only known review sites, directories, or communities where these tools can be found (G2, Capterra, Gartner, GetApp, Software Advice, Trustpilot, TrustRadius, AlternativeTo, SaasHub, Product Hunt, BetaList, Hacker News, Reddit, Quora, Indie Hackers, TechCrunch, GitHub, Medium, Substack, LinkedIn, AppSumo, Clutch, Crunchbase)\n- Both arrays should only contain names explicitly mentioned in your response`;

    function withTimeout(promise, ms = 20000) {
      return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms))
      ]);
    }

    async function queryClause(query) {
      try {
        const msg = await withTimeout(anthropic.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 600,
          messages: [{ role: "user", content: queryPrompt(query) }]
        }));
        const text = msg.content[0].text;
        let brands = [], platforms = [], snippet = "";
        try {
          const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          const parsed = JSON.parse(clean);
          snippet = (parsed.response || "").substring(0, 300);
          brands = (parsed.brands || []).filter(b => b.toLowerCase() !== brandLower);
          platforms = parsed.platforms || [];
        } catch { snippet = text.substring(0, 300); }
        const mentioned = (snippet + text).toLowerCase().includes(brandLower);
        return { mentioned, brands, platforms, competitors: [...brands, ...platforms], snippet };
      } catch(e) {
        console.warn("[visibility] Claude query failed:", e.message);
        return { mentioned: false, brands: [], platforms: [], competitors: [], snippet: "" };
      }
    }

    async function queryGPT(query) {
      try {
        const completion = await withTimeout(openai.chat.completions.create({
          model: "gpt-4o-mini",
          max_tokens: 600,
          messages: [{ role: "user", content: queryPrompt(query) }]
        }));
        const text = completion.choices[0].message.content;
        let brands = [], platforms = [], snippet = "";
        try {
          const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          const parsed = JSON.parse(clean);
          snippet = (parsed.response || "").substring(0, 300);
          brands = (parsed.brands || []).filter(b => b.toLowerCase() !== brandLower);
          platforms = parsed.platforms || [];
        } catch { snippet = text.substring(0, 300); }
        const mentioned = (snippet + text).toLowerCase().includes(brandLower);
        return { mentioned, brands, platforms, competitors: [...brands, ...platforms], snippet };
      } catch(e) {
        console.warn("[visibility] GPT query failed:", e.message);
        return { mentioned: false, brands: [], platforms: [], competitors: [], snippet: "" };
      }
    }

    async function queryGemini(query) {
      try {
        const fetch = (await import("node-fetch")).default;
        const geminiRes = await withTimeout(fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: queryPrompt(query) }] }]
            })
          }
        ));
        const json = await geminiRes.json();
        if (!geminiRes.ok) {
          console.warn("[visibility] Gemini REST error:", json?.error?.message);
          return { mentioned: false, brands: [], platforms: [], competitors: [], snippet: "" };
        }
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
        let brands = [], platforms = [], snippet = "";
        try {
          const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          const parsed = JSON.parse(clean);
          snippet = (parsed.response || "").substring(0, 300);
          brands = (parsed.brands || []).filter(b => b.toLowerCase() !== brandLower);
          platforms = parsed.platforms || [];
        } catch { snippet = text.substring(0, 300); }
        const mentioned = (snippet + text).toLowerCase().includes(brandLower);
        return { mentioned, brands, platforms, competitors: [...brands, ...platforms], snippet };
      } catch(e) {
        console.warn("[visibility] Gemini query failed:", e.message);
        return { mentioned: false, brands: [], platforms: [], competitors: [], snippet: "" };
      }
    }

    function extractBrands(text, ownBrand) {
      const textLower = text.toLowerCase();
      const found = [];

      // Known directories, review platforms to detect explicitly
      const knownPlatforms = [
        'G2', 'Capterra', 'Gartner', 'GetApp', 'Software Advice',
        'Trustpilot', 'TrustRadius', 'Trust Radius', 'AlternativeTo',
        'SaasHub', 'SaasWorthy', 'Saas Worthy',
        'Product Hunt', 'BetaList', 'Beta List',
        'Hacker News', 'Reddit', 'Quora', 'Indie Hackers',
        'TechCrunch', 'The Verge', 'Verge',
        'GitHub', 'Medium', 'Substack', 'LinkedIn',
        'Shopify App Store', 'AppSumo', 'Clutch', 'Crunchbase',
      ];
      for (const platform of knownPlatforms) {
        if (textLower.includes(platform.toLowerCase()) && platform.toLowerCase() !== ownBrand.toLowerCase()) {
          found.push(platform);
        }
      }

      // Extract capitalized brand-like words
      const stopWords = new Set([
        "The","This","That","Here","There","These","Those","They","Your","Some","Many",
        "Most","Best","Top","List","Also","With","For","And","But","You","Can","Are",
        "Its","Has","Have","Each","From","Into","When","Where","Which","While","Their",
        "Than","More","Other","Such","Both","Very","Just","Only","Even","Well","Been",
        "Being","Having","Does","Did","Was","Were","Will","Would","Could","Should",
        "About","After","Before","Below","Above","Under","Over","Through","During",
        "Including","However","Therefore","Additionally","Furthermore",
        "Digital","Loyalty","Card","Program","Platform","Tool","App","Software","Service",
        "Solution","System","Business","Customer","Product","Feature","Option","Plan",
        "Free","Paid","Monthly","Annual","Credits","Points","Stamps","Rewards","Mobile",
        "Apple","Google","Wallet","Email","SMS","QR","Code","Dashboard","Analytics",
        "Setup","Easy","Simple","Quick","Fast","Small","Large","Medium","New","Old",
        "Here","There","Check","Review","Rating","Store","Shop","Online","Website",
      ]);

      const regex = /\b([A-Z][a-zA-Z]{2,}(?:[A-Z][a-zA-Z]+)?)\b/g;
      let match;
      while ((match = regex.exec(text)) !== null) {
        const word = match[1];
        if (
          !stopWords.has(word) &&
          word.toLowerCase() !== ownBrand.toLowerCase() &&
          word.length >= 3 && word.length <= 25 &&
          !found.includes(word)
        ) {
          found.push(word);
        }
      }
      return [...new Set(found)].slice(0, 8);
    }

    // Run all queries in parallel (up to 7 queries × 3 AIs = 21 calls, each with 20s timeout)
    const results = await Promise.all(queriesToRun.slice(0, 7).map(async (query) => {
      const [claude, gpt, gem] = await Promise.all([
        queryClause(query),
        queryGPT(query),
        queryGemini(query),
      ]);
      return { query, claude, gpt, gemini: gem };
    }));

    // Aggregate competitor brands (separate from platforms)
    const competitorCounts = {};
    results.forEach(r => {
      [...(r.claude.brands||[]), ...(r.gpt.brands||[]), ...(r.gemini.brands||[])].forEach(c => {
        competitorCounts[c] = (competitorCounts[c] || 0) + 1;
      });
    });
    const topCompetitors = Object.entries(competitorCounts)
      .sort(([,a],[,b]) => b - a)
      .map(([name, count]) => ({ name, count }));

    const mentionSummary = {
      claude: results.filter(r => r.claude.mentioned).length,
      gpt: results.filter(r => r.gpt.mentioned).length,
      gemini: results.filter(r => r.gemini.mentioned).length,
      total: results.filter(r => r.claude.mentioned || r.gpt.mentioned || r.gemini.mentioned).length,
    };

    // Deduct credits
    // Deduct credits and save result
    try {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query("UPDATE users SET balance = balance - 0.35 WHERE clerk_id = $1", [req.auth?.userId]);
        await client.query(
          `INSERT INTO visibility_checks (clerk_id, url, brand, queries, results, mention_summary, top_competitors, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
          [req.auth?.userId, url || '', brand, JSON.stringify(queriesToRun), JSON.stringify(results), JSON.stringify(mentionSummary), JSON.stringify(topCompetitors)]
        );
        await client.query("COMMIT");
        console.log("[visibility-check] saved for", req.auth?.userId, url);
      } catch (dbErr) {
        await client.query("ROLLBACK");
        console.error("[visibility-check] DB error:", dbErr.message);
      } finally {
        client.release();
      }
    } catch (err) {
      console.error("[visibility-check] pool error:", err.message);
    }

    const updated = await pool.query("SELECT credits FROM users WHERE clerk_id = $1", [req.auth?.userId]);

    res.json({
      url,
      brand,
      queries: queriesToRun,
      usedSavedQueries: savedQueries && savedQueries.length > 0,
      results,
      mentionSummary,
      topCompetitors,
      creditsRemaining: updated.rows[0]?.credits ?? null,
    });

  } catch (err) {
    console.error("POST /api/visibility-check error:", err);
    res.status(500).json({ error: "Visibility check failed. Please try again." });
  }
});

// ── GET /api/usage/daily ─────────────────────────────────────
// Returns usage counts per day for the last 7 days
// ?type=generate|seo_audit|ai_audit|visibility_check
app.get("/api/usage/daily", requireAuth(), async (req, res) => {
  try {
    const authObj = getAuth(req);
    req.auth = authObj;
    const type = req.query.type || 'generate';

    let query;
    if (type === 'generate') {
      query = `SELECT DATE(created_at) as day, COUNT(*) as count
               FROM generations WHERE clerk_id = $1
               AND created_at >= NOW() - INTERVAL '7 days'
               GROUP BY DATE(created_at) ORDER BY day ASC`;
    } else if (type === 'seo_audit') {
      query = `SELECT DATE(created_at) as day, COUNT(*) as count
               FROM audits WHERE clerk_id = $1
               AND checks::text NOT LIKE '%llmsTxt%'
               AND created_at >= NOW() - INTERVAL '7 days'
               GROUP BY DATE(created_at) ORDER BY day ASC`;
    } else if (type === 'ai_audit') {
      query = `SELECT DATE(created_at) as day, COUNT(*) as count
               FROM audits WHERE clerk_id = $1
               AND checks::text LIKE '%llmsTxt%'
               AND created_at >= NOW() - INTERVAL '7 days'
               GROUP BY DATE(created_at) ORDER BY day ASC`;
    } else if (type === 'visibility_check') {
      query = `SELECT DATE(created_at) as day, COUNT(*) as count
               FROM visibility_checks WHERE clerk_id = $1
               AND created_at >= NOW() - INTERVAL '7 days'
               GROUP BY DATE(created_at) ORDER BY day ASC`;
    } else {
      return res.status(400).json({ error: "Invalid type" });
    }

    const result = await pool.query(query, [req.auth?.userId]);

    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const found = result.rows.find(r => r.day.toISOString().split("T")[0] === key);
      days.push({ day: key, count: found ? parseInt(found.count) : 0 });
    }

    res.json({ days });
  } catch (err) {
    console.error("GET /api/usage/daily error:", err);
    res.status(500).json({ error: "Failed to fetch usage" });
  }
});

// ── GET /api/audit-history ───────────────────────────────────
// Returns past SEO audits for the logged-in user
app.get("/api/audit-history", requireAuth(), async (req, res) => {
  try {
    const authObj = getAuth(req);
    req.auth = authObj;
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT id, url, checks, issues, created_at
       FROM audits
       WHERE clerk_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.auth?.userId, limit, offset]
    );

    const count = await pool.query(
      "SELECT COUNT(*) FROM audits WHERE clerk_id = $1",
      [req.auth?.userId]
    );

    res.json({
      items: result.rows,
      total: parseInt(count.rows[0].count),
      page,
      pages: Math.ceil(count.rows[0].count / limit)
    });

  } catch (err) {
    console.error("GET /api/audit-history error:", err);
    res.status(500).json({ error: "Failed to fetch audit history" });
  }
});

// ── GET /api/visibility-check-history ───────────────────────
app.get("/api/visibility-check-history", requireAuth(), async (req, res) => {
  try {
    const authObj = getAuth(req);
    req.auth = authObj;
    await pool.query(`CREATE TABLE IF NOT EXISTS visibility_checks (
      id SERIAL PRIMARY KEY, clerk_id TEXT NOT NULL, url TEXT, brand TEXT,
      queries JSONB, results JSONB, mention_summary JSONB, top_competitors JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    const result = await pool.query(
      `SELECT id, url, brand, mention_summary, top_competitors, created_at
       FROM visibility_checks WHERE clerk_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [req.auth?.userId]
    );
    res.json({ items: result.rows });
  } catch (err) {
    console.error("GET /api/visibility-check-history error:", err);
    res.status(500).json({ error: "Failed to fetch visibility check history" });
  }
});

// ── POST /api/share ──────────────────────────────────────────
// Save a result snapshot with a public token (expires 30 days)
app.post("/api/share", requireAuth(), async (req, res) => {
  try {
    const authObj = getAuth(req); req.auth = authObj;
    const { type, data } = req.body; // type: 'visibility-check' | 'ai-audit' | 'seo-audit'
    if (!type || !data) return res.status(400).json({ error: "type and data required" });

    await pool.query(`CREATE TABLE IF NOT EXISTS shared_results (
      id SERIAL PRIMARY KEY,
      token TEXT UNIQUE NOT NULL,
      clerk_id TEXT NOT NULL,
      type TEXT NOT NULL,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
    )`);

    const token = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    await pool.query(
      `INSERT INTO shared_results (token, clerk_id, type, data) VALUES ($1, $2, $3, $4)`,
      [token, req.auth?.userId, type, JSON.stringify(data)]
    );
    res.json({ token, url: `https://dablin.co/results/${token}` });
  } catch (err) {
    console.error("POST /api/share error:", err);
    res.status(500).json({ error: "Failed to create share link" });
  }
});

// ── GET /api/share/:token ─────────────────────────────────────
// Public endpoint — no auth required
app.get("/api/share/:token", async (req, res) => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS shared_results (
      id SERIAL PRIMARY KEY, token TEXT UNIQUE NOT NULL, clerk_id TEXT NOT NULL,
      type TEXT NOT NULL, data JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
    )`);
    const result = await pool.query(
      `SELECT token, type, data, created_at, expires_at FROM shared_results
       WHERE token = $1 AND expires_at > NOW()`,
      [req.params.token]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Result not found or expired" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("GET /api/share/:token error:", err);
    res.status(500).json({ error: "Failed to fetch shared result" });
  }
});

// ── GET /api/dashboard ───────────────────────────────────────
// Returns grouped audit history per URL with scores over time
app.get("/api/dashboard", requireAuth(), async (req, res) => {
  try {
    const authObj = getAuth(req);
    req.auth = authObj;

    // Get all audits ordered by URL and date
    const audits = await pool.query(
      `SELECT id, url, checks, issues, created_at
       FROM audits
       WHERE clerk_id = $1
       ORDER BY url ASC, created_at ASC`,
      [req.auth?.userId]
    );

    // Get description count
    const gens = await pool.query(
      `SELECT COUNT(*) as count FROM generations WHERE clerk_id = $1`,
      [req.auth?.userId]
    );

    // Normalize URL (remove trailing slash for grouping)
    function normalizeUrl(url) {
      return url.replace(/\/$/, '');
    }

    // Group by normalized URL
    const grouped = {};
    for (const row of audits.rows) {
      const url = normalizeUrl(row.url);
      if (!grouped[url]) grouped[url] = [];
      const checks = row.checks || {};
      const issues = row.issues || {};
      const keys = Object.keys(checks);
      const passed = keys.filter(k => checks[k]).length;
      const total = keys.length || 1;
      const score = Math.round((passed / total) * 100);

      // Detect type from check keys
      const isAi = keys.includes('llmsTxt') || keys.includes('aiCrawlers') || keys.includes('orgSchema');
      const isVisibilityCheck = keys.includes('mentionSummary');
      const type = isVisibilityCheck ? 'visibility' : isAi ? 'ai' : 'seo';

      grouped[url].push({
        id: row.id,
        date: row.created_at,
        score,
        passed,
        total,
        type,
        issues: Object.entries(issues).map(([key, msg]) => ({ key, msg })),
        checks,
      });
    }

    // Build timeline per URL — newest first, calculate fixes between runs
    const urls = Object.entries(grouped).map(([url, runs]) => {
      // runs are oldest first (from ORDER BY ASC), calculate fixes forward
      const timelineAsc = runs.map((run, i) => {
        let fixed = [];
        if (i > 0) {
          const prev = runs[i - 1];
          fixed = Object.keys(run.checks).filter(
            k => run.checks[k] === true && prev.checks[k] === false
          );
        }
        return { ...run, fixed };
      });

      // Reverse to show newest first
      const timeline = [...timelineAsc].reverse();

      const latest = timelineAsc[timelineAsc.length - 1];
      const first = timelineAsc[0];
      return {
        url,
        type: latest.type,
        latestScore: latest.score,
        firstScore: first.score,
        improvement: latest.score - first.score,
        runs: timeline.length,
        timeline,
      };
    });

    // Sort URLs by latest audit date descending
    urls.sort((a, b) => new Date(b.timeline[0].date) - new Date(a.timeline[0].date));

    res.json({
      urls,
      totalAudits: audits.rows.length,
      totalDescriptions: parseInt(gens.rows[0].count),
    });

  } catch (err) {
    console.error("GET /api/dashboard error:", err);
    res.status(500).json({ error: "Failed to load dashboard" });
  }
});

// ── DAILY CRON: Re-engagement emails ─────────────────────────
// Runs every day at 10:00 UTC
// Sends re-engagement email to users who signed up 3 days ago with zero activity
async function runReengagementCron() {
  console.log("[cron] Running re-engagement check...");
  try {
    // Find users who signed up 3 days ago (between 72h and 96h ago)
    const users = await pool.query(`
      SELECT u.clerk_id, u.email, u.created_at
      FROM users u
      WHERE u.created_at BETWEEN NOW() - INTERVAL '96 hours' AND NOW() - INTERVAL '72 hours'
      AND u.email IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM generations g WHERE g.clerk_id = u.clerk_id)
      AND NOT EXISTS (SELECT 1 FROM audits a WHERE a.clerk_id = u.clerk_id)
      AND NOT EXISTS (SELECT 1 FROM visibility_checks v WHERE v.clerk_id = u.clerk_id)
    `);
    console.log(`[cron] Found ${users.rows.length} inactive users to re-engage`);
    for (const user of users.rows) {
      await sendReengagementEmail(user.email);
      await new Promise(r => setTimeout(r, 200)); // Rate limit: 5/sec
    }
  } catch (err) {
    console.error("[cron] Re-engagement cron error:", err.message);
  }
}

// Schedule daily at 10:00 UTC
function scheduleCron() {
  const now = new Date();
  const next = new Date();
  next.setUTCHours(10, 0, 0, 0);
  if (next <= now) next.setUTCDate(next.getUTCDate() + 1);
  const msUntilNext = next - now;
  setTimeout(() => {
    runReengagementCron();
    setInterval(runReengagementCron, 24 * 60 * 60 * 1000);
  }, msUntilNext);
  console.log(`[cron] Re-engagement cron scheduled, next run in ${Math.round(msUntilNext / 60000)} minutes`);
}
scheduleCron();

// ── START SERVER ─────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`ShopifyDescribe API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

