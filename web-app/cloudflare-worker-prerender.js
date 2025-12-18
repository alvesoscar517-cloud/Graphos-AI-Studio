/**
 * Cloudflare Worker for Prerendering
 * Deploy this to Cloudflare Workers for free prerendering
 * 
 * Setup:
 * 1. Go to https://workers.cloudflare.com
 * 2. Create a new worker
 * 3. Paste this code
 * 4. Set environment variable PRERENDER_TOKEN (if using prerender.io)
 * 5. Add route: app.graphosai.com/*
 */

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
  'pinterest/0.',
  'developers.google.com/+/web/snippet',
  'slackbot',
  'vkshare',
  'w3c_validator',
  'redditbot',
  'applebot',
  'whatsapp',
  'flipboard',
  'tumblr',
  'bitlybot',
  'skypeuripreview',
  'nuzzel',
  'discordbot',
  'google page speed',
  'qwantify',
  'pinterestbot',
  'bitrix link preview',
  'xing-contenttabreceiver',
  'chrome-lighthouse',
  'telegrambot'
]

const PRERENDER_SERVICE = 'https://service.prerender.io/'

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const userAgent = request.headers.get('user-agent') || ''
  
  // Check if request is from a bot
  const isBot = BOT_AGENTS.some(bot => 
    userAgent.toLowerCase().includes(bot.toLowerCase())
  )
  
  // Check for _escaped_fragment_ (old AJAX crawling)
  const hasEscapedFragment = url.searchParams.has('_escaped_fragment_')
  
  // Skip prerendering for static assets
  const isStaticAsset = /\.(js|css|xml|less|png|jpg|jpeg|gif|pdf|doc|txt|ico|rss|zip|mp3|rar|exe|wmv|avi|ppt|mpg|mpeg|tif|wav|mov|psd|ai|xls|mp4|m4a|swf|dat|dmg|iso|flv|m4v|torrent|ttf|woff|woff2|svg|eot)$/i.test(url.pathname)
  
  if ((isBot || hasEscapedFragment) && !isStaticAsset) {
    // Use Prerender.io service
    const prerenderUrl = PRERENDER_SERVICE + url.href
    
    try {
      const prerenderResponse = await fetch(prerenderUrl, {
        headers: {
          'X-Prerender-Token': PRERENDER_TOKEN || '',
          'User-Agent': userAgent
        }
      })
      
      if (prerenderResponse.ok) {
        const html = await prerenderResponse.text()
        return new Response(html, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=86400', // Cache for 1 day
            'X-Prerendered': 'true'
          }
        })
      }
    } catch (error) {
      console.error('Prerender error:', error)
    }
  }
  
  // For non-bot requests, pass through to origin
  return fetch(request)
}

/**
 * Alternative: Simple SSR-like response for bots without external service
 * Uncomment and modify if you don't want to use prerender.io
 */
/*
async function generateStaticResponse(url) {
  const seoContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Graphos AI | Best AI Humanizer & AI Detection Bypass Tool</title>
  <meta name="description" content="Transform AI-generated text into 100% human-like content. Bypass all AI detectors (GPTZero, Originality, Turnitin) in seconds.">
  <link rel="canonical" href="${url.href}">
</head>
<body>
  <h1>Graphos AI Studio - Best AI Humanizer</h1>
  <p>Transform AI-generated text into 100% human-like content that bypasses all AI detectors.</p>
  <h2>Features</h2>
  <ul>
    <li>AI Humanizer - 99% bypass rate</li>
    <li>AI Detection - 98% accuracy</li>
    <li>Voice Profile - Match your writing style</li>
    <li>15+ Languages supported</li>
  </ul>
  <script>window.location.href = "${url.href}";</script>
</body>
</html>`
  
  return new Response(seoContent, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Prerendered': 'static'
    }
  })
}
*/
