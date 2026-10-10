# Spec — Portfolio thứ hai: Software Engineer · LLM & AI Automation

Ngày: 2026-10-09 · Nguồn: copy từ `E:\Porfolio` (site `thaivinhnguyen.vercel.app`)

## 1. Mục tiêu

- **Dùng để làm gì:** link đặt trong CV khi ứng tuyển AI Engineer / Software Engineer, mở đầu bằng tin
  *AI Engineer (LLM/RAG/AI Automation)* của NEXGEN BROS (hạn 31/10/2026).
- **Người đọc:** HR và tech lead, mở từ CV, phần lớn trên điện thoại, 60–90 giây.
- **Thành công khi:** trong 15 giây đầu người đọc hiểu *"kỹ sư phần mềm đưa tính năng LLM vào production,
  xây bằng AI agent, và hiểu e-commerce"*.
- **Không phải mục tiêu:** thay thế site marketing cũ (site cũ giữ nguyên), blog, form liên hệ.

## 2. Luật nội dung (kế thừa PORTFOLIO-BRIEF của site cũ)

1. **Không bịa số.** Mọi con số dưới đây đã đối chiếu với git log hoặc code. Không thêm số nào khác.
2. **Không nhận vơ.** MIA Agent ghi rõ là đóng gói từ Hermes Agent mã nguồn mở và làm *cùng mentor*.
   Chức danh ở TP Plastic giữ nguyên là *Digital Marketing Executive*.
3. **Không dùng chữ "RAG"** cho bất kỳ dự án nào — chưa có embedding / vector search. Dùng "truy xuất dữ liệu
   qua tool calling".
4. **Không đưa Box Phone US** (onlyflow-agent) vào site dưới bất kỳ hình thức nào.
5. **Không lộ dữ liệu kinh doanh.** Ảnh chụp nội bộ Shipstar phải che tên khách, giá, tồn kho trước khi đưa vào.
6. Không link GitHub (theo yêu cầu).

## 3. Cách làm (phương án A đã duyệt)

Copy nguyên site cũ sang repo mới, giữ code, bố cục, font, hiệu năng; thay nội dung, ảnh, CV, màu nhấn.
Phương án B (thêm khối sơ đồ kiến trúc) để sau, ngoài phạm vi spec này.

### 3.1 Repo và deploy

- Repo mới: `E:\Porfolio-Dev`. Copy từ `E:\Porfolio` **trừ**: `.git`, `node_modules`, `cv-tailored/`, `.vercel/`,
  `HANDOFF.md`, `PORTFOLIO-BRIEF.md`, `assets/img/work-*`, `assets/img/_reference-*`, `assets/cv/*`.
- Domain tạm: `https://thaivinhnguyen-dev.vercel.app` — một dòng trong `site.config.mjs`.
- Tạo repo GitHub và project Vercel: **hỏi người dùng trước khi làm** (hành động ra bên ngoài).

### 3.2 Thay đổi code (ngoài nội dung JSON)

| File | Thay đổi |
|---|---|
| `styles/tokens.css` | `--accent` `#3FB6C8` → `#6FD49A`; `--accent-dim`, `--accent-line` theo màu mới. `--accent-warm` giữ nguyên |
| `scripts/build.mjs` | JSON-LD: `jobTitle` → `Software Engineer`, `knowsAbout` theo kỹ năng mới; `og:image:alt` theo chức danh mới; danh sách slug ảnh **lấy từ `en.work.projects`** thay vì mảng cứng |
| `scripts/brand.mjs` | `ROLE` → `Software Engineer  ·  LLM &amp; AI Automation`; mã màu teal → `#6FD49A` |
| `scripts/shots.mjs` | Đích chụp: `mia` → miaai.vn, `shipstar` → shipstar.vn, `tinhhoa` → tinhhoa.tech |
| `site.config.mjs` | `SITE_URL` mới; `GTM_ID`, `GA4_ID` để trống |
| `README.md` | Cập nhật tên site, domain, bốn site chụp; trỏ về spec này thay cho PORTFOLIO-BRIEF |

### 3.3 Ảnh dự án

