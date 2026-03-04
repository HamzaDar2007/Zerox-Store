/**
 * Seed File 4 — Categories, Products & Images
 *
 * Creates 30 Markaz-style marketplace categories, a seller user + seller
 * record + store, then 5 products per category (150 total) each with 4
 * images (600 total) using Unsplash CDN URLs.
 *
 * Replaces any existing seed data in categories/products/product_images.
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register ./seeds/seed-categories-products.ts
 *   — or —
 *   npm run seed:data
 */

import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
dotenv.config();

// ─── Connection ──────────────────────────────────────────────────────
const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'ecommerce',
  synchronize: false,
  logging: false,
});

// ─── Helper: Unsplash URL builder ────────────────────────────────────
function unsplash(photoId: string, w = 800, h = 800): string {
  return `https://images.unsplash.com/photo-${photoId}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;
}

// ─── Helper: slugify ─────────────────────────────────────────────────
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// ─── 30 Markaz-style categories ──────────────────────────────────────
interface CategoryData {
  name: string;
  image: string;
  description: string;
  products: ProductData[];
}

interface ProductData {
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAt: number;
  stock: number;
  tags: string[];
  images: string[]; // Unsplash photo IDs
}

const CATEGORIES: CategoryData[] = [
  // 1. Mobile Phones
  {
    name: 'Mobile Phones',
    image: unsplash('1511707171128-773957a9225f'),
    description: 'Latest smartphones and feature phones from top brands.',
    products: [
      { name: 'Samsung Galaxy S24 Ultra', description: 'The Samsung Galaxy S24 Ultra features a 6.8-inch Dynamic AMOLED 2X display, Snapdragon 8 Gen 3 processor, 200MP camera system, and S Pen. Built with titanium frame for premium durability.', shortDescription: 'Flagship smartphone with S Pen and 200MP camera', price: 249999, compareAt: 279999, stock: 50, tags: ['samsung', 'flagship', '5g'], images: ['1598327105666-5b89351aff97', '1610945265064-0e34e5519bbf', '1538481199705-c710c4e965fc', '1585060544812-6b45742d762f'] },
      { name: 'iPhone 15 Pro Max', description: 'Apple iPhone 15 Pro Max with A17 Pro chip, 48MP main camera with 5x optical zoom, titanium design, and USB-C connectivity. Features Action Button and all-day battery life.', shortDescription: 'Premium Apple flagship with titanium design', price: 499999, compareAt: 549999, stock: 35, tags: ['apple', 'iphone', 'flagship'], images: ['1553062407-98eeb64c6a62', '1591337676887-a217a6970a8a', '1510557880182-3d4d3cba35a5', '1565849904461-04a58ad377e0'] },
      { name: 'Xiaomi Redmi Note 13 Pro', description: 'Redmi Note 13 Pro features a 6.67-inch AMOLED display with 120Hz refresh rate, MediaTek Helio G99 Ultra, 200MP main camera, and 5000mAh battery with 67W turbo charging.', shortDescription: 'Mid-range phone with 200MP camera', price: 54999, compareAt: 64999, stock: 100, tags: ['xiaomi', 'redmi', 'mid-range'], images: ['1598327105666-5b89351aff97', '1574944985070-8f3ebc6b79d2', '1512054502232-10a0a035d672', '1605236453806-6ff36851218e'] },
      { name: 'Tecno Spark 20 Pro', description: 'Tecno Spark 20 Pro with 6.78-inch IPS LCD display, 108MP AI camera system, MediaTek Helio G99, 8GB RAM with extended memory, and 5000mAh battery. Stylish gradient design.', shortDescription: 'Budget phone with 108MP triple camera', price: 34999, compareAt: 39999, stock: 150, tags: ['tecno', 'budget', 'camera'], images: ['1574944985070-8f3ebc6b79d2', '1605236453806-6ff36851218e', '1512054502232-10a0a035d672', '1598327105666-5b89351aff97'] },
      { name: 'Infinix Hot 40 Pro', description: 'Infinix Hot 40 Pro offers a 6.78-inch FHD+ display, MediaTek Helio G99, 108MP triple camera, 8GB + 256GB storage, and 5000mAh battery with 33W fast charge.', shortDescription: 'Value smartphone with fast charging', price: 29999, compareAt: 35999, stock: 200, tags: ['infinix', 'budget', 'fast-charge'], images: ['1605236453806-6ff36851218e', '1512054502232-10a0a035d672', '1574944985070-8f3ebc6b79d2', '1598327105666-5b89351aff97'] },
    ],
  },
  // 2. Laptops & Computers
  {
    name: 'Laptops & Computers',
    image: unsplash('1496181133206-80ce9b88a853'),
    description: 'Powerful laptops, desktops, and computing accessories.',
    products: [
      { name: 'HP Pavilion 15 Laptop', description: 'HP Pavilion 15 with 12th Gen Intel Core i5, 8GB DDR4 RAM, 512GB SSD, 15.6-inch FHD IPS display, Intel Iris Xe Graphics. Perfect for productivity and light gaming.', shortDescription: 'Versatile 15.6-inch laptop for work and play', price: 139999, compareAt: 159999, stock: 30, tags: ['hp', 'laptop', 'intel'], images: ['1496181133206-80ce9b88a853', '1541807084-5c52b6b3adef', '1502877338535-766e1452684a', '1588872657578-7efd1f1555ed'] },
      { name: 'Lenovo IdeaPad Slim 3', description: 'Lenovo IdeaPad Slim 3 with AMD Ryzen 5 7520U, 8GB RAM, 256GB SSD, 15.6-inch FHD display. Thin and light design weighing just 1.62kg with up to 11 hours battery life.', shortDescription: 'Ultra-slim everyday laptop', price: 99999, compareAt: 119999, stock: 40, tags: ['lenovo', 'slim', 'amd'], images: ['1502877338535-766e1452684a', '1496181133206-80ce9b88a853', '1541807084-5c52b6b3adef', '1588872657578-7efd1f1555ed'] },
      { name: 'Dell Inspiron 14 2-in-1', description: 'Dell Inspiron 14 2-in-1 convertible with 13th Gen Intel Core i7, 16GB RAM, 512GB SSD, 14-inch FHD+ touch display, 360° hinge. Includes Dell Active Pen support.', shortDescription: 'Convertible 2-in-1 touch laptop', price: 169999, compareAt: 199999, stock: 20, tags: ['dell', '2in1', 'touch'], images: ['1541807084-5c52b6b3adef', '1588872657578-7efd1f1555ed', '1496181133206-80ce9b88a853', '1502877338535-766e1452684a'] },
      { name: 'Apple MacBook Air M2', description: 'MacBook Air with Apple M2 chip, 8-core CPU, 10-core GPU, 8GB unified memory, 256GB SSD, 13.6-inch Liquid Retina display, MagSafe charging, up to 18 hours battery.', shortDescription: 'Ultra-light Apple laptop with M2 chip', price: 299999, compareAt: 329999, stock: 15, tags: ['apple', 'macbook', 'm2'], images: ['1517336714731-489689fd1ca8', '1496181133206-80ce9b88a853', '1541807084-5c52b6b3adef', '1502877338535-766e1452684a'] },
      { name: 'ASUS VivoBook 15', description: 'ASUS VivoBook 15 with Intel Core i3-1215U, 8GB DDR4, 256GB SSD, 15.6-inch FHD display, fingerprint reader. Compact and portable with military-grade durability.', shortDescription: 'Affordable everyday computing', price: 74999, compareAt: 89999, stock: 60, tags: ['asus', 'budget', 'laptop'], images: ['1588872657578-7efd1f1555ed', '1502877338535-766e1452684a', '1496181133206-80ce9b88a853', '1541807084-5c52b6b3adef'] },
    ],
  },
  // 3. Men's Fashion
  {
    name: "Men's Fashion",
    image: unsplash('1490578474895-699cd4e2cf59'),
    description: 'Trendy clothing, shoes, and accessories for men.',
    products: [
      { name: 'Premium Cotton Polo Shirt', description: 'Classic premium cotton polo shirt with ribbed collar and two-button placket. Made from 100% Egyptian cotton for exceptional softness and breathability. Available in multiple colors.', shortDescription: 'Classic fit Egyptian cotton polo', price: 2499, compareAt: 3499, stock: 200, tags: ['polo', 'cotton', 'casual'], images: ['1549298916-b41d501d3772', '1596755094514-f87e34085b2c', '1618354691373-d851c5c3a990', '1586363104862-3a5e2ab60d99'] },
      { name: 'Slim Fit Denim Jeans', description: 'Modern slim fit denim jeans crafted from premium stretch denim with a comfortable mid-rise waist. Features classic 5-pocket design with reinforced stitching throughout.', shortDescription: 'Stretch denim slim fit jeans', price: 3999, compareAt: 5299, stock: 150, tags: ['jeans', 'denim', 'slim-fit'], images: ['1507679799987-c73779587ccf', '1582552938357-32b906df40cb', '1604176354204-9268737828e4', '1541099649105-f69ad21f3246'] },
      { name: 'Classic Leather Belt', description: 'Genuine leather belt with brushed metal buckle. Full-grain cowhide leather with hand-stitched edges for a refined look. Width 35mm, suitable for formal and casual wear.', shortDescription: 'Full-grain leather dress belt', price: 1499, compareAt: 2199, stock: 300, tags: ['belt', 'leather', 'accessory'], images: ['1512054502232-10a0a035d672', '1624222247344-550fb60583dc', '1594223274512-ad4803739b7c', '1543163521-1bf539c55dd2'] },
      { name: 'Formal Oxford Shoes', description: 'Handcrafted genuine leather Oxford shoes with Goodyear welt construction. Features cushioned insole, leather sole, and classic cap-toe design. Perfect for business and formal occasions.', shortDescription: 'Genuine leather cap-toe Oxfords', price: 8999, compareAt: 12999, stock: 80, tags: ['shoes', 'formal', 'leather'], images: ['1614252235316-8c857d38b5f4', '1504148455328-c376907d081c', '1416879595882-3373a0480b5b',  '1507842217343-583bb7270b66'] },
      { name: 'Casual Sneakers White', description: 'Modern white casual sneakers with premium synthetic upper and cushioned EVA midsole. Minimalist clean design with perforated details for breathability. Rubber outsole for durability.', shortDescription: 'Clean white everyday sneakers', price: 4999, compareAt: 6499, stock: 120, tags: ['sneakers', 'white', 'casual'], images: ['1549298916-b41d501d3772', '1595950653106-6c9ebd614d3a', '1543508282-6319a3e2621f', '1460353581641-37baddab0fa2'] },
    ],
  },
  // 4. Women's Fashion
  {
    name: "Women's Fashion",
    image: unsplash('1483985988355-763728e1935b'),
    description: 'Elegant clothing, shoes, and accessories for women.',
    products: [
      { name: 'Embroidered Lawn Kurti', description: 'Beautiful embroidered lawn kurti with intricate thread work on front and sleeves. Lightweight fabric perfect for summer. Features side slits and mandarin collar design.', shortDescription: 'Summer lawn kurti with embroidery', price: 2999, compareAt: 4499, stock: 180, tags: ['kurti', 'lawn', 'embroidered'], images: ['1524484485831-a92ffc0de03f', '1594633312681-425c7b97ccd1', '1545454675-3531b543be5d', '1571513722275-4b41940f54b8'] },
      { name: 'Designer Silk Dupatta', description: 'Premium silk dupatta with hand-block printed geometric patterns. Soft and luxurious feel with vibrant colors that do not fade. Size 2.5 meters with delicate tassel fringe.', shortDescription: 'Hand-block printed silk dupatta', price: 1999, compareAt: 2999, stock: 200, tags: ['dupatta', 'silk', 'designer'], images: ['1594633312681-425c7b97ccd1', '1524484485831-a92ffc0de03f', '1571513722275-4b41940f54b8', '1545454675-3531b543be5d'] },
      { name: 'Women Leather Handbag', description: 'Elegant faux leather handbag with gold-tone hardware, multiple compartments, and detachable shoulder strap. Spacious interior with zippered pocket and phone slot.', shortDescription: 'Stylish everyday leather handbag', price: 5499, compareAt: 7999, stock: 90, tags: ['handbag', 'leather', 'fashion'], images: ['1584917865442-de89df76afd3', '1566150905458-1bf1fc113f0d', '1510915361894-db8b60106cb1', '1534438327276-14e5300c3a48'] },
      { name: 'Gold Plated Jewelry Set', description: 'Stunning gold plated jewelry set including necklace, earrings, and bracelet. Features cubic zirconia stones in floral design. Hypoallergenic and tarnish-resistant finish.', shortDescription: 'Complete gold plated jewelry ensemble', price: 3999, compareAt: 5999, stock: 100, tags: ['jewelry', 'gold', 'set'], images: ['1489824904134-891ab64532f1', '1611085583191-a3b181a88401', '1599643477877-530eb83abc8e', '1602173574767-37ac01994b2a'] },
      { name: 'Embroidered Khussas', description: 'Traditional hand-embroidered khussas with intricate mirror work and thread embroidery. Soft leather sole with cushioned insole for all-day comfort. Artisan crafted.', shortDescription: 'Handcrafted traditional mirror work khussas', price: 1799, compareAt: 2499, stock: 150, tags: ['khussas', 'traditional', 'handmade'], images: ['1543163521-1bf539c55dd2', '1595341888016-a392ef81b7de', '1560343090-f0409e92791a', '1605289355680-75fb41239154'] },
    ],
  },
  // 5. Electronics & Gadgets
  {
    name: 'Electronics & Gadgets',
    image: unsplash('1518770660439-4636190af475'),
    description: 'Smart gadgets, wearables, and electronic accessories.',
    products: [
      { name: 'Smart Watch Ultra', description: 'Advanced smartwatch with 1.85-inch AMOLED display, heart rate monitor, SpO2 sensor, GPS tracking, 100+ sports modes, and 7-day battery life. IP68 water resistant with Always-On Display.', shortDescription: 'Feature-rich smartwatch with AMOLED display', price: 12999, compareAt: 18999, stock: 80, tags: ['smartwatch', 'fitness', 'wearable'], images: ['1510557880182-3d4d3cba35a5', '1523275335684-37898b6baf30', '1579586337278-3befd40fd17a', '1460353581641-37baddab0fa2'] },
      { name: 'TWS Earbuds Pro', description: 'True wireless earbuds with active noise cancellation, 12mm dynamic drivers, Bluetooth 5.3, touch controls, and 36-hour total playtime with charging case. IPX5 sweat resistant.', shortDescription: 'ANC wireless earbuds with 36hr battery', price: 7999, compareAt: 11999, stock: 120, tags: ['earbuds', 'tws', 'anc'], images: ['1590658268037-6bf12165a8df', '1606220588913-b3aacb4d2f46', '1524592094714-0f0654e20314', '1505740420928-5e560c06d30e'] },
      { name: 'Portable Bluetooth Speaker', description: 'Compact portable Bluetooth speaker with 20W output, 360° surround sound, IPX7 waterproof rating, and 12-hour battery life. Features built-in microphone for hands-free calls.', shortDescription: 'Waterproof 20W portable speaker', price: 5999, compareAt: 8999, stock: 100, tags: ['speaker', 'bluetooth', 'portable'], images: ['1608043152269-423dbba4e7e1', '1545454675-3531b543be5d', '1513364776144-60967b0f800f', '1507003211169-0a1dd7228f2d'] },
      { name: 'Power Bank 20000mAh', description: 'High-capacity 20000mAh power bank with dual USB-A and USB-C ports. Supports 22.5W fast charging and PD 20W output. LED digital display shows remaining battery percentage.', shortDescription: 'Fast-charging 20000mAh battery pack', price: 3499, compareAt: 4999, stock: 200, tags: ['powerbank', 'charging', 'portable'], images: ['1609091839311-d5365f9ff1c5', '1583863788434-e58a36330cf0', '1525201548942-d8732f6617a0', '1618384887929-16ec33fab9ef'] },
      { name: 'Wireless Charging Pad', description: 'Qi-certified wireless charging pad compatible with all Qi-enabled devices. 15W fast wireless charging, ultra-slim design with LED indicator. Anti-slip silicone surface.', shortDescription: 'Universal 15W Qi wireless charger', price: 1999, compareAt: 2999, stock: 250, tags: ['charger', 'wireless', 'qi'], images: ['1618384887929-16ec33fab9ef', '1609091839311-d5365f9ff1c5', '1583863788434-e58a36330cf0', '1525201548942-d8732f6617a0'] },
    ],
  },
  // 6. Home & Kitchen
  {
    name: 'Home & Kitchen',
    image: unsplash('1556909114-f6e7ad7d3136'),
    description: 'Kitchen appliances, cookware, and home essentials.',
    products: [
      { name: 'Non-Stick Cookware Set 10pc', description: 'Complete 10-piece non-stick cookware set including frying pans, saucepans, Dutch oven, and utensils. Premium ceramic coating free from PFOA. Suitable for all cooktops including induction.', shortDescription: '10-piece ceramic non-stick set', price: 12999, compareAt: 18999, stock: 40, tags: ['cookware', 'non-stick', 'kitchen'], images: ['1556909114-f6e7ad7d3136', '1584568694244-14fbdf83bd30', '1556910103-1c02745aae4d', '1466637574441-749b8f19452f'] },
      { name: 'Electric Kettle 1.8L', description: 'Stainless steel electric kettle with 1.8L capacity, auto shut-off, boil-dry protection, and 360° rotational base. Boils water in under 4 minutes. Cool-touch handle.', shortDescription: 'Fast-boil stainless steel kettle', price: 3999, compareAt: 5499, stock: 80, tags: ['kettle', 'electric', 'steel'], images: ['1584568694244-14fbdf83bd30', '1556909114-f6e7ad7d3136', '1556910103-1c02745aae4d', '1466637574441-749b8f19452f'] },
      { name: 'Microwave Oven 25L', description: '25-liter microwave oven with grill function, 10 power levels, auto-cook menus, child lock safety feature, and easy-clean interior. Digital display with touch controls.', shortDescription: 'Digital microwave with grill function', price: 19999, compareAt: 25999, stock: 25, tags: ['microwave', 'oven', 'appliance'], images: ['1531346680769-a1d79b57de5c', '1517836357463-d25dfeac3438', '1556909114-f6e7ad7d3136', '1584568694244-14fbdf83bd30'] },
      { name: 'Hand Blender 4-in-1', description: 'Versatile 4-in-1 hand blender set with blending arm, whisk, chopper, and measuring cup. 800W motor with variable speed control and turbo function. Stainless steel blade.', shortDescription: 'Multi-function 800W hand blender', price: 6999, compareAt: 9499, stock: 60, tags: ['blender', 'hand', 'kitchen'], images: ['1516035069371-29a1b244cc32', '1531346680769-a1d79b57de5c', '1556909114-f6e7ad7d3136', '1584568694244-14fbdf83bd30'] },
      { name: 'Air Fryer 5.5L Digital', description: 'Large 5.5L digital air fryer with 8 preset cooking functions, 360° rapid air circulation, non-stick basket, and touch screen display. Cooks with up to 85% less oil.', shortDescription: 'Digital 5.5L rapid air fryer', price: 14999, compareAt: 19999, stock: 35, tags: ['air-fryer', 'digital', 'healthy'], images: ['1550572017-edd951b55104', '1531346680769-a1d79b57de5c', '1556909114-f6e7ad7d3136', '1516035069371-29a1b244cc32'] },
    ],
  },
  // 7. Beauty & Personal Care
  {
    name: 'Beauty & Personal Care',
    image: unsplash('1522335789203-aabd1fc54bc9'),
    description: 'Skincare, makeup, fragrances, and grooming essentials.',
    products: [
      { name: 'Vitamin C Face Serum', description: 'Advanced 20% Vitamin C face serum with hyaluronic acid and vitamin E. Brightens skin tone, reduces dark spots, and boosts collagen production. Suitable for all skin types.', shortDescription: '20% Vitamin C brightening serum', price: 1499, compareAt: 2499, stock: 200, tags: ['skincare', 'serum', 'vitamin-c'], images: ['1515488042361-ee00e0ddd4e4', '1556228578-8c89e6adf883', '1596462502278-27bfdc403348', '1571781926291-c477ebfd024b'] },
      { name: 'Complete Makeup Kit', description: 'Professional 24-piece makeup kit including foundation palette, eyeshadow palette, lipstick set, mascara, brushes, and blending sponge. Long-lasting formulas with rich pigmentation.', shortDescription: '24-piece professional makeup kit', price: 5999, compareAt: 8999, stock: 50, tags: ['makeup', 'kit', 'cosmetics'], images: ['1512496015851-a90fb38ba796', '1596462502278-27bfdc403348', '1522335789203-aabd1fc54bc9', '1571781926291-c477ebfd024b'] },
      { name: 'Hair Straightener Ceramic', description: 'Professional ceramic hair straightener with adjustable temperature 150-230°C, floating plates for even pressure, negative ion technology for frizz control, and auto shut-off safety.', shortDescription: 'Pro ceramic flat iron with ion tech', price: 3999, compareAt: 5999, stock: 70, tags: ['hair', 'straightener', 'styling'], images: ['1522337360788-8b13dee7a37e', '1560750588-73207b1ef5b8', '1596462502278-27bfdc403348', '1512496015851-a90fb38ba796'] },
      { name: 'Men Perfume Gift Set', description: 'Luxury men fragrance gift set with 3 premium eau de toilette bottles (30ml each). Includes fresh citrus, woody oriental, and aromatic fougère scents. Elegant gift packaging.', shortDescription: 'Three-piece premium fragrance collection', price: 4999, compareAt: 7999, stock: 60, tags: ['perfume', 'men', 'gift-set'], images: ['1507003211169-0a1dd7228f2d', '1523293182086-7651a899d37f', '1540518614846-7eded433c457', '1563170351-be82bc888aa4'] },
      { name: 'Electric Toothbrush Sonic', description: 'Rechargeable sonic electric toothbrush with 5 cleaning modes, 2-minute smart timer, 40000 VPM vibrations, and waterproof IPX7 body. Includes 3 replacement brush heads.', shortDescription: 'Smart sonic toothbrush with 5 modes', price: 2999, compareAt: 4499, stock: 90, tags: ['toothbrush', 'sonic', 'electric'], images: ['1513506003901-1e6a229e2d15', '1570172619644-dfd03ed5d881', '1507003211169-0a1dd7228f2d', '1523293182086-7651a899d37f'] },
    ],
  },
  // 8. Sports & Fitness
  {
    name: 'Sports & Fitness',
    image: unsplash('1517836357463-d25dfeac3438'),
    description: 'Sports equipment, gym gear, and fitness accessories.',
    products: [
      { name: 'Adjustable Dumbbell Set 20kg', description: 'Premium adjustable dumbbell set with 20kg total weight. Includes 2 chrome bars, spin-lock collars, and assorted weight plates from 1.25kg to 2.5kg. Rubber grip handles.', shortDescription: '20kg adjustable chrome dumbbell set', price: 7999, compareAt: 10999, stock: 40, tags: ['dumbbell', 'gym', 'weights'], images: ['1534438327276-14e5300c3a48', '1517836357463-d25dfeac3438', '1517336714731-489689fd1ca8', '1576678927484-cc907957088c'] },
      { name: 'Yoga Mat Premium 8mm', description: 'Extra thick 8mm premium yoga mat with alignment lines. Non-slip TPE material, eco-friendly, and free from harmful chemicals. Includes carrying strap. Size 183x61cm.', shortDescription: 'Eco-friendly non-slip yoga mat', price: 2499, compareAt: 3999, stock: 120, tags: ['yoga', 'mat', 'fitness'], images: ['1544367567-0f2fcb009e0b', '1495446815901-a7297e633e8d', '1517336714731-489689fd1ca8', '1576678927484-cc907957088c'] },
      { name: 'Running Shoes Pro', description: 'High-performance running shoes with responsive cushioning foam, breathable engineered mesh upper, and durable rubber outsole with multi-directional traction pattern. Weight 260g.', shortDescription: 'Lightweight cushioned running shoes', price: 6999, compareAt: 9999, stock: 80, tags: ['running', 'shoes', 'sports'], images: ['1507842217343-583bb7270b66', '1460353581641-37baddab0fa2', '1539185441755-769473a23570', '1551107696-a4b0c5a0d9a2'] },
      { name: 'Resistance Bands Set', description: 'Complete resistance bands set with 5 color-coded bands (10-50lb resistance), 2 handles, door anchor, ankle straps, and carrying bag. Perfect for home workouts and physical therapy.', shortDescription: '5-band resistance training set', price: 1999, compareAt: 3499, stock: 150, tags: ['resistance', 'bands', 'workout'], images: ['1598289431512-b97b0917affc', '1576678927484-cc907957088c', '1517836357463-d25dfeac3438', '1517336714731-489689fd1ca8'] },
      { name: 'Cricket Bat English Willow', description: 'Grade A English Willow cricket bat, hand-pressed with traditional craftsmanship. Short handle with Singapore cane grip. Weight 2.7-2.9 lbs. Ideal for leather ball cricket.', shortDescription: 'Grade A English Willow cricket bat', price: 14999, compareAt: 19999, stock: 25, tags: ['cricket', 'bat', 'sports'], images: ['1531415074968-036ba1b575da', '1540747913346-19e32dc3e97e', '1587280501635-68a0e82cd5ff', '1624526267942-ab0ff8a3e972'] },
    ],
  },
  // 9. Baby & Kids
  {
    name: 'Baby & Kids',
    image: unsplash('1515488042361-ee00e0ddd4e4'),
    description: 'Baby essentials, kids clothing, toys, and nursery items.',
    products: [
      { name: 'Baby Stroller Foldable', description: 'Lightweight foldable baby stroller with reclining seat, 5-point harness, canopy with UV protection, one-hand fold mechanism, and storage basket. Suitable for 0-36 months.', shortDescription: 'Compact foldable stroller with canopy', price: 14999, compareAt: 21999, stock: 30, tags: ['stroller', 'baby', 'foldable'], images: ['1515488042361-ee00e0ddd4e4', '1555252333-9f8e92e65df9', '1541099649105-f69ad21f3246', '1522771930-78848d9293e8'] },
      { name: 'Kids Building Blocks 200pc', description: 'Educational 200-piece building blocks set with various shapes, sizes, and colors. BPA-free and non-toxic ABS plastic. Promotes creativity, problem-solving, and motor skills for ages 3+.', shortDescription: '200pc colorful building blocks for 3+', price: 2999, compareAt: 4499, stock: 100, tags: ['blocks', 'educational', 'toys'], images: ['1541099649105-f69ad21f3246', '1515488042361-ee00e0ddd4e4', '1555252333-9f8e92e65df9', '1533139502658-0198f920d8e8'] },
      { name: 'Baby Diaper Bag Backpack', description: 'Premium diaper bag backpack with multiple compartments, insulated bottle pockets, changing pad, and stroller straps. Waterproof fabric, USB charging port, large capacity 25L.', shortDescription: 'Multi-pocket waterproof diaper backpack', price: 3999, compareAt: 5999, stock: 70, tags: ['diaper-bag', 'backpack', 'baby'], images: ['1555252333-9f8e92e65df9', '1541099649105-f69ad21f3246', '1515488042361-ee00e0ddd4e4', '1522771930-78848d9293e8'] },
      { name: 'Soft Cotton Baby Romper Set', description: 'Set of 3 soft cotton baby rompers with snap closures for easy diaper changes. Adorable printed designs. 100% organic cotton, gentle on sensitive skin. Available sizes: 0-24 months.', shortDescription: '3-pack organic cotton romper set', price: 1999, compareAt: 2999, stock: 200, tags: ['romper', 'cotton', 'baby-clothes'], images: ['1522771930-78848d9293e8', '1515488042361-ee00e0ddd4e4', '1555252333-9f8e92e65df9', '1541099649105-f69ad21f3246'] },
      { name: 'RC Car Off-Road Monster', description: 'Remote control off-road monster truck with 2.4GHz remote, 4WD, dual motors, rechargeable battery, and high-speed suspension system. Speed up to 25km/h. For ages 6+.', shortDescription: 'Fast 4WD RC monster truck', price: 4999, compareAt: 6999, stock: 50, tags: ['rc-car', 'toy', 'kids'], images: ['1522771930-78848d9293e8', '1533139502658-0198f920d8e8', '1541099649105-f69ad21f3246', '1555252333-9f8e92e65df9'] },
    ],
  },
  // 10. Grocery & Food
  {
    name: 'Grocery & Food',
    image: unsplash('1542838132-92c53300491e'),
    description: 'Everyday groceries, snacks, beverages, and pantry staples.',
    products: [
      { name: 'Premium Basmati Rice 5kg', description: 'Extra-long grain premium basmati rice aged for 2 years. Aromatic and fluffy when cooked. Sourced from the finest paddies of Pakistan. Each grain elongates up to 2.5x when cooked.', shortDescription: 'Aged extra-long grain basmati rice', price: 1499, compareAt: 1899, stock: 300, tags: ['rice', 'basmati', 'staple'], images: ['1586201375761-83865001e31c', '1542838132-92c53300491e', '1563636619-e9143da7973b', '1574323347407-f5e1ad6d020b'] },
      { name: 'Pure Honey Organic 1kg', description: 'Raw organic honey harvested from wildflower meadows. Unprocessed and naturally crystallized. Rich in antioxidants and enzymes. No added sugar or artificial additives.', shortDescription: 'Raw wildflower organic honey', price: 1999, compareAt: 2799, stock: 150, tags: ['honey', 'organic', 'natural'], images: ['1587049352846-4a222e784d38', '1558642452-9d2a7deb7f62', '1563636619-e9143da7973b', '1542838132-92c53300491e'] },
      { name: 'Dry Fruits Mix Box 500g', description: 'Premium mixed dry fruits box containing almonds, cashews, walnuts, pistachios, and raisins. Freshly packed in an airtight container for maximum freshness. No salt or seasoning added.', shortDescription: '500g premium mixed dry fruits', price: 2499, compareAt: 3299, stock: 100, tags: ['dry-fruits', 'nuts', 'healthy'], images: ['1542838132-92c53300491e', '1563636619-e9143da7973b', '1542838132-92c53300491e', '1587049352846-4a222e784d38'] },
      { name: 'Green Tea Collection 50 Bags', description: 'Assorted green tea collection with 50 tea bags in 5 flavors: classic green, jasmine, mint, lemon, and ginger. Rich in antioxidants. Premium whole leaf quality in pyramid bags.', shortDescription: '50 premium green tea bags, 5 flavors', price: 999, compareAt: 1499, stock: 250, tags: ['tea', 'green-tea', 'beverage'], images: ['1556679343-c7306c1976bc', '1563636619-e9143da7973b', '1542838132-92c53300491e', '1558642452-9d2a7deb7f62'] },
      { name: 'Extra Virgin Olive Oil 1L', description: 'Cold-pressed extra virgin olive oil imported from Spain. First harvest premium quality with low acidity. Rich golden color and fruity flavor. Perfect for salads, cooking, and dips.', shortDescription: 'Spanish cold-pressed olive oil 1L', price: 2999, compareAt: 3999, stock: 80, tags: ['olive-oil', 'cooking', 'imported'], images: ['1450778869180-41d0601e046e', '1563636619-e9143da7973b', '1542838132-92c53300491e', '1558642452-9d2a7deb7f62'] },
    ],
  },
  // 11. Health & Wellness
  {
    name: 'Health & Wellness',
    image: unsplash('1455390582262-044cdead277a'),
    description: 'Vitamins, supplements, health devices, and wellness products.',
    products: [
      { name: 'Multivitamin Daily 60 Tabs', description: 'Complete daily multivitamin with 23 essential vitamins and minerals including Vitamin D3, B12, Zinc, and Iron. Formulated for adults with easy-to-swallow coated tablets.', shortDescription: '23 essential vitamins and minerals', price: 1499, compareAt: 2199, stock: 200, tags: ['vitamins', 'supplement', 'health'], images: ['1550572017-edd951b55104', '1455390582262-044cdead277a', '1576671081837-49000212a370', '1607619056574-7b8d3ee536b2'] },
      { name: 'Digital Blood Pressure Monitor', description: 'Automatic digital blood pressure monitor with large LCD display, irregular heartbeat detector, 2-user memory (120 readings each), WHO indicator, and universal arm cuff.', shortDescription: 'Automatic BP monitor with WHO indicator', price: 4999, compareAt: 7499, stock: 60, tags: ['bp-monitor', 'digital', 'health'], images: ['1559757175-5700dde675bc', '1576671081837-49000212a370', '1455390582262-044cdead277a', '1607619056574-7b8d3ee536b2'] },
      { name: 'Whey Protein Isolate 2kg', description: 'Premium whey protein isolate with 27g protein per serving, low carb, and zero sugar. Fast-absorbing for post-workout recovery. Chocolate flavor with no artificial colors.', shortDescription: '27g protein per serving, chocolate flavor', price: 8999, compareAt: 12999, stock: 45, tags: ['protein', 'whey', 'fitness'], images: ['1593095948071-474c5cc2989d', '1576671081837-49000212a370', '1455390582262-044cdead277a', '1550572017-edd951b55104'] },
      { name: 'Fish Oil Omega-3 Capsules', description: 'Triple strength Omega-3 fish oil with 1000mg EPA and 500mg DHA per serving. Molecularly distilled for purity. Supports heart, brain, and joint health. 120 softgels.', shortDescription: 'High-potency Omega-3 softgels', price: 2499, compareAt: 3499, stock: 150, tags: ['omega-3', 'fish-oil', 'supplement'], images: ['1607619056574-7b8d3ee536b2', '1550572017-edd951b55104', '1576671081837-49000212a370', '1455390582262-044cdead277a'] },
      { name: 'Infrared Thermometer', description: 'Non-contact infrared forehead thermometer with instant 1-second reading, fever alarm, and memory recall of last 32 measurements. LCD backlit display. Suitable for all ages.', shortDescription: 'Instant non-contact IR thermometer', price: 1999, compareAt: 2999, stock: 100, tags: ['thermometer', 'infrared', 'medical'], images: ['1524758631624-e2822e304c36', '1607619056574-7b8d3ee536b2', '1576671081837-49000212a370', '1455390582262-044cdead277a'] },
    ],
  },
  // 12. Home Decor & Furniture
  {
    name: 'Home Decor & Furniture',
    image: unsplash('1556228453-efd6c1ff04f6'),
    description: 'Furniture, wall art, lighting, and interior decoration items.',
    products: [
      { name: 'Wall Art Canvas Set 5pc', description: 'Modern abstract 5-panel canvas wall art set. HD printing on premium cotton canvas with wooden frames. Ready to hang with pre-installed hooks. Total span 150x70cm.', shortDescription: '5-panel modern abstract canvas art', price: 4999, compareAt: 7499, stock: 40, tags: ['wall-art', 'canvas', 'decor'], images: ['1513519245088-0e12902e5a38', '1556228453-efd6c1ff04f6', '1540518614846-7eded433c457', '1531415074968-036ba1b575da'] },
      { name: 'LED Table Lamp Modern', description: 'Contemporary LED table lamp with touch dimmer, 3 color temperatures (warm/neutral/cool), USB charging port, and 360° adjustable gooseneck. Energy-efficient and flicker-free.', shortDescription: 'Touch-dimmer LED lamp with USB port', price: 3499, compareAt: 4999, stock: 60, tags: ['lamp', 'led', 'modern'], images: ['1459411552884-841db9b3cc2a', '1540518614846-7eded433c457', '1556228453-efd6c1ff04f6', '1531415074968-036ba1b575da'] },
      { name: 'Cushion Cover Set 6pc', description: 'Set of 6 decorative cushion covers in coordinated designs. Made from heavy cotton linen with invisible zipper closure. Size 18x18 inches. Machine washable. Inserts not included.', shortDescription: '6 decorative cotton linen pillow covers', price: 1999, compareAt: 2999, stock: 100, tags: ['cushion', 'cover', 'decor'], images: ['1531415074968-036ba1b575da', '1556228453-efd6c1ff04f6', '1513519245088-0e12902e5a38', '1540518614846-7eded433c457'] },
      { name: 'Floating Wall Shelves 3pc', description: 'Set of 3 floating wall shelves in graduated sizes. Made from engineered wood with walnut veneer finish. Hidden bracket mounting system. Weight capacity 10kg each.', shortDescription: 'Walnut-finish floating shelf trio', price: 2999, compareAt: 4499, stock: 50, tags: ['shelf', 'floating', 'wall'], images: ['1503376780353-7e6692767b70', '1513519245088-0e12902e5a38', '1556228453-efd6c1ff04f6', '1540518614846-7eded433c457'] },
      { name: 'Artificial Plant Set Indoor', description: 'Set of 3 premium artificial plants with realistic look—includes monstera, snake plant, and pothos. UV resistant and fade-proof. White ceramic pots included. Heights 30-60cm.', shortDescription: '3 realistic faux plants with ceramic pots', price: 3999, compareAt: 5999, stock: 70, tags: ['plant', 'artificial', 'indoor'], images: ['1459411552884-841db9b3cc2a', '1485955900006-10f4d324d411', '1556228453-efd6c1ff04f6', '1540518614846-7eded433c457'] },
    ],
  },
  // 13. Automotive & Accessories
  {
    name: 'Automotive & Accessories',
    image: unsplash('1489824904134-891ab64532f1'),
    description: 'Car accessories, bike parts, tools, and vehicle care products.',
    products: [
      { name: 'Dash Cam Full HD 1080p', description: 'Full HD 1080p dash cam with 170° wide-angle lens, night vision, G-sensor for crash detection, loop recording, and parking mode. Includes 32GB memory card and suction mount.', shortDescription: 'Wide-angle night vision dash camera', price: 5999, compareAt: 8999, stock: 50, tags: ['dashcam', 'car', 'camera'], images: ['1502877338535-766e1452684a', '1489824904134-891ab64532f1', '1511499767150-a48a237f0083', '1513364776144-60967b0f800f'] },
      { name: 'Car Seat Covers Universal', description: 'Universal fit car seat cover set for front and rear seats. Premium faux leather with breathable mesh panels. Easy installation with elastic straps. Available in black with red stitching.', shortDescription: 'Faux leather universal seat covers', price: 4999, compareAt: 7999, stock: 60, tags: ['seat-cover', 'car', 'interior'], images: ['1511499767150-a48a237f0083', '1489824904134-891ab64532f1', '1502877338535-766e1452684a', '1513364776144-60967b0f800f'] },
      { name: 'LED Headlight Bulbs H4 Pair', description: 'Ultra-bright LED headlight bulbs H4/HB2 fitment with 12000 lumens per pair. 6000K cool white light with built-in fan cooling. Plug-and-play installation, no modification needed.', shortDescription: '12000LM cool white LED headlights', price: 2999, compareAt: 4499, stock: 100, tags: ['headlight', 'led', 'car'], images: ['1513364776144-60967b0f800f', '1489824904134-891ab64532f1', '1502877338535-766e1452684a', '1511499767150-a48a237f0083'] },
      { name: 'Car Air Freshener Premium', description: 'Premium car air freshener set with 3 sophisticated scents: ocean breeze, lavender, and new car. Clip-on vent design with adjustable fragrance intensity. Lasts up to 45 days each.', shortDescription: '3-scent clip-on vent air fresheners', price: 799, compareAt: 1299, stock: 250, tags: ['freshener', 'car', 'fragrance'], images: ['1541899481282-d53bffe3c35d', '1489824904134-891ab64532f1', '1502877338535-766e1452684a', '1511499767150-a48a237f0083'] },
      { name: 'Tire Inflator Portable 12V', description: 'Portable 12V tire inflator with digital pressure gauge, auto shut-off at preset pressure, LED flashlight, and 3 nozzle adapters. Inflates car tire in under 5 minutes. 10ft power cord.', shortDescription: 'Digital 12V auto tire air pump', price: 3499, compareAt: 4999, stock: 80, tags: ['inflator', 'portable', 'tire'], images: ['1503376780353-7e6692767b70', '1513364776144-60967b0f800f', '1489824904134-891ab64532f1', '1502877338535-766e1452684a'] },
    ],
  },
  // 14. Books & Stationery
  {
    name: 'Books & Stationery',
    image: unsplash('1495446815901-a7297e633e8d'),
    description: 'Books, notebooks, pens, office supplies, and art materials.',
    products: [
      { name: 'Atomic Habits by James Clear', description: 'Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones. International bestseller with over 10 million copies sold. Paperback edition, 320 pages.', shortDescription: 'International bestseller on habit formation', price: 999, compareAt: 1499, stock: 150, tags: ['book', 'self-help', 'bestseller'], images: ['1544947950-fa07a98d237f', '1495446815901-a7297e633e8d', '1497633762265-9d179a990aa6', '1473496169904-658ba7c44d8a'] },
      { name: 'Premium Notebook A5 Set', description: 'Set of 3 premium A5 hardcover notebooks with 200 pages each. 100gsm acid-free paper with dotted grid layout. Lay-flat binding, ribbon bookmark, and elastic closure.', shortDescription: '3-pack A5 dotted hardcover notebooks', price: 1499, compareAt: 2199, stock: 100, tags: ['notebook', 'stationery', 'premium'], images: ['1531346680769-a1d79b57de5c', '1495446815901-a7297e633e8d', '1544947950-fa07a98d237f', '1497633762265-9d179a990aa6'] },
      { name: 'Calligraphy Pen Set', description: '12-piece calligraphy pen set with 6 nib sizes, 3 ink cartridges, practice sheets, and guide booklet. Perfect for beginners and intermediate calligraphers. Comes in a presentation box.', shortDescription: '12-piece beginner calligraphy kit', price: 1999, compareAt: 2999, stock: 80, tags: ['calligraphy', 'pen', 'art'], images: ['1455390582262-044cdead277a', '1531346680769-a1d79b57de5c', '1495446815901-a7297e633e8d', '1544947950-fa07a98d237f'] },
      { name: 'Art Supply Kit 65pc', description: 'Complete 65-piece art supply kit with colored pencils, watercolor paints, oil pastels, sketch pencils, brushes, and drawing pads. Wooden carrying case with organized compartments.', shortDescription: '65-piece art set in wooden case', price: 3499, compareAt: 5499, stock: 40, tags: ['art', 'drawing', 'paint'], images: ['1513364776144-60967b0f800f', '1455390582262-044cdead277a', '1495446815901-a7297e633e8d', '1531346680769-a1d79b57de5c'] },
      { name: 'Desk Organizer Wood', description: 'Handcrafted wooden desk organizer with pen holder, phone stand, paper tray, and sticky note compartment. Made from bamboo with smooth lacquer finish. Dimensions 28x15x12cm.', shortDescription: 'Bamboo desk organizer with phone stand', price: 1799, compareAt: 2499, stock: 90, tags: ['desk', 'organizer', 'wood'], images: ['1507842217343-583bb7270b66', '1513364776144-60967b0f800f', '1455390582262-044cdead277a', '1495446815901-a7297e633e8d'] },
    ],
  },
  // 15. Pet Supplies
  {
    name: 'Pet Supplies',
    image: unsplash('1450778869180-41d0601e046e'),
    description: 'Food, toys, accessories, and health products for pets.',
    products: [
      { name: 'Premium Dog Food 5kg', description: 'Premium dry dog food with real chicken as the first ingredient. Enriched with omega-3, vitamins, and probiotics. No artificial colors, flavors, or preservatives. For adult dogs all breeds.', shortDescription: 'Real chicken adult dog food 5kg', price: 3499, compareAt: 4499, stock: 100, tags: ['dog-food', 'premium', 'chicken'], images: ['1541807084-5c52b6b3adef', '1450778869180-41d0601e046e', '1523348837708-15d4a09cfac2', '1587300003388-59208cc962cb'] },
      { name: 'Cat Tree Tower 120cm', description: 'Multi-level cat tree tower with scratching posts, hideaway condo, hanging toy, and plush platforms. Wrapped in natural sisal rope. Sturdy MDF base prevents tipping. Height 120cm.', shortDescription: 'Multi-level sisal cat climbing tower', price: 7999, compareAt: 11999, stock: 25, tags: ['cat-tree', 'scratching', 'furniture'], images: ['1545249390-6bdfa286032f', '1574158622682-e40e69881006', '1450778869180-41d0601e046e', '1523348837708-15d4a09cfac2'] },
      { name: 'Pet Grooming Kit 8pc', description: '8-piece pet grooming kit including slicker brush, dematting comb, nail clippers, nail file, deshedding tool, grooming scissors, and storage pouch. Suitable for dogs and cats.', shortDescription: 'Complete grooming set for dogs & cats', price: 1999, compareAt: 2999, stock: 80, tags: ['grooming', 'pet', 'kit'], images: ['1523348837708-15d4a09cfac2', '1541807084-5c52b6b3adef', '1450778869180-41d0601e046e', '1587300003388-59208cc962cb'] },
      { name: 'Interactive Dog Toy Set', description: 'Set of 6 interactive dog toys including rope toy, squeaky ball, chew bone, frisbee, tug toy, and puzzle feeder. Made from non-toxic, durable materials. Suitable for small to large dogs.', shortDescription: '6-piece interactive dog toy collection', price: 1499, compareAt: 2199, stock: 120, tags: ['dog-toy', 'interactive', 'durable'], images: ['1587300003388-59208cc962cb', '1523348837708-15d4a09cfac2', '1541807084-5c52b6b3adef', '1450778869180-41d0601e046e'] },
      { name: 'Automatic Pet Water Fountain', description: 'Automatic pet water fountain with 2.5L capacity, activated carbon filter, ultra-quiet pump, and LED indicator. Encourages pets to drink more water. BPA-free and dishwasher safe.', shortDescription: '2.5L filtered pet water fountain', price: 2999, compareAt: 4499, stock: 50, tags: ['water', 'fountain', 'automatic'], images: ['1574158622682-e40e69881006', '1587300003388-59208cc962cb', '1541807084-5c52b6b3adef', '1450778869180-41d0601e046e'] },
    ],
  },
  // 16. Watches & Sunglasses
  {
    name: 'Watches & Sunglasses',
    image: unsplash('1524592094714-0f0654e20314'),
    description: 'Wristwatches, sunglasses, and premium eyewear.',
    products: [
      { name: 'Chronograph Watch Steel', description: 'Classic chronograph watch with stainless steel bracelet, Japanese quartz movement, date display, and 43mm case. Water resistant to 50 meters. Scratch-resistant mineral crystal.', shortDescription: 'Steel chronograph with date display', price: 9999, compareAt: 14999, stock: 40, tags: ['watch', 'chronograph', 'steel'], images: ['1524592094714-0f0654e20314', '1497633762265-9d179a990aa6', '1533139502658-0198f920d8e8', '1507679799987-c73779587ccf'] },
      { name: 'Polarized Aviator Sunglasses', description: 'UV400 polarized aviator sunglasses with metal frame, spring hinges, and anti-glare lenses. Reduces glare from reflective surfaces. Includes microfiber pouch and hard case.', shortDescription: 'UV400 polarized metal aviators', price: 2499, compareAt: 3999, stock: 80, tags: ['sunglasses', 'aviator', 'polarized'], images: ['1511499767150-a48a237f0083', '1524592094714-0f0654e20314', '1473496169904-658ba7c44d8a', '1508296695146-257a814070b4'] },
      { name: 'Leather Strap Dress Watch', description: 'Elegant dress watch with genuine leather strap, rose gold case, minimalist dial with Roman numerals, and Swiss quartz movement. Case diameter 40mm. Water resistant 30 meters.', shortDescription: 'Rose gold minimalist dress watch', price: 6999, compareAt: 9999, stock: 50, tags: ['watch', 'dress', 'leather'], images: ['1497633762265-9d179a990aa6', '1524592094714-0f0654e20314', '1507679799987-c73779587ccf', '1533139502658-0198f920d8e8'] },
      { name: 'Sports Digital Watch', description: 'Rugged sports digital watch with dual time display, stopwatch, countdown timer, alarm, EL backlight, and 100m water resistance. Resin strap with buckle closure. Battery life 7 years.', shortDescription: 'Rugged 100m water-resistant sports watch', price: 3499, compareAt: 4999, stock: 100, tags: ['watch', 'sports', 'digital'], images: ['1533139502658-0198f920d8e8', '1524592094714-0f0654e20314', '1497633762265-9d179a990aa6', '1507679799987-c73779587ccf'] },
      { name: 'Blue Light Blocking Glasses', description: 'Stylish blue light blocking glasses for screen protection. TR90 flexible frame, clear anti-reflective lenses, and comfortable nose pads. Reduces eye strain and improves sleep quality.', shortDescription: 'Anti-blue-light screen glasses', price: 1499, compareAt: 2299, stock: 150, tags: ['glasses', 'blue-light', 'screen'], images: ['1508296695146-257a814070b4', '1511499767150-a48a237f0083', '1524592094714-0f0654e20314', '1473496169904-658ba7c44d8a'] },
    ],
  },
  // 17. Bags & Luggage
  {
    name: 'Bags & Luggage',
    image: unsplash('1553062407-98eeb64c6a62'),
    description: 'Backpacks, suitcases, travel bags, and carrying cases.',
    products: [
      { name: 'Travel Suitcase 24" Hardshell', description: 'Hardshell 24-inch spinner suitcase with TSA-approved lock, 360° silent wheels, expandable design, and organized interior with mesh dividers. Lightweight ABS+PC material.', shortDescription: 'Lightweight 24" hardshell spinner', price: 9999, compareAt: 14999, stock: 35, tags: ['suitcase', 'travel', 'hardshell'], images: ['1513519245088-0e12902e5a38', '1553062407-98eeb64c6a62', '1523275335684-37898b6baf30', '1508296695146-257a814070b4'] },
      { name: 'Laptop Backpack Anti-Theft', description: 'Anti-theft laptop backpack with hidden zipper, USB charging port, padded 15.6" laptop compartment, water-resistant fabric, and ergonomic back support. Capacity 30L.', shortDescription: '30L anti-theft laptop backpack with USB', price: 3999, compareAt: 5999, stock: 80, tags: ['backpack', 'laptop', 'anti-theft'], images: ['1553062407-98eeb64c6a62', '1513519245088-0e12902e5a38', '1523275335684-37898b6baf30', '1508296695146-257a814070b4'] },
      { name: 'Duffle Bag Gym Large', description: 'Large gym duffle bag with separate shoe compartment, wet pocket, multiple zippered pockets, and adjustable shoulder strap. Water-resistant polyester with reinforced base. Capacity 45L.', shortDescription: '45L gym duffle with shoe compartment', price: 2499, compareAt: 3999, stock: 60, tags: ['duffle', 'gym', 'sports'], images: ['1523275335684-37898b6baf30', '1553062407-98eeb64c6a62', '1513519245088-0e12902e5a38', '1508296695146-257a814070b4'] },
      { name: 'Messenger Bag Canvas', description: 'Vintage-style canvas messenger bag with genuine leather trim, padded tablet sleeve, multiple organizer pockets, and adjustable crossbody strap. Fits devices up to 13 inches.', shortDescription: 'Canvas and leather messenger bag', price: 2999, compareAt: 4499, stock: 50, tags: ['messenger', 'canvas', 'vintage'], images: ['1508296695146-257a814070b4', '1553062407-98eeb64c6a62', '1513519245088-0e12902e5a38', '1523275335684-37898b6baf30'] },
      { name: 'Waist Bag Crossbody', description: 'Versatile waist/crossbody bag with adjustable strap, quick-access front pocket, SBS zipper, and water-resistant nylon fabric. Compact design fits phone, wallet, and keys. Unisex.', shortDescription: 'Compact nylon crossbody waist bag', price: 1299, compareAt: 1999, stock: 150, tags: ['waist-bag', 'crossbody', 'compact'], images: ['1510915361894-db8b60106cb1', '1508296695146-257a814070b4', '1553062407-98eeb64c6a62', '1523275335684-37898b6baf30'] },
    ],
  },
  // 18. Gaming & Consoles
  {
    name: 'Gaming & Consoles',
    image: unsplash('1538481199705-c710c4e965fc'),
    description: 'Gaming consoles, controllers, accessories, and PC gaming gear.',
    products: [
      { name: 'Wireless Gaming Controller', description: 'Wireless gaming controller with Bluetooth 5.0, dual vibration motors, programmable back buttons, 6-axis gyroscope, and 20-hour battery life. Compatible with PC, Android, and iOS.', shortDescription: 'Multi-platform wireless game controller', price: 4999, compareAt: 7499, stock: 60, tags: ['controller', 'wireless', 'gaming'], images: ['1538481199705-c710c4e965fc', '1543508282-6319a3e2621f', '1612287230202-1ff1d85d1bdf', '1539185441755-769473a23570'] },
      { name: 'RGB Gaming Keyboard', description: 'Mechanical gaming keyboard with RGB backlighting, blue switches, anti-ghosting N-key rollover, detachable wrist rest, dedicated media controls, and braided USB-C cable.', shortDescription: 'Mechanical RGB keyboard with blue switches', price: 5999, compareAt: 8999, stock: 40, tags: ['keyboard', 'mechanical', 'rgb'], images: ['1543508282-6319a3e2621f', '1538481199705-c710c4e965fc', '1612287230202-1ff1d85d1bdf', '1539185441755-769473a23570'] },
      { name: 'Gaming Mouse 16000 DPI', description: 'High-precision gaming mouse with 16000 DPI optical sensor, 7 programmable buttons, customizable RGB lighting, on-board memory profiles, and ultra-lightweight 65g honeycomb design.', shortDescription: 'Ultralight 16K DPI gaming mouse', price: 3499, compareAt: 5499, stock: 70, tags: ['mouse', 'gaming', 'high-dpi'], images: ['1612287230202-1ff1d85d1bdf', '1538481199705-c710c4e965fc', '1543508282-6319a3e2621f', '1539185441755-769473a23570'] },
      { name: 'Gaming Headset 7.1 Surround', description: 'USB gaming headset with virtual 7.1 surround sound, 50mm drivers, noise-cancelling retractable microphone, memory foam ear cushions, and RGB lighting. Compatible with PC and PS5.', shortDescription: '7.1 surround sound gaming headset', price: 4499, compareAt: 6999, stock: 50, tags: ['headset', 'gaming', 'surround'], images: ['1539185441755-769473a23570', '1538481199705-c710c4e965fc', '1543508282-6319a3e2621f', '1612287230202-1ff1d85d1bdf'] },
      { name: 'RGB Mouse Pad XXL', description: 'Extra-large RGB gaming mouse pad (900x400mm) with 14 lighting modes, non-slip rubber base, smooth micro-weave surface, and USB passthrough. Stitched edges for durability.', shortDescription: 'XXL RGB extended desk mouse pad', price: 1999, compareAt: 2999, stock: 100, tags: ['mousepad', 'rgb', 'xxl'], images: ['1544947950-fa07a98d237f', '1539185441755-769473a23570', '1538481199705-c710c4e965fc', '1543508282-6319a3e2621f'] },
    ],
  },
  // 19. Camera & Photography
  {
    name: 'Camera & Photography',
    image: unsplash('1516035069371-29a1b244cc32'),
    description: 'Digital cameras, lenses, tripods, and photography accessories.',
    products: [
      { name: 'Mirrorless Camera 4K', description: 'Compact mirrorless camera with 24.2MP APS-C sensor, 4K 30fps video, 5-axis in-body stabilization, electronic viewfinder, and 3-inch tilting touchscreen. Includes 18-55mm kit lens.', shortDescription: '24MP mirrorless with 4K and IBIS', price: 149999, compareAt: 189999, stock: 15, tags: ['camera', 'mirrorless', '4k'], images: ['1516035069371-29a1b244cc32', '1502920917128-1aa500764cbd', '1523293182086-7651a899d37f', '1545249390-6bdfa286032f'] },
      { name: 'Camera Tripod Professional', description: 'Professional aluminum tripod with 360° ball head, quick release plate, bubble level, and adjustable center column. Max height 170cm, folded 55cm, weight capacity 12kg.', shortDescription: 'Pro aluminum tripod with ball head', price: 5999, compareAt: 8999, stock: 40, tags: ['tripod', 'professional', 'aluminum'], images: ['1523293182086-7651a899d37f', '1516035069371-29a1b244cc32', '1502920917128-1aa500764cbd', '1545249390-6bdfa286032f'] },
      { name: 'Camera Backpack 25L', description: 'Padded camera backpack with customizable dividers, laptop sleeve (15.6"), side tripod holder, rain cover, and anti-theft back panel. Fits 1 DSLR body + 4 lenses. Capacity 25L.', shortDescription: 'Padded DSLR backpack with laptop slot', price: 4999, compareAt: 7499, stock: 30, tags: ['backpack', 'camera', 'padded'], images: ['1545249390-6bdfa286032f', '1516035069371-29a1b244cc32', '1502920917128-1aa500764cbd', '1523293182086-7651a899d37f'] },
      { name: 'Ring Light 18" with Stand', description: '18-inch LED ring light with adjustable tripod stand (60-200cm), phone holder, 3 color modes, 10 brightness levels, and remote shutter. Perfect for vlogging and video calls.', shortDescription: '18" dimmable LED ring light kit', price: 3999, compareAt: 5999, stock: 50, tags: ['ring-light', 'led', 'vlogging'], images: ['1616400619175-5beda3a17896', '1545249390-6bdfa286032f', '1516035069371-29a1b244cc32', '1523293182086-7651a899d37f'] },
      { name: 'SD Card 128GB V30', description: 'Ultra-fast 128GB SDXC memory card with V30 UHS-I speed class, read speeds up to 170MB/s and write speeds up to 90MB/s. Ideal for 4K video recording and burst photography.', shortDescription: '128GB V30 high-speed SD card', price: 2499, compareAt: 3499, stock: 100, tags: ['sd-card', 'memory', '128gb'], images: ['1502920917128-1aa500764cbd', '1516035069371-29a1b244cc32', '1523293182086-7651a899d37f', '1545249390-6bdfa286032f'] },
    ],
  },
  // 20. Toys & Games
  {
    name: 'Toys & Games',
    image: unsplash('1558060370-d644479cb6f7'),
    description: 'Board games, action figures, puzzles, and fun toys for all ages.',
    products: [
      { name: 'Chess Set Wooden Magnetic', description: 'Handcrafted wooden magnetic chess set with folding board that doubles as storage. Weighted pieces with felt bottoms. Board size 30x30cm when open. Suitable for all ages and travel.', shortDescription: 'Foldable magnetic wooden chess set', price: 2999, compareAt: 4499, stock: 60, tags: ['chess', 'wooden', 'board-game'], images: ['1560461396-ec0ef7bb29dd', '1558060370-d644479cb6f7', '1541099649105-f69ad21f3246', '1519682337058-a94d519337bc'] },
      { name: 'Puzzle 1000 Piece Scenic', description: '1000-piece jigsaw puzzle featuring a stunning landscape photograph. Precision-cut pieces with anti-glare finish for easy assembly. Completed size 70x50cm. Poster included.', shortDescription: '1000pc scenic landscape puzzle', price: 1499, compareAt: 2199, stock: 80, tags: ['puzzle', 'jigsaw', '1000pc'], images: ['1519682337058-a94d519337bc', '1558060370-d644479cb6f7', '1560461396-ec0ef7bb29dd', '1541099649105-f69ad21f3246'] },
      { name: 'STEM Robot Building Kit', description: 'Educational STEM robot building kit with 394 pieces, 12 different robot forms, solar-powered and battery options. Teaches engineering, coding concepts, and mechanical principles. Ages 8+.', shortDescription: '12-in-1 solar STEM robot kit', price: 3999, compareAt: 5999, stock: 40, tags: ['stem', 'robot', 'educational'], images: ['1541099649105-f69ad21f3246', '1558060370-d644479cb6f7', '1560461396-ec0ef7bb29dd', '1519682337058-a94d519337bc'] },
      { name: 'Action Figures Collection', description: 'Premium action figures collection of 6 detailed characters with movable joints and accessories. Made from high-quality PVC with hand-painted details. Height 15cm each. Display stands included.', shortDescription: '6-piece articulated action figure set', price: 4999, compareAt: 7499, stock: 30, tags: ['action-figures', 'collectible', 'toy'], images: ['1540747913346-19e32dc3e97e', '1558060370-d644479cb6f7', '1560461396-ec0ef7bb29dd', '1519682337058-a94d519337bc'] },
      { name: 'Card Game Family Pack', description: 'Family-friendly card game pack with 3 unique games suitable for 2-8 players. Colorful waterproof cards with simple rules that keep the whole family entertained. Ages 6 and up.', shortDescription: '3-game family card game bundle', price: 999, compareAt: 1499, stock: 120, tags: ['card-game', 'family', 'party'], images: ['1544367567-0f2fcb009e0b', '1558060370-d644479cb6f7', '1560461396-ec0ef7bb29dd', '1541099649105-f69ad21f3246'] },
    ],
  },
  // 21. Tools & Hardware
  {
    name: 'Tools & Hardware',
    image: unsplash('1504148455328-c376907d081c'),
    description: 'Power tools, hand tools, hardware, and DIY essentials.',
    products: [
      { name: 'Cordless Drill Driver 20V', description: '20V cordless drill driver with 2-speed gearbox, 25+1 torque settings, 13mm keyless chuck, LED work light, and 2.0Ah lithium-ion battery. Includes 20-piece bit set and carrying case.', shortDescription: '20V Li-Ion drill with 20pc bit set', price: 7999, compareAt: 11999, stock: 40, tags: ['drill', 'cordless', 'power-tool'], images: ['1504148455328-c376907d081c', '1572981779307-38b8cabb2407', '1502920917128-1aa500764cbd', '1522337360788-8b13dee7a37e'] },
      { name: 'Tool Set 120 Piece', description: 'Comprehensive 120-piece hand tool set including wrenches, pliers, screwdrivers, hex keys, ratchet set, measuring tape, and more. Chrome vanadium steel for durability. Metal toolbox included.', shortDescription: '120pc chrome vanadium tool set', price: 9999, compareAt: 14999, stock: 30, tags: ['tool-set', 'hand-tools', 'chrome'], images: ['1572981779307-38b8cabb2407', '1504148455328-c376907d081c', '1502920917128-1aa500764cbd', '1522337360788-8b13dee7a37e'] },
      { name: 'Laser Level Self-Leveling', description: 'Self-leveling laser level with horizontal and vertical cross lines, 360° rotation, tripod mount, and up to 15m range. Accuracy ±3mm/10m. Includes magnetic wall bracket and soft pouch.', shortDescription: 'Cross-line self-leveling laser level', price: 3499, compareAt: 5499, stock: 50, tags: ['laser', 'level', 'measuring'], images: ['1502920917128-1aa500764cbd', '1504148455328-c376907d081c', '1572981779307-38b8cabb2407', '1522337360788-8b13dee7a37e'] },
      { name: 'Electric Sander Orbital', description: 'Random orbital sander with 300W motor, variable speed control (6000-12000 RPM), dust collection bag, and Velcro pad system for easy sandpaper change. Includes 10 sanding discs.', shortDescription: '300W variable speed orbital sander', price: 4999, compareAt: 7499, stock: 35, tags: ['sander', 'electric', 'woodwork'], images: ['1522337360788-8b13dee7a37e', '1504148455328-c376907d081c', '1572981779307-38b8cabb2407', '1502920917128-1aa500764cbd'] },
      { name: 'LED Work Light Rechargeable', description: 'Rechargeable LED work light with 1500 lumens, 5 brightness modes, red warning flash, magnetic base, 360° hook, and USB-C charging. 8-hour battery life on medium setting.', shortDescription: '1500lm rechargeable magnetic work light', price: 1999, compareAt: 2999, stock: 80, tags: ['work-light', 'led', 'rechargeable'], images: ['1513364776144-60967b0f800f', '1522337360788-8b13dee7a37e', '1504148455328-c376907d081c', '1572981779307-38b8cabb2407'] },
    ],
  },
  // 22. Musical Instruments
  {
    name: 'Musical Instruments',
    image: unsplash('1510915361894-db8b60106cb1'),
    description: 'Guitars, keyboards, drums, and musical accessories.',
    products: [
      { name: 'Acoustic Guitar Starter Pack', description: 'Full-size acoustic guitar starter pack with spruce top, mahogany back and sides, chrome tuners, gig bag, picks, strap, capo, and digital tuner. Perfect for beginners.', shortDescription: 'Complete beginner acoustic guitar bundle', price: 12999, compareAt: 17999, stock: 20, tags: ['guitar', 'acoustic', 'beginner'], images: ['1510915361894-db8b60106cb1', '1525201548942-d8732f6617a0', '1485955900006-10f4d324d411', '1519682337058-a94d519337bc'] },
      { name: 'Digital Piano 88 Keys', description: '88-key weighted digital piano with hammer action, 128 polyphony, 10 instrument voices, Bluetooth MIDI, built-in speakers, and sustain pedal. Includes piano stand and bench.', shortDescription: '88-key weighted digital piano set', price: 39999, compareAt: 49999, stock: 10, tags: ['piano', 'digital', '88-key'], images: ['1496181133206-80ce9b88a853', '1510915361894-db8b60106cb1', '1525201548942-d8732f6617a0', '1485955900006-10f4d324d411'] },
      { name: 'Ukulele Concert Bundle', description: 'Concert size ukulele with mahogany body, Aquila strings, chrome geared tuners. Bundle includes padded gig bag, tuner, strap, picks, and beginner songbook. Rich warm tone.', shortDescription: 'Concert ukulele with accessories bundle', price: 4999, compareAt: 7499, stock: 40, tags: ['ukulele', 'concert', 'bundle'], images: ['1485955900006-10f4d324d411', '1510915361894-db8b60106cb1', '1525201548942-d8732f6617a0', '1519682337058-a94d519337bc'] },
      { name: 'Condenser Microphone USB', description: 'Professional USB condenser microphone with cardioid pickup pattern, 192kHz/24-bit sample rate, gain knob, headphone jack with zero-latency monitoring, and included pop filter and boom arm.', shortDescription: 'Studio USB condenser mic with boom arm', price: 6999, compareAt: 9999, stock: 30, tags: ['microphone', 'usb', 'condenser'], images: ['1519682337058-a94d519337bc', '1510915361894-db8b60106cb1', '1485955900006-10f4d324d411', '1525201548942-d8732f6617a0'] },
      { name: 'Cajon Drum Box', description: 'Handcrafted cajon drum box with birch wood body, adjustable snare wires, rubber feet, and natural finish. Produces deep bass tones and crisp snare sounds. Includes padded carry bag.', shortDescription: 'Birch wood cajon with snare wires', price: 7999, compareAt: 11999, stock: 15, tags: ['cajon', 'drum', 'percussion'], images: ['1525201548942-d8732f6617a0', '1510915361894-db8b60106cb1', '1485955900006-10f4d324d411', '1519682337058-a94d519337bc'] },
    ],
  },
  // 23. Office & School Supplies
  {
    name: 'Office & School Supplies',
    image: unsplash('1497633762265-9d179a990aa6'),
    description: 'Office furniture, school essentials, and productivity tools.',
    products: [
      { name: 'Ergonomic Office Chair', description: 'Ergonomic mesh office chair with adjustable lumbar support, headrest, 3D armrests, seat depth adjustment, and breathable mesh back. Supports up to 150kg. BIFMA certified.', shortDescription: 'Adjustable ergonomic mesh desk chair', price: 19999, compareAt: 29999, stock: 20, tags: ['chair', 'ergonomic', 'office'], images: ['1580480055273-228ff5388ef8', '1497633762265-9d179a990aa6', '1524758631624-e2822e304c36', '1611269154421-4e27233ac5c7'] },
      { name: 'Standing Desk Converter', description: 'Height-adjustable standing desk converter with gas spring mechanism, spacious 32" work surface, keyboard tray, and cable management. Adjusts from 4" to 20" height. Holds up to 15kg.', shortDescription: '32" gas-spring desk riser converter', price: 12999, compareAt: 18999, stock: 15, tags: ['standing-desk', 'converter', 'ergonomic'], images: ['1524758631624-e2822e304c36', '1497633762265-9d179a990aa6', '1580480055273-228ff5388ef8', '1611269154421-4e27233ac5c7'] },
      { name: 'Whiteboard Magnetic 90x60cm', description: 'Magnetic whiteboard with aluminum frame, detachable accessory tray, and wall mounting hardware. Dry-erase lacquered steel surface. Includes 4 markers, eraser, and 6 magnets.', shortDescription: 'Magnetic dry-erase whiteboard 90x60cm', price: 3999, compareAt: 5999, stock: 30, tags: ['whiteboard', 'magnetic', 'office'], images: ['1611269154421-4e27233ac5c7', '1497633762265-9d179a990aa6', '1580480055273-228ff5388ef8', '1524758631624-e2822e304c36'] },
      { name: 'School Backpack Waterproof', description: 'Waterproof school backpack with padded laptop sleeve (14"), multiple organizer pockets, reflective strips for safety, ergonomic shoulder straps, and chest buckle. Capacity 28L.', shortDescription: '28L waterproof school bag with laptop slot', price: 2499, compareAt: 3999, stock: 80, tags: ['backpack', 'school', 'waterproof'], images: ['1553062407-98eeb64c6a62', '1611269154421-4e27233ac5c7', '1497633762265-9d179a990aa6', '1580480055273-228ff5388ef8'] },
      { name: 'Document Scanner Portable', description: 'Portable document scanner with auto-feed tray, duplex scanning, 25 pages per minute, Wi-Fi connectivity, and cloud integration. Scans to PDF, JPEG, or searchable PDF. OCR included.', shortDescription: 'Wi-Fi portable scanner with OCR', price: 14999, compareAt: 19999, stock: 20, tags: ['scanner', 'portable', 'document'], images: ['1563206767-5b18f218e8de', '1497633762265-9d179a990aa6', '1580480055273-228ff5388ef8', '1524758631624-e2822e304c36'] },
    ],
  },
  // 24. Gardening & Outdoor
  {
    name: 'Gardening & Outdoor',
    image: unsplash('1416879595882-3373a0480b5b'),
    description: 'Garden tools, plants, outdoor furniture, and landscaping supplies.',
    products: [
      { name: 'Garden Tool Set 10pc', description: 'Heavy-duty 10-piece garden tool set with trowel, transplanter, weeder, cultivator, pruners, gloves, knee pad, and canvas tote bag. Rust-resistant aluminum heads with ergonomic handles.', shortDescription: '10pc aluminum garden tool set', price: 3999, compareAt: 5999, stock: 40, tags: ['garden', 'tools', 'set'], images: ['1416879595882-3373a0480b5b', '1585320806297-9794b3e4eeae', '1591857177580-dc82b9ac4e1e', '1523348837708-15d4a09cfac2'] },
      { name: 'Automatic Drip Irrigation Kit', description: 'Automatic drip irrigation system kit with timer, 30m tubing, 30 drippers, connectors, and stakes. Programmable watering schedule with rain delay feature. Covers up to 25 plants.', shortDescription: 'Auto-timer 25-plant drip irrigation', price: 2999, compareAt: 4499, stock: 50, tags: ['irrigation', 'automatic', 'garden'], images: ['1585320806297-9794b3e4eeae', '1416879595882-3373a0480b5b', '1591857177580-dc82b9ac4e1e', '1523348837708-15d4a09cfac2'] },
      { name: 'Outdoor Solar Lights 8 Pack', description: 'Solar-powered garden path lights with auto on/off, warm white LED, stainless steel body, and waterproof IP65 rating. 8-hour runtime when fully charged. Easy stake installation.', shortDescription: '8-pack solar LED pathway lights', price: 1999, compareAt: 3499, stock: 80, tags: ['solar', 'lights', 'outdoor'], images: ['1512496015851-a90fb38ba796', '1416879595882-3373a0480b5b', '1585320806297-9794b3e4eeae', '1591857177580-dc82b9ac4e1e'] },
      { name: 'Foldable Garden Chair Set', description: 'Set of 2 foldable garden chairs with breathable textilene fabric, powder-coated steel frame, and padded armrests. Folds flat for easy storage. Max load 120kg each.', shortDescription: '2pk foldable outdoor garden chairs', price: 5999, compareAt: 8999, stock: 25, tags: ['chair', 'garden', 'foldable'], images: ['1591857177580-dc82b9ac4e1e', '1416879595882-3373a0480b5b', '1585320806297-9794b3e4eeae', '1523348837708-15d4a09cfac2'] },
      { name: 'Pressure Washer 1600W', description: 'Electric pressure washer with 1600W motor, 130 bar max pressure, 6m high-pressure hose, adjustable nozzle, foam lance, and 5L detergent tank. Ideal for cars, patios, and garden furniture.', shortDescription: '130-bar electric pressure washer', price: 14999, compareAt: 19999, stock: 20, tags: ['pressure-washer', 'cleaning', 'outdoor'], images: ['1523348837708-15d4a09cfac2', '1416879595882-3373a0480b5b', '1585320806297-9794b3e4eeae', '1591857177580-dc82b9ac4e1e'] },
    ],
  },
  // 25. Jewelry & Accessories
  {
    name: 'Jewelry & Accessories',
    image: unsplash('1489824904134-891ab64532f1'),
    description: 'Rings, necklaces, bracelets, and fashion accessories.',
    products: [
      { name: 'Silver Ring Set 5pc', description: 'Set of 5 sterling silver stackable rings with various textures - hammered, braided, minimalist, pearl-set, and twisted designs. 925 sterling silver with rhodium plating for tarnish resistance.', shortDescription: '5-piece 925 silver stackable rings', price: 3499, compareAt: 5499, stock: 60, tags: ['ring', 'silver', 'stackable'], images: ['1605100804763-247f67b3557e', '1489824904134-891ab64532f1', '1611085583191-a3b181a88401', '1599643477877-530eb83abc8e'] },
      { name: 'Pearl Necklace Classic', description: 'Classic freshwater pearl necklace with 7-8mm round pearls on silk thread with knot between each pearl. Sterling silver lobster clasp. Length 18 inches. Elegant gift box included.', shortDescription: 'Freshwater pearl strand necklace', price: 7999, compareAt: 11999, stock: 30, tags: ['pearl', 'necklace', 'classic'], images: ['1599643477877-530eb83abc8e', '1489824904134-891ab64532f1', '1605100804763-247f67b3557e', '1611085583191-a3b181a88401'] },
      { name: 'Charm Bracelet Rose Gold', description: 'Rose gold plated charm bracelet with 5 interchangeable charms - heart, star, moon, butterfly, and infinity. Snake chain with barrel clasp. Adjustable length 17-20cm.', shortDescription: 'Rose gold bracelet with 5 charms', price: 2499, compareAt: 3999, stock: 80, tags: ['bracelet', 'charm', 'rose-gold'], images: ['1611085583191-a3b181a88401', '1489824904134-891ab64532f1', '1599643477877-530eb83abc8e', '1605100804763-247f67b3557e'] },
      { name: 'Drop Earrings Crystal', description: 'Sparkling crystal drop earrings with AAA+ cubic zirconia stones in teardrop setting. 18K gold plated brass with secure lever-back closure. Length 4cm. Hypoallergenic and lead-free.', shortDescription: 'CZ teardrop gold plated earrings', price: 1999, compareAt: 3499, stock: 100, tags: ['earrings', 'crystal', 'drop'], images: ['1602173574767-37ac01994b2a', '1489824904134-891ab64532f1', '1611085583191-a3b181a88401', '1599643477877-530eb83abc8e'] },
      { name: 'Leather Wallet RFID Blocking', description: 'Premium genuine leather bifold wallet with RFID blocking technology. Features 8 card slots, 2 bill compartments, ID window, and coin pocket. Slim profile 11x9.5cm. Gift box included.', shortDescription: 'RFID-blocking genuine leather wallet', price: 2999, compareAt: 4499, stock: 70, tags: ['wallet', 'leather', 'rfid'], images: ['1551107696-a4b0c5a0d9a2', '1489824904134-891ab64532f1', '1605100804763-247f67b3557e', '1611085583191-a3b181a88401'] },
    ],
  },
  // 26. Electrical & Lighting
  {
    name: 'Electrical & Lighting',
    image: unsplash('1524484485831-a92ffc0de03f'),
    description: 'LED bulbs, switches, cables, and electrical solutions.',
    products: [
      { name: 'Smart LED Bulb RGB Wi-Fi', description: 'Smart Wi-Fi LED bulb with 16 million colors, tunable white (2700-6500K), 10W (equivalent 60W), voice control via Alexa/Google Home, app control, and scheduling. No hub required.', shortDescription: 'Wi-Fi RGB smart bulb with voice control', price: 999, compareAt: 1499, stock: 200, tags: ['smart', 'led', 'wifi'], images: ['1524484485831-a92ffc0de03f', '1512496015851-a90fb38ba796', '1459411552884-841db9b3cc2a', '1513506003901-1e6a229e2d15'] },
      { name: 'LED Strip Lights 10m RGB', description: '10-meter RGB LED strip lights with remote control, 44-key IR remote, 20 colors, 6 DIY modes, and adhesive backing. Cuttable at every 3 LEDs for custom length. 12V power adapter included.', shortDescription: '10m remote-controlled RGB LED strip', price: 1999, compareAt: 2999, stock: 100, tags: ['led-strip', 'rgb', 'lighting'], images: ['1513506003901-1e6a229e2d15', '1524484485831-a92ffc0de03f', '1512496015851-a90fb38ba796', '1459411552884-841db9b3cc2a'] },
      { name: 'Extension Board 6-Way Surge', description: '6-way extension board with surge protection, individual switches, LED indicators, 2 USB ports (5V/2.1A), 2-meter fire-resistant cable, and child safety shutters. Rated 13A/3120W.', shortDescription: '6-outlet surge protector with USB', price: 1499, compareAt: 2199, stock: 120, tags: ['extension', 'surge', 'usb'], images: ['1513364776144-60967b0f800f', '1524484485831-a92ffc0de03f', '1513506003901-1e6a229e2d15', '1459411552884-841db9b3cc2a'] },
      { name: 'Solar Panel Kit 100W', description: '100W monocrystalline solar panel kit with 20A charge controller, mounting brackets, MC4 connectors, and 5m extension cables. Suitable for RV, boat, cabin, or off-grid charging.', shortDescription: '100W mono solar panel with controller', price: 12999, compareAt: 17999, stock: 20, tags: ['solar', 'panel', 'renewable'], images: ['1466637574441-749b8f19452f', '1524484485831-a92ffc0de03f', '1512496015851-a90fb38ba796', '1513506003901-1e6a229e2d15'] },
      { name: 'Ceiling Fan with LED Light', description: 'Modern 52-inch ceiling fan with integrated LED light (24W), remote control, 6 speed settings, reversible motor for summer/winter use, and silent DC motor. Suitable for rooms up to 25sqm.', shortDescription: '52" LED ceiling fan with remote', price: 9999, compareAt: 14999, stock: 25, tags: ['fan', 'ceiling', 'led'], images: ['1459411552884-841db9b3cc2a', '1524484485831-a92ffc0de03f', '1513506003901-1e6a229e2d15', '1512496015851-a90fb38ba796'] },
    ],
  },
  // 27. Cleaning & Laundry
  {
    name: 'Cleaning & Laundry',
    image: unsplash('1563453392212-326f5e854473'),
    description: 'Cleaning tools, detergents, and household maintenance products.',
    products: [
      { name: 'Robot Vacuum Cleaner Smart', description: 'Smart robot vacuum with LiDAR navigation, 2700pa suction, auto-empty station, mopping function, app control, and multi-floor mapping. 150 minutes runtime. Works with Alexa and Google Home.', shortDescription: 'LiDAR robot vacuum with auto-empty', price: 29999, compareAt: 44999, stock: 15, tags: ['robot-vacuum', 'smart', 'cleaning'], images: ['1513364776144-60967b0f800f', '1563453392212-326f5e854473', '1527515637462-cff94eecc1ac', '1527515637462-cff94eecc1ac'] },
      { name: 'Handheld Steam Cleaner', description: 'Portable handheld steam cleaner with 350ml tank, 3-minute heat-up, and 12 accessories for various surfaces. Chemical-free cleaning at 108°C. Ideal for kitchen, bathroom, and upholstery.', shortDescription: 'Portable multi-surface steam cleaner', price: 4999, compareAt: 7999, stock: 40, tags: ['steam', 'cleaner', 'portable'], images: ['1527515637462-cff94eecc1ac', '1563453392212-326f5e854473', '1513364776144-60967b0f800f', '1527515637462-cff94eecc1ac'] },
      { name: 'Spin Mop Bucket Set', description: 'Microfiber spin mop and bucket set with foot pedal wringer, 360° rotating head, telescopic handle (80-130cm), splash guard, and 2 machine-washable mop heads. Bucket capacity 8L.', shortDescription: '360° spin mop with pedal bucket', price: 2499, compareAt: 3499, stock: 80, tags: ['mop', 'spin', 'cleaning'], images: ['1527515637462-cff94eecc1ac', '1563453392212-326f5e854473', '1527515637462-cff94eecc1ac', '1513364776144-60967b0f800f'] },
      { name: 'Laundry Detergent Pods 50pc', description: 'Triple-action laundry detergent pods with stain remover, brightener, and fresh scent. Pre-measured for convenience. Suitable for all washing machines. Dissolves in cold water.', shortDescription: '50-count 3-in-1 laundry pods', price: 1299, compareAt: 1799, stock: 200, tags: ['detergent', 'laundry', 'pods'], images: ['1582735689369-4fe89db7114c', '1563453392212-326f5e854473', '1527515637462-cff94eecc1ac', '1527515637462-cff94eecc1ac'] },
      { name: 'Portable Clothes Steamer', description: 'Compact portable garment steamer with 200ml water tank, 15-second heat up, continuous steam for 12 minutes, and foldable handle. Wrinkle-free clothes without ironing. Travel-friendly.', shortDescription: 'Quick-heat portable garment steamer', price: 2999, compareAt: 4499, stock: 60, tags: ['steamer', 'clothes', 'portable'], images: ['1512496015851-a90fb38ba796', '1563453392212-326f5e854473', '1527515637462-cff94eecc1ac', '1582735689369-4fe89db7114c'] },
    ],
  },
  // 28. Perfumes & Fragrances
  {
    name: 'Perfumes & Fragrances',
    image: unsplash('1507003211169-0a1dd7228f2d'),
    description: 'Designer perfumes, attars, body sprays, and fragrance sets.',
    products: [
      { name: 'Oud Perfume Premium 100ml', description: 'Premium Arabian oud perfume with top notes of bergamot and saffron, heart of pure agarwood oud, and base of musk and amber. Long-lasting 12+ hours. Handcrafted glass bottle.', shortDescription: 'Long-lasting Arabian oud eau de parfum', price: 7999, compareAt: 12999, stock: 40, tags: ['oud', 'perfume', 'arabian'], images: ['1507003211169-0a1dd7228f2d', '1523293182086-7651a899d37f', '1540518614846-7eded433c457', '1563170351-be82bc888aa4'] },
      { name: 'Attar Collection Gift Box', description: 'Exquisite attar collection gift box with 6 premium oil-based fragrances (6ml each) in decorative glass bottles. Includes rose, jasmine, sandalwood, musk, amber, and oudh variants.', shortDescription: '6-piece attar oil collection', price: 4999, compareAt: 7999, stock: 30, tags: ['attar', 'gift', 'collection'], images: ['1540518614846-7eded433c457', '1507003211169-0a1dd7228f2d', '1523293182086-7651a899d37f', '1563170351-be82bc888aa4'] },
      { name: 'Body Mist Set 3x250ml', description: 'Refreshing body mist set with 3 fragrances: spring blossom, vanilla dream, and ocean breeze. Light and uplifting scents perfect for daily wear. Each bottle 250ml with fine mist spray.', shortDescription: 'Three-fragrance body mist collection', price: 1999, compareAt: 2999, stock: 100, tags: ['body-mist', 'set', 'spray'], images: ['1563170351-be82bc888aa4', '1507003211169-0a1dd7228f2d', '1540518614846-7eded433c457', '1523293182086-7651a899d37f'] },
      { name: 'Car Perfume Luxury Set', description: 'Luxury car perfume set with 3 premium air freshener clips and 12 refill pads. Scents: new leather, dark forest, and midnight cologne. Long-lasting fragrance up to 60 days per pad.', shortDescription: '3-clip luxury car fragrance set', price: 1499, compareAt: 2499, stock: 80, tags: ['car-perfume', 'luxury', 'freshener'], images: ['1523293182086-7651a899d37f', '1507003211169-0a1dd7228f2d', '1540518614846-7eded433c457', '1563170351-be82bc888aa4'] },
      { name: 'Scented Candle Collection', description: 'Premium soy wax scented candle collection (3-pack) with lavender, vanilla, and cinnamon fragrances. Hand-poured with cotton wicks. Burn time 45 hours each. Reusable glass jars.', shortDescription: '3-pack soy wax scented candles', price: 2499, compareAt: 3499, stock: 60, tags: ['candles', 'scented', 'soy'], images: ['1541899481282-d53bffe3c35d', '1563170351-be82bc888aa4', '1507003211169-0a1dd7228f2d', '1540518614846-7eded433c457'] },
    ],
  },
  // 29. Textile & Fabric
  {
    name: 'Textile & Fabric',
    image: unsplash('1512496015851-a90fb38ba796'),
    description: 'Bed sheets, towels, curtains, and fabric materials.',
    products: [
      { name: 'King Size Bed Sheet Set', description: 'Premium 400-thread-count king size bed sheet set including 1 fitted sheet, 1 flat sheet, and 2 pillowcases. 100% long-staple cotton. Deep pocket fitted sheet fits mattresses up to 16 inches.', shortDescription: '400TC cotton king sheet set', price: 4999, compareAt: 7999, stock: 40, tags: ['bedsheet', 'king', 'cotton'], images: ['1631049307264-da0ec9d70304', '1512496015851-a90fb38ba796', '1629140727571-9b5c6f6267b4', '1505740420928-5e560c06d30e'] },
      { name: 'Luxury Bath Towel Set 6pc', description: '6-piece luxury bath towel set: 2 bath towels (70x140cm), 2 hand towels (40x70cm), 2 washcloths (30x30cm). 600GSM zero-twist cotton for maximum absorbency and softness.', shortDescription: '6pc 600GSM zero-twist towel set', price: 3499, compareAt: 4999, stock: 50, tags: ['towel', 'bath', 'luxury'], images: ['1629140727571-9b5c6f6267b4', '1512496015851-a90fb38ba796', '1631049307264-da0ec9d70304', '1505740420928-5e560c06d30e'] },
      { name: 'Blackout Curtains Pair', description: 'Thermal insulated blackout curtains with 95% light blocking and noise reducing properties. Grommet top design with 8 antique bronze grommets. Each panel 52x84 inches. Machine washable.', shortDescription: '95% blackout thermal curtain pair', price: 2999, compareAt: 4499, stock: 60, tags: ['curtain', 'blackout', 'thermal'], images: ['1505740420928-5e560c06d30e', '1512496015851-a90fb38ba796', '1631049307264-da0ec9d70304', '1629140727571-9b5c6f6267b4'] },
      { name: 'Duvet Cover Set Printed', description: 'Printed duvet cover set with 1 duvet cover and 2 pillow shams. 200TC brushed microfiber with hidden zipper closure and corner ties. Contemporary geometric pattern. Queen size.', shortDescription: 'Queen geometric duvet cover set', price: 2499, compareAt: 3999, stock: 70, tags: ['duvet', 'printed', 'microfiber'], images: ['1615874959474-d609969a20ed', '1512496015851-a90fb38ba796', '1631049307264-da0ec9d70304', '1505740420928-5e560c06d30e'] },
      { name: 'Table Runner Embroidered', description: 'Elegant embroidered table runner with intricate floral design. Made from heavyweight cotton-linen blend with tassel ends. Size 33x180cm. Adds a sophisticated touch to dining tables.', shortDescription: 'Floral embroidered cotton table runner', price: 1299, compareAt: 1999, stock: 90, tags: ['table-runner', 'embroidered', 'decor'], images: ['1512496015851-a90fb38ba796', '1631049307264-da0ec9d70304', '1615874959474-d609969a20ed', '1505740420928-5e560c06d30e'] },
    ],
  },
  // 30. Security & Surveillance
  {
    name: 'Security & Surveillance',
    image: unsplash('1558002038-1055907df827'),
    description: 'CCTV cameras, smart locks, alarms, and security systems.',
    products: [
      { name: 'WiFi Security Camera 2K', description: 'Indoor/outdoor WiFi security camera with 2K resolution, night vision up to 30m, two-way audio, motion detection with AI person detection, and cloud/SD card storage. IP66 weatherproof.', shortDescription: '2K WiFi camera with AI detection', price: 5999, compareAt: 8999, stock: 50, tags: ['camera', 'security', 'wifi'], images: ['1558002038-1055907df827', '1557597774-9d273605dfa9', '1522335789203-aabd1fc54bc9', '1525201548942-d8732f6617a0'] },
      { name: 'Smart Door Lock Fingerprint', description: 'Smart door lock with fingerprint scanner, numeric keypad, RFID card, physical key, and app control via Bluetooth. Stores up to 100 fingerprints. Auto-lock and intruder alarm functions.', shortDescription: 'Multi-access smart fingerprint door lock', price: 14999, compareAt: 21999, stock: 25, tags: ['smart-lock', 'fingerprint', 'security'], images: ['1557597774-9d273605dfa9', '1558002038-1055907df827', '1522335789203-aabd1fc54bc9', '1525201548942-d8732f6617a0'] },
      { name: 'Video Doorbell 1080p WiFi', description: 'Smart video doorbell with 1080p HD camera, 166° wide-angle view, two-way audio, infrared night vision, PIR motion detection, and real-time phone notifications. Wired or battery powered.', shortDescription: '1080p smart doorbell with motion alerts', price: 7999, compareAt: 11999, stock: 35, tags: ['doorbell', 'video', 'smart'], images: ['1522335789203-aabd1fc54bc9', '1558002038-1055907df827', '1557597774-9d273605dfa9', '1525201548942-d8732f6617a0'] },
      { name: 'Home Alarm System Kit', description: 'Complete wireless home alarm system with hub, 5 door/window sensors, 2 PIR motion detectors, siren, remote controls, and phone app. Supports up to 100 zones. Battery backup.', shortDescription: 'Wireless home alarm with 7 sensors', price: 12999, compareAt: 18999, stock: 20, tags: ['alarm', 'home', 'wireless'], images: ['1525201548942-d8732f6617a0', '1558002038-1055907df827', '1557597774-9d273605dfa9', '1522335789203-aabd1fc54bc9'] },
      { name: 'Safe Box Digital 25L', description: 'Digital safe box with electronic keypad lock, emergency key override, 3-8 digit programmable code, 2 live-action locking bolts, and interior LED light. Fire-resistant steel. Capacity 25L.', shortDescription: '25L electronic steel safe with LED', price: 9999, compareAt: 14999, stock: 15, tags: ['safe', 'digital', 'security'], images: ['1557597774-9d273605dfa9', '1525201548942-d8732f6617a0', '1558002038-1055907df827', '1522335789203-aabd1fc54bc9'] },
    ],
  },
];

// ─── Main ────────────────────────────────────────────────────────────
async function seed() {
  await dataSource.initialize();
  const qr = dataSource.createQueryRunner();
  await qr.connect();
  await qr.startTransaction();

  try {
    console.log('\n🌱  Seed 4 — Categories, Products & Images\n');

    // ──────────────────────────────────────────────────────────────────
    // 0. Clean existing data using TRUNCATE CASCADE
    // ──────────────────────────────────────────────────────────────────
    console.log('🗑️  Cleaning existing product_images, products, categories…');
    await qr.query(`TRUNCATE product_images, product_attributes, variant_attribute_values, product_variants, products, categories CASCADE`);
    console.log('  ✅ Cleaned\n');

    // ──────────────────────────────────────────────────────────────────
    // 1. Create seller user + seller + store
    // ──────────────────────────────────────────────────────────────────
    console.log('👤 Creating seller user…');
    const sellerEmail = 'seller@labverse.pk';
    const sellerPassword = await bcrypt.hash('Seller@123!', 10);

    // Upsert seller user (email unique index is partial, so use SELECT + INSERT/UPDATE)
    let userId: string;
    const [existingUser] = await qr.query(
      `SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL`,
      [sellerEmail],
    );
    if (existingUser) {
      userId = existingUser.id;
      await qr.query(
        `UPDATE users SET role = 'seller', is_active = true, is_email_verified = true, updated_at = NOW() WHERE id = $1`,
        [userId],
      );
      console.log(`  ✅ Updated existing seller user (${userId})`);
    } else {
      const [newUser] = await qr.query(
        `INSERT INTO users (name, email, password, phone, role, is_active, is_email_verified, email_verified_at)
         VALUES ('LabVerse Seller', $1, $2, '+923001234567', 'seller', true, true, NOW())
         RETURNING id`,
        [sellerEmail, sellerPassword],
      );
      userId = newUser.id;
      console.log(`  ✅ Created seller user: ${sellerEmail} (${userId})`);
    }

    // Upsert seller
    const [seller] = await qr.query(
      `INSERT INTO sellers (user_id, business_name, verification_status, commission_rate)
       VALUES ($1, 'LabVerse Official Store', 'approved', 5.00)
       ON CONFLICT (user_id) DO UPDATE SET
         business_name = 'LabVerse Official Store', verification_status = 'approved', updated_at = NOW()
       RETURNING id`,
      [userId],
    );
    const sellerId = seller.id;
    console.log(`  ✅ Seller: ${sellerId}`);

    // Upsert store
    const [store] = await qr.query(
      `INSERT INTO stores (seller_id, name, slug, description, is_active)
       VALUES ($1, 'LabVerse Official Store', 'labverse-official-store',
               'Your one-stop marketplace for quality products across all categories.', true)
       ON CONFLICT (seller_id) DO UPDATE SET
         name = 'LabVerse Official Store', is_active = true, updated_at = NOW()
       RETURNING id`,
      [sellerId],
    );
    console.log(`  ✅ Store: ${store.id}\n`);

    // ──────────────────────────────────────────────────────────────────
    // 2. Insert categories, products, and images
    // ──────────────────────────────────────────────────────────────────
    let totalProducts = 0;
    let totalImages = 0;

    for (let ci = 0; ci < CATEGORIES.length; ci++) {
      const cat = CATEGORIES[ci];
      const catSlug = slugify(cat.name);

      // Insert category
      const [catRow] = await qr.query(
        `INSERT INTO categories (name, slug, image_url, description, is_active, is_featured, sort_order, depth)
         VALUES ($1, $2, $3, $4, true, $5, $6, 0)
         ON CONFLICT (slug) DO UPDATE SET
           name = $1, image_url = $3, description = $4, is_featured = $5, sort_order = $6, updated_at = NOW()
         RETURNING id`,
        [cat.name, catSlug, cat.image, cat.description, ci < 8, ci],
      );
      const categoryId = catRow.id;
      console.log(`📁 [${ci + 1}/30] ${cat.name}`);

      // Insert products
      for (let pi = 0; pi < cat.products.length; pi++) {
        const prod = cat.products[pi];
        const prodSlug = slugify(prod.name);
        const sku = `LV-${catSlug.substring(0, 4).toUpperCase()}-${String(ci * 5 + pi + 1).padStart(4, '0')}`;

        const [prodRow] = await qr.query(
          `INSERT INTO products (
             seller_id, category_id, name, slug, description, short_description,
             price, compare_at_price, stock, sku, status, is_featured, published_at, tags
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active', $11, NOW(), $12)
           ON CONFLICT (slug) DO UPDATE SET
             price = $7, stock = $9, status = 'active', updated_at = NOW()
           RETURNING id`,
          [
            sellerId,
            categoryId,
            prod.name,
            prodSlug,
            prod.description,
            prod.shortDescription,
            prod.price,
            prod.compareAt,
            prod.stock,
            sku,
            pi === 0, // first product per category is featured
            prod.tags,
          ],
        );
        const productId = prodRow.id;
        totalProducts++;

        // Insert images
        for (let ii = 0; ii < prod.images.length; ii++) {
          await qr.query(
            `INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              productId,
              unsplash(prod.images[ii]),
              `${prod.name} - Image ${ii + 1}`,
              ii === 0, // first image is primary
              ii,
            ],
          );
          totalImages++;
        }
      }
    }

    await qr.commitTransaction();

    // ──────────────────────────────────────────────────────────────────
    // Summary
    // ──────────────────────────────────────────────────────────────────
    console.log('\n' + '═'.repeat(60));
    console.log('  SEED DATA CREATED SUCCESSFULLY');
    console.log('═'.repeat(60));
    console.log(`  Categories:    30`);
    console.log(`  Products:      ${totalProducts}`);
    console.log(`  Images:        ${totalImages}`);
    console.log(`  Seller email:  ${sellerEmail}`);
    console.log(`  Seller pass:   Seller@123!`);
    console.log('═'.repeat(60) + '\n');
  } catch (err) {
    await qr.rollbackTransaction();
    console.error('❌ Seed failed:', err);
    process.exit(1);
  } finally {
    await qr.release();
    await dataSource.destroy();
  }
}

seed();
