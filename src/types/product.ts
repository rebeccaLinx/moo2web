export interface Variant {
  type: '耳夾' | '耳針'
  price: number
}

export interface Color {
  name: string
  hex: string | [string, string]
  image?: string
}

export interface Product {
  id: string
  name: string
  images: string[]
  description: string
  variants: Variant[]
  colors: Color[]
  tag: string
}

export interface PriceData {
  intro: string
  instagram: string
  products: Product[]
}