| Thẻ | Ảnh |
|---|---|
| Shipstar | Tạm: trang chủ shipstar.vn. Thay bằng ảnh copilot / soạn listing **người dùng tự chụp và che dữ liệu** khi có |
| MIA Platform | Chụp miaai.vn |
| MIA Agent | Ảnh chụp màn hình chính app desktop thật, người dùng gửi 2026-10-10 (đã cắt viền cửa sổ) |
| Tinh Hoa | Chụp tinhhoa.tech |

### 3.4 CV

- `assets/cv/CV-NguyenThaiVinh-VI.pdf` ← CV AI Engineer bản tiếng Việt hiện có (`E:\Porfolio\cv-tailored`).
- `assets/cv/CV-NguyenThaiVinh-EN.pdf` ← **bản tiếng Anh mới**, dịch từ bản tiếng Việt, cùng bố cục, 2 trang.
- Giữ tên file như site cũ để `i18n.js` không phải sửa.

### 3.5 Hiệu ứng (bổ sung, đã duyệt) — ý tưởng từ 21st.dev và Jitter, dựng bằng CSS/JS thuần

Không React, không Tailwind, không thư viện animation. Nới có chủ ý luật "chuyển động chỉ 3 chỗ" của site cũ.

| Vị trí | Hiệu ứng | Ý tưởng gốc |
|---|---|---|
| Hero | Câu định vị hiện dần từng cụm chữ (blur + translate → rõ), **một lần** khi tải. Nền lưới chấm mảnh, mask radial mờ ra mép, **tĩnh** | 21st *Blur Fade*, *Dot Pattern* |
| Cách tôi làm việc | SVG vòng lặp 3 nút Đặt luật → Chạy agent → Kiểm chứng; chấm sáng chạy dọc vòng, tới nút nào nút đó sáng. Nhãn là HTML (`data-i18n`) nên đổi VI/EN. Chỉ chạy khi khối trong viewport (IntersectionObserver), dừng khi ra ngoài. Danh sách 3 tầng chi tiết giữ nguyên bên dưới | Jitter vòng lặp |
| Thẻ dự án | Quầng sáng `--accent` theo con trỏ (biến CSS `--mx/--my` do JS đặt, chỉ trên thiết bị có hover) + viền sáng chạy quanh thẻ khi hover. Giữ `scale(1.02)` của ảnh | 21st *Spotlight Card*, *Border Beam* |
| Kỹ năng | Dải tên công nghệ trôi ngang, dừng khi hover; bản nhân đôi để lặp có `aria-hidden="true"`. Danh sách 4 nhóm đầy đủ giữ nguyên bên dưới | 21st *Marquee* |

Giới hạn bắt buộc:
- JS thêm ≤ 3KB chưa nén; tổng `scripts/*.js` được tải < 15KB chưa nén. PageSpeed mobile ≥ 90, CLS không tăng.
- Nội dung đọc được khi tắt JS. Trạng thái nghỉ của mọi phần tử **không** dùng `opacity` < 1 (bẫy tương phản README site cũ); chuyển cảnh chỉ dùng `transform`/`filter`/`opacity` trong lúc chạy.
- `prefers-reduced-motion: reduce` tắt toàn bộ: hero hiện ngay, vòng lặp tĩnh (3 nút cùng sáng), marquee đứng yên và xuống dòng.
- Vẫn cấm: số đếm nhảy, hạt bay, cursor tùy biến, parallax, blob/aurora.

## 4. Nội dung song ngữ — dùng đúng nguyên văn

Cấu trúc key giữ y như `content/en.json` hiện tại. Hai file phải cùng bộ key (build sẽ báo nếu lệch).

### 4.1 Meta

| | VI | EN |
|---|---|---|
| `title` | Nguyễn Thái Vinh — Software Engineer · LLM & AI Automation | Nguyen Thai Vinh — Software Engineer · LLM & AI Automation |
| `description` | Kỹ sư phần mềm đưa tính năng LLM vào production — copilot gọi tool, vision, MCP server — và xây chúng bằng Claude Code, Codex. Nền tảng e-commerce và martech. | A software engineer shipping LLM features to production — tool-calling copilots, vision, MCP servers — built with Claude Code and Codex. Background in e-commerce and martech. |

