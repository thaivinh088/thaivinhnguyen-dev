/* ─────────────────────────────────────────────────────────────
   build.mjs — sinh index.html, sitemap.xml, robots.txt

       npm run build

   Nội dung nằm ở content/en.json và content/vi.json.
   Tiếng Anh được render thẳng vào index.html (mặc định, và để
   HR / LinkedIn / Google đọc được ngay khi không chạy JS).
   Tiếng Việt nạp lúc đổi ngôn ngữ qua scripts/i18n.js.

   Vercel KHÔNG chạy script này — index.html đã commit sẵn.
   Sửa content/*.json hoặc styles/* xong thì chạy lại rồi push.
   ───────────────────────────────────────────────────────────── */

import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { SITE_URL, GTM_ID } from '../site.config.mjs';

const ROOT = new URL('..', import.meta.url);
const p = rel => new URL(rel, ROOT);
const ROOT_DIR = fileURLToPath(ROOT);

const en = JSON.parse(await readFile(p('content/en.json'), 'utf8'));
const vi = JSON.parse(await readFile(p('content/vi.json'), 'utf8'));

const base = SITE_URL.replace(/\/+$/, '');
const abs = rel => `${base}/${rel.replace(/^\/+/, '')}`;

/* ── Cache busting ────────────────────────────────────────────
   /assets/, /styles/, /scripts/ được cache 1 năm immutable trong
   vercel.json. Tên file không đổi khi nội dung đổi, nên phải gắn
   ?v=<hash nội dung> — sửa file là URL đổi, người xem cũ nhận bản
   mới ngay. Xem ghi chú ở Mục 6.5 của brief.                    */
async function v(rel) {
  const hash = createHash('sha256').update(await readFile(p(rel))).digest('hex').slice(0, 8);
  return `/${rel}?v=${hash}`;
}

/* ── Helpers ─────────────────────────────────────────────── */

const esc = s =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Phần tử có nội dung đổi theo ngôn ngữ */
const t = key => `data-i18n="${key}"`;

const ARROW =
  '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">' +
  '<path d="M5.2 10.8 10.8 5.2M10.8 5.2H6.4M10.8 5.2v4.4" stroke="currentColor" stroke-width="1.6" ' +
  'stroke-linecap="round" stroke-linejoin="round"/></svg>';

const DOWNLOAD =
  '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">' +
  '<path d="M8 2.6v7.2m0 0L5.2 7M8 9.8 10.8 7M3 12.4h10" stroke="currentColor" stroke-width="1.6" ' +
  'stroke-linecap="round" stroke-linejoin="round"/></svg>';

const NUM = ['01', '02', '03'];

/* ── Các khối ────────────────────────────────────────────── */

const nav = () => {
  const links = Object.entries(en.nav)
    .map(
      ([key, label]) =>
        `<li><a class="nav-link" href="#${key === 'how' ? 'how' : key}" ${t(`nav.${key}`)}>${esc(label)}</a></li>`
    )
    .join('\n          ');

  return `<header class="nav">
      <nav class="wrap nav-inner" aria-label="Main">
        <a class="nav-mark" href="#top">NTV</a>
        <ul class="nav-links">
          ${links}
        </ul>
        <div class="lang" role="group" aria-label="Language">
          <button class="lang-btn" type="button" data-lang="vi" aria-pressed="false" lang="vi">VI</button>
          <span class="lang-sep" aria-hidden="true">|</span>
          <button class="lang-btn" type="button" data-lang="en" aria-pressed="true" lang="en">EN</button>
        </div>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-panel"
                data-i18n-attr="aria-label:ui.menu" aria-label="${esc(en.ui.menu)}">
          <span></span><span></span><span></span>
        </button>
      </nav>
      <div class="nav-panel" id="nav-panel">
        <ul class="wrap">
          ${links}
        </ul>
      </div>
    </header>`;
};

