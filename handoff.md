# Handoff: thoselashes-admin

## 1. CURRENT GOAL

Deliver a fully functional lash salon admin PWA with KV-backed records, Google Sheets sync, and a polished agenda/records/CRUD UI.

Concrete deliverables:
- Agenda day-by-day navigation (Prev/Next/date picker) with empty-state handling
- Records tab showing submitted-only entries, deletable to reappear in Agenda
- Detail modal with PayNow QR, amount, tags (definition-ordered), edit/delete
- Manual entry modal for creating new records from scratch
- All buttons and UI elements using the `#c7006a / #cfad5d / #fad5da / #fbecf5` palette
- Site font: Google Sans sitewide; Playfair Display for customer names
- Logo (`thoselashes-logo.png`) in header instead of text
- Header: `#fbecf5` bg, `min(10vh, 150px)` height, full viewport width
- Content containers: `max-w-[320px]` mobile / `max-w-[600px]` desktop (`md:`)

## 2. STATE MAP

✅ **Working** — high confidence unless noted:
- Google Sheets CRUD (submit/update/delete) via Apps Script `C-RrIg/exec` URL
- KV records CRUD (submit, delete, manual create) with `APPOINTMENTS_KV`
- PayNow QR code generation (EMVCo, CRC16-CCITT)
- Tag sorting by `tags.json` definition order
- +65 country-code prefix on mobile numbers
- All color scheme applied to header, nav buttons, modal buttons, tag chips, agenda service text
- Playfair Display for customer names; Google Sans sitewide
- Logo in header, full-width header with `#fbecf5` bg
- Agenda navigable day range (all days from earliest to latest appointment)
- Inline date picker (native `<input type="date">`, hidden, triggered by overlay trigger + ▾ arrow)
- Agenda shows empty state ("No appointments on this day.") for days without records
- Navigating to Agenda increments `todayReset` counter → force-reset to today

🚧 **In Progress** — half-built or pending verification:
- Modal overflow: changed from `overflow-y-auto` on modal card to `overflow-y-auto` on the overlay viewport — `[UNVERIFIED: needs browser check that scrolling works correctly on mobile]`
- Custom tag × delete in Detail modal — `[UNVERIFIED: the × button handler references draft.customTags which may be stale in the Detail context since draft lives in localStorage]`
- `functions/api/seed.js` was deleted in the last session (commit `8a6793f`) — this removed the KV seeding endpoint; manual seed data may need re-pushing

❌ **Broken / Untested** — known issues:
- The `showPicker` click handler on the overlay div (`document.getElementById('agenda-date-input')?.showPicker()`) does not work on iOS Safari — native date picker requires a real `<input>` focus, not a programmatic `showPicker()` call
- Apps Script URL is `AKfycbzGcvuD5_9JrIlizn6jALo96Iy3nTRzRDg3cT_d5jfd1KlaFnP4SpWMCqsZftKf-CRrIg/exec` — `[UNVERIFIED: whether this is the latest deployed version after the last edit session]`
- No automated tests exist in the repo
- `tailwindcss` v4 is used with `@import "tailwindcss"` in `src/index.css` — `--font-sans` set via `@theme` block, but Tailwind CSS v4 uses `@theme` differently from v3; `[UNVERIFIED: whether `font-sans` utility actually applies the Google Sans font through the Tailwind config]`

## 3. FILES TOUCHED

