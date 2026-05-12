# GDS CHRO Intelligence — Deploy Guide
## One-time setup. Takes about 5 minutes.

---

## What this is
A private web app for your team to score HR tech companies for CHRO Summit
sponsorship fit, generate outreach messages, and map buyer titles — all powered
by Claude. No API key needed by users. You add it once to Netlify and it's
hidden on the server.

---

## Step 1 — Create a free Netlify account
Go to https://netlify.com and sign up. Free tier is more than enough.

---

## Step 2 — Deploy from this folder

### Option A — Drag and drop (easiest, no Git needed)
1. Go to https://app.netlify.com
2. Click **"Add new site" → "Deploy manually"**
3. Drag the entire `gds-intelligence` folder onto the upload area
4. Netlify will deploy it in about 30 seconds
5. You'll get a URL like `https://random-name-123.netlify.app`

### Option B — GitHub (best for updates)
1. Push this folder to a private GitHub repo
2. In Netlify: **"Add new site" → "Import from Git"**
3. Connect your GitHub, select the repo, click Deploy
4. Future updates: just push to GitHub and Netlify auto-redeploys

---

## Step 3 — Add your Anthropic API key (critical)

This is the only technical step. The key lives on Netlify's servers — 
your teammates never see it.

1. In your Netlify site dashboard, go to:
   **Site configuration → Environment variables → Add a variable**
2. Key: `ANTHROPIC_API_KEY`
3. Value: your Anthropic API key (starts with `sk-ant-...`)
4. Click Save
5. Go to **Deploys → Trigger deploy → Deploy site** to apply it

Get your API key at: https://console.anthropic.com

---

## Step 4 — Share with your team
Copy the Netlify URL (e.g. `https://gds-chro-intel.netlify.app`) and send it.
That's it. No login, no setup, works on any device.

---

## Optional — Custom domain
In Netlify: **Domain management → Add custom domain**
You can use something like `intel.gdsgroup.com` if your IT team can add a DNS record.

---

## Folder structure (for reference)
```
gds-intelligence/
├── netlify.toml              ← Netlify config (don't edit)
├── netlify/
│   └── functions/
│       └── claude.js         ← Server proxy (holds your API key)
└── public/
    └── index.html            ← The actual tool your team uses
```

---

## Cost
- Netlify free tier: 125,000 function calls/month — plenty for a team
- Anthropic API: roughly $0.01–0.03 per company analysed (claude-sonnet-4-5)
- A team of 5 running 20 analyses/day = ~$30–90/month in API costs

---

## Questions?
If anything goes wrong, the most common issue is Step 3 — make sure you
redeploy after adding the environment variable, otherwise the function
won't pick it up.
