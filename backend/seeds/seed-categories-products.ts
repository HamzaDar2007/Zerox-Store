/**
 * Seed File 4 — Categories, Products & Images
 *
 * Creates 10 marketplace categories, a seller user + seller record + store,
 * then 10 products per category (100 total) each with 5 images (500 total)
 * using Unsplash CDN URLs that render on all portals.
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
function img(photoId: string, w = 800, h = 800): string {
  return `https://images.unsplash.com/photo-${photoId}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;
}

// ─── Helper: slugify ─────────────────────────────────────────────────
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// ─── Types ───────────────────────────────────────────────────────────
interface ProductData {
  name: string;
  desc: string;
  short: string;
  price: number;
  compare: number;
  stock: number;
  tags: string[];
  images: string[];
}

interface CategoryData {
  name: string;
  image: string;
  description: string;
  products: ProductData[];
}

// ─── 10 Categories × 10 Products × 5 Images ─────────────────────────
const CATEGORIES: CategoryData[] = [
  // ──────────────────────────────────────────────────────────────────
  // 1. Mobile Phones
  // ──────────────────────────────────────────────────────────────────
  {
    name: 'Mobile Phones',
    image: img('1511707171128-773957a9225f'),
    description: 'Latest smartphones and feature phones from top brands.',
    products: [
      { name: 'Samsung Galaxy S24 Ultra', desc: 'Samsung Galaxy S24 Ultra with 6.8-inch Dynamic AMOLED 2X display, Snapdragon 8 Gen 3 processor, 200MP camera system, and S Pen. Titanium frame for premium durability.', short: 'Flagship smartphone with S Pen and 200MP camera', price: 249999, compare: 279999, stock: 50, tags: ['samsung', 'flagship', '5g'], images: ['1598327105666-5b89351aff97', '1610945265064-0e34e5519bbf', '1538481199705-c710c4e965fc', '1585060544812-6b45742d762f', '1511707171128-773957a9225f'] },
      { name: 'iPhone 15 Pro Max', desc: 'Apple iPhone 15 Pro Max with A17 Pro chip, 48MP main camera with 5x optical zoom, titanium design, USB-C connectivity, Action Button, and all-day battery life.', short: 'Premium Apple flagship with titanium design', price: 499999, compare: 549999, stock: 35, tags: ['apple', 'iphone', 'flagship'], images: ['1553062407-98eeb64c6a62', '1591337676887-a217a6970a8a', '1510557880182-3d4d3cba35a5', '1565849904461-04a58ad377e0', '1592750475338-74b7b21085ab'] },
      { name: 'Xiaomi Redmi Note 13 Pro', desc: 'Redmi Note 13 Pro with 6.67-inch AMOLED 120Hz display, MediaTek Helio G99 Ultra, 200MP camera, and 5000mAh battery with 67W turbo charging.', short: 'Mid-range phone with 200MP camera', price: 54999, compare: 64999, stock: 100, tags: ['xiaomi', 'redmi', 'mid-range'], images: ['1574944985070-8f3ebc6b79d2', '1512054502232-10a0a035d672', '1605236453806-6ff36851218e', '1598327105666-5b89351aff97', '1610945265064-0e34e5519bbf'] },
      { name: 'Tecno Spark 20 Pro', desc: 'Tecno Spark 20 Pro with 6.78-inch IPS LCD, 108MP AI camera system, Helio G99, 8GB RAM with extended memory, and 5000mAh battery.', short: 'Budget phone with 108MP triple camera', price: 34999, compare: 39999, stock: 150, tags: ['tecno', 'budget', 'camera'], images: ['1605236453806-6ff36851218e', '1574944985070-8f3ebc6b79d2', '1512054502232-10a0a035d672', '1598327105666-5b89351aff97', '1538481199705-c710c4e965fc'] },
      { name: 'Infinix Hot 40 Pro', desc: 'Infinix Hot 40 Pro with 6.78-inch FHD+ display, Helio G99, 108MP triple camera, 8GB+256GB, and 5000mAh battery with 33W fast charge.', short: 'Value smartphone with fast charging', price: 29999, compare: 35999, stock: 200, tags: ['infinix', 'budget', 'fast-charge'], images: ['1512054502232-10a0a035d672', '1605236453806-6ff36851218e', '1574944985070-8f3ebc6b79d2', '1598327105666-5b89351aff97', '1585060544812-6b45742d762f'] },
      { name: 'OnePlus 12', desc: 'OnePlus 12 featuring Snapdragon 8 Gen 3, 6.82-inch 2K LTPO AMOLED 120Hz, Hasselblad 50MP triple camera, 100W SUPERVOOC charging, and 5400mAh battery.', short: 'Performance flagship with Hasselblad camera', price: 179999, compare: 199999, stock: 40, tags: ['oneplus', 'flagship', 'hasselblad'], images: ['1591337676887-a217a6970a8a', '1553062407-98eeb64c6a62', '1598327105666-5b89351aff97', '1510557880182-3d4d3cba35a5', '1565849904461-04a58ad377e0'] },
      { name: 'Realme GT 5 Pro', desc: 'Realme GT 5 Pro with Snapdragon 8 Gen 3, 6.78-inch AMOLED 144Hz, Sony IMX890 50MP OIS camera, 100W charge, and 5400mAh battery.', short: 'Pro flagship with 144Hz display', price: 129999, compare: 149999, stock: 60, tags: ['realme', 'flagship', '144hz'], images: ['1565849904461-04a58ad377e0', '1592750475338-74b7b21085ab', '1574944985070-8f3ebc6b79d2', '1553062407-98eeb64c6a62', '1591337676887-a217a6970a8a'] },
      { name: 'Vivo V30 Pro', desc: 'Vivo V30 Pro with 6.78-inch AMOLED, Dimensity 8200, ZEISS 50MP triple camera with aura light, 80W FlashCharge, and slim 7.49mm design.', short: 'Slim camera phone with ZEISS optics', price: 89999, compare: 99999, stock: 70, tags: ['vivo', 'zeiss', 'slim'], images: ['1538481199705-c710c4e965fc', '1585060544812-6b45742d762f', '1511707171128-773957a9225f', '1598327105666-5b89351aff97', '1610945265064-0e34e5519bbf'] },
      { name: 'Samsung Galaxy A55', desc: 'Samsung Galaxy A55 5G with 6.6-inch Super AMOLED 120Hz, Exynos 1480, 50MP OIS triple camera, IP67 water resistance, and 5000mAh battery.', short: 'Mid-range Galaxy with IP67 rating', price: 69999, compare: 79999, stock: 120, tags: ['samsung', 'galaxy-a', 'mid-range'], images: ['1610945265064-0e34e5519bbf', '1598327105666-5b89351aff97', '1538481199705-c710c4e965fc', '1574944985070-8f3ebc6b79d2', '1605236453806-6ff36851218e'] },
      { name: 'iPhone SE 4', desc: 'Apple iPhone SE 4 with A16 Bionic chip, 6.1-inch OLED display, 48MP camera, Face ID, USB-C, 5G connectivity, and Apple Intelligence support.', short: 'Affordable iPhone with modern features', price: 149999, compare: 169999, stock: 80, tags: ['apple', 'iphone-se', 'affordable'], images: ['1553062407-98eeb64c6a62', '1510557880182-3d4d3cba35a5', '1591337676887-a217a6970a8a', '1592750475338-74b7b21085ab', '1565849904461-04a58ad377e0'] },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // 2. Laptops & Computers
  // ──────────────────────────────────────────────────────────────────
  {
    name: 'Laptops & Computers',
    image: img('1496181133206-80ce9b88a853'),
    description: 'Powerful laptops, desktops, and computing accessories.',
    products: [
      { name: 'HP Pavilion 15 Laptop', desc: 'HP Pavilion 15 with 12th Gen Intel Core i5, 8GB DDR4 RAM, 512GB SSD, 15.6-inch FHD IPS display, Intel Iris Xe Graphics.', short: 'Versatile 15.6-inch laptop for work and play', price: 139999, compare: 159999, stock: 30, tags: ['hp', 'laptop', 'intel'], images: ['1496181133206-80ce9b88a853', '1541807084-5c52b6b3adef', '1502877338535-766e1452684a', '1588872657578-7efd1f1555ed', '1517336714731-489689fd1ca8'] },
      { name: 'Lenovo IdeaPad Slim 3', desc: 'Lenovo IdeaPad Slim 3 with AMD Ryzen 5 7520U, 8GB RAM, 256GB SSD, 15.6-inch FHD. Thin design weighing just 1.62kg with 11 hours battery.', short: 'Ultra-slim everyday laptop', price: 99999, compare: 119999, stock: 40, tags: ['lenovo', 'slim', 'amd'], images: ['1502877338535-766e1452684a', '1496181133206-80ce9b88a853', '1541807084-5c52b6b3adef', '1588872657578-7efd1f1555ed', '1517336714731-489689fd1ca8'] },
      { name: 'Dell Inspiron 14 2-in-1', desc: 'Dell Inspiron 14 2-in-1 convertible with 13th Gen Intel Core i7, 16GB RAM, 512GB SSD, 14-inch FHD+ touch, 360° hinge with Active Pen support.', short: 'Convertible 2-in-1 touch laptop', price: 169999, compare: 199999, stock: 20, tags: ['dell', '2in1', 'touch'], images: ['1541807084-5c52b6b3adef', '1588872657578-7efd1f1555ed', '1496181133206-80ce9b88a853', '1502877338535-766e1452684a', '1517336714731-489689fd1ca8'] },
      { name: 'Apple MacBook Air M2', desc: 'MacBook Air with Apple M2 chip, 8-core CPU, 10-core GPU, 8GB unified memory, 256GB SSD, 13.6-inch Liquid Retina, MagSafe, 18hr battery.', short: 'Ultra-light Apple laptop with M2 chip', price: 299999, compare: 329999, stock: 15, tags: ['apple', 'macbook', 'm2'], images: ['1517336714731-489689fd1ca8', '1496181133206-80ce9b88a853', '1541807084-5c52b6b3adef', '1502877338535-766e1452684a', '1588872657578-7efd1f1555ed'] },
      { name: 'ASUS VivoBook 15', desc: 'ASUS VivoBook 15 with Intel Core i3-1215U, 8GB DDR4, 256GB SSD, 15.6-inch FHD, fingerprint reader. Military-grade durability.', short: 'Affordable everyday computing', price: 74999, compare: 89999, stock: 60, tags: ['asus', 'budget', 'laptop'], images: ['1588872657578-7efd1f1555ed', '1502877338535-766e1452684a', '1496181133206-80ce9b88a853', '1541807084-5c52b6b3adef', '1517336714731-489689fd1ca8'] },
      { name: 'Acer Nitro 5 Gaming', desc: 'Acer Nitro 5 gaming laptop with AMD Ryzen 7 7735HS, NVIDIA RTX 4060 8GB, 16GB DDR5, 512GB SSD, 15.6-inch FHD 144Hz IPS display.', short: 'RTX 4060 gaming laptop with 144Hz', price: 219999, compare: 249999, stock: 20, tags: ['acer', 'gaming', 'rtx'], images: ['1593642702821-c8da6771f0c6', '1496181133206-80ce9b88a853', '1541807084-5c52b6b3adef', '1588872657578-7efd1f1555ed', '1502877338535-766e1452684a'] },
      { name: 'Microsoft Surface Pro 9', desc: 'Microsoft Surface Pro 9 with 12th Gen Intel Core i5, 8GB RAM, 256GB SSD, 13-inch PixelSense Flow 120Hz, detachable keyboard, Windows 11.', short: 'Premium detachable 2-in-1 tablet', price: 249999, compare: 279999, stock: 15, tags: ['microsoft', 'surface', 'tablet'], images: ['1541807084-5c52b6b3adef', '1496181133206-80ce9b88a853', '1517336714731-489689fd1ca8', '1588872657578-7efd1f1555ed', '1593642702821-c8da6771f0c6'] },
      { name: 'HP EliteBook 840 G10', desc: 'HP EliteBook 840 G10 business laptop with Intel Core i7 vPro, 16GB RAM, 512GB SSD, 14-inch WUXGA, IR camera, fingerprint, MIL-STD-810H.', short: 'Enterprise-grade business laptop', price: 289999, compare: 329999, stock: 12, tags: ['hp', 'business', 'enterprise'], images: ['1502877338535-766e1452684a', '1588872657578-7efd1f1555ed', '1541807084-5c52b6b3adef', '1496181133206-80ce9b88a853', '1593642702821-c8da6771f0c6'] },
      { name: 'Lenovo ThinkPad X1 Carbon', desc: 'Lenovo ThinkPad X1 Carbon Gen 11 with Intel Core i7-1365U, 16GB LPDDR5, 512GB SSD, 14-inch 2.8K OLED, 1.12kg, Thunderbolt 4.', short: 'Ultra-premium business ultrabook', price: 349999, compare: 399999, stock: 10, tags: ['lenovo', 'thinkpad', 'ultrabook'], images: ['1517336714731-489689fd1ca8', '1541807084-5c52b6b3adef', '1502877338535-766e1452684a', '1593642702821-c8da6771f0c6', '1496181133206-80ce9b88a853'] },
      { name: 'Apple MacBook Pro 14 M3', desc: 'MacBook Pro 14-inch with M3 Pro chip, 18GB unified memory, 512GB SSD, Liquid Retina XDR, 17hr battery, HDMI, SD slot, MagSafe.', short: 'Pro-level MacBook with M3 Pro chip', price: 499999, compare: 549999, stock: 10, tags: ['apple', 'macbook-pro', 'm3'], images: ['1496181133206-80ce9b88a853', '1517336714731-489689fd1ca8', '1541807084-5c52b6b3adef', '1502877338535-766e1452684a', '1588872657578-7efd1f1555ed'] },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // 3. Men's Fashion
  // ──────────────────────────────────────────────────────────────────
  {
    name: "Men's Fashion",
    image: img('1490578474895-699cd4e2cf59'),
    description: 'Trendy clothing, shoes, and accessories for men.',
    products: [
      { name: 'Premium Cotton Polo Shirt', desc: 'Classic premium cotton polo shirt with ribbed collar and two-button placket. 100% Egyptian cotton for exceptional softness and breathability. Multiple colors.', short: 'Classic fit Egyptian cotton polo', price: 2499, compare: 3499, stock: 200, tags: ['polo', 'cotton', 'casual'], images: ['1549298916-b41d501d3772', '1596755094514-f87e34085b2c', '1618354691373-d851c5c3a990', '1586363104862-3a5e2ab60d99', '1507679799987-c73779587ccf'] },
      { name: 'Slim Fit Denim Jeans', desc: 'Modern slim fit denim jeans from premium stretch denim with comfortable mid-rise waist. Classic 5-pocket design with reinforced stitching.', short: 'Stretch denim slim fit jeans', price: 3999, compare: 5299, stock: 150, tags: ['jeans', 'denim', 'slim-fit'], images: ['1507679799987-c73779587ccf', '1582552938357-32b906df40cb', '1604176354204-9268737828e4', '1541099649105-f69ad21f3246', '1549298916-b41d501d3772'] },
      { name: 'Classic Leather Belt', desc: 'Genuine leather belt with brushed metal buckle. Full-grain cowhide leather with hand-stitched edges. Width 35mm for formal and casual wear.', short: 'Full-grain leather dress belt', price: 1499, compare: 2199, stock: 300, tags: ['belt', 'leather', 'accessory'], images: ['1624222247344-550fb60583dc', '1594223274512-ad4803739b7c', '1543163521-1bf539c55dd2', '1549298916-b41d501d3772', '1596755094514-f87e34085b2c'] },
      { name: 'Formal Oxford Shoes', desc: 'Handcrafted genuine leather Oxford shoes with Goodyear welt construction. Cushioned insole, leather sole, classic cap-toe for business and formal occasions.', short: 'Genuine leather cap-toe Oxfords', price: 8999, compare: 12999, stock: 80, tags: ['shoes', 'formal', 'leather'], images: ['1614252235316-8c857d38b5f4', '1504148455328-c376907d081c', '1416879595882-3373a0480b5b', '1507842217343-583bb7270b66', '1543163521-1bf539c55dd2'] },
      { name: 'Casual White Sneakers', desc: 'Modern white casual sneakers with premium synthetic upper, cushioned EVA midsole, minimalist clean design with perforated breathability, rubber outsole.', short: 'Clean white everyday sneakers', price: 4999, compare: 6499, stock: 120, tags: ['sneakers', 'white', 'casual'], images: ['1595950653106-6c9ebd614d3a', '1543508282-6319a3e2621f', '1460353581641-37baddab0fa2', '1549298916-b41d501d3772', '1507842217343-583bb7270b66'] },
      { name: 'Formal Dress Shirt', desc: 'Premium cotton formal dress shirt with spread collar, French cuffs, single-needle tailoring, wrinkle-resistant fabric, available in white, blue, and black.', short: 'Premium wrinkle-free dress shirt', price: 3499, compare: 4999, stock: 100, tags: ['shirt', 'formal', 'business'], images: ['1596755094514-f87e34085b2c', '1507679799987-c73779587ccf', '1618354691373-d851c5c3a990', '1586363104862-3a5e2ab60d99', '1604176354204-9268737828e4'] },
      { name: 'Aviator Sunglasses', desc: 'Classic aviator sunglasses with UV400 polarized lenses, metal frame with spring hinges, adjustable nose pads, scratch-resistant coating.', short: 'Polarized UV400 aviator sunglasses', price: 1999, compare: 2999, stock: 180, tags: ['sunglasses', 'aviator', 'uv400'], images: ['1511499767150-14b25e731b51', '1572635196237-14b3f281503f', '1473496169904-658ba7c44d8a', '1549298916-b41d501d3772', '1596755094514-f87e34085b2c'] },
      { name: 'Wool Blend Blazer', desc: 'Tailored wool blend blazer with notch lapel, two-button closure, patch pockets, and half-canvas construction. Perfect for office and smart casual occasions.', short: 'Tailored wool blend sport coat', price: 12999, compare: 17999, stock: 40, tags: ['blazer', 'wool', 'formal'], images: ['1507679799987-c73779587ccf', '1549298916-b41d501d3772', '1594223274512-ad4803739b7c', '1604176354204-9268737828e4', '1586363104862-3a5e2ab60d99'] },
      { name: 'Canvas Backpack', desc: 'Durable waxed canvas backpack with leather trim, padded laptop compartment (fits 15.6"), multiple organizer pockets, water-resistant coating, 25L capacity.', short: 'Water-resistant canvas laptop backpack', price: 5999, compare: 7999, stock: 70, tags: ['backpack', 'canvas', 'laptop'], images: ['1553062407-98eeb64c6a62', '1581605405669-fcdf81165afa', '1546938576-6e6a64f317cc', '1549298916-b41d501d3772', '1507679799987-c73779587ccf'] },
      { name: 'Chronograph Watch', desc: 'Stainless steel chronograph watch with Japanese quartz movement, sapphire crystal glass, genuine leather strap, 100m water resistance, luminous hands.', short: 'Japanese quartz chronograph watch', price: 9999, compare: 14999, stock: 50, tags: ['watch', 'chronograph', 'mens'], images: ['1523275335684-37898b6baf30', '1524592094714-0f0654e20314', '1522312346375-d1a52e2b99b3', '1507679799987-c73779587ccf', '1549298916-b41d501d3772'] },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // 4. Women's Fashion
  // ──────────────────────────────────────────────────────────────────
  {
    name: "Women's Fashion",
    image: img('1483985988355-763728e1935b'),
    description: 'Elegant clothing, shoes, and accessories for women.',
    products: [
      { name: 'Embroidered Lawn Kurti', desc: 'Beautiful embroidered lawn kurti with intricate thread work on front and sleeves. Lightweight summer fabric with side slits and mandarin collar.', short: 'Summer lawn kurti with embroidery', price: 2999, compare: 4499, stock: 180, tags: ['kurti', 'lawn', 'embroidered'], images: ['1524484485831-a92ffc0de03f', '1594633312681-425c7b97ccd1', '1545454675-3531b543be5d', '1571513722275-4b41940f54b8', '1483985988355-763728e1935b'] },
      { name: 'Designer Silk Dupatta', desc: 'Premium silk dupatta with hand-block printed geometric patterns. Soft luxurious feel with vibrant unfading colors. 2.5 meters with delicate tassel fringe.', short: 'Hand-block printed silk dupatta', price: 1999, compare: 2999, stock: 200, tags: ['dupatta', 'silk', 'designer'], images: ['1594633312681-425c7b97ccd1', '1524484485831-a92ffc0de03f', '1571513722275-4b41940f54b8', '1545454675-3531b543be5d', '1483985988355-763728e1935b'] },
      { name: 'Women Leather Handbag', desc: 'Elegant faux leather handbag with gold-tone hardware, multiple compartments, detachable shoulder strap. Spacious interior with zippered pocket.', short: 'Stylish everyday leather handbag', price: 5499, compare: 7999, stock: 90, tags: ['handbag', 'leather', 'fashion'], images: ['1584917865442-de89df76afd3', '1566150905458-1bf1fc113f0d', '1510915361894-db8b60106cb1', '1534438327276-14e5300c3a48', '1483985988355-763728e1935b'] },
      { name: 'Gold Plated Jewelry Set', desc: 'Stunning gold plated jewelry set with necklace, earrings, and bracelet. Cubic zirconia stones in floral design. Hypoallergenic tarnish-resistant.', short: 'Complete gold plated jewelry ensemble', price: 3999, compare: 5999, stock: 100, tags: ['jewelry', 'gold', 'set'], images: ['1489824904134-891ab64532f1', '1611085583191-a3b181a88401', '1599643477877-530eb83abc8e', '1602173574767-37ac01994b2a', '1524484485831-a92ffc0de03f'] },
      { name: 'Embroidered Khussas', desc: 'Traditional hand-embroidered khussas with intricate mirror work and thread embroidery. Soft leather sole with cushioned insole for all-day comfort.', short: 'Handcrafted traditional mirror work khussas', price: 1799, compare: 2499, stock: 150, tags: ['khussas', 'traditional', 'handmade'], images: ['1543163521-1bf539c55dd2', '1595341888016-a392ef81b7de', '1560343090-f0409e92791a', '1605289355680-75fb41239154', '1483985988355-763728e1935b'] },
      { name: 'Chiffon Printed Saree', desc: 'Gorgeous printed chiffon saree with contrasting blouse piece. Lightweight draping fabric, vibrant digital prints, running border with sequin work.', short: 'Printed chiffon saree with blouse', price: 4999, compare: 6999, stock: 80, tags: ['saree', 'chiffon', 'printed'], images: ['1571513722275-4b41940f54b8', '1524484485831-a92ffc0de03f', '1594633312681-425c7b97ccd1', '1545454675-3531b543be5d', '1489824904134-891ab64532f1'] },
      { name: 'Block Heel Sandals', desc: 'Strappy block heel sandals in pastel hues with cushioned footbed, adjustable ankle strap, faux leather upper, 3-inch block heel for stability.', short: 'Comfortable block heel party sandals', price: 3499, compare: 4999, stock: 100, tags: ['sandals', 'heels', 'party'], images: ['1543163521-1bf539c55dd2', '1595341888016-a392ef81b7de', '1560343090-f0409e92791a', '1605289355680-75fb41239154', '1543508282-6319a3e2621f'] },
      { name: 'Printed Lawn Suit 3pc', desc: 'Unstitched 3-piece printed lawn suit with shirt (2.5m), dyed cambric trouser (2.5m), and printed chiffon dupatta (2.5m). Premium summer collection.', short: '3-piece unstitched lawn suit set', price: 3999, compare: 5499, stock: 120, tags: ['lawn', '3piece', 'summer'], images: ['1524484485831-a92ffc0de03f', '1571513722275-4b41940f54b8', '1594633312681-425c7b97ccd1', '1483985988355-763728e1935b', '1545454675-3531b543be5d'] },
      { name: 'Pearl Stud Earrings', desc: 'Elegant freshwater pearl stud earrings set in sterling silver with rhodium plating. AAA grade 8mm round pearls, push-back closure. Gift boxed.', short: 'Sterling silver freshwater pearl studs', price: 2499, compare: 3499, stock: 140, tags: ['earrings', 'pearl', 'silver'], images: ['1611085583191-a3b181a88401', '1599643477877-530eb83abc8e', '1602173574767-37ac01994b2a', '1489824904134-891ab64532f1', '1524484485831-a92ffc0de03f'] },
      { name: 'Women Crossbody Bag', desc: 'Compact crossbody bag with chain strap, quilted pattern, magnetic snap closure, interior card slots, adjustable strap. Fits phone and essentials.', short: 'Quilted chain strap crossbody bag', price: 2999, compare: 4499, stock: 110, tags: ['crossbody', 'bag', 'quilted'], images: ['1566150905458-1bf1fc113f0d', '1584917865442-de89df76afd3', '1510915361894-db8b60106cb1', '1534438327276-14e5300c3a48', '1483985988355-763728e1935b'] },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // 5. Electronics & Gadgets
  // ──────────────────────────────────────────────────────────────────
  {
    name: 'Electronics & Gadgets',
    image: img('1518770660439-4636190af475'),
    description: 'Smart gadgets, wearables, and electronic accessories.',
    products: [
      { name: 'Smart Watch Ultra', desc: 'Smartwatch with 1.85-inch AMOLED, heart rate, SpO2, GPS, 100+ sports modes, 7-day battery. IP68 water resistant with Always-On Display.', short: 'Feature-rich smartwatch with AMOLED display', price: 12999, compare: 18999, stock: 80, tags: ['smartwatch', 'fitness', 'wearable'], images: ['1523275335684-37898b6baf30', '1579586337278-3befd40fd17a', '1460353581641-37baddab0fa2', '1510557880182-3d4d3cba35a5', '1524592094714-0f0654e20314'] },
      { name: 'TWS Earbuds Pro', desc: 'True wireless earbuds with ANC, 12mm dynamic drivers, Bluetooth 5.3, touch controls, 36hr total playtime with charging case. IPX5 sweat resistant.', short: 'ANC wireless earbuds with 36hr battery', price: 7999, compare: 11999, stock: 120, tags: ['earbuds', 'tws', 'anc'], images: ['1590658268037-6bf12165a8df', '1606220588913-b3aacb4d2f46', '1524592094714-0f0654e20314', '1505740420928-5e560c06d30e', '1523275335684-37898b6baf30'] },
      { name: 'Portable Bluetooth Speaker', desc: 'Compact Bluetooth speaker with 20W output, 360° surround sound, IPX7 waterproof, 12hr battery, built-in microphone for calls.', short: 'Waterproof 20W portable speaker', price: 5999, compare: 8999, stock: 100, tags: ['speaker', 'bluetooth', 'portable'], images: ['1608043152269-423dbba4e7e1', '1545454675-3531b543be5d', '1513364776144-60967b0f800f', '1507003211169-0a1dd7228f2d', '1518770660439-4636190af475'] },
      { name: 'Power Bank 20000mAh', desc: 'High-capacity 20000mAh power bank with dual USB-A and USB-C. 22.5W fast charge and PD 20W output. LED digital battery display.', short: 'Fast-charging 20000mAh battery pack', price: 3499, compare: 4999, stock: 200, tags: ['powerbank', 'charging', 'portable'], images: ['1609091839311-d5365f9ff1c5', '1583863788434-e58a36330cf0', '1525201548942-d8732f6617a0', '1618384887929-16ec33fab9ef', '1518770660439-4636190af475'] },
      { name: 'Wireless Charging Pad', desc: 'Qi-certified 15W wireless charger, ultra-slim, LED indicator, anti-slip silicone surface. Compatible with all Qi-enabled devices.', short: 'Universal 15W Qi wireless charger', price: 1999, compare: 2999, stock: 250, tags: ['charger', 'wireless', 'qi'], images: ['1618384887929-16ec33fab9ef', '1609091839311-d5365f9ff1c5', '1583863788434-e58a36330cf0', '1525201548942-d8732f6617a0', '1518770660439-4636190af475'] },
      { name: 'Mechanical Keyboard RGB', desc: 'Full-size mechanical keyboard with hot-swappable switches, per-key RGB backlighting, PBT keycaps, aluminum frame, USB-C detachable cable.', short: 'Hot-swap RGB mechanical keyboard', price: 8999, compare: 12999, stock: 60, tags: ['keyboard', 'mechanical', 'rgb'], images: ['1541140532-3a6a6031189e', '1518770660439-4636190af475', '1583863788434-e58a36330cf0', '1590658268037-6bf12165a8df', '1505740420928-5e560c06d30e'] },
      { name: 'Wireless Gaming Mouse', desc: 'Lightweight wireless gaming mouse with 25K DPI optical sensor, 70hr battery, 6 programmable buttons, PTFE skates, 58g ultralight design.', short: 'Ultralight 25K DPI wireless gaming mouse', price: 5999, compare: 7999, stock: 80, tags: ['mouse', 'gaming', 'wireless'], images: ['1527814050087-3793815479db', '1541140532-3a6a6031189e', '1518770660439-4636190af475', '1583863788434-e58a36330cf0', '1505740420928-5e560c06d30e'] },
      { name: 'USB-C Hub 7-in-1', desc: '7-in-1 USB-C hub with 4K HDMI, 2x USB 3.0, SD/TF card reader, USB-C PD 100W passthrough, aluminum body. Compatible with MacBook and laptops.', short: 'Multi-port USB-C docking hub', price: 3999, compare: 5499, stock: 100, tags: ['usb-hub', 'usb-c', 'adapter'], images: ['1583863788434-e58a36330cf0', '1518770660439-4636190af475', '1609091839311-d5365f9ff1c5', '1541140532-3a6a6031189e', '1525201548942-d8732f6617a0'] },
      { name: 'Webcam 2K HD', desc: 'Full HD 2K webcam with auto-focus, dual stereo microphones with noise cancellation, privacy cover, adjustable clip, plug-and-play USB.', short: '2K auto-focus webcam with dual mics', price: 4999, compare: 6999, stock: 70, tags: ['webcam', '2k', 'streaming'], images: ['1518770660439-4636190af475', '1583863788434-e58a36330cf0', '1541140532-3a6a6031189e', '1609091839311-d5365f9ff1c5', '1505740420928-5e560c06d30e'] },
      { name: 'Portable Monitor 15.6"', desc: '15.6-inch portable USB-C monitor with 1080p IPS, 100% sRGB, built-in speakers, USB-C and mini HDMI input, magnetic smart cover stand.', short: 'Portable 1080p USB-C travel monitor', price: 29999, compare: 39999, stock: 25, tags: ['monitor', 'portable', 'usb-c'], images: ['1527443224154-c4a3942d3acf', '1518770660439-4636190af475', '1541140532-3a6a6031189e', '1583863788434-e58a36330cf0', '1609091839311-d5365f9ff1c5'] },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // 6. Home & Kitchen
  // ──────────────────────────────────────────────────────────────────
  {
    name: 'Home & Kitchen',
    image: img('1556909114-f6e7ad7d3136'),
    description: 'Kitchen appliances, cookware, and home essentials.',
    products: [
      { name: 'Non-Stick Cookware Set 10pc', desc: '10-piece non-stick cookware set with frying pans, saucepans, Dutch oven, and utensils. PFOA-free ceramic coating. All cooktops including induction.', short: '10-piece ceramic non-stick set', price: 12999, compare: 18999, stock: 40, tags: ['cookware', 'non-stick', 'kitchen'], images: ['1556909114-f6e7ad7d3136', '1584568694244-14fbdf83bd30', '1556910103-1c02745aae4d', '1466637574441-749b8f19452f', '1556909172-54557c7e4fb7'] },
      { name: 'Electric Kettle 1.8L', desc: 'Stainless steel electric kettle 1.8L, auto shut-off, boil-dry protection, 360° base. Boils in under 4 minutes. Cool-touch handle.', short: 'Fast-boil stainless steel kettle', price: 3999, compare: 5499, stock: 80, tags: ['kettle', 'electric', 'steel'], images: ['1584568694244-14fbdf83bd30', '1556909114-f6e7ad7d3136', '1556910103-1c02745aae4d', '1466637574441-749b8f19452f', '1556909172-54557c7e4fb7'] },
      { name: 'Air Fryer 5.5L Digital', desc: 'Digital air fryer 5.5L with 8 presets, 360° rapid air, non-stick basket, touch screen. Cooks with 85% less oil for healthier meals.', short: 'Digital 5.5L rapid air fryer', price: 14999, compare: 19999, stock: 35, tags: ['air-fryer', 'digital', 'healthy'], images: ['1550572017-edd951b55104', '1556909114-f6e7ad7d3136', '1584568694244-14fbdf83bd30', '1516035069371-29a1b244cc32', '1556910103-1c02745aae4d'] },
      { name: 'Microwave Oven 25L', desc: '25L microwave with grill, 10 power levels, auto-cook menus, child lock, easy-clean interior, digital touch controls.', short: 'Digital microwave with grill function', price: 19999, compare: 25999, stock: 25, tags: ['microwave', 'oven', 'appliance'], images: ['1531346680769-a1d79b57de5c', '1556909114-f6e7ad7d3136', '1584568694244-14fbdf83bd30', '1556910103-1c02745aae4d', '1466637574441-749b8f19452f'] },
      { name: 'Hand Blender 4-in-1', desc: 'Versatile 4-in-1 hand blender with blending arm, whisk, chopper, measuring cup. 800W motor with variable speed and turbo.', short: 'Multi-function 800W hand blender', price: 6999, compare: 9499, stock: 60, tags: ['blender', 'hand', 'kitchen'], images: ['1516035069371-29a1b244cc32', '1556909114-f6e7ad7d3136', '1584568694244-14fbdf83bd30', '1550572017-edd951b55104', '1531346680769-a1d79b57de5c'] },
      { name: 'Coffee Maker Espresso', desc: 'Semi-automatic espresso machine with 15-bar Italian pump, steam wand for frothing, removable water tank 1.5L, stainless steel boiler.', short: '15-bar espresso machine with frother', price: 24999, compare: 32999, stock: 20, tags: ['coffee', 'espresso', 'machine'], images: ['1556909172-54557c7e4fb7', '1556909114-f6e7ad7d3136', '1516035069371-29a1b244cc32', '1556910103-1c02745aae4d', '1550572017-edd951b55104'] },
      { name: 'Food Processor 12-Cup', desc: '12-cup food processor with 800W motor, stainless steel S-blade, shredding and slicing discs, dough blade, BPA-free work bowl.', short: '800W food processor with multiple blades', price: 11999, compare: 15999, stock: 30, tags: ['food-processor', 'kitchen', 'appliance'], images: ['1556910103-1c02745aae4d', '1556909114-f6e7ad7d3136', '1516035069371-29a1b244cc32', '1584568694244-14fbdf83bd30', '1550572017-edd951b55104'] },
      { name: 'Stainless Steel Knife Set', desc: '8-piece professional knife set with wooden block. Forged high-carbon stainless steel, full tang design, ergonomic pakkawood handles.', short: '8-piece forged knife set with block', price: 7999, compare: 11999, stock: 50, tags: ['knives', 'kitchen', 'steel'], images: ['1466637574441-749b8f19452f', '1556909114-f6e7ad7d3136', '1556910103-1c02745aae4d', '1584568694244-14fbdf83bd30', '1556909172-54557c7e4fb7'] },
      { name: 'Electric Rice Cooker 5L', desc: '5L digital rice cooker with fuzzy logic, 12 cooking presets, non-stick inner pot, keep-warm function, delay timer, steaming basket included.', short: 'Smart 5L rice cooker with 12 presets', price: 8999, compare: 12999, stock: 45, tags: ['rice-cooker', 'electric', 'kitchen'], images: ['1556909114-f6e7ad7d3136', '1531346680769-a1d79b57de5c', '1516035069371-29a1b244cc32', '1584568694244-14fbdf83bd30', '1556910103-1c02745aae4d'] },
      { name: 'Water Purifier RO', desc: 'RO+UV+UF water purifier with 8-stage purification, 10L storage tank, TDS controller, smart indicator for filter replacement, wall-mounted.', short: '8-stage RO water purifier 10L', price: 22999, compare: 29999, stock: 20, tags: ['purifier', 'water', 'ro'], images: ['1584568694244-14fbdf83bd30', '1556909114-f6e7ad7d3136', '1531346680769-a1d79b57de5c', '1550572017-edd951b55104', '1556909172-54557c7e4fb7'] },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // 7. Beauty & Personal Care
  // ──────────────────────────────────────────────────────────────────
  {
    name: 'Beauty & Personal Care',
    image: img('1522335789203-aabd1fc54bc9'),
    description: 'Skincare, makeup, fragrances, and grooming essentials.',
    products: [
      { name: 'Vitamin C Face Serum', desc: '20% Vitamin C serum with hyaluronic acid and vitamin E. Brightens tone, reduces dark spots, boosts collagen. All skin types.', short: '20% Vitamin C brightening serum', price: 1499, compare: 2499, stock: 200, tags: ['skincare', 'serum', 'vitamin-c'], images: ['1556228578-8c89e6adf883', '1596462502278-27bfdc403348', '1571781926291-c477ebfd024b', '1515488042361-ee00e0ddd4e4', '1522335789203-aabd1fc54bc9'] },
      { name: 'Complete Makeup Kit', desc: '24-piece professional makeup kit with foundation palette, eyeshadow, lipstick set, mascara, brushes, and sponge. Long-lasting rich pigmentation.', short: '24-piece professional makeup kit', price: 5999, compare: 8999, stock: 50, tags: ['makeup', 'kit', 'cosmetics'], images: ['1512496015851-a90fb38ba796', '1596462502278-27bfdc403348', '1522335789203-aabd1fc54bc9', '1571781926291-c477ebfd024b', '1556228578-8c89e6adf883'] },
      { name: 'Hair Straightener Ceramic', desc: 'Professional ceramic straightener, adjustable 150-230°C, floating plates, negative ion tech for frizz control, auto shut-off.', short: 'Pro ceramic flat iron with ion tech', price: 3999, compare: 5999, stock: 70, tags: ['hair', 'straightener', 'styling'], images: ['1522337360788-8b13dee7a37e', '1560750588-73207b1ef5b8', '1596462502278-27bfdc403348', '1512496015851-a90fb38ba796', '1522335789203-aabd1fc54bc9'] },
      { name: 'Men Perfume Gift Set', desc: 'Luxury 3-piece men EDT gift set (30ml each): fresh citrus, woody oriental, and aromatic fougère scents. Elegant gift packaging.', short: 'Three-piece premium fragrance collection', price: 4999, compare: 7999, stock: 60, tags: ['perfume', 'men', 'gift-set'], images: ['1523293182086-7651a899d37f', '1540518614846-7eded433c457', '1563170351-be82bc888aa4', '1507003211169-0a1dd7228f2d', '1522335789203-aabd1fc54bc9'] },
      { name: 'Electric Toothbrush Sonic', desc: 'Sonic electric toothbrush with 5 modes, 40000 VPM, 2-min timer, IPX7 waterproof. Includes 3 replacement heads and travel case.', short: 'Smart sonic toothbrush with 5 modes', price: 2999, compare: 4499, stock: 90, tags: ['toothbrush', 'sonic', 'electric'], images: ['1570172619644-dfd03ed5d881', '1507003211169-0a1dd7228f2d', '1523293182086-7651a899d37f', '1522335789203-aabd1fc54bc9', '1556228578-8c89e6adf883'] },
      { name: 'Women Perfume Floral', desc: 'Premium floral eau de parfum for women, 100ml. Top notes of rose and peony, heart of jasmine, base of musk and sandalwood. Long-lasting 10+ hours.', short: 'Floral eau de parfum 100ml', price: 3999, compare: 5999, stock: 70, tags: ['perfume', 'women', 'floral'], images: ['1563170351-be82bc888aa4', '1540518614846-7eded433c457', '1522335789203-aabd1fc54bc9', '1571781926291-c477ebfd024b', '1596462502278-27bfdc403348'] },
      { name: 'Retinol Night Cream', desc: 'Anti-aging retinol night cream with peptides and niacinamide. Reduces fine lines, improves firmness, evens skin texture. 50ml jar.', short: 'Anti-aging retinol night cream 50ml', price: 1999, compare: 3499, stock: 120, tags: ['skincare', 'retinol', 'anti-aging'], images: ['1556228578-8c89e6adf883', '1571781926291-c477ebfd024b', '1596462502278-27bfdc403348', '1515488042361-ee00e0ddd4e4', '1522335789203-aabd1fc54bc9'] },
      { name: 'Hair Dryer Professional', desc: 'Professional ionic hair dryer 2200W with 3 heat/2 speed settings, cool shot button, concentrator and diffuser nozzles, salon-quality results.', short: '2200W ionic hair dryer with diffuser', price: 4499, compare: 6499, stock: 55, tags: ['hair-dryer', 'ionic', 'professional'], images: ['1560750588-73207b1ef5b8', '1522337360788-8b13dee7a37e', '1522335789203-aabd1fc54bc9', '1512496015851-a90fb38ba796', '1596462502278-27bfdc403348'] },
      { name: 'Sunscreen SPF 50+', desc: 'Broad spectrum SPF 50+ PA++++ sunscreen lotion, lightweight non-greasy formula, water-resistant 80min, suitable for face and body. 100ml.', short: 'SPF 50+ lightweight sunscreen 100ml', price: 999, compare: 1499, stock: 250, tags: ['sunscreen', 'spf50', 'skincare'], images: ['1596462502278-27bfdc403348', '1556228578-8c89e6adf883', '1571781926291-c477ebfd024b', '1522335789203-aabd1fc54bc9', '1515488042361-ee00e0ddd4e4'] },
      { name: 'Beard Grooming Kit', desc: 'Complete beard grooming kit with beard oil, balm, wooden comb, boar bristle brush, scissors, and shaping tool. Natural organic ingredients.', short: '6-piece premium beard grooming kit', price: 2499, compare: 3999, stock: 80, tags: ['beard', 'grooming', 'men'], images: ['1507003211169-0a1dd7228f2d', '1523293182086-7651a899d37f', '1540518614846-7eded433c457', '1522335789203-aabd1fc54bc9', '1570172619644-dfd03ed5d881'] },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // 8. Sports & Fitness
  // ──────────────────────────────────────────────────────────────────
  {
    name: 'Sports & Fitness',
    image: img('1517836357463-d25dfeac3438'),
    description: 'Sports equipment, gym gear, and fitness accessories.',
    products: [
      { name: 'Adjustable Dumbbell Set 20kg', desc: 'Premium adjustable dumbbell set 20kg total. Chrome bars, spin-lock collars, assorted weight plates 1.25-2.5kg. Rubber grip handles.', short: '20kg adjustable chrome dumbbell set', price: 7999, compare: 10999, stock: 40, tags: ['dumbbell', 'gym', 'weights'], images: ['1534438327276-14e5300c3a48', '1517836357463-d25dfeac3438', '1576678927484-cc907957088c', '1517336714731-489689fd1ca8', '1544367567-0f2fcb009e0b'] },
      { name: 'Yoga Mat Premium 8mm', desc: 'Extra thick 8mm yoga mat with alignment lines. Non-slip TPE, eco-friendly, chemical-free. Includes carrying strap. 183x61cm.', short: 'Eco-friendly non-slip yoga mat', price: 2499, compare: 3999, stock: 120, tags: ['yoga', 'mat', 'fitness'], images: ['1544367567-0f2fcb009e0b', '1495446815901-a7297e633e8d', '1517836357463-d25dfeac3438', '1576678927484-cc907957088c', '1534438327276-14e5300c3a48'] },
      { name: 'Running Shoes Pro', desc: 'High-performance running shoes with responsive cushioning foam, breathable engineered mesh upper, durable rubber outsole. Weight 260g.', short: 'Lightweight cushioned running shoes', price: 6999, compare: 9999, stock: 80, tags: ['running', 'shoes', 'sports'], images: ['1507842217343-583bb7270b66', '1460353581641-37baddab0fa2', '1539185441755-769473a23570', '1551107696-a4b0c5a0d9a2', '1517836357463-d25dfeac3438'] },
      { name: 'Resistance Bands Set', desc: '5-band set (10-50lb), 2 handles, door anchor, ankle straps, carrying bag. Perfect for home workouts and physical therapy.', short: '5-band resistance training set', price: 1999, compare: 3499, stock: 150, tags: ['resistance', 'bands', 'workout'], images: ['1598289431512-b97b0917affc', '1576678927484-cc907957088c', '1517836357463-d25dfeac3438', '1534438327276-14e5300c3a48', '1544367567-0f2fcb009e0b'] },
      { name: 'Cricket Bat English Willow', desc: 'Grade A English Willow cricket bat, hand-pressed with traditional craftsmanship. Short handle, Singapore cane grip. 2.7-2.9 lbs.', short: 'Grade A English Willow cricket bat', price: 14999, compare: 19999, stock: 25, tags: ['cricket', 'bat', 'sports'], images: ['1531415074968-036ba1b575da', '1540747913346-19e32dc3e97e', '1587280501635-68a0e82cd5ff', '1624526267942-ab0ff8a3e972', '1517836357463-d25dfeac3438'] },
      { name: 'Treadmill Foldable', desc: 'Foldable motorized treadmill with 2.5HP motor, 0-12km/h speed, 12 preset programs, LCD display, Bluetooth speaker, heart rate grips.', short: '2.5HP foldable home treadmill', price: 54999, compare: 69999, stock: 10, tags: ['treadmill', 'cardio', 'foldable'], images: ['1517836357463-d25dfeac3438', '1576678927484-cc907957088c', '1534438327276-14e5300c3a48', '1544367567-0f2fcb009e0b', '1598289431512-b97b0917affc'] },
      { name: 'Boxing Gloves 12oz', desc: 'Professional boxing gloves 12oz with multi-layered foam padding, full wrist wrap support, moisture-wicking inner lining, reinforced stitching.', short: 'Pro 12oz boxing training gloves', price: 3499, compare: 4999, stock: 60, tags: ['boxing', 'gloves', 'training'], images: ['1576678927484-cc907957088c', '1517836357463-d25dfeac3438', '1534438327276-14e5300c3a48', '1598289431512-b97b0917affc', '1544367567-0f2fcb009e0b'] },
      { name: 'Football Nike Replica', desc: 'FIFA Quality match replica football, size 5, machine-stitched TPU cover, textured surface for better grip and control, butyl bladder.', short: 'Size 5 FIFA Quality match football', price: 2999, compare: 3999, stock: 100, tags: ['football', 'nike', 'sports'], images: ['1551958219-acbc608c6377', '1517836357463-d25dfeac3438', '1576678927484-cc907957088c', '1540747913346-19e32dc3e97e', '1534438327276-14e5300c3a48'] },
      { name: 'Jump Rope Speed', desc: 'Adjustable speed jump rope with ball-bearing swivel, 3m steel cable with PVC coating, ergonomic foam handles, suitable for all heights.', short: 'Ball-bearing speed skip rope', price: 799, compare: 1299, stock: 200, tags: ['jump-rope', 'cardio', 'fitness'], images: ['1534438327276-14e5300c3a48', '1517836357463-d25dfeac3438', '1576678927484-cc907957088c', '1598289431512-b97b0917affc', '1544367567-0f2fcb009e0b'] },
      { name: 'Gym Bag Duffle', desc: 'Large gym duffle bag with wet/dry compartment, shoe pocket, water bottle holder, adjustable shoulder strap, 40L capacity. Water-resistant polyester.', short: '40L gym duffle with shoe compartment', price: 2999, compare: 4499, stock: 80, tags: ['gym-bag', 'duffle', 'sports'], images: ['1553062407-98eeb64c6a62', '1517836357463-d25dfeac3438', '1534438327276-14e5300c3a48', '1576678927484-cc907957088c', '1544367567-0f2fcb009e0b'] },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // 9. Baby & Kids
  // ──────────────────────────────────────────────────────────────────
  {
    name: 'Baby & Kids',
    image: img('1515488042361-ee00e0ddd4e4'),
    description: 'Baby essentials, kids clothing, toys, and nursery items.',
    products: [
      { name: 'Baby Stroller Foldable', desc: 'Lightweight foldable stroller with reclining seat, 5-point harness, UV canopy, one-hand fold, storage basket. 0-36 months.', short: 'Compact foldable stroller with canopy', price: 14999, compare: 21999, stock: 30, tags: ['stroller', 'baby', 'foldable'], images: ['1515488042361-ee00e0ddd4e4', '1555252333-9f8e92e65df9', '1541099649105-f69ad21f3246', '1522771930-78848d9293e8', '1533139502658-0198f920d8e8'] },
      { name: 'Kids Building Blocks 200pc', desc: '200-piece building blocks in various shapes and colors. BPA-free non-toxic ABS plastic. Promotes creativity and motor skills. Ages 3+.', short: '200pc colorful building blocks for 3+', price: 2999, compare: 4499, stock: 100, tags: ['blocks', 'educational', 'toys'], images: ['1541099649105-f69ad21f3246', '1515488042361-ee00e0ddd4e4', '1555252333-9f8e92e65df9', '1533139502658-0198f920d8e8', '1522771930-78848d9293e8'] },
      { name: 'Baby Diaper Bag Backpack', desc: 'Premium diaper bag backpack with insulated bottle pockets, changing pad, stroller straps, USB port, waterproof 25L capacity.', short: 'Multi-pocket waterproof diaper backpack', price: 3999, compare: 5999, stock: 70, tags: ['diaper-bag', 'backpack', 'baby'], images: ['1555252333-9f8e92e65df9', '1541099649105-f69ad21f3246', '1515488042361-ee00e0ddd4e4', '1522771930-78848d9293e8', '1533139502658-0198f920d8e8'] },
      { name: 'Soft Cotton Baby Romper Set', desc: 'Set of 3 organic cotton baby rompers with snap closures. Adorable printed designs, gentle on sensitive skin. 0-24 months.', short: '3-pack organic cotton romper set', price: 1999, compare: 2999, stock: 200, tags: ['romper', 'cotton', 'baby-clothes'], images: ['1522771930-78848d9293e8', '1515488042361-ee00e0ddd4e4', '1555252333-9f8e92e65df9', '1541099649105-f69ad21f3246', '1533139502658-0198f920d8e8'] },
      { name: 'RC Car Off-Road Monster', desc: 'RC off-road monster truck with 2.4GHz, 4WD, dual motors, rechargeable battery, and high-speed suspension. 25km/h. Ages 6+.', short: 'Fast 4WD RC monster truck', price: 4999, compare: 6999, stock: 50, tags: ['rc-car', 'toy', 'kids'], images: ['1533139502658-0198f920d8e8', '1541099649105-f69ad21f3246', '1555252333-9f8e92e65df9', '1515488042361-ee00e0ddd4e4', '1522771930-78848d9293e8'] },
      { name: 'Baby High Chair Portable', desc: 'Portable folding high chair with 5-point harness, removable tray, 3 height adjustments, washable seat pad, compact fold for travel.', short: 'Foldable portable baby high chair', price: 8999, compare: 12999, stock: 35, tags: ['high-chair', 'baby', 'portable'], images: ['1515488042361-ee00e0ddd4e4', '1522771930-78848d9293e8', '1555252333-9f8e92e65df9', '1541099649105-f69ad21f3246', '1533139502658-0198f920d8e8'] },
      { name: 'Kids Tablet Educational', desc: '7-inch kids tablet with parental controls, 32GB storage, shockproof case, pre-loaded educational apps, games, and e-books. WiFi. Ages 3-12.', short: '7-inch shockproof kids learning tablet', price: 11999, compare: 15999, stock: 40, tags: ['tablet', 'kids', 'educational'], images: ['1541099649105-f69ad21f3246', '1533139502658-0198f920d8e8', '1515488042361-ee00e0ddd4e4', '1555252333-9f8e92e65df9', '1522771930-78848d9293e8'] },
      { name: 'Baby Bottle Set 5pc', desc: '5-piece anti-colic baby bottle set with slow-flow nipples, BPA-free PP material, easy-grip shape, includes cleaning brush. 150ml and 250ml.', short: '5-piece anti-colic bottle starter set', price: 1499, compare: 2199, stock: 150, tags: ['bottles', 'feeding', 'baby'], images: ['1522771930-78848d9293e8', '1515488042361-ee00e0ddd4e4', '1541099649105-f69ad21f3246', '1555252333-9f8e92e65df9', '1533139502658-0198f920d8e8'] },
      { name: 'Stuffed Animal Teddy Bear', desc: 'Soft plush teddy bear 60cm, hypoallergenic polyester fill, embroidered eyes for safety, machine washable. Perfect cuddle companion.', short: '60cm soft plush teddy bear', price: 1799, compare: 2499, stock: 100, tags: ['teddy', 'plush', 'toy'], images: ['1555252333-9f8e92e65df9', '1533139502658-0198f920d8e8', '1541099649105-f69ad21f3246', '1515488042361-ee00e0ddd4e4', '1522771930-78848d9293e8'] },
      { name: 'Kids Bicycle 16 inch', desc: 'Kids bicycle 16-inch with training wheels, chain guard, adjustable seat height, front V-brake and rear coaster brake. Ages 4-7.', short: '16-inch kids bike with training wheels', price: 12999, compare: 16999, stock: 25, tags: ['bicycle', 'kids', 'outdoor'], images: ['1533139502658-0198f920d8e8', '1522771930-78848d9293e8', '1515488042361-ee00e0ddd4e4', '1555252333-9f8e92e65df9', '1541099649105-f69ad21f3246'] },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // 10. Grocery & Food
  // ──────────────────────────────────────────────────────────────────
  {
    name: 'Grocery & Food',
    image: img('1542838132-92c53300491e'),
    description: 'Everyday groceries, snacks, beverages, and pantry staples.',
    products: [
      { name: 'Premium Basmati Rice 5kg', desc: 'Extra-long grain premium basmati rice aged 2 years. Aromatic and fluffy. Sourced from Pakistan. Each grain elongates 2.5x when cooked.', short: 'Aged extra-long grain basmati rice', price: 1499, compare: 1899, stock: 300, tags: ['rice', 'basmati', 'staple'], images: ['1586201375761-83865001e31c', '1542838132-92c53300491e', '1563636619-e9143da7973b', '1574323347407-f5e1ad6d020b', '1558642452-9d2a7deb7f62'] },
      { name: 'Pure Honey Organic 1kg', desc: 'Raw organic honey from wildflower meadows. Unprocessed, naturally crystallized. Rich in antioxidants. No added sugar or artificial additives.', short: 'Raw wildflower organic honey', price: 1999, compare: 2799, stock: 150, tags: ['honey', 'organic', 'natural'], images: ['1587049352846-4a222e784d38', '1558642452-9d2a7deb7f62', '1563636619-e9143da7973b', '1542838132-92c53300491e', '1574323347407-f5e1ad6d020b'] },
      { name: 'Dry Fruits Mix Box 500g', desc: 'Premium mixed dry fruits: almonds, cashews, walnuts, pistachios, raisins. Airtight packed for freshness. No salt or seasoning.', short: '500g premium mixed dry fruits', price: 2499, compare: 3299, stock: 100, tags: ['dry-fruits', 'nuts', 'healthy'], images: ['1563636619-e9143da7973b', '1542838132-92c53300491e', '1587049352846-4a222e784d38', '1558642452-9d2a7deb7f62', '1574323347407-f5e1ad6d020b'] },
      { name: 'Green Tea Collection 50 Bags', desc: '50 tea bags in 5 flavors: classic green, jasmine, mint, lemon, ginger. Rich in antioxidants. Premium whole leaf pyramid bags.', short: '50 premium green tea bags, 5 flavors', price: 999, compare: 1499, stock: 250, tags: ['tea', 'green-tea', 'beverage'], images: ['1556679343-c7306c1976bc', '1563636619-e9143da7973b', '1542838132-92c53300491e', '1558642452-9d2a7deb7f62', '1587049352846-4a222e784d38'] },
      { name: 'Extra Virgin Olive Oil 1L', desc: 'Cold-pressed extra virgin olive oil imported from Spain. First harvest, low acidity. Rich golden color and fruity flavor.', short: 'Spanish cold-pressed olive oil 1L', price: 2999, compare: 3999, stock: 80, tags: ['olive-oil', 'cooking', 'imported'], images: ['1474979266404-7571df06ee25', '1563636619-e9143da7973b', '1542838132-92c53300491e', '1558642452-9d2a7deb7f62', '1587049352846-4a222e784d38'] },
      { name: 'Dark Chocolate 70% Cocoa', desc: 'Premium Belgian dark chocolate bars (pack of 4), 70% cocoa, smooth rich flavor, fair trade certified, no artificial flavors. 100g each.', short: '4-pack premium 70% dark chocolate', price: 1299, compare: 1799, stock: 120, tags: ['chocolate', 'dark', 'belgian'], images: ['1542838132-92c53300491e', '1563636619-e9143da7973b', '1558642452-9d2a7deb7f62', '1587049352846-4a222e784d38', '1574323347407-f5e1ad6d020b'] },
      { name: 'Protein Granola 750g', desc: 'High-protein crunchy granola with oats, quinoa, almonds, chia seeds, and honey. 15g protein per serving, no refined sugar. 750g pack.', short: 'High-protein oat and quinoa granola', price: 1499, compare: 1999, stock: 90, tags: ['granola', 'protein', 'breakfast'], images: ['1558642452-9d2a7deb7f62', '1574323347407-f5e1ad6d020b', '1563636619-e9143da7973b', '1542838132-92c53300491e', '1586201375761-83865001e31c'] },
      { name: 'Peanut Butter Crunchy 1kg', desc: 'All-natural crunchy peanut butter with roasted peanuts. No palm oil, no added sugar, no preservatives. High protein 26g per serving. 1kg jar.', short: 'Natural crunchy peanut butter 1kg', price: 999, compare: 1399, stock: 160, tags: ['peanut-butter', 'protein', 'natural'], images: ['1587049352846-4a222e784d38', '1542838132-92c53300491e', '1574323347407-f5e1ad6d020b', '1558642452-9d2a7deb7f62', '1563636619-e9143da7973b'] },
      { name: 'Instant Coffee Jar 200g', desc: 'Premium freeze-dried instant coffee 200g. 100% Arabica beans, rich aroma and smooth taste. Makes approximately 100 cups.', short: 'Freeze-dried Arabica instant coffee', price: 1299, compare: 1699, stock: 130, tags: ['coffee', 'instant', 'arabica'], images: ['1556679343-c7306c1976bc', '1542838132-92c53300491e', '1558642452-9d2a7deb7f62', '1563636619-e9143da7973b', '1587049352846-4a222e784d38'] },
      { name: 'Spice Box Set 12 Spices', desc: 'Premium spice collection with 12 essential spices in glass jars: turmeric, cumin, coriander, red chili, garam masala, and more. Wooden rack.', short: '12-spice glass jar set with rack', price: 2499, compare: 3499, stock: 70, tags: ['spices', 'kitchen', 'organic'], images: ['1574323347407-f5e1ad6d020b', '1586201375761-83865001e31c', '1542838132-92c53300491e', '1563636619-e9143da7973b', '1558642452-9d2a7deb7f62'] },
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
    // 0. Clean existing data
    // ──────────────────────────────────────────────────────────────────
    console.log('🗑️  Cleaning existing product data…');
    await qr.query(
      `TRUNCATE product_images, variant_attribute_values, product_variants, products, categories CASCADE`,
    );
    console.log('  ✅ Cleaned\n');

    // ──────────────────────────────────────────────────────────────────
    // 1. Create seller user + seller + store
    // ──────────────────────────────────────────────────────────────────
    console.log('👤 Creating seller user…');
    const sellerEmail = 'seller@labverse.pk';
    const sellerPassword = await bcrypt.hash('Seller@123!', 10);

    let userId: string;
    const [existingUser] = await qr.query(
      `SELECT id FROM users WHERE email = $1`,
      [sellerEmail],
    );
    if (existingUser) {
      userId = existingUser.id;
      await qr.query(
        `UPDATE users SET password_hash = $2, is_active = true, is_email_verified = true, updated_at = NOW() WHERE id = $1`,
        [userId, sellerPassword],
      );
      console.log(`  ✅ Updated existing seller user (${userId})`);
    } else {
      const [newUser] = await qr.query(
        `INSERT INTO users (first_name, last_name, email, password_hash, phone, is_active, is_email_verified)
         VALUES ('LabVerse', 'Seller', $1, $2, '+923001234567', true, true)
         RETURNING id`,
        [sellerEmail, sellerPassword],
      );
      userId = newUser.id;
      console.log(`  ✅ Created seller user: ${sellerEmail} (${userId})`);
    }

    // Assign seller role
    const [sellerRole] = await qr.query(
      `SELECT id FROM roles WHERE name = 'seller'`,
    );
    if (sellerRole) {
      await qr.query(
        `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT (user_id, role_id) DO NOTHING`,
        [userId, sellerRole.id],
      );
      console.log(`  ✅ Assigned seller role`);
    }

    // Upsert seller
    const [seller] = await qr.query(
      `INSERT INTO sellers (user_id, display_name, status, commission_rate)
       VALUES ($1, 'LabVerse Official Store', 'active', 5.00)
       ON CONFLICT (user_id) DO UPDATE SET
         display_name = 'LabVerse Official Store', status = 'active', updated_at = NOW()
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
       ON CONFLICT (slug) DO UPDATE SET
         name = 'LabVerse Official Store', is_active = true, updated_at = NOW()
       RETURNING id`,
      [sellerId],
    );
    console.log(`  ✅ Store: ${store.id}\n`);

    // ──────────────────────────────────────────────────────────────────
    // 2. Insert categories, products, and images
    // ──────────────────────────────────────────────────────────────────
    const catCount = CATEGORIES.length;
    let totalProducts = 0;
    let totalImages = 0;

    for (let ci = 0; ci < catCount; ci++) {
      const cat = CATEGORIES[ci];
      const catSlug = slugify(cat.name);

      const [catRow] = await qr.query(
        `INSERT INTO categories (name, slug, image_url, description, is_active, sort_order)
         VALUES ($1, $2, $3, $4, true, $5)
         ON CONFLICT (slug) DO UPDATE SET
           name = $1, image_url = $3, description = $4, sort_order = $5, updated_at = NOW()
         RETURNING id`,
        [cat.name, catSlug, cat.image, cat.description, ci],
      );
      const categoryId = catRow.id;
      console.log(`📁 [${ci + 1}/${catCount}] ${cat.name}`);

      for (let pi = 0; pi < cat.products.length; pi++) {
        const prod = cat.products[pi];
        const prodSlug = slugify(prod.name);
        const sku = `LV-${catSlug.substring(0, 4).toUpperCase()}-${String(ci * 10 + pi + 1).padStart(4, '0')}`;

        const [prodRow] = await qr.query(
          `INSERT INTO products (
             store_id, category_id, name, slug, full_desc, short_desc,
             base_price, currency, is_active, status
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'USD', true, 'active')
           ON CONFLICT (slug) DO UPDATE SET
             base_price = $7, is_active = true, status = 'active', updated_at = NOW()
           RETURNING id`,
          [
            store.id,
            categoryId,
            prod.name,
            prodSlug,
            prod.desc,
            prod.short,
            prod.price,
          ],
        );
        const productId = prodRow.id;
        totalProducts++;

        // Default variant with sku + stock
        await qr.query(
          `INSERT INTO product_variants (product_id, sku, price, stock, is_active)
           VALUES ($1, $2, $3, $4, true)
           ON CONFLICT (sku) DO UPDATE SET price = $3, stock = $4, is_active = true`,
          [productId, sku, prod.price, prod.stock],
        );

        // Images (5 per product)
        for (let ii = 0; ii < prod.images.length; ii++) {
          await qr.query(
            `INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              productId,
              img(prod.images[ii]),
              `${prod.name} - Image ${ii + 1}`,
              ii === 0,
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
    console.log(`  Categories:    ${catCount}`);
    console.log(`  Products:      ${totalProducts}`);
    console.log(`  Images:        ${totalImages}`);
    console.log(`  Seller email:  seller@labverse.pk`);
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
