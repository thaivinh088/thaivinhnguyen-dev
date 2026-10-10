# Portfolio — Nguyễn Thái Vinh

HTML + CSS + vanilla JS tĩnh, song ngữ EN/VI. Deploy: **Vercel**.
Spec đầy đủ ở [`PORTFOLIO-BRIEF.md`](PORTFOLIO-BRIEF.md).

## Sửa nội dung

Nội dung là nguồn duy nhất, nằm ở `content/en.json` và `content/vi.json`.
`index.html` được **sinh ra** từ `content/en.json`, không sửa tay.

```bash
npm run build
```

Sửa file JSON (hoặc file CSS) → chạy lệnh trên → commit cả `index.html` → push.
Vercel không chạy build, nó phục vụ thẳng `index.html` đã commit.

Push lên `main` là Vercel tự deploy (đã nối GitHub), branch khác được một preview
URL riêng. Vì Vercel phục vụ `index.html` đã commit chứ không tự sinh lại, **quên
`npm run build` là production im lặng phục vụ bản cũ** — không có lỗi nào báo.
Deploy tay bằng `vercel --prod --yes` vẫn dùng được khi cần.

Hai file JSON phải có **cùng bộ key**; `npm run build` sẽ báo nếu lệch.

## Bốn lệnh

| Lệnh | Làm gì |
|---|---|
| `npm run build` | Sinh `index.html`, `sitemap.xml`, `robots.txt` |
| `npm run fonts` | Tải woff2 từ Google Fonts về `assets/fonts/`, sinh `styles/fonts.css` |
| `npm run shots` | Chụp lại ảnh 4 website dự án → `assets/img/work-*.webp` |
| `npm run brand` | Sinh `og-image.jpg`, `favicon.svg`, `favicon.ico`, `apple-touch-icon.png` |

`npm run fonts` chỉ cần chạy lại khi đổi bộ chữ hoặc muốn cập nhật font từ Google.
Chạy xong nhớ `npm run build`, vì CSS được nhúng thẳng vào `index.html`.

Lần đầu:

```bash
npm install
npx playwright install chromium
```

`npm run shots -- obbgel` để chụp lại một site. **Mở ảnh ra xem bằng mắt trước khi
commit** — ảnh trắng hoặc dính popup thì chụp lại. Script đã ẩn sẵn popup cookie
và bong bóng chat (tawk.to, Zoho SalesIQ, WhatsApp, Zalo, Messenger).

## Việc phải làm sau lần deploy đầu

Cả hai thứ dưới đây nằm ở **một chỗ duy nhất**: [`site.config.mjs`](site.config.mjs).

1. **Domain.** Đã điền: `https://thaivinhnguyen.vercel.app`. Khi mua domain riêng
   thì đổi đúng dòng đó, chạy `npm run build`, push, rồi thêm domain trong Vercel —
   canonical, `og:url`, `og:image` và sitemap đều bám theo. Chỉ để **một** bản chính
   phục vụ nội dung, bản kia redirect, rồi chạy lại Post Inspector với domain mới.
2. **GTM.** `GTM_ID` đang trống nên snippet GTM chưa được nhúng (cố ý — không nhét
   ID giả). Điền `GTM-XXXXXXX` rồi `npm run build`. Các sự kiện `cv_download`,
   `work_link_click`, `contact_click`, `lang_switch` đã đẩy sẵn vào
   `window.dataLayer`, gắn GTM sau là nhận đủ, không phải sửa JS.

