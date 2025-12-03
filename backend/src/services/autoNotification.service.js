/**
 * Auto Notification Service
 * Automatically sends notifications for important user events
 * 
 * Events:
 * - First login (welcome + free credits info)
 * - Purchase completed (credits added)
 * - Subscription created/renewed
 * - Low credits warning
 * - Profile created
 * 
 * Supported Languages: en, vi, zh, ja, ko, fr, de, es, pt, it, ru, ar, th, id, ms
 */

const { db } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

// Notification templates with full i18n support (15 languages)
const NOTIFICATION_TEMPLATES = {
  // Welcome notification for first login
  WELCOME: {
    type: 'announcement',
    priority: 'high',
    translations: {
      en: {
        title: 'Welcome to Graphos AI Studio!',
        message: 'You have received {credits} free credits to get started. Explore our AI analysis features!',
        cta: 'Get Started'
      },
      vi: {
        title: 'Chào mừng đến với Graphos AI Studio!',
        message: 'Bạn đã nhận được {credits} credits miễn phí để bắt đầu. Khám phá các tính năng phân tích AI của chúng tôi!',
        cta: 'Bắt đầu'
      },
      zh: {
        title: '欢迎使用 Graphos AI Studio！',
        message: '您已获得 {credits} 免费积分。立即探索我们的 AI 分析功能！',
        cta: '开始使用'
      },
      ja: {
        title: 'Graphos AI Studio へようこそ！',
        message: '{credits} 無料クレジットを獲得しました。AI分析機能をお試しください！',
        cta: '始める'
      },
      ko: {
        title: 'Graphos AI Studio에 오신 것을 환영합니다!',
        message: '{credits} 무료 크레딧을 받으셨습니다. AI 분석 기능을 탐색해 보세요!',
        cta: '시작하기'
      },
      fr: {
        title: 'Bienvenue sur Graphos AI Studio !',
        message: 'Vous avez reçu {credits} crédits gratuits pour commencer. Explorez nos fonctionnalités d\'analyse IA !',
        cta: 'Commencer'
      },
      de: {
        title: 'Willkommen bei Graphos AI Studio!',
        message: 'Sie haben {credits} kostenlose Credits erhalten. Entdecken Sie unsere KI-Analysefunktionen!',
        cta: 'Loslegen'
      },
      es: {
        title: '¡Bienvenido a Graphos AI Studio!',
        message: 'Has recibido {credits} créditos gratis para comenzar. ¡Explora nuestras funciones de análisis de IA!',
        cta: 'Comenzar'
      },
      pt: {
        title: 'Bem-vindo ao Graphos AI Studio!',
        message: 'Você recebeu {credits} créditos grátis para começar. Explore nossos recursos de análise de IA!',
        cta: 'Começar'
      },
      it: {
        title: 'Benvenuto su Graphos AI Studio!',
        message: 'Hai ricevuto {credits} crediti gratuiti per iniziare. Esplora le nostre funzionalità di analisi IA!',
        cta: 'Inizia'
      },
      ru: {
        title: 'Добро пожаловать в Graphos AI Studio!',
        message: 'Вы получили {credits} бесплатных кредитов для начала. Изучите наши функции анализа ИИ!',
        cta: 'Начать'
      },
      ar: {
        title: 'مرحباً بك في Graphos AI Studio!',
        message: 'لقد حصلت على {credits} رصيد مجاني للبدء. استكشف ميزات تحليل الذكاء الاصطناعي!',
        cta: 'ابدأ الآن'
      },
      th: {
        title: 'ยินดีต้อนรับสู่ Graphos AI Studio!',
        message: 'คุณได้รับ {credits} เครดิตฟรีเพื่อเริ่มต้น สำรวจฟีเจอร์วิเคราะห์ AI ของเรา!',
        cta: 'เริ่มต้น'
      },
      id: {
        title: 'Selamat datang di Graphos AI Studio!',
        message: 'Anda telah menerima {credits} kredit gratis untuk memulai. Jelajahi fitur analisis AI kami!',
        cta: 'Mulai'
      },
      ms: {
        title: 'Selamat datang ke Graphos AI Studio!',
        message: 'Anda telah menerima {credits} kredit percuma untuk bermula. Terokai ciri analisis AI kami!',
        cta: 'Mula'
      }
    },
    ctaAction: { type: 'view', action: 'aistudio-editor' }
  },

  // Purchase completed
  PURCHASE_COMPLETED: {
    type: 'success',
    priority: 'high',
    translations: {
      en: {
        title: 'Payment Successful!',
        message: 'You purchased {packageName} and received {credits} credits. Current balance: {balance} credits.',
        cta: 'View History'
      },
      vi: {
        title: 'Thanh toán thành công!',
        message: 'Bạn đã mua {packageName} và nhận được {credits} credits. Số dư hiện tại: {balance} credits.',
        cta: 'Xem lịch sử'
      },
      zh: {
        title: '支付成功！',
        message: '您购买了 {packageName} 并获得 {credits} 积分。当前余额：{balance} 积分。',
        cta: '查看历史'
      },
      ja: {
        title: '支払い完了！',
        message: '{packageName} を購入し、{credits} クレジットを獲得しました。現在の残高：{balance} クレジット。',
        cta: '履歴を見る'
      },
      ko: {
        title: '결제 완료!',
        message: '{packageName}을(를) 구매하고 {credits} 크레딧을 받았습니다. 현재 잔액: {balance} 크레딧.',
        cta: '내역 보기'
      },
      fr: {
        title: 'Paiement réussi !',
        message: 'Vous avez acheté {packageName} et reçu {credits} crédits. Solde actuel : {balance} crédits.',
        cta: 'Voir l\'historique'
      },
      de: {
        title: 'Zahlung erfolgreich!',
        message: 'Sie haben {packageName} gekauft und {credits} Credits erhalten. Aktueller Kontostand: {balance} Credits.',
        cta: 'Verlauf anzeigen'
      },
      es: {
        title: '¡Pago exitoso!',
        message: 'Compraste {packageName} y recibiste {credits} créditos. Saldo actual: {balance} créditos.',
        cta: 'Ver historial'
      },
      pt: {
        title: 'Pagamento bem-sucedido!',
        message: 'Você comprou {packageName} e recebeu {credits} créditos. Saldo atual: {balance} créditos.',
        cta: 'Ver histórico'
      },
      it: {
        title: 'Pagamento riuscito!',
        message: 'Hai acquistato {packageName} e ricevuto {credits} crediti. Saldo attuale: {balance} crediti.',
        cta: 'Vedi cronologia'
      },
      ru: {
        title: 'Оплата успешна!',
        message: 'Вы приобрели {packageName} и получили {credits} кредитов. Текущий баланс: {balance} кредитов.',
        cta: 'Посмотреть историю'
      },
      ar: {
        title: 'تم الدفع بنجاح!',
        message: 'لقد اشتريت {packageName} وحصلت على {credits} رصيد. الرصيد الحالي: {balance} رصيد.',
        cta: 'عرض السجل'
      },
      th: {
        title: 'ชำระเงินสำเร็จ!',
        message: 'คุณซื้อ {packageName} และได้รับ {credits} เครดิต ยอดคงเหลือ: {balance} เครดิต',
        cta: 'ดูประวัติ'
      },
      id: {
        title: 'Pembayaran Berhasil!',
        message: 'Anda membeli {packageName} dan menerima {credits} kredit. Saldo saat ini: {balance} kredit.',
        cta: 'Lihat Riwayat'
      },
      ms: {
        title: 'Pembayaran Berjaya!',
        message: 'Anda membeli {packageName} dan menerima {credits} kredit. Baki semasa: {balance} kredit.',
        cta: 'Lihat Sejarah'
      }
    },
    ctaAction: { type: 'view', action: 'settings' }
  },

  // Low credits warning
  LOW_CREDITS: {
    type: 'warning',
    priority: 'medium',
    translations: {
      en: {
        title: 'Low Credits',
        message: 'You only have {credits} credits left. Top up to continue using our services.',
        cta: 'Buy Credits'
      },
      vi: {
        title: 'Credits sắp hết',
        message: 'Bạn chỉ còn {credits} credits. Nạp thêm để tiếp tục sử dụng dịch vụ.',
        cta: 'Mua Credits'
      },
      zh: {
        title: '积分不足',
        message: '您只剩 {credits} 积分。请充值以继续使用我们的服务。',
        cta: '购买积分'
      },
      ja: {
        title: 'クレジット残高不足',
        message: '残り {credits} クレジットです。サービスを継続するにはチャージしてください。',
        cta: 'クレジット購入'
      },
      ko: {
        title: '크레딧 부족',
        message: '{credits} 크레딧만 남았습니다. 서비스를 계속 이용하려면 충전하세요.',
        cta: '크레딧 구매'
      },
      fr: {
        title: 'Crédits faibles',
        message: 'Il ne vous reste que {credits} crédits. Rechargez pour continuer à utiliser nos services.',
        cta: 'Acheter des crédits'
      },
      de: {
        title: 'Wenig Credits',
        message: 'Sie haben nur noch {credits} Credits. Laden Sie auf, um unsere Dienste weiter zu nutzen.',
        cta: 'Credits kaufen'
      },
      es: {
        title: 'Créditos bajos',
        message: 'Solo te quedan {credits} créditos. Recarga para seguir usando nuestros servicios.',
        cta: 'Comprar créditos'
      },
      pt: {
        title: 'Créditos baixos',
        message: 'Você só tem {credits} créditos restantes. Recarregue para continuar usando nossos serviços.',
        cta: 'Comprar créditos'
      },
      it: {
        title: 'Crediti in esaurimento',
        message: 'Ti restano solo {credits} crediti. Ricarica per continuare a usare i nostri servizi.',
        cta: 'Acquista crediti'
      },
      ru: {
        title: 'Мало кредитов',
        message: 'У вас осталось только {credits} кредитов. Пополните баланс, чтобы продолжить использование.',
        cta: 'Купить кредиты'
      },
      ar: {
        title: 'رصيد منخفض',
        message: 'لديك {credits} رصيد فقط. قم بالشحن لمواصلة استخدام خدماتنا.',
        cta: 'شراء رصيد'
      },
      th: {
        title: 'เครดิตเหลือน้อย',
        message: 'คุณเหลือเพียง {credits} เครดิต เติมเงินเพื่อใช้บริการต่อ',
        cta: 'ซื้อเครดิต'
      },
      id: {
        title: 'Kredit Rendah',
        message: 'Anda hanya memiliki {credits} kredit tersisa. Isi ulang untuk terus menggunakan layanan kami.',
        cta: 'Beli Kredit'
      },
      ms: {
        title: 'Kredit Rendah',
        message: 'Anda hanya mempunyai {credits} kredit sahaja. Tambah nilai untuk terus menggunakan perkhidmatan kami.',
        cta: 'Beli Kredit'
      }
    },
    ctaAction: { type: 'view', action: 'upgrade' }
  },

  // Profile created
  PROFILE_CREATED: {
    type: 'success',
    priority: 'medium',
    translations: {
      en: {
        title: 'Voice Profile Created!',
        message: 'Profile "{profileName}" has been created successfully. You can now use it for text analysis.',
        cta: 'Use Now'
      },
      vi: {
        title: 'Đã tạo hồ sơ giọng văn!',
        message: 'Hồ sơ "{profileName}" đã được tạo thành công. Bạn có thể sử dụng nó để phân tích văn bản.',
        cta: 'Sử dụng ngay'
      },
      zh: {
        title: '文风档案已创建！',
        message: '档案 "{profileName}" 已成功创建。您现在可以用它来分析文本。',
        cta: '立即使用'
      },
      ja: {
        title: 'ボイスプロファイル作成完了！',
        message: 'プロファイル「{profileName}」が正常に作成されました。テキスト分析に使用できます。',
        cta: '今すぐ使う'
      },
      ko: {
        title: '보이스 프로필 생성 완료!',
        message: '프로필 "{profileName}"이(가) 성공적으로 생성되었습니다. 이제 텍스트 분석에 사용할 수 있습니다.',
        cta: '지금 사용'
      },
      fr: {
        title: 'Profil vocal créé !',
        message: 'Le profil "{profileName}" a été créé avec succès. Vous pouvez maintenant l\'utiliser pour l\'analyse de texte.',
        cta: 'Utiliser maintenant'
      },
      de: {
        title: 'Stimmprofil erstellt!',
        message: 'Profil "{profileName}" wurde erfolgreich erstellt. Sie können es jetzt für die Textanalyse verwenden.',
        cta: 'Jetzt verwenden'
      },
      es: {
        title: '¡Perfil de voz creado!',
        message: 'El perfil "{profileName}" se ha creado correctamente. Ahora puedes usarlo para el análisis de texto.',
        cta: 'Usar ahora'
      },
      pt: {
        title: 'Perfil de voz criado!',
        message: 'O perfil "{profileName}" foi criado com sucesso. Agora você pode usá-lo para análise de texto.',
        cta: 'Usar agora'
      },
      it: {
        title: 'Profilo vocale creato!',
        message: 'Il profilo "{profileName}" è stato creato con successo. Ora puoi usarlo per l\'analisi del testo.',
        cta: 'Usa ora'
      },
      ru: {
        title: 'Голосовой профиль создан!',
        message: 'Профиль "{profileName}" успешно создан. Теперь вы можете использовать его для анализа текста.',
        cta: 'Использовать'
      },
      ar: {
        title: 'تم إنشاء ملف الصوت!',
        message: 'تم إنشاء الملف "{profileName}" بنجاح. يمكنك الآن استخدامه لتحليل النص.',
        cta: 'استخدم الآن'
      },
      th: {
        title: 'สร้างโปรไฟล์เสียงแล้ว!',
        message: 'โปรไฟล์ "{profileName}" ถูกสร้างเรียบร้อยแล้ว คุณสามารถใช้มันวิเคราะห์ข้อความได้',
        cta: 'ใช้เลย'
      },
      id: {
        title: 'Profil Suara Dibuat!',
        message: 'Profil "{profileName}" telah berhasil dibuat. Anda sekarang dapat menggunakannya untuk analisis teks.',
        cta: 'Gunakan Sekarang'
      },
      ms: {
        title: 'Profil Suara Dicipta!',
        message: 'Profil "{profileName}" telah berjaya dicipta. Anda kini boleh menggunakannya untuk analisis teks.',
        cta: 'Guna Sekarang'
      }
    },
    ctaAction: { type: 'view', action: 'aistudio-editor' }
  },

  // Credits expiring warning
  CREDITS_EXPIRING: {
    type: 'warning',
    priority: 'high',
    translations: {
      en: {
        title: 'Credits Expiring Soon',
        message: 'Your {credits} credits will expire in {days} days. Use them before they expire!',
        cta: 'Use Now'
      },
      vi: {
        title: 'Credits sắp hết hạn',
        message: '{credits} credits của bạn sẽ hết hạn sau {days} ngày. Hãy sử dụng trước khi hết hạn!',
        cta: 'Sử dụng ngay'
      },
      zh: {
        title: '积分即将过期',
        message: '您的 {credits} 积分将在 {days} 天后过期。请在过期前使用！',
        cta: '立即使用'
      },
      ja: {
        title: 'クレジット有効期限間近',
        message: '{credits} クレジットが {days} 日後に期限切れになります。期限前にご利用ください！',
        cta: '今すぐ使う'
      },
      ko: {
        title: '크레딧 만료 임박',
        message: '{credits} 크레딧이 {days}일 후에 만료됩니다. 만료 전에 사용하세요!',
        cta: '지금 사용'
      },
      fr: {
        title: 'Crédits bientôt expirés',
        message: 'Vos {credits} crédits expireront dans {days} jours. Utilisez-les avant qu\'ils n\'expirent !',
        cta: 'Utiliser maintenant'
      },
      de: {
        title: 'Credits laufen bald ab',
        message: 'Ihre {credits} Credits verfallen in {days} Tagen. Nutzen Sie sie, bevor sie ablaufen!',
        cta: 'Jetzt verwenden'
      },
      es: {
        title: 'Créditos por expirar',
        message: 'Tus {credits} créditos expirarán en {days} días. ¡Úsalos antes de que expiren!',
        cta: 'Usar ahora'
      },
      pt: {
        title: 'Créditos expirando em breve',
        message: 'Seus {credits} créditos expirarão em {days} dias. Use-os antes que expirem!',
        cta: 'Usar agora'
      },
      it: {
        title: 'Crediti in scadenza',
        message: 'I tuoi {credits} crediti scadranno tra {days} giorni. Usali prima che scadano!',
        cta: 'Usa ora'
      },
      ru: {
        title: 'Срок действия кредитов истекает',
        message: 'Ваши {credits} кредитов истекут через {days} дней. Используйте их до истечения срока!',
        cta: 'Использовать'
      },
      ar: {
        title: 'الرصيد على وشك الانتهاء',
        message: 'سينتهي رصيدك البالغ {credits} خلال {days} أيام. استخدمه قبل انتهاء صلاحيته!',
        cta: 'استخدم الآن'
      },
      th: {
        title: 'เครดิตใกล้หมดอายุ',
        message: 'เครดิต {credits} ของคุณจะหมดอายุใน {days} วัน ใช้ก่อนหมดอายุ!',
        cta: 'ใช้เลย'
      },
      id: {
        title: 'Kredit Akan Kedaluwarsa',
        message: '{credits} kredit Anda akan kedaluwarsa dalam {days} hari. Gunakan sebelum kedaluwarsa!',
        cta: 'Gunakan Sekarang'
      },
      ms: {
        title: 'Kredit Akan Tamat Tempoh',
        message: '{credits} kredit anda akan tamat tempoh dalam {days} hari. Gunakan sebelum tamat tempoh!',
        cta: 'Guna Sekarang'
      }
    },
    ctaAction: { type: 'view', action: 'aistudio-editor' }
  },

  // New feature announcement
  NEW_FEATURE: {
    type: 'announcement',
    priority: 'medium',
    translations: {
      en: {
        title: 'New Feature!',
        message: '{featureName}: {description}',
        cta: 'Explore'
      },
      vi: {
        title: 'Tính năng mới!',
        message: '{featureName}: {description}',
        cta: 'Khám phá'
      },
      zh: {
        title: '新功能！',
        message: '{featureName}：{description}',
        cta: '探索'
      },
      ja: {
        title: '新機能！',
        message: '{featureName}：{description}',
        cta: '探索する'
      },
      ko: {
        title: '새로운 기능!',
        message: '{featureName}: {description}',
        cta: '탐색하기'
      },
      fr: {
        title: 'Nouvelle fonctionnalité !',
        message: '{featureName} : {description}',
        cta: 'Explorer'
      },
      de: {
        title: 'Neue Funktion!',
        message: '{featureName}: {description}',
        cta: 'Entdecken'
      },
      es: {
        title: '¡Nueva función!',
        message: '{featureName}: {description}',
        cta: 'Explorar'
      },
      pt: {
        title: 'Novo recurso!',
        message: '{featureName}: {description}',
        cta: 'Explorar'
      },
      it: {
        title: 'Nuova funzionalità!',
        message: '{featureName}: {description}',
        cta: 'Esplora'
      },
      ru: {
        title: 'Новая функция!',
        message: '{featureName}: {description}',
        cta: 'Изучить'
      },
      ar: {
        title: 'ميزة جديدة!',
        message: '{featureName}: {description}',
        cta: 'استكشف'
      },
      th: {
        title: 'ฟีเจอร์ใหม่!',
        message: '{featureName}: {description}',
        cta: 'สำรวจ'
      },
      id: {
        title: 'Fitur Baru!',
        message: '{featureName}: {description}',
        cta: 'Jelajahi'
      },
      ms: {
        title: 'Ciri Baharu!',
        message: '{featureName}: {description}',
        cta: 'Terokai'
      }
    },
    ctaAction: { type: 'view', action: 'home' }
  }
};

