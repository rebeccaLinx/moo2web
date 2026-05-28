'use client'
import Image from 'next/image'
import { useState } from 'react'
import type { Product } from '@/types/product'
import styles from './ProductCard.module.css'

interface Props {
  product: Product
  onClick: () => void
}

export default function ProductCard({ product, onClick }: Props) {
  const [imgError, setImgError] = useState(false)
  const prices = product.variants.map(v => v.price)
  const minPrice = Math.min(...prices)
  const priceLabel = prices.length > 1 ? `${minPrice} 起` : String(minPrice)

  const hasImage = product.images.length > 0 && !imgError

  return (
    <div className={styles.card} onClick={onClick} role="button" tabIndex={0}
         onKeyDown={e => e.key === 'Enter' && onClick()}>
      <div className={`${styles.imgWrap} ${!hasImage ? styles.noImg : ''}`}>
        {hasImage && (
          <Image
            className={styles.img}
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 480px) 45vw, 220px"
            onError={() => setImgError(true)}
          />
        )}
      </div>

      {product.colors.length > 0 && (
        <div className={styles.swatches}>
          {product.colors.map(c => (
            <span key={c.name} className={styles.swatch}
                  style={{ background: c.hex }} title={c.name} />
          ))}
        </div>
      )}

      <div className={styles.body}>
        {product.tag && <span className={styles.tag}>{product.tag}</span>}
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.desc}>{product.description}</p>
        <div className={styles.cardFooter}>
          <p className={styles.price}>{priceLabel}</p>
          <div className={styles.badges}>
            {product.variants.map(v => (
              <span key={v.type} className={styles.badge}>{v.type}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