const hero = () => {
  const stats = en.hero.stats
    .map(
      (s, i) => `<div class="stat">
            <p class="stat-value" ${t(`hero.stats[${i}].value`)}>${esc(s.value)}</p>
            <p class="stat-label" ${t(`hero.stats[${i}].label`)}>${esc(s.label)}</p>
          </div>`
    )
    .join('\n          ');

  return `<section class="hero" id="top">
        <div class="wrap">
          <p class="hero-role rise" ${t('hero.role')}>${esc(en.hero.role)}</p>
          <h1 class="hero-name rise rise-1" ${t('hero.name')}>${esc(en.hero.name)}</h1>
          <p class="hero-statement rise rise-2" ${t('hero.statement')}>${esc(en.hero.statement)}</p>
          <p class="hero-sub rise rise-2" ${t('hero.sub')}>${esc(en.hero.sub)}</p>
          <div class="hero-cta rise rise-3">
            <a class="btn btn--primary" href="#work" ${t('hero.ctaPrimary')}>${esc(en.hero.ctaPrimary)}</a>
            <a class="btn btn--ghost" href="${esc(en.cv)}" download data-track-cv
               data-i18n-attr="href:cv">${DOWNLOAD}<span ${t('hero.ctaSecondary')}>${esc(en.hero.ctaSecondary)}</span></a>
          </div>
          <div class="hero-stats rise rise-3">
          ${stats}
          </div>
        </div>
      </section>`;
};

const layers = () => {
  const items = en.layers.items
    .map(
      (l, i) => `<li class="layer">
              <div class="layer-head">
                <span class="layer-num" aria-hidden="true">${NUM[i]}</span>
                <h3 class="layer-name" ${t(`layers.items[${i}].name`)}>${esc(l.name)}</h3>
              </div>
              <p class="layer-desc" ${t(`layers.items[${i}].desc`)}>${esc(l.desc)}</p>
              <ul class="tool-list">
                ${l.tools.map((tool, j) => `<li ${t(`layers.items[${i}].tools[${j}]`)}>${esc(tool)}</li>`).join('\n                ')}
              </ul>
              <p class="layer-proof">
                <span class="layer-proof-label" ${t('ui.proof')}>${esc(en.ui.proof)}</span>
                <span class="layer-proof-value" ${t(`layers.items[${i}].proof`)}>${esc(l.proof)}</span>
              </p>
            </li>`
    )
    .join('\n            ');

  return `<section class="section" id="how" aria-labelledby="how-title">
        <div class="wrap reveal">
          <p class="eyebrow" ${t('layers.eyebrow')}>${esc(en.layers.eyebrow)}</p>
          <h2 class="section-title" id="how-title" ${t('layers.title')}>${esc(en.layers.title)}</h2>
          <p class="section-intro measure" ${t('layers.intro')}>${esc(en.layers.intro)}</p>
          <ol class="layer-stack">
            ${items}
          </ol>
        </div>
      </section>`;
};

const work = () => {
  const cards = en.work.projects
    .map(
      (proj, i) => `<li class="work-card">
              <div class="browser">
                <div class="browser-bar" aria-hidden="true">
                  <span class="browser-dot"></span><span class="browser-dot"></span><span class="browser-dot"></span>
                  <span class="browser-url">${esc(proj.domain)}</span>
                </div>
                <img class="browser-shot" src="${ASSET[proj.slug]}" width="1440" height="900"
                     srcset="${ASSET[proj.slug + '720']} 720w, ${ASSET[proj.slug]} 1440w"
                     sizes="(min-width: 860px) 534px, calc(100vw - 66px)"
                     alt="${esc(proj.alt)}" data-i18n-attr="alt:work.projects[${i}].alt"
                     ${i === 0 ? 'decoding="async"' : 'loading="lazy" decoding="async"'}>
              </div>
              <div class="work-head">
                <h3><a class="work-link" href="${esc(proj.url)}" target="_blank" rel="noopener"
                   data-track-work="${esc(proj.domain)}">${esc(proj.domain)}${ARROW}</a></h3>
                <p class="work-meta" ${t(`work.projects[${i}].meta`)}>${esc(proj.meta)}</p>
              </div>
              <p class="work-desc" ${t(`work.projects[${i}].desc`)}>${esc(proj.desc)}</p>
              <ul class="work-bullets">
                ${proj.bullets.map((b, j) => `<li ${t(`work.projects[${i}].bullets[${j}]`)}>${esc(b)}</li>`).join('\n                ')}
              </ul>
            </li>`
    )
    .join('\n            ');

  return `<section class="section" id="work" aria-labelledby="work-title">
        <div class="wrap reveal">
          <p class="eyebrow" ${t('work.eyebrow')}>${esc(en.work.eyebrow)}</p>
          <h2 class="section-title" id="work-title" ${t('work.title')}>${esc(en.work.title)}</h2>
          <ul class="work-grid">
            ${cards}
          </ul>
        </div>
      </section>`;
};

