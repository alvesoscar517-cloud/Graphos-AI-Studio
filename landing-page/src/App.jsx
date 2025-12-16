import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Layout from '@components/layout/Layout'
import { PageLoader } from '@components/common/LoadingSpinner'

// Lazy load pages for code splitting
// Using webpackChunkName for better debugging
const Home = lazy(() => import(/* webpackChunkName: "home" */ '@pages/Home'))
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

function App() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Default routes */}
          <Route path="/" element={<Home />} />
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
