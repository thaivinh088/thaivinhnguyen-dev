/* ─────────────────────────────────────────────────────────────
   fonts.mjs — tải woff2 từ Google Fonts về self-host

       npm run fonts        (rồi chạy lại `npm run build`)

   Vì sao self-host thay vì gọi thẳng Google Fonts:
   file CSS của fonts.googleapis.com chặn render VÀ nằm trên một
   origin khác, nên trình duyệt phải DNS + TCP + TLS xong mới biết
   cần tải font nào. Trên 4G đó là vài trăm ms trước khi trang vẽ
   được chữ đầu tiên. Self-host bỏ hẳn origin thứ ba đó đi.

   Subset: latin, latin-ext, vietnamese (Mục 6.2 của brief).
   Mỗi subset một file, khai unicode-range, nên bản tiếng Anh
   không phải tải file tiếng Việt và ngược lại.

   Chạy lại khi Google cập nhật font, hoặc khi đổi bộ chữ.
   ───────────────────────────────────────────────────────────── */

import { mkdir, writeFile, readdir, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const OUT = 'assets/fonts';
const SUBSETS = new Set(['latin', 'latin-ext', 'vietnamese']);

// Đúng các nét đã dùng trong styles/tokens.css, không tải dư.
const FAMILIES = [
  { query: 'Chivo:wght@700;900', slug: 'chivo' },
  { query: 'Source+Sans+3:wght@400;600', slug: 'sourcesans3' },
  { query: 'IBM+Plex+Mono:wght@500', slug: 'ibmplexmono' },
];

const get = (url, as) =>
  fetch(url, { headers: { 'User-Agent': UA } }).then(r => {
    if (!r.ok) throw new Error(`${url} → HTTP ${r.status}`);
    return as === 'buffer' ? r.arrayBuffer().then(Buffer.from) : r.text();
  });

await mkdir(OUT, { recursive: true });

const kept = new Set();
const byUrl = new Map();
let css =
  '/* SINH RA TỰ ĐỘNG bởi `npm run fonts` — đừng sửa tay.\n' +
  '   Subset latin / latin-ext / vietnamese, font-display: swap. */\n';
let total = 0;

for (const fam of FAMILIES) {
  const sheet = await get(`https://fonts.googleapis.com/css2?family=${fam.query}&display=swap`);

  for (const raw of sheet.split('/*').slice(1)) {
    const subset = raw.slice(0, raw.indexOf('*/')).trim();
    if (!SUBSETS.has(subset)) continue;

    const family = (raw.match(/font-family: '([^']+)'/) || [])[1];
    const weight = (raw.match(/font-weight: (\d+)/) || [])[1];
    const src = (raw.match(/url\((https[^)]+)\)/) || [])[1];
    const range = (raw.match(/unicode-range: ([^;]+);/) || [])[1];
    if (!family || !src || !range) continue;

    // Chivo và Source Sans 3 là font biến thiên: mọi nét dùng chung một file.
    let href = byUrl.get(src);
    if (!href) {
      const buf = await get(src, 'buffer');
      const name = `${fam.slug}-${subset}.woff2`;
      const hash = createHash('sha256').update(buf).digest('hex').slice(0, 8);
      await writeFile(`${OUT}/${name}`, buf);
      href = `/${OUT}/${name}?v=${hash}`;      // /assets/fonts/ cache 1 năm immutable
      byUrl.set(src, href);
      kept.add(name);
      total += buf.length;
      console.log(`${name.padEnd(30)} ${String(Math.round(buf.length / 1024)).padStart(3)}KB`);
    }

    css +=
      `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};` +
      `font-display:swap;src:url(${href}) format('woff2');unicode-range:${range}}\n`;
  }
}

// Dọn file thừa của lần chạy trước (đổi bộ chữ, bỏ bớt subset…)
for (const f of await readdir(OUT)) {
  if (f.endsWith('.woff2') && !kept.has(f)) {
    await rm(`${OUT}/${f}`);
    console.log(`gỡ file thừa: ${f}`);
  }
}

await writeFile('styles/fonts.css', css, 'utf8');
console.log(`\n${kept.size} file, ${Math.round(total / 1024)}KB → ${OUT}/`);
console.log('styles/fonts.css đã ghi. Chạy tiếp `npm run build`.');
