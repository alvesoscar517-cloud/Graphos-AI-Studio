# Graphos AI Studio - Landing Page Documentation

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [Pages & Routes](#pages--routes)
- [Components Architecture](#components-architecture)
- [SEO Optimization](#seo-optimization)
- [Internationalization](#internationalization)
- [Performance Optimizations](#performance-optimizations)
- [Build & Deployment](#build--deployment)
- [Development Guide](#development-guide)
- [Scripts & Commands](#scripts--commands)

---

## Overview

The **Graphos AI Studio Landing Page** is a modern, SEO-optimized marketing website built with React 18 and Vite. It serves as the primary entry point for users to discover and understand the platform's AI-powered content humanization and detection capabilities.

### Purpose

- **Marketing Hub**: Showcase product features and benefits
- **User Acquisition**: Convert visitors into users through compelling CTAs
- **SEO Performance**: Rank highly in search engines for AI-related keywords
- **Multi-language Support**: Reach global audiences with 15+ languages
- **Brand Identity**: Establish trust and credibility through professional design

### Live URLs

- **Production**: [https://graphosai.com](https://graphosai.com)
- **Development**: http://localhost:5175


---

## Tech Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | UI Framework |
| **Vite** | 5.2.0 | Build Tool & Dev Server |
| **React Router** | 6.22.0 | Client-side Routing |
| **TailwindCSS** | 4.1.17 | Utility-first CSS Framework |
| **i18next** | 25.6.3 | Internationalization |
| **Framer Motion** | 12.23.24 | Animation Library |

### Animation & Effects

| Library | Purpose |
|---------|---------|
| **Framer Motion** | Page transitions, scroll animations, micro-interactions |
| **@react-spring/web** | Physics-based animations |
| **Lottie React** | JSON-based animations (loading spinners) |
| **React Fast Marquee** | Infinite scrolling testimonials |
| **React Parallax Tilt** | 3D tilt effects on cards |
| **@tsparticles** | Particle effects and backgrounds |
| **Three.js** | 3D graphics and WebGL effects |
| **Vanta** | Animated backgrounds (waves, fog, etc.) |

### Development Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting and quality checks |
| **Prettier** | Code formatting |
| **Vitest** | Unit testing framework |
| **@testing-library/react** | Component testing |
| **PostCSS** | CSS processing |
| **Autoprefixer** | CSS vendor prefixing |

### Build & Optimization

| Tool | Purpose |
|------|---------|
| **Vite Plugin React** | Fast refresh and JSX support |
| **Vite Plugin Prerender** | Static page generation for SEO |
| **Vite Plugin Static Copy** | Copy static assets |
| **Terser** | JavaScript minification |
| **Sharp** | Image optimization |


---

## Project Structure

```
landing-page/
├── public/                       # Static assets
│   ├── icons/                    # Favicon and app icons
│   ├── locales/                  # Translation JSON files (15+ languages)
│   ├── og-image.png              # Open Graph image for social sharing
│   ├── logo.svg                  # Brand logo
│   ├── manifest.json             # PWA manifest
│   ├── robots.txt                # Search engine crawler rules
│   └── sitemap.xml               # Auto-generated sitemap
│
├── scripts/                      # Build and utility scripts
│   ├── generate-sitemap.js       # Generate sitemap.xml
│   ├── prerender-og.js           # Pre-render OG images
│   ├── check-translations.js     # Validate translation completeness
│   └── fix-translations.js       # Auto-fix translation issues
│
├── src/
│   ├── animation/                # Lottie animation files
│   │   └── ThreeDotsLoading.json # Loading spinner animation
│   │
│   ├── components/
│   │   ├── common/               # Reusable UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Icon.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Breadcrumb.jsx
│   │   │   └── LanguageSwitcher.jsx
│   │   │
│   │   ├── demos/                # Interactive product demos
│   │   │   ├── AIDetectionDemo.jsx
│   │   │   ├── HumanizationDemo.jsx
│   │   │   └── VoiceProfileDemo.jsx
│   │   │
│   │   ├── effects/              # Visual effects components
│   │   │   ├── ParticleBackground.jsx
│   │   │   ├── GradientBlob.jsx
│   │   │   └── AnimatedGrid.jsx
│   │   │
│   │   ├── layout/               # Layout components
│   │   │   ├── Layout.jsx        # Main layout wrapper
│   │   │   ├── Header.jsx        # Navigation header
│   │   │   ├── Footer.jsx        # Site footer
│   │   │   └── MobileMenu.jsx    # Mobile navigation
│   │   │
│   │   ├── sections/             # Homepage sections
│   │   │   ├── HeroSection.jsx
│   │   │   ├── FeaturesSection.jsx
│   │   │   ├── ProductShowcaseSection.jsx
│   │   │   ├── HowItWorksSection.jsx
│   │   │   ├── SocialProofSection.jsx
│   │   │   ├── TestimonialsSection.jsx
│   │   │   ├── PricingSection.jsx
│   │   │   ├── FAQSection.jsx
│   │   │   ├── ComparisonSection.jsx
│   │   │   ├── ChromeExtensionSection.jsx
│   │   │   ├── UseCasesSection.jsx
│   │   │   └── CTASection.jsx
│   │   │
│   │   └── seo/                  # SEO components
│   │       ├── SEOHead.jsx       # Meta tags manager
│   │       ├── StructuredData.jsx # JSON-LD schema
│   │       └── PageSEO.jsx       # Page-specific SEO
│   │
│   ├── config/
│   │   └── languages.js          # Supported languages configuration
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useIntersectionObserver.js
│   │   ├── useOptimizedAnimation.js
│   │   └── usePreloadRoutes.js
│   │
│   ├── i18n/                     # Internationalization
│   │   ├── index.js              # i18next configuration
│   │   └── locales/              # Translation files
│   │
│   ├── pages/                    # Page components
│   │   ├── Home.jsx              # Homepage
│   │   ├── Features.jsx          # Features hub page
│   │   ├── PrivacyPolicy.jsx     # Privacy policy
│   │   ├── Terms.jsx             # Terms of service
│   │   └── features/             # Individual feature pages
│   │       ├── AIDetection.jsx
│   │       ├── Humanization.jsx
│   │       ├── VoiceProfile.jsx
│   │       ├── AIWorkspace.jsx
│   │       ├── Rewrite.jsx
│   │       ├── CompatibilityScore.jsx
│   │       ├── Deviations.jsx
│   │       └── Statistics.jsx
│   │
│   ├── styles/
│   │   └── main.css              # Global styles and Tailwind imports
│   │
│   ├── utils/                    # Utility functions
│   │   ├── localizedAvatars.js   # Avatar localization
│   │   ├── performance.js        # Performance utilities
│   │   └── sitemap.js            # Sitemap generation helpers
│   │
│   ├── App.jsx                   # Main app component with routing
│   └── main.jsx                  # Application entry point
│
├── .firebaserc                   # Firebase project configuration
├── .gitignore                    # Git ignore rules
├── .prettierrc                   # Prettier configuration
├── eslint.config.js              # ESLint configuration
├── firebase.json                 # Firebase hosting configuration
├── i18next-parser.config.cjs     # i18next parser configuration
├── index.html                    # HTML entry point with SEO meta tags
├── jsconfig.json                 # JavaScript configuration
├── package.json                  # Dependencies and scripts
├── postcss.config.js             # PostCSS configuration
├── vite.config.js                # Vite build configuration
└── vitest.config.js              # Vitest test configuration
```


---

## Key Features

### 1. SEO Optimization

The landing page is heavily optimized for search engines with comprehensive SEO strategies:

#### Meta Tags & Open Graph
- **Dynamic meta tags** for each page and language
- **Open Graph tags** for social media sharing (Facebook, Twitter, LinkedIn)
- **Twitter Card** support with large image previews
- **Canonical URLs** to prevent duplicate content issues
- **Hreflang tags** for multi-language SEO (15+ languages)

#### Structured Data (Schema.org)
- **Organization schema** - Company information
- **WebSite schema** - Site-wide search functionality
- **SoftwareApplication schema** - Product details with ratings
- **WebPage schema** - Page-specific metadata
- **HowTo schema** - Step-by-step guides
- **BreadcrumbList schema** - Navigation hierarchy
- **FAQPage schema** - Frequently asked questions

#### Technical SEO
- **Semantic HTML5** - Proper use of `<article>`, `<section>`, `<aside>`, `<nav>`
- **Sitemap.xml** - Auto-generated with all routes and languages
- **Robots.txt** - Search engine crawler instructions
- **Performance optimization** - Fast loading times (LCP, FID, CLS)
- **Mobile-first design** - Responsive across all devices
- **Accessibility** - ARIA labels, keyboard navigation, screen reader support

### 2. Multi-language Support (i18n)

#### Supported Languages (15+)

| Language | Code | Status | RTL Support |
|----------|------|--------|-------------|
| English | en | ✅ Complete | No |
| Vietnamese | vi | ✅ Complete | No |
| Spanish | es | ✅ Complete | No |
| French | fr | ✅ Complete | No |
| German | de | ✅ Complete | No |
| Italian | it | ✅ Complete | No |
| Portuguese | pt | ✅ Complete | No |
| Russian | ru | ✅ Complete | No |
| Japanese | ja | ✅ Complete | No |
| Korean | ko | ✅ Complete | No |
| Chinese (Simplified) | zh-CN | ✅ Complete | No |
| Chinese (Traditional) | zh-TW | ✅ Complete | No |
| Arabic | ar | ✅ Complete | Yes |
| Hindi | hi | ✅ Complete | No |
| Thai | th | ✅ Complete | No |
| Indonesian | id | ✅ Complete | No |

#### i18n Features
- **Auto-detection** - Detects user's browser language
- **URL-based routing** - `/en/`, `/vi/`, `/ja/`, etc.
- **Language switcher** - Dropdown with flag icons
- **RTL support** - Right-to-left layout for Arabic
- **Localized content** - All text, images, and CTAs translated
- **SEO-friendly** - Hreflang tags for each language variant

### 3. Performance Optimizations

#### Code Splitting & Lazy Loading
- **Route-based code splitting** - Each page loads independently
- **Component lazy loading** - Heavy sections load on-demand
- **Image lazy loading** - Images load as they enter viewport
- **Prefetching** - Common routes prefetched in idle time

#### Caching Strategies
- **Service Worker** - Offline support and asset caching
- **Browser caching** - Long-term caching for static assets
- **CDN delivery** - Firebase Hosting with global CDN

#### Bundle Optimization
- **Tree shaking** - Remove unused code
- **Minification** - Terser for JavaScript, cssnano for CSS
- **Compression** - Gzip and Brotli compression
- **Vendor chunking** - Separate vendor bundle for better caching

#### Performance Metrics
- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices, SEO)
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Time to Interactive (TTI)**: < 3.5s

### 4. Responsive Design

#### Breakpoints
```css
sm: 640px   /* Small devices (phones) */
md: 768px   /* Medium devices (tablets) */
lg: 1024px  /* Large devices (laptops) */
xl: 1280px  /* Extra large devices (desktops) */
2xl: 1536px /* 2X large devices (large desktops) */
```

#### Mobile-First Approach
- All components designed for mobile first
- Progressive enhancement for larger screens
- Touch-friendly interactions
- Optimized images for different screen sizes

### 5. Animation & Interactions

#### Animation Libraries Used
- **Framer Motion** - Page transitions, scroll animations, hover effects
- **Lottie** - Loading spinners and micro-animations
- **React Spring** - Physics-based animations
- **Particles** - Background particle effects
- **Three.js** - 3D graphics and WebGL effects

#### Animation Patterns
- **Fade in on scroll** - Elements animate as they enter viewport
- **Stagger animations** - Sequential animation of list items
- **Hover effects** - Interactive card tilts and transforms
- **Page transitions** - Smooth transitions between routes
- **Loading states** - Skeleton screens and spinners


---

## Pages & Routes

### Route Structure

The landing page uses React Router with support for language-prefixed URLs:

```
/                           → Home (default language)
/:lang                      → Home (specific language)
/features                   → Features hub
/:lang/features             → Features hub (localized)
/features/:feature-name     → Individual feature page
/:lang/features/:feature-name → Individual feature page (localized)
/privacy                    → Privacy policy
/:lang/privacy              → Privacy policy (localized)
/terms                      → Terms of service
/:lang/terms                → Terms of service (localized)
```

### Page Descriptions

#### 1. Home Page (`/`)
**Purpose**: Main landing page showcasing the product

**Sections**:
- **Hero Section** - Main headline, CTA buttons, animated background
- **Social Proof** - User statistics, trust badges, company logos
- **Product Showcase** - Interactive demos of key features
- **How It Works** - 4-step process explanation
- **Features Grid** - Quick overview of all features
- **Chrome Extension** - Browser extension showcase
- **Use Cases** - Target audience segments (students, writers, marketers, etc.)
- **Comparison** - Competitive analysis table
- **Testimonials** - User reviews and ratings
- **Pricing** - Credit packages and subscription plans
- **FAQ** - Common questions with Schema markup
- **Final CTA** - Sign-up encouragement

**SEO Focus**:
- Primary keywords: "AI detection", "humanize AI text", "AI writing assistant"
- Structured data: Organization, WebSite, SoftwareApplication, HowTo, FAQ
- Meta description optimized for click-through rate

#### 2. Features Hub (`/features`)
**Purpose**: Overview of all 8 features with links to detailed pages

**Features Showcased**:
1. **AI Detection** - Detect AI-generated content (98% accuracy)
2. **Humanization** - Transform AI text to human-like writing
3. **Voice Profile** - Create personalized writing style
4. **AI Workspace** - Chat interface with AI in your voice
5. **Rewrite** - Rephrase and improve text
6. **Compatibility Score** - Check style consistency
7. **Deviations** - Find writing inconsistencies
8. **Statistics** - Analyze writing metrics

**Design**:
- Grid layout with feature cards
- Hover effects and animations
- Credit cost indicators
- Direct links to detailed pages

#### 3. Individual Feature Pages (`/features/*`)

Each feature has a dedicated page with:
- **Hero section** - Feature-specific headline and description
- **Benefits** - Key advantages and use cases
- **How it works** - Step-by-step explanation
- **Interactive demo** - Try the feature (limited functionality)
- **Screenshots/Videos** - Visual demonstrations
- **Pricing** - Credit costs and packages
- **CTA** - Sign up or try for free

**Feature Pages**:
- `/features/ai-detection` - AI content detection
- `/features/humanization` - Content humanization
- `/features/voice-profile` - Voice profile creation
- `/features/ai-workspace` - AI chat workspace
- `/features/rewrite` - Text rewriting
- `/features/compatibility-score` - Style compatibility
- `/features/deviations` - Writing deviations
- `/features/statistics` - Writing statistics

#### 4. Privacy Policy (`/privacy`)
**Purpose**: Legal document explaining data handling

**Content**:
- Data collection practices
- Cookie usage
- Third-party services
- User rights (GDPR, CCPA)
- Contact information

**SEO**: Noindex (not indexed by search engines)

#### 5. Terms of Service (`/terms`)
**Purpose**: Legal agreement for using the service

**Content**:
- Service description
- User responsibilities
- Payment terms
- Intellectual property
- Limitation of liability
- Dispute resolution

**SEO**: Noindex (not indexed by search engines)


---

## Components Architecture

### Layout Components

#### Header (`components/layout/Header.jsx`)
**Features**:
- Sticky navigation bar
- Logo with link to home
- Navigation menu (Features, Pricing, About)
- Language switcher dropdown
- CTA buttons (Sign In, Get Started)
- Mobile hamburger menu
- Scroll-based transparency effect

**Responsive Behavior**:
- Desktop: Full horizontal menu
- Mobile: Hamburger menu with slide-out drawer

#### Footer (`components/layout/Footer.jsx`)
**Sections**:
- **Company info** - Logo, tagline, social links
- **Product links** - Features, Pricing, Chrome Extension
- **Resources** - Blog, Documentation, Support
- **Legal** - Privacy Policy, Terms of Service
- **Newsletter** - Email subscription form
- **Copyright** - Year and company name

**Social Links**:
- Twitter/X
- LinkedIn
- YouTube
- GitHub

#### Layout (`components/layout/Layout.jsx`)
**Purpose**: Wrapper component for all pages

**Features**:
- Header at top
- Main content area
- Footer at bottom
- Scroll-to-top button
- Loading states
- Error boundaries

### Section Components

#### HeroSection (`components/sections/HeroSection.jsx`)
**Purpose**: Above-the-fold content to capture attention

**Elements**:
- **Headline** - Main value proposition
- **Subheadline** - Supporting description
- **CTA buttons** - Primary (Get Started) and Secondary (Watch Demo)
- **Trust badges** - "Free forever", "No credit card", "2-min setup"
- **Animated background** - Particles, gradients, or 3D effects
- **Hero image/video** - Product screenshot or demo video

**Animation**:
- Fade in on load
- Stagger animation for text elements
- Parallax scrolling effect

#### FeaturesSection (`components/sections/FeaturesSection.jsx`)
**Purpose**: Quick overview of main features

**Layout**: 3-column grid (responsive to 1 column on mobile)

**Feature Cards**:
- Icon with gradient background
- Feature name
- Short description
- "Learn more" link

**Features Highlighted**:
- AI Detection
- Humanization
- Voice Profile
- AI Workspace
- Rewrite
- Compatibility Score

#### ProductShowcaseSection (`components/sections/ProductShowcaseSection.jsx`)
**Purpose**: Interactive demos of key features

**Demos**:
1. **AI Detection Demo** - Paste text, see AI probability
2. **Humanization Demo** - Transform AI text to human-like
3. **Voice Profile Demo** - Upload samples, create profile

**Design**:
- Tabbed interface or carousel
- Live input/output examples
- Visual feedback (progress bars, animations)
- "Try it free" CTA

#### HowItWorksSection (`components/sections/HowItWorksSection.jsx`)
**Purpose**: Explain the user journey in 4 steps

**Steps**:
1. **Create Voice Profile** - Upload writing samples
2. **Detect AI Content** - Check if text is AI-generated
3. **Humanize Content** - Transform AI text
4. **Chat in Your Voice** - Generate content in your style

**Design**:
- Numbered steps with icons
- Visual flow diagram
- Screenshots or illustrations
- HowTo structured data for SEO

#### SocialProofSection (`components/sections/SocialProofSection.jsx`)
**Purpose**: Build trust with statistics and logos

**Elements**:
- **User count** - "10,000+ users"
- **Accuracy rate** - "98% AI detection accuracy"
- **Languages** - "15+ languages supported"
- **Company logos** - Universities, companies using the product
- **Trust badges** - "Featured on Product Hunt", "Chrome Web Store"

#### TestimonialsSection (`components/sections/TestimonialsSection.jsx`)
**Purpose**: User reviews and success stories

**Layout**: Carousel or grid of testimonial cards

**Testimonial Card**:
- User photo (avatar)
- User name and role
- Company/University
- Star rating (5 stars)
- Review text
- Date

**Features**:
- Auto-scroll carousel
- Localized avatars (different for each language)
- Verified badge for real users

#### PricingSection (`components/sections/PricingSection.jsx`)
**Purpose**: Display credit packages and pricing

**Pricing Tiers**:
1. **Free Plan** - 50 credits/month
2. **Starter** - 500 credits ($9.99)
3. **Pro** - 2000 credits ($29.99)
4. **Business** - 10000 credits ($99.99)

**Features**:
- Credit cost per feature
- "Most popular" badge
- Feature comparison table
- "Buy now" CTA buttons
- Money-back guarantee badge

#### FAQSection (`components/sections/FAQSection.jsx`)
**Purpose**: Answer common questions

**Questions**:
- What is AI detection?
- How accurate is the detection?
- How does humanization work?
- What is a voice profile?
- How much does it cost?
- Is there a free plan?
- What languages are supported?
- How do I get started?

**Design**:
- Accordion/collapsible items
- Search functionality
- FAQPage structured data for rich results
- "Still have questions?" CTA

#### ComparisonSection (`components/sections/ComparisonSection.jsx`)
**Purpose**: Compare with competitors

**Comparison Table**:
- **Graphos AI** vs **GPTZero** vs **Originality AI** vs **Turnitin**
- Features compared: Detection accuracy, Humanization, Voice profiles, Pricing, Languages

**Design**:
- Checkmarks and X marks
- Highlight Graphos AI advantages
- "Try Graphos AI" CTA

#### ChromeExtensionSection (`components/sections/ChromeExtensionSection.jsx`)
**Purpose**: Promote Chrome extension

**Elements**:
- Extension screenshot
- Key features (in-page detection, quick humanization)
- Chrome Web Store badge
- Install count
- Rating (4.9/5 stars)
- "Install now" CTA

#### UseCasesSection (`components/sections/UseCasesSection.jsx`)
**Purpose**: Show target audiences

**Use Cases**:
1. **Students** - Check essays, avoid AI detection
2. **Content Writers** - Humanize AI drafts
3. **Marketers** - Create authentic copy
4. **Researchers** - Verify content authenticity
5. **Bloggers** - Improve writing quality
6. **Businesses** - Maintain brand voice

**Design**:
- Icon + title + description
- Persona illustrations
- "Get started" CTA for each

#### CTASection (`components/sections/CTASection.jsx`)
**Purpose**: Final conversion push

**Elements**:
- Bold headline ("Ready to get started?")
- Supporting text
- Primary CTA ("Get Started Free")
- Secondary CTA ("Install Extension")
- Trust indicators ("No credit card required")

**Design**:
- Gradient background
- Large buttons
- High contrast
- Centered layout

### Common Components

#### Button (`components/common/Button.jsx`)
**Variants**:
- Primary (solid background)
- Secondary (outline)
- Ghost (transparent)
- Link (text only)

**Sizes**: xs, sm, md, lg, xl

**Props**: `variant`, `size`, `disabled`, `loading`, `icon`, `onClick`

#### Icon (`components/common/Icon.jsx`)
**Purpose**: Consistent icon system

**Icon Library**: Lucide React (300+ icons)

**Usage**:
```jsx
<Icon name="check" size="md" className="text-green-500" />
```

#### LoadingSpinner (`components/common/LoadingSpinner.jsx`)
**Types**:
- Lottie animation (ThreeDotsLoading.json)
- CSS spinner
- Skeleton screens

**Sizes**: sm, md, lg

#### Breadcrumb (`components/common/Breadcrumb.jsx`)
**Purpose**: Navigation hierarchy

**Example**: Home > Features > AI Detection

**Features**:
- Clickable links
- Current page highlighted
- Schema.org BreadcrumbList markup

#### LanguageSwitcher (`components/common/LanguageSwitcher.jsx`)
**Purpose**: Change website language

**Features**:
- Dropdown menu
- Flag icons for each language
- Current language highlighted
- Persists selection in localStorage
- Updates URL with language prefix

### SEO Components

#### SEOHead (`components/seo/SEOHead.jsx`)
**Purpose**: Manage meta tags for each page

**Meta Tags**:
- Title
- Description
- Keywords
- Open Graph (og:title, og:description, og:image)
- Twitter Card
- Canonical URL
- Hreflang tags

#### StructuredData (`components/seo/StructuredData.jsx`)
**Purpose**: Add JSON-LD structured data

**Schema Types**:
- Organization
- WebSite
- SoftwareApplication
- WebPage
- HowTo
- FAQPage
- BreadcrumbList

#### PageSEO (`components/seo/PageSEO.jsx`)
**Purpose**: Page-specific SEO wrapper

**Features**:
- Combines SEOHead and StructuredData
- Pre-configured for each page type
- Localized meta tags


---

## SEO Optimization

### On-Page SEO

#### Title Tags
- **Format**: `[Feature Name] - Graphos AI Studio`
- **Length**: 50-60 characters
- **Keywords**: Include primary keyword in title
- **Localized**: Different title for each language

**Examples**:
- English: "AI Detection - Graphos AI Studio"
- Vietnamese: "Phát hiện AI - Graphos AI Studio"
- Japanese: "AI検出 - Graphos AI Studio"

#### Meta Descriptions
- **Length**: 150-160 characters
- **Call-to-action**: Include CTA ("Try free", "Get started")
- **Keywords**: Include 2-3 relevant keywords
- **Unique**: Different description for each page

**Example**:
```
Detect AI-generated content with 98% accuracy. Humanize your writing and create authentic content that sounds like you. Free AI writing assistant with Chrome extension.
```

#### Header Tags (H1-H6)
- **H1**: One per page, main headline
- **H2**: Section titles
- **H3**: Subsection titles
- **H4-H6**: Minor headings

**Hierarchy Example**:
```
H1: Graphos AI Studio - AI Detection & Humanization
  H2: Features
    H3: AI Detection
    H3: Humanization
  H2: How It Works
    H3: Step 1: Create Profile
    H3: Step 2: Detect AI
```

#### Image Optimization
- **Alt text**: Descriptive text for all images
- **File names**: Descriptive (e.g., `ai-detection-demo.png`)
- **Lazy loading**: Load images as they enter viewport
- **Responsive images**: Different sizes for different screens
- **WebP format**: Modern image format for smaller file sizes

#### Internal Linking
- **Navigation menu**: Links to all main pages
- **Breadcrumbs**: Hierarchical navigation
- **Related content**: Links to related features
- **Footer links**: Sitemap-style links

#### URL Structure
- **Clean URLs**: `/features/ai-detection` (not `/page?id=123`)
- **Hyphens**: Use hyphens for word separation
- **Lowercase**: All lowercase letters
- **Language prefix**: `/:lang/features/ai-detection`

### Technical SEO

#### Sitemap.xml
**Auto-generated** with all routes and languages

**Example**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://graphosai.com/</loc>
    <lastmod>2026-01-06</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="en" href="https://graphosai.com/" />
    <xhtml:link rel="alternate" hreflang="vi" href="https://graphosai.com/vi/" />
    <xhtml:link rel="alternate" hreflang="ja" href="https://graphosai.com/ja/" />
  </url>
  <url>
    <loc>https://graphosai.com/features</loc>
    <lastmod>2026-01-06</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

#### Robots.txt
**Purpose**: Control search engine crawling

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://graphosai.com/sitemap.xml
```

#### Canonical URLs
**Purpose**: Prevent duplicate content issues

**Example**:
```html
<link rel="canonical" href="https://graphosai.com/features/ai-detection" />
```

#### Hreflang Tags
**Purpose**: Indicate language variants

**Example**:
```html
<link rel="alternate" hreflang="en" href="https://graphosai.com/" />
<link rel="alternate" hreflang="vi" href="https://graphosai.com/vi/" />
<link rel="alternate" hreflang="ja" href="https://graphosai.com/ja/" />
<link rel="alternate" hreflang="x-default" href="https://graphosai.com/" />
```

#### Structured Data (JSON-LD)

**Organization Schema**:
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Graphos AI Studio",
  "url": "https://graphosai.com",
  "logo": "https://graphosai.com/logo.png",
  "description": "AI-powered writing assistant",
  "sameAs": [
    "https://twitter.com/graphosai",
    "https://linkedin.com/company/graphosai"
  ]
}
```

**SoftwareApplication Schema**:
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Graphos AI Studio",
  "applicationCategory": "ProductivityApplication",
  "operatingSystem": "Web, Chrome Extension",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "1250"
  }
}
```

**FAQPage Schema**:
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is AI detection?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "AI detection is the process of identifying whether text was written by a human or generated by AI..."
      }
    }
  ]
}
```

### Off-Page SEO

#### Backlinks
- Submit to directories (Product Hunt, BetaList, etc.)
- Guest blogging
- Social media sharing
- Press releases

#### Social Signals
- Share buttons on all pages
- Open Graph tags for rich previews
- Twitter Card for tweet previews
- Social media profiles linked in footer

### Local SEO (if applicable)
- Google My Business listing
- Local citations
- NAP (Name, Address, Phone) consistency


---

## Internationalization

### i18n Configuration

**Library**: i18next + react-i18next

**Configuration** (`src/i18n/index.js`):
```javascript
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'vi', 'ja', 'ko', 'zh-CN', 'zh-TW', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ar', 'hi', 'th', 'id'],
    detection: {
      order: ['path', 'localStorage', 'navigator'],
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false
    }
  })
```

### Translation Files

**Location**: `public/locales/{lang}/translation.json`

**Structure**:
```json
{
  "nav": {
    "home": "Home",
    "features": "Features",
    "pricing": "Pricing",
    "aiDetection": "AI Detection",
    "humanization": "Humanization"
  },
  "home": {
    "meta": {
      "title": "Graphos AI Studio - AI Detection & Humanization",
      "description": "Detect AI-generated content with 98% accuracy..."
    },
    "hero": {
      "title": "Transform AI Text into Human Writing",
      "subtitle": "Detect, humanize, and create authentic content",
      "cta": {
        "primary": "Get Started Free",
        "secondary": "Watch Demo"
      }
    }
  }
}
```

### Usage in Components

**Hook-based**:
```jsx
import { useTranslation } from 'react-i18next'

function Component() {
  const { t, i18n } = useTranslation()
  
  return (
    <div>
      <h1>{t('home.hero.title')}</h1>
      <p>{t('home.hero.subtitle')}</p>
      <button onClick={() => i18n.changeLanguage('vi')}>
        Switch to Vietnamese
      </button>
    </div>
  )
}
```

**With interpolation**:
```jsx
// Translation: "Welcome, {{name}}!"
<p>{t('welcome', { name: 'John' })}</p>
// Output: "Welcome, John!"
```

**With pluralization**:
```json
{
  "credits": "{{count}} credit",
  "credits_plural": "{{count}} credits"
}
```

```jsx
<p>{t('credits', { count: 1 })}</p>  // "1 credit"
<p>{t('credits', { count: 5 })}</p>  // "5 credits"
```

### Language Switcher

**Component**: `components/common/LanguageSwitcher.jsx`

**Features**:
- Dropdown menu with flag icons
- Current language highlighted
- Persists selection in localStorage
- Updates URL with language prefix
- Smooth transition between languages

**Implementation**:
```jsx
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'

function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang)
    const newPath = `/${lang}${location.pathname.replace(/^\/[a-z]{2}/, '')}`
    navigate(newPath)
  }
  
  return (
    <select value={i18n.language} onChange={(e) => changeLanguage(e.target.value)}>
      <option value="en">🇺🇸 English</option>
      <option value="vi">🇻🇳 Tiếng Việt</option>
      <option value="ja">🇯🇵 日本語</option>
      {/* ... more languages */}
    </select>
  )
}
```

### RTL Support (Arabic)

**CSS**:
```css
[dir="rtl"] {
  direction: rtl;
  text-align: right;
}

[dir="rtl"] .ml-4 {
  margin-left: 0;
  margin-right: 1rem;
}
```

**React**:
```jsx
useEffect(() => {
  document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr'
}, [i18n.language])
```

### Translation Management

#### Scripts

**Check translations**:
```bash
npm run i18n:check
```
- Validates all translation files
- Checks for missing keys
- Reports unused keys

**Fix translations**:
```bash
npm run i18n:fix
```
- Auto-fixes common issues
- Adds missing keys with placeholder text
- Removes unused keys

**Extract translations**:
```bash
npx i18next-parser
```
- Scans source code for translation keys
- Updates translation files
- Preserves existing translations

### Best Practices

1. **Use namespaces** for large projects
2. **Keep keys descriptive** (`home.hero.title` not `h1`)
3. **Avoid hardcoded text** in components
4. **Test all languages** before deployment
5. **Use professional translators** for accuracy
6. **Consider cultural differences** in images and examples
7. **Localize dates, numbers, and currencies**


---

## Performance Optimizations

### Code Splitting

#### Route-based Splitting
**Implementation** (`App.jsx`):
```jsx
import { lazy, Suspense } from 'react'

// Lazy load pages
const Home = lazy(() => import('./pages/Home'))
const Features = lazy(() => import('./pages/Features'))
const AIDetection = lazy(() => import('./pages/features/AIDetection'))

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<Features />} />
        <Route path="/features/ai-detection" element={<AIDetection />} />
      </Routes>
    </Suspense>
  )
}
```

**Benefits**:
- Initial bundle size reduced by 60%
- Faster first page load
- Pages load on-demand

#### Component-level Splitting
**Heavy sections lazy loaded**:
```jsx
const TestimonialsSection = lazy(() => 
  import('./components/sections/TestimonialsSection')
)
const PricingSection = lazy(() => 
  import('./components/sections/PricingSection')
)

// In component
<Suspense fallback={<SectionLoader />}>
  <TestimonialsSection />
  <PricingSection />
</Suspense>
```

### Image Optimization

#### Lazy Loading
```jsx
<img 
  src="/images/feature.png" 
  alt="Feature screenshot"
  loading="lazy"
  decoding="async"
/>
```

#### Responsive Images
```jsx
<img 
  srcSet="
    /images/feature-320w.webp 320w,
    /images/feature-640w.webp 640w,
    /images/feature-1280w.webp 1280w
  "
  sizes="(max-width: 640px) 320px, (max-width: 1280px) 640px, 1280px"
  src="/images/feature-640w.webp"
  alt="Feature screenshot"
/>
```

#### WebP Format
- **Conversion**: Sharp library during build
- **Fallback**: JPEG/PNG for older browsers
- **Size reduction**: 25-35% smaller than JPEG

### Bundle Optimization

#### Vite Configuration (`vite.config.js`)
```javascript
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'animations': ['framer-motion', 'lottie-react'],
          'i18n': ['i18next', 'react-i18next']
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
}
```

**Chunks**:
- `vendor.js` - React and core libraries (cached long-term)
- `animations.js` - Animation libraries
- `i18n.js` - Internationalization
- `[page].js` - Individual page bundles

### Caching Strategy

#### Service Worker
**Cache-first strategy** for static assets:
```javascript
// Cache static assets
workbox.routing.registerRoute(
  /\.(?:js|css|png|jpg|jpeg|svg|gif|webp)$/,
  new workbox.strategies.CacheFirst({
    cacheName: 'static-assets',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
)
```

#### Browser Caching
**Firebase Hosting** (`firebase.json`):
```json
{
  "hosting": {
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "**/*.@(jpg|jpeg|png|gif|webp|svg)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=2592000"
          }
        ]
      }
    ]
  }
}
```

### Prefetching & Preloading

#### Route Prefetching
**Prefetch common routes in idle time**:
```jsx
import { requestIdleCallback } from '@utils/performance'

useEffect(() => {
  requestIdleCallback(() => {
    // Prefetch Features page
    import('./pages/Features')
  }, { timeout: 5000 })
}, [])
```

#### Critical Resource Preloading
**In `index.html`**:
```html
<link rel="preload" href="/logo.svg" as="image" type="image/svg+xml" />
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin />
```

#### DNS Prefetch
```html
<link rel="dns-prefetch" href="https://fonts.googleapis.com" />
<link rel="dns-prefetch" href="https://www.google-analytics.com" />
```

### Animation Performance

#### GPU Acceleration
**Use transform and opacity** (GPU-accelerated):
```css
/* Good - GPU accelerated */
.element {
  transform: translateX(100px);
  opacity: 0.5;
}

/* Bad - triggers layout */
.element {
  left: 100px;
  visibility: hidden;
}
```

#### Framer Motion Optimization
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
  // Use will-change for complex animations
  style={{ willChange: 'transform, opacity' }}
>
  Content
</motion.div>
```

#### Intersection Observer
**Animate only when in viewport**:
```jsx
import { useIntersectionObserver } from '@hooks/useIntersectionObserver'

function Component() {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 })
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
    >
      Content
    </motion.div>
  )
}
```

### Performance Monitoring

#### Web Vitals
**Tracked metrics**:
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **FCP (First Contentful Paint)**: < 1.8s
- **TTFB (Time to First Byte)**: < 600ms

**Implementation** (`index.html`):
```javascript
if ('PerformanceObserver' in window) {
  // LCP Observer
  new PerformanceObserver((list) => {
    const entries = list.getEntries()
    const lastEntry = entries[entries.length - 1]
    console.log('LCP:', lastEntry.startTime)
  }).observe({ type: 'largest-contentful-paint', buffered: true })
}
```

#### Lighthouse Scores
**Target scores**:
- Performance: 95+
- Accessibility: 100
- Best Practices: 100
- SEO: 100

### Bundle Analysis

**Analyze bundle size**:
```bash
npm run build
npx vite-bundle-visualizer
```

**Optimization checklist**:
- [ ] Remove unused dependencies
- [ ] Use tree-shaking
- [ ] Lazy load heavy components
- [ ] Optimize images
- [ ] Minify code
- [ ] Enable compression (gzip/brotli)


---

## Build & Deployment

### Build Process

#### Development Build
```bash
npm run dev
```
- Starts Vite dev server on port 5175
- Hot Module Replacement (HMR) enabled
- Source maps for debugging
- Fast refresh for React components

#### Production Build
```bash
npm run build
```

**Build steps**:
1. **Generate sitemap** - Creates `sitemap.xml` with all routes
2. **Vite build** - Bundles and optimizes code
3. **Prerender OG images** - Generates Open Graph images for social sharing

**Output** (`dist/` folder):
```
dist/
├── assets/
│   ├── index-[hash].js       # Main bundle
│   ├── vendor-[hash].js      # Vendor bundle
│   ├── animations-[hash].js  # Animation libraries
│   ├── i18n-[hash].js        # i18n libraries
│   └── [page]-[hash].js      # Page-specific bundles
├── images/                   # Optimized images
├── locales/                  # Translation files
├── index.html                # Entry point
├── sitemap.xml               # Sitemap
└── robots.txt                # Robots file
```

#### Preview Build
```bash
npm run preview
```
- Serves production build locally
- Test before deployment
- Runs on port 4173

### Deployment Platforms

#### Firebase Hosting (Primary)

**Configuration** (`firebase.json`):
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  }
}
```

**Deploy command**:
```bash
npm run build
firebase deploy --only hosting
```

**Features**:
- Global CDN
- Automatic SSL certificate
- Custom domain support
- Rollback capability
- Preview channels for testing

#### Vercel (Alternative)

**Configuration** (`vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Deploy command**:
```bash
vercel --prod
```

#### Netlify (Alternative)

**Configuration** (`netlify.toml`):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Deploy command**:
```bash
netlify deploy --prod
```

### CI/CD Pipeline

#### GitHub Actions

**Workflow** (`.github/workflows/deploy.yml`):
```yaml
name: Deploy Landing Page

on:
  push:
    branches: [main]
    paths:
      - 'landing-page/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: landing-page/package-lock.json
      
      - name: Install dependencies
        working-directory: landing-page
        run: npm ci
      
      - name: Run tests
        working-directory: landing-page
        run: npm run test
      
      - name: Run linting
        working-directory: landing-page
        run: npm run lint
      
      - name: Build
        working-directory: landing-page
        run: npm run build
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: graphosai
          entryPoint: landing-page
```

**Triggers**:
- Push to `main` branch
- Pull request (preview deployment)
- Manual workflow dispatch

### Environment Variables

#### Development (`.env.development`)
```env
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_URL=http://localhost:5175
VITE_FIREBASE_API_KEY=dev-api-key
VITE_GA_TRACKING_ID=
```

#### Production (`.env.production`)
```env
VITE_API_BASE_URL=https://api.graphosai.com
VITE_APP_URL=https://graphosai.com
VITE_FIREBASE_API_KEY=prod-api-key
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
```

**Usage in code**:
```javascript
const apiUrl = import.meta.env.VITE_API_BASE_URL
const appUrl = import.meta.env.VITE_APP_URL
```

### Post-Deployment Checklist

- [ ] Verify all pages load correctly
- [ ] Test language switching
- [ ] Check mobile responsiveness
- [ ] Validate SEO meta tags (view source)
- [ ] Test social sharing (Facebook, Twitter)
- [ ] Verify sitemap.xml is accessible
- [ ] Check robots.txt
- [ ] Test all CTAs and links
- [ ] Verify analytics tracking
- [ ] Run Lighthouse audit
- [ ] Test on multiple browsers
- [ ] Check console for errors
- [ ] Verify SSL certificate

### Rollback Procedure

**Firebase Hosting**:
```bash
# List previous deployments
firebase hosting:channel:list

# Rollback to previous version
firebase hosting:rollback
```

**Vercel**:
- Go to Vercel dashboard
- Select deployment
- Click "Promote to Production"


---

## Development Guide

### Getting Started

#### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher
- Git

#### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/alvesoscar517-cloud/Graphosai.com-Home-Page.git
cd Graphosai.com-Home-Page/landing-page
```

2. **Install dependencies**:
```bash
npm install
```

3. **Create environment file**:
```bash
cp .env.example .env.development
```

4. **Start development server**:
```bash
npm run dev
```

5. **Open browser**:
```
http://localhost:5175
```

### Project Configuration

#### Vite Configuration (`vite.config.js`)
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@config': path.resolve(__dirname, './src/config'),
      '@styles': path.resolve(__dirname, './src/styles'),
    }
  },
  server: {
    port: 5175,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'animations': ['framer-motion', 'lottie-react'],
          'i18n': ['i18next', 'react-i18next']
        }
      }
    }
  }
})
```

#### TailwindCSS Configuration (`tailwind.config.js`)
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
        // ... more colors
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
```

