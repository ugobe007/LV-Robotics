#!/usr/bin/env node
// One-time helper: run Meetup's OAuth2 authorization-code flow and print a
// long-lived refresh token to store as a Supabase secret.
//
// Prereqs:
//   1. Create an OAuth client at https://www.meetup.com/api/oauth/list/
//   2. Set its "Redirect URI" to EXACTLY:  http://127.0.0.1:8910/callback
//      (Meetup rejects bare "localhost"; the loopback IP works.)
//   3. Put MEETUP_CLIENT_ID and MEETUP_CLIENT_SECRET in config/secrets.env
//      (or export them as env vars).
//
// Run:  node scripts/meetup-oauth.mjs
// Then approve in the browser. The refresh token prints in the terminal.

import http from "node:http";
import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";

const REDIRECT_URI = process.env.MEETUP_REDIRECT_URI || "http://127.0.0.1:8910/callback";
const PORT = 8910;

function loadSecrets() {
  const out = {};
  try {
    const txt = readFileSync(new URL("../config/secrets.env", import.meta.url), "utf8");
    for (const line of txt.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) out[m[1]] = m[2];
    }
  } catch { /* file optional */ }
  return out;
}

const secrets = loadSecrets();
const CLIENT_ID = process.env.MEETUP_CLIENT_ID || secrets.MEETUP_CLIENT_ID;
const CLIENT_SECRET = process.env.MEETUP_CLIENT_SECRET || secrets.MEETUP_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("ERROR: Set MEETUP_CLIENT_ID and MEETUP_CLIENT_SECRET (env or config/secrets.env).");
  process.exit(1);
}

const authUrl =
  "https://secure.meetup.com/oauth2/authorize" +
  `?client_id=${encodeURIComponent(CLIENT_ID)}` +
  `&response_type=code` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

async function exchangeCode(code) {
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: "authorization_code",
    redirect_uri: REDIRECT_URI,
    code,
  });
  const res = await fetch("https://secure.meetup.com/oauth2/access", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  return { status: res.status, json: await res.json().catch(() => ({})) };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (!url.pathname.startsWith("/callback")) {
    res.writeHead(404).end("Not found");
    return;
  }
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  if (error) {
    res.writeHead(400, { "Content-Type": "text/html" }).end(`<h2>Authorization failed: ${error}</h2>`);
    console.error("Authorization failed:", error);
    server.close();
    process.exit(1);
  }
  if (!code) {
    res.writeHead(400).end("Missing code");
    return;
  }
  const { status, json } = await exchangeCode(code);
  if (status !== 200 || !json.refresh_token) {
    res.writeHead(500, { "Content-Type": "text/html" }).end("<h2>Token exchange failed. Check terminal.</h2>");
    console.error("Token exchange failed:", status, json);
    server.close();
    process.exit(1);
  }
  res.writeHead(200, { "Content-Type": "text/html" }).end(
    "<h2>Success! You can close this tab and return to the terminal.</h2>",
  );
  console.log("\n==================== MEETUP TOKENS ====================");
  console.log("access_token  (expires in", json.expires_in, "s):\n", json.access_token);
  console.log("\nREFRESH TOKEN (store this as a Supabase secret):\n", json.refresh_token);
  console.log("======================================================\n");
  console.log("Next: supabase secrets set MEETUP_REFRESH_TOKEN='" + json.refresh_token + "'");
  server.close();
  process.exit(0);
});

server.listen(PORT, () => {
  console.log("Open this URL in your browser to authorize (also attempting to open it):\n");
  console.log(authUrl + "\n");
  // best-effort auto-open on macOS
  try { spawn("open", [authUrl], { stdio: "ignore", detached: true }); } catch { /* ignore */ }
  console.log(`Waiting for the redirect to ${REDIRECT_URI} ...`);
});
