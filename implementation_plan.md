# Implementation Plan — thoselashes-admin

Static React frontend on Cloudflare Pages. Cloudflare KV bridges the local booking app and the web app. Google Sheets receives submissions via a Cloudflare Function.

---

## 1. Project Scaffolding

```
thoselashes-admin/
├── functions/
│   ├── api/
│   │   ├── appointments.js    # KV read → JSON
│   │   └── submit.js          # Sheets write + KV mark-processed
│   └── ...
├── src/
│   ├── store.js               # Zustand global store
│   ├── utils/
│   │   ├── time.js            # minutes → "09:00 AM"
│   │   └── paynow.js          # EMVCo string + CRC16
│   ├── components/
│   │   ├── Agenda.jsx
│   │   ├── Detail.jsx
│   │   └── QRCode.jsx
│   └── main.jsx
├── vite.config.js
└── wrangler.toml
```

- Initialize with `npm create vite@latest . -- --template react`, then add Tailwind and Zustand.
- Install `wrangler` globally for KV/local dev.
- Enable PWA via `vite-plugin-pwa`.

## 2. Cloudflare Setup

| Resource | Name/Var | Purpose |
|---|---|---|
| KV Namespace | `APPOINTMENTS_DATA` bound to `APPOINTMENTS_KV` | Stores the appointment JSON array |
| API Token | Scoped to `Workers KV Storage: Write` | Local app pushes updates |
| Pages Environment Vars | `CLIENT_EMAIL`, `PRIVATE_KEY` | Google Service Account creds |

Create the KV namespace in the Cloudflare Dashboard, bind it in Pages settings, and generate the API token. Store the token in the local app's `.env` (never committed).

## 3. Data Model

```json
{
  "id": "uuid",
  "date": "2026-07-28",
  "timeMinutes": 540,
  "service": "Eyelash Extensions",
  "customerName": "Jane",
  "mobileNumber": "81802828",
  "email": "jane@example.com",
  "timePaid": "10:00",
  "amount": 0,
  "tags": ["Natural"],
  "customTags": [],
  "processed": false
}
```

## 4. Functions

### GET `/api/appointments`
Returns `APPOINTMENTS_KV.get("agenda")` as JSON.

### POST `/api/submit`
1. Append row to Google Sheets via Service Account JWT auth.
2. **Only on success**, update the KV record: find the appointment by `id`, set `processed: true`.
3. Return `200` to frontend.

**Ordering matters:** Sheets write first, KV update second. If Sheets fails, KV stays untouched and the frontend retries.

## 5. Frontend State (Zustand)

```js
// store.js
const useStore = create((set) => ({
  appointments: [],
  drafts: {},           // { [id]: { amount, tags, customTags } }
  fetchAppointments: async () => { ... },
  submitAppointment: async (id) => { ... },
  updateDraft: (id, field, value) => set((s) => ({
    drafts: { ...s.drafts, [id]: { ...s.drafts[id], [field]: value } }
  })),
}));
```

Drafts persist to `localStorage` so they survive page refreshes and navigation. The Agenda filters `processed === false`, groups by `date`, sorts chronologically.

## 6. UI Views

### Agenda View
- Filter: `processed === false`
- Group by `date`, sort descending
- Date header: `dddd, DD MMM YYYY`
- Card: `[HH:MM AM/PM] — Customer - Service`

### Detail View
- **QR Section:** Amount input → QR color `#4B5563` if empty/zero, `#000000` if set. Render with `qrcode.react`.
- **Tags:** Predefined pills (`YY`, `1D`, `Natural`, `Dolly`, ...) + custom input with `(+)` append.
- **Actions:** Submit (calls `/api/submit`, on 200 removes from store and clears draft) | Back (navigates to Agenda, draft preserved).

### Time Conversion Helper
```js
export const minutesToTime = (m) => {
  const h = Math.floor(m / 60);
  const mins = m % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(mins).padStart(2, '0')} ${ampm}`;
};
```

## 7. PayNow QR

The EMVCo payload follows the SGQR spec for PayNow:

1. Build the static EMV string with `000201` header, `01` (PayNow), dynamic `29` (merchant info), `58` (country SG), `53` (currency 704), and amount.
2. **Dynamic fields:**
   - Mobile: `81802828`
   - Amount: draft amount or `0`
   - Remark: `{name}{phone.slice(-4)} {service === 'Eyelash Extensions' ? 'Lash' : 'Touchup'}`
3. Append CRC16-CCITT-FALSE checksum (4 hex chars).
4. Pass payload to `qrcode.react`.

Reference the Python repo for the exact EMVCo field ordering — replicate it exactly; reordering breaks QR scanning.

## 8. Security & Deployment

- **Cloudflare Access:** Put the Pages domain behind Access with Email OTP restricted to staff emails. This covers both Pages routes and Functions since Functions inherit the domain's Access policy.
- **Secrets:** `CLIENT_EMAIL`, `PRIVATE_KEY`, and the KV API token live in Cloudflare Pages Secrets (not in code). Local dev uses `.env` with `wrangler secret put`.
- **PWA:** `manifest.json` with icons, `short_name`, `display: standalone`.
- **Deploy:** GitHub → Cloudflare Pages. Staff installs PWA from mobile browser after OTP login.

## 9. Local Dev Workflow

1. `wrangler dev --local` starts Functions with a local KV emulator.
2. `npm run dev` starts Vite dev server on `:5173`.
3. Seed KV with test appointments via `wrangler kv:key put ...`.
4. Test the full submit flow against a test Google Sheet.

## 10. Gaps & Decisions Needed

| Issue | Action Required |
|---|---|
| KV read endpoint has no auth | Cloudflare Access must cover the Function route — confirm Access policy applies to `/_functions/api/appointments` |
| No offline/queue for local app | Decide: immediate retry with exponential backoff, or local queue + background sync |
| No idempotency on Sheets append | Decide: use a UUID per row so duplicates are detectable |
| CRC16 poly/initial value | Confirm `CRC-16/CCITT-FALSE` (poly 0x1021, init 0xFFFF) — this is the standard for PayNow |
| PWA install on iOS | `manifest.json` alone doesn't trigger iOS install — add `apple-mobile-web-app-capable` meta and a `apple-touch-icon` |
