# Architecture

RigGO is a browser application served as static files. The browser authenticates with Supabase and calls its database API, RPC functions, and Storage directly. No application server or Cloudflare Worker code is present in this repository.

```mermaid
flowchart TD
  B["Browser PWA"] --> C["Cloudflare static hosting"]
  B --> L["IndexedDB outbox"]
  B --> S["Supabase Auth and APIs"]
  S --> D["PostgreSQL tables and RPCs"]
  S --> O["Storage objects"]
```

## Runtime files

| File | Role |
| --- | --- |
| `site/index.html` | Page shell, inline application logic and configuration, and ordered script loading. |
| `site/assets/riggo-app.8fd9790e3793.js` | Move data, planning, Daily reports, and C4 execution synchronization. |
| `site/assets/riggo-1236-operational.ecf58ba518af.js` | Operational controls. |
| `site/assets/riggo-1217-field-integrity.ea49ec55f6bc.js` | Field checks and UI behavior. |
| `site/assets/riggo-123-move-intelligence.79811e859444.js` | Move Intelligence and reporting views. |
| `site/assets/riggo-1237-field-ux.1b6be3b11202.js` | Field UX and Reset interactions. |
| `site/sw.js`, `site/_headers`, `site/version.json` | Offline caching, cache headers, and release metadata. |

The bundles and inline scripts are release files. Their load order matters. The Service Worker caches assets and has a network-first navigation fallback; IndexedDB stores pending application data and is managed by the application code.

## Move and execution state

`moves` holds the master Move, Plan, lifecycle status, and revision. `riggo_execution_state` holds the current execution payload and its revision. C4 queues local execution work in IndexedDB, then uses Supabase RPCs to save with an expected revision and `operation_id`. A conflicting revision requires reconciliation. PostgreSQL remains authoritative for execution state.

```mermaid
sequenceDiagram
  participant B as Browser
  participant Q as IndexedDB
  participant R as Supabase RPC
  participant D as PostgreSQL
  B->>Q: Queue execution change
  B->>R: Save payload, revision, operation ID
  R->>D: Validate and write
  D-->>R: Result or conflict
  R-->>B: Server result
  B->>Q: Acknowledge or reconcile
```

Reset moves an active Move back to ready while retaining its Plan and establishing a new execution baseline. Activation starts a new execution run and rotates `_riggoRunId` on the server. For a tokenized row, an ordinary save with a missing or different run ID is rejected as `stale_execution_run`; a matching run ID still passes through the usual authorization and revision checks. C4 discards queued work from an older run and adopts server execution state without merging across runs. Legacy rows without a run ID retain their compatibility path.

## External dependencies

The browser loads Supabase JS from jsDelivr using `@2`. It also uses CDN libraries for PDF and canvas work, including html2pdf.js 0.10.1, html2canvas 1.4.1, and jsPDF 2.5.1. Authentication, database, and file storage depend on Supabase. The actual hosting project settings, database configuration, and any server-side email or Edge Function implementations are outside this repository.