#### ESLint Configuration (`eslint.config.js`)
```javascript
import js from '@eslint/js'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'no-unused-vars': 'warn',
    },
  },
]
```

### Development Workflow

#### 1. Create New Page

**Step 1**: Create page component
```bash
# Create file
touch src/pages/NewPage.jsx
```

```jsx
// src/pages/NewPage.jsx
import { useTranslation } from 'react-i18next'
import PageSEO from '@components/seo/PageSEO'

function NewPage() {
  const { t } = useTranslation()
  
  return (
    <>
      <PageSEO pageKey="newPage" />
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold">{t('newPage.title')}</h1>
        <p>{t('newPage.description')}</p>
      </div>
    </>
  )
}

export default NewPage
```

**Step 2**: Add route
```jsx
// src/App.jsx
import NewPage from '@pages/NewPage'

// In Routes
<Route path="/new-page" element={<NewPage />} />
<Route path="/:lang/new-page" element={<NewPage />} />
```

**Step 3**: Add translations
```json
// public/locales/en/translation.json
{
  "newPage": {
    "title": "New Page Title",
    "description": "Page description"
  }
}
```

**Step 4**: Add to sitemap
```javascript
// scripts/generate-sitemap.js
const routes = [
  // ... existing routes
  '/new-page',
]
```