/**
 * Replace placeholders in text with actual values
 */
function replacePlaceholders(text, data) {
  if (!text) return text;
  let result = text;
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return result;
}

/**
 * Create notification from template
 */
function createFromTemplate(templateKey, data = {}) {
  const template = NOTIFICATION_TEMPLATES[templateKey];
  if (!template) {
    throw new Error(`Unknown notification template: ${templateKey}`);
  }

  const notification = {
    type: template.type,
    priority: template.priority,
    translations: {},
    ctaAction: template.ctaAction
  };

  // Process translations with placeholders
  for (const [lang, content] of Object.entries(template.translations)) {
    notification.translations[lang] = {
      title: replacePlaceholders(content.title, data),
      message: replacePlaceholders(content.message, data),
      cta: content.cta
    };
  }

  return notification;
}

/**
 * Send notification to a specific user
 */
async function sendToUser(userId, notification, expiresInDays = 30) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expiresInDays * 24 * 60 * 60 * 1000);
  
  const userNotifId = uuidv4();
  
  const notificationData = {
    id: userNotifId,
    userId,
    notificationId: null, // Auto-generated, not from admin
    type: notification.type,
    priority: notification.priority,
    translations: notification.translations,
    ctaAction: notification.ctaAction || null,
    expiresAt,
    read: false,
    clicked: false,
    autoGenerated: true,
    createdAt: now
  };
  
  await db.collection('user_notifications').doc(userNotifId).set(notificationData);

  // Broadcast via SSE for real-time update
  try {
    const realtimeController = require('../controllers/realtime.controller');
    realtimeController.broadcastNotification(userId, notificationData);
    console.log(`[AUTO-NOTIF] Broadcasted to user ${userId}:`, notification.translations.vi?.title || notification.translations.en?.title);
  } catch (e) {
    console.log(`[AUTO-NOTIF] Saved to DB (no SSE):`, notification.translations.vi?.title || notification.translations.en?.title);
  }
  
  return userNotifId;
}


