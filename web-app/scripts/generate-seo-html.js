/**
 * SEO HTML Generator for Graphos AI Studio
 * Generates static HTML content for search engine crawlers
 * This creates a prerender-ready version with all SEO content
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// SEO Content Configuration
const SEO_CONFIG = {
  title: 'Graphos AI | Best AI Humanizer & AI Detection Bypass Tool',
  description: 'Transform AI-generated text into 100% human-like content. Bypass all AI detectors (GPTZero, Originality, Turnitin) in seconds with Graphos AI Studio.',
  keywords: 'AI humanizer, AI detection bypass, humanize AI text, bypass GPTZero, bypass Originality AI, bypass Turnitin, AI to human text converter, undetectable AI, AI content humanizer, ChatGPT humanizer, AI text rewriter, make AI undetectable',
  url: 'https://app.graphosai.com',
  image: 'https://graphosai.com/og-image.png'
}

// Structured Data Schemas
const SCHEMAS = {
  software: {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': 'https://app.graphosai.com/#software',
    name: 'Graphos AI Studio',
    alternateName: ['Graphos AI', 'Graphos AI Humanizer', 'AI Text Humanizer'],
    description: 'Best AI humanizer tool to transform AI-generated text into 100% human-like content. Bypass GPTZero, Originality AI, Turnitin and all AI detectors with 99% success rate.',
    applicationCategory: 'ProductivityApplication',
    applicationSubCategory: 'Writing Assistant',
    operatingSystem: 'Web Browser, Chrome Extension',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    softwareVersion: '2.0',
    featureList: [
      'AI Content Humanization with 99% bypass rate',
      'AI Detection with 98% accuracy',
      'Voice Profile Creation',
      'Multi-language Support (15+ languages)',
      'Chrome Extension Integration',
      'Bypass GPTZero, Originality AI, Turnitin, Copyleaks'
    ],
    author: {
      '@type': 'Organization',
      '@id': 'https://graphosai.com/#organization',
      name: 'Graphos AI Studio',
      url: 'https://graphosai.com'
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '2850',
      bestRating: '5',
      worstRating: '1',
      reviewCount: '1420'
    }
  },
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://graphosai.com/#organization',
    name: 'Graphos AI Studio',
    url: 'https://graphosai.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://graphosai.com/logo.png',
      width: 512,
      height: 512
    },
    description: 'AI-powered writing assistant with humanization, detection, and voice profile features',
    email: 'support@graphosai.com',
    sameAs: [
      'https://twitter.com/graphosai',
      'https://linkedin.com/company/graphosai'
    ]
  },
  faq: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Graphos AI Humanizer?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Graphos AI Humanizer is a tool that transforms AI-generated text (from ChatGPT, Claude, Gemini, etc.) into natural, human-like content that bypasses AI detection tools like GPTZero, Originality AI, and Turnitin with a 99% success rate.'
        }
      },
      {
        '@type': 'Question',
        name: 'Can Graphos AI bypass GPTZero and Originality AI?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, Graphos AI has a 99% success rate in bypassing major AI detectors including GPTZero, Originality AI, Turnitin, Copyleaks, and ZeroGPT while preserving the original meaning of your content.'
        }
      },
      {
        '@type': 'Question',
        name: 'Is Graphos AI free to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, Graphos AI offers a free tier with limited credits. You can humanize AI text, detect AI content, and create voice profiles without any payment. Premium plans are available for heavy users.'
        }
      },
      {
        '@type': 'Question',
        name: 'How does AI humanization work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our AI humanizer analyzes the patterns that AI detectors look for and rewrites your content to match natural human writing patterns while preserving the original meaning, tone, and context.'
        }
      },
      {
        '@type': 'Question',
        name: 'Which AI detectors can Graphos AI bypass?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Graphos AI can bypass all major AI detectors including GPTZero, Originality AI, Turnitin, Copyleaks, ZeroGPT, Content at Scale, Sapling, and Writer.com AI detector.'
        }
      }
    ]
  }
}

// Generate schema script tags
function generateSchemaScripts() {
  return Object.entries(SCHEMAS)
    .map(([key, schema]) => 
      `  <script type="application/ld+json" data-schema="${key}">\n${JSON.stringify(schema, null, 2)}\n  </script>`
    )
    .join('\n')
}

// Read and process index.html
function processIndexHtml() {
  const indexPath = path.join(__dirname, '..', 'index.html')
  let html = fs.readFileSync(indexPath, 'utf-8')
  
  // Check if schemas already exist
  if (html.includes('application/ld+json')) {
    console.log('Schemas already exist in index.html')
    return
  }
  
  // Insert schema scripts before </head>
  const schemaScripts = generateSchemaScripts()
  html = html.replace('</head>', `\n${schemaScripts}\n</head>`)
  
  // Write back
  fs.writeFileSync(indexPath, html)
  console.log('✅ SEO schemas injected into index.html')
}

// Generate static SEO page for crawlers
function generateStaticSeoPage() {
  const staticHtml = `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${SEO_CONFIG.title}</title>
  <meta name="description" content="${SEO_CONFIG.description}">
  <meta name="keywords" content="${SEO_CONFIG.keywords}">
  <link rel="canonical" href="${SEO_CONFIG.url}">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${SEO_CONFIG.title}">
  <meta property="og:description" content="${SEO_CONFIG.description}">
  <meta property="og:image" content="${SEO_CONFIG.image}">
  <meta property="og:url" content="${SEO_CONFIG.url}">
  <meta property="og:type" content="website">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${SEO_CONFIG.title}">
  <meta name="twitter:description" content="${SEO_CONFIG.description}">
  <meta name="twitter:image" content="${SEO_CONFIG.image}">
  
${generateSchemaScripts()}
</head>
<body>
  <main>
    <h1>Graphos AI Studio - Best AI Humanizer & AI Detection Bypass Tool</h1>
    
    <section>
      <h2>Transform AI Text to Human-Like Content</h2>
      <p>Graphos AI is the most advanced AI humanizer tool that converts AI-generated text from ChatGPT, Claude, Gemini, and other AI models into 100% human-like content that bypasses all AI detectors.</p>
    </section>
    
    <section>
      <h2>Key Features</h2>
      <ul>
        <li><strong>AI Humanizer:</strong> Convert any AI text to undetectable human content with 99% success rate</li>
        <li><strong>Bypass AI Detectors:</strong> Pass GPTZero, Originality AI, Turnitin, Copyleaks, ZeroGPT</li>
        <li><strong>AI Detection:</strong> Check if content is AI-generated with 98% accuracy</li>
        <li><strong>Voice Profile:</strong> Create content that matches your unique writing style</li>
        <li><strong>Multi-language:</strong> Support for 15+ languages including English, Vietnamese, Japanese, Korean, Chinese</li>
        <li><strong>Chrome Extension:</strong> Humanize text directly in any website</li>
      </ul>
    </section>
    
    <section>
      <h2>Why Choose Graphos AI?</h2>
      <ul>
        <li>✓ 99% bypass rate on all major AI detectors</li>
        <li>✓ Preserves original meaning and context</li>
        <li>✓ Natural, human-like output</li>
        <li>✓ Fast processing in seconds</li>
        <li>✓ Free tier available</li>
        <li>✓ No watermarks or traces</li>
      </ul>
    </section>
    
    <section>
      <h2>Supported AI Detectors</h2>
      <p>Graphos AI humanized content bypasses:</p>
      <ul>
        <li>GPTZero</li>
        <li>Originality AI</li>
        <li>Turnitin</li>
        <li>Copyleaks</li>
        <li>ZeroGPT</li>
        <li>Content at Scale</li>
        <li>Sapling AI Detector</li>
        <li>Writer.com AI Detector</li>
      </ul>
    </section>
    
    <section>
      <h2>How It Works</h2>
      <ol>
        <li>Paste your AI-generated text into Graphos AI</li>
        <li>Click the "Humanize" button</li>
        <li>Get 100% human-like content instantly</li>
        <li>Copy and use anywhere - essays, articles, emails, reports</li>
      </ol>
    </section>
    
    <section>
      <h2>Frequently Asked Questions</h2>
      
      <h3>What is Graphos AI Humanizer?</h3>
      <p>Graphos AI Humanizer is a tool that transforms AI-generated text (from ChatGPT, Claude, Gemini, etc.) into natural, human-like content that bypasses AI detection tools like GPTZero, Originality AI, and Turnitin with a 99% success rate.</p>
      
      <h3>Can Graphos AI bypass GPTZero and Originality AI?</h3>
      <p>Yes, Graphos AI has a 99% success rate in bypassing major AI detectors including GPTZero, Originality AI, Turnitin, Copyleaks, and ZeroGPT while preserving the original meaning of your content.</p>
      
      <h3>Is Graphos AI free to use?</h3>
      <p>Yes, Graphos AI offers a free tier with limited credits. You can humanize AI text, detect AI content, and create voice profiles without any payment. Premium plans are available for heavy users.</p>
      
      <h3>How does AI humanization work?</h3>
      <p>Our AI humanizer analyzes the patterns that AI detectors look for and rewrites your content to match natural human writing patterns while preserving the original meaning, tone, and context.</p>
    </section>
    
    <footer>
      <p>© 2025 Graphos AI Studio. All rights reserved.</p>
      <p>Contact: <a href="mailto:support@graphosai.com">support@graphosai.com</a></p>
      <p><a href="https://graphosai.com">Visit Homepage</a></p>
    </footer>
  </main>
</body>
</html>`

  const outputPath = path.join(__dirname, '..', 'public', 'seo-static.html')
  fs.writeFileSync(outputPath, staticHtml)
  console.log('✅ Static SEO page generated: public/seo-static.html')
}

// Main execution
console.log('🚀 Generating SEO content...')
processIndexHtml()
generateStaticSeoPage()
console.log('✅ SEO generation complete!')
