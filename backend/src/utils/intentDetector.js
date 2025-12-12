/**
 * Intent Detector
 * 
 * Detects when users are asking about the application itself,
 * its features, models, or how to use it.
 * 
 * Supports 15 languages for keyword detection.
 */

const logger = require('./logger');

// ============================================
// KEYWORDS BY CATEGORY (Multi-language)
// ============================================

const INTENT_KEYWORDS = {
  // App-related keywords
  app: {
    en: ['graphos', 'app', 'application', 'this app', 'your app', 'the app', 'studio', 'extension', 'chrome extension'],
    vi: ['ứng dụng', 'phần mềm', 'app này', 'graphos', 'tiện ích', 'extension'],
    es: ['aplicación', 'app', 'extensión', 'graphos', 'esta aplicación'],
    fr: ['application', 'app', 'extension', 'graphos', 'cette application'],
    de: ['anwendung', 'app', 'erweiterung', 'graphos', 'diese app'],
    it: ['applicazione', 'app', 'estensione', 'graphos', 'questa app'],
    pt: ['aplicativo', 'aplicação', 'app', 'extensão', 'graphos'],
    ru: ['приложение', 'программа', 'расширение', 'graphos', 'это приложение'],
    ja: ['アプリ', 'アプリケーション', '拡張機能', 'graphos', 'このアプリ'],
    ko: ['앱', '애플리케이션', '확장 프로그램', 'graphos', '이 앱'],
    zh: ['应用', '应用程序', '扩展', 'graphos', '这个应用'],
    ar: ['تطبيق', 'برنامج', 'إضافة', 'graphos', 'هذا التطبيق'],
    hi: ['ऐप', 'एप्लिकेशन', 'एक्सटेंशन', 'graphos', 'यह ऐप'],
    th: ['แอป', 'แอปพลิเคชัน', 'ส่วนขยาย', 'graphos', 'แอปนี้'],
    id: ['aplikasi', 'app', 'ekstensi', 'graphos', 'aplikasi ini']
  },

  // Model-related keywords
  models: {
    en: ['model', 'models', 'velocity', 'hyper', 'zenith', 'which model', 'ai model', 'graphos velocity', 'graphos hyper', 'graphos zenith', 'best model', 'fastest model', 'choose model'],
    vi: ['mô hình', 'model', 'velocity', 'hyper', 'zenith', 'mô hình nào', 'chọn mô hình', 'mô hình tốt nhất', 'mô hình nhanh nhất'],
    es: ['modelo', 'modelos', 'velocity', 'hyper', 'zenith', 'qué modelo', 'mejor modelo'],
    fr: ['modèle', 'modèles', 'velocity', 'hyper', 'zenith', 'quel modèle', 'meilleur modèle'],
    de: ['modell', 'modelle', 'velocity', 'hyper', 'zenith', 'welches modell', 'bestes modell'],
    it: ['modello', 'modelli', 'velocity', 'hyper', 'zenith', 'quale modello', 'miglior modello'],
    pt: ['modelo', 'modelos', 'velocity', 'hyper', 'zenith', 'qual modelo', 'melhor modelo'],
    ru: ['модель', 'модели', 'velocity', 'hyper', 'zenith', 'какую модель', 'лучшая модель'],
    ja: ['モデル', 'velocity', 'hyper', 'zenith', 'どのモデル', '最適なモデル'],
    ko: ['모델', 'velocity', 'hyper', 'zenith', '어떤 모델', '최고의 모델'],
    zh: ['模型', 'velocity', 'hyper', 'zenith', '哪个模型', '最佳模型'],
    ar: ['نموذج', 'نماذج', 'velocity', 'hyper', 'zenith', 'أي نموذج', 'أفضل نموذج'],
    hi: ['मॉडल', 'velocity', 'hyper', 'zenith', 'कौन सा मॉडल', 'सबसे अच्छा मॉडल'],
    th: ['โมเดล', 'velocity', 'hyper', 'zenith', 'โมเดลไหน', 'โมเดลที่ดีที่สุด'],
    id: ['model', 'velocity', 'hyper', 'zenith', 'model mana', 'model terbaik']
  },

  // Voice Profile keywords
  voiceProfile: {
    en: ['voice profile', 'writing profile', 'style profile', 'my style', 'writing style', 'create profile', 'add samples', 'text samples', 'learn my style', 'sound like me', 'write like me', 'match my style', 'personal style'],
    vi: ['hồ sơ giọng nói', 'hồ sơ phong cách', 'phong cách viết', 'tạo hồ sơ', 'thêm mẫu', 'mẫu văn bản', 'học phong cách', 'viết giống tôi', 'phong cách của tôi'],
    es: ['perfil de voz', 'perfil de estilo', 'estilo de escritura', 'crear perfil', 'agregar muestras', 'mi estilo', 'escribir como yo'],
    fr: ['profil vocal', 'profil de style', 'style d\'écriture', 'créer profil', 'ajouter échantillons', 'mon style', 'écrire comme moi'],
    de: ['stimmprofil', 'stilprofil', 'schreibstil', 'profil erstellen', 'proben hinzufügen', 'mein stil', 'schreiben wie ich'],
    it: ['profilo vocale', 'profilo di stile', 'stile di scrittura', 'creare profilo', 'aggiungere campioni', 'mio stile', 'scrivere come me'],
    pt: ['perfil de voz', 'perfil de estilo', 'estilo de escrita', 'criar perfil', 'adicionar amostras', 'meu estilo', 'escrever como eu'],
    ru: ['голосовой профиль', 'профиль стиля', 'стиль письма', 'создать профиль', 'добавить образцы', 'мой стиль', 'писать как я'],
    ja: ['ボイスプロファイル', 'スタイルプロファイル', '文体', 'プロファイル作成', 'サンプル追加', '私のスタイル', '私のように書く'],
    ko: ['보이스 프로필', '스타일 프로필', '글쓰기 스타일', '프로필 만들기', '샘플 추가', '내 스타일', '나처럼 쓰기'],
    zh: ['语音配置', '风格配置', '写作风格', '创建配置', '添加样本', '我的风格', '像我一样写'],
    ar: ['ملف الصوت', 'ملف الأسلوب', 'أسلوب الكتابة', 'إنشاء ملف', 'إضافة عينات', 'أسلوبي', 'اكتب مثلي'],
    hi: ['वॉयस प्रोफाइल', 'स्टाइल प्रोफाइल', 'लेखन शैली', 'प्रोफाइल बनाएं', 'नमूने जोड़ें', 'मेरी शैली', 'मेरी तरह लिखें'],
    th: ['โปรไฟล์เสียง', 'โปรไฟล์สไตล์', 'สไตล์การเขียน', 'สร้างโปรไฟล์', 'เพิ่มตัวอย่าง', 'สไตล์ของฉัน', 'เขียนเหมือนฉัน'],
    id: ['profil suara', 'profil gaya', 'gaya penulisan', 'buat profil', 'tambah sampel', 'gaya saya', 'tulis seperti saya']
  },

  // Humanization keywords
  humanization: {
    en: ['humanize', 'humanization', 'anti-ai', 'anti ai', 'ai detection', 'avoid detection', 'undetectable', 'sound human', 'human-like', 'bypass ai', 'ai detector', 'make human', 'rewrite human', 'iterative humanize'],
    vi: ['nhân hóa', 'chống ai', 'phát hiện ai', 'tránh phát hiện', 'không bị phát hiện', 'giống người', 'viết lại', 'qua mặt ai'],
    es: ['humanizar', 'anti-ia', 'detección ia', 'evitar detección', 'indetectable', 'sonar humano', 'reescribir'],
    fr: ['humaniser', 'anti-ia', 'détection ia', 'éviter détection', 'indétectable', 'sonner humain', 'réécrire'],
    de: ['humanisieren', 'anti-ki', 'ki-erkennung', 'erkennung vermeiden', 'unerkennbar', 'menschlich klingen', 'umschreiben'],
    it: ['umanizzare', 'anti-ia', 'rilevamento ia', 'evitare rilevamento', 'non rilevabile', 'suonare umano', 'riscrivere'],
    pt: ['humanizar', 'anti-ia', 'detecção ia', 'evitar detecção', 'indetectável', 'soar humano', 'reescrever'],
    ru: ['гуманизировать', 'анти-ии', 'обнаружение ии', 'избежать обнаружения', 'необнаруживаемый', 'звучать по-человечески', 'переписать'],
    ja: ['ヒューマナイズ', 'アンチAI', 'AI検出', '検出回避', '検出不可能', '人間らしく', '書き直し'],
    ko: ['휴머나이즈', '안티 AI', 'AI 감지', '감지 회피', '감지 불가', '인간처럼', '다시 쓰기'],
    zh: ['人性化', '反AI', 'AI检测', '避免检测', '无法检测', '像人类', '重写'],
    ar: ['أنسنة', 'مضاد للذكاء', 'كشف الذكاء', 'تجنب الكشف', 'غير قابل للكشف', 'يبدو بشري', 'إعادة كتابة'],
    hi: ['मानवीकरण', 'एंटी-एआई', 'एआई डिटेक्शन', 'डिटेक्शन से बचें', 'अनडिटेक्टेबल', 'मानव जैसा', 'फिर से लिखें'],
    th: ['ทำให้เป็นมนุษย์', 'ต่อต้าน AI', 'ตรวจจับ AI', 'หลีกเลี่ยงการตรวจจับ', 'ตรวจไม่พบ', 'เหมือนมนุษย์', 'เขียนใหม่'],
    id: ['humanisasi', 'anti-ai', 'deteksi ai', 'hindari deteksi', 'tidak terdeteksi', 'terdengar manusia', 'tulis ulang']
  },

  // Credits keywords
  credits: {
    en: ['credit', 'credits', 'buy credits', 'purchase credits', 'credit balance', 'how many credits', 'credit cost', 'out of credits', 'need credits', 'pricing', 'cost', 'payment'],
    vi: ['tín dụng', 'credit', 'mua credit', 'số dư', 'bao nhiêu credit', 'chi phí', 'hết credit', 'thanh toán', 'giá'],
    es: ['crédito', 'créditos', 'comprar créditos', 'saldo', 'cuántos créditos', 'costo', 'precio', 'pago'],
    fr: ['crédit', 'crédits', 'acheter crédits', 'solde', 'combien de crédits', 'coût', 'prix', 'paiement'],
    de: ['kredit', 'credits', 'credits kaufen', 'guthaben', 'wie viele credits', 'kosten', 'preis', 'zahlung'],
    it: ['credito', 'crediti', 'acquistare crediti', 'saldo', 'quanti crediti', 'costo', 'prezzo', 'pagamento'],
    pt: ['crédito', 'créditos', 'comprar créditos', 'saldo', 'quantos créditos', 'custo', 'preço', 'pagamento'],
    ru: ['кредит', 'кредиты', 'купить кредиты', 'баланс', 'сколько кредитов', 'стоимость', 'цена', 'оплата'],
    ja: ['クレジット', 'クレジット購入', '残高', 'クレジット数', 'コスト', '価格', '支払い'],
    ko: ['크레딧', '크레딧 구매', '잔액', '크레딧 수', '비용', '가격', '결제'],
    zh: ['积分', '信用', '购买积分', '余额', '多少积分', '成本', '价格', '付款'],
    ar: ['رصيد', 'أرصدة', 'شراء رصيد', 'الرصيد', 'كم رصيد', 'التكلفة', 'السعر', 'الدفع'],
    hi: ['क्रेडिट', 'क्रेडिट खरीदें', 'बैलेंस', 'कितने क्रेडिट', 'लागत', 'कीमत', 'भुगतान'],
    th: ['เครดิต', 'ซื้อเครดิต', 'ยอดคงเหลือ', 'เครดิตเท่าไหร่', 'ค่าใช้จ่าย', 'ราคา', 'การชำระเงิน'],
    id: ['kredit', 'beli kredit', 'saldo', 'berapa kredit', 'biaya', 'harga', 'pembayaran']
  },

  // Feature/How-to keywords
  features: {
    en: ['how to', 'how do i', 'how can i', 'what is', 'what are', 'feature', 'features', 'function', 'capability', 'can you', 'does it', 'is there', 'help me', 'guide', 'tutorial', 'explain', 'tell me about', 'what does'],
    vi: ['làm sao', 'làm thế nào', 'cách', 'là gì', 'tính năng', 'chức năng', 'có thể', 'giúp tôi', 'hướng dẫn', 'giải thích', 'cho tôi biết'],
    es: ['cómo', 'qué es', 'qué son', 'función', 'funciones', 'característica', 'puede', 'ayúdame', 'guía', 'explicar', 'dime'],
    fr: ['comment', 'qu\'est-ce que', 'fonction', 'fonctions', 'fonctionnalité', 'peut', 'aidez-moi', 'guide', 'expliquer', 'dis-moi'],
    de: ['wie', 'was ist', 'was sind', 'funktion', 'funktionen', 'merkmal', 'kann', 'hilf mir', 'anleitung', 'erklären', 'sag mir'],
    it: ['come', 'cos\'è', 'cosa sono', 'funzione', 'funzioni', 'caratteristica', 'può', 'aiutami', 'guida', 'spiegare', 'dimmi'],
    pt: ['como', 'o que é', 'o que são', 'função', 'funções', 'recurso', 'pode', 'me ajude', 'guia', 'explicar', 'me diga'],
    ru: ['как', 'что такое', 'что это', 'функция', 'функции', 'возможность', 'может', 'помоги', 'руководство', 'объясни', 'расскажи'],
    ja: ['どうやって', '何ですか', '機能', '特徴', 'できますか', '助けて', 'ガイド', '説明', '教えて'],
    ko: ['어떻게', '무엇입니까', '기능', '특징', '할 수 있나요', '도와주세요', '가이드', '설명', '알려주세요'],
    zh: ['怎么', '如何', '什么是', '功能', '特点', '可以', '帮我', '指南', '解释', '告诉我'],
    ar: ['كيف', 'ما هو', 'ما هي', 'ميزة', 'ميزات', 'وظيفة', 'يمكن', 'ساعدني', 'دليل', 'اشرح', 'أخبرني'],
    hi: ['कैसे', 'क्या है', 'फीचर', 'फंक्शन', 'क्या कर सकते', 'मदद करें', 'गाइड', 'समझाएं', 'बताएं'],
    th: ['ทำอย่างไร', 'คืออะไร', 'ฟีเจอร์', 'ฟังก์ชัน', 'สามารถ', 'ช่วยฉัน', 'คู่มือ', 'อธิบาย', 'บอกฉัน'],
    id: ['bagaimana', 'apa itu', 'fitur', 'fungsi', 'bisa', 'bantu saya', 'panduan', 'jelaskan', 'beritahu saya']
  },

  // Workspace keywords (chat interface)
  workspace: {
    en: ['workspace', 'ai workspace', 'chat', 'conversation', 'ask ai', 'talk to ai', 'ai chat', 'assistant'],
    vi: ['workspace', 'không gian làm việc', 'trò chuyện', 'hội thoại', 'hỏi ai', 'nói chuyện với ai', 'trợ lý'],
    es: ['espacio de trabajo', 'chat', 'conversación', 'preguntar ai', 'hablar con ai', 'asistente'],
    fr: ['espace de travail', 'chat', 'conversation', 'demander à l\'ia', 'parler à l\'ia', 'assistant'],
    de: ['arbeitsbereich', 'chat', 'gespräch', 'ki fragen', 'mit ki sprechen', 'assistent'],
    it: ['spazio di lavoro', 'chat', 'conversazione', 'chiedere all\'ia', 'parlare con l\'ia', 'assistente'],
    pt: ['espaço de trabalho', 'chat', 'conversa', 'perguntar à ia', 'falar com ia', 'assistente'],
    ru: ['рабочее пространство', 'чат', 'разговор', 'спросить ии', 'говорить с ии', 'ассистент'],
    ja: ['ワークスペース', 'チャット', '会話', 'AIに聞く', 'AIと話す', 'アシスタント'],
    ko: ['워크스페이스', '채팅', '대화', 'AI에게 물어보기', 'AI와 대화', '어시스턴트'],
    zh: ['工作区', '聊天', '对话', '问AI', '和AI说话', '助手'],
    ar: ['مساحة العمل', 'دردشة', 'محادثة', 'اسأل الذكاء', 'تحدث مع الذكاء', 'مساعد'],
    hi: ['वर्कस्पेस', 'चैट', 'बातचीत', 'AI से पूछें', 'AI से बात करें', 'सहायक'],
    th: ['พื้นที่ทำงาน', 'แชท', 'สนทนา', 'ถาม AI', 'คุยกับ AI', 'ผู้ช่วย'],
    id: ['ruang kerja', 'obrolan', 'percakapan', 'tanya ai', 'bicara dengan ai', 'asisten']
  },

  // AI Studio keywords (text editor)
  aiStudio: {
    en: ['ai studio', 'studio', 'text editor', 'editor', 'analyze text', 'detect ai', 'rewrite text', 'export document', 'import file'],
    vi: ['ai studio', 'studio', 'trình soạn thảo', 'phân tích văn bản', 'phát hiện ai', 'viết lại văn bản', 'xuất tài liệu', 'nhập file'],
    es: ['ai studio', 'studio', 'editor de texto', 'analizar texto', 'detectar ia', 'reescribir texto', 'exportar documento'],
    fr: ['ai studio', 'studio', 'éditeur de texte', 'analyser texte', 'détecter ia', 'réécrire texte', 'exporter document'],
    de: ['ai studio', 'studio', 'texteditor', 'text analysieren', 'ki erkennen', 'text umschreiben', 'dokument exportieren'],
    it: ['ai studio', 'studio', 'editor di testo', 'analizzare testo', 'rilevare ia', 'riscrivere testo', 'esportare documento'],
    pt: ['ai studio', 'studio', 'editor de texto', 'analisar texto', 'detectar ia', 'reescrever texto', 'exportar documento'],
    ru: ['ai studio', 'studio', 'текстовый редактор', 'анализировать текст', 'обнаружить ии', 'переписать текст', 'экспортировать документ'],
    ja: ['ai studio', 'studio', 'テキストエディタ', 'テキスト分析', 'AI検出', 'テキスト書き直し', 'ドキュメントエクスポート'],
    ko: ['ai studio', 'studio', '텍스트 편집기', '텍스트 분석', 'AI 감지', '텍스트 다시 쓰기', '문서 내보내기'],
    zh: ['ai studio', 'studio', '文本编辑器', '分析文本', '检测AI', '重写文本', '导出文档'],
    ar: ['ai studio', 'studio', 'محرر النص', 'تحليل النص', 'كشف الذكاء', 'إعادة كتابة النص', 'تصدير المستند'],
    hi: ['ai studio', 'studio', 'टेक्स्ट एडिटर', 'टेक्स्ट विश्लेषण', 'AI पहचान', 'टेक्स्ट फिर से लिखें', 'दस्तावेज़ निर्यात'],
    th: ['ai studio', 'studio', 'โปรแกรมแก้ไขข้อความ', 'วิเคราะห์ข้อความ', 'ตรวจจับ AI', 'เขียนข้อความใหม่', 'ส่งออกเอกสาร'],
    id: ['ai studio', 'studio', 'editor teks', 'analisis teks', 'deteksi ai', 'tulis ulang teks', 'ekspor dokumen']
  },

  // Authentication keywords
  auth: {
    en: ['sign in', 'sign up', 'login', 'log in', 'register', 'create account', 'forgot password', 'reset password', 'password', 'account', 'sign out', 'logout', 'log out', 'verification', 'verify email', 'otp', 'google sign in', 'google login', 'session', 'security', 'delete account'],
    vi: ['đăng nhập', 'đăng ký', 'tạo tài khoản', 'quên mật khẩu', 'đặt lại mật khẩu', 'mật khẩu', 'tài khoản', 'đăng xuất', 'xác minh', 'xác thực email', 'otp', 'đăng nhập google', 'phiên', 'bảo mật', 'xóa tài khoản'],
    es: ['iniciar sesión', 'registrarse', 'crear cuenta', 'olvidé contraseña', 'restablecer contraseña', 'contraseña', 'cuenta', 'cerrar sesión', 'verificación', 'verificar email', 'seguridad', 'eliminar cuenta'],
    fr: ['se connecter', 's\'inscrire', 'créer compte', 'mot de passe oublié', 'réinitialiser mot de passe', 'mot de passe', 'compte', 'se déconnecter', 'vérification', 'vérifier email', 'sécurité', 'supprimer compte'],
    de: ['anmelden', 'registrieren', 'konto erstellen', 'passwort vergessen', 'passwort zurücksetzen', 'passwort', 'konto', 'abmelden', 'verifizierung', 'email verifizieren', 'sicherheit', 'konto löschen'],
    it: ['accedi', 'registrati', 'crea account', 'password dimenticata', 'reimposta password', 'password', 'account', 'esci', 'verifica', 'verifica email', 'sicurezza', 'elimina account'],
    pt: ['entrar', 'registrar', 'criar conta', 'esqueci senha', 'redefinir senha', 'senha', 'conta', 'sair', 'verificação', 'verificar email', 'segurança', 'excluir conta'],
    ru: ['войти', 'зарегистрироваться', 'создать аккаунт', 'забыл пароль', 'сбросить пароль', 'пароль', 'аккаунт', 'выйти', 'верификация', 'подтвердить email', 'безопасность', 'удалить аккаунт'],
    ja: ['サインイン', 'ログイン', '登録', 'アカウント作成', 'パスワード忘れ', 'パスワードリセット', 'パスワード', 'アカウント', 'ログアウト', '認証', 'メール確認', 'セキュリティ', 'アカウント削除'],
    ko: ['로그인', '회원가입', '계정 만들기', '비밀번호 찾기', '비밀번호 재설정', '비밀번호', '계정', '로그아웃', '인증', '이메일 확인', '보안', '계정 삭제'],
    zh: ['登录', '注册', '创建账户', '忘记密码', '重置密码', '密码', '账户', '登出', '验证', '验证邮箱', '安全', '删除账户'],
    ar: ['تسجيل الدخول', 'التسجيل', 'إنشاء حساب', 'نسيت كلمة المرور', 'إعادة تعيين كلمة المرور', 'كلمة المرور', 'الحساب', 'تسجيل الخروج', 'التحقق', 'التحقق من البريد', 'الأمان', 'حذف الحساب'],
    hi: ['साइन इन', 'लॉगिन', 'रजिस्टर', 'अकाउंट बनाएं', 'पासवर्ड भूल गए', 'पासवर्ड रीसेट', 'पासवर्ड', 'अकाउंट', 'लॉगआउट', 'सत्यापन', 'ईमेल सत्यापित', 'सुरक्षा', 'अकाउंट हटाएं'],
    th: ['เข้าสู่ระบบ', 'ลงทะเบียน', 'สร้างบัญชี', 'ลืมรหัสผ่าน', 'รีเซ็ตรหัสผ่าน', 'รหัสผ่าน', 'บัญชี', 'ออกจากระบบ', 'การยืนยัน', 'ยืนยันอีเมล', 'ความปลอดภัย', 'ลบบัญชี'],
    id: ['masuk', 'daftar', 'buat akun', 'lupa kata sandi', 'reset kata sandi', 'kata sandi', 'akun', 'keluar', 'verifikasi', 'verifikasi email', 'keamanan', 'hapus akun']
  },

  // Support keywords - more specific to avoid false positives
  support: {
    en: ['contact support', 'email support', 'billing support', 'billing issue', 'request refund', 'refund request', 'payment failed', 'payment issue', 'report bug', 'send feedback', 'customer service', 'support@graphos', 'graphos support', 'app not working', 'credits not showing', 'missing credits'],
    vi: ['liên hệ hỗ trợ', 'email hỗ trợ', 'hỗ trợ thanh toán', 'yêu cầu hoàn tiền', 'thanh toán thất bại', 'báo lỗi', 'gửi phản hồi', 'dịch vụ khách hàng', 'ứng dụng không hoạt động', 'credit không hiển thị'],
    es: ['contactar soporte', 'soporte de facturación', 'solicitar reembolso', 'pago fallido', 'reportar error', 'enviar comentarios', 'servicio al cliente', 'app no funciona'],
    fr: ['contacter support', 'support facturation', 'demander remboursement', 'paiement échoué', 'signaler bug', 'envoyer commentaires', 'service client', 'app ne fonctionne pas'],
    de: ['support kontaktieren', 'abrechnungssupport', 'erstattung anfordern', 'zahlung fehlgeschlagen', 'fehler melden', 'feedback senden', 'kundendienst', 'app funktioniert nicht'],
    it: ['contattare supporto', 'supporto fatturazione', 'richiedere rimborso', 'pagamento fallito', 'segnalare bug', 'inviare feedback', 'servizio clienti', 'app non funziona'],
    pt: ['contatar suporte', 'suporte de faturamento', 'solicitar reembolso', 'pagamento falhou', 'reportar bug', 'enviar feedback', 'atendimento ao cliente', 'app não funciona'],
    ru: ['связаться с поддержкой', 'поддержка биллинга', 'запросить возврат', 'платеж не прошел', 'сообщить об ошибке', 'отправить отзыв', 'служба поддержки', 'приложение не работает'],
    ja: ['サポートに連絡', '請求サポート', '返金リクエスト', '支払い失敗', 'バグ報告', 'フィードバック送信', 'カスタマーサービス', 'アプリが動かない'],
    ko: ['지원 연락', '청구 지원', '환불 요청', '결제 실패', '버그 신고', '피드백 보내기', '고객 서비스', '앱이 작동 안함'],
    zh: ['联系支持', '账单支持', '申请退款', '支付失败', '报告错误', '发送反馈', '客户服务', '应用不工作'],
    ar: ['الاتصال بالدعم', 'دعم الفواتير', 'طلب استرداد', 'فشل الدفع', 'الإبلاغ عن خطأ', 'إرسال ملاحظات', 'خدمة العملاء', 'التطبيق لا يعمل'],
    hi: ['सपोर्ट से संपर्क', 'बिलिंग सपोर्ट', 'रिफंड अनुरोध', 'भुगतान विफल', 'बग रिपोर्ट', 'फीडबैक भेजें', 'ग्राहक सेवा', 'ऐप काम नहीं कर रहा'],
    th: ['ติดต่อฝ่ายสนับสนุน', 'สนับสนุนการเรียกเก็บเงิน', 'ขอคืนเงิน', 'การชำระเงินล้มเหลว', 'รายงานบัก', 'ส่งความคิดเห็น', 'บริการลูกค้า', 'แอปไม่ทำงาน'],
    id: ['hubungi dukungan', 'dukungan tagihan', 'minta pengembalian dana', 'pembayaran gagal', 'laporkan bug', 'kirim umpan balik', 'layanan pelanggan', 'aplikasi tidak berfungsi']
  }
};