// ============================================================================
// PUBLIC API - Call these from other controllers
// ============================================================================

/**
 * Send welcome notification on first login
 */
async function sendWelcomeNotification(userId, freeCredits = 100) {
  try {
    // Check if user already received welcome notification
    const existingSnapshot = await db.collection('user_notifications')
      .where('userId', '==', userId)
      .where('autoGenerated', '==', true)
      .where('type', '==', 'announcement')
      .limit(1)
      .get();

    if (!existingSnapshot.empty) {
      console.log(`[AUTO-NOTIF] User ${userId} already received welcome notification`);
      return null;
    }

    const notification = createFromTemplate('WELCOME', { credits: freeCredits });
    return await sendToUser(userId, notification);
  } catch (error) {
    console.error('[AUTO-NOTIF] Send welcome notification error:', error);
    return null;
  }
}

/**
 * Send purchase completed notification
 */
async function sendPurchaseNotification(userId, packageName, creditsAdded, newBalance) {
  try {
    const notification = createFromTemplate('PURCHASE_COMPLETED', {
      packageName,
      credits: creditsAdded,
      balance: newBalance
    });
    return await sendToUser(userId, notification, 7); // Expires in 7 days
  } catch (error) {
    console.error('[AUTO-NOTIF] Send purchase notification error:', error);
    return null;
  }
}