const skills = () => {
  const groups = en.skills.groups
    .map(
      (g, i) => `<div class="skill-group">
              <h3 class="skill-label" ${t(`skills.groups[${i}].label`)}>${esc(g.label)}</h3>
              <ul class="skill-items">
                ${g.items.map((it, j) => `<li ${t(`skills.groups[${i}].items[${j}]`)}>${esc(it)}</li>`).join('\n                ')}
              </ul>
            </div>`
    )
    .join('\n            ');

  return `<section class="section" id="skills" aria-labelledby="skills-title">
        <div class="wrap reveal">
          <p class="eyebrow" ${t('skills.eyebrow')}>${esc(en.skills.eyebrow)}</p>
          <h2 class="section-title" id="skills-title" ${t('skills.title')}>${esc(en.skills.title)}</h2>
          <div class="skill-groups">
            ${groups}
          </div>
        </div>
      </section>`;
};

const experience = () => {
  const roles = en.experience.roles
    .map(
      (r, i) => `<li class="exp-item${r.nested ? ' exp-item--nested' : ''}">
              <p class="exp-period" ${t(`experience.roles[${i}].period`)}>${esc(r.period)}</p>
              <h3 class="exp-title" ${t(`experience.roles[${i}].title`)}>${esc(r.title)}</h3>
              <p class="exp-company">
                <span ${t(`experience.roles[${i}].company`)}>${esc(r.company)}</span>
                <span class="exp-type" ${t(`experience.roles[${i}].type`)}>${esc(r.type)}</span>
              </p>
            </li>`
    )
    .join('\n            ');

  const ed = en.experience.education;

  return `<section class="section" id="experience" aria-labelledby="experience-title">
        <div class="wrap reveal">
          <p class="eyebrow" ${t('experience.eyebrow')}>${esc(en.experience.eyebrow)}</p>
          <h2 class="section-title" id="experience-title" ${t('experience.title')}>${esc(en.experience.title)}</h2>
          <ol class="exp-list">
            ${roles}
          </ol>
          <div class="education">
            <p class="education-label" ${t('experience.education.label')}>${esc(ed.label)}</p>
            <p class="education-degree" ${t('experience.education.degree')}>${esc(ed.degree)}</p>
            <p class="education-meta">
              <span ${t('experience.education.school')}>${esc(ed.school)}</span> ·
              <span ${t('experience.education.period')}>${esc(ed.period)}</span>
            </p>
          </div>
        </div>
      </section>`;
};

const about = () => `<section class="section" id="about" aria-labelledby="about-title">
        <div class="wrap reveal">
          <p class="eyebrow" ${t('about.eyebrow')}>${esc(en.about.eyebrow)}</p>
          <h2 class="section-title" id="about-title" ${t('about.title')}>${esc(en.about.title)}</h2>
          <div class="about-grid">
            <img class="portrait" src="${ASSET.portrait}" width="190" height="190" loading="lazy" decoding="async"
                 alt="${esc(en.about.portraitAlt)}" data-i18n-attr="alt:about.portraitAlt">
            <p class="about-body" ${t('about.body')}>${esc(en.about.body)}</p>
          </div>
        </div>
      </section>`;

