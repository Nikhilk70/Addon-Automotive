// Starting data for the demo store (loaded into the browser on first visit; Admin > Reset demo data reloads it).
// Product images are the ones from the original Auto-Motive repo; replace them
// with your own shop photos from the admin panel (Products -> Edit -> Image URLs).

const IMG = {
  stereo: 'https://m.media-amazon.com/images/I/71xZMLaUgeL._UF1000,1000_QL80_.jpg',
  speakers: 'https://m.media-amazon.com/images/I/91DZroew4dL.jpg',
  led: 'https://m.media-amazon.com/images/I/61WXosxfoqL._UF1000,1000_QL80_.jpg',
  spoiler: 'https://m.media-amazon.com/images/I/71g90+wGBAS.jpg',
  skirts: 'https://m.media-amazon.com/images/I/61NSn0VRbfL.jpg',
  lamps: 'https://miro.medium.com/v2/1*vkpwB0spFMzSr9nmKF9-zw.jpeg',
  alloys: 'https://www.hottracks.in/wp-content/uploads/2021/09/kia-stinger-gt-wheels-tsw-silvano-gloss-black-rims-14-800X572.jpg',
  seat: 'https://m.media-amazon.com/images/I/71G-g0HvoTL._UF1000,1000_QL80_.jpg',
  steering: 'https://m.media-amazon.com/images/I/61idZNIVOVL.jpg',
  fog: 'https://m.media-amazon.com/images/I/71etzl-9DKL.jpg',
  interior: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&q=80',
  garage: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&q=80',
  blackCar: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1600&q=80',
  detailing: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=1200&q=80',
};

export const settings = {
  storeName: 'Addon Automotive',
  tagline: 'Upgrade Your Ride. Elevate Your Style.',
  phones: ['+91 89211 68071', '+91 80752 43040'],
  whatsapp: '918921168071',
  email: '', // add your business email here; it is hidden on the site while empty
  instagram: 'https://www.instagram.com/addonautomotive',
  instagramHandle: '@addonautomotive',
  address: '', // add the studio address here; it is hidden on the site while empty
  mapUrl: '',
  hours: 'Mon - Sat: 9:30 AM - 8:00 PM | Sun: 10:00 AM - 2:00 PM',
  emiPartner: 'Bajaj Finserv',
  freeShippingAbove: 4999,
  shippingFee: 149,
  currency: 'INR',
  installationSlots: ['10:00 AM', '11:30 AM', '01:00 PM', '02:30 PM', '04:00 PM', '05:30 PM'],
  bookingsPerSlot: 2,
  heroSlides: [
    {
      id: 'h1',
      eyebrow: 'Flat 10% - 30% off',
      title: 'Upgrade Your Ride.\nElevate Your Style.',
      text: 'Android stereos, speakers, alloys, lighting and body kits - fitted by experts at our studio.',
      image: IMG.garage,
      cta: { label: 'Shop the Sale', to: '/shop?tag=sale' },
      secondary: { label: 'Book Installation', to: '/book-installation' },
    },
    {
      id: 'h2',
      eyebrow: 'EMI with Bajaj Finserv',
      title: 'Big Sound.\nEasy EMI.',
      text: 'Android head units and speaker packages on no-cost EMI. Free fitment on combos.',
      image: IMG.interior,
      cta: { label: 'Shop Audio', to: '/shop?category=android-stereo' },
      secondary: { label: 'See Offers', to: '/offers' },
    },
    {
      id: 'h3',
      eyebrow: 'Shop by your car',
      title: 'Made to Fit.\nEvery Single Time.',
      text: 'Pick your car and see only the parts that fit - seat covers, lamps, spoilers and more.',
      image: IMG.blackCar,
      cta: { label: 'Find Parts for My Car', to: '/shop' },
      secondary: { label: 'Talk on WhatsApp', to: 'whatsapp' },
    },
  ],
  services: [
    { id: 'stereo-install', name: 'Android Stereo Installation', price: 799, durationMins: 90 },
    { id: 'speaker-install', name: 'Speaker / Woofer Fitting', price: 599, durationMins: 60 },
    { id: 'lighting', name: 'LED, Fog & Headlamp Fitting', price: 499, durationMins: 60 },
    { id: 'body-kit', name: 'Spoiler / Skirts / Body Kit Fitting', price: 999, durationMins: 120 },
    { id: 'seat-cover', name: 'Seat Cover Fitting', price: 399, durationMins: 90 },
    { id: 'cool-film', name: 'Sun Control Film Application', price: 0, durationMins: 120 },
    { id: 'wheels', name: 'Alloy Wheel Fitting & Balancing', price: 699, durationMins: 60 },
    { id: 'consult', name: 'Free Upgrade Consultation', price: 0, durationMins: 30 },
  ],
};