### 4.2 Hero

- **Tên:** Nguyễn Thái Vinh / Nguyen Thai Vinh
- **Chức danh (nhãn mono):** Software Engineer · LLM & AI Automation
- **Câu định vị:**
  - VI: *Tôi đưa tính năng LLM vào production, và xây chúng bằng chính AI agent.*
  - EN: *I ship LLM features to production, and I build them with AI agents.*
- **Câu phụ:**
  - VI: Cử nhân Kỹ thuật Phần mềm. Tham gia xây copilot gọi tool, đọc hóa đơn bằng vision và AI soạn listing trên nền tảng 3PL Shipstar; tự xây MCP server cho AI agent trên MIA Platform. Hơn 2 năm làm e-commerce nên hiểu bài toán của Founder, vận hành và marketing.
  - EN: Software engineering graduate. On Shipstar, a production 3PL platform, I helped build a tool-calling copilot, vision invoice reading and AI marketplace listings; on MIA Platform I built the MCP server that lets outside AI agents work safely. Two years in e-commerce taught me what founders, ops and marketing actually need.
- **CTA chính:** Xem dự án / See the work → `#work`
- **CTA phụ:** Tải CV (PDF) / Download CV (PDF)
- **Dải số liệu:**

| Số | VI | EN | Nguồn |
|---|---|---|---|
| 143 | hàm database copilot gọi làm tool | database functions the copilot calls as tools | code `ss-ai-chat` |
| 500+ | commit lên production Shipstar | commits shipped to Shipstar production | git, 08–09/2026 |
| 1.000+ / 1,000+ | commit điều phối agent trên MIA | commits orchestrating agents on MIA | git MIA Agent Website |
| 8.684 / 8,684 | chứng từ chuyển bằng Python, lệch 0 | records migrated in Python, zero variance | commit `nap 8.684 chung tu MISA` |

### 4.3 Cách tôi làm việc (thay khối "Ba tầng")

- Eyebrow: `CÁCH TÔI LÀM VIỆC` / `HOW I WORK`
- Tiêu đề: *Vòng lặp tôi vận hành agent* / *The loop I run my agents on*
- Dẫn nhập:
  - VI: AI agent viết code rất nhanh, nhưng code chạy được chưa chắc đã đáng tin. Tôi bọc agent trong ba bước, và không bước nào được bỏ qua.
  - EN: AI agents write code fast, but working code is not the same as trustworthy code. I wrap every agent in three steps, and none of them gets skipped.

**Tầng 1 — ĐẶT LUẬT / SPECIFY** (`id: specify`)
- VI: Viết spec, hợp đồng API và luật cho agent trước khi giao việc, để agent biết được làm gì và không được đụng vào đâu.
- EN: Write the spec, the API contract and the agent rules before handing anything off, so the agent knows what it may do and what it must not touch.
- Công cụ: CLAUDE.md · AGENTS.md · Spec & plan · zod contracts · Skills
- Chứng minh: AGENTS.md cho Codex trên Shipstar; hợp đồng API của MIA Platform / AGENTS.md for Codex on Shipstar; MIA Platform's API contracts

**Tầng 2 — CHẠY AGENT / RUN** (`id: run`)
- VI: Chia việc cho nhiều phiên Claude Code và Codex chạy song song trên git worktree riêng, một phiên quản lý giữ sổ quyết định.
- EN: Split work across parallel Claude Code and Codex sessions on separate git worktrees, with a manager session keeping the decision ledger.
- Công cụ: Claude Code · Codex · git worktree · MCP · Sub-agents
- Chứng minh: 1.000+ commit trên MIA Platform, chia làn FE / BE / 1,000+ commits on MIA Platform across FE / BE lanes

**Tầng 3 — KIỂM CHỨNG / VERIFY** (`id: verify`)
- VI: Không merge khi chưa có bằng chứng: test viết trước, CI chạy trên PostgreSQL thật, kiểm thử trình duyệt và quét bí mật.
- EN: Nothing merges without evidence: tests first, CI against a real PostgreSQL, browser tests and secret scanning.
- Công cụ: TDD · Vitest · Playwright · GitHub Actions · secretlint
- Chứng minh: pipeline CI của MIA Platform / MIA Platform's CI pipeline

