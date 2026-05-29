# 顏色切換圖片 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 點擊商品的顏色色塊時，切換到該顏色對應的圖片；在商品卡和 modal 燈箱都有效，modal 延續卡片選的顏色。

**Architecture:** `Color` 型別新增選填 `image` 欄位指向 `images[]` 中的路徑。`ProductCard` 管理 `selectedColorIdx` state，點擊色塊換圖，點卡片時把 idx 傳給 `ProductSection`。`ProductSection` 的 `selected` state 改為 `{ product, colorIdx }`，傳 `initialColorIdx` 給 `ProductModal`，modal 以此計算初始圖片 idx 並支援色塊點擊換圖。

**Tech Stack:** Next.js 16、React 19、TypeScript 5、CSS Modules

---

## 異動檔案

| 檔案 | 異動 |
|---|---|
| `src/types/product.ts` | `Color` 加 `image?` |
| `public/data/prices.json` | `pearl-round` 各顏色加 `image`，`moon-pin` 加 `image` |
| `src/components/ProductCard.tsx` | `selectedColorIdx` state + 圖片切換 + onClick 簽名 |
| `src/components/ProductCard.module.css` | `.swatchActive` 選中色環 |
| `src/components/ProductSection.tsx` | `selected` state 結構 |
| `src/components/ProductModal.tsx` | `initialColorIdx` prop + 顏色切換 |
| `src/components/ProductModal.module.css` | `.colorActive` 選中高亮 + 色塊 `cursor: pointer` |

---

## Task 1：更新型別定義

**Files:**
- Modify: `src/types/product.ts`