export const categories = [
  { id: 'android-stereo', name: 'Android Stereo', image: IMG.stereo, blurb: 'Smart music systems with CarPlay & Android Auto' },
  { id: 'speakers', name: 'Speakers & Woofers', image: IMG.speakers, blurb: 'High quality sound experience' },
  { id: 'led-lights', name: 'LED Lights', image: IMG.led, blurb: 'Bright, efficient car lighting' },
  { id: 'spoilers', name: 'Spoilers', image: IMG.spoiler, blurb: 'Sporty aerodynamic rear design' },
  { id: 'side-skirts', name: 'Side Skirts', image: IMG.skirts, blurb: 'Stylish side body kits' },
  { id: 'head-tail-lamps', name: 'Head & Tail Lamps', image: IMG.lamps, blurb: 'Clear visibility for night driving' },
  { id: 'alloy-wheels', name: 'Alloy Wheels', image: IMG.alloys, blurb: 'Durable, stylish alloys' },
  { id: 'seat-covers', name: 'Seat Covers', image: IMG.seat, blurb: 'Comfortable premium seat covers' },
  { id: 'steering-covers', name: 'Steering Covers', image: IMG.steering, blurb: 'Grip-friendly steering covers' },
  { id: 'fog-lamps', name: 'Fog Lamps', image: IMG.fog, blurb: 'Clear vision in fog and rain' },
  { id: 'cool-films', name: 'Sun Control Films', image: IMG.interior, blurb: 'Beat the heat, legally' },
  { id: 'wheel-caps', name: 'Wheel Cups & Covers', image: IMG.alloys, blurb: 'Fresh look for steel wheels' },
];

export const vehicles = [
  { make: 'Maruti Suzuki', models: ['Swift', 'Baleno', 'Dzire', 'Brezza', 'Ertiga', 'Wagon R', 'Alto K10', 'Fronx', 'Grand Vitara', 'XL6', 'Ciaz', 'Celerio'] },
  { make: 'Hyundai', models: ['Creta', 'Venue', 'i20', 'Grand i10 Nios', 'Verna', 'Exter', 'Alcazar', 'Aura'] },
  { make: 'Tata', models: ['Nexon', 'Punch', 'Altroz', 'Harrier', 'Safari', 'Tiago', 'Tigor'] },
  { make: 'Mahindra', models: ['XUV700', 'XUV 3XO', 'Thar', 'Scorpio-N', 'Scorpio Classic', 'Bolero', 'XUV400'] },
  { make: 'Kia', models: ['Seltos', 'Sonet', 'Carens', 'Syros'] },
  { make: 'Toyota', models: ['Innova Crysta', 'Innova Hycross', 'Fortuner', 'Glanza', 'Urban Cruiser Hyryder', 'Hilux'] },
  { make: 'Honda', models: ['City', 'Amaze', 'Elevate', 'Jazz'] },
  { make: 'Skoda', models: ['Slavia', 'Kushaq', 'Kylaq', 'Octavia'] },
  { make: 'Volkswagen', models: ['Virtus', 'Taigun', 'Polo'] },
  { make: 'MG', models: ['Hector', 'Astor', 'ZS EV', 'Comet EV'] },
  { make: 'Renault', models: ['Kwid', 'Kiger', 'Triber'] },
  { make: 'Nissan', models: ['Magnite'] },
];

const fit = (make, ...models) => ({ make, models });

