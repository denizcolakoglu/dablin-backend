// ============================================================
//  ShopifyDescribe — Claude API Prompt Engine
//  Drop this file into your Node.js backend as /lib/prompt.js
// ============================================================

const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env

// ── TONE DEFINITIONS ─────────────────────────────────────────
const TONES = {
  professional: "authoritative, clear, and trust-building. Use precise language. Avoid hype words like 'amazing' or 'revolutionary'.",
  friendly:     "warm, conversational, and approachable. Write like a helpful friend recommending a product. Use contractions.",
  luxury:       "elegant, aspirational, and exclusive. Use sensory language. Evoke desire and status. Never use discount-oriented language.",
  playful:      "energetic, fun, and a little cheeky. Use light humor where appropriate. Speak directly to the reader as 'you'.",
};

// ── SYSTEM PROMPT ────────────────────────────────────────────
// This is the most important part of the product.
// It instructs Claude to behave as a Shopify SEO expert
// and return strictly valid JSON — nothing else.

const SYSTEM_PROMPT = `You are an expert Shopify product copywriter and SEO specialist with deep knowledge of:
- Shopify's exact SEO character limits and HTML structure
- E-commerce conversion copywriting
- Google's product listing ranking factors
- Shopify's liquid templating and how descriptions render in storefronts

Your ONLY job is to generate product listing content that is:
1. Perfectly formatted for Shopify — correct HTML tags, correct character limits
2. SEO-optimized for Google Shopping and organic search
3. Conversion-focused — written to make shoppers click "Add to Cart"

STRICT OUTPUT RULES:
- Respond ONLY with a valid JSON object. No preamble, no explanation, no markdown fences.
- Never exceed character limits — if you must choose between SEO richness and the limit, respect the limit.
- The body_html must use only these HTML tags: <p>, <ul>, <li>, <strong>, <em>. No <h1>, <h2>, <div>, <span>, <br>, or inline styles.
- Never invent features or claims not present in the input. Only expand and polish what is given.
- Never use these overused words: amazing, revolutionary, game-changer, best-in-class, cutting-edge, state-of-the-art, ultimate.

SHOPIFY SEO RULES YOU MUST FOLLOW:
- Product title: maximum 70 characters. Must include the primary keyword naturally. Format: [Keyword-rich name] – [Key differentiator]
- Meta description: maximum 155 characters. Must include a call to action. Must include the primary keyword.
- Body HTML: 150–300 words recommended. Open with the customer benefit, not the product feature. Close with a subtle CTA.
- Bullet points (used in the features array): start each with a strong verb or key noun. Maximum 12 words each.
- Tags: lowercase, hyphenated, specific. Mix product type + material + use case + audience tags.`;

// ── BUILD USER PROMPT ─────────────────────────────────────────
// This constructs the per-request prompt from user input.

function buildUserPrompt({ productName, category, features, targetAudience, tone, brandName }) {
  const toneInstruction = TONES[tone] || TONES.professional;

  return `Generate a complete Shopify product listing for the following product.

PRODUCT INPUT:
- Product name: ${productName}
- Category: ${category}
- Key features / specs: ${features}
- Target audience: ${targetAudience || "general consumers"}
- Brand name: ${brandName || "not specified"}
- Writing tone: ${toneInstruction}

Return ONLY this JSON object with ALL fields populated:

{
  "title": "string — max 70 chars, SEO-optimized, includes primary keyword",
  "meta_description": "string — max 155 chars, includes keyword + call to action",
  "body_html": "string — valid Shopify HTML, 150-300 words, <p> and <ul><li> only",
  "feature_bullets": ["string", "string", "string", "string", "string"],
  "tags": ["string", "string", "string", "string", "string", "string", "string"],
  "seo_score": {
    "title_length": number,
    "meta_length": number,
    "keyword_in_title": true or false,
    "keyword_in_meta": true or false,
    "body_word_count": number
  }
}

Rules reminder:
- title: HARD LIMIT 70 characters
- meta_description: HARD LIMIT 155 characters  
- feature_bullets: exactly 5 bullets, each max 12 words
- tags: exactly 7 tags, all lowercase, use hyphens not spaces
- body_html: open with customer benefit, no invented claims, close with soft CTA`;
}

// ── VALIDATE OUTPUT ───────────────────────────────────────────
// Catches common AI mistakes before sending to the user.

function validateOutput(data) {
  const errors = [];

  if (!data.title)            errors.push("Missing title");
  if (!data.meta_description) errors.push("Missing meta_description");
  if (!data.body_html)        errors.push("Missing body_html");
  if (!data.feature_bullets)  errors.push("Missing feature_bullets");
  if (!data.tags)             errors.push("Missing tags");

  if (data.title && data.title.length > 70)
    errors.push(`Title too long: ${data.title.length} chars (max 70)`);

  if (data.meta_description && data.meta_description.length > 155)
    errors.push(`Meta description too long: ${data.meta_description.length} chars (max 155)`);

  if (data.feature_bullets && data.feature_bullets.length !== 5)
    errors.push(`Expected 5 feature bullets, got ${data.feature_bullets.length}`);

  if (data.tags && data.tags.length !== 7)
    errors.push(`Expected 7 tags, got ${data.tags.length}`);

  // Check for forbidden HTML tags in body
  const forbiddenTags = ["<h1", "<h2", "<h3", "<div", "<span", "<br", "style="];
  forbiddenTags.forEach(tag => {
    if (data.body_html && data.body_html.includes(tag))
      errors.push(`body_html contains forbidden tag/attribute: ${tag}`);
  });

  return errors;
}

