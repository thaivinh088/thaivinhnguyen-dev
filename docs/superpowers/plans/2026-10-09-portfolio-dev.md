# Portfolio Software Engineer · LLM & AI Automation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng site portfolio thứ hai ở `E:\Porfolio-Dev`, định vị Software Engineer · LLM & AI Automation, copy từ site marketing `E:\Porfolio`.

**Architecture:** Site tĩnh HTML/CSS/vanilla JS. `scripts/build.mjs` sinh `index.html` từ `content/en.json` (VI nạp bằng fetch khi đổi ngôn ngữ). Giữ nguyên code và bố cục; thay nội dung JSON, ảnh dự án (`shots.mjs`), og-image/favicon (`brand.mjs`), màu nhấn (`tokens.css`), CV PDF và vài chuỗi cứng trong `build.mjs`. Thêm 4 hiệu ứng (ý tưởng 21st.dev/Jitter) bằng CSS + một file JS nhỏ `scripts/fx.js`.

**Tech Stack:** Node ≥ 22 (ES modules), Playwright (chromium), sharp, `node:test` cho kiểm thử.

**Spec:** `docs/superpowers/specs/2026-10-09-portfolio-dev-design.md` — mọi chữ trên site lấy **nguyên văn** từ mục 4 của spec.

## Global Constraints

- Không bịa số: chỉ các số 143, 500+, 1.000+/1,000+, 8.684/8,684, ~650 SKU, 30/09/2026 như spec.
- Không chữ "RAG" ở bất kỳ đâu trên trang; không Box Phone US / onlyflow; không link GitHub.
- MIA Agent luôn kèm "cùng mentor / with my mentor" và "Hermes Agent … mã nguồn mở / open-source".
- `--accent: #6FD49A`; `--accent-warm` giữ `#E8A33D` và chỉ dùng cho số liệu.
- Domain tạm: `https://thaivinhnguyen-dev.vercel.app`. `GTM_ID`, `GA4_ID` để trống.
- Đường dẫn CV giữ `assets/cv/CV-NguyenThaiVinh-EN.pdf` và `-VI.pdf`.
- Tạo repo GitHub / project Vercel / deploy: **hỏi người dùng trước**, không nằm trong plan tự chạy.
- Tương phản chữ ≥ 4.5:1 trên `--ground #0B1720`.
- Hiệu ứng: không thư viện, `scripts/fx.js` ≤ 3KB, tổng JS tải < 15KB chưa nén; trạng thái nghỉ không dùng opacity < 1; `prefers-reduced-motion` tắt hết (spec 3.5).

## Review Focus

1. Bấm VI (hoặc mở `?lang=vi`) phải đổi cả nội dung lẫn link CV sang bản VI — người xem tiếng Việt không được tải nhầm CV tiếng Anh. → test ở Task 7.
2. Chuỗi cũ của site marketing sót lại trong output (`tpplastic`, `obbgel`, `oceantrading`, `Website & Growth`, `Website &amp; Growth`, `Digital Marketing Executive` ngoài mục kinh nghiệm). → test ở Task 3.
3. Bullet dài hơn site cũ làm trang tràn ngang ở 360px. → test ở Task 7.
4. `og:image` / `og:url` / canonical còn trỏ domain cũ khiến LinkedIn hiện preview sai. → test ở Task 3.
5. Người dùng bật giảm chuyển động hoặc tắt JS vẫn thấy đủ nội dung, không có gì chuyển động. → test ở Task 7.
6. Ảnh dự án trắng, dính popup, hoặc thiếu bản `-720` khiến build lỗi / card trống. → bước kiểm bằng mắt + kiểm file ở Task 2.

---

### Task 1: Dựng repo từ site cũ và khung kiểm thử

**Files:**
- Create: toàn bộ cây file copy từ `E:\Porfolio` (trừ danh sách loại ở spec 3.1)
- Create: `tests/site.test.mjs`
- Modify: `package.json` (thêm script `"test": "node --test tests/"`), `.gitignore`

**Interfaces:**
- Produces: `tests/site.test.mjs` có helper `readBuilt(): Promise<string>` (đọc `index.html`) và `readJson(lang: 'en'|'vi'): Promise<object>`; các task sau thêm test vào file này.

