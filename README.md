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
- **日系設計**：明朝體 × 圓體字型、藍色系配色、金色點綴
- **完整互動**：商品圖片燈箱、多圖輪播、耳夾/耳勾篩選、顏色色卡、款式/尺寸選項

**線上網址：** https://rebeccaLinx.github.io/moo2web/  
**Instagram：** https://www.instagram.com/moo2.tw/  
**原始碼：** https://github.com/rebeccaLinx/moo2web

---

## 2. 技術棧

| 類別 | 技術 | 版本 | 說明 |
|---|---|---|---|
| 框架 | Next.js | 16.2.6 | App Router，靜態輸出 |
| UI 函式庫 | React | 19.2.4 | 元件化介面 |
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
│       ├── smallFlower/
│       ├── goldflowerball_1/
│       └── ...
│
├── src/
│   ├── app/
│   │   ├── layout.tsx          ← 根佈局：HTML 結構、字型、metadata
│   │   ├── page.tsx            ← 首頁：組合所有區塊
│   │   ├── globals.css         ← 全域樣式：CSS 設計 token、reset、動畫
│   │   └── favicon.ico
│   │
│   ├── components/
│   │   ├── Header.tsx          ← Hero 區：品牌名、副標、IG 按鈕
│   │   ├── ProductSection.tsx  ← 商品主體：篩選 tab + 商品格
│   │   ├── ProductCard.tsx     ← 商品卡片：圖片、色卡、價格
│   │   ├── ProductModal.tsx    ← 燈箱彈窗：多圖輪播、顏色、款式、尺寸
│   │   ├── IntroSection.tsx    ← 關於 moo2：深色漸層文字區塊
│   │   ├── Footer.tsx          ← 頁尾：品牌名、IG 連結、版權
│   │   └── *.module.css        ← 各元件對應樣式
│   │
│   ├── lib/
│   │   ├── imgPath.ts          ← GitHub Pages basePath helper
│   │   ├── hexToBackground.ts  ← 單色/雙色 hex 轉 CSS background
│   │   └── variantCategory.ts  ← 款式分類（耳勾/耳針 vs 耳夾）
│   │
│   └── types/
│       └── product.ts          ← TypeScript 型別定義
│
├── next.config.ts              ← Next.js 設定（靜態輸出、basePath）
├── tsconfig.json
└── package.json
```

### 重要檔案對應

| 想做什麼 | 修改哪個檔案 |
|---|---|
| 新增/修改商品、價格 | `public/data/prices.json` |
| 新增商品照片 | `public/images/` |
| 修改品牌標語、IG 連結 | `public/data/prices.json` → `instagram`；標語在 `Header.tsx` |
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
| `ProductCard` | Client | IntersectionObserver 捲動淡入、顏色選取狀態 |
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
只有在 GitHub Actions CI 環境中（`GITHUB_ACTIONS=true`）才套用 `/moo2web` 前綴。

---

## 5. 設計系統

### 5.1 色彩 Token

定義在 `src/app/globals.css` → `:root`：

```css
--ink:    #1b2a4a;   /* 深藍墨，主要文字 */
--indigo: #2d4a7c;   /* 靛藍，連結、按鈕 */
--blue:   #4a6fa5;   /* 中藍，副標題 */
--sky:    #8fb3d9;   /* 天藍，標籤文字 */
--mist:   #dce8f4;   /* 霧藍，邊框、hover 背景 */
--paper:  #f4f8fc;   /* 紙白，頁面背景 */
--cloud:  #ffffff;   /* 純白，卡片背景 */
--gold:   #c9a24b;   /* 金色，品牌點綴 */
--accent: #3a5a8c;   /* 深靛，IG 按鈕 hover */
--line:   #cdddee;   /* 淡藍線條，卡片邊框 */
```

### 5.2 字型系統

```css
--serif: "Shippori Mincho", serif;       /* 明朝體：品牌名、標題、價格 */
--sans:  "Zen Maru Gothic", sans-serif;  /* 圓體：內文、按鈕、描述 */
```

字型透過 `layout.tsx` 的 `<link>` 從 Google Fonts 載入（runtime），不影響 build。

### 5.3 間距與形狀

```css
--radius: 18px;
--shadow: 0 4px 18px rgba(45, 74, 124, .07);
```

### 5.4 動畫

| 動畫 | 定義位置 | 使用元件 |
|---|---|---|
| `fadeUp` (CSS keyframe) | `globals.css` | `Header`：印章、品牌名、標語依序淡入 |
| 捲動淡入 | `ProductCard.tsx` → IntersectionObserver | 每張卡片進入視窗時從下方淡入，間隔 80ms |
| hover 浮起 | `ProductCard.module.css` | 商品卡 `translateY(-7px)` |

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

### 商品物件完整範例

```json
{
  "id": "small-flowers",
  "name": "迷你小花花",
  "images": [
    "/images/smallFlower/s1.jpg",
    "/images/smallFlower/s2.jpg"
  ],
  "description": "超可愛迷你小花花",
  "variants": [
    { "type": "耳夾", "price": 250 },
    { "type": "耳針", "price": 250 },
    { "type": "無吊墜+耳勾", "price": 350, "image": "/images/smallFlower/hook.jpg" }
  ],
  "colors": [
    { "name": "白", "hex": "#F0EDE8", "image": "/images/smallFlower/w1.jpg" },
    { "name": "黑粉", "hex": ["#F39EB6", "#080616"] }
  ],
  "sizes": [
    { "name": "小 (5mm)", "price": 250 },
    { "name": "大 (8mm)", "price": 300, "image": "/images/smallFlower/large.jpg" }
  ],
  "tag": "熱銷",
  "promotion": { "quantity": 2, "price": 480 }
}
```

### 欄位說明

| 欄位 | 型別 | 必填 | 說明 |
|---|---|---|---|
| `id` | string | ✅ | 唯一識別碼，英文+連字號，不可重複 |
| `name` | string | ✅ | 商品中文名稱 |
| `images` | string[] | ✅ | 主圖陣列；`images[0]` 為預設顯示圖；填 `[]` 顯示 SVG 佔位插圖 |
| `description` | string | ✅ | 商品描述（卡片和彈窗皆顯示） |
| `variants` | Variant[] | ✅ | 至少一筆，款式與售價 |
| `variants[].type` | string | ✅ | 款式名稱，任意字串（如 `"耳夾"`、`"無吊墜+耳勾"`） |
| `variants[].price` | number | ✅ | 新台幣，純數字 |
| `variants[].image` | string | — | 選填；點擊此款式時跳至對應圖片 |
| `colors` | Color[] | ✅ | 可為空陣列 `[]`（不顯示色卡） |
| `colors[].hex` | string \| [string, string] | ✅ | 單色：`"#rrggbb"`；雙色：`["#色1", "#色2"]`（左右各半） |
| `colors[].image` | string | — | 選填；點擊色塊時主圖切換，**不需在 `images[]` 中預先列出** |
| `sizes` | Size[] | — | 選填；尺寸選項，有填才顯示 |
| `sizes[].name` | string | ✅ | 尺寸名稱，如 `"小 (5mm)"` |
| `sizes[].price` | number | — | 選填；有填才在 Modal 顯示價格 |
| `sizes[].image` | string | — | 選填；點擊此尺寸時跳至對應圖片 |
| `tag` | string | ✅ | 標籤文字；不想顯示填 `""` |
| `promotion` | object | — | 選填；`{ quantity: 數量, price: 優惠總價 }` |

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
  type: string         // 款式名稱（任意字串）
  price: number
  image?: string       // 選填，點款式時跳至此圖
}

export interface Color {
  name: string
  hex: string | [string, string]   // 單色或雙色漸層
  image?: string                   // 選填，點色塊時切換主圖
}

export interface Size {
  name: string
  price?: number       // 選填，沒有價差可省略
  image?: string       // 選填，點尺寸時跳至此圖
}

export interface Promotion {
  quantity: number     // 優惠數量
  price: number        // 優惠總價
}

export interface Product {
  id: string
  name: string
  images: string[]
  description: string
  variants: Variant[]
  colors: Color[]
  sizes?: Size[]       // 選填
  tag: string
  promotion?: Promotion
}
```

