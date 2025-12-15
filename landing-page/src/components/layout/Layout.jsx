import { lazy, Suspense } from 'react'
import Header from './Header'
import Footer from './Footer'

// Lazy load chat widget for performance
const LiveChatWidget = lazy(() => import('@components/common/LiveChatWidget'))

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      
      {/* Live Chat Widget - Lazy loaded */}
      <Suspense fallback={null}>
        <LiveChatWidget />
      </Suspense>
    </div>
  )
}

export default Layout
