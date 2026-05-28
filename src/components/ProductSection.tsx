'use client'
import { useState } from 'react'
import type { Product } from '@/types/product'
import ProductCard from './ProductCard'
import ProductModal from './ProductModal'
import styles from './ProductSection.module.css'

type Filter = 'all' | '耳夾' | '耳針'

const FILTERS: { id: Filter; label: string; desc: string }[] = [
  { id: 'all',  label: '全部', desc: '所有款式' },
  { id: '耳夾', label: '耳夾', desc: '夾式耳環，無需穿耳，舒適好戴' },
  { id: '耳針', label: '耳針', desc: '針式耳環，925銀針材質，抗敏感' },
]

export default function ProductSection({ products }: { products: Product[] }) {
  const [filter, setFilter]   = useState<Filter>('all')
  const [selected, setSelected] = useState<Product | null>(null)

  const filtered = filter === 'all'
    ? products
    : products.filter(p => p.variants.some(v => v.type === filter))

  const desc = FILTERS.find(f => f.id === filter)?.desc ?? ''

  return (
    <main className={styles.main}>
      <div className={styles.tabs} role="tablist">
        {FILTERS.map(f => (
          <button key={f.id}
            className={`${styles.tab} ${filter === f.id ? styles.active : ''}`}
            onClick={() => setFilter(f.id)}
            role="tab"
            aria-selected={filter === f.id}>
            {f.label}
          </button>
        ))}
      </div>

      <p className={styles.desc}>{desc}</p>

      <div className={styles.grid}>
        {filtered.map(p => (
          <ProductCard key={p.id} product={p} onClick={() => setSelected(p)} />
        ))}
      </div>

      {selected && (
        <ProductModal product={selected} onClose={() => setSelected(null)} />
      )}
    </main>
  )
}
