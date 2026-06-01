'use client'
import { useState } from 'react'
import type { Product } from '@/types/product'
import { type VariantCategory, CATEGORY_LABEL, CATEGORY_EN, getVariantCategory } from '@/lib/variantCategory'
import ProductCard from './ProductCard'
import ProductModal from './ProductModal'
import styles from './ProductSection.module.css'

type Filter = 'all' | VariantCategory

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all',      label: '全部' },
  { id: 'earHook',  label: CATEGORY_LABEL.earHook },
  { id: 'earClip',  label: CATEGORY_LABEL.earClip },
]

const SECTIONS: { id: VariantCategory }[] = [
  { id: 'earHook' },
  { id: 'earClip' },
]

export default function ProductSection({ products }: { products: Product[] }) {
  const [filter, setFilter]     = useState<Filter>('all')
  const [selected, setSelected] = useState<{ product: Product; colorIdx: number } | null>(null)

  const sorted = [...products].sort((a, b) =>
    (a.tag === 'soldOut' ? 1 : 0) - (b.tag === 'soldOut' ? 1 : 0)
  )

  const getItems = (category: VariantCategory) =>
    sorted.filter(p => p.variants.some(v => getVariantCategory(v.type) === category))

  const allFiltered = filter === 'all'
    ? sorted
    : sorted.filter(p => p.variants.some(v => getVariantCategory(v.type) === filter))

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
                  <h2 className={styles.secTitle}>{CATEGORY_LABEL[sec.id]}</h2>
                  <span className={styles.secEn}>{CATEGORY_EN[sec.id]}</span>
                  <span className={styles.secRule} />
                </div>
                <div className={styles.grid}>
                  {items.map(p => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onClick={(colorIdx) => setSelected({ product: p, colorIdx })}
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
                {filter !== 'all' ? CATEGORY_LABEL[filter] : ''}
              </h2>
              <span className={styles.secEn}>
                {filter !== 'all' ? CATEGORY_EN[filter] : ''}
              </span>
              <span className={styles.secRule} />
            </div>
            <div className={styles.grid}>
              {allFiltered.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onClick={(colorIdx) => setSelected({ product: p, colorIdx })}
                  index={i}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {selected && (
        <ProductModal
          product={selected.product}
          initialColorIdx={selected.colorIdx}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