const raw = [
  // Android stereo
  { name: '9" Android Stereo 2GB/32GB with Wireless CarPlay', categoryId: 'android-stereo', brand: 'Addon Pro', price: 8999, mrp: 12999, image: IMG.stereo, rating: 4.6, reviewCount: 128, stock: 24, tags: ['bestseller', 'sale', 'emi'], fitment: 'universal', install: 799,
    highlights: ['Wireless Apple CarPlay & Android Auto', 'IPS touch screen with 2.5D glass', 'Steering control support', 'Dual Bluetooth, Wi-Fi, GPS'],
    specs: { Screen: '9 inch IPS', RAM: '2 GB', Storage: '32 GB', Output: '4 x 50W', Warranty: '1 Year' } },
  { name: '10" Android Stereo 4GB/64GB QLED + 360 Camera Ready', categoryId: 'android-stereo', brand: 'Addon Pro', price: 15499, mrp: 21999, image: IMG.stereo, rating: 4.8, reviewCount: 86, stock: 12, tags: ['new', 'emi', 'sale'], fitment: 'universal', install: 799,
    highlights: ['QLED 1280x720 display', '8-core processor', '360 degree camera support', 'DSP equaliser with 32 bands'],
    specs: { Screen: '10 inch QLED', RAM: '4 GB', Storage: '64 GB', Output: '4 x 60W', Warranty: '1 Year' } },
  { name: 'Android Stereo with Custom Frame for Swift / Dzire', categoryId: 'android-stereo', brand: 'Addon Pro', price: 10499, mrp: 13999, image: IMG.stereo, rating: 4.7, reviewCount: 54, stock: 9, tags: ['emi'], fitment: [fit('Maruti Suzuki', 'Swift', 'Dzire')], install: 0,
    highlights: ['Plug & play harness - no wire cutting', 'OEM finish dashboard frame', 'Free installation included', 'Reverse camera included'],
    specs: { Screen: '9 inch IPS', RAM: '2 GB', Storage: '32 GB', 'In the box': 'Frame, harness, camera', Warranty: '1 Year' } },
  // Speakers & woofers
  { name: '6.5" 2-Way Coaxial Speakers (Pair) 320W', categoryId: 'speakers', brand: 'JBL', price: 3499, mrp: 4999, image: IMG.speakers, rating: 4.5, reviewCount: 212, stock: 40, tags: ['bestseller', 'sale'], fitment: 'universal', install: 599,
    highlights: ['Plus One woofer cone for more bass', 'Edge-driven silk dome tweeter', 'Fits most front doors', '3-ohm high efficiency'],
    specs: { Size: '6.5 inch', 'Peak Power': '320W', RMS: '45W', Impedance: '3 ohm', Warranty: '1 Year' } },
  { name: '6.5" Component Speaker System', categoryId: 'speakers', brand: 'Pioneer', price: 6999, mrp: 8990, image: IMG.speakers, rating: 4.6, reviewCount: 74, stock: 15, tags: ['emi'], fitment: 'universal', install: 599,
    highlights: ['Separate tweeters for crisp highs', 'External crossover', 'Studio-like sound staging'],
    specs: { Size: '6.5 inch', 'Peak Power': '350W', RMS: '60W', Warranty: '1 Year' } },
  { name: '12" Underseat Active Subwoofer with Amplifier', categoryId: 'speakers', brand: 'Addon Bass', price: 7499, mrp: 10999, image: IMG.speakers, rating: 4.4, reviewCount: 61, stock: 11, tags: ['sale', 'emi'], fitment: 'universal', install: 599,
    highlights: ['Slim design fits under the seat', 'Built-in 600W amplifier', 'Remote bass level control'],
    specs: { Size: '12 inch', 'Peak Power': '600W', Type: 'Active (built-in amp)', Warranty: '1 Year' } },
  // LED lights
  { name: 'H4 LED Headlight Bulbs 130W (Pair) - 6000K White', categoryId: 'led-lights', brand: 'Philips', price: 2899, mrp: 3999, image: IMG.led, rating: 4.5, reviewCount: 190, stock: 60, tags: ['bestseller'], fitment: 'universal', install: 199,
    highlights: ['Up to 300% brighter than halogen', 'Fan-cooled for long life', 'Plug-and-play, no error'],
    specs: { Fitting: 'H4', Power: '130W (pair)', Colour: '6000K Cool White', Warranty: '1 Year' } },
  { name: 'Ambient Interior Lighting Kit 64 Colours (App Control)', categoryId: 'led-lights', brand: 'Addon Glow', price: 3299, mrp: 4999, image: IMG.led, rating: 4.3, reviewCount: 47, stock: 30, tags: ['new', 'sale'], fitment: 'universal', install: 499,
    highlights: ['Dashboard + door strips', 'Music sync mode', 'Bluetooth app control'],
    specs: { Colours: '64', Control: 'App + Remote', Length: '6 m total', Warranty: '6 Months' } },
  // Spoilers
  { name: 'Roof Spoiler with LED Brake Light - Gloss Black', categoryId: 'spoilers', brand: 'Addon Aero', price: 3999, mrp: 5499, image: IMG.spoiler, rating: 4.4, reviewCount: 38, stock: 14, tags: ['sale'], fitment: [fit('Maruti Suzuki', 'Swift', 'Baleno'), fit('Hyundai', 'i20', 'Grand i10 Nios'), fit('Tata', 'Altroz', 'Tiago')], install: 999,
    highlights: ['ABS plastic, factory-paint ready', 'Integrated LED stop lamp', '3M tape + screw mounting'],
    specs: { Material: 'ABS', Finish: 'Gloss Black', Warranty: '6 Months' } },
  { name: 'Boot Lip Spoiler for Sedans - Carbon Look', categoryId: 'spoilers', brand: 'Addon Aero', price: 2499, mrp: 3499, image: IMG.spoiler, rating: 4.2, reviewCount: 22, stock: 20, tags: [], fitment: [fit('Honda', 'City', 'Amaze'), fit('Hyundai', 'Verna', 'Aura'), fit('Maruti Suzuki', 'Dzire', 'Ciaz'), fit('Skoda', 'Slavia'), fit('Volkswagen', 'Virtus')], install: 499,
    highlights: ['Carbon-fibre look finish', 'No drilling needed', 'UV-resistant'],
    specs: { Material: 'ABS', Finish: 'Carbon look', Warranty: '6 Months' } },
  // Side skirts
  { name: 'Universal Side Skirt Extensions (Pair) - Matte Black', categoryId: 'side-skirts', brand: 'Addon Aero', price: 2799, mrp: 3999, image: IMG.skirts, rating: 4.1, reviewCount: 19, stock: 18, tags: ['sale'], fitment: 'universal', install: 999,
    highlights: ['Cut-to-fit 2.2m length', 'Flexible, scrape-resistant', 'Lowers the visual stance'],
    specs: { Length: '2.2 m each', Material: 'PP rubber', Finish: 'Matte Black' } },
  { name: 'Body Kit Side Skirts for Creta / Seltos', categoryId: 'side-skirts', brand: 'Addon Aero', price: 6499, mrp: 8499, image: IMG.skirts, rating: 4.5, reviewCount: 12, stock: 6, tags: ['new'], fitment: [fit('Hyundai', 'Creta'), fit('Kia', 'Seltos')], install: 999,
    highlights: ['Exact fit moulded design', 'Paintable primer finish', 'Fitting hardware included'],
    specs: { Material: 'ABS', Finish: 'Primer (paintable)', Warranty: '6 Months' } },
  // Head & tail lamps
  { name: 'Projector Headlamps with DRL for Thar', categoryId: 'head-tail-lamps', brand: 'Addon Optics', price: 11999, mrp: 15999, image: IMG.lamps, rating: 4.7, reviewCount: 33, stock: 7, tags: ['bestseller', 'emi'], fitment: [fit('Mahindra', 'Thar')], install: 499,
    highlights: ['Bi-LED projector beam', 'Halo DRL with turn indicator', 'Plug & play'],
    specs: { Type: 'Bi-LED Projector', DRL: 'Yes', Warranty: '1 Year' } },
  { name: 'Smoked LED Tail Lamps for Swift', categoryId: 'head-tail-lamps', brand: 'Addon Optics', price: 7499, mrp: 9999, image: IMG.lamps, rating: 4.5, reviewCount: 41, stock: 9, tags: ['sale'], fitment: [fit('Maruti Suzuki', 'Swift')], install: 299,
    highlights: ['Sequential turn indicators', 'Smoked lens', 'Direct OEM replacement'],
    specs: { Type: 'Full LED', Lens: 'Smoked', Warranty: '1 Year' } },
  // Alloys
  { name: '15" Alloy Wheels Gloss Black / Red Lip (Set of 4)', categoryId: 'alloy-wheels', brand: 'Addon Wheels', price: 27999, mrp: 34999, image: IMG.alloys, rating: 4.6, reviewCount: 29, stock: 5, tags: ['emi', 'sale'], fitment: [fit('Maruti Suzuki', 'Swift', 'Baleno', 'Dzire'), fit('Hyundai', 'i20', 'Venue'), fit('Tata', 'Altroz', 'Punch')], install: 699,
    highlights: ['4x100 PCD', 'Low-pressure cast alloy', 'Free fitting & balancing'],
    specs: { Size: '15 x 6J', PCD: '4x100', Offset: 'ET40', Finish: 'Gloss black / red lip' } },
  { name: '17" Diamond Cut Alloy Wheels (Set of 4)', categoryId: 'alloy-wheels', brand: 'Addon Wheels', price: 41999, mrp: 52999, image: IMG.alloys, rating: 4.8, reviewCount: 17, stock: 4, tags: ['new', 'emi'], fitment: [fit('Hyundai', 'Creta'), fit('Kia', 'Seltos', 'Sonet'), fit('Toyota', 'Urban Cruiser Hyryder'), fit('Maruti Suzuki', 'Grand Vitara', 'Brezza')], install: 699,
    highlights: ['5x114.3 PCD', 'Diamond-cut machined face', 'Flow-formed for lighter weight'],
    specs: { Size: '17 x 7J', PCD: '5x114.3', Offset: 'ET45', Finish: 'Diamond cut' } },
  // Seat covers
  { name: 'Premium Nappa Leatherette Seat Covers - Black / Red', categoryId: 'seat-covers', brand: 'Addon Comfort', price: 6999, mrp: 9999, image: IMG.seat, rating: 4.7, reviewCount: 156, stock: 25, tags: ['bestseller', 'sale'], fitment: [fit('Maruti Suzuki', 'Swift', 'Baleno', 'Brezza', 'Dzire', 'Fronx'), fit('Hyundai', 'Creta', 'Venue', 'i20'), fit('Tata', 'Nexon', 'Punch'), fit('Kia', 'Seltos', 'Sonet'), fit('Mahindra', 'XUV700', 'Thar')], install: 399,
    highlights: ['Custom-stitched for your model', 'Airbag-compatible side seams', 'Diamond quilting'],
    specs: { Material: 'Nappa leatherette', Seats: 'Full set (front + rear)', Warranty: '1 Year' } },
  { name: 'Breathable Fabric Seat Covers - Grey', categoryId: 'seat-covers', brand: 'Addon Comfort', price: 3499, mrp: 4999, image: IMG.seat, rating: 4.3, reviewCount: 64, stock: 30, tags: ['sale'], fitment: 'universal', install: 399,
    highlights: ['Universal fit for 5-seaters', 'Washable', 'Cool in summer'],
    specs: { Material: 'Mesh fabric', Seats: 'Full set', Warranty: '6 Months' } },
  // Steering covers
  { name: 'Perforated Leather Steering Cover - Red Stitch', categoryId: 'steering-covers', brand: 'Addon Comfort', price: 699, mrp: 1199, image: IMG.steering, rating: 4.4, reviewCount: 240, stock: 80, tags: ['bestseller', 'sale'], fitment: 'universal', install: 0,
    highlights: ['Anti-slip grip', 'Fits 37-39 cm wheels', 'Hand-stitched look'],
    specs: { Size: '38 cm (M)', Material: 'Microfibre leather' } },
  { name: 'Alcantara Style Suede Steering Cover', categoryId: 'steering-covers', brand: 'Addon Comfort', price: 999, mrp: 1499, image: IMG.steering, rating: 4.5, reviewCount: 52, stock: 35, tags: ['new'], fitment: 'universal', install: 0,
    highlights: ['Motorsport suede feel', 'Top-centre marker', 'Sweat-resistant'],
    specs: { Size: '38 cm (M)', Material: 'Suede' } },
  // Fog lamps
  { name: 'Projector Fog Lamps with Yellow/White Dual Colour', categoryId: 'fog-lamps', brand: 'Addon Optics', price: 3499, mrp: 4999, image: IMG.fog, rating: 4.5, reviewCount: 88, stock: 22, tags: ['bestseller', 'sale'], fitment: [fit('Maruti Suzuki', 'Swift', 'Baleno', 'Brezza', 'Ertiga', 'Dzire'), fit('Toyota', 'Glanza')], install: 499,
    highlights: ['Switch between yellow and white', 'Sharp cut-off projector', 'Includes wiring + switch'],
    specs: { Type: 'LED projector', Colours: 'Yellow / White', Warranty: '1 Year' } },
  { name: '4" Round Off-Road LED Fog / Aux Lights (Pair)', categoryId: 'fog-lamps', brand: 'Addon Optics', price: 2499, mrp: 3499, image: IMG.fog, rating: 4.2, reviewCount: 31, stock: 28, tags: [], fitment: 'universal', install: 499,
    highlights: ['IP68 waterproof', 'Spot + flood beam', 'Bracket included'],
    specs: { Size: '4 inch', Power: '40W each', Warranty: '6 Months' } },
  // Cool films
  { name: 'Sun Control Film - Full Car (Legal VLT)', categoryId: 'cool-films', brand: '3M', price: 4999, mrp: 6499, image: IMG.interior, rating: 4.6, reviewCount: 45, stock: 99, tags: ['sale'], fitment: 'universal', install: 0,
    highlights: ['Blocks up to 99% UV', 'Reduces cabin heat', 'Professional application included'],
    specs: { 'UV Rejection': '99%', Coverage: 'All windows', Warranty: '3 Years' } },
  // Wheel caps
  { name: '14" Wheel Cups / Covers Silver-Black (Set of 4)', categoryId: 'wheel-caps', brand: 'Addon Wheels', price: 1499, mrp: 2299, image: IMG.alloys, rating: 4.1, reviewCount: 73, stock: 50, tags: ['sale'], fitment: 'universal', install: 0,
    highlights: ['Alloy-look design', 'Unbreakable PP', 'Snap-on fit'],
    specs: { Size: '14 inch', Material: 'PP', Pieces: '4' } },
];