Rồi chạy [linkedin.com/post-inspector](https://www.linkedin.com/post-inspector/)
và [PageSpeed Insights](https://pagespeed.web.dev/) trên URL production thật.

## Cấu trúc

| Đường dẫn | Nội dung |
|---|---|
| `index.html` | **Sinh ra tự động** từ `content/en.json`. Đừng sửa tay |
| `content/*.json` | Toàn bộ nội dung song ngữ — nguồn duy nhất |
| `site.config.mjs` | Domain + ID tracking. Sửa xong nhớ `npm run build` |
| `styles/tokens.css` | Màu, font, khoảng cách. Sửa palette ở đây |
| `styles/base.css` | Reset, typography, thành phần dùng lại, chuyển động |
| `styles/sections.css` | Từng khối trên trang |
| `styles/fonts.css` | **Sinh ra tự động** bởi `npm run fonts`. Đừng sửa tay |
| `assets/fonts/*.woff2` | Font self-host, phải commit |
| `scripts/i18n.js` | Đổi ngôn ngữ, đẩy sự kiện xuống dataLayer |
| `scripts/ui.js` | Nav mobile, scroll reveal, bắt click để track |
| `scripts/build.mjs` | Sinh HTML/sitemap/robots |
| `scripts/fonts.mjs` | Tải font về self-host |
| `scripts/shots.mjs` | Chụp ảnh 4 website dự án |
| `scripts/brand.mjs` | Sinh og-image và favicon |
| `vercel.json` | Headers bảo mật + cache |

## Vài chỗ dễ vấp

- **Cache.** `/assets/img/`, `/styles/`, `/scripts/`, `/content/` cache 1 năm
  `immutable`. An toàn vì `build.mjs` gắn `?v=<hash nội dung>` vào mọi đường dẫn.
  Nếu thêm file mới được HTML tham chiếu thì phải cho nó đi qua hàm `v()` trong
  `build.mjs`, không thì người xem cũ sẽ dính bản cũ mãi.
  `og-image.jpg` (1 ngày) và `/assets/cv/` (1 giờ) không có `?v=` nên cache ngắn.
- **CSS nhúng thẳng vào HTML.** `build.mjs` gộp cả bốn file trong `styles/` vào một
  khối `<style>` trong `index.html`. Bốn file kia vẫn là chỗ để sửa, chỉ là trình
  duyệt không fetch nữa. Đo trên 4G mô phỏng: bớt 4 request chặn render, LCP ổn
  định hơn hẳn. **Sửa CSS xong bắt buộc chạy `npm run build`**, không thì không ăn.
- **Font self-host, và cố ý KHÔNG preload.** Hai file woff2 subset latin nặng 60KB;
  preload chúng thì chúng giành băng thông với chính CSS đang chặn render và đẩy
  LCP từ ~1,4s lên ~2,2s. `font-display: swap` lo phần hiển thị: chữ hiện ngay bằng
  font hệ thống rồi mới đổi, đổi lại CLS 0,019 (ngưỡng 0,05). Đừng thêm preload lại
  nếu chưa đo.
- **Subset font.** Mỗi bộ chữ tách ba file theo `unicode-range`: latin, latin-ext,
  vietnamese. Người đọc bản tiếng Anh chỉ tải 3 file latin (~75KB); bấm sang tiếng
  Việt mới kéo thêm phần vietnamese và latin-ext.
- **`lastmod` của sitemap bám nội dung, không bám ngày build.** `build.mjs` lấy
  ngày commit cuối của `content/`, `styles/`, `assets/`, `scripts/ui.js`,
  `scripts/i18n.js`, `scripts/build.mjs`, `site.config.mjs`; file nào đang sửa dở
  thì lấy hôm nay. Trước đây dùng thẳng `new Date()` nên build lại mà không sửa gì
  cũng ra diff giả trong `sitemap.xml` và báo với Google là trang vừa đổi. Thêm
  file nguồn mới thì nhớ thêm vào mảng `SOURCES`.
- **Ngôn ngữ.** Mặc định EN và render sẵn trong HTML, nên Google/LinkedIn đọc được
  khi không chạy JS. VI nạp qua fetch khi bấm đổi hoặc mở `?lang=vi`.
- **Đừng đặt `opacity` vào trạng thái nghỉ của `.reveal`.** Đã dính một lần: để
  `opacity: .7` thì mọi section chưa cuộn tới đều hiện ở 70%, kéo `--ink-muted`
  từ 7,5:1 xuống 4,28:1 và Lighthouse chấm trượt tương phản ở ~80 phần tử. Người
  mở trang mà không cuộn cũng thấy y như vậy. Hiệu ứng vào section chỉ dùng
  `transform`. Khi tự viết script đo tương phản, nhớ nhân opacity của cả cây cha
  — đọc mỗi `getComputedStyle().color` sẽ không thấy lỗi này.
