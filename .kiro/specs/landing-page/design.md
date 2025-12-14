# Design Document: Graphos AI Studio Landing Page

## Overview

Hệ thống Landing Page cho Graphos AI Studio là một website marketing tĩnh, SEO-optimized, được xây dựng bằng React + Vite và deploy trên Firebase Hosting. Website bao gồm trang chủ, 4 trang tính năng riêng biệt, trang Privacy Policy và Terms of Service, hỗ trợ 15 ngôn ngữ.

### Tech Stack
- **Framework**: React 18 + Vite 5
- **Styling**: TailwindCSS 4 (consistent với main app)
- **Animation**: Framer Motion + Vanta.js
- **i18n**: i18next + react-i18next
- **Routing**: React Router DOM 6
- **Build**: Vite với SSG plugin cho SEO
- **Deployment**: Firebase Hosting

## Architecture

```
landing-page/
├── public/
│   ├── locales/           # i18n JSON files
│   │   ├── en/
│   │   ├── vi/
│   │   └── ... (15 languages)
│   ├── images/
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── components/
│   │   ├── common/        # Shared components
│   │   ├── layout/        # Header, Footer, Navigation
│   │   ├── sections/      # Page sections
│   │   └── demos/         # Interactive demo components
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── features/
│   │   │   ├── AIDetection.jsx
│   │   │   ├── Humanization.jsx
│   │   │   ├── VoiceProfile.jsx
│   │   │   └── AIWorkspace.jsx
│   │   ├── PrivacyPolicy.jsx
│   │   └── Terms.jsx
│   ├── hooks/
│   ├── i18n/
│   ├── styles/
│   ├── utils/
│   ├── config/
│   ├── App.jsx
│   └── main.jsx
├── firebase.json
├── .firebaserc
├── package.json
└── vite.config.js
```

### Routing Structure

| Route | Page | Description |
|-------|------|-------------|
| `/` | Homepage | Trang chủ giới thiệu sản phẩm |
| `/features/ai-detection` | AI Detection | Trang tính năng phát hiện AI |
| `/features/humanization` | Humanization | Trang tính năng nhân hóa nội dung |
| `/features/voice-profile` | Voice Profile | Trang tính năng hồ sơ giọng văn |
| `/features/ai-workspace` | AI Workspace | Trang tính năng không gian làm việc AI |
| `/privacy` | Privacy Policy | Chính sách bảo mật |
| `/terms` | Terms of Service | Điều khoản sử dụng |
| `/:lang/*` | Localized routes | Routes với prefix ngôn ngữ |

## Components and Interfaces

### Layout Components

```jsx
// Header Component
interface HeaderProps {
  sticky?: boolean;
  transparent?: boolean;
}

// Footer Component
interface FooterProps {
  showNewsletter?: boolean;
}

// Navigation Component
interface NavigationProps {
  items: NavItem[];
  currentPath: string;
}

interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}
```

### Section Components

```jsx
// Hero Section
interface HeroSectionProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  backgroundType: 'gradient' | 'vanta' | 'image';
}

// Feature Card
interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  href: string;
}

// Testimonial Section
interface TestimonialProps {
  testimonials: Testimonial[];
}

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  avatar?: string;
}

// CTA Section
interface CTASectionProps {
  title: string;
  description: string;
  primaryCTA: CTAButton;
  secondaryCTA?: CTAButton;
}

interface CTAButton {
  text: string;
  href: string;
  variant: 'primary' | 'secondary' | 'outline';
}
```

### Demo Components

```jsx
// AI Detection Demo
interface AIDetectionDemoProps {
  placeholder: string;
  maxLength: number;
  onAnalyze: (text: string) => SimulatedResult;
}

interface SimulatedResult {
  aiProbability: number;
  humanProbability: number;
  confidence: string;
  highlights: TextHighlight[];
}

// Humanization Demo
interface HumanizationDemoProps {
  sampleTexts: SampleText[];
  animationDuration: number;
}

interface SampleText {
  before: string;
  after: string;
  label: string;
}
```

### SEO Components

```jsx
// SEO Head Component
interface SEOHeadProps {
  title: string;
  description: string;
  keywords: string[];
  ogImage: string;
  canonicalUrl: string;
  alternateLanguages: AlternateLanguage[];
}

interface AlternateLanguage {
  lang: string;
  href: string;
}

// Structured Data Component
interface StructuredDataProps {
  type: 'Organization' | 'Product' | 'WebPage' | 'FAQPage';
  data: Record<string, unknown>;
}
```

## Data Models

### Page Content Model

