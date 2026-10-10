/* ─────────────────────────────────────────────────────────────
   brand.mjs — sinh og-image.jpg, favicon.svg, favicon.ico,
   apple-touch-icon.png

       npm run brand

   og-image bám bố cục của assets/img/_reference-linkedin-banner.jpg
   (nền navy, tên, chức danh, hàng từ khoá, gạch teal dưới đáy),
   chỉ đổi tỷ lệ sang 1200×630 theo yêu cầu của LinkedIn / OG.
   ───────────────────────────────────────────────────────────── */

import { chromium } from 'playwright';
import sharp from 'sharp';
import { writeFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const OUT = new URL('../assets/img/', import.meta.url);
const ROOT = new URL('../', import.meta.url);

const NAME = 'NGUYỄN THÁI VINH';
const ROLE = 'Digital Marketing Executive  ·  Website &amp; Growth';
const KEYWORDS = 'META &amp; GOOGLE ADS · TECHNICAL SEO · GA4 / GTM · WORDPRESS';

/* ── og-image.jpg — 1200×630 ─────────────────────────────── */

const page_html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Chivo:wght@700;900&family=IBM+Plex+Mono:wght@500&family=Source+Sans+3:wght@400&display=block">
<style>
  * { margin: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px; overflow: hidden;
    background: linear-gradient(100deg, #08121A 0%, #0B1720 42%, #16303F 100%);
    display: flex; align-items: center; justify-content: flex-end;
    padding: 0 76px 14px; position: relative;
  }
  /* gạch teal dưới đáy, giống ảnh bìa LinkedIn */
  body::after {
    content: ''; position: absolute; left: 0; right: 0; bottom: 0;
    height: 8px; background: #3FB6C8;
  }
  .block { text-align: right; display: flex; flex-direction: column; gap: 22px; align-items: flex-end; }
  h1 {
    font-family: 'Chivo', sans-serif; font-weight: 900; font-size: 92px;
    letter-spacing: -0.03em; line-height: 1; color: #FFFFFF; white-space: nowrap;
  }
  .role {
    font-family: 'Source Sans 3', sans-serif; font-weight: 400; font-size: 34px;
    line-height: 1.2; color: #EAF2F6;
  }
  .keywords {
    font-family: 'IBM Plex Mono', monospace; font-weight: 500; font-size: 19px;
    letter-spacing: 0.1em; color: #3FB6C8; padding-top: 6px;
  }
</style></head><body>
  <div class="block">
    <h1>${NAME}</h1>
    <p class="role">${ROLE}</p>
    <p class="keywords">${KEYWORDS}</p>
  </div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 });
await page.setContent(page_html, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(600);
const shot = await page.screenshot({ type: 'png' });
await browser.close();

const ogPath = fileURLToPath(new URL('og-image.jpg', OUT));
await sharp(shot).resize(1200, 630).jpeg({ quality: 88, chromaSubsampling: '4:4:4' }).toFile(ogPath);
const ogSize = (await stat(ogPath)).size;
console.log(`og-image.jpg          1200×630  ${Math.round(ogSize / 1024)}KB${ogSize > 300_000 ? '  ⚠ QUÁ 300KB' : ''}`);

/* ── favicon.svg — chữ lồng NV ───────────────────────────── */

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="NV">
  <rect width="64" height="64" fill="#0B1720"/>
  <path d="M14 46V18h6.2l13.6 18.3V18H40v28h-6.2L20.2 27.7V46z" fill="#3FB6C8"/>
  <path d="M40 18h6.6l4.4 20 4.4-20H62L54.6 46h-7.2z" fill="#3FB6C8"/>
</svg>
`;
await writeFile(new URL('favicon.svg', ROOT), favicon, 'utf8');
console.log('favicon.svg           64×64     ok');

/* ── favicon.ico (32×32 PNG bọc trong container ICO) ─────── */

const png32 = await sharp(Buffer.from(favicon)).resize(32, 32).png().toBuffer();
const dir = Buffer.alloc(22);
dir.writeUInt16LE(0, 0);            // reserved
dir.writeUInt16LE(1, 2);            // type: icon
dir.writeUInt16LE(1, 4);            // số ảnh
dir.writeUInt8(32, 6);              // width
dir.writeUInt8(32, 7);              // height
dir.writeUInt8(0, 8);               // số màu bảng: 0 = truecolor
dir.writeUInt8(0, 9);               // reserved
dir.writeUInt16LE(1, 10);           // color planes
dir.writeUInt16LE(32, 12);          // bits per pixel
dir.writeUInt32LE(png32.length, 14);
dir.writeUInt32LE(22, 18);          // offset tới dữ liệu ảnh
await writeFile(new URL('favicon.ico', ROOT), Buffer.concat([dir, png32]));
console.log('favicon.ico           32×32     ok');

/* ── apple-touch-icon.png ────────────────────────────────── */

await sharp(Buffer.from(favicon)).resize(180, 180).png().toFile(fileURLToPath(new URL('apple-touch-icon.png', ROOT)));
console.log('apple-touch-icon.png  180×180   ok');
