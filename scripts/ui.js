/* ─────────────────────────────────────────────────────────────
   ui.js — nav mobile, scroll reveal, và các sự kiện đẩy về GTM

   Không thư viện animation. Ba chỗ có chuyển động:
   hero khi load (CSS), section khi vào viewport (ở đây),
   hover trên card dự án (CSS).
   ───────────────────────────────────────────────────────────── */

/* Import động để lấy được ?v=<hash> của i18n.js — `import './i18n.js'`
   tĩnh sẽ mất query, mà /scripts/ được cache 1 năm immutable trên Vercel
   nên bản cũ sẽ dính lại mãi. URL có hash nằm ở data-i18n-src của <html>,
   và có <link rel="modulepreload"> trong <head> để tải song song. */
const { initLang, track } = await import(document.documentElement.dataset.i18nSrc);

initLang();

/* ── Nav trên điện thoại ─────────────────────────────────── */

const toggle = document.querySelector('.nav-toggle');
const panel = document.querySelector('.nav-panel');

if (toggle && panel) {
  const setOpen = open => {
    toggle.setAttribute('aria-expanded', String(open));
    panel.classList.toggle('is-open', open);
  };

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  panel.addEventListener('click', e => {
    if (e.target.closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });
}

/* ── Fade-up khi section vào viewport.
      Nội dung đã đọc được từ đầu (opacity .7), đây chỉ là lớp
      hoàn thiện — không có JS thì mọi thứ vẫn hiển thị. ─────── */

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const targets = document.querySelectorAll('.reveal');

if (reduced || !('IntersectionObserver' in window)) {
  for (const el of targets) el.classList.add('is-in');
} else {
  const io = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        obs.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.06 }
  );
  for (const el of targets) io.observe(el);
}

/* ── Sự kiện gửi về GA4 qua GTM ──────────────────────────── */

document.addEventListener('click', e => {
  const link = e.target.closest('a');
  if (!link) return;

  if (link.dataset.trackCv !== undefined) {
    track('cv_download', { lang: document.documentElement.lang });
    return;
  }

  if (link.dataset.trackWork) {
    track('work_link_click', { domain: link.dataset.trackWork });
    return;
  }

  if (link.dataset.trackContact) {
    track('contact_click', { method: link.dataset.trackContact });
  }
});
