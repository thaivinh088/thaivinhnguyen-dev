/* ─────────────────────────────────────────────────────────────
   fx.js — phần JS của fx.css: quầng sáng theo con trỏ trên thẻ dự án
   và chạy/dừng vòng lặp theo viewport. Ngân sách ≤ 3KB, không thư viện.
   Tắt JS thì trang vẫn đủ nội dung; giảm chuyển động thì không chạy gì.
   ───────────────────────────────────────────────────────────── */

const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!still) {
  /* Spotlight: chỉ thiết bị có chuột, đặt --mx/--my theo vị trí trong thẻ. */
  if (matchMedia('(hover: hover)').matches) {
    for (const card of document.querySelectorAll('.work-card')) {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
      card.addEventListener('pointerleave', () => {
        card.style.removeProperty('--mx');
        card.style.removeProperty('--my');
      });
    }
  }

  /* Vòng lặp chỉ chạy khi đang thấy trên màn hình. */
  const loop = document.querySelector('.fx-loop');
  if (loop && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      loop.dataset.state = entry.isIntersecting ? 'run' : 'paused';
    }, { threshold: 0.35 }).observe(loop);
  }
}