// ── GENERATE WITH AUTO-RETRY ──────────────────────────────────
// If validation fails (e.g. title too long), we re-prompt once
// with the specific errors — Claude almost always fixes them.

async function generateDescription(input, retryCount = 0) {
  const MAX_RETRIES = 1;

  const messages = [
    { role: "user", content: buildUserPrompt(input) }
  ];

  // On retry: append the validation errors so Claude self-corrects
  if (retryCount > 0 && input._lastErrors) {
    messages.push({
      role: "assistant",
      content: input._lastRawOutput
    });
    messages.push({
      role: "user",
      content: `Your previous response had these validation errors:\n${input._lastErrors.join("\n")}\n\nPlease fix them and return the corrected JSON only.`
    });
  }

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001", // Fast + cheap — perfect for per-credit billing
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages,
  });

  const rawText = response.content
    .filter(block => block.type === "text")
    .map(block => block.text)
    .join("");

  // Strip any accidental markdown fences
  const cleanJson = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(cleanJson);
  } catch (err) {
    throw new Error(`Claude returned invalid JSON: ${rawText.slice(0, 200)}`);
  }

  // Validate the output
  const errors = validateOutput(parsed);

  if (errors.length > 0 && retryCount < MAX_RETRIES) {
    console.warn(`Validation failed (attempt ${retryCount + 1}), retrying...`, errors);
    return generateDescription({
      ...input,
      _lastErrors: errors,
      _lastRawOutput: cleanJson,
    }, retryCount + 1);
  }

  if (errors.length > 0) {
    // After retry, return best-effort result with warnings
    console.error("Validation still failing after retry:", errors);
    parsed._warnings = errors;
  }

  // Attach usage stats for credit/cost tracking
  parsed._usage = {
    input_tokens: response.usage.input_tokens,
    output_tokens: response.usage.output_tokens,
    model: response.model,
  };

  return parsed;
}

// ── GENERATE BULK ─────────────────────────────────────────────
// Processes an array of product inputs sequentially.
// Pass an onProgress callback to stream status to the frontend.

async function generateBulk(products, onProgress) {
  const results = [];

  for (let i = 0; i < products.length; i++) {
    try {
      const result = await generateDescription(products[i]);
      results.push({ index: i, status: "success", data: result });
    } catch (err) {
      results.push({ index: i, status: "error", error: err.message });
    }

    if (onProgress) {
      onProgress({ completed: i + 1, total: products.length });
    }

    // Small delay between requests to avoid rate limits
    if (i < products.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  return results;
}

module.exports = { generateDescription, generateBulk };


// ============================================================
//  EXAMPLE EXPRESS ROUTE — paste into your routes/generate.js
// ============================================================
//
//  const express = require("express");
//  const router = express.Router();
//  const { generateDescription } = require("../lib/prompt");
//  const { requireAuth } = require("@clerk/express");
//  const db = require("../db"); // your PostgreSQL client
//
//  router.post("/generate", requireAuth(), async (req, res) => {
//    const userId = req.auth.userId;
//
//    // 1. Check credit balance
//    const user = await db.query(
//      "SELECT credits FROM users WHERE clerk_id = $1", [userId]
//    );
//    if (!user.rows[0] || user.rows[0].credits < 1) {
//      return res.status(402).json({ error: "Insufficient credits" });
//    }
//
//    // 2. Generate
//    const { productName, category, features, targetAudience, tone, brandName } = req.body;
//    const result = await generateDescription({
//      productName, category, features, targetAudience, tone, brandName
//    });
//
//    // 3. Deduct credit + save to history (atomic transaction)
//    await db.query("BEGIN");
//    await db.query(
//      "UPDATE users SET credits = credits - 1 WHERE clerk_id = $1", [userId]
//    );
//    await db.query(
//      "INSERT INTO generations (user_id, input_json, output_json) VALUES ($1, $2, $3)",
//      [userId, JSON.stringify(req.body), JSON.stringify(result)]
//    );
//    await db.query("COMMIT");
//
//    res.json(result);
//  });
//
//  module.exports = router;
// ============================================================


// ============================================================
//  QUICK TEST — run with: node prompt.js
// ============================================================

async function test() {
  console.log("Testing ShopifyDescribe prompt engine...\n");

  const result = await generateDescription({
    productName:    "Bamboo Cutting Board Set",
    category:       "Kitchen & Dining",
    features:       "3-piece set (small, medium, large), organic bamboo, juice grooves, non-slip feet, dishwasher safe, includes hanging loop",
    targetAudience: "Home cooks and cooking enthusiasts",
    tone:           "friendly",
    brandName:      "GreenKitchen",
  });

  console.log("=== GENERATED OUTPUT ===\n");
  console.log("TITLE:", result.title);
  console.log("Title length:", result.title?.length, "chars (max 70)");
  console.log("\nMETA DESCRIPTION:", result.meta_description);
  console.log("Meta length:", result.meta_description?.length, "chars (max 155)");
  console.log("\nFEATURE BULLETS:");
  result.feature_bullets?.forEach((b, i) => console.log(`  ${i+1}. ${b}`));
  console.log("\nTAGS:", result.tags?.join(", "));
  console.log("\nBODY HTML (first 300 chars):");
  console.log(result.body_html?.slice(0, 300) + "...");
  console.log("\nSEO SCORE:", result.seo_score);

  if (result._warnings) {
    console.log("\n⚠️  WARNINGS:", result._warnings);
  } else {
    console.log("\n✅ All validations passed");
  }

  console.log("\nAPI USAGE:", result._usage);
}

// Uncomment to run the test:
test().catch(console.error);
