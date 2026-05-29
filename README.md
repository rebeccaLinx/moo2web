# moo2.tw ｜ 手作耳飾展示網站

> 以藍為調，手作每一副耳飾。  
> 技術文件 · 框架結構 · 使用說明

---

## 目錄

1. [專案概覽](#1-專案概覽)
2. [技術棧](#2-技術棧)
3. [目錄結構](#3-目錄結構)
4. [架構說明](#4-架構說明)
5. [設計系統](#5-設計系統)
6. [資料結構](#6-資料結構--pricesjson)
7. [元件文件](#7-元件文件)
8. [本地開發](#8-本地開發)
9. [部署到-github-pages](#9-部署到-github-pages)
10. [內容更新指南](#10-內容更新指南)
11. [常見問題](#11-常見問題)

---

## 1. 專案概覽

moo2.tw 是一個純靜態的耳環品牌價目展示網站，特色：

- **零後端**：所有商品資料存放在一個 JSON 檔，不需資料庫或伺服器
- **一鍵更新**：只需修改 `public/data/prices.json` 並 push，GitHub Actions 自動重新部署
- **日系設計**：明朝體 × 圓體字型、藍色系配色、金色點綴、紙質紋理背景
- **完整互動**：商品圖片燈箱、多圖輪播、耳夾/耳針篩選、顏色色卡

**線上網址：** https://rebeccaLinx.github.io/moo2web/  
**Instagram：** https://www.instagram.com/moo2.tw/  
**原始碼：** https://github.com/rebeccaLinx/moo2web

---

## 2. 技術棧

| 類別 | 技術 | 版本 | 說明 |
|---|---|---|---|
| 框架 | Next.js | 16.x | App Router，靜態輸出 |
| UI 函式庫 | React | 19.x | 元件化介面 |
| 語言 | TypeScript | 5.x | 靜態型別 |
| 樣式 | CSS Modules | — | 元件隔離樣式 |
| 全域樣式 | CSS Variables | — | 設計 token 系統 |
| 字型 | Google Fonts | — | Shippori Mincho + Zen Maru Gothic |
| 圖片 | next/image | — | 自動最佳化（靜態模式下停用） |
| 部署 | GitHub Actions | — | push 觸發自動部署 |
| 主機 | GitHub Pages | — | 免費靜態網站托管 |

---

## 3. 目錄結構

```
moo2web/
│
├── .github/
│   └── workflows/
│       └── deploy.yml          ← GitHub Actions 自動部署設定
│
├── public/
│   ├── data/
│   │   └── prices.json         ← ★ 商品資料（唯一需要定期修改的檔案）
│   └── images/                 ← 商品照片（對應 prices.json 的路徑）
│       ├── moon.png
│       ├── film3.png
│       └── ...
│
├── src/
│   ├── app/
│   │   ├── layout.tsx          ← 根佈局：HTML 結構、字型、metadata
│   │   ├── page.tsx            ← 首頁：組合所有區塊
│   │   ├── globals.css         ← 全域樣式：CSS 設計 token、reset、動畫
│   │   ├── page.module.css     ← (Next.js 預設，目前未使用)
│   │   └── favicon.ico
│   │
│   ├── components/
│   │   ├── Header.tsx          ← Hero 區：品牌名、副標、IG 按鈕
│   │   ├── Header.module.css
│   │   ├── ProductSection.tsx  ← 商品主體：篩選 tab + 商品格
│   │   ├── ProductSection.module.css
│   │   ├── ProductCard.tsx     ← 商品卡片：圖片、色卡、價格
│   │   ├── ProductCard.module.css
│   │   ├── ProductModal.tsx    ← 燈箱彈窗：多圖輪播、款式、顏色
│   │   ├── ProductModal.module.css
│   │   ├── IntroSection.tsx    ← 關於 moo2：深色漸層文字區塊
│   │   ├── IntroSection.module.css
│   │   ├── Footer.tsx          ← 頁尾：品牌名、IG 連結、版權
│   │   └── Footer.module.css
│   │
│   ├── lib/
│   │   └── imgPath.ts          ← ★ GitHub Pages basePath helper（見第 9 節）
│   │
│   └── types/
│       └── product.ts          ← TypeScript 型別定義
│
├── docs/
│   └── superpowers/plans/      ← 實作計畫文件（供開發參考）
│
├── next.config.ts              ← Next.js 設定（靜態輸出、basePath）
├── tsconfig.json               ← TypeScript 設定
├── package.json                ← 依賴套件與 npm 指令
└── .gitignore
```

### 重要檔案對應

| 想做什麼 | 修改哪個檔案 |
|---|---|
| 新增/修改商品、價格 | `public/data/prices.json` |
| 新增商品照片 | `public/images/` |
| 修改品牌標語、IG 連結 | `public/data/prices.json` → `instagram` 欄位；標語在 `src/components/Header.tsx` |
| 調整顏色主題 | `src/app/globals.css` → `:root` 區塊 |
| 修改頁面版型 | 對應的 `*.tsx` + `*.module.css` |

---

## 4. 架構說明

### 4.1 資料流

```
prices.json (build time)
    │
    ▼
src/app/page.tsx  ← Server Component，import JSON，傳入 props
    │
    ├── <Header instagram={...} />          Server Component（靜態）
    ├── <ProductSection products={...} />   Client Component（有互動）
    │       ├── <ProductCard />             Client Component（動畫、點擊）
    │       └── <ProductModal />            Client Component（彈窗、鍵盤）
    ├── <IntroSection intro={...} />        Server Component（靜態）
    └── <Footer instagram={...} />          Server Component（靜態）
```

### 4.2 Server vs Client Components

| 元件 | 類型 | 原因 |
|---|---|---|
| `Header` | Server | 純展示，無狀態 |
| `IntroSection` | Server | 純展示，無狀態 |
| `Footer` | Server | 純展示，無狀態 |
| `ProductSection` | Client | 管理篩選狀態、開啟 modal 狀態 |
| `ProductCard` | Client | IntersectionObserver 捲動淡入、圖片錯誤狀態 |
| `ProductModal` | Client | 鍵盤事件、圖片索引狀態、`document.body.style` |

> **規則**：只有「需要 `useState`、`useEffect`、事件監聽」的元件才加 `'use client'`。

### 4.3 靜態輸出原理

```
npm run build
    │
    ▼  (GITHUB_ACTIONS 環境變數)
next.config.ts
    ├── output: 'export'        → 產生 out/ 純靜態檔案
    ├── basePath: '/moo2web'    → 所有路徑加前綴（GitHub Pages 子目錄）
    └── images.unoptimized: true → 不使用 Vercel 圖片 API
```

本地開發時 `basePath` 為空（`''`），可直接用 `localhost:3000` 開啟。  
只有在 GitHub Actions CI 環境中（`GITHUB_ACTIONS=true`）才會套用 `/moo2web` 前綴。

---

## 5. 設計系統

### 5.1 色彩 Token

定義在 `src/app/globals.css` → `:root` 區塊：

```css
--ink:    #1b2a4a;   /* 深藍墨，主要文字 */
--indigo: #2d4a7c;   /* 靛藍，連結、按鈕 */
--blue:   #4a6fa5;   /* 中藍，副標題 */
--sky:    #8fb3d9;   /* 天藍，標籤文字 */
--mist:   #dce8f4;   /* 霧藍，邊框、hover 背景 */
--paper:  #f4f8fc;   /* 紙白，頁面背景 */
--cloud:  #ffffff;   /* 純白，卡片背景 */
--gold:   #c9a24b;   /* 金色，品牌點綴（分隔線、badge、dot） */
--accent: #3a5a8c;   /* 深靛，IG 按鈕 hover */
--line:   #cdddee;   /* 淡藍線條，卡片邊框、分隔線 */
```

### 5.2 字型系統

```css
--serif: "Shippori Mincho", serif;   /* 明朝體：品牌名、標題、價格 */
--sans:  "Zen Maru Gothic", sans-serif;  /* 圓體：內文、按鈕、描述 */
```

字型透過 `layout.tsx` 中的 `<link>` 從 Google Fonts 載入（runtime），不影響 build。

### 5.3 間距與形狀

```css
--radius: 18px;   /* 卡片圓角 */
--shadow: 0 4px 18px rgba(45, 74, 124, .07);  /* 卡片陰影 */
```

### 5.4 動畫

| 動畫 | 定義位置 | 使用元件 |
|---|---|---|
| `fadeUp` (CSS keyframe) | `globals.css` | `Header`：印章、品牌名、標語依序淡入 |
| 捲動淡入 | `ProductCard.tsx` → IntersectionObserver | 每張卡片進入視窗時從下方淡入，間隔 80ms |
| hover 浮起 | `ProductCard.module.css` | 商品卡 `translateY(-7px)` |
| modal 淡入 | `ProductModal.module.css` | 背景遮罩 rgba 透明度 |

---

## 6. 資料結構 / prices.json

位置：`public/data/prices.json`

### 頂層結構

```json
{
  "intro": "品牌簡介文字（顯示在 About 區塊）",
  "instagram": "https://www.instagram.com/moo2.tw/",
  "products": [ ...商品陣列... ]
}
```

### 商品物件結構

```json
{
  "id": "唯一英文 ID，不可重複",
  "name": "商品名稱",
  "images": [
    "/images/照片檔名1.jpg",
    "/images/照片檔名2.jpg"
  ],
  "description": "商品描述",
  "variants": [
    { "type": "耳夾", "price": 350 },
    { "type": "耳針", "price": 320 }
  ],
  "colors": [
    { "name": "顏色名稱", "hex": "#色碼" }
  ],
  "tag": "熱銷"
}
```

### 欄位說明

| 欄位 | 型別 | 必填 | 說明 |
|---|---|---|---|
| `id` | string | ✅ | 唯一識別碼，英文+連字號，不可重複 |
| `name` | string | ✅ | 商品中文名稱 |
| `images` | string[] | ✅ | 圖片路徑陣列；填 `[]` 則顯示 SVG 佔位插圖 |
| `description` | string | ✅ | 商品描述（顯示在卡片和彈窗） |
| `variants` | Variant[] | ✅ | 至少一筆；type 只能是 `"耳夾"` 或 `"耳針"` |
| `variants[].price` | number | ✅ | 新台幣，純數字不含 NT$ |
| `colors` | Color[] | ✅ | 可為空陣列 `[]`（不顯示色卡） |
| `colors[].hex` | string | ✅ | 格式：`"#rrggbb"` |
| `tag` | string | ✅ | 標籤文字；不想顯示填 `""` |

### 常用 tag 值

| 值 | 顯示效果 |
|---|---|
| `"熱銷"` | 金色圓角標籤 |
| `"新品"` | 金色圓角標籤 |
| `"限量"` | 金色圓角標籤 |
| `""` | 不顯示標籤 |

### TypeScript 型別定義

完整定義在 `src/types/product.ts`：

```typescript
export interface Variant {
  type: '耳夾' | '耳針'
  price: number
}

export interface Color {
  name: string
  hex: string
}

export interface Product {
  id: string
  name: string
  images: string[]
  description: string
  variants: Variant[]
  colors: Color[]
  tag: string
}

export interface PriceData {
  intro: string
  instagram: string
  products: Product[]
}
```

---

## 7. 元件文件

### Header

**檔案：** `src/components/Header.tsx`  
**類型：** Server Component  
**Props：** `{ instagram: string }`

Hero 區塊，頁面最頂部。包含：
- **品牌名**：`moo2.tw`，明朝體，金色句點，`fadeUp` 動畫 (0.1s delay)
- **副標**：`手作耳飾`，`fadeUp` 動畫 (0.2s delay)
- **詩意標語**：`fadeUp` 動畫 (0.3s delay)
- **IG 按鈕**：內嵌 SVG 圖示，hover 深色，`fadeUp` 動畫 (0.4s delay)
- **分隔線**：左右漸層線 + 金色菱形

修改品牌標語：直接編輯 `Header.tsx` 中的 `<p className={styles.tagline}>` 內容。

---

### ProductSection

**檔案：** `src/components/ProductSection.tsx`  
**類型：** Client Component (`'use client'`)  
**Props：** `{ products: Product[] }`

**狀態：**
```typescript
const [filter, setFilter]     = useState<Filter>('all')   // 目前選中的篩選
const [selected, setSelected] = useState<Product | null>(null)  // 開啟 modal 的商品
```

**篩選邏輯：**
- `filter === 'all'`：按 耳針 → 耳夾 順序分組，每組有 section 標題
- `filter === '耳針'` 或 `'耳夾'`：只顯示包含該 variant 的商品（一個商品同時有耳夾和耳針時，在「全部」下兩區都會出現）

**Sticky 導覽列：**
```
全部  ｜  耳針  ｜  耳夾
```
`backdrop-filter: blur(10px)` 毛玻璃效果，滾動時固定在頂部。

---

### ProductCard

**檔案：** `src/components/ProductCard.tsx`  
**類型：** Client Component (`'use client'`)  
**Props：** `{ product: Product; onClick: () => void; index?: number }`

**捲動淡入動畫：**
```typescript
useEffect(() => {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      setTimeout(() => setVisible(true), (index % 4) * 80)  // 每列錯開 80ms
    }
  }, { threshold: 0.1 })
  observer.observe(ref.current)
}, [index])
```
卡片初始 `opacity: 0; transform: translateY(22px)`，進入視窗後加 `.show` class。

**SVG 佔位圖：**  
當 `images` 為空或圖片載入失敗時，顯示三種耳環線稿 SVG（圓形、三角、雙珠），顏色從 `colors[0].hex` 自動計算。

**價格顯示邏輯：**
- 只有一種 variant → 顯示固定價格：`NT$ 290`
- 兩種 variants → 顯示最低價起：`NT$ 250 起`

---

### ProductModal

**檔案：** `src/components/ProductModal.tsx`  
**類型：** Client Component (`'use client'`)  
**Props：** `{ product: Product; onClose: () => void }`

**鍵盤操作：**
| 按鍵 | 功能 |
|---|---|
| `Esc` | 關閉彈窗 |
| `←` `→` | 切換圖片 |

**圖片切換：**
- `images.length === 1`：不顯示箭頭和縮圖列
- `images.length > 1`：左右箭頭 + 下方縮圖列，首/末張箭頭自動 disabled

**關閉方式：**
- 點擊背景遮罩
- 點擊右上角 ✕ 按鈕
- 按 Esc

**開啟時：** `document.body.style.overflow = 'hidden'`（防止背景滾動）  
**關閉時：** 恢復 `overflow = ''`

---

### IntroSection

**檔案：** `src/components/IntroSection.tsx`  
**類型：** Server Component  
**Props：** `{ intro: string }`

位於商品區塊下方，深藍漸層暗色卡片。文字來自 `prices.json → intro` 欄位。  
背景有「藍」字水印（`::after` pseudo-element）和圓形金邊裝飾（`::before`）。

---

### Footer

**檔案：** `src/components/Footer.tsx`  
**類型：** Server Component  
**Props：** `{ instagram: string }`

頁尾包含品牌名（金色句點）、IG 連結 × 2、版權文字。

---

## 8. 本地開發

### 前置需求

- **Node.js** 18.0 以上（建議 20.x LTS）
- **npm** 9.0 以上
- **Git**

版本確認：
```powershell
node --version   # v20.x.x
npm --version    # 10.x.x
```

### 安裝與啟動

```powershell
# 1. Clone 專案
git clone https://github.com/rebeccaLinx/moo2web.git
cd moo2web

# 2. 安裝依賴
npm install

# 3. 啟動開發伺服器
npm run dev
```

開啟瀏覽器：`http://localhost:3000`

> **注意：** 開發模式下 Hot Reload 自動生效，修改 `.tsx` 或 `.css` 後頁面即時更新。  
> 但修改 `prices.json` 需重新整理頁面（`Ctrl+R`）才能看到變化。

### 常用指令

```powershell
npm run dev     # 開發模式（hot reload）
npm run build   # 產生 out/ 靜態檔案
npm run lint    # ESLint 檢查
```

### 本地預覽靜態 build

```powershell
npm run build
npx serve out   # 預覽 out/ 目錄
```

開啟：`http://localhost:3000`

---

## 9. 部署到 GitHub Pages

### 9.1 自動部署流程

```
你的電腦 → git push → GitHub → 觸發 Actions → npm build → 上傳 out/ → GitHub Pages
```

每次 `git push origin master` 都會自動觸發，約 2–3 分鐘完成部署。

### 9.2 初次設定（只需做一次）

1. **啟用 GitHub Pages**  
   前往 `https://github.com/rebeccaLinx/moo2web/settings/pages`  
   → Source：選 **GitHub Actions**（不是 Branch）  
   → 按 Save

2. **確認 Actions 權限**  
   前往 `Settings → Actions → General → Workflow permissions`  
   → 選 **Read and write permissions**

### 9.3 GitHub Actions 設定說明

`.github/workflows/deploy.yml`：

```yaml
on:
  push:
    branches: [master]   # 只有 push 到 master 才觸發

permissions:
  pages: write           # 允許寫入 GitHub Pages
  id-token: write        # 允許 OIDC 驗證

jobs:
  build-and-deploy:
    steps:
      - run: npm ci             # 安裝依賴（比 npm install 更快、更穩定）
      - run: npm run build      # 產生 out/
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './out'         # 上傳 out/ 目錄到 Pages
      - uses: actions/deploy-pages@v4
```

### 9.4 手動 Push（繞過 Proxy）

本機有 HTTP proxy（192.168.8.251:8181），需用以下指令：

```powershell
# 設定含 token 的 remote URL
git remote set-url origin "https://$($env:GH_TOKEN)@github.com/rebeccaLinx/moo2web.git"

# 繞過 proxy + 使用 Windows schannel 憑證
git -c http.proxy="" -c http.sslBackend=schannel push -u origin main
```

> `GH_TOKEN` 需要有 `repo` 權限，可在 GitHub → Settings → Developer settings → Personal access tokens 建立。

---

## 10. 內容更新指南

### 10.1 修改品牌簡介

編輯 `public/data/prices.json`，修改 `intro` 欄位：

```json
{
  "intro": "新的品牌簡介文字..."
}
```

### 10.2 新增商品

在 `public/data/prices.json` → `products` 陣列新增一筆：

```json
{
  "id": "new-earring-2026",
  "name": "新款耳環名稱",
  "images": ["/images/new-photo.jpg"],
  "description": "商品描述，1–2 行",
  "variants": [
    { "type": "耳夾", "price": 320 }
  ],
  "colors": [
    { "name": "玫瑰金", "hex": "#C9A084" }
  ],
  "tag": "新品"
}
```

**注意事項：**
- `id` 必須唯一，建議用英文+連字號命名
- 每筆之間要有逗號（最後一筆不加）
- 照片放到 `public/images/`

### 10.3 新增商品照片

1. 照片建議規格：**正方形（1:1），最小 600×600px，JPG 或 WebP**
2. 將照片複製到 `public/images/`
3. 在 `prices.json` 對應商品的 `images` 填入路徑：
   ```json
   "images": ["/images/你的照片.jpg"]
   ```
4. 多張照片（燈箱輪播）：
   ```json
   "images": [
     "/images/商品正面.jpg",
     "/images/商品側面.jpg",
     "/images/配戴示意.jpg"
   ]
   ```

### 10.4 修改商品價格

找到對應商品，修改 `variants` 中的 `price`：

```json
"variants": [
  { "type": "耳夾", "price": 380 },
  { "type": "耳針", "price": 350 }
]
```

### 10.5 下架商品

直接從 `products` 陣列刪除整筆物件，並刪除對應照片（可選）。

### 10.6 修改顏色 Token

如需調整整站配色，編輯 `src/app/globals.css` → `:root`：

```css
:root {
  --gold: #c9a24b;   /* 修改金色 */
  --indigo: #2d4a7c; /* 修改靛藍 */
}
```

修改後需重新 build（`npm run build`）。

### 10.7 修改頁首標語

編輯 `src/components/Header.tsx`，找到以下程式碼並修改：

```tsx
<p className={styles.tagline}>
  以藍為調，手作每一副耳飾。<br />
  把海與天空的清透，輕輕別在耳邊。
</p>
```

---

## 11. 常見問題

### Q：修改了 prices.json，本地沒有看到變化？
**A：** `prices.json` 是在 build time 匯入的，開發模式下需重啟 `npm run dev`，或直接重新整理頁面（有時 Next.js Fast Refresh 不會偵測 JSON 變更）。

---

### Q：圖片顯示不出來？
**A：** 請確認：
1. 照片確實在 `public/images/` 資料夾內
2. `prices.json` 路徑以 `/images/` 開頭（不是 `./images/` 或 `images/`）
3. 檔名大小寫完全一致（Linux 伺服器區分大小寫）

沒有照片時，系統會自動顯示藍色系耳環 SVG 插圖，不影響功能。

---

### Q：本地 `npm run dev` 跑正常，但 GitHub Pages 圖片不顯示？
**A：** Next.js 16 不自動將 `basePath` 加到 `next/image` 的 `src`。  
所有圖片必須用 `imgPath()` helper 包住：
```tsx
import { imgPath } from '@/lib/imgPath'
<Image src={imgPath(product.images[0])} ... />
```
`imgPath()` 在 GitHub Actions 環境自動補 `/moo2web` 前綴，本機為空字串。

---

### Q：點縮圖後主圖沒有切換？
**A：** 已修正（commit `0f5c89d`）。原因是 `setIdx(0)` 和 keyboard handler 在同一個 `useEffect` 且 `idx` 在 deps 裡，導致切換時被重置。修法：拆成兩個獨立 `useEffect`。

---

### Q：新增了商品，但篩選「耳夾」時看不到？
**A：** 確認 `variants` 中有 `{ "type": "耳夾", ... }`。篩選邏輯是根據 variants 類型，不是其他欄位。

---

### Q：想讓商品同時出現在耳夾和耳針篩選結果中？
**A：** 在 `variants` 陣列中同時加入兩筆：
```json
"variants": [
  { "type": "耳夾", "price": 350 },
  { "type": "耳針", "price": 320 }
]
```
篩選「全部」時，該商品會分別出現在耳針區和耳夾區兩個 section 中。

---

### Q：Google Fonts 字型沒載入？
**A：** 字型需要瀏覽器能連上 `fonts.googleapis.com`。如果在某些網路環境下無法連線，網頁會 fallback 到系統 serif / sans-serif 字型，版面不受影響，只是沒有明朝體風格。

---

*文件版本：2026-05-29 ｜ moo2.tw Technical Documentation*