### 4.4 Dự án — 4 thẻ, đúng thứ tự

Eyebrow: `DỰ ÁN` / `SELECTED WORK` · Tiêu đề: *Những gì tôi đã đưa lên chạy thật* / *Things I've put into production*

**1. Shipstar** — `slug: shipstar` · domain `shipstar.vn` · url `https://shipstar.vn`
- Meta: 06/2026 – 30/09/2026 · Nhóm 3 người · Product & Developer / 06/2026 – 30/09/2026 · Team of 3 · Product & Developer
- VI: Tính năng AI trên nền tảng 3PL xuyên biên giới Việt Nam → Mỹ đang chạy production.
- EN: AI features on a production cross-border 3PL platform, Vietnam → US.
- Bullets VI:
  - Copilot nội bộ gọi 143 hàm database làm tool; mọi thao tác ghi phải được người dùng duyệt trước khi chạy.
  - Đọc ảnh hóa đơn bằng vision thành dòng hóa đơn có cấu trúc và tự đối chiếu tổng tiền; phân loại email và soạn trả lời.
  - AI soạn listing Shopee / TikTok Shop từ tên hoặc link: Firecrawl đọc nguồn, Claude soạn nội dung và chọn ngành hàng; hàng tạo ở trạng thái ẩn / nháp chờ người duyệt.
  - Script Python chuyển 8.684 chứng từ MISA sang Shipstar, đối soát lệch 0; import khoảng 650 SKU kèm vị trí kho, kệ.
- Bullets EN:
  - An internal copilot that calls 143 database functions as tools; every write needs the user's approval before it runs.
  - Vision reads invoice photos into structured line items and checks the totals; email gets classified and a reply drafted.
  - AI marketplace listings for Shopee / TikTok Shop from a name or link: Firecrawl reads the source, Claude writes the copy and picks the category; items are created hidden / as drafts for human review.
  - Python scripts migrated 8,684 MISA accounting records into Shipstar with zero variance; imported ~650 SKUs with warehouse and shelf locations.
- Alt (tạm): Trang chủ shipstar.vn — nền tảng 3PL xuyên biên giới / shipstar.vn homepage — cross-border 3PL platform

**2. MIA Platform** — `slug: mia` · domain `miaai.vn` · url `https://miaai.vn`
- Meta: 09–10/2026 · Cá nhân · Full-stack / 09–10/2026 · Solo · Full-stack
- VI: Nền tảng bán và cấp phát trợ lý AI: website, cổng khách hàng và trang quản trị.
- EN: A platform that sells and provisions AI assistants: website, customer portal and admin.
- Bullets VI:
  - Agent API và MCP server tự viết (JSON-RPC 2.0, không thư viện ngoài): AI agent bên ngoài chỉ đọc bằng khóa có phạm vi, mọi thao tác ghi thành đề xuất chờ người duyệt.
  - Thanh toán VietQR, cấp phát gói trợ lý và control plane cấp quota qua cổng LLM API.
  - Một phiên Claude Code quản lý chia việc cho các phiên FE / BE theo hợp đồng API — hơn 1.000 commit.
  - Fastify · Drizzle · PostgreSQL · React · Docker Compose · Caddy · GitHub Actions.
- Bullets EN:
  - A hand-written Agent API and MCP server (JSON-RPC 2.0, no external libraries): outside AI agents get read-only, scoped keys, and every write becomes a proposal waiting for human approval.
  - VietQR payments, assistant provisioning and a control plane that allocates quota through an LLM API gateway.
  - A manager Claude Code session splits work across FE / BE sessions against an API contract — 1,000+ commits.
  - Fastify · Drizzle · PostgreSQL · React · Docker Compose · Caddy · GitHub Actions.
- Alt: Trang chủ miaai.vn — nền tảng trợ lý AI MIA / miaai.vn homepage — MIA AI assistant platform