// Question patterns that indicate app-related queries
const QUESTION_PATTERNS = {
  en: [
    /what (is|are|does|can) (this|the|graphos|your)/i,
    /how (do|can|to) (i|you|we) (use|create|make|get|enable|disable)/i,
    /tell me (about|how)/i,
    /explain (how|what|the)/i,
    /where (is|can|do)/i,
    /which (model|profile|feature|option)/i,
    /can (i|you|this|it|the app)/i,
    /does (this|it|the app|graphos)/i,
    /is there (a|any)/i,
    /help (me|with)/i
  ],
  vi: [
    /(là gì|là sao|thế nào|làm sao)/i,
    /cách (sử dụng|tạo|làm|dùng)/i,
    /giải thích/i,
    /(ở đâu|tìm ở đâu)/i,
    /(mô hình|profile|tính năng) nào/i,
    /có thể/i,
    /giúp (tôi|mình)/i
  ],
  // Add patterns for other languages as needed
};

// Keywords that are too generic and should only count if combined with other app keywords
const GENERIC_KEYWORDS = ['help', 'support', 'cost', 'payment', 'error', 'problem', 'issue', 'app', 'feature', 'features'];

// Patterns that indicate NON-app-related requests (creative writing, general questions)
const EXCLUSION_PATTERNS = [
  /^(write|create|compose|draft|generate)\s+(me\s+)?(a|an|the)?\s*(story|essay|poem|article|email|letter|code|function|script)/i,
  /^(translate|convert)\s+/i,
  /^(what is|what are|who is|who are|when|where|why)\s+(the|a|an)?\s*(?!graphos|this app|the app|voice profile|credit|model)/i,
  /^(tell me about|explain)\s+(?!graphos|this app|the app|voice profile|credit|model|humaniz|detect)/i,
  /^(how do i|how to|how can i)\s+(write|create|make|build|code|program|develop)\s+(?!profile|voice)/i,
  /capital of|president of|population of|history of|meaning of/i,
  // Note: Greetings are now handled separately as GREETING_PATTERNS
  /^(thanks|thank you|ok|okay|got it|understood)/i
];

