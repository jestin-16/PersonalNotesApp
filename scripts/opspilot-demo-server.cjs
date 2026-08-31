const express = require('express');
const { initOpsPilot, requestTracker } = require('opspilot-logger');

const webhookUrl = process.env.OPSPILOT_WEBHOOK_URL;
const sourceService = process.env.OPSPILOT_SOURCE_SERVICE || 'notes-app';
const port = Number(process.env.PORT || 4000);

if (!webhookUrl) {
  console.error('Missing OPSPILOT_WEBHOOK_URL. Set it in your environment before starting this server.');
  process.exit(1);
}

initOpsPilot({
  webhookUrl,
  sourceService,
  batchSize: 10,
  flushIntervalMs: 5000,
});

const app = express();
app.use(requestTracker);

app.get('/health', (_req, res) => {
  console.log('Health endpoint hit');
  res.json({ ok: true, service: sourceService });
});

app.get('/error', () => {
  throw new Error('Intentional test error');
});

app.use((err, _req, res, _next) => {
  console.error('Unhandled route error:', err.message);
  res.status(500).json({ ok: false, error: err.message });
});

app.listen(port, () => {
  console.log(`OpsPilot demo server listening on http://localhost:${port}`);
});
