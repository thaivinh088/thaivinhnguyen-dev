// Kiểm tĩnh: nội dung JSON, index.html đã build, ảnh, CV.
// Chạy: npm test (sau `npm run build`).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const p = rel => fileURLToPath(new URL(`../${rel}`, import.meta.url));

export const readBuilt = () => readFile(p('index.html'), 'utf8');
export const readJson = async lang => JSON.parse(await readFile(p(`content/${lang}.json`), 'utf8'));

/* Cùng thuật toán với keys() ở scripts/build.mjs: phẳng hoá thành đường dẫn,
   phần tử mảng theo chỉ số. */
const keys = obj => {
  const out = [];
  const walk = (o, path) => {
    if (o && typeof o === 'object') {
      for (const k of Object.keys(o)) walk(o[k], path ? `${path}.${k}` : k);
    } else out.push(path);
  };
  walk(obj, '');
  return out;
};

test('content: en và vi cùng bộ key', async () => {
  const [en, vi] = [await readJson('en'), await readJson('vi')];
  assert.deepEqual(keys(vi).sort(), keys(en).sort());
});

export const SLUGS = ['shipstar', 'mia', 'mia-agent', 'tinhhoa'];

test('ảnh: đủ 8 file webp cho 4 slug', async () => {
  for (const slug of SLUGS) {
    for (const suffix of ['', '-720']) {
      const file = `assets/img/work-${slug}${suffix}.webp`;
      const size = (await stat(p(file)).catch(() => ({ size: 0 }))).size;
      assert.ok(size > 10 * 1024, `${file} thiếu hoặc quá nhỏ (${size} byte)`);
    }
  }
});

/* ── Task 3: nội dung và output build ─────────────────────── */

const SITE = 'https://thaivinhnguyen-dev.vercel.app';

test('content: hero', async () => {
  const [en, vi] = [await readJson('en'), await readJson('vi')];
  assert.equal(en.hero.role, 'Software Engineer · LLM & AI Automation');
  assert.equal(vi.hero.role, 'Software Engineer · LLM & AI Automation');
  assert.deepEqual(en.hero.stats.map(s => s.value), ['143', '500+', '1,000+', '8,684']);
  assert.deepEqual(vi.hero.stats.map(s => s.value), ['143', '500+', '1.000+', '8.684']);
});

test('content: dự án và ba tầng', async () => {
  for (const lang of ['en', 'vi']) {
    const j = await readJson(lang);
    assert.deepEqual(j.work.projects.map(x => x.slug), SLUGS);
    assert.deepEqual(j.layers.items.map(x => x.id), ['specify', 'run', 'verify']);
  }
});

test('content: luật chữ', async () => {
  const all = JSON.stringify(await readJson('en')) + JSON.stringify(await readJson('vi'));
  assert.doesNotMatch(all, /\bRAG\b/);
  assert.doesNotMatch(all, /onlyflow|box phone/i);
  assert.doesNotMatch(all, /github\.com/i);
  assert.match(all, /mentor/i);
  assert.match(all, /Hermes Agent/);
});

test('build: không sót chuỗi site cũ', async () => {
  const html = await readBuilt();
  for (const s of ['tpplastic', 'obbgel', 'oceantrading', 'Website &amp; Growth', 'Website & Growth']) {
    assert.ok(!html.toLowerCase().includes(s.toLowerCase()), `còn sót "${s}"`);
  }
  const exp = html.slice(html.indexOf('id="experience"'), html.indexOf('id="about"'));
  const outside = html.replace(exp, '');
  assert.ok(!outside.includes('Digital Marketing Executive'), 'Digital Marketing Executive ngoài mục kinh nghiệm');
});

test('build: SEO trỏ domain mới', async () => {
  const html = await readBuilt();
  const attr = re => (html.match(re) || [])[1] || '';
  assert.ok(attr(/rel="canonical" href="([^"]+)"/).startsWith(SITE));
  assert.ok(attr(/property="og:url" content="([^"]+)"/).startsWith(SITE));
  assert.ok(attr(/property="og:image" content="([^"]+)"/).startsWith(SITE));
  assert.match(html, /"jobTitle":"Software Engineer"/);
});

/* ── Task 4: màu nhấn và tương phản ───────────────────────── */

const luminance = hex => {
  const [r, g, b] = hex.match(/[0-9a-f]{2}/gi).map(h => {
    const c = parseInt(h, 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

test('tokens: màu nhấn xanh lá và tương phản ≥ 4.5', async () => {
  const css = await readFile(p('styles/tokens.css'), 'utf8');
  const token = name => (css.match(new RegExp(`--${name}:\s*(#[0-9A-Fa-f]{6})`)) || [])[1];
  assert.equal(token('accent')?.toUpperCase(), '#6FD49A');
  for (const name of ['accent', 'ink-muted']) {
    const ratio = contrast(token(name), token('ground'));
    assert.ok(ratio >= 4.5, `--${name} trên --ground chỉ ${ratio.toFixed(2)}:1`);
  }
});
