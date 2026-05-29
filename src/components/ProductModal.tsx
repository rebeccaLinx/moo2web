'use client'
import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
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

  return createPortal(
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
    </div>,
    document.body
  )
}