---

## 7. 元件文件

### Header

**檔案：** `src/components/Header.tsx` ｜ **類型：** Server Component  
**Props：** `{ instagram: string }`

Hero 區塊，頁面最頂部。包含品牌名、副標、詩意標語、IG 按鈕、金色分隔線，各元素依序 `fadeUp` 淡入。

修改標語：編輯 `Header.tsx` 中的 `<p className={styles.tagline}>` 內容。

---

### ProductSection

**檔案：** `src/components/ProductSection.tsx` ｜ **類型：** Client Component  
**Props：** `{ products: Product[] }`

**篩選 Tab：**

```text
全部  ｜  耳勾/耳針  ｜  耳夾
```

分類邏輯由 `src/lib/variantCategory.ts` 的 `getVariantCategory()` 決定：
- type 字串含 `"耳勾"` 或 `"耳針"` → `earHook`（耳勾/耳針）
- 其餘 → `earClip`（耳夾）

**篩選行為：**
- `全部`：按 耳勾/耳針 → 耳夾 順序分組，每組有 section 標題
- 單一 tab：只顯示包含該分類 variant 的商品

**狀態：**
```typescript
const [filter, setFilter]     = useState<'all' | VariantCategory>('all')
const [selected, setSelected] = useState<{ product: Product; colorIdx: number } | null>(null)
```

