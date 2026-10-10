// Kiểm runtime trên Chromium thật: đổi ngôn ngữ + link CV, tràn ngang ở 360px,
// ảnh dự án, giảm chuyển động, tắt JS, vòng lặp chạy theo viewport.
// Chạy: npm test (sau `npm run build`).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.pdf': 'application/pdf', '.ico': 'image/x-icon',
};

let server, base, browser;

before(async () => {
  server = createServer(async (req, res) => {
    let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (path.endsWith('/')) path += 'index.html';
    try {
      const body = await readFile(join(ROOT, normalize(path)));
      res.writeHead(200, { 'content-type': TYPES[extname(path)] || 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise(r => server.listen(0, r));
  base = `http://localhost:${server.address().port}`;
  browser = await chromium.launch();
});

after(async () => {
  await browser?.close();
  server?.close();
});

const open = async (path, ctxOpts = {}) => {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, ...ctxOpts });
  const page = await ctx.newPage();
  await page.goto(base + path, { waitUntil: 'networkidle' });
  return { ctx, page };
};

/* Opacity hiệu dụng: nhân opacity của cả cây cha (README site cũ: đọc mỗi
   computed color sẽ không thấy lỗi .reveal mờ). */
const effectiveOpacity = (page, selector) =>
  page.$eval(selector, el => {
    let o = 1;
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) o *= Number(getComputedStyle(n).opacity);
    return o;
  });

const cvHrefs = page => page.$$eval('a[data-track-cv]', as => as.map(a => a.getAttribute('href')));

test('lang: ?lang=vi đổi nội dung và CV', async () => {
  const vi = JSON.parse(await readFile(join(ROOT, 'content/vi.json'), 'utf8'));
  const { ctx, page } = await open('/?lang=vi');
  await page.waitForSelector('html[lang="vi"]');
  await page.waitForFunction(s => document.querySelector('.hero-statement')?.textContent.trim() === s, vi.hero.statement);
  const hrefs = await cvHrefs(page);
  assert.ok(hrefs.length > 0, 'không có link CV');
  for (const h of hrefs) assert.match(h, /CV-NguyenThaiVinh-VI\.pdf/);
  await ctx.close();

  const en = await open('/');
  for (const h of await cvHrefs(en.page)) assert.match(h, /CV-NguyenThaiVinh-EN\.pdf/);
  await en.ctx.close();
});

test('layout: không tràn ngang ở 360px', async () => {
  for (const path of ['/', '/?lang=vi']) {
    const { ctx, page } = await open(path, { viewport: { width: 360, height: 780 } });
    await page.waitForTimeout(300);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    assert.ok(sw <= 360, `${path}: scrollWidth ${sw} > 360`);
    await ctx.close();
  }
});

test('layout: đủ 4 card và ảnh tải được', async () => {
  const { ctx, page } = await open('/');
  const cards = page.locator('.work-card');
  assert.equal(await cards.count(), 4);
  for (let i = 0; i < 4; i++) {
    const img = cards.nth(i).locator('img.browser-shot');
    await img.scrollIntoViewIfNeeded();
    await page.waitForFunction(el => el.complete && el.naturalWidth > 0, await img.elementHandle(), { timeout: 10_000 });
  }
  await ctx.close();
});

test('fx: reduced-motion', async () => {
  const { ctx, page } = await open('/', { reducedMotion: 'reduce' });
  await page.locator('#how').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const running = await page.evaluate(() =>
    [...document.querySelectorAll('.hero *, .fx-loop *, .fx-marquee *')]
      .flatMap(el => el.getAnimations())
      .filter(a => a.playState === 'running').length
  );
  assert.equal(running, 0, `${running} animation vẫn chạy khi giảm chuyển động`);
  assert.equal(await effectiveOpacity(page, '.hero-statement'), 1);
  await ctx.close();
});

test('fx: tắt JS vẫn đủ nội dung', async () => {
  const { ctx, page } = await open('/', { javaScriptEnabled: false });
  await page.waitForTimeout(800); // hero chạy xong animation một lần
  for (const sel of ['.hero-statement', '#how .layer-desc', '.work-card .work-desc', '#skills .skill-items li']) {
    const text = (await page.locator(sel).first().textContent()).trim();
    assert.ok(text.length > 0, `${sel} rỗng`);
    assert.equal(await effectiveOpacity(page, sel), 1, `${sel} không đủ opacity`);
  }
  await ctx.close();
});

test('fx: vòng lặp chạy theo viewport', async () => {
  const { ctx, page } = await open('/');
  assert.equal(await page.getAttribute('.fx-loop', 'data-state'), 'paused');
  await page.locator('.fx-loop').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('.fx-loop').dataset.state === 'run');
  await ctx.close();
});

test('fx: viền sáng thấy được khi hover thẻ (desktop)', async () => {
  const { ctx, page } = await open('/');
  const card = page.locator('.work-card').first();
  await card.scrollIntoViewIfNeeded();
  const box = await card.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(500);
  const { border, accent, beam } = await card.evaluate(el => ({
    border: getComputedStyle(el).borderTopColor,
    accent: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
    beam: getComputedStyle(el, '::before').visibility,
  }));
  assert.equal(beam, 'visible');
  assert.notEqual(border, 'rgb(111, 212, 154)', `viền thẻ trùng màu tia sáng ${accent} — tia sáng bị chìm`);
  await ctx.close();
});

test('fx: chu kỳ đầu — nút 2 và 3 tối khi chấm sáng còn ở nút 1', async () => {
  const { ctx, page } = await open('/');
  // Đầu trang: vòng lặp đang paused ở thời điểm 0, chấm sáng ở nút 0.
  const filters = await page.$$eval('.fx-node-group', gs => gs.map(g => getComputedStyle(g).filter));
  assert.doesNotMatch(filters[0], /grayscale\(1\)/, `nút 0 phải sáng: ${filters[0]}`);
  for (const i of [1, 2]) assert.match(filters[i], /grayscale\(1\)/, `nút ${i} phải tối: ${filters[i]}`);
  await ctx.close();
});
