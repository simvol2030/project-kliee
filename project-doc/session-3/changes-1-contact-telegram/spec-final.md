# Spec-final: Contact Form Telegram Notifications

**Version:** final
**Status:** IMPLEMENTED BY CLI
**Score:** ~10 (CLI does it)

---

## Summary

Add Telegram notification support to the contact form. When enabled, contact submissions are sent to a Telegram chat/channel in addition to email.

## What Was Done

### File 1: `telegram.ts` (notification service)
- Added `ContactNotificationData` interface
- Added `sendTelegramContactNotification(data, botToken?, chatId?)` — sends formatted contact message
- Added `sendTelegramContactTestMessage(botToken?, chatId?)` — test endpoint
- Added `formatContactMessage()` — HTML formatting with name, email, subject, message (truncated to 800 chars)
- Modified `sendTelegramMessage()` to accept optional `botToken` override (DB settings take priority over env vars)

### File 2: `api/contact/+server.ts` (contact API)
- After email send: reads `contact_telegram_enabled`, `contact_telegram_bot_token`, `contact_telegram_chat_id` from DB
- If enabled: calls `sendTelegramContactNotification()`
- Telegram failure does not block the response (non-critical)

### File 3: `api/contact/settings/+server.ts` (settings API)
- Extended `CONTACT_KEYS` with 3 new keys: `contact_telegram_enabled`, `contact_telegram_bot_token`, `contact_telegram_chat_id`

### File 4: `(admin)/contact/+page.svelte` (admin UI)
- Added "Telegram Notifications" section in Settings tab
- Fields: enabled checkbox, bot token input, chat ID input
- "Test Telegram" button (disabled until both token and chat ID are filled)
- Status messages for test result
- Dark mode support for new section

### File 5: `api/contact/test-telegram/+server.ts` (NEW)
- POST endpoint accepting `{ bot_token, chat_id }`
- Calls `sendTelegramContactTestMessage()`
- Returns `{ success, message }`

## Verification Steps
1. Go to admin `/contact` > Settings tab
2. Scroll to "Telegram Notifications" section
3. Enter bot token (from @BotFather) and chat ID
4. Check "enabled" and click "Save Settings"
5. Click "Test Telegram" — message should arrive
6. Submit form on `/en/contact` — should get email + Telegram
7. Uncheck "enabled" — form sends email only

---

*Implemented: 2026-02-19*
