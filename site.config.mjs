/* ─────────────────────────────────────────────────────────────
   site.config.mjs — MỘT chỗ duy nhất để sửa domain và ID tracking.
   Sửa xong chạy lại `npm run build`.
   ───────────────────────────────────────────────────────────── */

/**
 * Domain đang phục vụ. Khi gắn domain riêng (vd thaivinhnguyen.com) thì đổi
 * dòng này, chạy `npm run build`, push — canonical, og:url, og:image và
 * sitemap đều bám theo. Không có dấu / ở cuối.
 */
export const SITE_URL = 'https://thaivinhnguyen.vercel.app';

/**
 * TODO — CHƯA CÓ GTM CONTAINER ID.
 * Điền dạng 'GTM-XXXXXXX' rồi chạy lại `npm run build`.
 * Để trống thì snippet GTM không được nhúng — không nhét ID giả.
 * Các sự kiện (cv_download, work_link_click, contact_click, lang_switch)
 * vẫn được đẩy vào window.dataLayer, GTM gắn sau là nhận đủ.
 */
export const GTM_ID = '';

/**
 * TODO — CHƯA CÓ GA4 MEASUREMENT ID ('G-XXXXXXXXXX').
 * GA4 nối qua GTM (Mục 6.3), nên ID này chỉ để ghi lại cho khỏi quên;
 * cấu hình thật nằm trong container GTM.
 */
export const GA4_ID = '';
