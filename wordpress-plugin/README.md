# AI Suite — WordPress + WooCommerce Plugin

Complete WordPress plugin that integrates the AI Suite SaaS platform with WooCommerce.

---

## What It Does

- **Auto-creates 8 WooCommerce products** (3 subscription plans + 5 tool bundles) on activation
- **Token credit system** — grants tokens on purchase, resets on subscription renewal
- **JWT authentication** — issues tokens so users log into the AI Suite app via their WordPress account
- **REST API webhooks** — AI Suite app and N8N workflows can deduct/sync tokens via the WordPress API
- **Admin panel** — manage plans, set API keys, adjust user token balances
- **Shortcodes** — embed the AI Suite app or individual tools directly into any WordPress page

---

## Installation

1. Upload the `ai-suite-woocommerce/` folder to `/wp-content/plugins/`
2. Activate through **Plugins > Installed Plugins**
3. Go to **AI Suite > Settings** in the WordPress admin

---

## Configuration

### Required Settings (AI Suite > Settings)

| Setting | Value |
|---|---|
| AI Suite App URL | Your Replit app URL (e.g. `https://your-app.replit.app`) |
| Admin API Key | A secret key you invent — use the same value in your API server |
| JWT Secret | Must match `JWT_SECRET` env var in the Replit API server |
| N8N Base URL | Your N8N instance URL |
| Gemini API Key | Your Google Gemini API key |

### Environment Variables (Replit)

Set these in your Replit app secrets:
- `JWT_SECRET` — same as the WordPress JWT Secret setting
- `GEMINI_API_KEY` — your Google Gemini API key
- `ADMIN_API_KEY` — same as the WordPress Admin API Key setting

---

## Shortcodes

### Full App Embed
```
[ai_suite_embed]
[ai_suite_embed height="900px"]
[ai_suite_embed page="dashboard"]
```

### Single Tool Embed
```
[ai_suite_tool tool="chat"]
[ai_suite_tool tool="writer" height="600px"]
[ai_suite_tool tool="image-generator"]
[ai_suite_tool tool="sql"]
```

All tool IDs: `chat`, `writer`, `blog-post`, `article-writer`, `content-improver`, `summary`, `headline-generator`, `grammar`, `paraphraser`, `social`, `instagram-caption`, `twitter-thread`, `linkedin-post`, `hashtag-generator`, `marketing-plan`, `facebook-ads`, `google-ads`, `email`, `business-plan`, `resume`, `swot-analysis`, `sales-pitch`, `pitch-deck`, `sql`, `bug-fix`, `code-reviewer`, `api-docs`, `readme-generator`, `unit-test`, `docker-compose`, `quiz`, `lesson-plan`, `study-guide`, `flashcard-generator`, `math-solver`, `recipe`, `song-lyrics`, `privacy-policy`, `terms-of-service`, `meta-description`, `keyword-research`, `schema-markup`, `finance`, `meal-plan`, `research-agent`, `marketing-agent`

### Login Form
```
[ai_suite_login]
```
Authenticates the WordPress user and redirects them into the AI Suite app with a JWT token.

### Token Balance
```
[ai_suite_token_balance]
```
Shows the logged-in user's current token balance.

---

## REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/wp-json/ai-suite/v1/token` | Issue JWT token (body: username, password) |
| POST | `/wp-json/ai-suite/v1/verify` | Verify a JWT token |
| GET  | `/wp-json/ai-suite/v1/me` | Get current user (requires Bearer token) |
| POST | `/wp-json/ai-suite/v1/deduct-tokens` | Deduct tokens (requires X-API-Key header) |
| POST | `/wp-json/ai-suite/v1/sync-user` | Sync token balance (requires X-API-Key header) |
| GET  | `/wp-json/ai-suite/v1/token-balance?email=x` | Get balance (requires X-API-Key header) |

---

## N8N Workflow Integration

1. Import any of the workflow JSON files from the `n8n-workflows/` folder
2. Set the `GEMINI_API_KEY` environment variable in N8N
3. Activate the workflows
4. Copy the webhook URLs from N8N
5. In the AI Suite admin panel, paste webhook URLs per tool to route traffic through N8N

### Webhook Paths (after import)
- `POST /webhook/ai-suite/core` — Chat, Code, Translator, Game Maker, Website Builder
- `POST /webhook/ai-suite/writing` — Writer, Blog Post, Article Writer, Grammar, Summarizer
- `POST /webhook/ai-suite/social` — Instagram, Twitter, LinkedIn, YouTube, Hashtags
- `POST /webhook/ai-suite/marketing` — Marketing Plan, Facebook/Google Ads, Email, Calendar
- `POST /webhook/ai-suite/business` — Business Plan, Resume, SWOT, Sales Pitch, Contracts
- `POST /webhook/ai-suite/development` — SQL, Bug Fix, Code Review, Unit Tests, Docker
- `POST /webhook/ai-suite/education` — Quiz, Lesson Plan, Study Guide, Flashcards, Math
- `POST /webhook/ai-suite/creative` — Recipe, Story Ideas, Characters, Song Lyrics, Jokes
- `POST /webhook/ai-suite/legal` — Privacy Policy, Terms of Service, Disclaimers
- `POST /webhook/ai-suite/seo` — Keywords, Meta Descriptions, Schema Markup, SEO Audit
- `POST /webhook/ai-suite/finance` — Financial Analysis, Trading Signals
- `POST /webhook/ai-suite/personal` — Meal Plan, Workout, Goal Setting, Journal Prompts
- `POST /webhook/ai-suite/agents` — Research Agent, Marketing Agent, Code Agent, Writing Agent

---

## WooCommerce Products Created

| Product | Price | Tokens |
|---|---|---|
| AI Suite — Starter | $9/month | 5,000 |
| AI Suite — Pro | $29/month | 25,000 |
| AI Suite — Enterprise | $99/month | Unlimited |
| Writing Bundle | $4.99/month | 2,000 |
| Social Media Bundle | $4.99/month | 2,000 |
| Developer Bundle | $7.99/month | 3,000 |
| Business Bundle | $6.99/month | 2,500 |
