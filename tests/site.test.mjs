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