const slugify = (s) =>
  s.toLowerCase().replace(/["']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const products = raw.map((p, i) => {
  const { image, install, ...rest } = p;
  return {
    id: `p${String(i + 1).padStart(3, '0')}`,
    slug: slugify(p.name),
    ...rest,
    images: [image],
    description: `${p.name} from ${p.brand}. ${p.highlights[0]}. Visit Addon Automotive for expert fitment, or order online and pick up from our studio.`,
    installation: { available: true, charge: install },
    active: true,
  };
});

const in30 = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
const in7 = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);

export const offers = [
  { id: 'o1', code: 'ADDON10', title: 'Flat 10% off', description: 'On all orders above Rs. 2,999', type: 'percent', value: 10, minOrder: 2999, maxDiscount: 2000, validTill: in30, active: true, accent: 'red' },
  { id: 'o2', code: 'SOUND1500', title: 'Rs. 1,500 off on Audio', description: 'Android stereo or speaker orders above Rs. 9,999', type: 'flat', value: 1500, minOrder: 9999, categoryIds: ['android-stereo', 'speakers'], validTill: in30, active: true, accent: 'dark' },
  { id: 'o3', code: 'FIRSTRIDE', title: 'Rs. 500 off first order', description: 'Welcome offer on orders above Rs. 3,999', type: 'flat', value: 500, minOrder: 3999, validTill: in30, active: true, accent: 'steel' },
  { id: 'o4', code: 'WHEELS30', title: 'Up to 30% off Alloys', description: 'Extra 5% off alloy wheel sets - this week only', type: 'percent', value: 5, minOrder: 15000, maxDiscount: 3000, categoryIds: ['alloy-wheels'], validTill: in7, active: true, accent: 'red' },
];