#### 2. Create New Component

**Step 1**: Create component file
```bash
mkdir -p src/components/sections
touch src/components/sections/NewSection.jsx
```

```jsx
// src/components/sections/NewSection.jsx
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

function NewSection() {
  const { t } = useTranslation()
  
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-8"
        >
          {t('newSection.title')}
        </motion.h2>
        {/* Content */}
      </div>
    </section>
  )
}

export default NewSection
```

**Step 2**: Import and use
```jsx
// src/pages/Home.jsx
import NewSection from '@components/sections/NewSection'

// In component
<NewSection />
```

#### 3. Add New Translation

**Step 1**: Add key to English file
```json
// public/locales/en/translation.json
{
  "newFeature": {
    "title": "New Feature",
    "description": "Feature description"
  }
}
```

**Step 2**: Copy to all language files
```bash
# Use i18n script to sync
npm run i18n:fix
```

**Step 3**: Translate manually or use translation service

#### 4. Add New Icon

**Using Lucide React**:
```jsx
import { Check, X, ArrowRight } from 'lucide-react'

<Check className="w-5 h-5 text-green-500" />
<X className="w-5 h-5 text-red-500" />
<ArrowRight className="w-5 h-5" />
```

**Using Icon component**:
```jsx
import Icon from '@components/common/Icon'

<Icon name="check" size="md" className="text-green-500" />
```

