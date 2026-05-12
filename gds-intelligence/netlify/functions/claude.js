// netlify/functions/claude.js
// Proxy for Anthropic API — API key stays server-side, never exposed to browser.

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-5';

// Simple in-memory rate limiting per IP (resets on function cold start)
const rateLimitMap = {};
const RATE_LIMIT = 20;      // max requests
const RATE_WINDOW = 60000;  // per 60 seconds

function checkRateLimit(ip) {
  const now = Date.now();
  if (!rateLimitMap[ip]) rateLimitMap[ip] = { count: 0, start: now };
  const entry = rateLimitMap[ip];
  if (now - entry.start > RATE_WINDOW) { entry.count = 0; entry.start = now; }
  entry.count++;
  return entry.count <= RATE_LIMIT;
}

exports.handler = async (event) => {
  // CORS — allow any origin so teammates can access from anywhere
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // Rate limit by IP
  const ip = event.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  if (!checkRateLimit(ip)) {
    return { statusCode: 429, headers: corsHeaders, body: JSON.stringify({ error: 'Too many requests. Please wait a moment.' }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'API key not configured on server.' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const { system, prompt, maxTokens } = body;
  if (!system || !prompt) {
    return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Missing system or prompt' }) };
  }

  try {
    const response = await fetch(ANTHROPIC_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens || 900,
        temperature: 0,
        system,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return {
        statusCode: response.status,
        headers: corsHeaders,
        body: JSON.stringify({ error: err.error?.message || `Anthropic API error ${response.status}` })
      };
    }

    const data = await response.json();
    const text = (data.content || []).find(b => b.type === 'text')?.text || '';
    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ text }) };

  } catch (err) {
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: err.message }) };
  }
};