// Greeting patterns - these should trigger app introduction
const GREETING_PATTERNS = {
  en: [/^(hello|hi|hey|good morning|good afternoon|good evening|greetings|howdy)[\s!.,?]*$/i],
  vi: [/^(xin chào|chào|chào bạn|hello|hi)[\s!.,?]*$/i],
  es: [/^(hola|buenos días|buenas tardes|buenas noches)[\s!.,?]*$/i],
  fr: [/^(bonjour|salut|bonsoir|coucou)[\s!.,?]*$/i],
  de: [/^(hallo|guten tag|guten morgen|guten abend)[\s!.,?]*$/i],
  it: [/^(ciao|buongiorno|buonasera|salve)[\s!.,?]*$/i],
  pt: [/^(olá|oi|bom dia|boa tarde|boa noite)[\s!.,?]*$/i],
  ru: [/^(привет|здравствуйте|добрый день|доброе утро)[\s!.,?]*$/i],
  ja: [/^(こんにちは|おはよう|こんばんは|やあ)[\s!.,?]*$/i],
  ko: [/^(안녕|안녕하세요|반갑습니다)[\s!.,?]*$/i],
  zh: [/^(你好|您好|早上好|下午好|晚上好)[\s!.,?]*$/i],
  ar: [/^(مرحبا|أهلا|صباح الخير|مساء الخير)[\s!.,?]*$/i],
  hi: [/^(नमस्ते|हैलो|नमस्कार)[\s!.,?]*$/i],
  th: [/^(สวัสดี|หวัดดี)[\s!.,?]*$/i],
  id: [/^(halo|hai|selamat pagi|selamat siang|selamat malam)[\s!.,?]*$/i]
};