- [ ] **Step 1:** Copy bằng `robocopy E:\Porfolio E:\Porfolio-Dev /E /XD .git node_modules cv-tailored .vercel /XF HANDOFF.md PORTFOLIO-BRIEF.md _reference-linkedin-banner.jpg` rồi xoá `assets/img/work-*` và `assets/cv/*` trong repo mới. Kiểm: `git status` trong `E:\Porfolio-Dev` chỉ thấy file mới, `docs/` còn nguyên.
- [ ] **Step 2:** `npm install`. Kiểm: `node_modules/playwright` và `node_modules/sharp` tồn tại.
- [ ] **Step 3:** Viết `tests/site.test.mjs` với 2 helper trên và một test khung `test('content: en và vi cùng bộ key')` so sánh danh sách key phẳng của hai JSON (cùng thuật toán `keys()` ở `build.mjs:534`).
- [ ] **Step 4:** `npm test`. Expected: PASS (nội dung cũ vẫn cùng bộ key).
- [ ] **Step 5:** Commit `chore: dựng repo từ site marketing, thêm khung node:test`.

### Task 2: Ảnh dự án

**Files:**
- Modify: `scripts/shots.mjs:20-45` (mảng `SITES`)
- Create: `scripts/placeholder.mjs` *(chỉ nếu Step 1 không tìm thấy trang MIA Agent trên miaai.vn)*
- Output: `assets/img/work-{shipstar,mia,mia-agent,tinhhoa}.webp` và `-720.webp`

**Interfaces:**
- Produces: 4 slug ảnh theo đúng thứ tự `shipstar`, `mia`, `mia-agent`, `tinhhoa` — Task 3 dùng làm `slug` của `work.projects`.

- [ ] **Step 1:** Mở miaai.vn (Playwright hoặc trình duyệt), tìm trang/khối giới thiệu ứng dụng MIA Agent. Ghi lại URL nếu có.
- [ ] **Step 2:** Sửa `SITES` thành: `shipstar` → `https://shipstar.vn`; `mia` → `https://miaai.vn`; `tinhhoa` → `https://tinhhoa.tech`; `mia-agent` → URL ở Step 1 (nếu có). Giữ `hide`/`wait` theo kiểu các mục cũ; sửa chú thích đầu file cho khớp.
- [ ] **Step 3 (nếu Step 1 không có URL):** `scripts/placeholder.mjs` render một trang HTML 1440×900, nền `#0B1720`, wordmark "MIA Agent" (Chivo 900) và dòng mono "Desktop AI assistant", rồi xuất `work-mia-agent.webp` (1440, q82) và `-720.webp` (720, q80) bằng sharp, giống `shots.mjs`. Không vẽ giao diện giả.
- [ ] **Step 4:** `npm run shots` (và `node scripts/placeholder.mjs` nếu có). Expected: 4 dòng `ok`, exit 0.
- [ ] **Step 5:** Mở từng ảnh bằng mắt (Read tool). Ảnh trắng, dính popup cookie/chat → thêm selector vào `hide` và chụp lại slug đó.
- [ ] **Step 6:** Thêm test `test('ảnh: đủ 8 file webp cho 4 slug')` vào `tests/site.test.mjs` (kiểm tồn tại, kích thước > 10KB). `npm test` → PASS.
- [ ] **Step 7:** Commit `feat: ảnh 4 dự án mới`.

### Task 3: Nội dung song ngữ và chuỗi cứng trong build

**Files:**
- Modify: `content/en.json`, `content/vi.json` — toàn bộ theo spec mục 4 (nguyên văn)
- Modify: `scripts/build.mjs:290-330` (JSON-LD, vòng `for` slug), `scripts/build.mjs:399` (`og:image:alt`)
- Modify: `site.config.mjs` (`SITE_URL = 'https://thaivinhnguyen-dev.vercel.app'`)
- Test: `tests/site.test.mjs`

**Interfaces:**
- Consumes: 4 slug ảnh từ Task 2.
- Produces: `index.html` sinh từ nội dung mới; Task 6 kiểm runtime trên file này.

