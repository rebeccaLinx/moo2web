'use client'
import { useState } from 'react'
import type { Product } from '@/types/product'
import ProductCard from './ProductCard'
import ProductModal from './ProductModal'
import styles from './ProductSection.module.css'

type Filter = 'all' | '耳夾' | '耳針'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all',  label: '全部' },
  { id: '耳針', label: '耳針' },
  { id: '耳夾', label: '耳夾' },
]

const SECTIONS = [
  { id: '耳針' as const, title: '耳針', en: 'Pierced' },
  { id: '耳夾' as const, title: '耳夾', en: 'Clip-on' },
]

export default function ProductSection({ products }: { products: Product[] }) {
  const [filter, setFilter]     = useState<Filter>('all')
  const [selected, setSelected] = useState<Product | null>(null)

  const getItems = (variantType: '耳夾' | '耳針') =>
    products.filter(p => p.variants.some(v => v.type === variantType))

  const allFiltered = filter === 'all'
    ? products
    : products.filter(p => p.variants.some(v => v.type === filter))

  let cardIndex = 0

  return (
    <div style={{ position: 'relative', zIndex: 2 }}>
      {/* Sticky filter nav */}
      <nav className={styles.nav}>
        {FILTERS.map(f => (
          <button
            key={f.id}
            className={`${styles.navBtn} ${filter === f.id ? styles.on : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </nav>

      <div className={styles.wrap}>
        {filter === 'all' ? (
          /* Grouped sections */
          SECTIONS.map(sec => {
            const items = getItems(sec.id)
            if (!items.length) return null
            return (
              <section key={sec.id} className={styles.section}>
                <div className={styles.secHead}>
                  <h2 className={styles.secTitle}>{sec.title}</h2>
                  <span className={styles.secEn}>{sec.en}</span>
                  <span className={styles.secRule} />
                </div>
                <div className={styles.grid}>
                  {items.map(p => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onClick={() => setSelected(p)}
                      index={cardIndex++}
                    />
                  ))}
                </div>
              </section>
            )
          })
        ) : (
          /* Single filtered section */
          <section className={styles.section}>
            <div className={styles.secHead}>
              <h2 className={styles.secTitle}>
                {SECTIONS.find(s => s.id === filter)?.title}
              </h2>
              <span className={styles.secEn}>
                {SECTIONS.find(s => s.id === filter)?.en}
              </span>
              <span className={styles.secRule} />
            </div>
            <div className={styles.grid}>
              {allFiltered.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onClick={() => setSelected(p)}
                  index={i}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {selected && (
        <ProductModal product={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
