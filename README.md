<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/1f730e07-1cb0-4ed7-934c-5a0d0fd37033

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## OpsPilot Logging Setup

This project includes server-side scripts for sending logs to OpsPilot. Do not place OpsPilot secrets in frontend files.

1. Add these values in your local environment file:
   - OPSPILOT_WEBHOOK_URL
   - OPSPILOT_SECRET
   - OPSPILOT_SOURCE_SERVICE (optional, default: notes-app)

2. Run a basic logger smoke test:
   `npm run opspilot:test`

3. Run a direct authenticated webhook test:
   `npm run opspilot:direct-test`

4. Run a demo Express server with request tracking middleware:
   `npm run opspilot:server`

If you get 401 Unauthorized, verify the webhook auth mode and secret format expected by your OpsPilot backend.
