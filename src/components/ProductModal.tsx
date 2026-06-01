'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import type { Product } from '@/types/product'
import { imgPath } from '@/lib/imgPath'
import { hexToBackground } from '@/lib/hexToBackground'
import styles from './ProductModal.module.css'
import { type VariantCategory, CATEGORY_LABEL, getVariantCategory } from '@/lib/variantCategory'

interface Props {
  product: Product
  onClose: () => void
  initialColorIdx?: number
}

export default function ProductModal({ product, onClose, initialColorIdx = -1 }: Props) {
  const [idx, setIdx] = useState(0)
  const [selectedColorIdx, setSelectedColorIdx] = useState(initialColorIdx)
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(-1)
  const [selectedSizeIdx, setSelectedSizeIdx] = useState(-1)

  const allImages = useMemo(() => {
    const seen = new Set(product.images)
    const extra: string[] = []
    for (const c of product.colors) {
      if (c.image && !seen.has(c.image)) { seen.add(c.image); extra.push(c.image) }
    }
    for (const v of product.variants) {
      if (v.image && !seen.has(v.image)) { seen.add(v.image); extra.push(v.image) }
    }
    for (const s of (product.sizes ?? [])) {
      if (s.image && !seen.has(s.image)) { seen.add(s.image); extra.push(s.image) }
    }
    return [...product.images, ...extra]
  }, [product])

  const go = useCallback((next: number) => {
    if (next >= 0 && next < allImages.length) {
      setIdx(next)
      setSelectedColorIdx(-1)
      setSelectedVariantIdx(-1)
      setSelectedSizeIdx(-1)
    }
  }, [allImages.length])

  useEffect(() => {
    setSelectedColorIdx(initialColorIdx)
    const initImage = initialColorIdx >= 0 ? product.colors[initialColorIdx]?.image : undefined
    const initIdx = initImage ? allImages.indexOf(initImage) : 0
    setIdx(initIdx >= 0 ? initIdx : 0)
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [product, initialColorIdx, allImages])

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
    setSelectedVariantIdx(-1)
    setSelectedSizeIdx(-1)
    const image = product.colors[i]?.image
    if (!image) return
    const imgIdx = allImages.indexOf(image)
    if (imgIdx >= 0) setIdx(imgIdx)
  }

  const handleVariantClick = (i: number) => {
    const image = product.variants[i]?.image
    if (!image) return
    setSelectedVariantIdx(i)
    setSelectedColorIdx(-1)
    setSelectedSizeIdx(-1)
    const imgIdx = allImages.indexOf(image)
    if (imgIdx >= 0) setIdx(imgIdx)
  }

  const handleSizeClick = (i: number) => {
    setSelectedSizeIdx(i)
    setSelectedColorIdx(-1)
    setSelectedVariantIdx(-1)
    const image = product.sizes?.[i]?.image
    if (!image) return
    const imgIdx = allImages.indexOf(image)
    if (imgIdx >= 0) setIdx(imgIdx)
  }

  const mainSrc = allImages[idx]

  return createPortal(
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.box} onClick={e => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose} aria-label="關閉">✕</button>

        {/* Gallery */}
        <div className={styles.gallery}>
          <div className={styles.mainWrap}>
            {allImages.length > 0 ? (
              <Image className={styles.mainImg} src={imgPath(mainSrc)} alt={`${product.name} 圖片 ${idx + 1}`}
                     fill sizes="(max-width: 600px) 100vw, 380px" />
            ) : (
              <div className={styles.noImg}>✦</div>
            )}
            {allImages.length > 1 && (
              <>
                <button className={`${styles.arrow} ${styles.prev}`} onClick={() => go(idx - 1)}
                        disabled={idx === 0} aria-label="上一張">&#8249;</button>
                <button className={`${styles.arrow} ${styles.next}`} onClick={() => go(idx + 1)}
                        disabled={idx === allImages.length - 1} aria-label="下一張">&#8250;</button>
              </>
            )}
          </div>
          {allImages.length > 1 && (
            <div className={styles.thumbs}>
              {allImages.map((src, i) => (
                <Image key={src} className={`${styles.thumb} ${i === idx ? styles.thumbActive : ''}`}
                       src={imgPath(src)} alt={`縮圖 ${i + 1}`} width={56} height={56}
                       onClick={() => { setIdx(i); setSelectedColorIdx(-1); setSelectedVariantIdx(-1); setSelectedSizeIdx(-1) }} />
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
          {(() => {
            const categories: VariantCategory[] = ['earHook', 'earClip']
            const hasMultipleCategories = categories.filter(
              cat => product.variants.some(v => getVariantCategory(v.type) === cat)
            ).length > 1
            return categories.map(cat => {
              const group = product.variants
                .map((v, i) => ({ v, i }))
                .filter(({ v }) => getVariantCategory(v.type) === cat)
              if (!group.length) return null
              return (
                <div key={cat} className={styles.variants}>
                  {hasMultipleCategories && (
                    <p className={styles.variantGroupLabel}>{CATEGORY_LABEL[cat]}</p>
                  )}
                  {group.map(({ v, i }) => (
                    <div
                      key={v.type}
                      className={`${styles.variantRow} ${v.image ? styles.variantClickable : ''} ${i === selectedVariantIdx ? styles.variantActive : ''}`}
                      onClick={() => handleVariantClick(i)}
                    >
                      <span className={styles.variantType}>{v.type}</span>
                      <span className={styles.variantPrice}>{v.price}</span>
                    </div>
                  ))}
                </div>
              )
            })
          })()}
          {product.sizes?.length ? (
            <>
              <p className={styles.sectionLabel}>尺寸</p>
              <div className={styles.variants}>
                {product.sizes.map((s, i) => (
                  <div
                    key={s.name}
                    className={`${styles.variantRow} ${s.image ? styles.variantClickable : ''} ${i === selectedSizeIdx ? styles.variantActive : ''}`}
                    onClick={() => handleSizeClick(i)}
                  >
                    <span className={styles.variantType}>{s.name}</span>
                    <span className={styles.variantPrice}>{s.price}</span>
                  </div>
                ))}
              </div>
            </>
          ) : null}
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
                    <div className={styles.colorDot} style={{ background: hexToBackground(c.hex) }} title={c.name} />
                    <span className={styles.colorName}>{c.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