### Testing

#### Unit Tests (Vitest)

**Run tests**:
```bash
npm run test          # Run once
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
```

**Example test**:
```jsx
// src/components/common/Button.test.jsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Button from './Button'

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
  
  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    screen.getByText('Click me').click()
    expect(handleClick).toHaveBeenCalledOnce()
  })
})
```

#### E2E Tests (Playwright - Optional)

**Install**:
```bash
npm install -D @playwright/test
```

**Example test**:
```javascript
// tests/home.spec.js
import { test, expect } from '@playwright/test'

test('homepage loads correctly', async ({ page }) => {
  await page.goto('http://localhost:5175')
  await expect(page).toHaveTitle(/Graphos AI Studio/)
  await expect(page.locator('h1')).toBeVisible()
})
```

### Debugging

#### Browser DevTools
- **React DevTools** - Inspect component tree
- **Network tab** - Check API calls and asset loading
- **Performance tab** - Profile rendering performance
- **Lighthouse** - Audit performance, SEO, accessibility

#### VS Code Debugging

**Configuration** (`.vscode/launch.json`):
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:5175",
      "webRoot": "${workspaceFolder}/landing-page/src"
    }
  ]
}
```

#### Console Logging
```javascript
// Development only
if (import.meta.env.DEV) {
  console.log('Debug info:', data)
}
```

### Code Style

#### Prettier Configuration (`.prettierrc`)
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "always"
}
```

