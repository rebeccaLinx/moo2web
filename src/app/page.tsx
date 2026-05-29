import priceData from '../../public/data/prices.json'
import type { PriceData } from '@/types/product'
import Header from '@/components/Header'
import ProductSection from '@/components/ProductSection'
import IntroSection from '@/components/IntroSection'
import Footer from '@/components/Footer'

export default function Home() {
  const data = priceData as PriceData
  return (
    <>
      <Header instagram={data.instagram} />
      <ProductSection products={data.products} />
      <IntroSection intro={data.intro} />
      <Footer instagram={data.instagram} />
    </>
  )
}
