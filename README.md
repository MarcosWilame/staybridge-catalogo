# Staybridge London Catalog

Responsive property catalog for Brazilian customers looking for rooms, studios, ensuites, and flats in London.

## Current Features

- Public catalog with filters for region, type, price, capacity, bills included, and immediate move-in.
- Property details page with gallery, video support, approximate map, WhatsApp CTA, and share action.
- Property comparison on the listing page, with up to 3 properties at a time.
- Admin page backed by Supabase for creating, editing, hiding, restoring, deleting, importing, and uploading media.
- Public properties API via `/api/public-properties`.
- SEO support with dynamic titles, descriptions, Open Graph/Twitter tags, JSON-LD for property pages, `robots.txt`, and `/sitemap.xml`.
- Consent-gated GA4 and Meta Pixel page views plus custom CTA tracking events.
- Mobile bottom navigation without favorites for now.

## Tech Stack

- React 18
- React Router 6
- TypeScript
- Vite 8
- Tailwind CSS 3
- Lucide React
- Supabase REST/Auth/Storage

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run test
npm run typecheck
```

On this Windows/Codex setup, Vite may need to run outside the sandbox because esbuild can hit an access-denied error while resolving config files.

## Environment

Create `.env.local` from `.env.example`.

Required for public/admin Supabase behavior:

```bash
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
VITE_SUPABASE_PROPERTIES_TABLE=properties
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
SITE_URL=https://staybridgelondon.com
```

Optional Cloudinary settings:

```bash
VITE_CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
VITE_CLOUDINARY_UPLOAD_PRESET=YOUR_UNSIGNED_UPLOAD_PRESET
VITE_CLOUDINARY_FOLDER=staybridge/properties
```

## Supabase Tables

`properties` should contain:

- `id` integer
- `data` jsonb

The public API reads `id,data`, returns only explicitly allowed fields, and includes only properties where `listed === true`. Exact addresses and coordinates stay private.

## Routes

- `/` home page
- `/properties` property listing and comparison
- `/property/:id` property details
- `/profile` customer/support area (`noindex`)
- `/admin` admin dashboard, loaded lazily
- `/sitemap.xml` dynamic sitemap

## Tracking Events

Custom events are sent to GA4 (`gtag`) and Meta Pixel (`fbq trackCustom`) through `src/app/utils/analytics.ts`.

Tracked examples:

- `whatsapp_click`
- `properties_cta_click`
- `quick_filter_click`
- `property_detail_click`
- `property_share`
- `compare_add`
- `compare_remove`
- `compare_clear`
- `property_filter_change`
- `map_open_click`

## Notes

- Favorites were removed for now.
- Property WhatsApp CTAs use the short inquiry modal to qualify leads before opening WhatsApp.
- The admin page is lazily loaded and has begun being split into smaller admin-specific modules.
- Admin sessions use `sessionStorage`, so credentials are cleared when the browser session ends.
- See `SUPABASE_SECURITY.md` before deploying Supabase policy changes.
