/**
 * Chụp ảnh 3 website dự án -> assets/img/work-{slug}.webp
 * (ảnh thứ tư, work-mia-agent, là ảnh chụp app thật — xem README)
 *
 *   npm i -D playwright sharp
 *   npx playwright install chromium
 *   npm run shots
 *
 * Chạy lại được mỗi khi các site kia đổi thiết kế.
 * BẮT BUỘC: mở 4 ảnh ra xem bằng mắt trước khi commit.
 *
 * Chụp một site: npm run shots -- mia
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import { mkdir, stat } from 'node:fs/promises';

const OUT = 'assets/img';
const VIEWPORT = { width: 1440, height: 900 };   // 16/10, khớp tỷ lệ khoá của card

const SITES = [
  {
    slug: 'shipstar',
    url: 'https://shipstar.vn',
    // Site render bằng JavaScript, phần dưới hero nạp muộn -> chờ lâu hơn.
    wait: 5000,
    hide: [],
  },
  {
    slug: 'mia',
    url: 'https://miaai.vn',
    wait: 3500,
    // Nút nổi "Liên hệ tư vấn" và "Dừng hiệu ứng" ở góc phải dưới.
    hide: ['button[aria-label="Liên hệ tư vấn"]', '[class*="_toggle_egmzx"]'],
  },
  // mia-agent: ảnh chụp app desktop thật do owner gửi, KHÔNG chụp tự động —
  // đừng thêm lại vào đây kẻo `npm run shots` ghi đè.
  { slug: 'tinhhoa', url: 'https://tinhhoa.tech', wait: 3500, hide: [] },
];

// Ẩn các thứ hay che mất nội dung: popup cookie, popup khuyến mãi,
// và bong bóng chat của bên thứ ba (tawk.to, WhatsApp, Messenger, Zalo).
// Giữ danh sách này bảo thủ — selector quá rộng sẽ ẩn luôn nội dung thật.
const GENERIC_HIDE = `
  [class*="cookie" i], [id*="cookie" i],
  [class*="gdpr" i], [class*="consent" i],
  [class*="newsletter-popup" i], [class*="popup-overlay" i],
  [id*="tawk" i], [class*="tawk" i],
  [class*="whatsapp" i], [id*="whatsapp" i],
  [class*="ht-ctc" i], [class*="joinchat" i],
  [class*="fb_dialog" i], [class*="fb-customerchat" i],
  [class*="chat-widget" i], [id*="chat-widget" i],
  [class*="zalo" i], [id*="zalo" i],
  [class*="zsiq" i], [id*="zsiq" i],
  [class*="wa__" i], .scrollToTop,
  iframe[title*="chat" i], iframe[title*="Chat" i] { display: none !important; }
`;

const only = process.argv.slice(2);
const targets = only.length ? SITES.filter(s => only.includes(s.slug)) : SITES;
if (!targets.length) {
  console.log(`Không khớp slug nào. Có: ${SITES.map(s => s.slug).join(', ')}`);
  process.exit(1);
}

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
let failed = 0;

for (const site of targets) {
  // bypassCSP: miaai.vn có CSP style-src 'self' chặn addStyleTag (ẩn popup).
  const ctx = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2, bypassCSP: true });
  const page = await ctx.newPage();
  try {
    process.stdout.write(`→ ${site.url} ... `);
    await page.goto(site.url, { waitUntil: site.until ?? 'networkidle', timeout: 60_000 });

    const hide = site.hide.length
      ? `${site.hide.join(',')} { display: none !important; }`
      : '';
    await page.addStyleTag({ content: GENERIC_HIDE + hide });

    if (site.scrollTo) {
      // Đặt khối cần chụp sát mép trên viewport (trừ khoảng cho nav dính).
      await page.locator(site.scrollTo).evaluate((el, off) =>
        window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - off), site.scrollOffset ?? 96);
    }

    await page.waitForTimeout(site.wait);

    const buf = await page.screenshot({ type: 'png' }); // viewport, KHÔNG fullPage

    // Hai cỡ cho srcset: 1440 cho desktop retina, 720 cho điện thoại.
    // Không có bản 720 thì máy 412px vẫn phải tải ảnh 1440 — Lighthouse
    // tính đó là ~190KB lãng phí.
    const file = `${OUT}/work-${site.slug}.webp`;
    const small = `${OUT}/work-${site.slug}-720.webp`;
    await sharp(buf).resize({ width: 1440 }).webp({ quality: 82 }).toFile(file);
    await sharp(buf).resize({ width: 720 }).webp({ quality: 80 }).toFile(small);

    const big = (await stat(file)).size;
    const sml = (await stat(small)).size;
    console.log(`ok  work-${site.slug}  ${Math.round(big / 1024)}KB / ${Math.round(sml / 1024)}KB`);
  } catch (err) {
    failed++;
    console.log(`LỖI: ${err.message.split('\n')[0]}`);
  } finally {
    await ctx.close();
  }
}

await browser.close();

console.log(
  failed
    ? `\n${failed} site lỗi. Sửa rồi chạy lại, đừng commit thiếu ảnh.`
    : '\nXong. Giờ MỞ ẢNH RA XEM: ảnh trắng hoặc dính popup thì chụp lại.'
);
process.exit(failed ? 1 : 0);
