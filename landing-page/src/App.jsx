import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import Layout from '@components/layout/Layout'
import { PageLoader } from '@components/common/LoadingSpinner'
import { requestIdleCallback } from '@utils/performance'

// Lazy load pages for code splitting with prefetch support
const Home = lazy(() => import(/* webpackChunkName: "home" */ '@pages/Home'))
const Features = lazy(() => import(/* webpackChunkName: "features" */ '@pages/Features'))
const AIDetection = lazy(() =>
  import(/* webpackChunkName: "ai-detection" */ '@pages/features/AIDetection')
)
const Humanization = lazy(() =>
  import(/* webpackChunkName: "humanization" */ '@pages/features/Humanization')
)
const VoiceProfile = lazy(() =>
  import(/* webpackChunkName: "voice-profile" */ '@pages/features/VoiceProfile')
)
const AIWorkspace = lazy(() =>
  import(/* webpackChunkName: "ai-workspace" */ '@pages/features/AIWorkspace')
)
const Rewrite = lazy(() =>
  import(/* webpackChunkName: "rewrite" */ '@pages/features/Rewrite')
)
const CompatibilityScore = lazy(() =>
  import(/* webpackChunkName: "compatibility-score" */ '@pages/features/CompatibilityScore')
)
const Deviations = lazy(() =>
  import(/* webpackChunkName: "deviations" */ '@pages/features/Deviations')
)
const Statistics = lazy(() =>
  import(/* webpackChunkName: "statistics" */ '@pages/features/Statistics')
)
const PrivacyPolicy = lazy(() =>
  import(/* webpackChunkName: "privacy" */ '@pages/PrivacyPolicy')
)
const Terms = lazy(() =>
  import(/* webpackChunkName: "terms" */ '@pages/Terms')
)

// Prefetch common routes in idle time
const prefetchRoutes = () => {
  requestIdleCallback(() => {
    // Prefetch Features page (common navigation)
    import('@pages/Features')
  }, { timeout: 5000 })
}

function App() {
  const location = useLocation()

  // Prefetch routes after initial load
  useEffect(() => {
    // Only prefetch on home page after initial render
    if (location.pathname === '/' || location.pathname.match(/^\/[a-z]{2}$/)) {
      const timer = setTimeout(prefetchRoutes, 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  return (
    <Layout>
        <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Default routes */}
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/features/ai-detection" element={<AIDetection />} />
          <Route path="/features/humanization" element={<Humanization />} />
          <Route path="/features/voice-profile" element={<VoiceProfile />} />
          <Route path="/features/ai-workspace" element={<AIWorkspace />} />
          <Route path="/features/rewrite" element={<Rewrite />} />
          <Route path="/features/compatibility-score" element={<CompatibilityScore />} />
          <Route path="/features/deviations" element={<Deviations />} />
          <Route path="/features/statistics" element={<Statistics />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />

          {/* Language-prefixed routes */}
          <Route path="/:lang">
            <Route index element={<Home />} />
            <Route path="features" element={<Features />} />
            <Route path="features/ai-detection" element={<AIDetection />} />
            <Route path="features/humanization" element={<Humanization />} />
            <Route path="features/voice-profile" element={<VoiceProfile />} />
            <Route path="features/ai-workspace" element={<AIWorkspace />} />
            <Route path="features/rewrite" element={<Rewrite />} />
            <Route path="features/compatibility-score" element={<CompatibilityScore />} />
            <Route path="features/deviations" element={<Deviations />} />
            <Route path="features/statistics" element={<Statistics />} />
            <Route path="privacy" element={<PrivacyPolicy />} />
            <Route path="terms" element={<Terms />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

export default App
