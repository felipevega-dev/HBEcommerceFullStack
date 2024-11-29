import React, { Suspense } from 'react'
import Hero from '../components/Hero'
import LoadingSpinner from '../components/LoadingSpinner'
const LatestCollection = React.lazy(() => import('../components/LatestCollection'))
const BestSeller = React.lazy(() => import('../components/BestSeller'))
const OurPolicy = React.lazy(() => import('../components/OurPolicy'))
const NewsletterBox = React.lazy(() => import('../components/NewsletterBox'))

const Home = () => {
  return (
    <main className='flex flex-col gap-16 md:gap-24'>
      <Hero />
      <Suspense fallback={<LoadingSpinner />}>
        <section className='space-y-16 md:space-y-24'>
          <LatestCollection />
          <BestSeller />
          <OurPolicy />
          <NewsletterBox />
        </section>
      </Suspense>
    </main>
  )
}

export default Home