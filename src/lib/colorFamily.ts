import type { Color } from '@/types/product'

// 依關鍵字把細分色名（淡粉/渲染粉/藍A/藍白色…）去重歸入大色系。
// 順序即優先序：先比中的先贏，例如「黑粉」→粉、「藍白色」→藍、「紅白色」→紅。
const FAMILIES: { label: string; keywords: string[]; hex: string }[] = [
  { label: '粉', keywords: ['粉'],       hex: '#ffb0d7' },
  { label: '藍', keywords: ['藍'],       hex: '#4bb8fa' },
  { label: '紅', keywords: ['紅'],       hex: '#d51c39' },
  { label: '金', keywords: ['金'],       hex: '#c9a24b' },
  { label: '銀', keywords: ['銀'],       hex: '#c0c0c0' },
  { label: '黃', keywords: ['黃'],       hex: '#feec41' },
  { label: '橘', keywords: ['橘', '橙'], hex: '#ff6c00' },
  { label: '黑', keywords: ['黑'],       hex: '#1b1b1b' },
  { label: '綠', keywords: ['綠'],       hex: '#2e8b57' },
  { label: '紫', keywords: ['紫'],       hex: '#8a5cc0' },
  { label: '白', keywords: ['白'],       hex: '#ffffff' },
]

/** 細分色名 → 大色系標籤；無法歸類時退回原色名。 */
export function getColorFamily(name: string): string {
  return FAMILIES.find(f => f.keywords.some(k => name.includes(k)))?.label ?? name
}

/** 色系代表色（給側欄色點用）；無法歸類時退回該色實際 hex 的主色。 */
export function colorFamilyHex(label: string, fallback: Color['hex']): string {
  const fam = FAMILIES.find(f => f.label === label)
  if (fam) return fam.hex
  return Array.isArray(fallback) ? fallback[0] : fallback
}