// Simple/casual messages that should trigger app introduction
const CASUAL_PATTERNS = [
  /^(who are you|what are you|tell me about yourself|introduce yourself)[\s?!.,]*$/i,
  /^(bạn là ai|bạn là gì|giới thiệu về bạn)[\s?!.,]*$/i,
  /^(¿?quién eres|qué eres|preséntate)[\s?!.,]*$/i,
  /^(qui es-tu|qu'est-ce que tu es|présente-toi)[\s?!.,]*$/i,
  /^(wer bist du|was bist du|stell dich vor)[\s?!.,]*$/i
];

// Help prefix from frontend - indicates explicit app help request
const APP_HELP_PREFIX = '[APP_HELP]';

// Minimum meaningful message length (characters)
const MIN_MEANINGFUL_LENGTH = 3;

// Maximum length for gibberish check (longer messages are likely intentional)
const MAX_GIBBERISH_CHECK_LENGTH = 50;

/**
 * Check if message appears to be gibberish/nonsense
 * @param {string} message - User message
 * @returns {boolean}
 */
function isGibberish(message) {
  if (!message) return true;
  
  const trimmed = message.trim();
  
  // Too short to be meaningful
  if (trimmed.length < MIN_MEANINGFUL_LENGTH) {
    return true;
  }
  
  // Skip gibberish check for longer messages (likely intentional)
  if (trimmed.length > MAX_GIBBERISH_CHECK_LENGTH) {
    return false;
  }
  
  // Check for repeated characters (e.g., "aaaa", "!!!!", "asdfasdf")
  const repeatedPattern = /^(.)\1{2,}$/; // Same char repeated 3+ times
  if (repeatedPattern.test(trimmed)) {
    return true;
  }
  
  // Check for keyboard mashing patterns
  const keyboardMashPatterns = [
    /^[asdfghjkl]+$/i,      // Home row mashing
    /^[qwertyuiop]+$/i,     // Top row mashing
    /^[zxcvbnm]+$/i,        // Bottom row mashing
    /^[asdfjkl;]+$/i,       // Common mash pattern
    /^[!@#$%^&*()]+$/,      // Symbol mashing
    /^[0-9]+$/,             // Just numbers (unless very short)
    /^(.{1,3})\1+$/,        // Short pattern repeated (e.g., "abcabcabc")
  ];
  
  for (const pattern of keyboardMashPatterns) {
    if (pattern.test(trimmed) && trimmed.length >= 4) {
      return true;
    }
  }
  
  // Check for very low vowel ratio (gibberish often lacks vowels)
  const vowels = trimmed.match(/[aeiouàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹ]/gi) || [];
  const letters = trimmed.match(/[a-zA-Zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/gi) || [];
  
  // If mostly letters but very few vowels, likely gibberish
  if (letters.length >= 5 && vowels.length / letters.length < 0.1) {
    return true;
  }
  
  // Check for random character sequences (no real words)
  // Only for Latin-based text
  if (/^[a-zA-Z\s]+$/.test(trimmed) && trimmed.length >= 5) {
    // Check if it contains at least one common short word
    const commonWords = /\b(a|an|i|is|it|to|the|and|or|of|in|on|at|be|do|go|hi|ok|no|so|we|he|me|my|up|us|as|by|if)\b/i;
    const hasCommonWord = commonWords.test(trimmed);
    
    // If no common words and no spaces (single gibberish word)
    if (!hasCommonWord && !trimmed.includes(' ') && trimmed.length >= 6) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if message is a greeting
 * @param {string} message - User message
 * @returns {boolean}
 */
function isGreeting(message) {
  if (!message) return false;
  const trimmed = message.trim();
  
  // Check all language greeting patterns
  for (const patterns of Object.values(GREETING_PATTERNS)) {
    if (patterns.some(pattern => pattern.test(trimmed))) {
      return true;
    }
  }
  return false;
}

/**
 * Check if message is a casual/simple question about the AI
 * @param {string} message - User message
 * @returns {boolean}
 */
function isCasualQuestion(message) {
  if (!message) return false;
  return CASUAL_PATTERNS.some(pattern => pattern.test(message.trim()));
}

/**
 * Detect if message is asking about the application
 * @param {string} message - User message
 * @param {string} language - User's language code (optional)
 * @returns {Object} - { isAppRelated, topics, confidence }
 */
function detectAppIntent(message, language = null) {
  if (!message || typeof message !== 'string') {
    return { isAppRelated: false, topics: [], confidence: 0 };
  }

  // Check for explicit help prefix from frontend
  const hasHelpPrefix = message.startsWith(APP_HELP_PREFIX);
  const cleanMessage = hasHelpPrefix ? message.slice(APP_HELP_PREFIX.length).trim() : message;
  
  // If explicit help prefix, always treat as app-related
  // IMPORTANT: App help mode should bypass profile/humanization for accurate answers
  if (hasHelpPrefix) {
    logger.info(`[INTENT] Explicit app help request detected via prefix`);
    // Still detect topics for context injection
    const topicsResult = detectTopicsFromMessage(cleanMessage);
    return {
      isAppRelated: true,
      topics: topicsResult.topics.length > 0 ? topicsResult.topics : ['features'],
      confidence: 100,
      hasHelpPrefix: true,
      cleanMessage,
      // Flag to indicate this is a pure app help request - should bypass profile/humanization
      isAppHelpMode: true
    };
  }

  const lowerMessage = cleanMessage.toLowerCase().trim();
  
  // Check for greetings - should trigger app introduction
  if (isGreeting(cleanMessage)) {
    logger.info(`[INTENT] Greeting detected, will introduce Graphos AI`);
    return {
      isAppRelated: true,
      topics: ['greeting'],
      confidence: 100,
      isGreeting: true,
      isAppHelpMode: true // Bypass profile for consistent introduction
    };
  }
  
  // Check for casual questions about the AI
  if (isCasualQuestion(cleanMessage)) {
    logger.info(`[INTENT] Casual question about AI detected`);
    return {
      isAppRelated: true,
      topics: ['introduction'],
      confidence: 100,
      isCasualQuestion: true,
      isAppHelpMode: true
    };
  }
  
  // Check for gibberish/nonsense messages - respond with friendly suggestion
  if (isGibberish(cleanMessage)) {
    logger.info(`[INTENT] Gibberish/unclear message detected: "${cleanMessage.substring(0, 20)}..."`);
    return {
      isAppRelated: true,
      topics: ['unclear_input'],
      confidence: 100,
      isGibberish: true,
      isAppHelpMode: true // Bypass profile for consistent helpful response
    };
  }
  
  // Check exclusion patterns - if matches, likely NOT app-related
  const isExcluded = EXCLUSION_PATTERNS.some(pattern => pattern.test(message));
  if (isExcluded) {
    return { isAppRelated: false, topics: [], confidence: 0, excluded: true };
  }

  const detectedTopics = new Set();
  let matchCount = 0;
  let specificMatchCount = 0; // Count of non-generic keyword matches
  let totalKeywords = 0;

  // Check each category
  for (const [category, langKeywords] of Object.entries(INTENT_KEYWORDS)) {
    // Check all languages (user might mix languages)
    for (const [lang, keywords] of Object.entries(langKeywords)) {
      for (const keyword of keywords) {
        totalKeywords++;
        if (lowerMessage.includes(keyword.toLowerCase())) {
          detectedTopics.add(category);
          matchCount++;
          
          // Track if this is a specific (non-generic) keyword
          if (!GENERIC_KEYWORDS.includes(keyword.toLowerCase())) {
            specificMatchCount++;
          }
        }
      }
    }
  }

  // Check question patterns
  const patterns = QUESTION_PATTERNS.en.concat(QUESTION_PATTERNS.vi || []);
  const hasQuestionPattern = patterns.some(pattern => pattern.test(message));

  // Calculate confidence
  const topics = Array.from(detectedTopics);
  const hasAppTopic = topics.includes('app') || topics.includes('features');
  const hasSpecificTopic = topics.some(t => ['models', 'voiceProfile', 'humanization', 'credits', 'workspace', 'aiStudio', 'auth', 'support'].includes(t));
  
  let confidence = 0;
  
  if (matchCount > 0) {
    // Base confidence from keyword matches - weight specific matches more
    confidence = Math.min(specificMatchCount * 20 + (matchCount - specificMatchCount) * 5, 50);
    
    // Boost for specific topics (models, voiceProfile, etc.)
    if (hasSpecificTopic && specificMatchCount > 0) confidence += 30;
    
    // Boost for question patterns about the app
    if (hasQuestionPattern && specificMatchCount > 0) confidence += 15;
    
    // Boost for app-related context
    if (hasAppTopic && hasSpecificTopic) confidence += 10;
    
    // Penalty if only generic keywords matched
    if (specificMatchCount === 0 && matchCount > 0) {
      confidence = Math.min(confidence, 30); // Cap at 30 for generic-only matches
    }
    
    // Cap at 100
    confidence = Math.min(confidence, 100);
  }

  // Require higher confidence threshold (45) and at least one specific keyword match
  const isAppRelated = (confidence >= 45 && specificMatchCount > 0) || 
                       (hasSpecificTopic && hasQuestionPattern && specificMatchCount > 0);

  if (isAppRelated) {
    logger.info(`[INTENT] Detected app-related query: topics=${topics.join(',')}, confidence=${confidence}%, specificMatches=${specificMatchCount}`);
  }

  return {
    isAppRelated,
    topics,
    confidence,
    hasQuestionPattern,
    matchCount,
    specificMatchCount
  };
}

/**
 * Helper function to detect topics from message (used for explicit help requests)
 * @param {string} message - User message
 * @returns {Object} - { topics }
 */
function detectTopicsFromMessage(message) {
  if (!message || typeof message !== 'string') {
    return { topics: [] };
  }

  const lowerMessage = message.toLowerCase().trim();
  const detectedTopics = new Set();

  // Check each category
  for (const [category, langKeywords] of Object.entries(INTENT_KEYWORDS)) {
    for (const [lang, keywords] of Object.entries(langKeywords)) {
      for (const keyword of keywords) {
        if (lowerMessage.includes(keyword.toLowerCase())) {
          detectedTopics.add(category);
          break;
        }
      }
    }
  }

  return { topics: Array.from(detectedTopics) };
}

/**
 * Get the primary topic from detected topics
 * @param {Array} topics - Detected topics
 * @returns {string|null} - Primary topic
 */
function getPrimaryTopic(topics) {
  // Priority order - specific topics first, then general
  const priority = ['models', 'voiceProfile', 'humanization', 'credits', 'auth', 'support', 'aiStudio', 'workspace', 'features', 'app'];
  
  for (const topic of priority) {
    if (topics.includes(topic)) {
      return topic;
    }
  }
  
  return topics[0] || null;
}

/**
 * Map topic to context key
 * @param {string} topic - Topic name
 * @returns {string} - Context key for getTopicContext
 */
function mapTopicToContextKey(topic) {
  const mapping = {
    'greeting': 'greeting',
    'introduction': 'introduction',
    'unclear_input': 'unclear_input',
    'models': 'models',
    'voiceProfile': 'voice_profile',
    'humanization': 'humanization',
    'credits': 'credits',
    'workspace': 'workspace',
    'aiStudio': 'ai_studio',
    'auth': 'auth',
    'support': 'support',
    'features': null, // Use full context
    'app': null // Use full context
  };
  
  return mapping[topic] || null;
}

/**
 * Detect user's language from message
 * @param {string} message - User message
 * @returns {string} - Detected language code
 */
function detectLanguage(message) {
  if (!message) return 'en';
  
  // Simple language detection based on character sets and common words
  const languagePatterns = {
    vi: /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i,
    ja: /[\u3040-\u309F\u30A0-\u30FF]/,
    ko: /[\uAC00-\uD7AF\u1100-\u11FF]/,
    zh: /[\u4E00-\u9FFF]/,
    ar: /[\u0600-\u06FF]/,
    hi: /[\u0900-\u097F]/,
    th: /[\u0E00-\u0E7F]/,
    ru: /[\u0400-\u04FF]/,
    // European languages detected by common words
    es: /\b(qué|cómo|está|para|con|una|los|las|del)\b/i,
    fr: /\b(que|comment|est|pour|avec|une|les|des|dans)\b/i,
    de: /\b(wie|was|ist|für|mit|eine|der|die|das)\b/i,
    it: /\b(che|come|è|per|con|una|gli|dei|della)\b/i,
    pt: /\b(que|como|está|para|com|uma|dos|das|pela)\b/i,
    id: /\b(apa|bagaimana|adalah|untuk|dengan|yang|ini|itu)\b/i
  };

  for (const [lang, pattern] of Object.entries(languagePatterns)) {
    if (pattern.test(message)) {
      return lang;
    }
  }

  return 'en'; // Default to English
}

module.exports = {
  detectAppIntent,
  getPrimaryTopic,
  mapTopicToContextKey,
  detectLanguage,
  INTENT_KEYWORDS
};
