# Hello Clarice

A first-person psychological horror browser game prototype.

## Current Prototype

Version 1 starts with a fixed, lying-in-bed view of a dark bedroom. The player can open their eyes and look around with the mouse or touch, but cannot move yet.

## Planning Docs

- `PROJECT_PROPOSAL.md` - game concept and scope.
- `research.md` - tech stack research and recommendations.
- `INSTAGRAM_REALITY_CHECK.md` - execution plan for validating Instagram vs Google for location-based images, including required API keys/tokens.

## Commands

```sh
npm install
npm run dev
npm run build
npm run test:e2e
```

The dev server runs at `http://localhost:5173/` by default.

## Unlock SMS Webhook

On phone unlock, the app can send an SMS with message `wyd` to the number entered on the start screen.

Set this env var:

```sh
VITE_SMS_WEBHOOK_URL=https://your-backend.example.com/send-sms
VITE_TWILIO_FROM_NUMBER=+18336323219
```

For local Vite dev, use:

```sh
VITE_SMS_WEBHOOK_URL=http://localhost:5173/api/send-sms
```

The frontend will `POST` form-encoded data to that URL:

```txt
To=+15551234567&From=+18336323219&Body=wyd
```

Notes:

- Use a backend endpoint (for example, Node/Express, serverless function, or Twilio Function) that holds SMS API credentials securely.
- If `VITE_SMS_WEBHOOK_URL` is missing or the phone number is blank, no request is sent.
