const endpoint = process.env.OPSPILOT_WEBHOOK_URL;
const secret = process.env.OPSPILOT_SECRET;
const sourceService = process.env.OPSPILOT_SOURCE_SERVICE || 'notes-app';

if (!endpoint) {
  console.error('Missing OPSPILOT_WEBHOOK_URL');
  process.exit(1);
}

if (!secret) {
  console.error('Missing OPSPILOT_SECRET');
  process.exit(1);
}

const payload = [
  {
    level: 'INFO',
    message: 'Application started successfully',
    timestamp: new Date().toISOString(),
    sourceService,
  },
];

async function send() {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${secret}`,
      'x-api-key': secret,
      'x-opspilot-secret': secret,
    },
    body: JSON.stringify(payload),
  });

  const body = await response.text();
  console.log('status:', response.status, response.statusText);
  console.log('response:', body || '<empty>');

  if (!response.ok) {
    process.exit(1);
  }
}

send().catch((error) => {
  console.error('Failed to send direct OpsPilot log:', error.message);
  process.exit(1);
});