---

### ProductCard

**檔案：** `src/components/ProductCard.tsx` ｜ **類型：** Client Component  
**Props：** `{ product: Product; onClick: (colorIdx: number) => void; index?: number }`

**捲動淡入：** IntersectionObserver，每列錯開 80ms（`(index % 4) * 80`）

**SVG 佔位圖：** `images` 為空或圖片載入失敗時，顯示藍色系耳環線稿，顏色從 `colors[0].hex` 自動計算

**價格邏輯：**
- 單一 variant → 顯示固定價格
- 多筆 variant → 顯示最低價 + 「起」

**色塊點擊：** 點擊有 `image` 的顏色 → 卡片主圖切換；`selectedColorIdx` 傳給 modal 作為 `initialColorIdx`

---

### ProductModal

**檔案：** `src/components/ProductModal.tsx` ｜ **類型：** Client Component  
**Props：** `{ product: Product; onClose: () => void; initialColorIdx?: number }`  
**掛載：** `createPortal` → `document.body`

**Info 區塊順序：**
1. 標籤（tag）
2. 商品名稱
3. 描述
4. **顏色選項**（有顏色才顯示）
5. **款式與價格**（依耳勾/耳針、耳夾分組；只有一個分類時不顯示分組標題）
6. **尺寸**（有 `sizes` 才顯示）
7. **優惠活動**（有 `promotion` 才顯示，自動計算節省金額）

**allImages（縮圖來源）：** 自動合併 `product.images` + `colors[].image` + `variants[].image` + `sizes[].image`，去重後統一顯示於縮圖列。

**互動狀態：**

| 動作 | 效果 |
|---|---|
| 點顏色（有 image） | 主圖跳至顏色圖；高亮顏色色塊；清除款式/尺寸選取 |
| 點款式（有 image） | 主圖跳至款式圖；高亮款式行；清除顏色/尺寸選取 |
| 點尺寸（有 image） | 主圖跳至尺寸圖；高亮尺寸行；清除顏色/款式選取 |
| 點縮圖 / 箭頭 | 主圖切換；清除所有選取高亮 |
| `←` / `→` 鍵 | 同點箭頭 |
| `Esc` | 關閉 Modal |

**關閉方式：** 點背景遮罩 / ✕ 按鈕 / `Esc`

開啟時 `document.body.style.overflow = 'hidden'`，關閉後恢復。

---

### IntroSection

**檔案：** `src/components/IntroSection.tsx` ｜ **類型：** Server Component  
**Props：** `{ intro: string }`

深藍漸層暗色卡片，文字來自 `prices.json → intro`。含「藍」字水印和金邊圓形裝飾。

---

### Footer

**檔案：** `src/components/Footer.tsx` ｜ **類型：** Server Component  
**Props：** `{ instagram: string }`

頁尾包含品牌名（金色句點）、IG 連結、版權文字。

---

### Lib Helpers

| 檔案 | 函式 | 說明 |
|---|---|---|
| `imgPath.ts` | `imgPath(src)` | 補上 `NEXT_PUBLIC_BASE_PATH` 前綴（GitHub Pages 用） |
| `hexToBackground.ts` | `hexToBackground(hex)` | 單色回傳 hex 字串；雙色回傳 `linear-gradient` |
| `hexToBackground.ts` | `firstHex(hex)` | 取第一個色碼（用於 SVG 佔位圖著色） |
| `variantCategory.ts` | `getVariantCategory(type)` | type 含 "耳勾"/"耳針" → `earHook`，其餘 → `earClip` |

---

## 8. 本地開發

### 前置需求

- **Node.js** 18.0 以上（建議 20.x LTS）
- **npm** 9.0 以上

```powershell
node --version   # v20.x.x
npm --version    # 10.x.x
```

### 安裝與啟動

```powershell
git clone https://github.com/rebeccaLinx/moo2web.git
cd moo2web
npm install
npm run dev
```

開啟瀏覽器：`http://localhost:3000`

> 修改 `prices.json` 後需重新整理頁面（Next.js Fast Refresh 不偵測 JSON 異動）。

### 常用指令

```powershell
npm run dev     # 開發模式（hot reload）
npm run build   # 產生 out/ 靜態檔案
npm run lint    # ESLint 檢查
```

---

## 9. 部署到 GitHub Pages

### 自動部署流程

```text
git push → GitHub → 觸發 Actions → npm build → 上傳 out/ → GitHub Pages
```

每次 `git push origin main` 自動觸發，約 2–3 分鐘完成。

### 初次設定（只需做一次）

