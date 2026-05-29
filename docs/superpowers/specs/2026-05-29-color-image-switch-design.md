# 顏色切換圖片功能 — 設計文件

> 日期：2026-05-29

## 目標

點擊商品的顏色色塊時，切換到該顏色對應的圖片。在商品卡和 modal 燈箱中都有效，且 modal 延續卡片上已選的顏色。

---

## 資料結構變更

### `src/types/product.ts`

`Color` 介面新增選填的 `image` 欄位：

```ts
export interface Color {
  name: string
  hex: string
  image?: string   // 選填；填入 images[] 中的路徑；未填則點色塊不換圖
}
```

### `public/data/prices.json`

各商品的 `colors` 陣列中，需要對應圖片的顏色加上 `image` 欄位。`image` 的值**必須是該商品 `images[]` 裡已存在的路徑**：

```json
{
  "images": ["/images/moon.png", "/images/moon2.png", "/images/moon3.png"],
  "colors": [
    { "name": "珍珠白", "hex": "#F0EDE8", "image": "/images/moon.png" },
    { "name": "淡粉",   "hex": "#F2C4CE", "image": "/images/moon2.png" },
    { "name": "圓形",   "hex": "#F2C4CE", "image": "/images/moon3.png" }
  ]
}
```

沒有 `image` 欄位的顏色點擊後不換圖（向下相容，現有資料無需全部修改）。

---

## 元件改動

### ProductCard

**新增狀態：**
```ts
const [selectedColorIdx, setSelectedColorIdx] = useState(0)
```

**圖片顯示邏輯：**
```ts
const displayImage = colors[selectedColorIdx]?.image ?? images[0]
```

**顏色點擊：**
```tsx
<span
  onClick={(e) => {
    e.stopPropagation()  // 避免觸發開 modal
    setSelectedColorIdx(i)
  }}
/>
```

**onClick 簽名變更：**
```ts
// 改前
onClick: () => void

// 改後
onClick: (colorIdx: number) => void
```

點擊卡片時傳出目前選中的顏色 idx：
```tsx
onClick={() => onClick(selectedColorIdx)}
```

---

### ProductSection

**selected state 結構變更：**
```ts
// 改前
const [selected, setSelected] = useState<Product | null>(null)

// 改後
const [selected, setSelected] = useState<{ product: Product; colorIdx: number } | null>(null)
```

**card onClick 處理：**
```tsx
<ProductCard
  onClick={(colorIdx) => setSelected({ product: p, colorIdx })}
/>
```

**傳給 modal：**
```tsx
<ProductModal
  product={selected.product}
  initialColorIdx={selected.colorIdx}
  onClose={() => setSelected(null)}
/>
```

---

### ProductModal

**新增 prop：**
```ts
interface Props {
  product: Product
  onClose: () => void
  initialColorIdx?: number   // 新增
}
```

**新增狀態：**
```ts
const [selectedColorIdx, setSelectedColorIdx] = useState(initialColorIdx ?? 0)
```

**初始化 idx（在 product 切換的 effect 裡）：**
```ts
useEffect(() => {
  setSelectedColorIdx(initialColorIdx ?? 0)
  const initImage = product.colors[initialColorIdx ?? 0]?.image
  const initIdx = initImage ? product.images.indexOf(initImage) : 0
  setIdx(initIdx >= 0 ? initIdx : 0)
  document.body.style.overflow = 'hidden'
  return () => { document.body.style.overflow = '' }
}, [product, initialColorIdx])
```

**顏色點擊（modal 內）：**
```ts
const handleColorClick = (i: number) => {
  setSelectedColorIdx(i)
  const image = product.colors[i]?.image
  if (!image) return
  const imgIdx = product.images.indexOf(image)
  if (imgIdx >= 0) setIdx(imgIdx)
}
```

**色塊 UI**（modal 內顏色加選中 highlight）：
```tsx
{product.colors.map((c, i) => (
  <div
    key={c.name}
    className={`${styles.colorItem} ${i === selectedColorIdx ? styles.colorActive : ''}`}
    onClick={() => handleColorClick(i)}
  >
    <div className={styles.colorDot} style={{ background: c.hex }} />
    <span className={styles.colorName}>{c.name}</span>
  </div>
))}
```

---

## 限制與邊界情況

| 情況 | 行為 |
|---|---|
| `color.image` 未填 | 點色塊不換圖，僅更新 highlight |
| `color.image` 不在 `images[]` 中 | fallback 到第一張（`indexOf` 回傳 -1 時） |
| 商品只有一張圖或無圖 | 功能靜默不作用（既有邏輯） |
| 縮圖列點擊 | 原有行為不變，同時 `selectedColorIdx` 不更新（縮圖和顏色選擇為獨立操作） |

---

## 異動檔案清單

| 檔案 | 異動類型 |
|---|---|
| `src/types/product.ts` | `Color` 加 `image?` 欄位 |
| `public/data/prices.json` | 各顏色加 `image` 路徑 |
| `src/components/ProductCard.tsx` | 顏色 state + 圖片切換 + onClick 簽名 |
| `src/components/ProductSection.tsx` | selected state 結構 |
| `src/components/ProductModal.tsx` | initialColorIdx prop + 顏色切換邏輯 + highlight |
| `src/components/ProductModal.module.css` | `.colorActive` 樣式（選中色塊高亮） |
