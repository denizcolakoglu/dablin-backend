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
    "INSERT INTO users (clerk_id, email, credits) VALUES ($1, $2, 7) RETURNING *",
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
      success_url: `${process.env.FRONTEND_URL}/?payment=success&credits=${pkg.credits}`,
      cancel_url:  `${process.env.FRONTEND_URL}/`,
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

    if (user.credits < 5) {
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
      return res.status(400).json({ error: `Could not fetch page: ${response.status}` });
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
          "UPDATE users SET credits = credits - 5 WHERE clerk_id = $1",
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

    if (user.credits < 5) {
      return res.status(402).json({ error: "Insufficient credits. AEO Audit costs 5 credits.", credits: user.credits });
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

    if (!response.ok) return res.status(400).json({ error: `Could not fetch page: ${response.status}` });

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
        await client.query("UPDATE users SET credits = credits - 5 WHERE clerk_id = $1", [req.auth?.userId]);
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

// ── POST /api/visibility-check ───────────────────────────────
// Queries Claude, GPT-4o, Gemini with 5 brand queries, returns mention table
// Costs 7 credits
app.post("/api/visibility-check", requireAuth(), async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "url is required" });
  try { new URL(url); } catch { return res.status(400).json({ error: "Invalid URL format" }); }

  try {
    const authObj = getAuth(req);
    req.auth = authObj;
    const user = await getOrCreateUser(req.auth?.userId, req.auth.sessionClaims?.email);

    if (user.credits < 7) {
      return res.status(402).json({ error: "Insufficient credits. AI Visibility Check costs 7 credits.", credits: user.credits });
    }

    // Step 1: Scrape page to extract brand name + topic
    const fetch = (await import("node-fetch")).default;
    const pageRes = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; DablinBot/1.0)" },
      timeout: 10000,
    });
    if (!pageRes.ok) return res.status(400).json({ error: `Could not fetch page: ${pageRes.status}` });

    const html = await pageRes.text();
    const cheerio = require("cheerio");
    const $ = cheerio.load(html);
    const pageTitle = $("title").text().trim() || url;
    const metaDesc = $('meta[name="description"]').attr("content") || $('meta[property="og:description"]').attr("content") || "";
    const h1 = $("h1").first().text().trim() || "";
    const bodySnippet = $("body").text().replace(/\s+/g, " ").trim().substring(0, 600);
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname.replace("www.", "");

    // Step 2: Use Claude to extract brand name + generate 5 queries
    const brandMsg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [{
        role: "user",
        content: `Extract the brand name and generate 5 search queries for this website.
URL: ${url}
Title: ${pageTitle}
Meta: ${metaDesc}
H1: ${h1}
Content: ${bodySnippet}

Return ONLY valid JSON in this exact format, no explanation:
{
  "brand": "BrandName",
  "queries": [
    "query 1",
    "query 2",
    "query 3",
    "query 4",
    "query 5",
    "query 6",
    "query 7"
  ]
}

Rules for queries:
- Generate exactly 7 queries total
- Queries 1-4: how a potential customer searches for this type of product (natural language, 4-8 words, no brand name)
- Query 5: "best [product category] tools" or "top [product category] software"
- Query 6: "[product category] reviews" or "best [product category] reviewed"  
- Query 7: "[product category] alternatives" or "[product category] compared"
- Cover different angles: category search, alternatives, comparisons, reviews`
      }]
    });

    let brand = domain;
    let queries = [];
    try {
      const raw = brandMsg.content[0].text.trim();
      console.log("[visibility-check] brand extraction raw:", raw.substring(0, 200));
      const clean = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(clean);
      brand = parsed.brand || domain;
      queries = parsed.queries || [];
    } catch (e) {
      console.error("[visibility-check] brand parse error:", e.message, brandMsg.content[0].text.substring(0, 200));
      return res.status(500).json({ error: "Failed to extract brand information from page." });
    }

    if (queries.length === 0) {
      return res.status(500).json({ error: "Could not generate queries for this page." });
    }

    // Step 3: Query each AI with each query in parallel
    const brandLower = brand.toLowerCase();

    const queryPrompt = (query) =>
      `${query}\n\nRespond ONLY with a valid JSON object, no explanation, no markdown:\n{"response": "your answer here listing 5+ specific named tools or services", "brands": ["BrandName1", "BrandName2"], "platforms": ["G2", "Reddit"]}\n\nRules:\n- "brands": only real product/company brand names that are direct competitors or alternatives (NOT generic words, NOT the user's brand "${brand}")\n- "platforms": only known review sites, directories, or communities where these tools can be found (G2, Capterra, Gartner, GetApp, Software Advice, Trustpilot, TrustRadius, AlternativeTo, SaasHub, Product Hunt, BetaList, Hacker News, Reddit, Quora, Indie Hackers, TechCrunch, GitHub, Medium, Substack, LinkedIn, AppSumo, Clutch, Crunchbase)\n- Both arrays should only contain names explicitly mentioned in your response`;

    async function queryClause(query) {
      try {
        const msg = await anthropic.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 600,
          messages: [{ role: "user", content: queryPrompt(query) }]
        });
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
      } catch { return { mentioned: false, brands: [], platforms: [], competitors: [], snippet: "" }; }
    }

    async function queryGPT(query) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          max_tokens: 600,
          messages: [{ role: "user", content: queryPrompt(query) }]
        });
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
      } catch { return { mentioned: false, brands: [], platforms: [], competitors: [], snippet: "" }; }
    }

    async function queryGemini(query) {
      try {
        const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(queryPrompt(query));
        const text = result.response.text();
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
      } catch { return { mentioned: false, brands: [], platforms: [], competitors: [], snippet: "" }; }
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

    // Run all 15 queries in parallel (5 queries × 3 AIs)
    const results = await Promise.all(queries.map(async (query) => {
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
    try {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query("UPDATE users SET credits = credits - 7 WHERE clerk_id = $1", [req.auth?.userId]);
        await client.query("COMMIT");
      } catch (dbErr) {
        await client.query("ROLLBACK");
      } finally {
        client.release();
      }
    } catch {}

    const updated = await pool.query("SELECT credits FROM users WHERE clerk_id = $1", [req.auth?.userId]);

    res.json({
      url,
      brand,
      queries,
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
// Returns generation counts per day for the last 7 days
app.get("/api/usage/daily", requireAuth(), async (req, res) => {
  try {
    const authObj = getAuth(req);
    req.auth = authObj;

    const result = await pool.query(
      `SELECT DATE(created_at) as day, COUNT(*) as count
       FROM generations
       WHERE clerk_id = $1
         AND created_at >= NOW() - INTERVAL '7 days'
       GROUP BY DATE(created_at)
       ORDER BY day ASC`,
      [req.auth?.userId]
    );

    // Fill in missing days with 0
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

// ── START SERVER ─────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`ShopifyDescribe API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