/**
 * Send low credits warning
 */
async function sendLowCreditsWarning(userId, remainingCredits) {
  try {
    // Check if already sent recently (within 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const existingSnapshot = await db.collection('user_notifications')
      .where('userId', '==', userId)
      .where('type', '==', 'warning')
      .where('createdAt', '>', sevenDaysAgo)
      .limit(1)
      .get();

    if (!existingSnapshot.empty) {
      return null; // Already warned recently
    }

    const notification = createFromTemplate('LOW_CREDITS', { credits: remainingCredits });
    return await sendToUser(userId, notification, 14);
  } catch (error) {
    console.error('[AUTO-NOTIF] Send low credits warning error:', error);
    return null;
  }
}

/**
 * Send profile created notification
 */
async function sendProfileCreatedNotification(userId, profileName) {
  try {
    const notification = createFromTemplate('PROFILE_CREATED', { profileName });
    return await sendToUser(userId, notification, 7);
  } catch (error) {
    console.error('[AUTO-NOTIF] Send profile created notification error:', error);
    return null;
  }
}

/**
 * Send credits expiring warning
 */
async function sendCreditsExpiringWarning(userId, credits, daysUntilExpiry) {
  try {
    const notification = createFromTemplate('CREDITS_EXPIRING', { 
      credits, 
      days: daysUntilExpiry 
    });
    return await sendToUser(userId, notification, daysUntilExpiry);
  } catch (error) {
    console.error('[AUTO-NOTIF] Send credits expiring warning error:', error);
    return null;
  }
}

