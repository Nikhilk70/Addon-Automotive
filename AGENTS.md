# Notes for AI coding agents

Read [README.md](README.md) first. It describes every feature, how the in-browser "backend" works, business rules, data, the roadmap and known issues.

## Project in one line
A **frontend-only demo** of an online store and fitment-booking site for **Addon Automotive** (car accessories, India). React + Vite, hosted on GitHub Pages. There is no server: `src/mock/` runs the store logic in the browser and stores data in localStorage.

## Run
`npm install`, then `npm run dev` (http://localhost:5173). Admin is at `/#/admin`, password `addon@admin123`. `npm run build` outputs to `dist/`. Pushing to `main` deploys via `.github/workflows/deploy.yml`.

## Rules
- **Data access:** the UI calls only `api.*` from `src/lib/api.js`, and all data goes through `collection()` in `src/mock/store.js`. Don't read or write localStorage `addon_db_v1:*` keys anywhere else. This keeps a future real backend a swap of `api.js` alone.
- **Business logic lives in `src/mock/`** (pricing, coupons, slots, orders), not in components. Totals always come from `/cart/quote`.
- **Validate inputs** with the helpers in `src/mock/http.js`; throw `HttpError(status, message)`.
- **Seed changes:** edit `src/mock/seed.js`. Returning visitors keep their old copy, so bump `PREFIX` in `store.js` when the seed must reach everyone.
- **GitHub Pages:** keep `HashRouter` and `base: './'`. Reference public files with `asset('images/x.png')` from `src/lib/format.js`, never a bare `"/images/..."` string in JSX.
- **React:** a `useEffect` callback must return nothing or a cleanup function. Always use braces.
- **Styling:** plain CSS with tokens in `src/styles/base.css`. Reuse the existing classes (`.btn-*`, `.card`, `.display`, `.slash-tag`, `.chip-*`). Keep the black and red brand and the Barlow Condensed italic headings. No UI framework.
- **Indian context:** INR via `inr()`, 10-digit mobiles starting 6-9, 6-digit pincodes, IST slots.
- **Content facts:** phones, Instagram, Bajaj Finserv EMI and the sale come from the owner's poster. Don't invent the address, email or other business facts. Products and reviews are sample data.
- **Before finishing a change:** run `npm run build`, and check the page at desktop and around 390px width, ideally also under a sub-path (`/Addon-Automotive/`) via `npm run preview`.

## Open work (see README section 14)
Real backend and database, reel video files, Razorpay, WhatsApp Business API, real catalogue and photos, store address.