**3. MIA Agent** — `slug: mia-agent` · domain hiển thị `MIA Agent · desktop` · url `https://miaai.vn`
- Meta: 09/2026 · Cùng mentor · Đóng gói & Việt hóa / 09/2026 · With my mentor · Packaging & localisation
- VI: Trợ lý AI desktop đóng gói từ Hermes Agent, agent mã nguồn mở của Nous Research.
- EN: A desktop AI assistant packaged from Hermes Agent, Nous Research's open-source agent.
- Bullets VI:
  - Đóng gói và Việt hóa thành ứng dụng Electron với backend Python.
  - Agent có tool calling, memory, skill, MCP, lịch cron và sub-agent; chọn được nhiều nhà cung cấp LLM.
  - Nghiên cứu và viết tài liệu tiếng Việt về kiến trúc agent: lớp LLM, công cụ, memory, nén context, bảo mật.
- Bullets EN:
  - Packaged and localised into Vietnamese as an Electron app with a Python backend.
  - The agent handles tool calling, memory, skills, MCP, cron schedules and sub-agents, across multiple LLM providers.
  - Researched and documented the agent architecture in Vietnamese: LLM layer, tools, memory, context compression, security.
- Alt: Ứng dụng desktop MIA Agent / MIA Agent desktop app

**4. Tinh Hoa** — `slug: tinhhoa` · domain `tinhhoa.tech` · url `https://tinhhoa.tech`
- Meta: 08/2026 · Xây cùng Claude Code / 08/2026 · Built with Claude Code
- VI: Website TMĐT B2B bán và cho thuê thiết bị văn phòng.
- EN: A B2B e-commerce site that sells and rents office equipment.
- Bullets VI:
  - Giỏ hàng, đặt hàng, tra cứu đơn và form thu lead.
  - Thuê thiết bị có cọc, kiểm tra trùng lịch để một máy không bị cho thuê hai lần.
  - Trang quản trị và email báo đơn mới qua Resend.
  - Next.js 15 · Supabase (PostgreSQL, Auth, RLS) · Vercel.
- Bullets EN:
  - Cart, checkout, order lookup and lead forms.
  - Equipment rental with deposits and an availability check so one unit is never double-booked.
  - An admin panel and new-order emails through Resend.
  - Next.js 15 · Supabase (PostgreSQL, Auth, RLS) · Vercel.
- Alt: Trang chủ tinhhoa.tech — thiết bị công nghệ cho doanh nghiệp / tinhhoa.tech homepage — technology equipment for businesses

### 4.5 Kỹ năng

Eyebrow: `NĂNG LỰC` / `CAPABILITIES` · Tiêu đề giữ như site cũ.

| Nhóm VI | Nhóm EN | Nội dung |
|---|---|---|
| AI agent & LLM | AI Agents & LLMs | Claude API (tool calling, vision, streaming, prompt caching) · MCP server · Claude Code · Codex · truy xuất dữ liệu qua tool / tool-based data retrieval · human-in-the-loop · CLAUDE.md / AGENTS.md |
| Backend & dữ liệu | Backend & Data | Python · TypeScript · Node.js · Fastify · REST API · PostgreSQL · Supabase · Drizzle ORM · parsing Excel / CSV · pg_trgm + unaccent |
| Frontend & DevOps | Frontend & DevOps | React · Next.js · Docker Compose · Caddy · GitHub Actions · Vercel · Vitest · Playwright · TDD |
| Domain e-commerce | E-commerce Domain | Shopee / TikTok Shop API · Temu · Walmart · nhãn vận chuyển / shipping labels · báo cáo lãi lỗ TMĐT / e-commerce P&L · Meta & Google Ads · GA4 · MISA · Zoho |

### 4.6 Kinh nghiệm

| Thời gian | Vị trí | Công ty | Loại hình | Lồng |
|---|---|---|---|---|
| 03/2024 – nay / Present | Digital Marketing Executive | TP Plastic | Toàn thời gian / Full-time | không |
| 06/2026 – 30/09/2026 | Product & Developer (Shipstar) | TP Plastic | Dự án nội bộ, kiêm nhiệm / Internal project, concurrent | có |
| 07/2026 | EstateHub CRM — Next.js, Supabase, Web Push | Cá nhân / Personal | Dự án cá nhân / Side project | không |
| 06/2023 – 12/2023 | Software Deployment Staff | NINA | Toàn thời gian / Full-time | không |
| 12/2022 – 03/2023 | Front-end Developer | MYVINA | Thực tập / Internship | không |
| 05/2022 – 10/2022 | Website Administrator | DEEP VIETNAM | Bán thời gian / Part-time | không |

