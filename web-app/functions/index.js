/**
 * Firebase Cloud Functions for SEO Prerendering
 * 
 * This function detects search engine bots and serves pre-rendered HTML
 * for better SEO indexing of the SPA.
 * 
 * Setup:
 * 1. cd functions && npm install
 * 2. Set PRERENDER_TOKEN in Firebase config: 
 *    firebase functions:config:set prerender.token="YOUR_TOKEN"
 * 3. Deploy: firebase deploy --only functions
 */

const functions = require('firebase-functions')
const fetch = require('node-fetch')

// Bot user agents to detect
const BOT_AGENTS = [
  'googlebot',
  'bingbot',
  'yandex',
  'baiduspider',
  'facebookexternalhit',
  'twitterbot',
  'rogerbot',
  'linkedinbot',
  'embedly',
  'quora link preview',
  'showyoubot',
  'outbrain',
  'pinterest',
  'slackbot',
  'vkshare',
  'w3c_validator',
  'redditbot',
  'applebot',
  'whatsapp',
  'flipboard',
  'tumblr',
  'bitlybot',
  'discordbot',
  'telegrambot',
  'chrome-lighthouse'
]

// Static file extensions to skip
const STATIC_EXTENSIONS = /\.(js|css|xml|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|mp4|webm|pdf)$/i

// SEO static content for bots (fallback if prerender service unavailable)
const generateStaticSEO = (url) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Graphos AI | Best AI Humanizer & AI Detection Bypass Tool</title>
  <meta name="description" content="Transform AI-generated text into 100% human-like content. Bypass all AI detectors (GPTZero, Originality, Turnitin) in seconds with Graphos AI Studio.">
  <meta name="keywords" content="AI humanizer, AI detection bypass, humanize AI text, bypass GPTZero, bypass Originality AI">
  <link rel="canonical" href="${url}">
  
  <meta property="og:title" content="Graphos AI | Best AI Humanizer & AI Detection Bypass Tool">
  <meta property="og:description" content="Transform AI-generated text into 100% human-like content. Bypass all AI detectors in seconds.">
  <meta property="og:url" content="${url}">
  <meta property="og:type" content="website">
  
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Graphos AI Studio",
    "description": "Best AI humanizer tool to transform AI-generated text into 100% human-like content.",
    "applicationCategory": "ProductivityApplication",
    "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"},
    "aggregateRating": {"@type": "AggregateRating", "ratingValue": "4.9", "ratingCount": "2850"}
  }
  </script>
</head>
<body>
  <main>
    <h1>Graphos AI Studio - Best AI Humanizer & AI Detection Bypass Tool</h1>
    <p>Transform AI-generated text into 100% human-like content that bypasses all AI detectors.</p>
    
    <section>
      <h2>Key Features</h2>
      <ul>
        <li>AI Humanizer - Convert ChatGPT, Claude, Gemini text to undetectable human content with 99% success rate</li>
        <li>AI Detection Bypass - Pass GPTZero, Originality AI, Turnitin, Copyleaks, ZeroGPT</li>
        <li>AI Detection - Check if content is AI-generated with 98% accuracy</li>
        <li>Voice Profile - Create content that matches your unique writing style</li>
        <li>Multi-language Support - Works with 15+ languages</li>
      </ul>
    </section>
    
    <section>
      <h2>Supported AI Detectors</h2>
      <p>Graphos AI bypasses: GPTZero, Originality AI, Turnitin, Copyleaks, ZeroGPT, Content at Scale, Sapling, Writer.com</p>
    </section>
    
    <section>
      <h2>FAQ</h2>
      <h3>What is Graphos AI Humanizer?</h3>
      <p>Graphos AI Humanizer transforms AI-generated text into natural, human-like content that bypasses AI detection tools with 99% success rate.</p>
      
      <h3>Is Graphos AI free?</h3>
      <p>Yes, Graphos AI offers a free tier. Premium plans available for heavy users.</p>
    </section>
  </main>
  
  <script>
    // Redirect to SPA after bot has indexed
    if (!/bot|crawl|spider|slurp/i.test(navigator.userAgent)) {
      window.location.reload();
    }
  </script>
</body>
</html>`

/**
 * Check if user agent is a bot
 */
function isBot(userAgent) {
  if (!userAgent) return false
  const ua = userAgent.toLowerCase()
  return BOT_AGENTS.some(bot => ua.includes(bot))
}

/**
 * Main prerender function
 */
exports.prerender = functions.https.onRequest(async (req, res) => {
  const userAgent = req.headers['user-agent'] || ''
  const path = req.path || '/'
  
  // Skip static files
  if (STATIC_EXTENSIONS.test(path)) {
    res.redirect(path)
    return
  }
  
  // Check if bot
  if (!isBot(userAgent)) {
    // Not a bot, serve normal SPA
    res.redirect(path)
    return
  }
  
  // Bot detected - try prerender service
  const prerenderToken = functions.config().prerender?.token
  const fullUrl = `https://app.graphosai.com${path}`
  
  if (prerenderToken) {
    try {
      const prerenderUrl = `https://service.prerender.io/${fullUrl}`
      const response = await fetch(prerenderUrl, {
        headers: {
          'X-Prerender-Token': prerenderToken,
          'User-Agent': userAgent
        },
        timeout: 10000
      })
      
      if (response.ok) {
        const html = await response.text()
        res.set('Content-Type', 'text/html; charset=utf-8')
        res.set('Cache-Control', 'public, max-age=86400')
        res.set('X-Prerendered', 'prerender.io')
        res.send(html)
        return
      }
    } catch (error) {
      console.error('Prerender service error:', error.message)
    }
  }
  
  // Fallback: serve static SEO content
  res.set('Content-Type', 'text/html; charset=utf-8')
  res.set('Cache-Control', 'public, max-age=3600')
  res.set('X-Prerendered', 'static-fallback')
  res.send(generateStaticSEO(fullUrl))
})

/**
 * Health check endpoint
 */
exports.health = functions.https.onRequest((req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'graphos-ai-prerender',
    timestamp: new Date().toISOString()
  })
})