- [ ] **Step 1: Viết test thất bại** trong `tests/site.test.mjs`:
  - `content: hero` — `en.hero.role === 'Software Engineer · LLM & AI Automation'`, `en.hero.stats.map(s=>s.value)` deep-equal `['143','500+','1,000+','8,684']`, VI là `['143','500+','1.000+','8.684']`.
  - `content: dự án` — `en.work.projects.map(p=>p.slug)` deep-equal `['shipstar','mia','mia-agent','tinhhoa']`; `en.layers.items.map(i=>i.id)` deep-equal `['specify','run','verify']`.
  - `content: luật chữ` — `JSON.stringify(en)+JSON.stringify(vi)` không khớp `/\bRAG\b/`, `/onlyflow|box phone/i`, `/github\.com/i`; khớp `/mentor/i` và `/Hermes Agent/`.
  - `build: không sót chuỗi site cũ` — `index.html` không chứa `tpplastic`, `obbgel`, `oceantrading`, `Website &amp; Growth`, `Website & Growth`; `Digital Marketing Executive` chỉ xuất hiện trong khối `#experience`.
  - `build: SEO` — `og:image`, `og:url`, `<link rel="canonical">` đều bắt đầu bằng `https://thaivinhnguyen-dev.vercel.app`; JSON-LD có `"jobTitle":"Software Engineer"`.
- [ ] **Step 2:** `npm test`. Expected: FAIL ở các test trên.
- [ ] **Step 3:** Viết lại `content/en.json` và `content/vi.json` theo spec mục 4 (giữ y cấu trúc key; `work.title` đổi, các key ở mục 4.9 giữ nguyên). Mục kinh nghiệm EstateHub là một phần tử `roles` với `nested:false`.
- [ ] **Step 4:** Trong `build.mjs`: vòng ảnh lặp `en.work.projects.map(p => p.slug)` thay mảng cứng; JSON-LD `jobTitle: 'Software Engineer'`, `knowsAbout: ['Software engineering','Large language models','AI agents','Model Context Protocol','Claude API','Python','TypeScript','PostgreSQL','E-commerce']`, giữ `worksFor` TP Plastic; `og:image:alt` → `Nguyen Thai Vinh — Software Engineer · LLM &amp; AI Automation`.
- [ ] **Step 5:** Sửa `site.config.mjs` (domain mới). `npm run build` → không lỗi, không báo lệch key.
- [ ] **Step 6:** `npm test` → PASS.
- [ ] **Step 7:** Commit `feat: nội dung Software Engineer · LLM & AI Automation`.

### Task 4: Màu nhấn, og-image, favicon

**Files:**
- Modify: `styles/tokens.css:17-23`, `scripts/brand.mjs:21,40,53,80-81`
- Output: `assets/img/og-image.jpg`, `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`
- Test: `tests/site.test.mjs`

- [ ] **Step 1: Test thất bại** `tokens: tương phản` — đọc `tokens.css`, lấy `--accent`, `--ink-muted`, `--ground`; tính tỉ lệ tương phản WCAG (luminance tương đối sRGB); assert `--accent === '#6FD49A'` và cả hai tỉ lệ ≥ 4.5.
- [ ] **Step 2:** `npm test` → FAIL (accent vẫn teal).
- [ ] **Step 3:** `--accent: #6FD49A`, `--accent-dim: rgba(111, 212, 154, 0.14)`, `--accent-line: rgba(111, 212, 154, 0.42)`. `brand.mjs`: `ROLE = 'Software Engineer  ·  LLM &amp; AI Automation'`, mọi `#3FB6C8` → `#6FD49A`, chú thích "teal" → "xanh lá".
- [ ] **Step 4:** `npm run brand` rồi `npm run build`. Mở `og-image.jpg` bằng mắt: đúng chức danh, gạch màu xanh lá, dưới 300KB.
- [ ] **Step 5:** `npm test` → PASS. Commit `feat: màu nhấn xanh lá, og-image chức danh mới`.

### Task 5: Hiệu ứng (21st.dev / Jitter dựng lại bằng CSS + SVG)