**Format code**:
```bash
npm run format
```

#### ESLint
**Lint code**:
```bash
npm run lint
npm run lint:fix  # Auto-fix issues
```

### Git Workflow

#### Commit Convention
```
feat: Add new feature
fix: Bug fix
docs: Documentation changes
style: Code style changes (formatting)
refactor: Code refactoring
test: Test additions/changes
chore: Build/config changes
perf: Performance improvements
```

**Examples**:
```bash
git commit -m "feat: Add testimonials section"
git commit -m "fix: Resolve mobile menu overflow issue"
git commit -m "docs: Update README with deployment instructions"
```

#### Branch Strategy
- `main` - Production branch
- `develop` - Development branch
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches

**Workflow**:
```bash
# Create feature branch
git checkout -b feature/new-section

# Make changes and commit
git add .
git commit -m "feat: Add new section"

# Push to remote
git push origin feature/new-section

# Create pull request on GitHub
```


---

## Scripts & Commands

### Development Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 5175 |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run format` | Format code with Prettier |
| `npm run test` | Run unit tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |

### Build & Deployment Scripts

| Command | Description |
|---------|-------------|
| `npm run generate:sitemap` | Generate sitemap.xml |
| `npm run prerender:og` | Pre-render Open Graph images |
| `npm run i18n:check` | Validate translation files |
| `npm run i18n:fix` | Auto-fix translation issues |

