/**
 * Translation Consistency Checker
 * Checks for untranslated feature names across all language files
 * Focus: AI Rewrite, AI Workspace, and other feature names
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const LOCALES_DIR = path.resolve(__dirname, '../src/i18n/locales')

// Feature names that should be translated (English -> should NOT appear in other languages)
const ENGLISH_TERMS = [
  'AI Rewrite',
  'AI Workspace', 
  'AI Detection',
  'Voice Profile',
  'Compatibility Score',
  'Deviations',
  'Statistics',
  'Humanization',
  'Chrome Extension'
]

// Terms that are OK to keep in English (brand names, technical terms)
const ALLOWED_ENGLISH = [
  'Graphos',
  'Graphos AI',
  'Graphos AI Studio',
  'Chrome',
  'API',
  'GPT',
  'ChatGPT',
  'Claude',
  'Gemini',
  'FAQ',
  'GDPR'
]

// Read all locale files
function readLocaleFiles() {
  const files = fs.readdirSync(LOCALES_DIR).filter(f => f.endsWith('.json'))
  const locales = {}
  
  for (const file of files) {
    const lang = file.replace('.json', '')
    const content = fs.readFileSync(path.join(LOCALES_DIR, file), 'utf-8')
    locales[lang] = JSON.parse(content)
  }
  
  return locales
}

// Flatten nested object to key-value pairs
function flattenObject(obj, prefix = '') {
  const result = {}
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey))
    } else if (typeof value === 'string') {
      result[newKey] = value
    }
  }
  
  return result
}

// Check if a value contains untranslated English terms
function findUntranslatedTerms(value, lang) {
  const issues = []
  
  for (const term of ENGLISH_TERMS) {
    // Check if the term appears in the value (case-insensitive for some checks)
    if (value.includes(term)) {
      // Check if it's not an allowed term
      const isAllowed = ALLOWED_ENGLISH.some(allowed => 
        term.toLowerCase().includes(allowed.toLowerCase()) ||
        allowed.toLowerCase().includes(term.toLowerCase())
      )
      
      if (!isAllowed) {
        issues.push(term)
      }
    }
  }
  
  return issues
}

// Main check function
function checkTranslations() {
  console.log('🔍 Translation Consistency Checker\n')
  console.log('=' .repeat(60))
  
  const locales = readLocaleFiles()
  const enFlat = flattenObject(locales.en)
  
  const results = {
    totalIssues: 0,
    byLanguage: {},
    byTerm: {}
  }
  
  // Check each non-English locale
  for (const [lang, data] of Object.entries(locales)) {
    if (lang === 'en') continue
    
    const flat = flattenObject(data)
    const langIssues = []
    
    for (const [key, value] of Object.entries(flat)) {
      const untranslated = findUntranslatedTerms(value, lang)
      
      if (untranslated.length > 0) {
        langIssues.push({
          key,
          value,
          untranslated,
          englishValue: enFlat[key] || 'N/A'
        })
        
        // Track by term
        for (const term of untranslated) {
          if (!results.byTerm[term]) {
            results.byTerm[term] = []
          }
          results.byTerm[term].push({ lang, key, value })
        }
      }
    }
    
    if (langIssues.length > 0) {
      results.byLanguage[lang] = langIssues
      results.totalIssues += langIssues.length
    }
  }
  
  // Print results by language
  console.log('\n📊 ISSUES BY LANGUAGE\n')
  
  for (const [lang, issues] of Object.entries(results.byLanguage)) {
    console.log(`\n🌐 ${lang.toUpperCase()} (${issues.length} issues)`)
    console.log('-'.repeat(50))
    
    for (const issue of issues) {
      console.log(`  Key: ${issue.key}`)
      console.log(`  Value: "${issue.value}"`)
      console.log(`  Untranslated: ${issue.untranslated.join(', ')}`)
      console.log('')
    }
  }
  
  // Print summary by term
  console.log('\n📋 SUMMARY BY TERM\n')
  console.log('=' .repeat(60))
  
  for (const [term, occurrences] of Object.entries(results.byTerm)) {
    console.log(`\n"${term}" - ${occurrences.length} occurrences:`)
    const langCounts = {}
    for (const occ of occurrences) {
      langCounts[occ.lang] = (langCounts[occ.lang] || 0) + 1
    }
    for (const [lang, count] of Object.entries(langCounts)) {
      console.log(`  - ${lang}: ${count} keys`)
    }
  }
  
  // Final summary
  console.log('\n' + '=' .repeat(60))
  console.log(`\n✅ TOTAL: ${results.totalIssues} untranslated terms found`)
  console.log(`   Languages with issues: ${Object.keys(results.byLanguage).length}`)
  console.log(`   Terms needing attention: ${Object.keys(results.byTerm).length}`)
  
  return results
}

// Generate fix suggestions
function generateFixSuggestions(results) {
  console.log('\n\n📝 SUGGESTED TRANSLATIONS\n')
  console.log('=' .repeat(60))
  
  const suggestions = {
    'AI Rewrite': {
      vi: 'Viết lại AI',
      ja: 'AIリライト',
      ko: 'AI 다시쓰기',
      'zh-CN': 'AI重写',
      es: 'Reescritura IA',
      fr: 'Réécriture IA',
      de: 'KI-Umschreiben',
      it: 'Riscrittura IA',
      pt: 'Reescrita IA',
      ru: 'ИИ-переписывание',
      ar: 'إعادة الكتابة بالذكاء الاصطناعي',
      hi: 'AI पुनर्लेखन',
      th: 'AI เขียนใหม่',
      id: 'Penulisan Ulang AI'
    },
    'AI Workspace': {
      vi: 'Không gian làm việc AI',
      ja: 'AIワークスペース',
      ko: 'AI 작업공간',
      'zh-CN': 'AI工作区',
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
    'Compatibility Score': {
      vi: 'Điểm tương thích',
      ja: '互換性スコア',
      ko: '호환성 점수',
      'zh-CN': '兼容性评分',
      es: 'Puntuación de compatibilidad',
      fr: 'Score de compatibilité',
      de: 'Kompatibilitätswert',
      it: 'Punteggio di compatibilità',
      pt: 'Pontuação de compatibilidade',
      ru: 'Оценка совместимости',
      ar: 'درجة التوافق',
      hi: 'संगतता स्कोर',
      th: 'คะแนนความเข้ากันได้',
      id: 'Skor Kompatibilitas'
    },
    'Deviations': {
      vi: 'Độ lệch',
      ja: '逸脱',
      ko: '편차',
      'zh-CN': '偏差',
      es: 'Desviaciones',
      fr: 'Écarts',
      de: 'Abweichungen',
      it: 'Deviazioni',
      pt: 'Desvios',
      ru: 'Отклонения',
      ar: 'الانحرافات',
      hi: 'विचलन',
      th: 'การเบี่ยงเบน',
      id: 'Penyimpangan'
    },
    'Statistics': {
      vi: 'Thống kê',
      ja: '統計',
      ko: '통계',
      'zh-CN': '统计',
      es: 'Estadísticas',
      fr: 'Statistiques',
      de: 'Statistiken',
      it: 'Statistiche',
      pt: 'Estatísticas',
      ru: 'Статистика',
      ar: 'الإحصائيات',
      hi: 'सांख्यिकी',
      th: 'สถิติ',
      id: 'Statistik'
    },
    'Humanization': {
      vi: 'Nhân hóa',
      ja: '人間化',
      ko: '인간화',
      'zh-CN': '人性化',
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
    }
  }
  
  for (const [term, translations] of Object.entries(suggestions)) {
    console.log(`\n"${term}":`)
    for (const [lang, translation] of Object.entries(translations)) {
      console.log(`  ${lang}: "${translation}"`)
    }
  }
}

// Run the checker
const results = checkTranslations()
generateFixSuggestions(results)

// Export for use in other scripts
export { checkTranslations, ENGLISH_TERMS }
