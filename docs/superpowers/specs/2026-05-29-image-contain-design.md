# 圖片自適應顯示（object-fit: contain）— 設計文件

> 日期：2026-05-29

## 目標

圖片不裁切，完整顯示在容器內，四周以背景色填補。

## 異動

| 檔案 | 選擇器 | 改動 |
|---|---|---|
| `ProductCard.module.css` | `.img` | `object-fit: cover` → `object-fit: contain` |
| `ProductCard.module.css` | `.card:hover .img` | 移除 `transform: scale(1.06)`（contain 下縮放只放大背景） |
| `ProductModal.module.css` | `.mainImg` | `object-fit: cover` → `object-fit: contain` |
| `ProductModal.module.css` | `.thumb` | `object-fit: cover` → `object-fit: contain` |

背景維持現有的霧藍漸層，不額外修改。
