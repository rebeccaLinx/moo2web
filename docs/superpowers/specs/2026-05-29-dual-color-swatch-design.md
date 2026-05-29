# 雙色色塊 — 設計文件

> 日期：2026-05-29

## 目標

顏色色塊支援兩色半圓顯示，在商品卡和 modal 都有效。

## 資料結構

`Color.hex` 改為 `string | [string, string]`：

```ts
export interface Color {
  name: string
  hex: string | [string, string]
  image?: string
}
```

JSON 單色（不變）：
```json
{ "name": "紅", "hex": "#D51C39" }
```

JSON 雙色：
```json
{ "name": "黑粉", "hex": ["#111111", "#F2789F"] }
```

## Helper

新增 `src/lib/hexToBackground.ts`：

```ts
export const hexToBackground = (hex: string | [string, string]): string =>
  Array.isArray(hex)
    ? `linear-gradient(to right, ${hex[0]} 50%, ${hex[1]} 50%)`
    : hex
```

## 元件改動

| 檔案 | 改動 |
|---|---|
| `src/types/product.ts` | `hex: string` → `hex: string \| [string, string]` |
| `src/lib/hexToBackground.ts` | 新增 helper |
| `src/components/ProductCard.tsx` | swatch `style.background` 改用 `hexToBackground(c.hex)`；EarringMotif fallback 取 `Array.isArray(hex) ? hex[0] : hex` |
| `src/components/ProductModal.tsx` | colorDot `style.background` 改用 `hexToBackground(c.hex)` |
| `public/data/prices.json` | 需要雙色的顏色改為陣列 |

## 限制

- `hex` 陣列只支援兩個顏色（不支援三色以上）
- CSS 以 `linear-gradient(to right, A 50%, B 50%)` 實現，左右各半