const contact = () => {
  const c = en.contact;
  const row = (labelKey, label, value) => `<div class="contact-row">
              <p class="contact-label" ${t(labelKey)}>${esc(label)}</p>
              <p class="contact-value">${value}</p>
            </div>`;

  return `<section class="section" id="contact" aria-labelledby="contact-title">
        <div class="wrap reveal">
          <p class="eyebrow" ${t('contact.eyebrow')}>${esc(c.eyebrow)}</p>
          <h2 class="section-title" id="contact-title" ${t('contact.title')}>${esc(c.title)}</h2>
          <p class="section-intro measure" ${t('contact.sub')}>${esc(c.sub)}</p>
          <div class="contact-list">
            ${row('contact.emailLabel', c.emailLabel, `<a href="mailto:${esc(c.email)}" data-track-contact="email" ${t('contact.email')}>${esc(c.email)}</a>`)}
            ${row('contact.phoneLabel', c.phoneLabel, `<a href="${esc(c.phoneHref)}" data-track-contact="phone" data-i18n-attr="href:contact.phoneHref" ${t('contact.phone')}>${esc(c.phone)}</a>`)}
            ${row('contact.linkedinLabel', c.linkedinLabel, `<a href="${esc(c.linkedinUrl)}" target="_blank" rel="noopener me" data-track-contact="linkedin" ${t('contact.linkedin')}>${esc(c.linkedin)}</a>`)}
            ${row('contact.locationLabel', c.locationLabel, `<span class="contact-value--plain" ${t('contact.location')}>${esc(c.location)}</span>`)}
          </div>
        </div>
      </section>`;
};

const jsonLd = () =>
  JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Nguyễn Thái Vinh',
    alternateName: 'Nguyen Thai Vinh',
    jobTitle: 'Digital Marketing Executive',
    email: `mailto:${en.contact.email}`,
    telephone: `+${en.contact.phoneHref.replace(/\D/g, '')}`,
    url: `${base}/`,
    image: abs('assets/img/portrait.jpg'),
    sameAs: [en.contact.linkedinUrl],
    address: { '@type': 'PostalAddress', addressLocality: 'Ho Chi Minh City', addressCountry: 'VN' },
    knowsAbout: [
      'Digital marketing',
      'Meta Ads',
      'Google Ads',
      'Google Analytics 4',
      'Google Tag Manager',
      'Technical SEO',
      'WordPress',
      'Looker Studio',
      'Conversion tracking',
    ],
    knowsLanguage: ['vi', 'en'],
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: 'Ho Chi Minh City University of Foreign Languages – Information Technology (HUFLIT)',
    },
    worksFor: { '@type': 'Organization', name: 'TP Plastic' },
  });

/* ── Ghép trang ──────────────────────────────────────────── */

/* Mỗi ảnh dự án có hai cỡ để srcset chọn: 1440 cho desktop retina,
   720 cho điện thoại. Card rộng tối đa 534px trên desktop. */
const ASSET = { portrait: await v('assets/img/portrait.jpg') };
for (const slug of ['shipstar', 'tpplasticusa', 'obbgel', 'oceantrading']) {
  ASSET[slug] = await v(`assets/img/work-${slug}.webp`);
  ASSET[slug + '720'] = await v(`assets/img/work-${slug}-720.webp`);
}

