<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1nikBgkKlXKefl4xUe3UjPaDBmtD0qOhe

## Run Locally

Use Node.js 22 or later. Install dependencies with `npm ci` and start the dashboard with `npm run dev`. The Vite dev server serves the dashboard without AI.

To run both the dashboard and its server endpoint, use `vercel dev` in the linked ImpactSphere project. AI generation requires the server-only `POSTGRES_URL_POSTGRES_URL` connection to Neon with [the quota migration](migrations/001_gemini_quota.sql) applied. Only quota counters are stored in this schema. Server requests use the project's Vercel OIDC identity for Gemini through AI Gateway. An explicit server-only `GEMINI_API_KEY` selects Google's direct API instead.

Run the API contract tests with `node --test tests/gemini.test.mjs`.
