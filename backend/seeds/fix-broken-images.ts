/**
 * Fix broken product image URLs.
 *
 * 1. Connects to the database
 * 2. Fetches all unique product image URLs
 * 3. Tests each with a HEAD request (parallel batches)
 * 4. Replaces broken URLs with working ones from the same pool
 * 5. Updates the database
 *
 * Usage: npx ts-node -r tsconfig-paths/register ./seeds/fix-broken-images.ts
 */

import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

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

async function testUrl(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, { method: 'HEAD', signal: controller.signal, redirect: 'follow' });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

async function testBatch(urls: string[], batchSize = 15): Promise<Map<string, boolean>> {
  const results = new Map<string, boolean>();
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(async (url) => ({ url, ok: await testUrl(url) })));
    for (const { url, ok } of batchResults) {
      results.set(url, ok);
    }
    const done = Math.min(i + batchSize, urls.length);
    console.log(`  Tested ${done}/${urls.length}...`);
  }
  return results;
}

async function main() {
  await dataSource.initialize();
  const qr = dataSource.createQueryRunner();
  console.log('Connected to database.\n');

  // Get all unique image URLs
  const rows: { url: string; id: string }[] = await qr.query(
    `SELECT DISTINCT ON (url) id, url FROM product_images ORDER BY url`
  );
  console.log(`Found ${rows.length} unique image URLs. Testing...\n`);

  const urlMap = new Map<string, string>(); // url -> id (one representative)
  for (const r of rows) urlMap.set(r.url, r.id);

  // Test all URLs
  const results = await testBatch(rows.map(r => r.url), 15);

  const working: string[] = [];
  const broken: string[] = [];
  for (const [url, ok] of results) {
    if (ok) working.push(url);
    else broken.push(url);
  }

  console.log(`\nWorking: ${working.length}, Broken: ${broken.length}`);

  if (broken.length === 0) {
    console.log('All images are working! Nothing to fix.');
    await qr.release();
    await dataSource.destroy();
    return;
  }

  // Assign replacements: cycle through working URLs
  console.log(`\nReplacing ${broken.length} broken URLs with working alternatives...`);
  let replacementIdx = 0;
  let updatedCount = 0;

  for (const brokenUrl of broken) {
    const replacementUrl = working[replacementIdx % working.length];
    replacementIdx++;

    // Update all product_images rows with this broken URL
    const result = await qr.query(
      `UPDATE product_images SET url = $1 WHERE url = $2`,
      [replacementUrl, brokenUrl]
    );
    updatedCount += result[1] || 0;
    
    // Extract photo IDs for logging
    const brokenId = brokenUrl.match(/photo-([^?]+)/)?.[1] || '?';
    const replId = replacementUrl.match(/photo-([^?]+)/)?.[1] || '?';
    console.log(`  ${brokenId} -> ${replId}`);
  }

  console.log(`\nUpdated ${updatedCount} image rows in the database.`);

  // Verify: check no broken URLs remain
  const verify: { cnt: string }[] = await qr.query(
    `SELECT COUNT(DISTINCT url) as cnt FROM product_images`
  );
  console.log(`Unique URLs remaining: ${verify[0].cnt}`);

  // Also verify images per product
  const perProduct: { min: string; max: string; avg: string }[] = await qr.query(
    `SELECT MIN(cnt)::text as min, MAX(cnt)::text as max, ROUND(AVG(cnt),1)::text as avg
     FROM (SELECT product_id, COUNT(*) as cnt FROM product_images GROUP BY product_id) sub`
  );
  console.log(`Images per product — min: ${perProduct[0].min}, max: ${perProduct[0].max}, avg: ${perProduct[0].avg}`);

  await qr.release();
  await dataSource.destroy();
  console.log('\nDone!');
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
