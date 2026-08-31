const { initOpsPilot, flushLogs } = require('opspilot-logger');

// --- LOCALTUNNEL BYPASS PATCH ---
const originalFetch = global.fetch;
global.fetch = function(url, options = {}) {
  if (url && url.includes('loca.lt')) {
    options.headers = { ...options.headers, 'Bypass-Tunnel-Reminder': 'true' };
  }
  return originalFetch(url, options);
};
// --------------------------------

const webhookUrl = process.env.OPSPILOT_WEBHOOK_URL;
const sourceService = process.env.OPSPILOT_SOURCE_SERVICE || 'notes-app';

if (!webhookUrl) {
  console.error('Missing OPSPILOT_WEBHOOK_URL. Set it in your environment before running this script.');
  process.exit(1);
}

initOpsPilot({
  webhookUrl,
  sourceService,
  batchSize: 10,
  flushIntervalMs: 5000,
});

console.log('OpsPilot smoke test started');
console.info('Application started successfully');
console.warn('Sample warning log');
console.error('Sample error log');

setTimeout(async () => {
  await flushLogs();
  console.log('OpsPilot smoke test finished');
  process.exit(0);
}, 1200);
