/**
 * LiveVoiceProfileDemo - Interactive Voice Profile visualization demo
 * Shows writing style analysis with animated metrics
 */
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { AppFrame } from './DemoWrapper'
import Icon from '@components/common/Icon'

// Sample profiles
const SAMPLE_PROFILES = [
  {
    name: 'Sarah Chen',
    avatar: 'SC',
    style: 'Professional & Warm',
    metrics: {
      formality: 65,
      creativity: 78,
      directness: 72,
      empathy: 85,
      technicality: 45
    },
    traits: ['Conversational', 'Empathetic', 'Clear', 'Engaging'],
    vocabulary: ['honestly', 'I think', 'let me explain', "here's the thing"],
    sentenceLength: 'Medium (12-18 words)',
    tone: 'Warm & Approachable'
  },
  {
    name: 'Alex Rivera',
    avatar: 'AR',
    style: 'Casual & Creative',
    metrics: {
      formality: 35,
      creativity: 92,
      directness: 58,
      empathy: 70,
      technicality: 40
    },
    traits: ['Playful', 'Creative', 'Informal', 'Storyteller'],
    vocabulary: ['basically', 'you know', 'kind of', 'super'],
    sentenceLength: 'Varied (8-25 words)',
    tone: 'Fun & Energetic'
  },
  {
    name: 'Dr. James Park',
    avatar: 'JP',
    style: 'Academic & Precise',
    metrics: {
      formality: 88,
      creativity: 55,
      directness: 82,
      empathy: 50,
      technicality: 90
    },
    traits: ['Analytical', 'Precise', 'Structured', 'Evidence-based'],
    vocabulary: ['furthermore', 'consequently', 'research indicates', 'data suggests'],
    sentenceLength: 'Long (18-28 words)',
    tone: 'Authoritative & Measured'
  }
]

const MetricBar = ({ label, value, delay = 0 }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-xs">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-700">{value}%</span>
    </div>
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: delay / 1000 }}
        className="h-full rounded-full bg-primary"
      />
    </div>
  </div>
)

const LiveVoiceProfileDemo = () => {
  const { t } = useTranslation()
  const [selectedProfile, setSelectedProfile] = useState(0)
  const [animationKey, setAnimationKey] = useState(0)

  const profile = SAMPLE_PROFILES[selectedProfile]

  const handleProfileChange = (index) => {
    if (index === selectedProfile) return
    setSelectedProfile(index)
    setAnimationKey((prev) => prev + 1)
  }

  return (
    <AppFrame
      title="Graphos AI Studio - Voice Profile"
      className="max-w-5xl mx-auto"
    >
      <div className="flex flex-col lg:flex-row min-h-[520px]">
        {/* Profile Selector */}
        <div className="w-full lg:w-64 p-5 lg:p-6 bg-gray-50/50">
          <h4 className="text-sm font-medium text-gray-800 mb-4">
            {t('demo.selectProfile', 'Select a Profile')}
          </h4>
          <div className="space-y-2">
            {SAMPLE_PROFILES.map((p, index) => (
              <button
                key={index}
                onClick={() => handleProfileChange(index)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  selectedProfile === index
                    ? 'bg-white shadow-sm'
                    : 'bg-transparent hover:bg-white/50'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    selectedProfile === index
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {p.avatar}
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-800">
                    {p.name}
                  </div>
                  <div className="text-xs text-gray-500">{p.style}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-5 p-3 bg-white rounded-xl">
            <div className="flex items-start gap-2 text-xs text-gray-500">
              <Icon name="info" size="sm" className="text-gray-400 mt-0.5" />
              <span>
                {t(
                  'demo.profileInfo',
                  'Profiles are created by analyzing your writing samples'
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="flex-1 p-5 lg:p-6 bg-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={`profile-${animationKey}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white text-lg font-semibold">
                  {profile.avatar}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {profile.name}
                  </h3>
                  <p className="text-sm text-primary">{profile.style}</p>
                </div>
              </div>

              {/* Writing Metrics */}
              <div>
                <h4 className="text-xs font-medium text-gray-500 mb-3 flex items-center gap-2">
                  <Icon name="bar-chart-2" size="sm" className="text-gray-400" />
                  {t('demo.writingMetrics', 'Writing Metrics')}
                </h4>
                <div className="grid gap-3">
                  <MetricBar
                    label={t('demo.formality', 'Formality')}
                    value={profile.metrics.formality}
                    delay={0}
                  />
                  <MetricBar
                    label={t('demo.creativity', 'Creativity')}
                    value={profile.metrics.creativity}
                    delay={100}
                  />
                  <MetricBar
                    label={t('demo.directness', 'Directness')}
                    value={profile.metrics.directness}
                    delay={200}
                  />
                  <MetricBar
                    label={t('demo.empathy', 'Empathy')}
                    value={profile.metrics.empathy}
                    delay={300}
                  />
                  <MetricBar
                    label={t('demo.technicality', 'Technicality')}
                    value={profile.metrics.technicality}
                    delay={400}
                  />
                </div>
              </div>

              {/* Traits & Characteristics */}
              <div className="grid md:grid-cols-2 gap-3">
                {/* Traits */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h5 className="text-xs font-medium text-gray-500 mb-3 flex items-center gap-1.5">
                    <Icon name="tag" size="xs" className="text-gray-400" />
                    {t('demo.writingTraits', 'Writing Traits')}
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {profile.traits.map((trait, i) => (
                      <motion.span
                        key={`${animationKey}-${trait}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + i * 0.08 }}
                        className="px-2.5 py-1 bg-blue-50 text-primary text-xs font-medium rounded-full"
                      >
                        {trait}
                      </motion.span>
                    ))}
                  </div>
                </div>

                {/* Vocabulary */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h5 className="text-xs font-medium text-gray-500 mb-3 flex items-center gap-1.5">
                    <Icon name="book-open" size="xs" className="text-gray-400" />
                    {t('demo.signatureWords', 'Signature Words')}
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {profile.vocabulary.map((word, i) => (
                      <motion.span
                        key={`${animationKey}-${word}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + i * 0.08 }}
                        className="px-2.5 py-1 bg-white text-gray-600 text-xs rounded-full"
                      >
                        "{word}"
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Icon name="align-left" size="md" className="text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-500">
                      {t('demo.sentenceLength', 'Sentence Length')}
                    </div>
                    <div className="text-sm font-medium text-gray-700">
                      {profile.sentenceLength}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Icon name="smile" size="md" className="text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-500">
                      {t('demo.overallTone', 'Overall Tone')}
                    </div>
                    <div className="text-sm font-medium text-gray-700">
                      {profile.tone}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </AppFrame>
  )
}

export default LiveVoiceProfileDemo
