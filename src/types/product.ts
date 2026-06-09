export interface Variant {
  type: string
  price: number
  image?: string
}

export interface Color {
  name: string
  hex: string | [string, string]
  image?: string
}

export interface Size {
  name: string
  price?: number
  image?: string
}

export interface Promotion {
  quantity: number
  price: number
}

export interface Product {
  id: string
  name: string
  images: string[]
  description: string
  variants: Variant[]
  colors: Color[]
  sizes?: Size[]
  tag: string
  style?: string | string[]
  theme?: string | string[]
  promotion?: Promotion
}

export interface PriceData {
  intro: string
  instagram: string
  notices: string[]
  products: Product[]
}