**Files:**
- Create: `scripts/fx.js` (spotlight theo con trỏ, chạy/dừng vòng lặp theo viewport)
- Create: `styles/fx.css` (blur-fade hero, dot pattern, loop SVG, spotlight + border beam, marquee, khối reduced-motion)
- Modify: `scripts/build.mjs` — thêm `styles/fx.css` vào `CSS_FILES`; nạp `scripts/fx.js` qua `v()` với `defer`; render SVG vòng lặp trong khối `#how` (nhãn 3 nút lấy từ `layers.items[i].name` với `data-i18n`); render dải marquee trong `#skills` từ `skills.groups[*].items` (bản nhân đôi `aria-hidden="true"`)
- Test: `tests/site.test.mjs`

**Interfaces:**
- Consumes: `layers.items[].name`, `skills.groups[].items` từ Task 3; `--accent` từ Task 4.
- Produces: class `.fx-loop` (SVG có `data-state="run|paused"`), `.fx-marquee`, `.work-card` nhận biến `--mx`/`--my`; Task 7 kiểm runtime trên các selector này.

- [ ] **Step 1: Test thất bại** `fx: ngân sách và cấu trúc` — `scripts/fx.js` tồn tại và ≤ 3072 byte; tổng byte các file `scripts/*.js` được `index.html` tham chiếu < 15360; `index.html` chứa `class="fx-loop"` với 3 nhãn có `data-i18n="layers.items[0].name"`…`[2]`; chứa `.fx-marquee` có một bản `aria-hidden="true"`; CSS nhúng chứa `@media (prefers-reduced-motion: reduce)` tắt `animation` của `.fx-loop`, `.fx-marquee`, hero.
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Xem tham khảo trên 21st.dev (Blur Fade, Dot Pattern, Spotlight Card, Border Beam, Marquee) bằng trình duyệt — chỉ lấy ý tưởng, viết lại bằng CSS thuần dùng token sẵn có (`--accent`, `--line`, `--surface`).
- [ ] **Step 4:** Viết `styles/fx.css`: hero blur-fade bằng `@keyframes` chạy một lần (`animation-fill-mode: both`, trạng thái cuối là trạng thái nghỉ, không có opacity < 1 khi nghỉ); dot pattern bằng `radial-gradient` + `mask-image`; vòng lặp: `offset-path` hoặc `stroke-dashoffset` cho chấm sáng, nút sáng theo `animation-delay` lệch 1/3 chu kỳ, `animation-play-state` theo `[data-state]`; border beam bằng `conic-gradient` xoay trong `::before` chỉ khi `:hover`; spotlight bằng `radial-gradient(at var(--mx) var(--my))`; marquee bằng `translateX(-50%)` lặp, `:hover` dừng.
- [ ] **Step 5:** Viết `scripts/fx.js`: `pointermove` trên `.work-card` (chỉ khi `matchMedia('(hover: hover)')`) đặt `--mx/--my`; `IntersectionObserver` đổi `data-state` của `.fx-loop`; thoát sớm nếu `prefers-reduced-motion`.
- [ ] **Step 6:** Sửa `build.mjs` như phần Files; `npm run build`; `npm test` → PASS.
- [ ] **Step 7:** Mở trang local xem bằng mắt ở 1280px và 360px: hero chạy một lần, vòng lặp chạy khi cuộn tới, spotlight/border beam khi hover, marquee trôi. Bật giả lập reduced-motion: không gì chuyển động, nội dung đủ.
- [ ] **Step 8:** Commit `feat: hiệu ứng hero, vòng lặp SVG, spotlight card, marquee`.

### Task 6: CV PDF tiếng Anh và tiếng Việt

**Files:**
- Create: `E:\Porfolio\cv-tailored\CV-NguyenThaiVinh-AI-Engineer-EN.html` (nguồn, nằm ngoài repo, đã gitignore)
- Output: `E:\Porfolio-Dev\assets\cv\CV-NguyenThaiVinh-EN.pdf`, `...-VI.pdf`

