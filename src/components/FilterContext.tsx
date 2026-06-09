'use client'
import { createContext, useContext, useState, useMemo, type ReactNode } from 'react'
import type { VariantCategory } from '@/lib/variantCategory'

export interface ActiveFilter {
  variant?: VariantCategory
  tag?: string
  color?: string
  style?: string
  theme?: string
}

interface FilterCtx {
  active: ActiveFilter
  /** 單選：選一個維度即清掉其他維度；再點同一項則取消。 */
  select: (key: keyof ActiveFilter, value: string) => void
  clear: () => void
  hasFilter: boolean
}

const Ctx = createContext<FilterCtx | null>(null)

export function FilterProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ActiveFilter>({})

  const value = useMemo<FilterCtx>(() => ({
    active,
    select: (key, val) =>
      setActive(prev => (prev[key] === val ? {} : { [key]: val })),
    clear: () => setActive({}),
    hasFilter: !!(active.variant || active.tag || active.color || active.style || active.theme),
  }), [active])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useFilter() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useFilter must be used within FilterProvider')
  return ctx
}
