# 優惠活動顯示 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在商品卡和 modal 顯示「買 N 件優惠價」，讓訪客在瀏覽時即可看到優惠資訊。

**Architecture:** `Product` 型別加選填 `promotion?: { quantity, price }`，無此欄位的商品不顯示任何優惠。`ProductCard` 在價格列下方加小 badge；`ProductModal` 在 variants 列表下方加優惠區塊，自動計算節省金額。

**Tech Stack:** Next.js 16、React 19、TypeScript 5、CSS Modules

---

## 異動檔案

| 檔案 | 異動 |
|---|---|
| `src/types/product.ts` | 新增 `Promotion` interface；`Product` 加 `promotion?` |
| `public/data/prices.json` | 有優惠的商品加 `promotion` 欄位 |
| `src/components/ProductCard.tsx` | priceRow 下方加 promoBadge |
| `src/components/ProductCard.module.css` | `.promoBadge` 樣式 |
| `src/components/ProductModal.tsx` | variants 下方加 promoBlock |
| `src/components/ProductModal.module.css` | `.promoBlock`、`.promoTitle`、`.promoSave` 樣式 |

---

## Task 1：更新型別定義

**Files:**
- Modify: `src/types/product.ts`

- [ ] **Step 1：更新 `src/types/product.ts`**

  完全取代為：

  ```ts
  export interface Variant {
    type: '耳夾' | '耳針'
    price: number
  }

  export interface Color {
    name: string
    hex: string | [string, string]
    image?: string
  }

  export interface Promotion {
    quantity: number
    price: number
  }

  export interface Product {
    id: string
    name: string
    images: string[]
    description: string
    variants: Variant[]
    colors: Color[]
    tag: string
    promotion?: Promotion
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
  預期：無輸出

- [ ] **Step 3：Commit**

  ```bash
  git add src/types/product.ts
  git commit -m "feat: 新增 Promotion 型別，Product 加 promotion? 欄位"
  ```

---

## Task 2：更新 prices.json

**Files:**
- Modify: `public/data/prices.json`

- [ ] **Step 1：在 `small-flowers` 商品加入 `promotion`**

  找到 id 為 `small-flowers` 的物件，在 `"tag"` 欄位後加入：

  ```json
  "promotion": { "quantity": 2, "price": 580 }
  ```

  完整物件結尾部分：
  ```json
      "tag": "熱銷",
      "promotion": { "quantity": 2, "price": 580 }
    }
  ```

- [ ] **Step 2：確認 JSON 語法正確**

  ```powershell
  node -e "require('./public/data/prices.json'); console.log('OK')"
  ```
  預期輸出：`OK`

- [ ] **Step 3：Commit**

  ```bash
  git add public/data/prices.json
  git commit -m "feat: small-flowers 加入買2件優惠 580 元"
  ```

---

## Task 3：更新 ProductCard

**Files:**
- Modify: `src/components/ProductCard.tsx`
- Modify: `src/components/ProductCard.module.css`

- [ ] **Step 1：在 `ProductCard.tsx` 的 `.info` 區塊加入 promoBadge**

  找到以下程式碼（`src/components/ProductCard.tsx` 第 96–109 行附近）：

  ```tsx
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
  ```

  取代為：

  ```tsx
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
          {product.promotion && (
            <div className={styles.promoBadge}>
              買{product.promotion.quantity}件 NT${product.promotion.price}
            </div>
          )}
        </div>
  ```

- [ ] **Step 2：在 `ProductCard.module.css` 加入 `.promoBadge` 樣式**

  在檔案最末尾加入：

  ```css
  .promoBadge {
    display: inline-block;
    margin-top: 8px;
    font-size: 11px;
    font-weight: 500;
    color: #7a5a00;
    background: rgba(201, 162, 75, 0.15);
    border: 1px solid rgba(201, 162, 75, 0.35);
    padding: 3px 9px;
    border-radius: 20px;
    letter-spacing: .03em;
  }
  ```

- [ ] **Step 3：確認 TypeScript 無錯誤**

  ```powershell
  npx tsc --noEmit
  ```
  預期：無輸出

- [ ] **Step 4：Commit**

  ```bash
  git add src/components/ProductCard.tsx src/components/ProductCard.module.css
  git commit -m "feat: ProductCard 加入優惠 badge"
  ```

---

## Task 4：更新 ProductModal

**Files:**
- Modify: `src/components/ProductModal.tsx`
- Modify: `src/components/ProductModal.module.css`

- [ ] **Step 1：在 `ProductModal.tsx` 的 variants 下方加入 promoBlock**

  找到以下程式碼（`src/components/ProductModal.tsx` 第 94–102 行附近）：

  ```tsx
            <p className={styles.sectionLabel}>款式與價格</p>
            <div className={styles.variants}>
              {product.variants.map(v => (
                <div key={v.type} className={styles.variantRow}>
                  <span className={styles.variantType}>{v.type}</span>
                  <span className={styles.variantPrice}>{v.price}</span>
                </div>
              ))}
            </div>
  ```

  取代為：

  ```tsx
            <p className={styles.sectionLabel}>款式與價格</p>
            <div className={styles.variants}>
              {product.variants.map(v => (
                <div key={v.type} className={styles.variantRow}>
                  <span className={styles.variantType}>{v.type}</span>
                  <span className={styles.variantPrice}>{v.price}</span>
                </div>
              ))}
            </div>
            {product.promotion && (() => {
              const minPrice = Math.min(...product.variants.map(v => v.price))
              const originalTotal = minPrice * product.promotion!.quantity
              const saved = originalTotal - product.promotion!.price
              return (
                <div className={styles.promoBlock}>
                  <div className={styles.promoTitle}>
                    🏷 買 {product.promotion!.quantity} 件優惠　NT${product.promotion!.price}
                  </div>
                  {saved > 0 && (
                    <div className={styles.promoSave}>
                      原價 {product.promotion!.quantity} × NT${minPrice} = NT${originalTotal}，省 NT${saved}
                    </div>
                  )}
                </div>
              )
            })()}
  ```

- [ ] **Step 2：在 `ProductModal.module.css` 加入優惠區塊樣式**

  在檔案最末尾加入：

  ```css
  .promoBlock {
    background: rgba(201, 162, 75, 0.1);
    border: 1px solid rgba(201, 162, 75, 0.3);
    border-radius: 10px;
    padding: 10px 14px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .promoTitle {
    font-size: 13.5px;
    font-weight: 600;
    color: #7a5a00;
    letter-spacing: .02em;
  }
  .promoSave {
    font-size: 11.5px;
    color: #a07820;
    font-weight: 400;
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
  git commit -m "feat: ProductModal 加入優惠區塊，自動計算節省金額"
  ```

---

## Task 5：Build 驗收

- [ ] **Step 1：執行 production build**

  ```powershell
  npm run build
  ```
  預期：`✓ Generating static pages`，無紅色錯誤

- [ ] **Step 2：本地確認**

  ```powershell
  npm run dev
  ```
  開啟 `http://localhost:3000`，確認：
  - `small-flowers` 商品卡下方顯示「買2件 NT$580」金色 badge
  - 點開 small-flowers modal，variants 下方顯示優惠區塊「🏷 買 2 件優惠 NT$580」和節省金額
  - 其他商品（無 `promotion` 欄位）不顯示任何優惠元素

- [ ] **Step 3：最終 commit**

  ```bash
  git add -A
  git commit -m "feat: 優惠活動顯示功能完成"
  ```