1. **啟用 GitHub Pages**  
   `Settings → Pages → Source → GitHub Actions` → Save

2. **確認 Actions 權限**  
   `Settings → Actions → General → Workflow permissions → Read and write permissions`

### 手動 Push（繞過 Proxy）

```powershell
git remote set-url origin "https://$($env:GH_TOKEN)@github.com/rebeccaLinx/moo2web.git"
git -c http.proxy="" -c http.sslBackend=schannel push -u origin main
```

---

## 10. 內容更新指南

### 10.1 新增商品

在 `public/data/prices.json` → `products` 陣列新增：

```json
{
  "id": "new-earring-2026",
  "name": "新款耳環",
  "images": ["/images/new-photo.jpg"],
  "description": "商品描述",
  "variants": [
    { "type": "耳夾", "price": 320 }
  ],
  "colors": [],
  "tag": "新品"
}
```

### 10.2 設定顏色對應圖片

顏色圖片**不需要**預先加入 `images[]`，Modal 會自動收入縮圖列：

```json
"colors": [
  { "name": "紅", "hex": "#D51C39", "image": "/images/product-red.jpg" },
  { "name": "藍", "hex": "#4BB8FA", "image": "/images/product-blue.jpg" }
]
```

### 10.3 設定款式對應圖片

讓點擊款式行時主圖跳至對應圖片（同樣不需預先加入 `images[]`）：

```json
"variants": [
  { "type": "無吊墜+耳勾", "price": 1380, "image": "/images/product-hook.jpg" },
  { "type": "有吊墜+耳勾", "price": 1420, "image": "/images/product-hook-pendant.jpg" },
  { "type": "耳夾", "price": 1400 }
]
```

### 10.4 新增尺寸選項

```json
"sizes": [
  { "name": "小 (5mm)", "price": 250 },
  { "name": "大 (8mm)", "price": 300, "image": "/images/product-large.jpg" }
]
```

- `price` 選填，沒有價差可省略
- `image` 選填，有填則點擊時主圖切換

### 10.5 設定雙色色塊

```json
{ "name": "黑粉", "hex": ["#111111", "#F2789F"] }
```

色塊左右各半顯示兩色。

### 10.6 設定優惠活動

```json
"promotion": { "quantity": 2, "price": 480 }
```

效果：
- 卡片顯示金色 badge「買2件 NT$480」
- Modal 顯示優惠區塊，自動計算節省金額

### 10.7 下架商品

直接從 `products` 陣列刪除整筆物件。

### 10.8 修改顏色 Token

編輯 `src/app/globals.css` → `:root`，修改後需重新 build。

### 10.9 修改頁首標語

編輯 `src/components/Header.tsx` → `<p className={styles.tagline}>` 內容。

---

## 11. 常見問題

### Q：修改了 prices.json，本地沒有看到變化？
`prices.json` 是 build time 匯入，開發模式下需手動重新整理頁面（`Ctrl+R`）或重啟 `npm run dev`。

---

### Q：圖片顯示不出來？
1. 確認照片在 `public/images/` 內
2. 路徑以 `/images/` 開頭（不是 `./images/`）
3. 檔名大小寫完全一致（Linux 伺服器區分大小寫）

---

### Q：本地正常，GitHub Pages 圖片不顯示？
所有 `next/image` 的 `src` 必須用 `imgPath()` 包住：

```tsx
import { imgPath } from '@/lib/imgPath'
<Image src={imgPath(product.images[0])} ... />
```

`imgPath()` 在 GitHub Actions 環境自動補 `/moo2web` 前綴，本機為空字串。

---

### Q：篩選「耳勾/耳針」tab 看不到某商品？
確認 `variants` 中有 type 包含 `"耳勾"` 或 `"耳針"` 的款式。分類由 `getVariantCategory()` 判斷，不是硬比對 `"耳針"` 字串，`"無吊墜+耳勾"` 等也會正確歸類。

---

### Q：想讓商品同時出現在耳夾和耳勾/耳針兩個 section？
在 `variants` 同時加入兩類款式：

```json
"variants": [
  { "type": "耳夾", "price": 350 },
  { "type": "耳針", "price": 320 }
]
```

「全部」模式下，該商品會分別出現在兩個 section。

---

### Q：點款式/尺寸/顏色後，縮圖沒有對應高亮？
確認該項目有填 `"image"` 欄位，且圖片路徑正確。有 `image` 的項目點擊才會跳圖並高亮縮圖；沒有 `image` 的項目點擊只高亮選項行，不會切換主圖。

---

### Q：Google Fonts 字型沒載入？
字型需連上 `fonts.googleapis.com`。無法連線時 fallback 為系統 serif/sans-serif，版面不受影響。

---

*文件版本：2026-06-01 ｜ moo2.tw Technical Documentation*
