# Addon Automotive - Online Store (demo)

Website for **Addon Automotive**, a car accessories and fitment studio (Android stereos, speakers, alloys, lighting, seat covers, spoilers, body kits, sun films). Customers can shop by their car, order, book a fitment slot at the studio, use coupons, request EMI, and track orders. The owner manages everything from an admin panel.

**This is a frontend-only demo build for showing the client.** There is no server: all store logic runs in the browser and data is saved in the browser's localStorage. It's hosted free on **GitHub Pages**.

- **Live demo:** https://nikhilk70.github.io/Addon-Automotive/ (after Pages is enabled; see [Deploying](#5-deploying-to-github-pages))
- **Stack:** React 18, Vite 5, React Router 6 (HashRouter), plain CSS, `lucide-react` icons
- **Repo:** https://github.com/Nikhilk70/Addon-Automotive
- **Planned production domain:** `addonautocraft.com`. Costs are in [docs/Addon-Automotive-Cost-Estimate.pdf](docs/Addon-Automotive-Cost-Estimate.pdf).

> AI agents: also read [AGENTS.md](AGENTS.md) for the working rules of this project.

---

## Contents
1. [Quick start](#1-quick-start)
2. [How the demo works without a backend](#2-how-the-demo-works-without-a-backend)
3. [Project history](#3-project-history)
4. [Folder structure](#4-folder-structure)
5. [Deploying to GitHub Pages](#5-deploying-to-github-pages)
6. [Customer features](#6-customer-features)
7. [Admin panel features](#7-admin-panel-features)
8. [Business rules](#8-business-rules)
9. [Internal API (in-browser)](#9-internal-api-in-browser)
10. [Data and models](#10-data-and-models)
11. [Design system](#11-design-system)
12. [Editing store content](#12-editing-store-content)
13. [Going to production with a real backend](#13-going-to-production-with-a-real-backend)
14. [Not done yet / roadmap](#14-not-done-yet--roadmap)
15. [Known issues and gotchas](#15-known-issues-and-gotchas)

---

## 1. Quick start

Requires **Node.js 18+** (built with Node 24).

```bash
git clone https://github.com/Nikhilk70/Addon-Automotive.git
cd Addon-Automotive
npm install
npm run dev        # http://localhost:5173
```

| Command | Does |
|---|---|
| `npm run dev` | Dev server with hot reload at http://localhost:5173 |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serves the `dist/` build locally to check it |

- **Admin panel:** http://localhost:5173/#/admin. The demo password is **`addon@admin123`**, and it's shown on the login screen.
- URLs use a hash (`/#/shop`, `/#/product/...`) so they work on GitHub Pages without server rewrites.

---

## 2. How the demo works without a backend

The original project had an Express API. For the static demo, that API was **moved into the browser**:

- `src/mock/` contains the same routes and business rules as the old server: pricing, coupons, fitment, slots, orders, admin. They're written in Express style (`r.get('/products', handler)`) and run through a tiny in-browser router (`src/mock/router.js`).
- `src/lib/api.js` is the only place the UI talks to "the API". It calls `handle()` from `src/mock/` instead of `fetch()`, with a 120 ms delay so loading states look real.
- `src/mock/store.js` is the database: `collection(name).all/find/findOne/insert/update/remove`, saved in **localStorage** under keys `addon_db_v1:<collection>`. On first visit it loads the starting data from `src/mock/seed.js`.

**What this means for the demo:**
- Every visitor (and every browser or device) has their **own copy** of the data. An order placed on the client's phone appears in admin **on that same phone**, not on yours.
- Admin edits (products, prices, coupons, reels) also stay only in that browser.
- **Admin → Reset demo data** restores the starting data in that browser.
- The admin password is in the page code. **This is not secure and is only for demos.**

---

## 3. Project history

1. The owner first started a plain HTML/CSS/JS site (repo `Nikhilk70/Auto-Motive`). It had a logo, a hero slider and 10 categories, and was dropped.
2. A full **React + Express** store replaced it, inspired by **zelixautomotives.in** (a Shopify car-mods store), with extra features such as shop-by-car fitment, installation booking, WhatsApp, EMI, reviews and order tracking.
3. Reused from the old repo: the logo (`public/images/logo.png`), the offer poster (`public/images/offer-poster.jpg`), the 10 category names and image URLs.
4. Business details taken from the poster: phones **+91 89211 68071** and **+91 80752 43040**, Instagram **@addonautomotive**, **10-30% off** sale, **EMI with Bajaj Finserv**, and the product lines.
5. Added: a client pricing PDF (`docs/`), and the Instagram **Reels** section.
6. **The backend was removed** to make a static demo for GitHub Pages. The Express code was ported into `src/mock/`. The last commit that still has the Express server (`server/` folder) is `e2a609d`. Use `git show e2a609d:server/src/index.js` or check out that commit to see it.

---

## 4. Folder structure

```
Addon-Automotive/
├── index.html               # fonts (Barlow Condensed + Manrope), meta, favicon
├── vite.config.js           # base './' (works under any sub-path)
├── package.json
├── .github/workflows/deploy.yml   # builds and publishes to GitHub Pages on push to main
├── docs/Addon-Automotive-Cost-Estimate.pdf   # client pricing: domain, Render, DB, Razorpay, WhatsApp
├── public/
│   ├── images/              # logo.png, offer-poster.jpg (+ your own photos)
│   └── reels/               # Instagram reel .mp4 files go here
└── src/
    ├── main.jsx             # providers + HashRouter
    ├── App.jsx              # all routes
    ├── mock/                # ---- the "backend", running in the browser ----
    │   ├── index.js         # handle(method, url, body, headers) + resetDemoData
    │   ├── router.js        # tiny Express-style router (req, res, next)
    │   ├── store.js         # localStorage "database": collection(name)...
    │   ├── seed.js          # starting data: settings, categories, vehicles, products, offers, reels...
    │   ├── auth.js          # demo admin password + token
    │   ├── http.js          # HttpError, async wrapper, validators (phone, email, pincode...)
    │   ├── pricing.js       # cart pricing, coupons, fitment check
    │   ├── slots.js         # installation slot availability (IST, capacity, Sundays)
    │   └── routes/          # catalog.js, orders.js, bookings.js, admin.js
    ├── context/
    │   ├── StoreContext.jsx # settings, categories, vehicles, saved car ("garage"), wishlist, toasts
    │   └── CartContext.jsx  # cart items, coupon, drawer (localStorage)
    ├── lib/
    │   ├── api.js           # api.get/post/put/patch/del -> src/mock
    │   ├── format.js        # inr(), dates, fitsVehicle(), waLink(), asset(), status labels
    │   └── storage.js       # safe localStorage helpers
    ├── components/          # Header, Footer, Layout, CartDrawer, ProductCard, VehicleSelector,
    │                        # SlotPicker, Reels, ui.jsx (Img, Stars, Price, QtyStepper, Countdown...)
    ├── pages/               # Home, Shop, Product, Checkout (+CartPage), Orders (success/track),
    │   │                    # Info (Offers, BookInstallation, Wishlist, Contact, NotFound)
    │   └── admin/           # AdminLayout (login + shell), AdminPages, CatalogAdmin
    └── styles/              # base.css (tokens, buttons, forms), components.css, pages.css, admin.css
```

---

## 5. Deploying to GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds and publishes the site **every time you push to `main`**.

**One-time setup** (in the GitHub repo):
1. **Settings → Pages → Build and deployment → Source:** choose **GitHub Actions**.
2. Push to `main`, or re-run the workflow from the **Actions** tab.
3. The site goes live at **https://nikhilk70.github.io/Addon-Automotive/**. The link to share is also shown in Settings → Pages and on the workflow run.

**Useful links to send the client:**
- Store: `https://nikhilk70.github.io/Addon-Automotive/`
- Admin: `https://nikhilk70.github.io/Addon-Automotive/#/admin` (password `addon@admin123`)

To use a custom domain later (e.g. `addonautocraft.com`), set it in Settings → Pages and add the DNS records GitHub shows.

---

## 6. Customer features

### Site-wide
- **Top bar:** rotating announcements (sale, EMI, free fitment, FIRSTRIDE coupon), phone and Instagram links.
- **Header:**
  - logo
  - **live search** with suggestions
  - **"Add your car" / My car** selector
  - wishlist and cart counters
- **Navigation:**
  - "All Categories" **mega menu** (images and product counts)
  - links: Shop All, Offers, Book Installation, Track Order, Contact
- **Mobile:** slide-out menu, mobile search, filter drawer.
- **Cart drawer:**
  - free-delivery progress bar
  - quantity steppers
  - per-item **studio fitment** toggle
- **Floating WhatsApp button** with the store number.
- **Footer:** newsletter, links, phones, hours, payment-method chips.
- Toast notifications and a 404 page.

### Shop by your car (fitment)
- Customers pick **make + model** (12 Indian brands, 63 models). It's saved in the browser as the "garage".
- Each product's `fitment` is `"universal"` or a list of `{ make, models[] }`.
- Cards show **"Fits your Creta"** or **"Not listed for Creta"**. The shop filters by fitment, and the product page has a fitment checker.

### Home page
In order:
1. Hero slider with the car selector card
2. Trust strip
3. Shop by category grid
4. Promo tiles: offer poster, EMI, book installation
5. **Deal of the day** with a countdown to midnight
6. Product tabs: Bestsellers / New / Biggest discounts
7. Coupon cards: tap to copy and auto-apply
8. Brand marquee
9. "Order online, fitted by pros" steps
10. **Instagram Reels**
11. Testimonials

### Instagram Reels
- Vertical 9:16 cards in a swipeable row, with a Follow @addonautomotive button.
- When a reel has a `video` (.mp4), it **autoplays muted and loops while at least 60% visible** and pauses off-screen. It has a sound toggle and click-to-pause. Users with "reduce motion" switched on get a play button instead.
- Without a video, it shows an Instagram-gradient card with the caption and a "Watch on Instagram" link.
- Seeded with captions of the 12 latest @addonautomotive reels. **No video files have been added yet.**
- Instagram doesn't let websites download reel videos, and its embed player can't autoplay. That's why reels use .mp4 files in `public/reels/`.

### Shop (`/#/shop`)
- URL filters: `category`, `make`+`model`, `search`, `tag` (`sale|new|bestseller|emi`), `brand`, `minPrice`, `maxPrice`, `inStock`, `sort`, `page`.
- Sorts: popular, price low/high, discount, rating, newest.
- Removable chips, pagination (12 per page), and an empty state.

### Product page (`/#/product/:slug`)
- Gallery, discount badge, rating, price/MRP/% off, and **EMI from ₹X/month** (price / 9, for items of ₹3,000 or more).
- Fitment box and **"Add studio fitment"**.
- Quantity, Add to cart, **Buy now**, wishlist, **Ask on WhatsApp** (prefilled message).
- Stock line, delivery/pickup/warranty perks.
- Tabs: Details, Specifications, Compatibility, **Reviews** (customers can post).
- Related products.

### Cart and Checkout
- Totals always come from the pricing logic (`/cart/quote`), never from stored cart prices.
- Coupons, with clear error messages.
- Steps:
  1. **Contact:** name, 10-digit mobile, email
  2. **Car:** required when fitment is selected; prefilled from the saved car
  3. **Delivery / pickup**, or a **fitment slot** (14-day date strip, live slot availability) if any item has fitment
  4. **Payment:** cash/UPI on delivery or at the studio, card at the studio, or **EMI with Bajaj Finserv**. No online payment yet.
- The summary shows MRP, discounts, coupon, fitment, delivery, total and "You save".

### Orders and other pages
- **Order placed** page and **Track order** (Order ID + phone): progress bar, timeline with admin notes, items, totals.
- **Offers**, **Book installation** (8 services, date + slot, no payment), **Wishlist**, **Contact** (call / WhatsApp / Instagram, enquiry form, policies at `/#/contact#policies`).

---

## 7. Admin panel features

`/#/admin`. Password `addon@admin123` (demo only). Five wrong attempts lock login for 5 minutes. Sessions last 12 hours.

| Page | What it does |
|---|---|
| **Dashboard** | Revenue, open orders, upcoming bookings, new enquiries, subscribers, **7-day sales chart**, **low-stock list**, recent orders |
| **Orders** | Filter by status; side panel with customer (call / WhatsApp), vehicle, slot, address, items. **Change status with a note** (shown in tracking). **Cancelling restocks items.** Mark payment pending/paid/refunded |
| **Bookings** | Service bookings with status changes |
| **Products** | Search, add, edit, hide: price, MRP, stock, tags, images (with preview), highlights, specs, **fitment**, fitment charge, visibility |
| **Offers** | Coupon CRUD: percent/flat, minimum, max discount, expiry, category restriction, colour |
| **Reels** | Caption, car, tag, **video file** (with live preview), cover, Instagram link, order, show/hide |
| **Enquiries** | Contact messages with status, plus newsletter subscribers |
| **Reset demo data** | Sidebar button: restores the starting data in this browser |

---

## 8. Business rules

**Pricing** (`src/mock/pricing.js`)
- Prices always come from the catalogue. Quantity is 1-10 and limited by stock.
- Fitment charge = `installation.charge × qty`. If any item has fitment, fulfilment becomes `studio-install` (no shipping; slot and car required).
- Delivery fee: ₹149 below ₹4,999 (after coupon). Pickup and studio fitment are free.

**Coupons**

| Code | Discount | Rules |
|---|---|---|
| `ADDON10` | 10% | Minimum ₹2,999, max ₹2,000 |
| `SOUND1500` | ₹1,500 off | Audio only, minimum ₹9,999 |
| `FIRSTRIDE` | ₹500 off | Minimum ₹3,999 |
| `WHEELS30` | Extra 5% | Alloys only, minimum ₹15,000 |

**Slots** (`src/mock/slots.js`)
- 6 slots a day (10:00 AM to 5:30 PM), 2 per slot, shared by bookings and fitment orders.
- Sunday is a half day (last slot 1 PM). Same-day slots need 1 hour's notice. Bookings open up to 60 days ahead. Times are IST.

**Orders**
- Order ID is `AA` + `YYMMDD` + 4 digits. Booking ID is `BK` + 6 digits.
- Stock goes down on order and back up on cancel. A cancelled order can't be reopened.
- Statuses: `placed, confirmed, ready, shipped, completed, cancelled`. Payment: `pending, paid, refunded`.
- Tracking needs both the Order ID and the phone.

**Validation:** Indian mobile `^[6-9]\d{9}$`, 6-digit pincode, email, and length limits on every field.

---

## 9. Internal API (in-browser)

The UI calls `api.get('/products')` and similar; `src/mock/routes/` answers. Errors come back as `ApiError` with `{ error, field? }`. These routes match the old Express API, so a real server can implement the same contract later.

**Public:**
- `GET /settings`, `/categories`, `/vehicles`, `/brands`, `/testimonials`, `/offers`, `/reels`
- `GET /home` → `bestsellers, newArrivals, onSale, dealOfTheDay, offers, testimonials, brands, reels`
- `GET /products?category&tag&search&make&model&brand&minPrice&maxPrice&inStock&sort&page&limit` → `{ items, total, page, limit, facets }`
- `GET /products/:slug`, `POST /products/:id/reviews`
- `POST /cart/quote` `{ items:[{productId, qty, install}], coupon?, fulfilment? }`
- `POST /orders`, `GET /orders/track?orderId&phone`
- `GET /bookings/slots?date`, `POST /bookings`, `POST /enquiries`, `POST /newsletter`

**Admin** (needs the login token):
- `POST /admin/login`, `GET /admin/stats`
- `GET|PATCH /admin/orders[/:id]`, `/admin/bookings[/:id]`, `/admin/enquiries[/:id]`
- `GET /admin/subscribers`
- `GET|POST|PUT|DELETE /admin/products[/:id]`, `/admin/offers[/:id]`, `/admin/reels[/:id]`

---

## 10. Data and models

The starting data is in **`src/mock/seed.js`**. Visitors' changes are in their browser's localStorage (`addon_db_v1:*`). Other localStorage keys: `addon_cart`, `addon_coupon`, `addon_wishlist`, `addon_garage`, `addon_admin_token`.

| Collection | Contents |
|---|---|
| `settings` | storeName, tagline, phones, whatsapp, email (empty = hidden), instagram, **address (empty = hidden; fill in)**, hours, emiPartner, freeShippingAbove, shippingFee, installationSlots, bookingsPerSlot, heroSlides, services |
| `categories` | 12: `{ id, name, image, blurb }` |
| `vehicles` | 12 makes, 63 models |
| `products` | 24 sample products: `{ id, slug, name, categoryId, brand, price, mrp, images[], rating, reviewCount, stock, tags[], fitment, highlights[], specs{}, description, installation{available, charge}, active }` |
| `offers` | Coupons above |
| `reels` | `{ id, title, car, tag, video, poster, instagramUrl, sort, active }` |
| `reviews`, `testimonials`, `brands` | |
| `orders`, `bookings`, `enquiries`, `subscribers` | Start empty |

**Important:** if you change `seed.js`, visitors who already opened the site keep their old copy until they use **Reset demo data**. To force everyone onto new seed data, bump `PREFIX` in `src/mock/store.js` (e.g. `addon_db_v2:`).

---

## 11. Design system

- **Colours:** black `#0e0f12` and red `#e11d25`, from the logo. Tokens are in `src/styles/base.css`.
- **Fonts:** **Barlow Condensed** italic uppercase for headings (`.display`), **Manrope** for body text.
- **Signature details:** skewed red "slash" tags, skewed discount badges, diagonal red stripes in the hero. Light sections alternate with dark ones (hero, deal, reels, footer).
- Responsive; checked at 1440px and 390px. `prefers-reduced-motion` is respected.
- Buttons: `.btn` plus `.btn-red|dark|outline|ghost-light|green|white`, sizes `.btn-sm|lg|block`.
- Asset paths: always use `asset('images/x.png')` from `src/lib/format.js` (or paths starting with `/`, which `Img` and `Reels` pass through `asset()`), so images work under the GitHub Pages sub-path.

---

## 12. Editing store content

| What | Where |
|---|---|
| Phones, WhatsApp, address, hours, hero slides, services, slot times, shipping fee, products, coupons, reels, categories, car models, testimonials | `src/mock/seed.js`, then commit and push (and bump `PREFIX`, or use Reset demo data, to see the changes) |
| Quick demo edits to products, coupons, reels | Admin panel (saved only in that browser) |
| Logo, poster, own product photos | `public/images/`, referenced as `/images/name.jpg` |
| **Instagram reels** | Download the reel .mp4 from Instagram, put it in `public/reels/`, and set `video: '/reels/name.mp4'` for that reel in `seed.js`. Keep files under about 8 MB |

---

## 13. Going to production with a real backend

The demo is designed so a real backend can be added without touching the pages:

1. Build a server that implements the routes in section 9. The logic in `src/mock/routes/*.js` is already Express-style and can be copied into an Express app almost as-is. The original Express server is at commit `e2a609d` (`server/` folder).
2. Use a real database instead of localStorage: **Render Postgres** (about $6 a month) or **MongoDB Atlas**. Re-implement `collection()` from `src/mock/store.js` on the server.
3. In `src/lib/api.js`, replace `handle(...)` with `fetch(\`${API_URL}${path}\`, ...)`, then delete `src/mock/`.
4. Move admin login to the server with a secret password and signed tokens (the old server used HMAC tokens).
5. Host on Render (web service $7 a month) with the domain `addonautocraft.com`. See `docs/Addon-Automotive-Cost-Estimate.pdf`.

---

## 14. Not done yet / roadmap

| Item | Status / notes |
|---|---|
| **Real backend + database** | Removed for the demo (section 13) |
| **Reel videos** | 12 reels exist by caption only; the owner must provide the .mp4s. Option: show Instagram's tap-to-play embed when only a `/reel/` link is given |
| **Razorpay online payments** | Not built. Needs a backend (create order, verify signature). Fee is 2% + GST |
| **WhatsApp Business API** | Not built (site uses wa.me chat links). Needs a backend: Meta Cloud API templates for customer updates and owner alerts |
| **Store address and email** | Empty in `seed.js` (hidden on the site) |
| **Product catalogue and photos** | 24 **sample** products and reviews; images are hotlinked from Amazon/Unsplash/the old repo. Replace with real stock and shop photos |
| **Customer accounts, email/SMS, image uploads** | Not built |

---

## 15. Known issues and gotchas

- **Never return a value from a `useEffect` callback** (e.g. `useEffect(() => window.scrollTo(0,0))`). It crashed the layout with "destroy is not a function". Always use braces.
- **GitHub push (403) from the original laptop:** Windows Credential Manager was signed in as another GitHub account (`globalAutocraft`). Fix: `git config credential.useHttpPath true`, then `git push` and sign in as `Nikhilk70` in the browser window.
- **Don't switch to `BrowserRouter`** while hosting on GitHub Pages: refreshing a deep link would 404. Keep `HashRouter`.
- **Don't use bare absolute paths like `src="/images/x.png"`** in JSX; use `asset()`. The site runs under `/Addon-Automotive/`.
- Data is per browser: what the client does on their phone isn't visible to you. That's expected for this demo.
- Prices in the pricing PDF were checked in November 2026 at $1 = ₹90. Re-check them before quoting again.
