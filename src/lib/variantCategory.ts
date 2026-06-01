export type VariantCategory = 'earHook' | 'earClip'

export const CATEGORY_LABEL: Record<VariantCategory, string> = {
  earHook: '耳勾/耳針',
  earClip: '耳夾',
}

export const CATEGORY_EN: Record<VariantCategory, string> = {
  earHook: 'Pierced / Hook',
  earClip: 'Clip-on',
}

export function getVariantCategory(type: string): VariantCategory {
  if (type.includes('耳勾') || type.includes('耳針')) return 'earHook'
  return 'earClip'
}
