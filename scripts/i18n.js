/* ─────────────────────────────────────────────────────────────
   i18n.js — chuyển ngôn ngữ VI / EN

   Tiếng Anh là mặc định và đã được render sẵn vào index.html
   (xem scripts/build.mjs), nên lần tải đầu không cần fetch gì.
   Chỉ khi đổi ngôn ngữ mới nạp content/{lang}.json rồi render
   vào các phần tử có data-i18n / data-i18n-attr.

   Không reload trang, không nhảy về đầu trang.
   ───────────────────────────────────────────────────────────── */

export const DEFAULT_LANG = 'en';
const SUPPORTED = ['en', 'vi'];
const STORAGE_KEY = 'ntv-lang';

const root = document.documentElement;
const cache = Object.create(null);

/* ── Đẩy sự kiện xuống dataLayer của GTM.
      Không có GTM thì mảng cứ nằm đó, vô hại. ───────────────── */
export function track(event, params = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}

/* ── localStorage có thể bị trình duyệt chặn ──────────────── */
function readStored() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStored(lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* chế độ riêng tư, hoặc cookie bị chặn — bỏ qua */
  }
}

/** Ngôn ngữ mong muốn: ?lang= > localStorage > mặc định */
export function wantedLang() {
  const fromUrl = new URLSearchParams(location.search).get('lang');
  if (SUPPORTED.includes(fromUrl)) return fromUrl;
  const stored = readStored();
  return SUPPORTED.includes(stored) ? stored : DEFAULT_LANG;
}

/** Đọc "a.b[0].c" trong object đã nạp */
function resolve(obj, path) {
  let cur = obj;
  for (const key of path.replace(/\[(\d+)\]/g, '.$1').split('.')) {
    if (cur == null) return undefined;
    cur = cur[key];
  }
  return cur;
}

async function fetchLang(lang) {
  const src = root.dataset[lang === 'vi' ? 'srcVi' : 'srcEn'];
  // Fetch có thể đã được khởi động sớm bởi đoạn inline trong <head>
  const early = window.__i18nPreload;
  let res;
  if (early && early.lang === lang) {
    res = await early.promise.catch(() => null);
  }
  if (!res) res = await fetch(src, { credentials: 'same-origin' });
  if (!res.ok) throw new Error(`${src} → HTTP ${res.status}`);
  return res.json();
}

function load(lang) {
  if (!cache[lang]) {
    cache[lang] = fetchLang(lang).catch(err => {
      delete cache[lang];             // hỏng thì lần sau thử lại
      throw err;
    });
  }
  return cache[lang];
}

function render(data) {
  for (const el of document.querySelectorAll('[data-i18n]')) {
    const value = resolve(data, el.dataset.i18n);
    if (typeof value === 'string') el.textContent = value;
  }
  // data-i18n-attr="alt:work.projects[0].alt, href:contact.linkedinUrl"
  for (const el of document.querySelectorAll('[data-i18n-attr]')) {
    for (const pair of el.dataset.i18nAttr.split(',')) {
      const idx = pair.indexOf(':');
      if (idx < 0) continue;
      const attr = pair.slice(0, idx).trim();
      const value = resolve(data, pair.slice(idx + 1).trim());
      if (typeof value === 'string') el.setAttribute(attr, value);
    }
  }
}

function syncButtons(lang) {
  for (const btn of document.querySelectorAll('.lang-btn')) {
    btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang));
  }
}

/** Cập nhật ?lang= mà không reload và không nhảy về đầu trang */
function syncUrl(lang) {
  const url = new URL(location.href);
  if (lang === DEFAULT_LANG) url.searchParams.delete('lang');
  else url.searchParams.set('lang', lang);
  history.replaceState(null, '', url.pathname + url.search + url.hash);
}

/* index.html luôn được render sẵn bằng tiếng Anh, nên trạng thái
   xuất phát luôn là 'en' — kể cả khi <html lang> đã bị đoạn inline
   trong <head> đổi trước. */
let current = DEFAULT_LANG;

export async function setLang(lang, { remember = true, fromUser = false } = {}) {
  if (!SUPPORTED.includes(lang)) return;
  syncButtons(lang);

  if (lang !== current) {
    let data;
    try {
      data = await load(lang);
    } catch (err) {
      syncButtons(current);          // giữ nguyên trạng thái cũ nếu nạp hỏng
      throw err;
    }
    /* Đổi ngôn ngữ là ghi lại text của gần như mọi phần tử cùng lúc,
       và câu tiếng Việt dài ngắn khác tiếng Anh nên chiều cao đổi theo.
       Tắt scroll anchoring rồi ghim lại đúng vị trí cũ để trang đứng yên. */
    const y = window.scrollY;
    root.style.overflowAnchor = 'none';
    render(data);
    const pin = () => window.scrollTo({ top: y, left: 0, behavior: 'instant' });
    pin();
    requestAnimationFrame(() => {
      pin();
      root.style.overflowAnchor = '';
    });

    root.lang = lang;
    document.title = data.meta.title;
    setMeta('name', 'description', data.meta.description);
    setMeta('property', 'og:title', data.meta.title);
    setMeta('property', 'og:description', data.meta.description);
    setMeta('property', 'og:locale', lang === 'vi' ? 'vi_VN' : 'en_US');
    current = lang;
  }

  syncUrl(lang);
  if (remember) writeStored(lang);
  if (fromUser) track('lang_switch', { lang });
}

function setMeta(keyAttr, key, value) {
  const el = document.head.querySelector(`meta[${keyAttr}="${key}"]`);
  if (el) el.setAttribute('content', value);
}

export function initLang() {
  const wanted = wantedLang();
  syncButtons(current);

  for (const btn of document.querySelectorAll('.lang-btn')) {
    btn.addEventListener('click', () => {
      setLang(btn.dataset.lang, { fromUser: true }).catch(err => {
        console.error('[i18n]', err.message);
      });
    });
  }

  if (wanted !== current) {
    setLang(wanted, { remember: false }).catch(err => {
      console.error('[i18n]', err.message);
    });
  }
}