/**
 * Send new feature announcement to all users
 */
async function sendNewFeatureAnnouncement(featureName, description, targetView = 'home') {
  try {
    const notification = createFromTemplate('NEW_FEATURE', { featureName, description });
    notification.ctaAction = { type: 'view', action: targetView };

    // Get all users
    const usersSnapshot = await db.collection('users').get();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    // Batch create notifications
    const BATCH_SIZE = 450;
    const userIds = usersSnapshot.docs.map(doc => doc.id);

    for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
      const batch = db.batch();
      const batchUserIds = userIds.slice(i, i + BATCH_SIZE);

      batchUserIds.forEach(userId => {
        const userNotifId = uuidv4();
        const userNotifRef = db.collection('user_notifications').doc(userNotifId);

        batch.set(userNotifRef, {
          userId,
          notificationId: null,
          type: notification.type,
          priority: notification.priority,
          translations: notification.translations,
          ctaAction: notification.ctaAction,
          expiresAt,
          read: false,
          clicked: false,
          autoGenerated: true,
          createdAt: now
        });
      });

      await batch.commit();
    }

    console.log(`[AUTO-NOTIF] New feature announcement sent to ${userIds.length} users`);
    return userIds.length;
  } catch (error) {
    console.error('[AUTO-NOTIF] Send new feature announcement error:', error);
    return 0;
  }
}

module.exports = {
  sendWelcomeNotification,
  sendPurchaseNotification,
  sendLowCreditsWarning,
  sendProfileCreatedNotification,
  sendCreditsExpiringWarning,
  sendNewFeatureAnnouncement,
  NOTIFICATION_TEMPLATES,
  createFromTemplate,
  sendToUser
};