| Path | Action | Purpose | Status |
|---|---|---|---|
| `src/App.jsx` | modified | Header: logo replace, color scheme, `todayReset` state, Agenda nav button wired to increment counter | stable |
| `src/components/Agenda.jsx` | modified | Navigation refactor: always show nav bar, inline date picker with ▾ arrow, all-days range, empty-state split | stable |
| `src/components/Detail.jsx` | modified | Modal overflow moved to viewport, all buttons colored (#c7006a scheme), × button on custom tags | stable |
| `src/components/ManualEntry.jsx` | modified | Modal overflow moved to viewport, all buttons colored (#c7006a scheme) | stable |
| `src/components/Records.jsx` | modified | + button and delete buttons colored (#c7006a scheme) | stable |
| `src/index.css` | modified | Playfair Display via `@theme --font-display`, Google Sans as `--font-sans` | stable |
| `src/components/Agenda.jsx` | modified (linter) | service text `text-[#c7006a]` added | stable |
| `public/thoselashes-logo.png` | created | Logo file for Vite static serving | stable |
| `src/constants/tags.json` | modified (linter) | trailing comma removed to fix JSON parse error | stable |
| `functions/api/seed.js` | deleted | Removed KV seeding endpoint | stable |

## 4. DURABLE DECISIONS

- **Color palette `#c7006a / #cfad5d / #fad5da / #fbecf5` for all buttons** — user explicitly requested this scheme to replace Tailwind blue/gray defaults. Applied to all interactive elements sitewide.

- **Google Sans sitewide, Playfair Display for customer names** — branding decision: Google Sans (system fallbacks) for body/UI, Playfair Display (Google Fonts) reserved for customer names only.

- **Inline date picker (no separate button or dropdown)** — user rejected the "calendar icon" approach; opted for an invisible `<input type="date">` overlay triggered by clicking the formatted date text, with a `▾` indicator.

- **Day range from earliest to latest appointment** — `allDays` array covers every calendar day between first and last record, not just days with records. This allows navigation to future empty days where Prev/Next remain functional.

- **`overflow-y-auto` on the overlay div (not the modal card)** — user requested scroll on viewport instead of inside the modal. The card grows with content; the overlay handles scrolling.

- **Apps Script column order**: A(id) B(submittedAt) C(date) D(time) E(customerName) F(mobileNumber) G(service) H(amount) I(tags) — established after multiple column-mismatch bugs.

- **Mobile number stored with `+65` prefix** — server-side prefix normalization in all write paths (`submit.js`, `records.js`, `ManualEntry.jsx`).

## 5. FAILED PATHS

- **Apps Script `doPost` using positional VALUES array** — submit.js sent `{ values: [...] }` but Apps Script expected named properties (`id`, `date`, etc.). Replaced with named-fields payload.
- **Apps Script chained method calls on `ContentService` return** — "Unexpected token" parser errors. Replaced with `jsonResponse()` helper that builds the object, then returns it in a single `ContentService.createTextOutput(JSON.stringify(obj))` call.
- **Apps Script `const` and modern array methods (`flat`, `findIndex`)** — Apps Script runtime doesn't support ES6+ array flattening. Replaced with `var` and basic `for` loops.
- **`pr-5` on date input with absolute-positioned arrow** — created large whitespace gap between text and arrow. Replaced with the current: inline overlay trigger + absolute-positioned `▾`.
- **`showPicker()` programmatic call on iOS** — the `showPicker()` API doesn't work on iOS Safari when called programmatically on a hidden input. Not yet resolved — see Open Questions.
- **`key={"agenda-" + forceTodayKey}` hack on Agenda** — React key trick to force remount on agenda nav click. Replaced with the clean `forceToday` counter prop approach.

## 6. NEXT IMMEDIATE STEPS

1. `[READ]` Verify the Apps Script URL is current and the Google Sheets web app is deployed with the latest `Code.gs` — check `src/store.js` `fetchAppointments`/`submitAppointment` endpoints and `functions/api/submit.js` for the stored URL.
2. `[READ]` Test the iOS Safari date picker interaction — the `showPicker()` call from the overlay `onClick` may not open the native picker on iOS. If broken, switch to making the `<input>` visible (styled as text) instead of hidden.
3. `[READ]` Verify `functions/api/seed.js` deletion didn't break any KV seeding workflow — if seed data needs to be re-pushed, write a replacement or confirm the KV dashboard is populated.

## 7. OPEN QUESTIONS / KNOWN UNKNOWNS

- **iOS Safari date picker** — `showPicker()` may not work on iOS when called from an overlay `onClick`. The hidden `<input type="date">` approach may need to become a visible styled input.
- **Apps Script deployment URL** — the URL stored in `functions/api/submit.js` and `functions/api/appointments/[id].js` may be stale if GS was redeployed since the last commit. The URL from the summary is `AKfycbzGcvuD5_9JrIlizn6jALo96Iy3nTRzRDg3cT_d5jfd1KlaFnP4SpWMCqsZftKf-CRrIg/exec`.
- **KV seed data** — `functions/api/seed.js` was deleted. If the KV namespace `APPOINTMENTS_KV` (ID: `035aebe30a0242f191e86d57250f6c1d`) needs reseeding, there's no endpoint to do it from the app.
- **Tailwind CSS v4 `@theme` font configuration** — `--font-sans: "Google Sans", ...` is set in `@theme` block; need to confirm Tailwind v4 actually picks this up for the `font-sans` utility class.
- **Custom tag deletion in Detail modal** — the `×` button on custom tags calls `updateDraft(appointment.id, "customTags", ...)` but `draft` in Detail is read from `drafts[selectedId]` which is localStorage-backed; need to confirm the delete path works end-to-end.

## 8. ENVIRONMENT SNAPSHOT

- **Branch**: `main`, clean except for linter-modified `src/components/Agenda.jsx` (pending reformat change)
- **No running processes** or dev servers
- **Deploy target**: Cloudflare Pages (`pages_build_output_dir = "build"`)
- **KV namespace**: `APPOINTMENTS_KV` (ID: `035aebe30a0242f191e86d57250f6c1d`)
- **Google Apps Script**: deployed at `AKfycbzGcvuD5_9JrIlizn6jALo96Iy3nTRzRDg3cT_d5jfd1KlaFnP4SpWMCqsZftKf-CRrIg/exec` (web app `doPost` handler)
- **Key deps**: React 19, Vite 8, Tailwind CSS v4, Zustand, `qrcode-generator`
- **Date of handoff**: 2026-07-30

---

```
Read ./handoff.md and resume work immediately. Do not ask clarifying questions — act on the NEXT IMMEDIATE STEPS section.
1. `git log --oneline -5` to verify current HEAD
2. Read the files listed in NEXT IMMEDIATE STEPS above
3. For each step, run the stated terminal command and check the result
4. If a step requires a code change, make the minimal edit and run `npm run build` to verify
5. Commit and push after each verified step
Source of truth: the sections and structure of this file (handoff.md).
```
