# MOO² 耳環價目展示頁 — Next.js 實作計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 以 Next.js 14 (App Router + TypeScript) 建立日系藍色耳環價目展示網頁，商品支援耳夾/耳針 variant、顏色色卡、多圖燈箱，資料從 JSON 靜態匯入，部署至 GitHub Pages (rebeccaLinx/moo2web)。

**Architecture:** Next.js static export (`output: 'export'`)，App Router，`public/data/prices.json` 在 build time 匯入 `page.tsx`，以 props 傳遞給 Client Components。CSS Modules 管理 component 樣式，`globals.css` 存放 CSS 設計變數。

**Tech Stack:** Next.js 14、React 18、TypeScript、CSS Modules、Noto Sans TC (next/font)、GitHub Actions (Pages 部署)

---

## File Structure

```
E:\ai\moo2web\
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout：字型、metadata
│   │   ├── page.tsx                # 首頁：匯入 JSON，組合元件
│   │   └── globals.css             # CSS 變數 + Reset
│   ├── components/
│   │   ├── Header.tsx              # MOO² 品牌 + IG 按鈕（Server）
│   │   ├── Header.module.css
│   │   ├── IntroSection.tsx        # 藍色漸層簡介區（Server）
│   │   ├── IntroSection.module.css
│   │   ├── ProductSection.tsx      # 'use client'：filter 狀態 + modal 狀態
│   │   ├── ProductSection.module.css
│   │   ├── ProductCard.tsx         # 商品卡：圖片/色卡/價格（純展示）
│   │   ├── ProductCard.module.css
│   │   ├── ProductModal.tsx        # 燈箱 modal（純展示，callback 關閉）
│   │   ├── ProductModal.module.css
│   │   ├── Footer.tsx              # IG 連結 + 版權（Server）
│   │   └── Footer.module.css
│   └── types/
│       └── product.ts              # TypeScript 型別定義
├── public/
│   ├── data/
│   │   └── prices.json             # 商品資料
│   └── images/                     # 商品照片（手動放入）
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions → GitHub Pages
├── next.config.js
└── package.json
```

---

## Design Tokens (globals.css)

| 變數 | 色碼 | 用途 |
|---|---|---|
| `--blue-deep` | `#1e3a5f` | header / footer / modal overlay |
| `--blue-mid` | `#2d6a9f` | tab active、price、variant-row border |
| `--blue-light` | `#5b9bd5` | accent、tag badge、swatch ring |
| `--blue-pale` | `#dce8f5` | card border、placeholder bg |
| `--blue-mist` | `#eef4fb` | 頁面背景、variant-row bg |
| `--white` | `#ffffff` | 卡片底色 |
| `--text-dark` | `#1a2a3a` | 主文字 |
| `--text-mid` | `#4a6274` | 描述文字 |

---

## Task 1：建立 Next.js 專案

