# Addon Automotive - Online Store

Website for **Addon Automotive**, a car accessories and fitment studio (Android stereos, speakers, alloys, lighting, seat covers, spoilers, body kits, sun films). Customers can shop by their car, order online, book a fitment slot at the studio, use coupons, request EMI, and track orders. The owner runs everything from an admin panel.

- **Frontend:** React 18 + Vite + React Router 6 (`client/`). Plain CSS, no UI library. Icons: `lucide-react`.
- **Backend:** Node.js 20+ and Express 4 (`server/`), ES modules.
- **Database (for now):** JSON files in `server/data/`, accessed only through one module, so it can be swapped for MongoDB or PostgreSQL.
- **Planned domain:** `addonautocraft.com`. **Planned hosting:** Render. See [docs/Addon-Automotive-Cost-Estimate.pdf](docs/Addon-Automotive-Cost-Estimate.pdf).
- **Repo:** https://github.com/Nikhilk70/Addon-Automotive

> AI agents: also read [AGENTS.md](AGENTS.md) for the working rules of this project.

---

## Contents
1. [Quick start](#1-quick-start)
2. [Project history](#2-project-history)
3. [Folder structure](#3-folder-structure)
4. [Customer features](#4-customer-features)
5. [Admin panel features](#5-admin-panel-features)
6. [Business rules](#6-business-rules)
7. [API reference](#7-api-reference)
8. [Data files and models](#8-data-files-and-models)
9. [Design system](#9-design-system)
10. [Editing store content](#10-editing-store-content)
11. [Moving to MongoDB or PostgreSQL](#11-moving-to-mongodb-or-postgresql)
12. [Deployment on Render](#12-deployment-on-render)
13. [Not done yet / roadmap](#13-not-done-yet--roadmap)
14. [Known issues and gotchas](#14-known-issues-and-gotchas)

---

## 1. Quick start

Requires **Node.js 20 or newer** (built and tested with Node 24).

```bash
git clone https://github.com/Nikhilk70/Addon-Automotive.git
cd Addon-Automotive
npm run install:all                          # root, server and client packages
cp server/.env.example server/.env           # Windows: copy server\.env.example server\.env
npm run dev                                  # starts API + website together
```

| What | URL |
|---|---|
| Store | http://localhost:5173 |
| Admin panel | http://localhost:5173/admin (password = `ADMIN_PASSWORD` in `server/.env`, default `addon@admin123`) |
| API | http://localhost:5000/api (the Vite dev server proxies `/api` to it) |

On first start the server creates any missing files in `server/data/` from `server/src/db/seedData.js`.

### Scripts (run from the repo root)

| Command | Does |
|---|---|
| `npm run install:all` | Installs root, `server/` and `client/` dependencies |
| `npm run dev` | Runs API (`node --watch`, port 5000) and Vite (port 5173) together via `concurrently` |
| `npm run build` | Builds the React app into `client/dist/` |
| `npm start` | Production: Express serves the API **and** `client/dist/` on port 5000 |
| `npm run reset-data` | Rewrites `server/data/` from the seed. **Deletes all orders, bookings, enquiries and subscribers.** |

### Environment variables (`server/.env`)

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `5000` | API port |
| `CLIENT_ORIGIN` | `http://localhost:5173` | CORS allow-list, comma separated |
| `ADMIN_PASSWORD` | `addon@admin123` | Admin login. **Change before going live.** |
| `TOKEN_SECRET` | dev value | Signs admin session tokens. Use a long random string in production. |

Client (optional): `VITE_API_URL` overrides the API base (default `/api`).

---

## 2. Project history

1. The owner first started a plain HTML/CSS/JS site (repo `Nikhilk70/Auto-Motive`, live at nikhilk70.github.io/Auto-Motive). It had a logo, a hero slider and 10 categories, and was dropped.
2. This project replaced it with a full React + Express store, inspired by **zelixautomotives.in** (a Shopify car-mods store). It also borrows features that store doesn't have, such as shop-by-car fitment, installation booking, WhatsApp, EMI, reviews and order tracking.
3. Reused from the old repo: the logo (`client/public/images/logo.png`), the offer poster (`client/public/images/offer-poster.jpg`), the 10 category names and their image URLs.
4. Business details taken from the poster: phones **+91 89211 68071** and **+91 80752 43040**, Instagram **@addonautomotive**, **10-30% off** sale, **EMI with Bajaj Finserv**, and the product lines.
5. Later additions: a client pricing PDF (`docs/`), a fix for React effects returning values (it crashed the layout), and the Instagram **Reels** section.

---

## 3. Folder structure

```
addon-automotive/
├── package.json              # root scripts (dev/build/start), uses concurrently
├── README.md                 # this file
├── AGENTS.md                 # rules for AI coding agents
├── docs/
│   └── Addon-Automotive-Cost-Estimate.pdf   # client pricing: domain, Render, DB, Razorpay, WhatsApp
├── server/
│   ├── .env.example
│   ├── data/                 # JSON "database" (one file per collection)
│   └── src/
│       ├── index.js          # Express app, CORS, routes, serves client/dist in production, error handler
│       ├── db/
│       │   ├── jsonStore.js  # THE storage layer: collection(name).all/find/findOne/insert/update/remove
│       │   ├── seedData.js   # starting data: settings, categories, vehicles, products, offers, reels...
│       │   └── reset.js      # writes seed into data/ (missing files on start; all files with reset-data)
│       ├── middleware/auth.js    # admin password check, HMAC-signed tokens (12 h), requireAdmin
│       ├── routes/
│       │   ├── catalog.js    # settings, categories, vehicles, home, products, reviews, offers, reels
│       │   ├── orders.js     # cart quote, place order, track order
│       │   ├── bookings.js   # installation slots + bookings, enquiries, newsletter
│       │   └── admin.js      # login, stats, orders, bookings, enquiries, products, offers, reels
│       └── utils/
│           ├── http.js       # HttpError, async wrapper, validators (phone, email, pincode...)
│           ├── pricing.js    # server-side cart pricing, coupons, fitment check
│           └── slots.js      # installation slot availability (IST time, capacity, Sundays)
└── client/
    ├── index.html            # fonts (Barlow Condensed + Manrope), meta, favicon
    ├── vite.config.js        # dev proxy /api -> localhost:5000
    ├── public/
    │   ├── images/           # logo.png, offer-poster.jpg
    │   └── reels/            # put Instagram reel .mp4 files here
    └── src/
        ├── main.jsx          # providers + router
        ├── App.jsx           # all routes
        ├── context/
        │   ├── StoreContext.jsx  # settings, categories, vehicles, saved car ("garage"), wishlist, toasts
        │   └── CartContext.jsx   # cart items, coupon, drawer; persisted in localStorage
        ├── lib/
        │   ├── api.js        # fetch wrapper, admin token, ApiError
        │   ├── format.js     # inr(), dates, fitsVehicle(), waLink(), status labels
        │   └── storage.js    # safe localStorage
        ├── components/       # Header, Footer, Layout, CartDrawer, ProductCard, VehicleSelector,
        │                     # SlotPicker, Reels, ui.jsx (Img, Stars, Price, QtyStepper, Countdown...)
        ├── pages/            # Home, Shop, Product, Checkout (+CartPage), Orders (success/track),
        │   │                 # Info (Offers, BookInstallation, Wishlist, Contact, NotFound)
        │   └── admin/        # AdminLayout (login + shell), AdminPages, CatalogAdmin
        └── styles/           # base.css (tokens, buttons, forms), components.css, pages.css, admin.css
```

---

## 4. Customer features

### Site-wide
- **Top bar:** rotating announcements (sale, EMI, free fitment, FIRSTRIDE coupon), phone and Instagram links.
- **Header:**
  - logo
  - **live search** with suggestions (debounced, top 5 results)
  - **"Add your car" / My car** selector
  - wishlist and cart counters
- **Navigation:**
  - "All Categories" **mega menu** (images and product counts)
  - links: Shop All, Offers, Book Installation, Track Order, Contact
  - "EMI via Bajaj Finserv" note
- **Mobile:** slide-out menu, mobile search, filter drawer.
- **Cart drawer:**
  - free-delivery progress bar
  - quantity steppers
  - per-item **studio fitment** toggle
  - checkout and view-cart buttons
- **Floating WhatsApp button**, which opens a chat with the store number.
- **Footer:**
  - newsletter signup
  - category links and help links
  - phones, address, hours
  - payment-method chips
- **Toast notifications** and a 404 page.

### Shop by your car (fitment)
- Customers pick **make + model** (12 Indian brands, 63 models in `vehicles.json`). It's saved in localStorage as the "garage".
- Each product's `fitment` is either `"universal"` or a list of `{ make, models[] }`.
- Product cards show **"Fits your Creta"**, **"Not listed for Creta"**, or "Studio fitment available".
- The shop filters by fitment (`?make=&model=`), and the product page has a "Will this fit my car?" checker.

### Home page (`/`)
In order:
1. Hero slider with the car selector card (slides come from `settings.heroSlides`)
2. Trust strip: expert fitment, EMI, genuine brands, warranty
3. Shop by category grid
4. Promo tiles: offer poster, EMI tile, book-installation tile
5. **Deal of the day** with a countdown to midnight
6. Product tabs: Bestsellers / New arrivals / Biggest discounts
7. Coupon cards: tap to copy, and the code is auto-applied at checkout
8. Brand marquee
9. "Order online, fitted by pros" steps
10. **Instagram Reels** row (see below)
11. Testimonials

### Instagram Reels (homepage)
- Vertical 9:16 cards in a swipeable row with arrow buttons and a Follow @addonautomotive button.
- When a reel has a `video` (.mp4), it **autoplays muted and loops while at least 60% visible** (IntersectionObserver) and pauses off-screen. It has a sound toggle and click-to-pause. Users with "reduce motion" switched on get a play button instead.
- Without a video, the card shows an Instagram-gradient placeholder with the caption and a "Watch on Instagram" link.
- Seeded with the captions of the 12 latest @addonautomotive reels. **No video files have been added yet** (see [roadmap](#13-not-done-yet--roadmap)).
- Instagram does not let websites download reel videos, and its embed player cannot autoplay. That is why reels use self-hosted .mp4 files.

### Shop (`/shop`)
All filters live in the URL, so they can be shared and the back button works:
- `category`, `make`+`model` (fitment), `search`, `tag` (`sale|new|bestseller|emi`), `brand` (comma list), `minPrice`, `maxPrice`, `inStock=1`, `sort`, `page`
- Sorts: popular, price low/high, biggest discount, top rated, newest
- Filter chips you can remove, "Clear all", pagination (12 per page), and an empty state that suggests WhatsApp

### Product page (`/product/:slug`)
- Gallery with thumbnails, discount badge, brand, tags, rating, and a jump-to-reviews link.
- Price, MRP and % off, "you save", and an **EMI from ₹X/month** line (price / 9) for items of ₹3,000 or more.
- Fitment box: check, fits, or not listed.
- **"Add studio fitment"** card with its charge.
- Quantity, Add to cart, **Buy now** (adds the item and goes to checkout), wishlist.
- **Ask on WhatsApp** button with a prefilled message (product, price, car, link).
- Stock line ("Only 3 left") and delivery / pickup / warranty perks.
- Tabs: Details (highlights), Specifications, Compatibility, **Reviews** (customers can post star ratings, and the product average updates).
- "You may also like" (same category).

### Cart (`/cart`) and Checkout (`/checkout`)
- All totals come from the **server** (`POST /api/cart/quote`), never from the browser.
- Coupon box: apply or remove. If a code fails, the error shows and the cart is re-priced without the coupon.
- Steps:
  1. **Contact:** name, 10-digit Indian mobile, optional email
  2. **Your car:** make, model, reg no. Required when fitment is selected; prefilled from the saved car.
  3. **Delivery or pickup.** If any item has fitment, this becomes a **fitment slot**: a 14-day date strip and time slots with live availability.
  4. **Payment:** cash/UPI on delivery (or at the studio), pay at studio by card, or **EMI with Bajaj Finserv**, where the team calls back. **No online payment yet.**
- The summary shows MRP, product discount, coupon, fitment, delivery or pickup, total, and "You save ₹X".

### Orders
- **Order placed** page (`/order/:orderId`) with a WhatsApp link and the full order view.
- **Track order** (`/track-order`): enter Order ID + phone to see a progress bar (placed → confirmed → shipped/ready → delivered/completed), the timeline with admin notes, items, totals, slot or address, and vehicle.

### Other pages
- **Offers** (`/offers`): all active coupons and the sale banner (the poster).
- **Book installation** (`/book-installation`): service-only booking. Pick from 8 services (stereo, speakers, lighting, body kit, seat cover, sun film, wheels, free consultation), a date and slot, and enter car and contact details. No payment.
- **Wishlist** (`/wishlist`): saved items with live price and stock.
- **Contact** (`/contact`): call / WhatsApp / Instagram tiles, enquiry form (general, product, EMI, bulk), and shipping/returns/warranty/payments policies (`/contact#policies`).

---

## 5. Admin panel features

`/admin`: password login (5 wrong tries locks it for 5 minutes). Sessions last 12 hours and are stored in localStorage.

| Page | What it does |
|---|---|
| **Dashboard** | Revenue (excludes cancelled orders), open orders, upcoming bookings, new enquiries, subscribers, **7-day sales bar chart**, **low-stock list** (5 or fewer), recent orders |
| **Orders** | Filter by status; click a row for the side panel: customer (call / WhatsApp), vehicle, fitment slot, address, items, totals. **Change status with a note** (shown to the customer in tracking). **Cancelling puts items back in stock.** Mark payment pending / paid / refunded |
| **Bookings** | Upcoming service bookings (toggle past), change status (requested, confirmed, in progress, completed, cancelled) |
| **Products** | Search, add, edit, hide (soft delete). Form: name, category, brand, price, MRP, stock, tags, image URLs with preview, description, highlights, specs (`Key: Value` lines), **fitment** (`Brand: Model, Model` lines, empty = universal), fitment charge, visible toggle |
| **Offers** | Coupon CRUD: code, title, percent or flat, value, minimum order, max discount, valid till, category restriction, card colour, active |
| **Reels** | Add, edit, delete reels: caption, car, tag, **video file** (with live preview), cover image, Instagram link, order, show/hide |
| **Enquiries** | Contact-form messages with status (new, contacted, closed), plus the newsletter subscriber list |

---

## 6. Business rules

**Pricing** (`server/src/utils/pricing.js`)
- Prices always come from the catalogue on the server. Quantity is 1-10 and limited by stock.
- Fitment charge = `product.installation.charge × qty`, only when the item has `install: true`.
- If **any** item has fitment, fulfilment becomes `studio-install` (no shipping, a slot is required, a vehicle is required).
- Delivery fee: `settings.shippingFee` (₹149) when delivered and subtotal minus coupon is below `settings.freeShippingAbove` (₹4,999). Pickup and studio fitment are free.

**Coupons**
- Checked in this order: active, not expired, category restriction, minimum order on eligible items.
- Percent discounts are capped by `maxDiscount`.
- Seeded codes:

| Code | Discount | Rules |
|---|---|---|
| `ADDON10` | 10% | Minimum ₹2,999, max ₹2,000 |
| `SOUND1500` | ₹1,500 off | Audio only, minimum ₹9,999 |
| `FIRSTRIDE` | ₹500 off | Minimum ₹3,999 |
| `WHEELS30` | Extra 5% | Alloys only, minimum ₹15,000 |

**Installation slots** (`server/src/utils/slots.js`)
- Slots: `settings.installationSlots` (10:00 AM to 5:30 PM, 6 a day). Capacity is `settings.bookingsPerSlot` (2), shared between bookings and fitment orders.
- **Sunday** is a half day: the last slot is 1:00 PM. Same-day slots need at least 1 hour's notice. Bookings open up to 60 days ahead.
- Times use **IST** whatever timezone the server is in.

**Orders**
- Order ID is `AA` + `YYMMDD` + 4 random digits, e.g. `AA2611163476`. Booking ID is `BK` + 6 digits.
- Stock goes down when an order is placed and back up if the admin cancels it. A cancelled order cannot be reopened.
- Statuses: `placed, confirmed, ready, shipped, completed, cancelled`. Payment: `pending, paid, refunded`.
- Tracking needs both the Order ID and the phone number (the last 10 digits are compared).

**Validation:** Indian mobile `^[6-9]\d{9}$`, 6-digit pincode, email format, and length limits on every text field.

---

## 7. API reference

Base: `/api`. JSON in and out. Errors look like `{ "error": "message", "field": "..." }` with a 4xx/5xx status.

**Public**

| Method | Path | Notes |
|---|---|---|
| GET | `/health` | `{ ok: true }` |
| GET | `/settings` | Store settings (phones, hero slides, services, slots...) |
| GET | `/categories` | Includes `productCount` |
| GET | `/vehicles` | `[{ make, models[] }]` |
| GET | `/brands`, `/testimonials`, `/offers`, `/reels` | Active offers only; reels sorted |
| GET | `/home` | `bestsellers, newArrivals, onSale, dealOfTheDay, offers, testimonials, brands, reels` |
| GET | `/products` | Query: `category, tag, search, make, model, brand, minPrice, maxPrice, inStock, sort, page, limit`. Returns `{ items, total, page, limit, facets: { brands, price } }` |
| GET | `/products/:slug` | `{ product, category, reviews, related }` (slug or id) |
| POST | `/products/:id/reviews` | `{ name, rating 1-5, title?, text }` |
| POST | `/cart/quote` | `{ items:[{productId, qty, install}], coupon?, fulfilment? }` → `{ lines, totals, coupon, fulfilment, needsInstall }` |
| POST | `/orders` | `{ items, coupon?, fulfilment: delivery\|pickup, customer{name,phone,email?}, address?, vehicle?, installation?{date,slot}, paymentMethod: cod\|pay-at-store\|emi, notes? }` |
| GET | `/orders/track?orderId=&phone=` | Full order |
| GET | `/bookings/slots?date=YYYY-MM-DD` | `{ slots:[{slot, available, reason: null\|full\|past\|closed}] }` |
| POST | `/bookings` | `{ serviceId, date, slot, name, phone, email?, make, model, regNo?, notes? }` |
| POST | `/enquiries` | `{ type: contact\|product\|bulk\|emi, name, phone, email?, subject?, message }` |
| POST | `/newsletter` | `{ email }` |

**Admin** (header `Authorization: Bearer <token>`)

| Method | Path |
|---|---|
| POST | `/admin/login` `{ password }` → `{ token }` |
| GET | `/admin/stats` |
| GET / PATCH | `/admin/orders` (`?status=`), `/admin/orders/:id` `{ status?, note?, paymentStatus? }` |
| GET / PATCH | `/admin/bookings`, `/admin/bookings/:id` `{ status }` |
| GET / PATCH | `/admin/enquiries`, `/admin/enquiries/:id` `{ status }` |
| GET | `/admin/subscribers` |
| GET / POST / PUT / DELETE | `/admin/products`, `/admin/products/:id` (DELETE = hide) |
| GET / POST / PUT / DELETE | `/admin/offers`, `/admin/offers/:id` |
| GET / POST / PUT / DELETE | `/admin/reels`, `/admin/reels/:id` |

---

## 8. Data files and models

`server/data/*.json`. Each file is one collection (an array), except `settings.json`, which is one object. Rows get `id`, `createdAt` and `updatedAt` automatically.

| File | Contents |
|---|---|
| `settings.json` | storeName, tagline, `phones[]`, `whatsapp` (wa.me number), `email` (empty = hidden), instagram + handle, **`address` (placeholder: fill in)**, hours, emiPartner, freeShippingAbove, shippingFee, installationSlots, bookingsPerSlot, `heroSlides[]`, `services[]` |
| `categories.json` | 12 categories: `{ id (slug), name, image, blurb }` |
| `vehicles.json` | 12 makes with model lists |
| `products.json` | 24 products: `{ id p001.., slug, name, categoryId, brand, price, mrp, images[], rating, reviewCount, stock, tags[], fitment, highlights[], specs{}, description, installation{available, charge}, active }` |
| `offers.json` | Coupons (see business rules) |
| `reels.json` | `{ id, title, car, tag, video, poster, instagramUrl, sort, active }` |
| `reviews.json`, `testimonials.json`, `brands.json` | Review rows, homepage testimonials, brand names |
| `orders.json`, `bookings.json`, `enquiries.json`, `subscribers.json` | Start empty. Real customer data: **don't commit real orders** |

---

## 9. Design system

- **Colours:** black `#0e0f12` and red `#e11d25`, from the logo. Tokens are in `client/src/styles/base.css` (`:root`).
- **Fonts:** **Barlow Condensed** italic uppercase for headings (the `.display` class, echoing the logo and poster), **Manrope** for body text.
- **Signature details:** skewed red "slash" tags (`.slash-tag`), skewed discount badges, diagonal red stripes in the hero.
- **Layout:** light content sections alternate with dark sections (hero, deal, reels, footer).
- Responsive; checked at 390px phone width. Breakpoints are around 1100, 1024, 760 and 640px. `prefers-reduced-motion` is respected.
- Buttons: `.btn` plus `.btn-red`, `.btn-dark`, `.btn-outline`, `.btn-ghost-light`, `.btn-green`, `.btn-white`, and size modifiers `.btn-sm`, `.btn-lg`, `.btn-block`.
- Product images use `object-fit: contain` on white. The `Img` component shows a striped placeholder if a URL fails.

---

## 10. Editing store content

| What | Where |
|---|---|
| Phone, WhatsApp, address, hours, hero slides, services, slot times, shipping fee | `server/data/settings.json` (also update `seedData.js` if you want resets to keep it) |
| Products, coupons, reels | Admin panel |
| Categories, car makes/models, testimonials, brands | `server/data/*.json` |
| Logo, poster | `client/public/images/` |
| Own product photos | Put them in `client/public/images/` and use `/images/name.jpg` as the image URL |
| **Instagram reels** | Download the reel .mp4 from Instagram, put it in `client/public/reels/`, then set the reel's **Video file** to `/reels/name.mp4` in Admin, Reels. Keep files under about 8 MB |

---

## 11. Moving to MongoDB or PostgreSQL

All storage goes through `server/src/db/jsonStore.js`:

```js
collection(name).all() | find(query) | findOne(query) | insert(doc) | update(query, patchOrFn) | remove(query)
getSettings()
```

`query` is an object of exact matches or a predicate function. `update` accepts an object or a function `(row) => changes`.

Re-implement this one file and keep the same method names:
- **MongoDB:** use the official `mongodb` driver or Mongoose, one collection per JSON file.
- **Postgres:** use Prisma, or `pg` with JSONB columns.

Predicate-function queries will need to become real queries, so check the `find((x) => ...)` calls in the routes. Seed the new database from `seedData.js`. Price comparison: Render Postgres Basic is about $6 a month; MongoDB Atlas M0 is free (no backups) and Flex starts at $8.

---

## 12. Deployment on Render

This is the plan; it hasn't been deployed yet.

1. New **Web Service** from this repo.
   - Build: `npm run install:all && npm run build`
   - Start: `npm start`
   - Plan: **Starter** ($7 a month, always on). The free plan sleeps.
2. Env vars: `ADMIN_PASSWORD`, `TOKEN_SECRET`, `CLIENT_ORIGIN=https://addonautocraft.com`.
3. Add the custom domain `addonautocraft.com` in Render and point DNS at it. SSL is automatic.
4. **Important:** Render's disk is temporary, so **JSON data is lost on every deploy or restart**. Move to Render Postgres or MongoDB (section 11) **before taking real orders**, or attach a Render persistent disk mounted at `server/data`.

Running costs are in `docs/Addon-Automotive-Cost-Estimate.pdf`. The recommended plan is about ₹1,954 a month, plus Razorpay's 2.36% per online payment.

---

## 13. Not done yet / roadmap

| Item | Status / notes |
|---|---|
| **Reel videos** | 12 reels exist by caption only. Owner must download the .mp4s and add them. Option discussed: if a reel has only an Instagram `/reel/` link, show Instagram's embed (tap to play, no autoplay) |
| **Razorpay online payments** | Not built. Plan: create a Razorpay order on the server, open Checkout on the client, verify the signature in a webhook, mark the payment `paid`. Fee is 2% + GST |
| **WhatsApp Business API** | Not built (the site only has wa.me chat links). Plan: Meta Cloud API utility templates for order and booking updates to the customer, and new-order alerts to the owner |
| **Real database** | Still JSON files (see section 11) |
| **Deployment** | Not deployed (see section 12) |
| **Store address and email** | Placeholders in `settings.json` |
| **Product photos and catalogue** | Seed products, prices and reviews are **sample data**; images are hotlinked from Amazon/Unsplash/the old repo. Replace with the real stock and shop photos |
| **Customer accounts / login** | Not built. Orders are tracked by Order ID + phone |
| **Email / SMS notifications** | Not built |
| **Image uploads in admin** | Not built (URLs only). Later: Cloudinary or similar, since Render's disk is temporary |

---

## 14. Known issues and gotchas

- **Never return a value from a `useEffect` callback** (e.g. `useEffect(() => window.scrollTo(0,0))`). React treats it as a cleanup function, and that crashed the layout with "destroy is not a function". Always use braces: `useEffect(() => { ... }, [])`.
- **GitHub push from the original laptop failed (403):** Windows Credential Manager was signed in as another GitHub account (`globalAutocraft`). Either add that account as a collaborator, or clear the stored credential and sign in as `Nikhilk70`.
- `client/dist/` is git-ignored. If it exists, `npm run dev` still works (Vite on 5173), and the API on 5000 also serves the old build. Rebuild after changes if you test on port 5000.
- Headless Chrome screenshots of the Vite dev server can come out blank. Screenshot the built app on port 5000 instead.
- `npm run reset-data` wipes customer data. Never run it on a live server.
- Prices in the pricing PDF were checked in November 2026 at $1 = ₹90. Re-check them before quoting again.