- [ ] **Step 1：在 `Color` 介面加入 `image?`**

  將 `src/types/product.ts` 完全取代為：

  ```ts
  export interface Variant {
    type: '耳夾' | '耳針'
    price: number
  }

  export interface Color {
    name: string
    hex: string
    image?: string
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

- [ ] **Step 2：確認 TypeScript 無錯誤**

  ```powershell
  npx tsc --noEmit
  ```
  預期：無輸出（零錯誤）

- [ ] **Step 3：Commit**

  ```bash
  git add src/types/product.ts
  git commit -m "feat: Color 型別加入選填 image 欄位"
  ```

---

## Task 2：更新 prices.json

**Files:**
- Modify: `public/data/prices.json`

只有 `pearl-round`（3 張圖對應 3 個顏色）和 `moon-pin`（1 張圖 1 個顏色）加 `image`。其他商品只有 1 張圖無法對應多顏色，不加。

- [ ] **Step 1：更新 `pearl-round` 的 colors**

  找到 id 為 `pearl-round` 的商品，將 `colors` 改為：

  ```json
  "colors": [
    { "name": "珍珠白", "hex": "#F0EDE8", "image": "/images/moon.png" },
    { "name": "淡粉",   "hex": "#F2C4CE", "image": "/images/moon2.png" },
    { "name": "圓形",   "hex": "#F2C4CE", "image": "/images/moon3.png" }
  ]
  ```

- [ ] **Step 2：更新 `moon-pin` 的 colors**

  找到 id 為 `moon-pin` 的商品，將 `colors` 改為：

  ```json
  "colors": [
    { "name": "鍍金", "hex": "#C9A84C", "image": "/images/toffee.png" }
  ]
  ```

- [ ] **Step 3：確認 JSON 語法正確**

  ```powershell
  node -e "require('./public/data/prices.json'); console.log('OK')"
  ```
  預期輸出：`OK`

- [ ] **Step 4：Commit**

  ```bash
  git add public/data/prices.json
  git commit -m "feat: prices.json 各顏色加入對應圖片路徑"
  ```

---

## Task 3：更新 ProductCard

**Files:**
- Modify: `src/components/ProductCard.tsx`
- Modify: `src/components/ProductCard.module.css`

- [ ] **Step 1：更新 `ProductCard.tsx`**

  將 `src/components/ProductCard.tsx` 完全取代為：

  ```tsx
  'use client'
  import Image from 'next/image'
  import { useState, useEffect, useRef } from 'react'
  import type { Product } from '@/types/product'
  import { imgPath } from '@/lib/imgPath'
  import styles from './ProductCard.module.css'

  interface Props {
    product: Product
    onClick: (colorIdx: number) => void
    index?: number
  }

  export default function ProductCard({ product, onClick, index = 0 }: Props) {
    const [imgError, setImgError] = useState(false)
    const [visible, setVisible] = useState(false)
    const [selectedColorIdx, setSelectedColorIdx] = useState(0)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const el = ref.current
      if (!el) return
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => setVisible(true), (index % 4) * 80)
            observer.disconnect()
          }
        },
        { threshold: 0.1 }
      )
      observer.observe(el)
      return () => observer.disconnect()
    }, [index])

    const prices = product.variants.map(v => v.price)
    const minPrice = Math.min(...prices)
    const priceLabel = prices.length > 1 ? `${minPrice} 起` : String(minPrice)

    const displayImage =
      product.colors[selectedColorIdx]?.image ?? product.images[0]

    const hasImage = !!displayImage && !imgError

    const handleColorClick = (e: React.MouseEvent, i: number) => {
      e.stopPropagation()
      setSelectedColorIdx(i)
      setImgError(false)
    }

    return (
      <div
        ref={ref}
        className={`${styles.card} ${visible ? styles.show : ''}`}
        onClick={() => onClick(selectedColorIdx)}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onClick(selectedColorIdx)}
      >
        <div className={`${styles.thumb} ${!hasImage ? styles.noImg : ''}`}>
          {product.tag && <span className={styles.badge}>{product.tag}</span>}
          {hasImage ? (
            <Image
              className={styles.img}
              src={imgPath(displayImage)}
              alt={product.name}
              fill
              sizes="(max-width: 480px) 45vw, 240px"
              onError={() => setImgError(true)}
            />
          ) : (
            <EarringMotif index={index} hex={product.colors[0]?.hex ?? '#8fb3d9'} />
          )}
        </div>

        {product.colors.length > 0 && (
          <div className={styles.swatches}>
            {product.colors.map((c, i) => (
              <span
                key={c.name}
                className={`${styles.swatch} ${i === selectedColorIdx ? styles.swatchActive : ''}`}
                style={{ background: c.hex }}
                title={c.name}
                onClick={e => handleColorClick(e, i)}
              />
            ))}
            <span className={styles.colorName}>
              {product.colors.map(c => c.name).join('・')}
            </span>
          </div>
        )}

        <div className={styles.info}>
          <h3 className={styles.name}>{product.name}</h3>
          <p className={styles.sub}>{product.description}</p>
          <div className={styles.priceRow}>
            <span className={styles.price}>
              <small>NT$</small>{priceLabel}
            </span>
            <div className={styles.badges}>
              {product.variants.map(v => (
                <span key={v.type} className={styles.typeBadge}>{v.type}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  function EarringMotif({ index, hex }: { index: number; hex: string }) {
    const dark = darken(hex)
    const motifs = [
      <svg key="a" className={styles.motif} viewBox="0 0 100 100">
        <circle cx="50" cy="22" r="6" fill="none" stroke={dark} strokeWidth="2"/>
        <path d="M50 28 v10" stroke={dark} strokeWidth="2"/>
        <circle cx="50" cy="58" r="20" fill={hex} opacity=".7"/>
        <circle cx="50" cy="58" r="20" fill="none" stroke={dark} strokeWidth="1.5"/>
      </svg>,
      <svg key="b" className={styles.motif} viewBox="0 0 100 100">
        <circle cx="50" cy="20" r="5" fill="none" stroke={dark} strokeWidth="2"/>
        <path d="M50 25 v8" stroke={dark} strokeWidth="2"/>
        <path d="M50 33 l18 30 -36 0 z" fill={hex} opacity=".7" stroke={dark} strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>,
      <svg key="c" className={styles.motif} viewBox="0 0 100 100">
        <circle cx="50" cy="20" r="5" fill="none" stroke={dark} strokeWidth="2"/>
        <path d="M50 25 v6" stroke={dark} strokeWidth="2"/>
        <circle cx="50" cy="42" r="9" fill="#ece6da" stroke={dark} strokeWidth="1.5"/>
        <circle cx="50" cy="64" r="13" fill={hex} opacity=".7" stroke={dark} strokeWidth="1.5"/>
      </svg>,
    ]
    return <>{motifs[index % motifs.length]}</>
  }

  function darken(hex: string): string {
    const n = parseInt(hex.replace('#', ''), 16)
    const r = Math.round(((n >> 16) & 255) * 0.55)
    const g = Math.round(((n >> 8) & 255) * 0.55)
    const b = Math.round((n & 255) * 0.55)
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
  }
  ```

- [ ] **Step 2：在 `ProductCard.module.css` 加入 `.swatchActive`**

  在 `.swatch:hover { ... }` 之後加入：

  ```css
  .swatchActive {
    transform: scale(1.25);
    box-shadow: 0 0 0 2px #fff, 0 0 0 4px currentColor;
    outline: 2px solid rgba(0,0,0,0.25);
    outline-offset: 2px;
  }
  .swatch { cursor: pointer; }
  ```

- [ ] **Step 3：確認 TypeScript 無錯誤**

  ```powershell
  npx tsc --noEmit
  ```
  預期：無輸出

- [ ] **Step 4：Commit**

  ```bash
  git add src/components/ProductCard.tsx src/components/ProductCard.module.css
  git commit -m "feat: ProductCard 色塊點擊換圖 + selectedColorIdx state"
  ```

---

## Task 4：更新 ProductSection

**Files:**
- Modify: `src/components/ProductSection.tsx`

- [ ] **Step 1：更新 `selected` state 與相關邏輯**

  只需修改 3 處，其餘不動：

  **1. state 宣告**（第 22 行附近）由：
  ```tsx
  const [selected, setSelected] = useState<Product | null>(null)
  ```
  改為：
  ```tsx
  const [selected, setSelected] = useState<{ product: Product; colorIdx: number } | null>(null)
  ```

  **2. ProductCard 的 onClick**（每個 `<ProductCard>` 的 onClick prop）由：
  ```tsx
  onClick={() => setSelected(p)}
  ```
  改為：
  ```tsx
  onClick={(colorIdx) => setSelected({ product: p, colorIdx })}
  ```
  （共兩處：grouped section 和 single filtered section 各一個 `<ProductCard>`）

  **3. ProductModal 的 props** 由：
  ```tsx
  <ProductModal product={selected} onClose={() => setSelected(null)} />
  ```
  改為：
  ```tsx
  <ProductModal
    product={selected.product}
    initialColorIdx={selected.colorIdx}
    onClose={() => setSelected(null)}
  />
  ```

- [ ] **Step 2：確認 TypeScript 無錯誤**

  ```powershell
  npx tsc --noEmit
  ```
  預期：無輸出

- [ ] **Step 3：Commit**

  ```bash
  git add src/components/ProductSection.tsx
  git commit -m "feat: ProductSection selected state 加入 colorIdx"
  ```

---

## Task 5：更新 ProductModal

**Files:**
- Modify: `src/components/ProductModal.tsx`
- Modify: `src/components/ProductModal.module.css`

- [ ] **Step 1：更新 `ProductModal.tsx`**

  將 `src/components/ProductModal.tsx` 完全取代為：

  ```tsx
  'use client'
  import { useState, useEffect, useCallback } from 'react'
  import Image from 'next/image'
  import type { Product } from '@/types/product'
  import { imgPath } from '@/lib/imgPath'
  import styles from './ProductModal.module.css'

  interface Props {
    product: Product
    onClose: () => void
    initialColorIdx?: number
  }

  export default function ProductModal({ product, onClose, initialColorIdx = 0 }: Props) {
    const [idx, setIdx] = useState(0)
    const [selectedColorIdx, setSelectedColorIdx] = useState(initialColorIdx)
    const images = product.images

    const go = useCallback((next: number) => {
      if (next >= 0 && next < images.length) setIdx(next)
    }, [images.length])

    useEffect(() => {
      setSelectedColorIdx(initialColorIdx)
      const initImage = product.colors[initialColorIdx]?.image
      const initIdx = initImage ? images.indexOf(initImage) : 0
      setIdx(initIdx >= 0 ? initIdx : 0)
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }, [product, initialColorIdx, images])

    useEffect(() => {
      const handler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
        if (e.key === 'ArrowLeft')  go(idx - 1)
        if (e.key === 'ArrowRight') go(idx + 1)
      }
      document.addEventListener('keydown', handler)
      return () => document.removeEventListener('keydown', handler)
    }, [onClose, go, idx])

    const handleColorClick = (i: number) => {
      setSelectedColorIdx(i)
      const image = product.colors[i]?.image
      if (!image) return
      const imgIdx = images.indexOf(image)
      if (imgIdx >= 0) setIdx(imgIdx)
    }

    return (
      <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
        <div className={styles.box} onClick={e => e.stopPropagation()}>
          <button className={styles.close} onClick={onClose} aria-label="關閉">✕</button>

          {/* Gallery */}
          <div className={styles.gallery}>
            <div className={styles.mainWrap}>
              {images.length > 0 ? (
                <Image className={styles.mainImg} src={imgPath(images[idx])} alt={`${product.name} 圖片 ${idx + 1}`}
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
                         src={imgPath(src)} alt={`縮圖 ${i + 1}`} width={56} height={56}
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
                  {product.colors.map((c, i) => (
                    <div
                      key={c.name}
                      className={`${styles.colorItem} ${i === selectedColorIdx ? styles.colorActive : ''}`}
                      onClick={() => handleColorClick(i)}
                    >
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

- [ ] **Step 2：在 `ProductModal.module.css` 加入 `.colorActive` 與 cursor 樣式**

  在 `.colorName { ... }` 之後加入：

  ```css
  .colorItem { cursor: pointer; }
  .colorActive .colorDot {
    box-shadow: 0 0 0 2px #fff, 0 0 0 4px rgba(45, 74, 124, 0.6);
  }
  .colorActive .colorName {
    color: var(--text-dark);
    font-weight: 500;
  }
  ```

- [ ] **Step 3：確認 TypeScript 無錯誤**

  ```powershell
  npx tsc --noEmit
  ```
  預期：無輸出

- [ ] **Step 4：Commit**

  ```bash
  git add src/components/ProductModal.tsx src/components/ProductModal.module.css
  git commit -m "feat: ProductModal 支援 initialColorIdx 與色塊點擊換圖"
  ```

---

## Task 6：手動驗收

- [ ] **Step 1：啟動開發伺服器**

  ```powershell
  npm run dev
  ```
  開啟 `http://localhost:3000`

- [ ] **Step 2：驗收商品卡色塊切換**

  點擊「珍珠圓形耳環」的三個顏色色塊：
  - 珍珠白 → 顯示 moon.png
  - 淡粉 → 顯示 moon2.png
  - 圓形 → 顯示 moon3.png
  - 每次點色塊，選中的色塊有明顯圓圈高亮
  - 點色塊不會開啟 modal

- [ ] **Step 3：驗收 modal 延續顏色**

  點擊「淡粉」色塊後再點卡片開啟 modal：
  - modal 開啟時顯示 moon2.png（淡粉對應的圖）
  - modal 右側「淡粉」色塊有高亮

- [ ] **Step 4：驗收 modal 內色塊切換**

  在 modal 打開狀態下點擊不同顏色：
  - 主圖即時切換到對應圖片
  - 縮圖列對應縮圖也同步高亮

- [ ] **Step 5：驗收無 image 欄位的商品**

  點擊「貝殼蝴蝶結耳環」（colors 無 image 欄位）的色塊：
  - 色塊點擊有 highlight 變化
  - 主圖不切換（行為靜默，無錯誤）

- [ ] **Step 6：確認 build 無錯誤**

  ```powershell
  npm run build
  ```
  預期：`✓ Generating static pages` 無紅色錯誤

- [ ] **Step 7：最終 commit**

  ```bash
  git add -A
  git commit -m "feat: 顏色色塊點擊換圖功能完成"
  ```