export const testimonials = [
  { id: 't1', name: 'Arjun M.', car: 'Hyundai Creta', rating: 5, text: 'Got a 10" Android stereo and JBL speakers fitted. Clean wiring, no rattles, done in under two hours. Proper professionals.' },
  { id: 't2', name: 'Sneha R.', car: 'Maruti Baleno', rating: 5, text: 'The seat covers look factory-fitted. They suggested the right colour combo for my interior too.' },
  { id: 't3', name: 'Faizal K.', car: 'Mahindra Thar', rating: 5, text: 'Projector headlamps + fog lamps transformed night driving. EMI made it easy on the pocket.' },
  { id: 't4', name: 'Vishnu P.', car: 'Tata Nexon', rating: 4, text: 'Booked installation online, came at my slot and car was ready on time. Will be back for alloys.' },
];

export const reviews = [
  { id: 'r1', productId: 'p001', name: 'Rahul', rating: 5, title: 'Great value', text: 'CarPlay connects instantly and screen is very responsive.', verified: true, createdAt: '2026-09-02T10:00:00.000Z' },
  { id: 'r2', productId: 'p001', name: 'Meera', rating: 4, title: 'Good unit', text: 'Good sound, installation was neat. GPS takes a moment on cold start.', verified: true, createdAt: '2026-10-11T10:00:00.000Z' },
  { id: 'r3', productId: 'p004', name: 'Anand', rating: 5, title: 'Huge upgrade', text: 'Massive improvement over stock speakers, bass is tight.', verified: true, createdAt: '2026-08-21T10:00:00.000Z' },
  { id: 'r4', productId: 'p017', name: 'Divya', rating: 5, title: 'Perfect fit', text: 'Fits my Creta perfectly, looks premium.', verified: true, createdAt: '2026-10-28T10:00:00.000Z' },
];

