import priceData from '../../public/data/prices.json'
import type { PriceData } from '@/types/product'
import Header from '@/components/Header'
import IntroSection from '@/components/IntroSection'
import ProductSection from '@/components/ProductSection'
import Footer from '@/components/Footer'

export default function Home() {
  const data = priceData as PriceData
  return (
    <>
      <Header instagram={data.instagram} />
      <IntroSection intro={data.intro} />
      <ProductSection products={data.products} />
      <Footer instagram={data.instagram} />
    </>
  )
}