Học vấn: giữ nguyên như site cũ (Cử nhân Kỹ thuật Phần mềm — HUFLIT, 2019–2023).

### 4.7 Giới thiệu

- VI: Tôi học kỹ thuật phần mềm, rồi làm marketing hơn hai năm cho một nhà sản xuất bán hàng sang Mỹ. Những năm đó dạy tôi người dùng một tính năng AI thực sự cần gì: đội vận hành cần nhập hóa đơn nhanh hơn, sale cần tra hàng mà không phải hỏi ai, chủ shop cần lên listing mà không gõ tay. Năm 2026 tôi quay lại viết code, lần này cùng AI agent. Việc tôi làm tốt không nằm ở chỗ gõ prompt, mà ở chỗ đặt luật và dựng bước kiểm chứng để thứ agent làm ra đáng tin: thao tác ghi vào database luôn có người duyệt, và không commit nào lên production khi chưa có test.
- EN: I trained as a software engineer, then spent two years in marketing for a manufacturer selling into the US. Those years taught me what the people using an AI feature actually need: ops wants invoices entered faster, sales wants stock answers without asking anyone, a shop owner wants listings without typing them. In 2026 I went back to writing code, this time alongside AI agents. What I'm good at is not the prompting; it's the rules and the verification that make agent output trustworthy — every database write has a human approving it, and nothing reaches production without tests.

### 4.8 Liên hệ

- Eyebrow: `LIÊN HỆ` / `CONTACT`
- Tiêu đề: *Đang tìm vị trí Software / AI Engineer* / *Open to Software / AI Engineer roles*
- Câu phụ: VI *Ưu tiên e-commerce, martech hoặc tự động hóa vận hành bằng AI.* / EN *Ideally e-commerce, martech, or AI automation for operations.*
- Email, điện thoại, LinkedIn, khu vực: giữ nguyên như site cũ. Không GitHub.

### 4.9 Các key còn lại

Giữ nguyên như site cũ, không sửa chữ: `nav.*` (`nav.how` = "Cách làm việc" / "How I work"), `work.viewSite`,
`skills.title` ("Năng lực chuyên môn" / "Capabilities"), `experience.title`, `about.title`, `about.portraitAlt`,
`cv` (đường dẫn file giữ nguyên, chỉ thay nội dung PDF), `footer` ("© 2026 Nguyễn Thái Vinh"), `ui.*`.
Chỉ `work.title` đổi như mục 4.4.

## 5. Kiểm chứng trước khi giao

1. `npm run build` không lỗi; hai file JSON cùng bộ key.
2. Tương phản: `--accent` mới và `--ink-muted` trên `--ground` ≥ 4.5:1 (đo, không ước lượng).
3. Xem ở 360px và 1280px; không cuộn ngang; mở từng ảnh dự án bằng mắt.
4. Lighthouse local (mobile): Performance ≥ 90, Accessibility, SEO, Best Practices không tụt so với site cũ.
5. Tải hai CV (EN, VI) từ trang; mở PDF xem đúng bản AI Engineer.
6. JSON-LD và thẻ og mang chức danh mới; `og:image` sinh lại với màu và chức danh mới.
7. Hiệu ứng: đúng 4 chỗ ở mục 3.5; tắt hết khi bật reduced-motion; ngân sách JS đạt; không phần tử nào nghỉ ở opacity < 1.
8. Rà lại toàn bộ chữ trên trang: không còn sót chữ "marketing executive" ở chỗ không phải mục kinh nghiệm, không có chữ "RAG".

## 6. Ngoài phạm vi

- Sơ đồ kiến trúc (phương án B), domain riêng, GTM/GA4, Box Phone US.
- Dùng trực tiếp component React của 21st.dev hoặc file Jitter/Lottie (đã chọn dựng lại bằng CSS/SVG).
- Ảnh chụp nội bộ Shipstar và ảnh app MIA Agent — chờ người dùng gửi, thay sau.