/* ── CSS nhúng thẳng vào <head> ───────────────────────────────
   Bốn file CSS rời là bốn request chặn render. Nhúng vào một khối
   <style> thì trang vẽ được ngay khi HTML về, không chờ vòng nào nữa
   — đo trên 4G mô phỏng: bớt được ~4 request và LCP ổn định hơn hẳn.
   Bốn file dưới styles/ vẫn là nơi để sửa, chỉ là không được fetch nữa.

   KHÔNG preload file font. Nghe ngược đời, nhưng đo rồi: hai file woff2
   subset latin nặng 60KB, preload xong chúng giành băng thông với chính
   CSS đang chặn render và đẩy LCP từ ~1.4s lên ~2.2s. font-display:swap
   đã lo phần hiển thị — chữ hiện ngay bằng font hệ thống rồi mới đổi,
   đổi lấy CLS 0.019 (ngưỡng 0.05).                                  */
const CSS_FILES = ['styles/fonts.css', 'styles/tokens.css', 'styles/base.css', 'styles/sections.css'];
const css = [];
for (const file of CSS_FILES) css.push(await readFile(p(file), 'utf8'));
if (!css[0].includes('/assets/fonts/')) {
  throw new Error('styles/fonts.css trống hoặc sai — chạy `npm run fonts` trước');
}
const inlineCss = `    <style>\n${css.join('\n')}    </style>\n`;

const srcEn = await v('content/en.json');
const srcVi = await v('content/vi.json');
const srcI18n = await v('scripts/i18n.js');
const srcUi = await v('scripts/ui.js');

const gtmHead = GTM_ID
  ? `\n    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
    var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;
    j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${GTM_ID}');</script>
    <!-- End Google Tag Manager -->`
  : `\n    <!-- TODO: chưa có GTM container ID. Điền GTM_ID trong site.config.mjs
         rồi chạy lại \`npm run build\` — snippet GTM sẽ được nhúng vào đây.
         Các sự kiện đã sẵn sàng trong window.dataLayer, không cần sửa JS. -->`;

const gtmBody = GTM_ID
  ? `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}"
      height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>\n    `
  : '';

const html = `<!doctype html>
<html lang="en" data-src-en="${srcEn}" data-src-vi="${srcVi}" data-i18n-src="${srcI18n}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(en.meta.title)}</title>
    <meta name="description" content="${esc(en.meta.description)}">
    <meta name="author" content="Nguyen Thai Vinh">
    <meta name="theme-color" content="#0B1720">
    <meta name="robots" content="index, follow, max-image-preview:large">
    <link rel="canonical" href="${base}/">
    <link rel="alternate" hreflang="en" href="${base}/">
    <link rel="alternate" hreflang="vi" href="${base}/?lang=vi">
    <link rel="alternate" hreflang="x-default" href="${base}/">

    <!-- Open Graph — og:image self-host trên chính domain này, 1200×630,
         URL tuyệt đối. Không đi qua CDN bên thứ ba (Mục 6.1). -->
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Nguyen Thai Vinh">
    <meta property="og:title" content="${esc(en.meta.title)}">
    <meta property="og:description" content="${esc(en.meta.description)}">
    <meta property="og:url" content="${base}/">
    <meta property="og:image" content="${abs('assets/img/og-image.jpg')}">
    <meta property="og:image:secure_url" content="${abs('assets/img/og-image.jpg')}">
    <meta property="og:image:type" content="image/jpeg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="Nguyen Thai Vinh — Digital Marketing Executive · Website &amp; Growth">
    <meta property="og:locale" content="en_US">
    <meta property="og:locale:alternate" content="vi_VN">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(en.meta.title)}">
    <meta name="twitter:description" content="${esc(en.meta.description)}">
    <meta name="twitter:image" content="${abs('assets/img/og-image.jpg')}">

    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="alternate icon" href="/favicon.ico" sizes="32x32">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">

${inlineCss}
    <script type="application/ld+json">${jsonLd()}</script>
${gtmHead}
    <script>
      /* Khởi động sớm: bắn fetch tiếng Việt ngay, trước khi module
         i18n.js kịp tải — đỡ nháy tiếng Anh một nhịp. Không đổi
         <html lang> ở đây: chữ trên trang lúc này vẫn là tiếng Anh.
         Không chặn render: không có request đồng bộ nào. */
      (function () {
        var el = document.documentElement, want = 'en';
        try {
          var q = new URLSearchParams(location.search).get('lang');
          want = q === 'vi' || q === 'en' ? q : localStorage.getItem('ntv-lang') || 'en';
        } catch (e) {}
        if (want !== 'vi') return;
        window.__i18nPreload = { lang: 'vi', promise: fetch(el.dataset.srcVi, { credentials: 'same-origin' }) };
      })();
    </script>
    <link rel="modulepreload" href="${srcI18n}">
    <script type="module" src="${srcUi}"></script>
  </head>

  <body>
    ${gtmBody}<a class="skip" href="#main" ${t('ui.skip')}>${esc(en.ui.skip)}</a>

    ${nav()}

    <main id="main">
      ${hero()}

      ${layers()}

      ${work()}

      ${skills()}

      ${experience()}

      ${about()}

      ${contact()}
    </main>

    <footer class="footer">
      <div class="wrap">
        <p ${t('footer')}>${esc(en.footer)}</p>
        <p ${t('hero.role')}>${esc(en.hero.role)}</p>
      </div>
    </footer>
  </body>
</html>
`;

