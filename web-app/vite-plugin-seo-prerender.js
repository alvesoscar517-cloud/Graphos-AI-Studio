/**
 * Vite Plugin for SEO Prerendering
 * Injects static SEO content into the HTML for better crawler indexing
 */

const SEO_CONTENT = `
    <!-- SEO Static Content for Crawlers -->
    <div id="seo-content" style="position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;" aria-hidden="true">
      <h1>Graphos AI Studio - Best AI Humanizer & AI Detection Bypass Tool</h1>
      <p>Transform AI-generated text into 100% human-like content. Bypass all AI detectors (GPTZero, Originality AI, Turnitin) in seconds with Graphos AI Studio.</p>
      
      <h2>AI Humanizer Features</h2>
      <ul>
        <li>Convert ChatGPT, Claude, Gemini text to undetectable human content</li>
        <li>99% bypass rate on GPTZero, Originality AI, Turnitin, Copyleaks</li>
        <li>Preserve original meaning and context</li>
        <li>Natural, human-like output in seconds</li>
        <li>Multi-language support (15+ languages)</li>
      </ul>
      
      <h2>AI Detection</h2>
      <p>Check if content is AI-generated with 98% accuracy. Detect ChatGPT, Claude, Gemini, and other AI-written text instantly.</p>
      
      <h2>Voice Profile</h2>
      <p>Create content that matches your unique writing style. Train AI to write like you.</p>
      
      <h2>Supported AI Detectors</h2>
      <p>Bypass GPTZero, Originality AI, Turnitin, Copyleaks, ZeroGPT, Content at Scale, Sapling, Writer.com</p>
      
      <h2>How to Humanize AI Text</h2>
      <ol>
        <li>Paste your AI-generated text</li>
        <li>Click Humanize button</li>
        <li>Get 100% human-like content</li>
        <li>Copy and use anywhere</li>
      </ol>
      
      <h2>FAQ</h2>
      <h3>What is Graphos AI Humanizer?</h3>
      <p>Graphos AI Humanizer transforms AI-generated text into natural, human-like content that bypasses AI detection tools with 99% success rate.</p>
      
      <h3>Can Graphos AI bypass GPTZero?</h3>
      <p>Yes, Graphos AI bypasses GPTZero, Originality AI, Turnitin, and all major AI detectors.</p>
      
      <h3>Is Graphos AI free?</h3>
      <p>Yes, Graphos AI offers a free tier. Premium plans available for heavy users.</p>
    </div>
`

export default function seoPrerender() {
  return {
    name: 'vite-plugin-seo-prerender',
    transformIndexHtml(html) {
      // Insert SEO content right after <div id="root"></div>
      return html.replace(
        '<div id="root"></div>',
        `<div id="root"></div>${SEO_CONTENT}`
      )
    }
  }
}