```typescript
interface PageContent {
  meta: PageMeta;
  hero: HeroContent;
  sections: Section[];
  cta: CTAContent;
}

interface PageMeta {
  title: string;
  description: string;
  keywords: string[];
  ogImage: string;
}

interface HeroContent {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  image?: string;
}

interface Section {
  id: string;
  type: 'features' | 'testimonials' | 'pricing' | 'faq' | 'demo';
  content: Record<string, unknown>;
}
```

### i18n Content Structure

```typescript
// locales/{lang}/common.json
interface CommonTranslations {
  nav: {
    home: string;
    features: string;
    pricing: string;
    privacy: string;
    terms: string;
  };
  cta: {
    getStarted: string;
    tryFree: string;
    learnMore: string;
    signUp: string;
  };
  footer: {
    copyright: string;
    madeWith: string;
  };
}

// locales/{lang}/home.json
interface HomeTranslations {
  hero: {
    title: string;
    subtitle: string;
  };
  features: {
    title: string;
    items: FeatureItem[];
  };
  testimonials: {
    title: string;
    items: Testimonial[];
  };
}

// locales/{lang}/features/{feature}.json
interface FeatureTranslations {
  title: string;
  description: string;
  benefits: string[];
  useCases: UseCase[];
  demo: {
    title: string;
    instructions: string;
    placeholder: string;
  };
}
```

### Supported Languages