### Utility Scripts

#### Generate Sitemap (`scripts/generate-sitemap.js`)
**Purpose**: Create sitemap.xml with all routes and languages

**Usage**:
```bash
npm run generate:sitemap
```

**Output**: `public/sitemap.xml`

#### Prerender OG Images (`scripts/prerender-og.js`)
**Purpose**: Generate Open Graph images for social sharing

**Usage**:
```bash
npm run prerender:og
```

**Output**: `dist/og-images/`

#### Check Translations (`scripts/check-translations.js`)
**Purpose**: Validate translation completeness

**Usage**:
```bash
npm run i18n:check
```

**Checks**:
- Missing translation keys
- Unused translation keys
- Empty translations
- Inconsistent pluralization

**Output**:
```
✓ English (en): 245 keys
✓ Vietnamese (vi): 245 keys
✗ Japanese (ja): 243 keys (missing: home.newFeature.title, home.newFeature.description)
```

#### Fix Translations (`scripts/fix-translations.js`)
**Purpose**: Auto-fix common translation issues

**Usage**:
```bash
npm run i18n:fix
```

**Fixes**:
- Add missing keys with placeholder text
- Remove unused keys
- Sort keys alphabetically
- Format JSON consistently

### Firebase Commands

| Command | Description |
|---------|-------------|
| `firebase login` | Login to Firebase |
| `firebase init` | Initialize Firebase project |
| `firebase deploy --only hosting` | Deploy to Firebase Hosting |
| `firebase hosting:channel:deploy preview` | Deploy to preview channel |
| `firebase hosting:channel:list` | List all hosting channels |
| `firebase hosting:rollback` | Rollback to previous deployment |

