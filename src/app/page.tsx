import priceData from '../../public/data/prices.json'
import type { PriceData } from '@/types/product'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import ProductSection from '@/components/ProductSection'
import IntroSection from '@/components/IntroSection'
import Footer from '@/components/Footer'
import { FilterProvider } from '@/components/FilterContext'
import layout from './page.module.css'

export default function Home() {
  const data = priceData as unknown as PriceData
  return (
    <>
      <Header instagram={data.instagram} />
      <FilterProvider>
        <main className={layout.layout}>
          <Sidebar products={data.products} />
          <div className={layout.content}>
            <ProductSection products={data.products} notices={data.notices} />
          </div>
        </main>
      </FilterProvider>
      <IntroSection intro={data.intro} />
      <Footer instagram={data.instagram} />
    </>
  )
}