```typescript
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: 'us' },
  { code: 'vi', name: 'Tiếng Việt', flag: 'vn' },
  { code: 'ja', name: '日本語', flag: 'jp' },
  { code: 'ko', name: '한국어', flag: 'kr' },
  { code: 'zh_CN', name: '简体中文', flag: 'cn' },
  { code: 'zh_TW', name: '繁體中文', flag: 'tw' },
  { code: 'es', name: 'Español', flag: 'es' },
  { code: 'fr', name: 'Français', flag: 'fr' },
  { code: 'de', name: 'Deutsch', flag: 'de' },
  { code: 'it', name: 'Italiano', flag: 'it' },
  { code: 'pt_BR', name: 'Português', flag: 'br' },
  { code: 'ru', name: 'Русский', flag: 'ru' },
  { code: 'ar', name: 'العربية', flag: 'sa' },
  { code: 'hi', name: 'हिन्दी', flag: 'in' },
  { code: 'th', name: 'ไทย', flag: 'th' },
  { code: 'id', name: 'Bahasa Indonesia', flag: 'id' }
] as const;
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: All pages have unique SEO metadata
*For any* page in the Landing_Page_System, the page SHALL have a unique title and description that differs from all other pages.
**Validates: Requirements 8.1**

### Property 2: All pages have valid structured data
*For any* page in the Landing_Page_System, the page SHALL contain valid JSON-LD structured data that passes schema.org validation.
**Validates: Requirements 8.2**

### Property 3: All pages have Open Graph metadata
*For any* page in the Landing_Page_System, the page SHALL contain og:title, og:description, og:image, and twitter:card meta tags.
**Validates: Requirements 8.3**

### Property 4: Semantic heading hierarchy
*For any* page in the Landing_Page_System, headings SHALL follow proper hierarchy (h1 appears before h2, h2 before h3, etc.) with exactly one h1 per page.
**Validates: Requirements 8.6**

### Property 5: Language detection and content matching
*For any* supported browser language, when a visitor accesses the website, the i18n_System SHALL display content in the matching language if supported, otherwise default to English.
**Validates: Requirements 9.1**

### Property 6: Language selector presence
*For any* page in the Landing_Page_System, the header SHALL contain a language selector component with all 15 supported languages.
**Validates: Requirements 9.3**

### Property 7: Hreflang tags completeness
*For any* page in the Landing_Page_System, the page SHALL contain hreflang link tags for all 15 supported languages plus x-default.
**Validates: Requirements 9.4**

### Property 8: Language-specific URL content
*For any* language-specific URL (e.g., /vi/, /ja/), the page content SHALL be displayed in that specific language.
**Validates: Requirements 9.5**

### Property 9: Responsive layout at mobile breakpoint
*For any* page rendered at viewport width below 768px, the layout SHALL adapt to single-column mobile-optimized design.
**Validates: Requirements 10.1**

### Property 10: Responsive layout at tablet breakpoint
*For any* page rendered at viewport width between 768px and 1024px, the layout SHALL adapt to tablet-optimized design.
**Validates: Requirements 10.2**

### Property 11: Consistent header across pages
*For any* page in the Landing_Page_System, the header SHALL contain logo, navigation menu, and CTA button in consistent positions.
**Validates: Requirements 11.1**

### Property 12: Navigation completeness
*For any* navigation menu, it SHALL contain links to all Feature_Pages, Privacy_Policy_Page, and Terms_Page.
**Validates: Requirements 11.3**

### Property 13: Sticky header behavior
*For any* page when scrolled beyond the initial viewport, the header SHALL remain fixed at the top of the viewport.
**Validates: Requirements 11.4**

### Property 14: Breadcrumb on feature pages
*For any* Feature_Page, the page SHALL display breadcrumb navigation showing the path from homepage.
**Validates: Requirements 11.5**

### Property 15: Interactive demo input/output
*For any* Interactive_Demo component, when valid text input is provided, the demo SHALL produce and display a simulated result.
**Validates: Requirements 12.1, 12.2**

### Property 16: Demo CTA display
*For any* Interactive_Demo component after interaction, the component SHALL display a CTA button linking to the main application.
**Validates: Requirements 12.3**

### Property 17: Demo instructions presence
*For any* Interactive_Demo component, the component SHALL display clear instructions for user interaction.
**Validates: Requirements 12.4**

### Property 18: CTA buttons link to main application
*For any* CTA_Button on feature pages, the button SHALL link to the main application domain (app.graphosai.com).
**Validates: Requirements 1.4, 2.4, 3.4, 4.4, 5.4**

### Property 19: Footer links completeness
*For any* page footer, it SHALL contain valid links to Privacy_Policy_Page and Terms_Page.
**Validates: Requirements 1.5**

### Property 20: Legal pages have table of contents
*For any* legal page (Privacy Policy or Terms), the page SHALL contain a table of contents with anchor links to each section.
**Validates: Requirements 6.4, 7.4**

### Property 21: Legal pages have required sections
*For any* legal page, the page SHALL contain all required sections (introduction, data collection, user rights, contact info for Privacy; acceptance, usage, termination, contact for Terms).
**Validates: Requirements 6.1, 7.1**

### Property 22: Design system color consistency
*For any* page in the Landing_Page_System, the CSS custom properties for colors SHALL match the main application's color palette.
**Validates: Requirements 14.1**

### Property 23: Typography consistency
*For any* page in the Landing_Page_System, the font-family declarations SHALL match the main application's typography system.
**Validates: Requirements 14.2**

## Error Handling

### Network Errors
- Display offline indicator when network is unavailable
- Cache critical assets for offline viewing
- Graceful degradation for interactive demos

### i18n Fallbacks
- Fall back to English if translation key is missing
- Log missing translation keys in development
- Use interpolation for dynamic content

### Demo Error States
- Display error message if demo fails to process
- Provide retry option
- Show fallback static content

## Testing Strategy

### Dual Testing Approach

Testing sẽ bao gồm cả Unit Tests và Property-Based Tests:

#### Unit Tests
- Component rendering tests
- Navigation behavior tests
- SEO metadata presence tests
- i18n switching tests
- Demo interaction tests

#### Property-Based Testing

**Library**: fast-check (đã có trong web-app)

Property-based tests sẽ được sử dụng để verify các correctness properties:

1. **SEO Properties (1-4)**: Generate random page routes, verify metadata uniqueness and validity
2. **i18n Properties (5-8)**: Generate random language codes, verify content switching
3. **Responsive Properties (9-10)**: Generate random viewport widths, verify layout adaptation
4. **Navigation Properties (11-14)**: Generate random navigation paths, verify consistency
5. **Demo Properties (15-17)**: Generate random text inputs, verify demo behavior
6. **Link Properties (18-19)**: Generate random pages, verify CTA and footer links
7. **Legal Page Properties (20-21)**: Verify TOC and section completeness
8. **Design Properties (22-23)**: Verify CSS variable consistency

Mỗi property test sẽ chạy tối thiểu 100 iterations.

### Test File Structure

```
landing-page/
├── src/
│   └── __tests__/
│       ├── components/
│       │   ├── Header.test.jsx
│       │   ├── Footer.test.jsx
│       │   └── Navigation.test.jsx
│       ├── pages/
│       │   ├── Home.test.jsx
│       │   └── features/
│       ├── properties/
│       │   ├── seo.property.test.js
│       │   ├── i18n.property.test.js
│       │   ├── responsive.property.test.js
│       │   ├── navigation.property.test.js
│       │   ├── demo.property.test.js
│       │   └── design.property.test.js
│       └── utils/
│           └── test-utils.js
```

### Test Annotations

Mỗi property test PHẢI được annotate với format:
```javascript
/**
 * Feature: landing-page, Property 1: All pages have unique SEO metadata
 * Validates: Requirements 8.1
 */
```
