# Marlin 🐟

REST API wrapper for [Projects.co.id](https://projects.co.id) — automate deposits, check status, and confirm payments via a clean HTTP API.

> Built for freelancers who want to script their Projects.co.id wallet flow.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/connect` | Login with Projects.co.id credentials |
| `POST` | `/api/deposit` | Create a deposit (requires session) |
| `POST` | `/api/deposit/confirm` | Confirm payment for a track code |
| `GET`  | `/api/deposit/:trackCode` | Get deposit order status |

### `POST /api/auth/connect`

```json
{ "username": "myuser", "password": "mypass" }
→ { "session_id": "uuid", "message": "Logged in as myuser" }
```

### `POST /api/deposit`

```json
{ "session_id": "uuid", "amount": 50000 }
→ {
    "track_code": "a8f915",
    "amount_to_transfer": "Rp 50,438",
    "unique_code": "438",
    "deadline": "3x24 hours",
    "banks": [
      { "bank": "BCA", "account": "4373037667", "name": "PANONPOE MEDIA PT" },
      { "bank": "Mandiri", "account": "1310011570639", "name": "PANONPOE MEDIA" },
      { "bank": "BNI", "account": "0345700851", "name": "PANONPOE MEDIA" }
    ]
  }
```

### `POST /api/deposit/confirm`

```json
{ "session_id": "uuid", "track_code": "a8f915" }
→ { "status": "Processing Payment", "message": "Payment confirmed." }
```

### `GET /api/deposit/:trackCode?session_id=uuid`

```json
→ { "status": "Waiting Payment", "amount": "Rp 50,000", "total_pay": "Rp 50,438", "date": "12/06/2026 20:20:52 WIB" }
```

## Quick Start

```bash
# Install
npm install

# Set browsers path (optional — defaults to /root/.cloakbrowser/...)
cp .env.example .env

# Run
npm start
```

Server listens on `http://localhost:3100`.

## How It Works

Marlin uses **Playwright** (stealth Chromium via CloakBrowser) to automate Projects.co-id's web interface:

1. **Auth** — logs in, saves session as Playwright storage state
2. **Deposit** — uses the saved session to submit deposit form → extracts payment instructions
3. **Confirm** — checks order status → clicks Confirm Payment if still `Waiting Payment`

Each `session_id` maps to an isolated Playwright browser context with its own cookies. Sessions expire after 30 minutes of inactivity (auto-cleanup).

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3100` | Server port |
| `CHROMIUM_PATH` | `/root/.cloakbrowser/...` | Path to CloakBrowser Chromium |
| `SESSION_TTL_MS` | `1800000` (30 min) | Session idle timeout |

## License

MIT