// Reels from instagram.com/addonautomotive. Add each video file (download your
// reel from Instagram, put the .mp4 in public/reels/) and set `video`
// from the admin panel -> Reels. Cards without a video link to Instagram.
const reel = (n, title, car, tag) => ({
  id: `reel${String(n).padStart(2, '0')}`,
  title,
  car,
  tag,
  video: '',
  poster: '',
  instagramUrl: 'https://www.instagram.com/addonautomotive/reels/',
  sort: n,
  active: true,
});

export const reels = [
  reel(1, 'Oncord + 4K dash cam installed', 'BMW X5', 'Electronics'),
  reel(2, 'Global 50 sun control film', 'Toyota Fortuner', 'Films'),
  reel(3, 'Global 50 films', 'Kia Sonet', 'Films'),
  reel(4, 'Tri-colour projector fog lamps', 'Maruti Wagon R', 'Lighting'),
  reel(5, 'Diamond P80 + Black Rock subwoofer', 'Honda City', 'Audio'),
  reel(6, 'Tri-colour projector fog lamps', 'Maruti Zen Estilo', 'Lighting'),
  reel(7, 'Vextron speakers - 30% offer', 'Offer', 'Audio'),
  reel(8, 'Rear diffuser', 'Maruti Baleno', 'Body kit'),
  reel(9, 'Side footsteps', 'Mahindra XUV700', 'Exterior'),
  reel(10, 'Base model to automatic climate control', 'Hyundai Creta', 'Electronics'),
  reel(11, 'Customised Fronx', 'Maruti Fronx', 'Full build'),
  reel(12, 'Fully customised Fronx', 'Maruti Fronx', 'Full build'),
];

export const brands = ['JBL', 'Pioneer', 'Sony', 'Kenwood', 'Philips', '3M', 'Blaupunkt', 'Osram'];