### Package Management

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm install <package>` | Install new package |
| `npm install -D <package>` | Install dev dependency |
| `npm update` | Update all packages |
| `npm outdated` | Check for outdated packages |
| `npm audit` | Check for security vulnerabilities |
| `npm audit fix` | Auto-fix security issues |

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use
**Error**: `Port 5175 is already in use`

**Solution**:
```bash
# Kill process on port 5175
npx kill-port 5175

# Or use different port
npm run dev -- --port 5176
```

#### 2. Module Not Found
**Error**: `Cannot find module '@components/...'`

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 3. Build Fails
**Error**: Build errors during `npm run build`

**Solution**:
```bash
# Check for TypeScript/ESLint errors
npm run lint

# Clear cache and rebuild
rm -rf dist node_modules/.vite
npm run build
```

#### 4. Translation Missing
**Error**: Translation key not found

**Solution**:
```bash
# Check translation files
npm run i18n:check

# Auto-fix missing keys
npm run i18n:fix
```

#### 5. Slow Development Server
**Issue**: Dev server is slow or unresponsive

**Solution**:
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Restart dev server
npm run dev
```

---

## Best Practices

### Code Organization
1. **Component structure**: One component per file
2. **Naming conventions**: PascalCase for components, camelCase for functions
3. **File organization**: Group related files in folders
4. **Import order**: External libraries → Internal modules → Styles

