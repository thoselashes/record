# Graph Report - thoselashes-admin  (2026-08-02)

## Corpus Check
- 21 files · ~19,551 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 111 nodes · 168 edges · 13 communities (10 shown, 3 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 16 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f47ae703`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Handoff: thoselashes-admin
- Records.jsx
- devDependencies
- formatDate
- buildPayNowPayload
- Agenda.jsx
- thoselashes-logo.png
- ChartModal.jsx
- lash-extension business
- overflow-y-auto on Overlay Div, Not Modal Card
- sw.js

## God Nodes (most connected - your core abstractions)
1. `Handoff: thoselashes-admin` - 13 edges
2. `useStore` - 9 edges
3. `Records()` - 7 edges
4. `minutesToTime()` - 7 edges
5. `buildPayNowPayload()` - 7 edges
6. `Thoselashes Admin HTML Shell` - 7 edges
7. `formatDate()` - 6 edges
8. `scripts` - 6 edges
9. `formatTime()` - 5 edges
10. `sortTags()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Handoff: thoselashes-admin` --references--> `qrcode.react`  [EXTRACTED]
  handoff.md → package.json
- `Service Worker Registration` --references--> `Handoff: thoselashes-admin`  [INFERRED]
  index.html → handoff.md
- `PWA Web Manifest Link` --references--> `Handoff: thoselashes-admin`  [INFERRED]
  index.html → handoff.md
- `PWA Web Manifest Link` --references--> `PWA Icons with Padded Transparent Background`  [INFERRED]
  index.html → handoff.md
- `PWA Meta Tags` --references--> `PWA Icons with Padded Transparent Background`  [INFERRED]
  index.html → handoff.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **PWA Shell Bundle** — index_pwa_meta_tags, index_manifest_link, index_service_worker_registration, index_thoselashes_logo [EXTRACTED 1.00]
- **Mobile-First Records UI Grouping** — handoff_week_day_grouping, handoff_color_palette, handoff_overlay_scroll [INFERRED 0.85]
- **KV-First Submit Backend Pipeline** — handoff_kv_first_submit, handoff_appointments_kv, handoff_google_apps_script, handoff_wrangler_4 [EXTRACTED 1.00]

## Communities (13 total, 3 thin omitted)

### Community 0 - "Handoff: thoselashes-admin"
Cohesion: 0.11
Nodes (23): Handoff: thoselashes-admin, APPOINTMENTS_KV Namespace, Cloudflare Pages Deployment, Color Palette c7006a / cfad5d / fad5da / fbecf5, Google Sans + Playfair Display Typography, Google Apps Script Web App (doPost), KV-First Submit with Background GS Sync, Mobile Number Search with 4-Digit Minimum (+15 more)

### Community 1 - "Records.jsx"
Cohesion: 0.22
Nodes (13): App(), Detail(), HistoryPanel(), ManualEntry(), SERVICES, dayLabel(), monthName(), Records() (+5 more)

### Community 2 - "devDependencies"
Cohesion: 0.10
Nodes (19): dependencies, qrcode.react, react, react-dom, zustand, devDependencies, tailwindcss, @tailwindcss/vite (+11 more)

### Community 4 - "formatDate"
Cohesion: 0.57
Nodes (4): onRequestPost(), syncToGS(), formatDate(), formatTime()

### Community 5 - "buildPayNowPayload"
Cohesion: 0.54
Nodes (6): QRCode(), buildAdditionalData(), buildMerchantAccountInfo(), buildPayNowPayload(), crc16CCITT(), emv()

### Community 6 - "Agenda.jsx"
Cohesion: 0.53
Nodes (5): Agenda(), AppointmentList(), firstName(), todayStr(), weekMonday()

### Community 7 - "thoselashes-logo.png"
Cohesion: 0.36
Nodes (8): thoselashes-admin, thoselashes, lash extension beauty business, stylized eyelash/eye motif, Those Lashes & Nail Salon, icon-192.png, thoselashes-logo.png, Brand design system

### Community 9 - "lash-extension business"
Cohesion: 1.00
Nodes (3): lash-extension business, icon-512.png, ThoSelashes brand

## Knowledge Gaps
- **25 isolated node(s):** `name`, `version`, `dev`, `dev:functions`, `build` (+20 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Handoff: thoselashes-admin` connect `Handoff: thoselashes-admin` to `devDependencies`?**
  _High betweenness centrality (0.103) - this node is a cross-community bridge._
- **Why does `qrcode.react` connect `devDependencies` to `Handoff: thoselashes-admin`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Handoff: thoselashes-admin` (e.g. with `PWA Web Manifest Link` and `Service Worker Registration`) actually correct?**
  _`Handoff: thoselashes-admin` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `version`, `dev` to the rest of the system?**
  _25 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Handoff: thoselashes-admin` be split into smaller, more focused modules?**
  _Cohesion score 0.1067193675889328 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._