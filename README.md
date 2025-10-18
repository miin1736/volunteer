## Summary
Add initial E wall MVP scaffolding:
- brand×category landing with advanced filters
- outbound tracking endpoint
- feed parser + cron stub
- product schema (SQL)
- price-drop email template
- demo dataset

Closes #3
Closes #4

## Scope
1) Next.js pages and filters
- app/(ewall)/[brand]/[category]/page.tsx: server-render list with filters/sort (downType, downRatio, hood, fit, shell, sort)
- components/Filters.tsx: client component to update URL params
- JSON-LD (Product) for up to 20 items

2) Types/SEO helpers
- lib/types.ts, lib/seo.ts
- lib/search.ts: demo in-memory filtering using data/sample-products.json

3) Outbound tracking
- /api/out: 302 redirect with subId=ewall_<pid> (TODO: persist click)

4) Feed parsing + sync
- scripts/parseFeeds.ts (normalize JSON feed)
- scripts/cron/syncOffers.ts (stub)

5) DB schema
- db/schema.sql (brand/product tables + indexes)

6) Email template
- emails/price-drop.html

7) Sample data
- data/sample-products.json (BrandA/down)

## Acceptance Criteria
- Landing renders and filters/sorts via URL params
- Filters update URL without full reload
- Product JSON-LD present for up to 20 items
- /api/out appends subId and redirects
- parseFeeds.ts normalizes JSON → products.json
- db/schema.sql applies without errors

## Notes
- No real DB/index wiring or feed API in this PR (TODOs left)
- No env vars required; minimal UI
