/**
 * Script to add SEO keywords to all language files
 * Run: node scripts/add-seo-keywords.js
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const LOCALES_DIR = path.resolve(__dirname, '../src/i18n/locales')

// Keywords for each page in each language
const KEYWORDS = {
  en: {
    home: "AI detection, AI content detector, ChatGPT detector, GPT detector, humanize AI text, AI humanizer, AI writing assistant, voice profile, AI content checker, bypass AI detection, undetectable AI, AI text converter",
    aiDetection: "AI detector, AI content detector, ChatGPT detector, GPT-4 detector, AI checker, detect AI writing, AI detection tool, AI text detector, check AI content",
    humanization: "humanize AI text, AI humanizer, bypass AI detection, undetectable AI, AI to human text, humanize ChatGPT, make AI text human, AI content humanizer",
    voiceProfile: "voice profile, writing style AI, personal writing assistant, AI voice clone, writing tone analyzer, unique writing style, AI content in your voice",
    aiWorkspace: "AI chat, AI writing assistant, AI workspace, chat with AI, AI content generator, personalized AI, voice profile AI, AI writing tool",
    rewrite: "AI rewrite, text rewriter, paraphrase tool, reword text, AI paraphraser, content rewriter, text transformer, rewrite in my voice",
    statistics: "writing statistics, text analyzer, word count tool, readability score, vocabulary analyzer, writing metrics, text analysis tool",
    deviations: "style checker, writing consistency, tone analyzer, style inconsistency finder, writing style checker, voice consistency",
    compatibilityScore: "writing style match, compatibility score, style analyzer, voice match checker, writing tone match",
    featuresPage: "AI writing tools, AI detection features, content humanization, voice profile creator, AI workspace, writing assistant features"
  },
  vi: {
    home: "phát hiện AI, kiểm tra nội dung AI, phát hiện ChatGPT, nhân hóa văn bản AI, công cụ viết AI, hồ sơ giọng văn, vượt qua phát hiện AI, chuyển đổi văn bản AI",
    aiDetection: "phát hiện AI, kiểm tra AI, phát hiện ChatGPT, phát hiện GPT-4, công cụ phát hiện AI, kiểm tra văn bản AI, phát hiện nội dung AI",
    humanization: "nhân hóa văn bản AI, vượt qua phát hiện AI, chuyển AI sang văn bản người, nhân hóa ChatGPT, công cụ nhân hóa AI",
    voiceProfile: "hồ sơ giọng văn, phong cách viết AI, trợ lý viết cá nhân, phân tích giọng văn, phong cách viết độc đáo",
    aiWorkspace: "chat AI, trợ lý viết AI, không gian làm việc AI, tạo nội dung AI, AI cá nhân hóa, công cụ viết AI",
    rewrite: "viết lại AI, công cụ paraphrase, viết lại văn bản, AI paraphraser, viết lại nội dung, chuyển đổi văn bản",
    statistics: "thống kê viết, phân tích văn bản, đếm từ, điểm dễ đọc, phân tích từ vựng, số liệu viết",
    deviations: "kiểm tra phong cách, nhất quán viết, phân tích giọng văn, kiểm tra phong cách viết",
    compatibilityScore: "điểm tương thích phong cách, phân tích phong cách, kiểm tra giọng văn phù hợp",
    featuresPage: "công cụ viết AI, tính năng phát hiện AI, nhân hóa nội dung, tạo hồ sơ giọng văn, không gian làm việc AI"
  },
  ja: {
    home: "AI検出, AIコンテンツ検出, ChatGPT検出, AIテキスト人間化, AIライティングアシスタント, ボイスプロファイル, AI検出バイパス, AIテキスト変換",
    aiDetection: "AI検出, AI検出ツール, ChatGPT検出, GPT-4検出, AIチェッカー, AIライティング検出, AIテキスト検出",
    humanization: "AIテキスト人間化, AI検出バイパス, AIを人間テキストに, ChatGPT人間化, AIコンテンツ人間化",
    voiceProfile: "ボイスプロファイル, ライティングスタイルAI, パーソナルライティングアシスタント, トーン分析, ユニークなライティングスタイル",
    aiWorkspace: "AIチャット, AIライティングアシスタント, AIワークスペース, AIコンテンツ生成, パーソナライズドAI",
    rewrite: "AIリライト, テキストリライター, パラフレーズツール, テキスト変換, AIパラフレーザー",
    statistics: "ライティング統計, テキスト分析, 単語カウント, 読みやすさスコア, 語彙分析",
    deviations: "スタイルチェッカー, ライティング一貫性, トーン分析, スタイル不一致検出",
    compatibilityScore: "ライティングスタイルマッチ, 互換性スコア, スタイル分析, ボイスマッチチェッカー",
    featuresPage: "AIライティングツール, AI検出機能, コンテンツ人間化, ボイスプロファイル作成, AIワークスペース"
  },
  ko: {
    home: "AI 감지, AI 콘텐츠 감지기, ChatGPT 감지기, AI 텍스트 인간화, AI 글쓰기 도우미, 보이스 프로필, AI 감지 우회, AI 텍스트 변환기",
    aiDetection: "AI 감지기, AI 콘텐츠 감지기, ChatGPT 감지기, GPT-4 감지기, AI 체커, AI 글쓰기 감지, AI 텍스트 감지기",
    humanization: "AI 텍스트 인간화, AI 감지 우회, AI를 인간 텍스트로, ChatGPT 인간화, AI 콘텐츠 인간화기",
    voiceProfile: "보이스 프로필, 글쓰기 스타일 AI, 개인 글쓰기 도우미, 톤 분석기, 독특한 글쓰기 스타일",
    aiWorkspace: "AI 채팅, AI 글쓰기 도우미, AI 워크스페이스, AI 콘텐츠 생성기, 개인화된 AI",
    rewrite: "AI 다시쓰기, 텍스트 리라이터, 패러프레이즈 도구, 텍스트 변환기, AI 패러프레이저",
    statistics: "글쓰기 통계, 텍스트 분석기, 단어 수 도구, 가독성 점수, 어휘 분석기",
    deviations: "스타일 체커, 글쓰기 일관성, 톤 분석기, 스타일 불일치 찾기",
    compatibilityScore: "글쓰기 스타일 매치, 호환성 점수, 스타일 분석기, 보이스 매치 체커",
    featuresPage: "AI 글쓰기 도구, AI 감지 기능, 콘텐츠 인간화, 보이스 프로필 생성기, AI 워크스페이스"
  },
  "zh-CN": {
    home: "AI检测, AI内容检测器, ChatGPT检测器, AI文本人性化, AI写作助手, 声音档案, 绕过AI检测, AI文本转换器",
    aiDetection: "AI检测器, AI内容检测器, ChatGPT检测器, GPT-4检测器, AI检查器, 检测AI写作, AI文本检测器",
    humanization: "人性化AI文本, AI人性化工具, 绕过AI检测, AI转人类文本, 人性化ChatGPT, AI内容人性化",
    voiceProfile: "声音档案, 写作风格AI, 个人写作助手, 语调分析器, 独特写作风格",
    aiWorkspace: "AI聊天, AI写作助手, AI工作区, AI内容生成器, 个性化AI",
    rewrite: "AI重写, 文本重写器, 改写工具, 文本转换器, AI改写器",
    statistics: "写作统计, 文本分析器, 字数统计工具, 可读性评分, 词汇分析器",
    deviations: "风格检查器, 写作一致性, 语调分析器, 风格不一致查找器",
    compatibilityScore: "写作风格匹配, 兼容性评分, 风格分析器, 声音匹配检查器",
    featuresPage: "AI写作工具, AI检测功能, 内容人性化, 声音档案创建器, AI工作区"
  },
  es: {
    home: "detección de IA, detector de contenido IA, detector de ChatGPT, humanizar texto IA, asistente de escritura IA, perfil de voz, evadir detección IA, convertidor de texto IA",
    aiDetection: "detector de IA, detector de contenido IA, detector de ChatGPT, detector de GPT-4, verificador de IA, detectar escritura IA",
    humanization: "humanizar texto IA, humanizador de IA, evadir detección IA, IA indetectable, convertir IA a texto humano, humanizar ChatGPT",
    voiceProfile: "perfil de voz, estilo de escritura IA, asistente de escritura personal, analizador de tono, estilo de escritura único",
    aiWorkspace: "chat IA, asistente de escritura IA, espacio de trabajo IA, generador de contenido IA, IA personalizada",
    rewrite: "reescribir IA, reescritor de texto, herramienta de paráfrasis, transformador de texto, parafraseador IA",
    statistics: "estadísticas de escritura, analizador de texto, contador de palabras, puntuación de legibilidad, analizador de vocabulario",
    deviations: "verificador de estilo, consistencia de escritura, analizador de tono, buscador de inconsistencias",
    compatibilityScore: "coincidencia de estilo de escritura, puntuación de compatibilidad, analizador de estilo",
    featuresPage: "herramientas de escritura IA, funciones de detección IA, humanización de contenido, creador de perfil de voz"
  },
  fr: {
    home: "détection IA, détecteur de contenu IA, détecteur ChatGPT, humaniser texte IA, assistant d'écriture IA, profil vocal, contourner détection IA, convertisseur texte IA",
    aiDetection: "détecteur IA, détecteur de contenu IA, détecteur ChatGPT, détecteur GPT-4, vérificateur IA, détecter écriture IA",
    humanization: "humaniser texte IA, humaniseur IA, contourner détection IA, IA indétectable, convertir IA en texte humain, humaniser ChatGPT",
    voiceProfile: "profil vocal, style d'écriture IA, assistant d'écriture personnel, analyseur de ton, style d'écriture unique",
    aiWorkspace: "chat IA, assistant d'écriture IA, espace de travail IA, générateur de contenu IA, IA personnalisée",
    rewrite: "réécrire IA, réécriveur de texte, outil de paraphrase, transformateur de texte, paraphraseur IA",
    statistics: "statistiques d'écriture, analyseur de texte, compteur de mots, score de lisibilité, analyseur de vocabulaire",
    deviations: "vérificateur de style, cohérence d'écriture, analyseur de ton, détecteur d'incohérences",
    compatibilityScore: "correspondance de style d'écriture, score de compatibilité, analyseur de style",
    featuresPage: "outils d'écriture IA, fonctionnalités de détection IA, humanisation de contenu, créateur de profil vocal"
  },
  de: {
    home: "KI-Erkennung, KI-Inhaltsdetektor, ChatGPT-Detektor, KI-Text humanisieren, KI-Schreibassistent, Stimmprofil, KI-Erkennung umgehen, KI-Textkonverter",
    aiDetection: "KI-Detektor, KI-Inhaltsdetektor, ChatGPT-Detektor, GPT-4-Detektor, KI-Prüfer, KI-Schreiben erkennen",
    humanization: "KI-Text humanisieren, KI-Humanisierer, KI-Erkennung umgehen, unerkennbare KI, KI zu menschlichem Text, ChatGPT humanisieren",
    voiceProfile: "Stimmprofil, Schreibstil-KI, persönlicher Schreibassistent, Tonanalysator, einzigartiger Schreibstil",
    aiWorkspace: "KI-Chat, KI-Schreibassistent, KI-Arbeitsbereich, KI-Inhaltsgenerator, personalisierte KI",
    rewrite: "KI-Umschreiben, Textumschreiber, Paraphrasierungstool, Texttransformator, KI-Paraphrasierer",
    statistics: "Schreibstatistiken, Textanalysator, Wortzähler, Lesbarkeitsbewertung, Vokabelanalysator",
    deviations: "Stilprüfer, Schreibkonsistenz, Tonanalysator, Stilinkonsistenz-Finder",
    compatibilityScore: "Schreibstil-Übereinstimmung, Kompatibilitätsbewertung, Stilanalysator",
    featuresPage: "KI-Schreibwerkzeuge, KI-Erkennungsfunktionen, Inhaltshumanisierung, Stimmprofil-Ersteller"
  },
  it: {
    home: "rilevamento IA, rilevatore contenuti IA, rilevatore ChatGPT, umanizzare testo IA, assistente scrittura IA, profilo vocale, aggirare rilevamento IA, convertitore testo IA",
    aiDetection: "rilevatore IA, rilevatore contenuti IA, rilevatore ChatGPT, rilevatore GPT-4, verificatore IA, rilevare scrittura IA",
    humanization: "umanizzare testo IA, umanizzatore IA, aggirare rilevamento IA, IA non rilevabile, convertire IA in testo umano, umanizzare ChatGPT",
    voiceProfile: "profilo vocale, stile scrittura IA, assistente scrittura personale, analizzatore tono, stile scrittura unico",
    aiWorkspace: "chat IA, assistente scrittura IA, spazio lavoro IA, generatore contenuti IA, IA personalizzata",
    rewrite: "riscrivere IA, riscrittore testo, strumento parafrasi, trasformatore testo, parafrasatore IA",
    statistics: "statistiche scrittura, analizzatore testo, contatore parole, punteggio leggibilità, analizzatore vocabolario",
    deviations: "verificatore stile, coerenza scrittura, analizzatore tono, rilevatore incoerenze",
    compatibilityScore: "corrispondenza stile scrittura, punteggio compatibilità, analizzatore stile",
    featuresPage: "strumenti scrittura IA, funzionalità rilevamento IA, umanizzazione contenuti, creatore profilo vocale"
  },
  pt: {
    home: "detecção de IA, detector de conteúdo IA, detector de ChatGPT, humanizar texto IA, assistente de escrita IA, perfil de voz, burlar detecção IA, conversor de texto IA",
    aiDetection: "detector de IA, detector de conteúdo IA, detector de ChatGPT, detector de GPT-4, verificador de IA, detectar escrita IA",
    humanization: "humanizar texto IA, humanizador de IA, burlar detecção IA, IA indetectável, converter IA para texto humano, humanizar ChatGPT",
    voiceProfile: "perfil de voz, estilo de escrita IA, assistente de escrita pessoal, analisador de tom, estilo de escrita único",
    aiWorkspace: "chat IA, assistente de escrita IA, espaço de trabalho IA, gerador de conteúdo IA, IA personalizada",
    rewrite: "reescrever IA, reescritor de texto, ferramenta de paráfrase, transformador de texto, parafraseador IA",
    statistics: "estatísticas de escrita, analisador de texto, contador de palavras, pontuação de legibilidade, analisador de vocabulário",
    deviations: "verificador de estilo, consistência de escrita, analisador de tom, localizador de inconsistências",
    compatibilityScore: "correspondência de estilo de escrita, pontuação de compatibilidade, analisador de estilo",
    featuresPage: "ferramentas de escrita IA, recursos de detecção IA, humanização de conteúdo, criador de perfil de voz"
  },
  ru: {
    home: "обнаружение ИИ, детектор контента ИИ, детектор ChatGPT, гуманизация текста ИИ, помощник по написанию ИИ, голосовой профиль, обход обнаружения ИИ, конвертер текста ИИ",
    aiDetection: "детектор ИИ, детектор контента ИИ, детектор ChatGPT, детектор GPT-4, проверка ИИ, обнаружение написания ИИ",
    humanization: "гуманизация текста ИИ, гуманизатор ИИ, обход обнаружения ИИ, необнаруживаемый ИИ, преобразование ИИ в человеческий текст",
    voiceProfile: "голосовой профиль, стиль письма ИИ, персональный помощник по написанию, анализатор тона, уникальный стиль письма",
    aiWorkspace: "чат ИИ, помощник по написанию ИИ, рабочее пространство ИИ, генератор контента ИИ, персонализированный ИИ",
    rewrite: "переписать ИИ, переписчик текста, инструмент перефразирования, преобразователь текста, перефразировщик ИИ",
    statistics: "статистика письма, анализатор текста, счетчик слов, оценка читаемости, анализатор словарного запаса",
    deviations: "проверка стиля, согласованность письма, анализатор тона, поиск несоответствий стиля",
    compatibilityScore: "соответствие стиля письма, оценка совместимости, анализатор стиля",
    featuresPage: "инструменты написания ИИ, функции обнаружения ИИ, гуманизация контента, создатель голосового профиля"
  },
  ar: {
    home: "كشف الذكاء الاصطناعي, كاشف محتوى AI, كاشف ChatGPT, أنسنة نص AI, مساعد كتابة AI, ملف صوتي, تجاوز كشف AI, محول نص AI",
    aiDetection: "كاشف AI, كاشف محتوى AI, كاشف ChatGPT, كاشف GPT-4, فاحص AI, كشف كتابة AI",
    humanization: "أنسنة نص AI, محول AI للنص البشري, تجاوز كشف AI, AI غير قابل للكشف, أنسنة ChatGPT",
    voiceProfile: "ملف صوتي, أسلوب كتابة AI, مساعد كتابة شخصي, محلل نبرة, أسلوب كتابة فريد",
    aiWorkspace: "دردشة AI, مساعد كتابة AI, مساحة عمل AI, مولد محتوى AI, AI مخصص",
    rewrite: "إعادة كتابة AI, معيد كتابة النص, أداة إعادة الصياغة, محول النص, معيد صياغة AI",
    statistics: "إحصائيات الكتابة, محلل النص, عداد الكلمات, درجة سهولة القراءة, محلل المفردات",
    deviations: "فاحص الأسلوب, اتساق الكتابة, محلل النبرة, كاشف عدم الاتساق",
    compatibilityScore: "تطابق أسلوب الكتابة, درجة التوافق, محلل الأسلوب",
    featuresPage: "أدوات كتابة AI, ميزات كشف AI, أنسنة المحتوى, منشئ الملف الصوتي"
  },
  hi: {
    home: "AI पहचान, AI सामग्री डिटेक्टर, ChatGPT डिटेक्टर, AI टेक्स्ट मानवीकरण, AI लेखन सहायक, वॉइस प्रोफाइल, AI पहचान बायपास, AI टेक्स्ट कनवर्टर",
    aiDetection: "AI डिटेक्टर, AI सामग्री डिटेक्टर, ChatGPT डिटेक्टर, GPT-4 डिटेक्टर, AI चेकर, AI लेखन पहचान",
    humanization: "AI टेक्स्ट मानवीकरण, AI ह्यूमनाइज़र, AI पहचान बायपास, अनडिटेक्टेबल AI, ChatGPT मानवीकरण",
    voiceProfile: "वॉइस प्रोफाइल, लेखन शैली AI, व्यक्तिगत लेखन सहायक, टोन विश्लेषक, अद्वितीय लेखन शैली",
    aiWorkspace: "AI चैट, AI लेखन सहायक, AI वर्कस्पेस, AI सामग्री जनरेटर, व्यक्तिगत AI",
    rewrite: "AI रीराइट, टेक्स्ट रीराइटर, पैराफ्रेज़ टूल, टेक्स्ट ट्रांसफॉर्मर, AI पैराफ्रेज़र",
    statistics: "लेखन सांख्यिकी, टेक्स्ट विश्लेषक, शब्द गणना, पठनीयता स्कोर, शब्दावली विश्लेषक",
    deviations: "शैली चेकर, लेखन संगति, टोन विश्लेषक, शैली असंगति खोजक",
    compatibilityScore: "लेखन शैली मिलान, संगतता स्कोर, शैली विश्लेषक",
    featuresPage: "AI लेखन उपकरण, AI पहचान सुविधाएं, सामग्री मानवीकरण, वॉइस प्रोफाइल निर्माता"
  },
  th: {
    home: "ตรวจจับ AI, ตัวตรวจจับเนื้อหา AI, ตัวตรวจจับ ChatGPT, ทำให้ข้อความ AI เป็นมนุษย์, ผู้ช่วยเขียน AI, โปรไฟล์เสียง, หลีกเลี่ยงการตรวจจับ AI, ตัวแปลงข้อความ AI",
    aiDetection: "ตัวตรวจจับ AI, ตัวตรวจจับเนื้อหา AI, ตัวตรวจจับ ChatGPT, ตัวตรวจจับ GPT-4, ตัวตรวจสอบ AI, ตรวจจับการเขียน AI",
    humanization: "ทำให้ข้อความ AI เป็นมนุษย์, ตัวทำให้เป็นมนุษย์ AI, หลีกเลี่ยงการตรวจจับ AI, AI ที่ตรวจไม่พบ, ทำให้ ChatGPT เป็นมนุษย์",
    voiceProfile: "โปรไฟล์เสียง, สไตล์การเขียน AI, ผู้ช่วยเขียนส่วนตัว, ตัววิเคราะห์โทน, สไตล์การเขียนที่เป็นเอกลักษณ์",
    aiWorkspace: "แชท AI, ผู้ช่วยเขียน AI, พื้นที่ทำงาน AI, ตัวสร้างเนื้อหา AI, AI ส่วนบุคคล",
    rewrite: "เขียนใหม่ AI, ตัวเขียนข้อความใหม่, เครื่องมือถอดความ, ตัวแปลงข้อความ, ตัวถอดความ AI",
    statistics: "สถิติการเขียน, ตัววิเคราะห์ข้อความ, ตัวนับคำ, คะแนนความสามารถในการอ่าน, ตัววิเคราะห์คำศัพท์",
    deviations: "ตัวตรวจสอบสไตล์, ความสอดคล้องในการเขียน, ตัววิเคราะห์โทน, ตัวค้นหาความไม่สอดคล้อง",
    compatibilityScore: "การจับคู่สไตล์การเขียน, คะแนนความเข้ากันได้, ตัววิเคราะห์สไตล์",
    featuresPage: "เครื่องมือเขียน AI, คุณสมบัติการตรวจจับ AI, การทำให้เนื้อหาเป็นมนุษย์, ตัวสร้างโปรไฟล์เสียง"
  },
  id: {
    home: "deteksi AI, detektor konten AI, detektor ChatGPT, humanisasi teks AI, asisten penulisan AI, profil suara, melewati deteksi AI, konverter teks AI",
    aiDetection: "detektor AI, detektor konten AI, detektor ChatGPT, detektor GPT-4, pemeriksa AI, mendeteksi tulisan AI",
    humanization: "humanisasi teks AI, humanizer AI, melewati deteksi AI, AI tidak terdeteksi, mengubah AI ke teks manusia, humanisasi ChatGPT",
    voiceProfile: "profil suara, gaya penulisan AI, asisten penulisan pribadi, penganalisis nada, gaya penulisan unik",
    aiWorkspace: "obrolan AI, asisten penulisan AI, ruang kerja AI, generator konten AI, AI yang dipersonalisasi",
    rewrite: "menulis ulang AI, penulis ulang teks, alat parafrase, pengubah teks, parafrase AI",
    statistics: "statistik penulisan, penganalisis teks, penghitung kata, skor keterbacaan, penganalisis kosakata",
    deviations: "pemeriksa gaya, konsistensi penulisan, penganalisis nada, pencari ketidakkonsistenan",
    compatibilityScore: "kecocokan gaya penulisan, skor kompatibilitas, penganalisis gaya",
    featuresPage: "alat penulisan AI, fitur deteksi AI, humanisasi konten, pembuat profil suara"
  }
}

// Mapping from page path to translation key
const PAGE_KEY_MAP = {
  'home': 'home',
  'aiDetection': 'aiDetection',
  'humanization': 'humanization',
  'voiceProfile': 'voiceProfile',
  'aiWorkspace': 'aiWorkspace',
  'rewrite': 'rewrite',
  'statistics': 'statistics',
  'deviations': 'deviations',
  'compatibilityScore': 'compatibilityScore',
  'featuresPage': 'featuresPage'
}

function addKeywordsToFile(lang) {
  const filePath = path.join(LOCALES_DIR, `${lang}.json`)
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    let data = JSON.parse(content)
    const langKeywords = KEYWORDS[lang] || KEYWORDS.en
    
    // Add keywords to each page's meta section
    for (const [pageKey, keywords] of Object.entries(langKeywords)) {
      if (data[pageKey] && data[pageKey].meta) {
        data[pageKey].meta.keywords = keywords
        console.log(`  ✅ Added keywords to ${pageKey}.meta`)
      }
    }
    
    // Write back
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
    console.log(`✅ Updated ${lang}.json\n`)
    return true
  } catch (error) {
    console.error(`❌ Error processing ${lang}.json:`, error.message)
    return false
  }
}

function main() {
  console.log('🚀 Adding SEO keywords to all language files...\n')
  
  const languages = Object.keys(KEYWORDS)
  let successCount = 0
  
  for (const lang of languages) {
    console.log(`Processing ${lang}...`)
    if (addKeywordsToFile(lang)) {
      successCount++
    }
  }
  
  console.log('='.repeat(50))
  console.log(`🎉 Complete! Updated ${successCount}/${languages.length} files`)
  console.log('='.repeat(50))
}

main()