- [ ] **Step 1:** Dịch `CV-NguyenThaiVinh-AI-Engineer-VI.html` sang tiếng Anh, giữ y bố cục và mọi con số; `lang="en"`; chức danh `Software Engineer · LLM & AI Automation`. Câu chữ bullet dự án dùng lại bản EN trong spec mục 4.4 khi trùng ý.
- [ ] **Step 2:** Render PDF bằng script Playwright đang dùng ở scratchpad (`pdf.mjs`: A4, `preferCSSPageSize`). Expected: 2 trang, font Lato nạp được.
- [ ] **Step 3:** Đọc PDF bằng mắt: không dòng mồ côi, không chữ dính.
- [ ] **Step 4:** Copy PDF tiếng Việt hiện có và PDF tiếng Anh mới vào `assets/cv/` với tên `CV-NguyenThaiVinh-VI.pdf` / `-EN.pdf`.
- [ ] **Step 5:** Test `cv: hai file tồn tại và là PDF` (4 byte đầu `%PDF`). `npm test` → PASS. Commit `feat: CV AI Engineer EN/VI`.

### Task 7: Kiểm runtime trên trình duyệt

**Files:**
- Create: `tests/browser.test.mjs` (Playwright + server tĩnh `node:http` tự dựng trong test, cổng ngẫu nhiên)

- [ ] **Step 1: Viết test**:
  - `lang: ?lang=vi đổi nội dung và CV` — mở `/?lang=vi`, chờ `html[lang="vi"]`; tiêu đề hero là câu định vị VI; mọi link tải CV có `href` chứa `CV-NguyenThaiVinh-VI.pdf`. Mở `/` → link CV chứa `-EN.pdf`.
  - `layout: không tràn ngang ở 360px` — viewport 360×800, cả EN và VI: `document.documentElement.scrollWidth <= 360`.
  - `layout: đủ 4 card và ảnh tải được` — 4 `.work-card`, mỗi `img.browser-shot` có `naturalWidth > 0`.
  - `fx: reduced-motion` — context `reducedMotion: 'reduce'`: mọi phần tử trong `.fx-loop`, `.fx-marquee`, hero có `getAnimations().length === 0` hoặc animation ở trạng thái `finished`/`paused`; câu định vị hiển thị ngay (opacity tính cả cây cha = 1).
  - `fx: tắt JS` — context `javaScriptEnabled: false`: hero, 3 tầng, 4 card, kỹ năng đều có chữ và opacity tính cả cây cha = 1.
  - `fx: vòng lặp chạy theo viewport` — ở đầu trang `.fx-loop[data-state="paused"]`; cuộn tới `#how` → `data-state="run"`.
- [ ] **Step 2:** `npm test` → PASS (nếu FAIL ở tràn ngang: sửa CSS trong `styles/sections.css` cho khối gây tràn, chạy `npm run build`, chạy lại).
- [ ] **Step 3:** Commit `test: kiểm runtime đổi ngôn ngữ, CV, 360px`.

### Task 8: README, soát cuối, Lighthouse

**Files:**
- Modify: `README.md`

- [ ] **Step 1:** README: tên site, domain mới, 4 site chụp (`shipstar`, `mia`, `mia-agent`, `tinhhoa`), `npm test`, dẫn tới spec thay cho PORTFOLIO-BRIEF; mục "Việc phải làm": thay ảnh Shipstar/MIA Agent khi người dùng gửi (nhắc che dữ liệu).
- [ ] **Step 2:** Chạy server tĩnh local, Lighthouse mobile (`npx lighthouse http://localhost:<port> --preset=perf --form-factor=mobile` và một lượt đủ hạng mục). Expected: Performance ≥ 90; Accessibility/SEO/Best Practices không thấp hơn site cũ đo cùng cách.
- [ ] **Step 3:** Chụp màn 360px và 1280px (EN và VI), xem bằng mắt toàn trang: thứ bậc chữ, ảnh, khối vòng lặp 3 tầng.
- [ ] **Step 4:** `npm run build && npm test` → PASS, `git status` sạch sau commit.
- [ ] **Step 5:** Commit `docs: README cho portfolio dev`. Dừng — hỏi người dùng về tạo repo GitHub, project Vercel và deploy.
