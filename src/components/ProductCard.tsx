'use client'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import type { Product } from '@/types/product'
import { imgPath } from '@/lib/imgPath'
import { hexToBackground, firstHex } from '@/lib/hexToBackground'
import styles from './ProductCard.module.css'

interface Props {
  product: Product
  onClick: (colorIdx: number) => void
  index?: number
}

export default function ProductCard({ product, onClick, index = 0 }: Props) {
  const [imgError, setImgError] = useState(false)
  const [visible, setVisible] = useState(false)
  const [selectedColorIdx, setSelectedColorIdx] = useState(-1)
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
    selectedColorIdx >= 0
      ? (product.colors[selectedColorIdx]?.image ?? product.images[0])
      : product.images[0]

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
          <EarringMotif index={index} hex={firstHex(product.colors[0]?.hex ?? '#8fb3d9')} />
        )}
      </div>

      {product.colors.length > 0 && (
        <div className={styles.swatches}>
          {product.colors.map((c, i) => (
            <span
              key={c.name}
              className={`${styles.swatch} ${i === selectedColorIdx ? styles.swatchActive : ''}`}
              style={{ background: hexToBackground(c.hex) }}
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
        {product.promotion && (
          <div className={styles.promoBadge}>
            買{product.promotion.quantity}件 NT${product.promotion.price}
          </div>
        )}
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
