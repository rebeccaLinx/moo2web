'use client'
import { useState } from 'react'
import type { Product } from '@/types/product'
import { type VariantCategory, CATEGORY_LABEL, CATEGORY_EN, getVariantCategory } from '@/lib/variantCategory'
import { getColorFamily } from '@/lib/colorFamily'
import { matchesField } from '@/lib/multiValue'
import ProductCard from './ProductCard'
import ProductModal from './ProductModal'
import { useFilter } from './FilterContext'
import styles from './ProductSection.module.css'

const SECTIONS: { id: VariantCategory }[] = [
  { id: 'earHook' },
  { id: 'earClip' },
]

export default function ProductSection({ products, notices }: { products: Product[]; notices: string[] }) {
  const { active, hasFilter } = useFilter()
  const [selected, setSelected] = useState<{ product: Product; colorIdx: number } | null>(null)

  const sorted = [...products].sort((a, b) =>
    (a.tag === 'soldOut' ? 1 : 0) - (b.tag === 'soldOut' ? 1 : 0)
  )

  const getItems = (category: VariantCategory) =>
    sorted.filter(p => p.variants.some(v => getVariantCategory(v.type) === category))

  const matches = (p: Product) =>
    (!active.variant || p.variants.some(v => getVariantCategory(v.type) === active.variant)) &&
    (!active.tag || p.tag === active.tag) &&
    (!active.color || p.colors.some(c => getColorFamily(c.name) === active.color)) &&
    (!active.style || matchesField(p.style, active.style)) &&
    (!active.theme || matchesField(p.theme, active.theme))

  const filtered = sorted.filter(matches)

  let cardIndex = 0

  return (
    <div className={styles.wrap}>
      {!hasFilter ? (
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
              {active.variant ? CATEGORY_LABEL[active.variant] : '篩選結果'}
            </h2>
            <span className={styles.secEn}>{filtered.length} 件</span>
            <span className={styles.secRule} />
          </div>
          {filtered.length > 0 ? (
            <div className={styles.grid}>
              {filtered.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onClick={(colorIdx) => setSelected({ product: p, colorIdx })}
                  index={i}
                />
              ))}
            </div>
          ) : (
            <p className={styles.empty}>沒有符合條件的商品</p>
          )}
        </section>
      )}

      {selected && (
        <ProductModal
          product={selected.product}
          initialColorIdx={selected.colorIdx}
          notices={notices}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
