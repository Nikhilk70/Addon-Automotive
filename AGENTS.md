# Notes for AI coding agents

Read [README.md](README.md) first. It describes every feature, the API, the data models, business rules, the roadmap and known issues.

## Project in one line
An online store and fitment-booking site for **Addon Automotive** (car accessories, India). React + Vite frontend in `client/`, Express backend in `server/`, JSON-file storage in `server/data/`.

## Run
`npm run install:all`, then `cp server/.env.example server/.env`, then `npm run dev`. The site is on :5173 and the API on :5000. Admin is at `/admin`.

## Rules
- **Storage:** all reads and writes go through `server/src/db/jsonStore.js` (`collection(name)`). Never read or write `server/data/*.json` directly from routes. This keeps the planned move to MongoDB or PostgreSQL to a change in one file.
- **Prices are computed on the server** (`server/src/utils/pricing.js`). Never trust prices, totals or discounts sent by the browser.
- **Validate every input** with the helpers in `server/src/utils/http.js`, and throw `HttpError(status, message)` for client errors.
- **Seed data:** if you add a new collection, add it to `seedData.js` and `reset.js`. Missing files are created on server start.
- **React:** a `useEffect` callback must return nothing or a cleanup function. Always use braces. A one-line arrow that returns a value crashed the app before.
- **Styling:** plain CSS with tokens in `client/src/styles/base.css`. Reuse the existing classes (`.btn-*`, `.card`, `.display`, `.slash-tag`, `.chip-*`). Keep the black and red brand and the Barlow Condensed italic headings. Don't add a UI framework.
- **Indian context:** prices in INR via `inr()` in `client/src/lib/format.js`, 10-digit mobiles starting 6-9, 6-digit pincodes, IST for slots.
- **Privacy:** don't commit real customer data (`orders`, `bookings`, `enquiries`, `subscribers` JSON should stay empty in git). Never commit `server/.env`.
- **Content facts:** phone numbers, Instagram handle, the EMI partner (Bajaj Finserv) and the sale come from the owner's poster. Don't invent business details such as the address or email; leave placeholders.
- **Before finishing a change:** run `npm run build`, and check the affected page in a browser at desktop and around 390px width.

## Open work (see README section 13)
Reel video files, Razorpay integration, WhatsApp Business API notifications, a real database, Render deployment, real product photos and catalogue.