### Performance
1. **Lazy load** heavy components and routes
2. **Optimize images** (WebP, lazy loading, responsive)
3. **Minimize bundle size** (tree shaking, code splitting)
4. **Use memoization** for expensive computations
5. **Avoid unnecessary re-renders** (React.memo, useMemo, useCallback)

### SEO
1. **Unique meta tags** for each page
2. **Structured data** for rich results
3. **Semantic HTML** (proper heading hierarchy)
4. **Alt text** for all images
5. **Fast loading times** (< 3s)

### Accessibility
1. **Keyboard navigation** for all interactive elements
2. **ARIA labels** for screen readers
3. **Color contrast** (WCAG AA standard)
4. **Focus indicators** visible
5. **Responsive design** for all screen sizes

### Security
1. **Sanitize user input** (prevent XSS)
2. **Use HTTPS** for all resources
3. **Content Security Policy** headers
4. **Regular dependency updates** (npm audit)
5. **Environment variables** for sensitive data

---

## Resources

### Documentation
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [TailwindCSS Documentation](https://tailwindcss.com)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [i18next Documentation](https://www.i18next.com)

### Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Performance auditing
- [React DevTools](https://react.dev/learn/react-developer-tools) - Component debugging
- [Figma](https://www.figma.com) - Design tool
- [Excalidraw](https://excalidraw.com) - Diagramming tool

### Learning
- [React Tutorial](https://react.dev/learn)
- [TailwindCSS Tutorial](https://tailwindcss.com/docs/utility-first)
- [Web.dev](https://web.dev) - Web development best practices
- [MDN Web Docs](https://developer.mozilla.org) - Web standards reference

---

## Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** with clear commit messages
4. **Add tests** for new features
5. **Run linting and tests** (`npm run lint && npm run test`)
6. **Submit a pull request**

### Pull Request Checklist
- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] Documentation updated (if needed)
- [ ] No console errors or warnings
- [ ] Responsive design tested
- [ ] Accessibility checked
- [ ] SEO meta tags added (for new pages)
- [ ] Translations added (for new text)

---

## License

This project is proprietary software. All rights reserved.

© 2024-2026 Graphos AI Studio. All rights reserved.

---

## Contact & Support

### General Inquiries
- **Website**: [https://graphosai.com](https://graphosai.com)
- **Email**: support@graphosai.com

### Technical Support
- **GitHub Issues**: [Report a bug](https://github.com/alvesoscar517-cloud/Graphosai.com-Home-Page/issues)
- **Documentation**: [View docs](https://docs.graphosai.com)

### Social Media
- **Twitter/X**: [@graphosai](https://twitter.com/graphosai)
- **LinkedIn**: [Graphos AI Studio](https://linkedin.com/company/graphosai)
- **YouTube**: [@graphosai](https://youtube.com/@graphosai)

---

**Built with ❤️ by the Graphos AI Team**

*Last updated: January 6, 2026*
