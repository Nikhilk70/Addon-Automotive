# Addon Automotive - Online Store

Car accessories store for **Addon Automotive**: shop by car, order online, book studio fitment, coupons, EMI requests, order tracking, and an admin panel.

- **Frontend:** React 18 + Vite + React Router (`client/`)
- **Backend:** Node.js + Express (`server/`)
- **Database (for now):** JSON files in `server/data/`, behind one swappable storage module

## Run it

Requires Node.js 20+.

```bash
cd addon-automotive
npm run install:all      # installs root, server and client packages
npm run dev              # API on http://localhost:5000, site on http://localhost:5173
```

- Store: http://localhost:5173
- Admin: http://localhost:5173/admin (password from `server/.env`, default `addon@admin123`; **change it**)

Production: `npm run build` and then `npm start`. Express serves the built site and the API on port 5000.

Copy `server/.env.example` to `server/.env` and set `ADMIN_PASSWORD` and `TOKEN_SECRET`.

## Features

**Customers**
- Home: hero slider, "shop by your car" selector, categories, promo tiles, deal of the day with countdown, bestsellers/new/discount tabs, coupons, brands, fitment process, reviews, Instagram
- **My car (fitment):** save make and model once; every product shows "Fits your Swift" or "Not listed", and the shop filters by fitment
- Shop: filter by category, car, price, brand, stock and EMI; sort; pagination; live search suggestions
- Product page: gallery, MRP/discount, EMI per month, fitment check, **add studio fitment**, buy now, WhatsApp enquiry, specs, compatibility list, reviews (customers can post)
- Cart drawer with free-delivery progress bar and per-item fitment toggle
- Checkout: delivery or store pickup; **fitment slot booking** (date strip and live slot availability) when fitment is chosen; coupon codes; pay on delivery, pay at studio, or **EMI request**
- Order confirmation and **order tracking** (Order ID + phone) with a status timeline
- Book installation (service-only bookings), Offers page, Wishlist, Contact form, Newsletter, floating WhatsApp button

**Admin (`/admin`)**
- Dashboard: revenue, open orders, upcoming bookings, new enquiries, 7-day sales chart, low-stock alerts
- Orders: filter by status, update status (cancelling restocks items), mark payment, call or WhatsApp the customer
- Bookings, Products (add/edit/hide, fitment, specs, images), Offers/coupons, Enquiries and subscribers

The server prices every cart itself from the catalogue, so prices, coupons and slot limits can't be changed from the browser.

## Editing store content

| What | Where |
|---|---|
| Phone, WhatsApp, address, hours, hero slides, services, slot times | `server/data/settings.json` |
| Products, offers | Admin panel |
| Instagram reels on the homepage | Put the .mp4 files in `client/public/reels/`, then set each reel's video to `/reels/name.mp4` in Admin, Reels. They autoplay muted and loop while on screen |
| Categories, car makes/models, testimonials, brands | `server/data/*.json` |
| Logo and poster | `client/public/images/` |
| Your own product photos | put them in `client/public/images/` and use `/images/name.jpg` in the product's image URLs |

`npm run reset-data` restores the starting data. **It deletes all orders, bookings and enquiries.**

## Moving to MongoDB or PostgreSQL later

All storage goes through `server/src/db/jsonStore.js`, which exposes `collection(name)` with
`all / find / findOne / insert / update / remove` and `getSettings()`. Re-implement that one file
for MongoDB (e.g. the `mongodb` driver) or Postgres (e.g. Prisma, or `pg` with JSONB columns), keep
the same method names, and the routes keep working. Use `server/src/db/seedData.js` to seed the new database.

## Before going live

- Set a strong `ADMIN_PASSWORD` and `TOKEN_SECRET` in `server/.env`
- Fill in your real address, email and map link in `settings.json`
- Replace the placeholder product photos (taken from the old Auto-Motive repo or Amazon/Unsplash links) with your own shop photos
- Add an online payment gateway (e.g. Razorpay) if you want prepaid orders; right now no payment is taken online
- Move to a real database before you take many orders; JSON files suit one server only