**Files:**
- Run: `npx create-next-app@latest`
- Create: `next.config.js`（覆寫預設）
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1：在 `E:\ai\moo2web\` 執行 create-next-app**

  在 PowerShell 或 VS Code 終端機中執行：
  ```powershell
  cd E:\ai\moo2web
  npx create-next-app@latest . --typescript --eslint --no-tailwind --src-dir --app --import-alias "@/*" --no-git
  ```
  > 出現「Ok to proceed?」按 Enter。目錄非空時若詢問，選 Yes 繼續。

- [ ] **Step 2：覆寫 `next.config.js`**

  ```javascript
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    output: 'export',
    basePath: process.env.GITHUB_ACTIONS ? '/moo2web' : '',
    images: {
      unoptimized: true,
    },
  }

  module.exports = nextConfig
  ```

  > `GITHUB_ACTIONS` 在 CI 中自動為 `'true'`，本地開發時 basePath 為空，網址為 `localhost:3000/`。

- [ ] **Step 3：建立 GitHub Actions 部署工作流程**

  建立 `.github/workflows/deploy.yml`：
  ```yaml
  name: Deploy to GitHub Pages
  on:
    push:
      branches: [main]
  permissions:
    contents: read
    pages: write
    id-token: write
  concurrency:
    group: pages
    cancel-in-progress: false
  jobs:
    build-and-deploy:
      runs-on: ubuntu-latest
      environment:
        name: github-pages
        url: ${{ steps.deployment.outputs.page_url }}
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with:
            node-version: '20'
            cache: 'npm'
        - run: npm ci
        - run: npm run build
        - uses: actions/upload-pages-artifact@v3
          with:
            path: './out'
        - uses: actions/deploy-pages@v4
          id: deployment
  ```

- [ ] **Step 4：確認 GitHub repo Pages 設定**

  前往 https://github.com/rebeccaLinx/moo2web/settings/pages
  → Source 選 **GitHub Actions**（不是 Branch）→ Save

- [ ] **Step 5：本地確認開發伺服器可啟動**

  ```powershell
  npm run dev
  ```
  瀏覽器開啟 http://localhost:3000，看到 Next.js 預設頁面即成功。

---

## Task 2：定義 TypeScript 型別 + 建立 prices.json

**Files:**
- Create: `src/types/product.ts`
- Create: `public/data/prices.json`
- Create: `public/images/` 資料夾（空，稍後放照片）

- [ ] **Step 1：建立 `src/types/product.ts`**

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

- [ ] **Step 2：建立 `public/data/prices.json`**

  ```json
  {
    "intro": "歡迎來到 MOO².tw ✦ 精選日韓輕珠寶耳環，夾式與針式均有販售。每一件設計都來自對細節的堅持，讓耳環成為妳今日最閃亮的主角。歡迎透過 Instagram 私訊洽詢或訂購。",
    "instagram": "https://www.instagram.com/moo2.tw/",
    "products": [
      {
        "id": "pearl-round",
        "name": "珍珠圓形耳環",
        "images": ["/images/pearl-round-1.jpg", "/images/pearl-round-2.jpg"],
        "description": "白色仿珍珠，百搭日常款，簡約優雅",
        "variants": [
          { "type": "耳夾", "price": 280 },
          { "type": "耳針", "price": 250 }
        ],
        "colors": [
          { "name": "珍珠白", "hex": "#F0EDE8" },
          { "name": "淡粉", "hex": "#F2C4CE" }
        ],
        "tag": "熱銷"
      },
      {
        "id": "blue-geo",
        "name": "藍色幾何耳環",
        "images": ["/images/blue-geo-1.jpg"],
        "description": "深藍琺瑯幾何造型，日系清新風格",
        "variants": [
          { "type": "耳夾", "price": 320 }
        ],
        "colors": [
          { "name": "深藍", "hex": "#2d6a9f" },
          { "name": "天藍", "hex": "#7eb8d4" }
        ],
        "tag": ""
      },
      {
        "id": "moon-pin",
        "name": "月亮星星耳環",
        "images": [
          "/images/moon-pin-1.jpg",
          "/images/moon-pin-2.jpg",
          "/images/moon-pin-3.jpg"
        ],
        "description": "鍍金月亮星星，浪漫輕奢，適合日常與約會",
        "variants": [
          { "type": "耳針", "price": 350 }
        ],
        "colors": [
          { "name": "鍍金", "hex": "#C9A84C" }
        ],
        "tag": "熱銷"
      },
      {
        "id": "shell-bow",
        "name": "貝殼蝴蝶結耳環",
        "images": ["/images/shell-bow-1.jpg"],
        "description": "天然貝殼材質，蝴蝶結造型，少女感十足",
        "variants": [
          { "type": "耳夾", "price": 350 },
          { "type": "耳針", "price": 320 }
        ],
        "colors": [
          { "name": "貝白", "hex": "#EDE8DE" },
          { "name": "淡藍", "hex": "#B8D4E8" },
          { "name": "玫瑰", "hex": "#E8B4B8" }
        ],
        "tag": "新品"
      },
      {
        "id": "sapphire-round",
        "name": "圓形藍寶石耳環",
        "images": ["/images/sapphire-1.jpg"],
        "description": "深藍色仿寶石，古典優雅氣質",
        "variants": [
          { "type": "耳針", "price": 420 }
        ],
        "colors": [
          { "name": "深藍", "hex": "#1e3a5f" },
          { "name": "寶藍", "hex": "#0047AB" }
        ],
        "tag": "新品"
      },
      {
        "id": "pearl-hoop",
        "name": "細圈珍珠耳環",
        "images": ["/images/pearl-hoop-1.jpg"],
        "description": "細金圈搭配小珍珠，極簡百搭款",
        "variants": [
          { "type": "耳針", "price": 290 },
          { "type": "耳夾", "price": 310 }
        ],
        "colors": [
          { "name": "金色", "hex": "#C9A84C" },
          { "name": "銀色", "hex": "#B8C0CC" }
        ],
        "tag": ""
      }
    ]
  }
  ```

- [ ] **Step 3：手動建立 `public/images/` 資料夾**（放商品照片用，現在先留空）

---

## Task 3：globals.css + layout.tsx

**Files:**
- Modify: `src/app/globals.css`（刪除預設內容，完全取代）
- Modify: `src/app/layout.tsx`

- [ ] **Step 1：完全取代 `src/app/globals.css`**

  ```css
  /* ── Design Tokens ─────────────────────────── */
  :root {
    --blue-deep:  #1e3a5f;
    --blue-mid:   #2d6a9f;
    --blue-light: #5b9bd5;
    --blue-pale:  #dce8f5;
    --blue-mist:  #eef4fb;
    --white:      #ffffff;
    --text-dark:  #1a2a3a;
    --text-mid:   #4a6274;
    --radius:     10px;
    --shadow:     0 2px 12px rgba(30, 58, 95, 0.08);
  }

  /* ── Reset ──────────────────────────────────── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    background: var(--blue-mist);
    color: var(--text-dark);
    font-weight: 300;
    line-height: 1.7;
    min-height: 100vh;
  }
  a { color: inherit; text-decoration: none; }
  button { font-family: inherit; cursor: pointer; border: none; }
  img { display: block; max-width: 100%; }
  ```

- [ ] **Step 2：取代 `src/app/layout.tsx`**

  ```typescript
  import type { Metadata } from 'next'
  import { Noto_Sans_TC } from 'next/font/google'
  import './globals.css'

  const noto = Noto_Sans_TC({
    subsets: ['latin'],
    weight: ['300', '400', '500', '700'],
    display: 'swap',
  })

  export const metadata: Metadata = {
    title: 'MOO².tw｜耳環價目表',
    description: '精選日韓輕珠寶耳環，夾式與針式均有販售',
  }

  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="zh-TW">
        <body className={noto.className}>{children}</body>
      </html>
    )
  }
  ```

- [ ] **Step 3：`npm run dev`，確認字型正確載入，頁面非空（暫時 Next.js 預設頁面）**

---

## Task 4：Header、IntroSection、Footer（Server Components）

**Files:**
- Create: `src/components/Header.tsx` + `Header.module.css`
- Create: `src/components/IntroSection.tsx` + `IntroSection.module.css`
- Create: `src/components/Footer.tsx` + `Footer.module.css`

- [ ] **Step 1：建立 `src/components/Header.tsx`**

  ```typescript
  import styles from './Header.module.css'

  const IgIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  )

  export default function Header({ instagram }: { instagram: string }) {
    return (
      <header className={styles.header}>
        <div className={styles.inner}>
          <div className={styles.brand}>
            <span className={styles.name}>MOO<sup>2</sup></span>
            <span className={styles.dot}>.tw</span>
            <span className={styles.tagline}>耳環輕珠寶</span>
          </div>
          <a href={instagram} target="_blank" rel="noopener noreferrer" className={styles.igLink}>
            <IgIcon />
            @moo2.tw
          </a>
        </div>
      </header>
    )
  }
  ```

- [ ] **Step 2：建立 `src/components/Header.module.css`**

  ```css
  .header {
    background: var(--blue-deep);
    color: var(--white);
    padding: 0 24px;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 2px 16px rgba(30,58,95,0.3);
  }
  .inner {
    max-width: 900px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
  }
  .brand { display: flex; align-items: baseline; gap: 2px; }
  .name {
    font-size: 1.55rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: var(--white);
    line-height: 1;
  }
  .name sup { font-size: 0.62em; font-weight: 700; vertical-align: super; }
  .dot { font-size: 1.1rem; font-weight: 300; color: var(--blue-light); margin-right: 8px; }
  .tagline {
    font-size: 0.68rem;
    font-weight: 300;
    color: rgba(255,255,255,0.42);
    letter-spacing: 0.14em;
    align-self: center;
  }
  .igLink {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.84rem;
    color: var(--blue-pale);
    border: 1px solid rgba(255,255,255,0.2);
    padding: 6px 14px;
    border-radius: 20px;
    white-space: nowrap;
    transition: background 0.2s, color 0.2s, border-color 0.2s;
  }
  .igLink:hover { background: var(--blue-mid); color: var(--white); border-color: transparent; }

  @media (max-width: 480px) {
    .inner { height: 56px; }
    .name { font-size: 1.3rem; }
    .tagline { display: none; }
    .igLink { padding: 5px 10px; font-size: 0.78rem; }
  }
  ```

- [ ] **Step 3：建立 `src/components/IntroSection.tsx`**

  ```typescript
  import styles from './IntroSection.module.css'

  export default function IntroSection({ intro }: { intro: string }) {
    return (
      <section className={styles.section}>
        <div className={styles.inner}>
          <p className={styles.text}>{intro}</p>
        </div>
      </section>
    )
  }
  ```

- [ ] **Step 4：建立 `src/components/IntroSection.module.css`**

  ```css
  .section {
    background: linear-gradient(135deg, var(--blue-deep) 0%, var(--blue-mid) 100%);
    padding: 48px 24px;
    position: relative;
    overflow: hidden;
  }
  .section::before, .section::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
  }
  .section::before { top: -50px; right: -50px; width: 220px; height: 220px; background: rgba(255,255,255,0.04); }
  .section::after  { bottom: -70px; left: -30px; width: 280px; height: 280px; background: rgba(255,255,255,0.03); }
  .inner { max-width: 900px; margin: 0 auto; position: relative; z-index: 1; }
  .text {
    font-size: 0.92rem;
    font-weight: 300;
    color: rgba(255,255,255,0.88);
    line-height: 2;
    border-left: 3px solid var(--blue-light);
    padding-left: 16px;
  }

  @media (max-width: 480px) {
    .section { padding: 28px 16px; }
  }
  ```

- [ ] **Step 5：建立 `src/components/Footer.tsx`**

  ```typescript
  import styles from './Footer.module.css'

  const IgIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  )

  export default function Footer({ instagram }: { instagram: string }) {
    return (
      <footer className={styles.footer}>
        <a href={instagram} target="_blank" rel="noopener noreferrer" className={styles.igLink}>
          <IgIcon />
          追蹤 @moo2.tw
        </a>
        <p className={styles.copy}>© 2025 MOO².tw 版權所有</p>
      </footer>
    )
  }
  ```

- [ ] **Step 6：建立 `src/components/Footer.module.css`**

  ```css
  .footer {
    background: var(--blue-deep);
    color: rgba(255,255,255,0.55);
    text-align: center;
    padding: 32px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
  .igLink {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--blue-pale);
    font-size: 0.88rem;
    transition: color 0.2s;
  }
  .igLink:hover { color: var(--white); }
  .copy { font-size: 0.72rem; font-weight: 300; }
  ```

---

## Task 5：ProductCard 元件（商品卡，含圖片、色卡、variant badges）

**Files:**
- Create: `src/components/ProductCard.tsx` + `ProductCard.module.css`

- [ ] **Step 1：建立 `src/components/ProductCard.tsx`**

  ```typescript
  'use client'
  import Image from 'next/image'
  import { useState } from 'react'
  import type { Product } from '@/types/product'
  import styles from './ProductCard.module.css'

  interface Props {
    product: Product
    onClick: () => void
  }

  export default function ProductCard({ product, onClick }: Props) {
    const [imgError, setImgError] = useState(false)
    const prices = product.variants.map(v => v.price)
    const minPrice = Math.min(...prices)
    const priceLabel = prices.length > 1 ? `${minPrice} 起` : String(minPrice)

    const hasImage = product.images.length > 0 && !imgError

    return (
      <div className={styles.card} onClick={onClick} role="button" tabIndex={0}
           onKeyDown={e => e.key === 'Enter' && onClick()}>
        <div className={`${styles.imgWrap} ${!hasImage ? styles.noImg : ''}`}>
          {hasImage && (
            <Image
              className={styles.img}
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 480px) 45vw, 220px"
              onError={() => setImgError(true)}
            />
          )}
        </div>

        {product.colors.length > 0 && (
          <div className={styles.swatches}>
            {product.colors.map(c => (
              <span key={c.name} className={styles.swatch}
                    style={{ background: c.hex }} title={c.name} />
            ))}
          </div>
        )}

        <div className={styles.body}>
          {product.tag && <span className={styles.tag}>{product.tag}</span>}
          <h3 className={styles.name}>{product.name}</h3>
          <p className={styles.desc}>{product.description}</p>
          <div className={styles.footer}>
            <p className={styles.price}>{priceLabel}</p>
            <div className={styles.badges}>
              {product.variants.map(v => (
                <span key={v.type} className={styles.badge}>{v.type}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
  ```

- [ ] **Step 2：建立 `src/components/ProductCard.module.css`**

  ```css
  .card {
    background: var(--white);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    border: 1px solid var(--blue-pale);
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    display: flex;
    flex-direction: column;
  }
  .card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 28px rgba(30,58,95,0.14);
  }
  .card:focus-visible { outline: 2px solid var(--blue-mid); outline-offset: 2px; }

  /* 圖片 */
  .imgWrap {
    position: relative;
    width: 100%;
    aspect-ratio: 1 / 1;
    background: var(--blue-pale);
    overflow: hidden;
    flex-shrink: 0;
  }
  .noImg {
    background: linear-gradient(135deg, var(--blue-pale) 0%, var(--blue-mist) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .noImg::after { content: '✦'; font-size: 2rem; color: var(--blue-light); opacity: 0.4; }
  .img { object-fit: cover; transition: transform 0.3s; }
  .card:hover .img { transform: scale(1.05); }

  /* 色卡 */
  .swatches {
    display: flex;
    gap: 5px;
    padding: 7px 12px;
    border-top: 1px solid var(--blue-pale);
    flex-wrap: wrap;
  }
  .swatch {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 1.5px solid rgba(0,0,0,0.1);
    flex-shrink: 0;
    transition: transform 0.15s;
  }
  .swatch:hover { transform: scale(1.25); }

  /* 文字 */
  .body {
    padding: 12px 14px 14px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    flex: 1;
  }
  .tag {
    display: inline-block;
    background: var(--blue-light);
    color: var(--white);
    font-size: 0.66rem;
    font-weight: 500;
    padding: 2px 7px;
    border-radius: 4px;
    letter-spacing: 0.06em;
    align-self: flex-start;
  }
  .name { font-size: 0.88rem; font-weight: 500; color: var(--text-dark); line-height: 1.4; }
  .desc { font-size: 0.76rem; color: var(--text-mid); line-height: 1.6; flex: 1; }
  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    margin-top: 6px;
    flex-wrap: wrap;
  }
  .price { font-size: 1rem; font-weight: 700; color: var(--blue-mid); white-space: nowrap; }
  .price::before { content: 'NT$ '; font-size: 0.7rem; font-weight: 400; color: var(--text-mid); }
  .badges { display: flex; gap: 4px; flex-wrap: wrap; }
  .badge {
    font-size: 0.65rem;
    font-weight: 500;
    padding: 2px 7px;
    border-radius: 10px;
    background: var(--blue-mist);
    color: var(--blue-mid);
    border: 1px solid var(--blue-pale);
    white-space: nowrap;
  }

  @media (max-width: 480px) {
    .body { padding: 10px 10px 12px; }
  }
  ```

---

## Task 6：ProductModal 元件（燈箱 modal，含多圖 gallery）

**Files:**
- Create: `src/components/ProductModal.tsx` + `ProductModal.module.css`

- [ ] **Step 1：建立 `src/components/ProductModal.tsx`**

  ```typescript
  'use client'
  import { useState, useEffect, useCallback } from 'react'
  import Image from 'next/image'
  import type { Product } from '@/types/product'
  import styles from './ProductModal.module.css'

  interface Props {
    product: Product
    onClose: () => void
  }

  export default function ProductModal({ product, onClose }: Props) {
    const [idx, setIdx] = useState(0)
    const images = product.images

    const go = useCallback((next: number) => {
      if (next >= 0 && next < images.length) setIdx(next)
    }, [images.length])

    useEffect(() => {
      setIdx(0)
      const handler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
        if (e.key === 'ArrowLeft')  go(idx - 1)
        if (e.key === 'ArrowRight') go(idx + 1)
      }
      document.addEventListener('keydown', handler)
      document.body.style.overflow = 'hidden'
      return () => {
        document.removeEventListener('keydown', handler)
        document.body.style.overflow = ''
      }
    }, [onClose, go, idx])

    return (
      <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
        <div className={styles.box} onClick={e => e.stopPropagation()}>
          <button className={styles.close} onClick={onClose} aria-label="關閉">✕</button>

          {/* Gallery */}
          <div className={styles.gallery}>
            <div className={styles.mainWrap}>
              {images.length > 0 ? (
                <Image className={styles.mainImg} src={images[idx]} alt={`${product.name} 圖片 ${idx + 1}`}
                       fill sizes="(max-width: 600px) 100vw, 380px" />
              ) : (
                <div className={styles.noImg}>✦</div>
              )}
              {images.length > 1 && (
                <>
                  <button className={`${styles.arrow} ${styles.prev}`} onClick={() => go(idx - 1)}
                          disabled={idx === 0} aria-label="上一張">&#8249;</button>
                  <button className={`${styles.arrow} ${styles.next}`} onClick={() => go(idx + 1)}
                          disabled={idx === images.length - 1} aria-label="下一張">&#8250;</button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className={styles.thumbs}>
                {images.map((src, i) => (
                  <Image key={i} className={`${styles.thumb} ${i === idx ? styles.thumbActive : ''}`}
                         src={src} alt={`縮圖 ${i + 1}`} width={56} height={56}
                         onClick={() => setIdx(i)} />
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className={styles.info}>
            <div className={styles.tagRow}>
              {product.tag && <span className={styles.tag}>{product.tag}</span>}
            </div>
            <h2 className={styles.name}>{product.name}</h2>
            <p className={styles.desc}>{product.description}</p>

            <p className={styles.sectionLabel}>款式與價格</p>
            <div className={styles.variants}>
              {product.variants.map(v => (
                <div key={v.type} className={styles.variantRow}>
                  <span className={styles.variantType}>{v.type}</span>
                  <span className={styles.variantPrice}>{v.price}</span>
                </div>
              ))}
            </div>

            {product.colors.length > 0 && (
              <>
                <p className={styles.sectionLabel}>顏色選項</p>
                <div className={styles.colors}>
                  {product.colors.map(c => (
                    <div key={c.name} className={styles.colorItem}>
                      <div className={styles.colorDot} style={{ background: c.hex }} title={c.name} />
                      <span className={styles.colorName}>{c.name}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }
  ```

- [ ] **Step 2：建立 `src/components/ProductModal.module.css`**

  ```css
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: rgba(10,22,40,0.72);
  }
  .box {
    position: relative;
    background: var(--white);
    border-radius: 14px;
    width: 100%;
    max-width: 780px;
    max-height: 90vh;
    overflow-y: auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    box-shadow: 0 24px 64px rgba(10,22,40,0.36);
    overscroll-behavior: contain;
  }
  .close {
    position: absolute;
    top: 12px; right: 14px;
    background: var(--blue-pale);
    border-radius: 50%;
    width: 32px; height: 32px;
    font-size: 0.9rem;
    color: var(--text-dark);
    z-index: 10;
    transition: background 0.2s, color 0.2s;
  }
  .close:hover { background: var(--blue-mid); color: var(--white); }

  /* Gallery */
  .gallery {
    display: flex;
    flex-direction: column;
    background: var(--blue-pale);
    border-radius: 14px 0 0 14px;
    overflow: hidden;
  }
  .mainWrap {
    position: relative;
    aspect-ratio: 1 / 1;
    overflow: hidden;
    flex-shrink: 0;
  }
  .mainImg { object-fit: cover; }
  .noImg {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    color: var(--blue-light);
    opacity: 0.4;
    background: var(--blue-mist);
  }
  .arrow {
    position: absolute;
    top: 50%; transform: translateY(-50%);
    background: rgba(255,255,255,0.85);
    border-radius: 50%;
    width: 34px; height: 34px;
    font-size: 1.5rem;
    line-height: 1;
    color: var(--text-dark);
    transition: background 0.2s;
  }
  .arrow:hover { background: rgba(255,255,255,0.98); }
  .arrow:disabled { opacity: 0.3; pointer-events: none; }
  .prev { left: 10px; }
  .next { right: 10px; }
  .thumbs {
    display: flex;
    gap: 6px;
    padding: 10px;
    overflow-x: auto;
    background: var(--blue-mist);
    flex-shrink: 0;
  }
  .thumb {
    width: 56px !important;
    height: 56px !important;
    border-radius: 6px;
    object-fit: cover;
    cursor: pointer;
    border: 2px solid transparent;
    opacity: 0.72;
    transition: border-color 0.15s, opacity 0.15s;
    flex-shrink: 0;
  }
  .thumbActive { border-color: var(--blue-mid); opacity: 1; }
  .thumb:hover { opacity: 1; }

  /* Info */
  .info {
    padding: 32px 26px 28px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow-y: auto;
  }
  .tagRow { min-height: 22px; }
  .tag {
    display: inline-block;
    background: var(--blue-light);
    color: var(--white);
    font-size: 0.68rem;
    font-weight: 500;
    padding: 2px 8px;
    border-radius: 4px;
    letter-spacing: 0.06em;
  }
  .name { font-size: 1.12rem; font-weight: 700; color: var(--text-dark); line-height: 1.4; }
  .desc { font-size: 0.84rem; color: var(--text-mid); line-height: 1.85; }
  .sectionLabel {
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.1em;
    color: var(--blue-light);
    text-transform: uppercase;
    margin-top: 6px;
  }
  .variants { display: flex; flex-direction: column; gap: 8px; }
  .variantRow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border-radius: 8px;
    background: var(--blue-mist);
    border: 1.5px solid var(--blue-pale);
  }
  .variantType { font-size: 0.88rem; font-weight: 500; color: var(--text-dark); }
  .variantPrice { font-size: 1rem; font-weight: 700; color: var(--blue-mid); }
  .variantPrice::before { content: 'NT$ '; font-size: 0.72rem; font-weight: 400; color: var(--text-mid); }
  .colors { display: flex; gap: 10px; flex-wrap: wrap; }
  .colorItem { display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .colorDot {
    width: 24px; height: 24px;
    border-radius: 50%;
    border: 2px solid rgba(0,0,0,0.1);
    box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  }
  .colorName { font-size: 0.62rem; color: var(--text-mid); }

  @media (max-width: 600px) {
    .box { grid-template-columns: 1fr; }
    .gallery { border-radius: 14px 14px 0 0; }
    .info { padding: 20px 18px 24px; }
  }
  ```

---

## Task 7：ProductSection（'use client' — filter + modal 狀態）

**Files:**
- Create: `src/components/ProductSection.tsx` + `ProductSection.module.css`

- [ ] **Step 1：建立 `src/components/ProductSection.tsx`**

  ```typescript
  'use client'
  import { useState } from 'react'
  import type { Product } from '@/types/product'
  import ProductCard from './ProductCard'
  import ProductModal from './ProductModal'
  import styles from './ProductSection.module.css'

  type Filter = 'all' | '耳夾' | '耳針'

  const FILTERS: { id: Filter; label: string; desc: string }[] = [
    { id: 'all',  label: '全部', desc: '所有款式' },
    { id: '耳夾', label: '耳夾', desc: '夾式耳環，無需穿耳，舒適好戴' },
    { id: '耳針', label: '耳針', desc: '針式耳環，925銀針材質，抗敏感' },
  ]

  export default function ProductSection({ products }: { products: Product[] }) {
    const [filter, setFilter]           = useState<Filter>('all')
    const [selected, setSelected]       = useState<Product | null>(null)

    const filtered = filter === 'all'
      ? products
      : products.filter(p => p.variants.some(v => v.type === filter))

    const desc = FILTERS.find(f => f.id === filter)?.desc ?? ''

    return (
      <main className={styles.main}>
        {/* Filter tabs */}
        <div className={styles.tabs} role="tablist">
          {FILTERS.map(f => (
            <button key={f.id}
              className={`${styles.tab} ${filter === f.id ? styles.active : ''}`}
              onClick={() => setFilter(f.id)}
              role="tab"
              aria-selected={filter === f.id}>
              {f.label}
            </button>
          ))}
        </div>

        <p className={styles.desc}>{desc}</p>

        {/* Product grid */}
        <div className={styles.grid}>
          {filtered.map(p => (
            <ProductCard key={p.id} product={p} onClick={() => setSelected(p)} />
          ))}
        </div>

        {/* Modal */}
        {selected && (
          <ProductModal product={selected} onClose={() => setSelected(null)} />
        )}
      </main>
    )
  }
  ```

- [ ] **Step 2：建立 `src/components/ProductSection.module.css`**

  ```css
  .main {
    max-width: 900px;
    margin: 0 auto;
    padding: 32px 24px 56px;
  }
  .tabs { display: flex; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
  .tab {
    padding: 8px 22px;
    border: 2px solid var(--blue-light);
    background: transparent;
    color: var(--blue-mid);
    border-radius: 24px;
    font-size: 0.86rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    transition: background 0.2s, color 0.2s, border-color 0.2s;
  }
  .tab:hover { background: var(--blue-pale); }
  .active { background: var(--blue-mid); border-color: var(--blue-mid); color: var(--white); }
  .desc {
    font-size: 0.79rem;
    color: var(--text-mid);
    margin-bottom: 20px;
    margin-left: 4px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
    gap: 18px;
  }

  @media (max-width: 480px) {
    .main { padding: 20px 14px 40px; }
    .grid { grid-template-columns: 1fr 1fr; gap: 12px; }
  }
  @media (max-width: 360px) {
    .grid { grid-template-columns: 1fr; }
  }
  ```

---

## Task 8：page.tsx（組合所有元件）

**Files:**
- Modify: `src/app/page.tsx`（刪除預設內容，完全取代）

- [ ] **Step 1：取代 `src/app/page.tsx`**

  ```typescript
  import priceData from '../../public/data/prices.json'
  import type { PriceData } from '@/types/product'
  import Header from '@/components/Header'
  import IntroSection from '@/components/IntroSection'
  import ProductSection from '@/components/ProductSection'
  import Footer from '@/components/Footer'

  export default function Home() {
    const data = priceData as PriceData
    return (
      <>
        <Header instagram={data.instagram} />
        <IntroSection intro={data.intro} />
        <ProductSection products={data.products} />
        <Footer instagram={data.instagram} />
      </>
    )
  }
  ```

- [ ] **Step 2：`npm run dev`，完整驗收**
  - [ ] Header 顯示「MOO².tw 耳環輕珠寶」+ IG 按鈕
  - [ ] 藍色漸層 intro 區顯示品牌簡介
  - [ ] 全部 / 耳夾 / 耳針 tab 切換，商品列表隨之過濾
  - [ ] 商品卡圖片下方顯示彩色色卡圓點（hover 放大）
  - [ ] 多 variant 商品顯示「NT$ 250 起」
  - [ ] 點擊商品卡開啟 modal 燈箱
  - [ ] modal 左側大圖 + 右側下方縮圖列
  - [ ] 多張圖片時：左右箭頭切換 & 點縮圖切換，首/末張箭頭 disabled
  - [ ] modal 右側顯示款式價格列 + 顏色色卡
  - [ ] Esc / 點擊背景 / ✕ 均可關閉 modal
  - [ ] 手機版 375px：modal 上圖下文，商品卡 2 欄

- [ ] **Step 3：`npm run build`，確認 build 無錯誤，產生 `out/` 資料夾**

  ```powershell
  npm run build
  ```
  預期輸出最後幾行包含 `✓ Generating static pages` 及 `Route (app)` 表格。

---

## Task 9：加入商品圖片 + 部署到 GitHub Pages

- [ ] **Step 1：將商品照片放入 `public/images/`**

  照片建議規格：正方形（1:1）、最小 600×600px、JPG 或 WebP。
  檔名需對應 `prices.json` 中 `images` 陣列的路徑（去掉開頭 `/images/`）。

  若暫時沒有照片：`"images": []` 則顯示藍色佔位區塊，不影響其他功能。

- [ ] **Step 2：初始化 git 並推送**

  ```powershell
  cd E:\ai\moo2web
  git init
  git add .
  git commit -m "feat: moo2 earring price page"
  git branch -M main
  git remote add origin https://github.com/rebeccaLinx/moo2web.git
  git push -u origin main
  ```

- [ ] **Step 3：確認 GitHub Actions 執行成功**

  前往 https://github.com/rebeccaLinx/moo2web/actions
  → 應有一個 "Deploy to GitHub Pages" workflow 正在執行或已完成（綠色勾勾）

- [ ] **Step 4：開啟網站確認部署成功**

  網址：https://rebeccaLinx.github.io/moo2web/
  （GitHub Pages 設定需為 Source: GitHub Actions，詳見 Task 1 Step 4）

- [ ] **Step 5：日後更新商品資料**

  ```powershell
  # 修改 public/data/prices.json，放入新照片後：
  git add .
  git commit -m "update: 新增商品 xxx"
  git push
  ```
  推送後 GitHub Actions 自動重新 build，約 1~2 分鐘網站更新。

---

## 如何新增商品

只需在 `public/data/prices.json` 的 `products` 陣列新增一筆：

```json
{
  "id": "unique-id",
  "name": "新款耳環名稱",
  "images": ["/images/new-1.jpg", "/images/new-2.jpg"],
  "description": "商品描述文字",
  "variants": [
    { "type": "耳夾", "price": 320 },
    { "type": "耳針", "price": 290 }
  ],
  "colors": [
    { "name": "玫瑰金", "hex": "#C9A084" },
    { "name": "銀色", "hex": "#B8C0CC" }
  ],
  "tag": "新品"
}
```

- `id` 須唯一，不可重複
- `tag` 填 `""` 不顯示標籤
- `colors` 填 `[]` 不顯示色卡
- `images` 填 `[]` 顯示藍色佔位區塊
- 不需動任何 tsx 或 css 檔案
