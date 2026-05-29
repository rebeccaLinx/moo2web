# MOO².tw — 技術文件

> 最後更新：2026-05-29

## 概覽

moo2.tw 是一個靜態耳飾展示網站，無後端 API，資料全來自 JSON，部署於 GitHub Pages。

**線上網址：** https://rebeccalinx.github.io/moo2web/

---

## 技術棧

| 項目 | 版本 |
|---|---|
| Next.js | 16.2.6（App Router + `output: 'export'`） |
| React | 19.2.4 |
| TypeScript | 5.x |
| 字型 | Shippori Mincho、Zen Maru Gothic（Google Fonts） |
| 部署 | GitHub Actions → GitHub Pages |

> **注意：** Next.js 16 有 breaking changes，修改前請先閱讀 `node_modules/next/dist/docs/`。

---

## 專案結構

```
E:\ai\moo2web\
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout：字型、metadata
│   │   ├── page.tsx                # 首頁：匯入 JSON，組合元件
│   │   ├── globals.css             # CSS 變數 + Reset
│   │   ├── favicon.ico
│   │   └── page.module.css
│   ├── components/
│   │   ├── Header.tsx / .module.css       # 品牌 hero + IG 按鈕
│   │   ├── IntroSection.tsx / .module.css # 品牌簡介區
│   │   ├── ProductSection.tsx / .module.css  # 'use client'：filter + modal 狀態
│   │   ├── ProductCard.tsx / .module.css  # 商品卡：圖片、色卡、價格
│   │   ├── ProductModal.tsx / .module.css # 燈箱 modal：多圖 gallery + 規格
│   │   └── Footer.tsx / .module.css       # IG 連結 + 版權
│   ├── lib/
│   │   └── imgPath.ts              # basePath helper（見下方說明）
│   └── types/
│       └── product.ts              # TypeScript 型別定義
├── public/
│   ├── data/
│   │   └── prices.json             # 商品資料（唯一資料來源）
│   └── images/                     # 商品圖片（PNG）
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions 自動部署
├── next.config.ts
└── package.json
```

---

## 資料結構（prices.json）

```ts
interface PriceData {
  intro: string       // 品牌簡介文字
  instagram: string   // Instagram 完整 URL
  products: Product[]
}

interface Product {
  id: string          // 唯一 ID，不可重複
  name: string
  images: string[]    // 路徑從 /images/ 開頭，檔名不可有空格
  description: string
  variants: Variant[] // 耳夾 / 耳針，各有獨立價格
  colors: Color[]     // 色卡（name + hex）
  tag: string         // "熱銷" / "新品" / ""（空字串不顯示）
}
```

---

## GitHub Pages 部署：basePath 處理

Next.js 16 **不自動**將 `basePath` 加到 `next/image` 的 `src`，必須手動補上。

**`next.config.ts`** 設定：
```ts
const BASE_PATH = process.env.GITHUB_ACTIONS ? '/moo2web' : ''

const nextConfig: NextConfig = {
  output: 'export',
  basePath: BASE_PATH,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: BASE_PATH },
}
```

**`src/lib/imgPath.ts`** helper：
```ts
export const imgPath = (src: string) =>
  (process.env.NEXT_PUBLIC_BASE_PATH ?? '') + src
```

所有 `<Image src={...}>` 都必須用 `imgPath()` 包住：
```tsx
import { imgPath } from '@/lib/imgPath'
<Image src={imgPath(product.images[0])} ... />
```

---

## 已知 Bug 修正紀錄

### Modal 縮圖點擊後 index 被重置
**原因：** `setIdx(0)` 和 keyboard handler 放在同一個 `useEffect`，`idx` 在 deps 裡，點擊縮圖觸發 idx 變更 → effect 重跑 → `setIdx(0)`。

**修法：** 拆成兩個 effect：
```ts
// 只在商品切換時重置 index
useEffect(() => {
  setIdx(0)
  document.body.style.overflow = 'hidden'
  return () => { document.body.style.overflow = '' }
}, [product])

// keyboard handler 需要讀 idx，所以跟著 idx 更新
useEffect(() => {
  const handler = (e: KeyboardEvent) => { ... }
  document.addEventListener('keydown', handler)
  return () => document.removeEventListener('keydown', handler)
}, [onClose, go, idx])
```

### 圖片檔名空格問題
Linux 環境（GitHub Actions）檔名大小寫嚴格。`prices.json` 中 `images` 的路徑必須與 `public/images/` 內的實際檔名完全一致，且**不可有空格**。

---

## 部署流程

**分支：** `master`（GitHub Actions 監聽 `master`，不是 `main`）

```
git add .
git commit -m "update: ..."
git push origin master
```

Push 後 GitHub Actions 自動執行 `npm ci && npm run build`，約 1~2 分鐘網站更新。

**查看部署狀態：** https://github.com/rebeccaLinx/moo2web/actions

---

## 新增商品

只需編輯 `public/data/prices.json`，在 `products` 陣列加入：

```json
{
  "id": "unique-id",
  "name": "新款耳環名稱",
  "images": ["/images/photo1.png"],
  "description": "商品描述",
  "variants": [
    { "type": "耳夾", "price": 320 },
    { "type": "耳針", "price": 290 }
  ],
  "colors": [
    { "name": "玫瑰金", "hex": "#C9A084" }
  ],
  "tag": "新品"
}
```

- `images` 填 `[]` → 顯示 SVG 佔位圖
- `colors` 填 `[]` → 不顯示色卡
- `tag` 填 `""` → 不顯示標籤
- 不需動任何 `.tsx` 或 `.css` 檔案
