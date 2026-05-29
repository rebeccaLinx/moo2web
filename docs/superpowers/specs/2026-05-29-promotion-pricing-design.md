# 優惠活動顯示 — 設計文件

> 日期：2026-05-29

## 目標

在商品卡和 modal 顯示「買 N 件優惠價」，讓訪客在瀏覽時即可看到優惠資訊。

---

## 資料結構

### 新增 `Promotion` interface（`src/types/product.ts`）

```ts
export interface Promotion {
  quantity: number   // 優惠數量（例如 2）
  price: number      // 優惠總價（例如 580）
}
```

### `Product` 加選填欄位

```ts
export interface Product {
  // ...現有欄位不變...
  promotion?: Promotion
}
```

### `prices.json` 範例

```json
{
  "id": "small-flowers",
  "promotion": { "quantity": 2, "price": 580 }
}
```

沒有 `promotion` 欄位的商品不顯示任何優惠。

---

## UI 顯示

### 商品卡（ProductCard）

在 `.priceRow` 右側加一個小 badge：

```
NT$320  [耳夾][耳針]   買2件 $580
```

- 樣式：金色系（`var(--gold)`）底色、圓角、小字
- 只顯示數量和優惠價，不顯示節省金額（空間有限）
- 無 `promotion` → 不渲染任何元素

### Modal（ProductModal）

在「款式與價格」variants 列表下方加一個優惠區塊：

```
🏷 買 2 件優惠　$580
原價 2 × $320 = $640，省 $60
```

- 樣式：淡金色背景圓角小卡（`rgba(201,162,75,.1)` 底色）
- 顯示：優惠數量、優惠總價、原價計算、節省金額
- 節省金額計算：`min(variants.price) × quantity - promotion.price`
- 無 `promotion` → 不渲染

---

## 異動檔案

| 檔案 | 異動 |
|---|---|
| `src/types/product.ts` | 新增 `Promotion` interface；`Product` 加 `promotion?` |
| `public/data/prices.json` | 有優惠的商品加 `promotion` 欄位 |
| `src/components/ProductCard.tsx` | `.priceRow` 加 `promoBadge` |
| `src/components/ProductCard.module.css` | `.promoBadge` 樣式 |
| `src/components/ProductModal.tsx` | variants 下方加 `promoBlock` |
| `src/components/ProductModal.module.css` | `.promoBlock`、`.promoTitle`、`.promoSave` 樣式 |

---

## 邊界情況

| 情況 | 行為 |
|---|---|
| 無 `promotion` | 不顯示任何優惠元素 |
| 商品只有一種 variant | 節省金額用該 variant 的 price 計算 |
| 節省金額為 0 或負數 | 不顯示節省金額（只顯示優惠價） |