await writeFile(p('index.html'), html, 'utf8');

/* ── sitemap.xml + robots.txt ────────────────────────────── */

/* lastmod KHONG duoc lay theo ngay chay build: build lai ma khong sua gi
   thi sitemap.xml co diff gia, va bao voi Google la trang vua doi trong khi
   khong doi. Lay ngay commit cuoi cua nhung file that su tao nen trang; neu
   file nao dang sua do (chua commit) thi dung hom nay, vi do chinh la ngay
   noi dung doi. Khong co git (vd tai zip ve) thi lui ve hom nay.          */
const SOURCES = [
  'content',
  'styles',
  'assets',
  'scripts/ui.js',
  'scripts/i18n.js',
  'scripts/build.mjs',
  'site.config.mjs',
];

function contentDate() {
  const today = new Date().toISOString().slice(0, 10);
  const git = (...args) =>
    execFileSync('git', args, {
      cwd: ROOT_DIR,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  try {
    if (git('status', '--porcelain', '--', ...SOURCES)) return today;
    return git('log', '-1', '--format=%cs', '--', ...SOURCES) || today;
  } catch {
    return today;
  }
}

const lastmod = contentDate();

await writeFile(
  p('sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${base}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${base}/"/>
    <xhtml:link rel="alternate" hreflang="vi" href="${base}/?lang=vi"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${base}/"/>
  </url>
</urlset>
`,
  'utf8'
);

await writeFile(
  p('robots.txt'),
  `# Cho index toàn bộ. Không chặn bot đọc thẻ preview:
# LinkedInBot, facebookexternalhit, Twitterbot đều được phép (Mục 6.1).
User-agent: *
Allow: /

Sitemap: ${base}/sitemap.xml
`,
  'utf8'
);

/* ── Kiểm tra nhanh ──────────────────────────────────────── */

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

const missing = keys(en).filter(k => !keys(vi).includes(k));
const extra = keys(vi).filter(k => !keys(en).includes(k));

console.log(`index.html   ${(html.length / 1024).toFixed(1)}KB`);
console.log('sitemap.xml  ok');
console.log('robots.txt   ok');
if (missing.length) console.log(`⚠ vi.json thiếu key: ${missing.join(', ')}`);
if (extra.length) console.log(`⚠ vi.json thừa key: ${extra.join(', ')}`);
if (base.includes('TODO')) {
  console.log('\n⚠ SITE_URL vẫn là TODO trong site.config.mjs.');
  console.log('  canonical / og:url / og:image đang trỏ sai host — LinkedIn sẽ không đọc được preview.');
  console.log('  Sau khi deploy, dán URL *.vercel.app vào đó rồi chạy lại `npm run build`.');
}
if (!GTM_ID) console.log('⚠ GTM_ID trống — chưa nhúng snippet GTM (đúng ý: không nhét ID giả).');
