import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

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

          const chunks: Buffer[] = [];
          for await (const chunk of req) {
            chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
          }

          const formBody = Buffer.concat(chunks).toString("utf-8");
          const incoming = new URLSearchParams(formBody);
          const to = incoming.get("To")?.trim();
          const body = incoming.get("Body")?.trim() ?? "wyd";
          const from = incoming.get("From")?.trim() || defaultFrom;

          if (!to || !from) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Missing required To/From phone number." }));
            return;
          }

          const twilioPayload = new URLSearchParams({
            To: to,
            From: from,
            Body: body,
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
