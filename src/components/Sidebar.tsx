'use client'
import { useMemo, useState, type ReactNode } from 'react'
import type { Product } from '@/types/product'
import { type VariantCategory, CATEGORY_LABEL, getVariantCategory } from '@/lib/variantCategory'
import { getColorFamily, colorFamilyHex } from '@/lib/colorFamily'
import { toValues } from '@/lib/multiValue'
import { useFilter } from './FilterContext'
import styles from './Sidebar.module.css'

const STYLE_CATS: VariantCategory[] = ['earHook', 'earClip']

/** 從單值/多值欄位推導 unique 值 + 符合商品數（依出現順序）。 */
function countValues(
  products: Product[],
  pick: (p: Product) => string | string[] | undefined
): { value: string; count: number }[] {
  const map = new Map<string, number>()
  for (const p of products) {
    const field = pick(p)
    if (field == null) continue
    const seen = new Set<string>()
    for (const v of toValues(field)) {
      if (seen.has(v)) continue
      seen.add(v)
      map.set(v, (map.get(v) ?? 0) + 1)
    }
  }
  return [...map.entries()].map(([value, count]) => ({ value, count }))
}

/** 可摺疊的篩選區塊（預設展開，點標題收合）。 */
function Section({ title, en, children }: { title: string; en: string; children: ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div className={styles.block}>
      <button
        type="button"
        className={styles.blockHead}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className={styles.blockTitle}>{title}</span>
        <span className={styles.blockEn}>{en}</span>
        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} aria-hidden="true">⌄</span>
      </button>
      {open && children}
    </div>
  )
}

export default function Sidebar({ products }: { products: Product[] }) {
  const { active, select, clear, hasFilter } = useFilter()
  const [open, setOpen] = useState(false)

  const styleItems = useMemo(
    () =>
      STYLE_CATS.map(cat => ({
        cat,
        label: CATEGORY_LABEL[cat],
        count: products.filter(p =>
          p.variants.some(v => getVariantCategory(v.type) === cat)
        ).length,
      })).filter(it => it.count > 0),
    [products]
  )

  const tagItems = useMemo(() => {
    const map = new Map<string, number>()
    for (const p of products) {
      if (p.tag && p.tag !== 'soldOut') map.set(p.tag, (map.get(p.tag) ?? 0) + 1)
    }
    return [...map.entries()].map(([tag, count]) => ({ tag, count }))
  }, [products])

  const colorItems = useMemo(() => {
    const map = new Map<string, { hex: string; count: number }>()
    for (const p of products) {
      const seen = new Set<string>()
      for (const c of p.colors) {
        const fam = getColorFamily(c.name)
        if (seen.has(fam)) continue
        seen.add(fam)
        const cur = map.get(fam)
        if (cur) cur.count++
        else map.set(fam, { hex: colorFamilyHex(fam, c.hex), count: 1 })
      }
    }
    return [...map.entries()].map(([name, v]) => ({ name, hex: v.hex, count: v.count }))
  }, [products])

  const styleTags = useMemo(() => countValues(products, p => p.style), [products])
  const themeTags = useMemo(() => countValues(products, p => p.theme), [products])

  const close = () => setOpen(false)

  const pick = (key: 'variant' | 'tag' | 'color' | 'style' | 'theme', value: string) => {
    select(key, value)
    close()
  }

  return (
    <>
      <button className={styles.hamburger} onClick={() => setOpen(true)} aria-label="開啟篩選分類">
        ☰ 篩選分類
      </button>

      {open && <div className={styles.backdrop} onClick={close} />}

      <aside className={`${styles.panel} ${open ? styles.open : ''}`}>
        {hasFilter && (
          <button className={styles.clearBtn} onClick={() => { clear(); close() }}>
            ✕ 清除全部篩選
          </button>
        )}

        {/* 款式 */}
        <Section title="款式" en="TYPE">
          <button
            className={`${styles.item} ${!hasFilter ? styles.itemOn : ''}`}
            onClick={() => { clear(); close() }}
          >
            <span className={styles.itemLabel}>全部商品</span>
            <span className={styles.itemCount}>{products.length}</span>
          </button>
          {styleItems.map(it => (
            <button
              key={it.cat}
              className={`${styles.item} ${active.variant === it.cat ? styles.itemOn : ''}`}
              onClick={() => pick('variant', it.cat)}
            >
              <span className={styles.itemLabel}>{it.label}</span>
              <span className={styles.itemCount}>{it.count}</span>
            </button>
          ))}
        </Section>

        {/* 標籤 */}
        {tagItems.length > 0 && (
          <Section title="標籤" en="TAG">
            {tagItems.map(it => (
              <button
                key={it.tag}
                className={`${styles.item} ${active.tag === it.tag ? styles.itemOn : ''}`}
                onClick={() => pick('tag', it.tag)}
              >
                <span className={styles.itemLabel}>{it.tag}</span>
                <span className={styles.itemCount}>{it.count}</span>
              </button>
            ))}
          </Section>
        )}

        {/* 風格 */}
        {styleTags.length > 0 && (
          <Section title="風格" en="STYLE">
            {styleTags.map(it => (
              <button
                key={it.value}
                className={`${styles.item} ${active.style === it.value ? styles.itemOn : ''}`}
                onClick={() => pick('style', it.value)}
              >
                <span className={styles.itemLabel}>{it.value}</span>
                <span className={styles.itemCount}>{it.count}</span>
              </button>
            ))}
          </Section>
        )}

        {/* 主題 */}
        {themeTags.length > 0 && (
          <Section title="主題" en="THEME">
            {themeTags.map(it => (
              <button
                key={it.value}
                className={`${styles.item} ${active.theme === it.value ? styles.itemOn : ''}`}
                onClick={() => pick('theme', it.value)}
              >
                <span className={styles.itemLabel}>{it.value}</span>
                <span className={styles.itemCount}>{it.count}</span>
              </button>
            ))}
          </Section>
        )}

        {/* 顏色（置於最後） */}
        {colorItems.length > 0 && (
          <Section title="顏色" en="COLOR">
            {colorItems.map(it => (
              <button
                key={it.name}
                className={`${styles.item} ${active.color === it.name ? styles.itemOn : ''}`}
                onClick={() => pick('color', it.name)}
              >
                <span className={styles.dot} style={{ background: it.hex }} />
                <span className={styles.itemLabel}>{it.name}</span>
                <span className={styles.itemCount}>{it.count}</span>
              </button>
            ))}
          </Section>
        )}
      </aside>
    </>
  )
}
