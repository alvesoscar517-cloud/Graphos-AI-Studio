/**
 * Translation Fixer
 * Automatically fixes untranslated feature names in all language files
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const LOCALES_DIR = path.resolve(__dirname, '../src/i18n/locales')

// Translation mappings for feature names
const TRANSLATIONS = {
  'AI Rewrite': {
    vi: 'Viết lại AI',
    ja: 'AIリライト',
    ko: 'AI 다시쓰기',
    'zh-CN': 'AI重写',
    'zh-TW': 'AI重寫',
    es: 'Reescritura IA',
    fr: 'Réécriture IA',
    de: 'KI-Umschreiben',
    it: 'Riscrittura IA',
    pt: 'Reescrita IA',
    ru: 'ИИ-переписывание',
    ar: 'إعادة الكتابة بالذكاء الاصطناعي',
    hi: 'AI पुनर्लेखन',
    th: 'เขียนใหม่ด้วย AI',
    id: 'Penulisan Ulang AI'
  },
  'AI Workspace': {
    vi: 'Không gian làm việc AI',
    ja: 'AIワークスペース',
    ko: 'AI 작업공간',
    'zh-CN': 'AI工作区',
    'zh-TW': 'AI工作區',
    es: 'Espacio de trabajo IA',
    fr: 'Espace de travail IA',
    de: 'KI-Arbeitsbereich',
    it: 'Area di lavoro IA',
    pt: 'Espaço de trabalho IA',
    ru: 'ИИ-рабочее пространство',
    ar: 'مساحة عمل الذكاء الاصطناعي',
    hi: 'AI कार्यक्षेत्र',
    th: 'พื้นที่ทำงาน AI',
    id: 'Ruang Kerja AI'
  },
  'AI Detection': {
    vi: 'Phát hiện AI',
    ja: 'AI検出',
    ko: 'AI 감지',
    'zh-CN': 'AI检测',
    'zh-TW': 'AI檢測',
    es: 'Detección de IA',
    fr: 'Détection IA',
    de: 'KI-Erkennung',
    it: 'Rilevamento IA',
    pt: 'Detecção de IA',
    ru: 'Обнаружение ИИ',
    ar: 'كشف الذكاء الاصطناعي',
    hi: 'AI पहचान',
    th: 'การตรวจจับ AI',
    id: 'Deteksi AI'
  },
  'Voice Profile': {
    vi: 'Hồ sơ giọng văn',
    ja: 'ボイスプロファイル',
    ko: '보이스 프로필',
    'zh-CN': '声音档案',
    'zh-TW': '聲音檔案',
    es: 'Perfil de voz',
    fr: 'Profil vocal',
    de: 'Stimmprofil',
    it: 'Profilo vocale',
    pt: 'Perfil de voz',
    ru: 'Голосовой профиль',
    ar: 'ملف الصوت',
    hi: 'वॉइस प्रोफाइल',
    th: 'โปรไฟล์เสียง',
    id: 'Profil Suara'
  },
  'Humanization': {
    vi: 'Nhân hóa',
    ja: '人間化',
    ko: '인간화',
    'zh-CN': '人性化',
    'zh-TW': '人性化',
    es: 'Humanización',
    fr: 'Humanisation',
    de: 'Humanisierung',
    it: 'Umanizzazione',
    pt: 'Humanização',
    ru: 'Гуманизация',
    ar: 'الأنسنة',
    hi: 'मानवीकरण',
    th: 'การทำให้เป็นมนุษย์',
    id: 'Humanisasi'
  },
  'Humanization Demo': {
    vi: 'Demo Nhân hóa',
    ja: '人間化デモ',
    ko: '인간화 데모',
    'zh-CN': '人性化演示',
    'zh-TW': '人性化演示',
    es: 'Demo de Humanización',
    fr: 'Démo Humanisation',
    de: 'Humanisierung Demo',
    it: 'Demo Umanizzazione',
    pt: 'Demo de Humanização',
    ru: 'Демо гуманизации',
    ar: 'عرض الأنسنة',
    hi: 'मानवीकरण डेमो',
    th: 'สาธิตการทำให้เป็นมนุษย์',
    id: 'Demo Humanisasi'
  },
  'AI Detection Demo': {
    vi: 'Demo Phát hiện AI',
    ja: 'AI検出デモ',
    ko: 'AI 감지 데모',
    'zh-CN': 'AI检测演示',
    'zh-TW': 'AI檢測演示',
    es: 'Demo de Detección de IA',
    fr: 'Démo Détection IA',
    de: 'KI-Erkennung Demo',
    it: 'Demo Rilevamento IA',
    pt: 'Demo de Detecção de IA',
    ru: 'Демо обнаружения ИИ',
    ar: 'عرض كشف الذكاء الاصطناعي',
    hi: 'AI पहचान डेमो',
    th: 'สาธิตการตรวจจับ AI',
    id: 'Demo Deteksi AI'
  }
}

// Read and parse JSON file
function readLocaleFile(lang) {
  const filePath = path.join(LOCALES_DIR, `${lang}.json`)
  const content = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(content)
}

// Write JSON file with proper formatting
function writeLocaleFile(lang, data) {
  const filePath = path.join(LOCALES_DIR, `${lang}.json`)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

// Replace English terms with translations in a string
function translateString(str, lang) {
  let result = str
  let changed = false
  
  // Sort by length (longest first) to avoid partial replacements
  const sortedTerms = Object.keys(TRANSLATIONS).sort((a, b) => b.length - a.length)
  
  for (const englishTerm of sortedTerms) {
    const translation = TRANSLATIONS[englishTerm][lang]
    if (translation && result.includes(englishTerm)) {
      result = result.replace(new RegExp(englishTerm, 'g'), translation)
      changed = true
    }
  }
  
  return { result, changed }
}

// Recursively process object and translate strings
function processObject(obj, lang, path = '') {
  const changes = []
  
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key
    
    if (typeof value === 'string') {
      const { result, changed } = translateString(value, lang)
      if (changed) {
        obj[key] = result
        changes.push({
          path: currentPath,
          before: value,
          after: result
        })
      }
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      changes.push(...processObject(value, lang, currentPath))
    }
  }
  
  return changes
}

// Main fix function
function fixTranslations() {
  console.log('🔧 Translation Fixer\n')
  console.log('=' .repeat(60))
  
  const files = fs.readdirSync(LOCALES_DIR).filter(f => f.endsWith('.json') && f !== 'en.json')
  let totalChanges = 0
  
  for (const file of files) {
    const lang = file.replace('.json', '')
    
    // Skip if no translations defined for this language
    const hasTranslations = Object.values(TRANSLATIONS).some(t => t[lang])
    if (!hasTranslations) {
      console.log(`\n⏭️  ${lang.toUpperCase()}: No translations defined, skipping`)
      continue
    }
    
    console.log(`\n🌐 Processing ${lang.toUpperCase()}...`)
    
    const data = readLocaleFile(lang)
    const changes = processObject(data, lang)
    
    if (changes.length > 0) {
      writeLocaleFile(lang, data)
      console.log(`   ✅ Fixed ${changes.length} translations:`)
      
      for (const change of changes) {
        console.log(`      - ${change.path}`)
        console.log(`        Before: "${change.before.substring(0, 60)}${change.before.length > 60 ? '...' : ''}"`)
        console.log(`        After:  "${change.after.substring(0, 60)}${change.after.length > 60 ? '...' : ''}"`)
      }
      
      totalChanges += changes.length
    } else {
      console.log(`   ✓ No changes needed`)
    }
  }
  
  console.log('\n' + '=' .repeat(60))
  console.log(`\n✅ TOTAL: ${totalChanges} translations fixed`)
}

// Run the fixer
fixTranslations()
