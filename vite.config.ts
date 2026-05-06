import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const smsWindowMs = 60_000;
const smsMaxSendsPerWindow = 3;
const smsRateLimit = new Map<string, { count: number; resetAt: number }>();
const e164PhoneNumber = /^\+[1-9]\d{1,14}$/;

function getHeaderValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function isSameSiteRequest(req: { headers: Record<string, string | string[] | undefined> }) {
  const host = getHeaderValue(req.headers.host)?.trim();
  const originOrReferer = [getHeaderValue(req.headers.origin), getHeaderValue(req.headers.referer)];

  return originOrReferer.some((value) => {
    if (!value || !host) return false;

    try {
      const parsed = new URL(value);
      if (parsed.host === host) return true;
      return ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
    } catch {
      return false;
    }
  });
}

function isRateLimited(key: string) {
  const now = Date.now();
  const bucket = smsRateLimit.get(key);

  if (!bucket || bucket.resetAt <= now) {
    smsRateLimit.set(key, { count: 1, resetAt: now + smsWindowMs });
    return false;
  }

  if (bucket.count >= smsMaxSendsPerWindow) {
    return true;
  }

  bucket.count += 1;
  return false;
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: "sms-webhook-dev-handler",
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.method !== "POST" || req.url !== "/api/send-sms") {
            next();
            return;
          }

          const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
          const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
          const defaultFrom = process.env.TWILIO_FROM_NUMBER?.trim();

          if (!accountSid || !authToken) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Missing Twilio server credentials." }));
            return;
          }

          if (!isSameSiteRequest(req)) {
            res.statusCode = 403;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Forbidden origin." }));
            return;
          }

          const clientKey = req.socket.remoteAddress ?? "unknown";
          if (isRateLimited(clientKey)) {
            res.statusCode = 429;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "SMS rate limit exceeded." }));
            return;
          }

          const chunks: Buffer[] = [];
          for await (const chunk of req) {
            chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
          }

          const formBody = Buffer.concat(chunks).toString("utf-8");
          const incoming = new URLSearchParams(formBody);
          const to = incoming.get("To")?.trim();
          const from = incoming.get("From")?.trim() || defaultFrom;

          if (!to || !from) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Missing required To/From phone number." }));
            return;
          }

          if (!e164PhoneNumber.test(to) || !e164PhoneNumber.test(from)) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Phone numbers must use E.164 format." }));
            return;
          }

          const twilioPayload = new URLSearchParams({
            To: to,
            From: from,
            Body: "wyd",
          });
          const authHeader = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

          try {
            const twilioResponse = await fetch(
              `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
              {
                method: "POST",
                headers: {
                  Authorization: `Basic ${authHeader}`,
                  "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
                },
                body: twilioPayload.toString(),
              },
            );

            const text = await twilioResponse.text();
            res.statusCode = twilioResponse.status;
            res.setHeader("Content-Type", "application/json");
            res.end(text);
          } catch (error) {
            res.statusCode = 502;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                error: "Failed to contact Twilio.",
                detail: error instanceof Error ? error.message : "Unknown error",
              }),
            );
          }
        });
      },
    },
  ],
  server: {
    port: 5173,
  },
});
