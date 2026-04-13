#!/usr/bin/env node
// send-push.js - CLI to send push notifications
// Usage: node send-push.js "Title" "Body message" "https://optional-url.com"

const API_URL = process.env.API_URL || 'https://api.dablin.co';
const ADMIN_KEY = process.env.PUSH_ADMIN_KEY;

async function sendPush() {
  const [,, title, body, url] = process.argv;

  if (!title || !body) {
    console.log('Usage: node send-push.js "Title" "Body message" "https://optional-url.com"');
    console.log('');
    console.log('Environment variables:');
    console.log('  API_URL       - API endpoint (default: https://api.dablin.co)');
    console.log('  PUSH_ADMIN_KEY - Admin key for authentication');
    process.exit(1);
  }

  if (!ADMIN_KEY) {
    console.error('Error: PUSH_ADMIN_KEY environment variable is required');
    process.exit(1);
  }

  console.log('Sending push notification...');
  console.log(`  Title: ${title}`);
  console.log(`  Body: ${body}`);
  if (url) console.log(`  URL: ${url}`);

  try {
    const response = await fetch(`${API_URL}/api/push/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, url, adminKey: ADMIN_KEY })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Error:', result.error || 'Failed to send');
      process.exit(1);
    }

    console.log('');
    console.log('✓ Push sent successfully');
    console.log(`  Sent: ${result.sent}`);
    console.log(`  Failed: ${result.failed}`);
    console.log(`  Total subscribers: ${result.total}`);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

sendPush();
