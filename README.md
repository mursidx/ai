# n8n Call Auto-Answer (Gemini) + Telegram Transcript

This repository contains an importable n8n workflow:

- `n8n_workflow_twilio_gemini_telegram.json`

## What it does

1. Receives an incoming phone call webhook (Twilio Voice).
2. Auto-answers the call with a voice prompt.
3. Captures caller speech using Twilio `<Gather input="speech">`.
4. Sends transcript text to Gemini (`gemini-1.5-flash`) for a short AI voice reply.
5. Reads the Gemini reply back to the caller.
6. Sends the full transcript + AI reply to Telegram.

## Prerequisites

- Twilio phone number with Voice enabled.
- n8n instance reachable from Twilio.
- Gemini API key.
- Telegram bot token + target chat ID.

## How to import this workflow in n8n

### Option A: Import from file (recommended)

1. Open your n8n editor.
2. Click **Workflows** → **New** (or open any workflow page).
3. Click the **⋯** (top-right) or **Import from file** button (name can vary by n8n version).
4. Select `n8n_workflow_twilio_gemini_telegram.json` from this repo.
5. Click **Import**.
6. Save the workflow.

### Option B: Paste JSON

1. Open `n8n_workflow_twilio_gemini_telegram.json` in a text editor.
2. Copy the entire JSON content.
3. In n8n, choose **Import from clipboard** (or **Paste JSON** depending on version).
4. Paste JSON and confirm import.
5. Save the workflow.

## Configure after import

1. In node **Send Transcript to Telegram**, add your Telegram credentials (bot token).
2. Set environment variables for n8n:
   - `N8N_BASE_URL` (e.g. `https://your-n8n-domain.com`)
   - `GEMINI_API_KEY`
   - `TELEGRAM_CHAT_ID`
3. In Twilio Console for your phone number, set **A CALL COMES IN** webhook to:
   - `https://your-n8n-domain.com/webhook/voice/incoming`
   - Method: `POST`
4. Activate the workflow in n8n.

## Quick test checklist

1. Call your Twilio number.
2. You should hear: AI assistant greeting.
3. Speak a short sentence.
4. You should hear Gemini's spoken response.
5. Telegram should receive:
   - Caller number
   - Transcript
   - AI reply

## Notes

- This workflow is one-turn (caller speaks once, Gemini replies once).
- You can extend it into multi-turn by returning `<Gather>` again in `Set Process TwiML`.
- For production, optionally validate Twilio signatures before processing.
