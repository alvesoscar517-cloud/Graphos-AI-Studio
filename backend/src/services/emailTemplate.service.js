/**
 * Email Template Service
 * Modern, minimalist email templates with black & white theme
 * Supports 15 languages (i18n)
 * 
 * Supported languages: en, vi, zh, ja, ko, fr, de, es, pt, it, ru, ar, th, id, ms
 */

const ICON_BASE_URL = process.env.ICON_BASE_URL || '';

// ============================================================================
// TRANSLATIONS (15 languages)
// ============================================================================
const translations = {
  en: {
    hi: 'Hi',
    bestRegards: 'Best regards',
    supportTeam: 'AI Content Authenticator Support Team',
    allRightsReserved: 'All rights reserved',
    automatedMessage: 'This is an automated message from AI Content Authenticator',
    supportReply: {
      title: "We've Responded to Your {type}",
      typeFeedback: 'Feedback',
      typeSupport: 'Support Request',
      thankYou: 'Thank you for reaching out. Our team has reviewed your request and provided a response below.',
      originalRequest: 'Your Original Request',
      ourResponse: 'Our Response',
      furtherQuestions: "If you have any further questions or need additional assistance, please don't hesitate to reply to this email. We're here to help!",
      footerText: 'This email was sent in response to your support ticket',
      preheader: "We've responded to your {type}"
    },
    newTicket: {
      title: 'New {type}',
      typeFeedback: 'Feedback',
      typeSupport: 'Support Request',
      from: 'From',
      date: 'Date',
      priority: 'Priority',
      category: 'Category',
      viewInAdmin: 'View in Admin Panel',
      footerText: 'This is an automated notification from AI Content Authenticator Support System',
      preheader: 'New ticket from {userName}'
    },
    backup: {
      title: 'Backup Completed',
      file: 'File',
      bucket: 'Bucket',
      statistics: 'Backup Statistics',
      docs: 'docs',
      download: 'Download Backup',
      publicUrlNote: 'Public URL - This link never expires. Save it to your personal Google Drive for safekeeping.',
      footerText: 'AI Content Authenticator - Automated Backup System',
      preheader: 'Backup completed: {fileName}'
    },
    otpVerification: {
      title: 'Verify Your Email',
      subtitle: 'Enter this code to complete your registration',
      greeting: 'Welcome to AI Content Authenticator!',
      instruction: 'Use the verification code below to complete your registration:',
      codeLabel: 'Your Verification Code',
      expiryNote: 'This code will expire in {minutes} minutes',
      ignoreNote: "If you didn't create an account, you can safely ignore this email.",
      footerText: 'This is an automated verification email',
      preheader: 'Your verification code: {code}'
    },
    passwordReset: {
      title: 'Reset Your Password',
      subtitle: 'Use this code to reset your password',
      greeting: 'Password Reset Request',
      instruction: 'We received a request to reset your password. Use the code below:',
      codeLabel: 'Your Reset Code',
      expiryNote: 'This code will expire in {minutes} minutes',
      ignoreNote: "If you didn't request a password reset, you can safely ignore this email.",
      securityNote: 'For security, this code can only be used once.',
      footerText: 'This is an automated password reset email',
      preheader: 'Your password reset code: {code}'
    }
  },

  vi: {
    hi: 'Xin chào',
    bestRegards: 'Trân trọng',
    supportTeam: 'Đội ngũ hỗ trợ AI Content Authenticator',
    allRightsReserved: 'Đã đăng ký bản quyền',
    automatedMessage: 'Đây là tin nhắn tự động từ AI Content Authenticator',
    supportReply: {
      title: 'Chúng tôi đã phản hồi {type} của bạn',
      typeFeedback: 'Góp ý',
      typeSupport: 'Yêu cầu hỗ trợ',
      thankYou: 'Cảm ơn bạn đã liên hệ. Đội ngũ của chúng tôi đã xem xét yêu cầu và cung cấp phản hồi bên dưới.',
      originalRequest: 'Yêu cầu ban đầu của bạn',
      ourResponse: 'Phản hồi của chúng tôi',
      furtherQuestions: 'Nếu bạn có thêm câu hỏi hoặc cần hỗ trợ thêm, đừng ngần ngại trả lời email này. Chúng tôi luôn sẵn sàng giúp đỡ!',
      footerText: 'Email này được gửi để phản hồi yêu cầu hỗ trợ của bạn',
      preheader: 'Chúng tôi đã phản hồi {type} của bạn'
    },
    newTicket: {
      title: '{type} mới',
      typeFeedback: 'Góp ý',
      typeSupport: 'Yêu cầu hỗ trợ',
      from: 'Từ',
      date: 'Ngày',
      priority: 'Độ ưu tiên',
      category: 'Danh mục',
      viewInAdmin: 'Xem trong Admin Panel',
      footerText: 'Đây là thông báo tự động từ hệ thống hỗ trợ AI Content Authenticator',
      preheader: 'Ticket mới từ {userName}'
    },
    backup: {
      title: 'Sao lưu hoàn tất',
      file: 'Tệp',
      bucket: 'Bucket',
      statistics: 'Thống kê sao lưu',
      docs: 'tài liệu',
      download: 'Tải xuống bản sao lưu',
      publicUrlNote: 'URL công khai - Liên kết này không bao giờ hết hạn. Lưu vào Google Drive cá nhân để bảo quản.',
      footerText: 'AI Content Authenticator - Hệ thống sao lưu tự động',
      preheader: 'Sao lưu hoàn tất: {fileName}'
    },
    otpVerification: {
      title: 'Xác thực Email của bạn',
      subtitle: 'Nhập mã này để hoàn tất đăng ký',
      greeting: 'Chào mừng đến với AI Content Authenticator!',
      instruction: 'Sử dụng mã xác thực bên dưới để hoàn tất đăng ký:',
      codeLabel: 'Mã xác thực của bạn',
      expiryNote: 'Mã này sẽ hết hạn sau {minutes} phút',
      ignoreNote: 'Nếu bạn không tạo tài khoản, bạn có thể bỏ qua email này.',
      footerText: 'Đây là email xác thực tự động',
      preheader: 'Mã xác thực của bạn: {code}'
    },
    passwordReset: {
      title: 'Đặt lại mật khẩu',
      subtitle: 'Sử dụng mã này để đặt lại mật khẩu',
      greeting: 'Yêu cầu đặt lại mật khẩu',
      instruction: 'Chúng tôi nhận được yêu cầu đặt lại mật khẩu của bạn. Sử dụng mã bên dưới:',
      codeLabel: 'Mã đặt lại của bạn',
      expiryNote: 'Mã này sẽ hết hạn sau {minutes} phút',
      ignoreNote: 'Nếu bạn không yêu cầu đặt lại mật khẩu, bạn có thể bỏ qua email này.',
      securityNote: 'Vì lý do bảo mật, mã này chỉ có thể sử dụng một lần.',
      footerText: 'Đây là email đặt lại mật khẩu tự động',
      preheader: 'Mã đặt lại mật khẩu của bạn: {code}'
    }
  },

  zh: {
    hi: '您好',
    bestRegards: '此致敬礼',
    supportTeam: 'AI Content Authenticator 支持团队',
    allRightsReserved: '版权所有',
    automatedMessage: '这是来自 AI Content Authenticator 的自动消息',
    supportReply: {
      title: '我们已回复您的{type}',
      typeFeedback: '反馈',
      typeSupport: '支持请求',
      thankYou: '感谢您的联系。我们的团队已审核您的请求并在下方提供了回复。',
      originalRequest: '您的原始请求',
      ourResponse: '我们的回复',
      furtherQuestions: '如果您有任何其他问题或需要进一步帮助，请随时回复此邮件。我们随时为您服务！',
      footerText: '此邮件是对您支持工单的回复',
      preheader: '我们已回复您的{type}'
    },
    newTicket: {
      title: '新{type}',
      typeFeedback: '反馈',
      typeSupport: '支持请求',
      from: '来自',
      date: '日期',
      priority: '优先级',
      category: '类别',
      viewInAdmin: '在管理面板中查看',
      footerText: '这是来自 AI Content Authenticator 支持系统的自动通知',
      preheader: '来自 {userName} 的新工单'
    },
    backup: {
      title: '备份完成',
      file: '文件',
      bucket: '存储桶',
      statistics: '备份统计',
      docs: '文档',
      download: '下载备份',
      publicUrlNote: '公共URL - 此链接永不过期。请保存到您的个人Google Drive以妥善保管。',
      footerText: 'AI Content Authenticator - 自动备份系统',
      preheader: '备份完成: {fileName}'
    }
  },

  ja: {
    hi: 'こんにちは',
    bestRegards: 'よろしくお願いいたします',
    supportTeam: 'AI Content Authenticator サポートチーム',
    allRightsReserved: '無断複写・転載を禁じます',
    automatedMessage: 'これは AI Content Authenticator からの自動メッセージです',
    supportReply: {
      title: '{type}に回答しました',
      typeFeedback: 'フィードバック',
      typeSupport: 'サポートリクエスト',
      thankYou: 'お問い合わせいただきありがとうございます。チームがリクエストを確認し、以下に回答を提供しました。',
      originalRequest: '元のリクエスト',
      ourResponse: '回答',
      furtherQuestions: 'ご質問やサポートが必要な場合は、このメールに返信してください。いつでもお手伝いします！',
      footerText: 'このメールはサポートチケットへの返信です',
      preheader: '{type}に回答しました'
    },
    newTicket: {
      title: '新しい{type}',
      typeFeedback: 'フィードバック',
      typeSupport: 'サポートリクエスト',
      from: '送信者',
      date: '日付',
      priority: '優先度',
      category: 'カテゴリ',
      viewInAdmin: '管理パネルで表示',
      footerText: 'AI Content Authenticator サポートシステムからの自動通知です',
      preheader: '{userName} からの新しいチケット'
    },
    backup: {
      title: 'バックアップ完了',
      file: 'ファイル',
      bucket: 'バケット',
      statistics: 'バックアップ統計',
      docs: 'ドキュメント',
      download: 'バックアップをダウンロード',
      publicUrlNote: '公開URL - このリンクは期限切れになりません。個人のGoogle Driveに保存してください。',
      footerText: 'AI Content Authenticator - 自動バックアップシステム',
      preheader: 'バックアップ完了: {fileName}'
    }
  },

  ko: {
    hi: '안녕하세요',
    bestRegards: '감사합니다',
    supportTeam: 'AI Content Authenticator 지원팀',
    allRightsReserved: '모든 권리 보유',
    automatedMessage: 'AI Content Authenticator의 자동 메시지입니다',
    supportReply: {
      title: '{type}에 답변했습니다',
      typeFeedback: '피드백',
      typeSupport: '지원 요청',
      thankYou: '연락해 주셔서 감사합니다. 저희 팀이 요청을 검토하고 아래에 답변을 제공했습니다.',
      originalRequest: '원래 요청',
      ourResponse: '답변',
      furtherQuestions: '추가 질문이 있거나 도움이 필요하시면 이 이메일에 답장해 주세요. 언제든지 도와드리겠습니다!',
      footerText: '이 이메일은 지원 티켓에 대한 답변입니다',
      preheader: '{type}에 답변했습니다'
    },
    newTicket: {
      title: '새 {type}',
      typeFeedback: '피드백',
      typeSupport: '지원 요청',
      from: '보낸 사람',
      date: '날짜',
      priority: '우선순위',
      category: '카테고리',
      viewInAdmin: '관리자 패널에서 보기',
      footerText: 'AI Content Authenticator 지원 시스템의 자동 알림입니다',
      preheader: '{userName}의 새 티켓'
    },
    backup: {
      title: '백업 완료',
      file: '파일',
      bucket: '버킷',
      statistics: '백업 통계',
      docs: '문서',
      download: '백업 다운로드',
      publicUrlNote: '공개 URL - 이 링크는 만료되지 않습니다. 개인 Google Drive에 저장하세요.',
      footerText: 'AI Content Authenticator - 자동 백업 시스템',
      preheader: '백업 완료: {fileName}'
    }
  },

  fr: {
    hi: 'Bonjour',
    bestRegards: 'Cordialement',
    supportTeam: "Équipe de support AI Content Authenticator",
    allRightsReserved: 'Tous droits réservés',
    automatedMessage: "Ceci est un message automatique d'AI Content Authenticator",
    supportReply: {
      title: 'Nous avons répondu à votre {type}',
      typeFeedback: 'commentaire',
      typeSupport: 'demande de support',
      thankYou: "Merci de nous avoir contactés. Notre équipe a examiné votre demande et vous a fourni une réponse ci-dessous.",
      originalRequest: 'Votre demande originale',
      ourResponse: 'Notre réponse',
      furtherQuestions: "Si vous avez d'autres questions ou besoin d'aide supplémentaire, n'hésitez pas à répondre à cet email. Nous sommes là pour vous aider !",
      footerText: 'Cet email a été envoyé en réponse à votre ticket de support',
      preheader: 'Nous avons répondu à votre {type}'
    },
    newTicket: {
      title: 'Nouveau {type}',
      typeFeedback: 'commentaire',
      typeSupport: 'demande de support',
      from: 'De',
      date: 'Date',
      priority: 'Priorité',
      category: 'Catégorie',
      viewInAdmin: "Voir dans le panneau d'administration",
      footerText: "Notification automatique du système de support AI Content Authenticator",
      preheader: 'Nouveau ticket de {userName}'
    },
    backup: {
      title: 'Sauvegarde terminée',
      file: 'Fichier',
      bucket: 'Bucket',
      statistics: 'Statistiques de sauvegarde',
      docs: 'documents',
      download: 'Télécharger la sauvegarde',
      publicUrlNote: "URL publique - Ce lien n'expire jamais. Enregistrez-le dans votre Google Drive personnel.",
      footerText: 'AI Content Authenticator - Système de sauvegarde automatique',
      preheader: 'Sauvegarde terminée: {fileName}'
    }
  },

  de: {
    hi: 'Hallo',
    bestRegards: 'Mit freundlichen Grüßen',
    supportTeam: 'AI Content Authenticator Support-Team',
    allRightsReserved: 'Alle Rechte vorbehalten',
    automatedMessage: 'Dies ist eine automatische Nachricht von AI Content Authenticator',
    supportReply: {
      title: 'Wir haben auf Ihre {type} geantwortet',
      typeFeedback: 'Rückmeldung',
      typeSupport: 'Support-Anfrage',
      thankYou: 'Vielen Dank für Ihre Kontaktaufnahme. Unser Team hat Ihre Anfrage geprüft und eine Antwort bereitgestellt.',
      originalRequest: 'Ihre ursprüngliche Anfrage',
      ourResponse: 'Unsere Antwort',
      furtherQuestions: 'Bei weiteren Fragen oder wenn Sie zusätzliche Hilfe benötigen, antworten Sie einfach auf diese E-Mail. Wir helfen Ihnen gerne!',
      footerText: 'Diese E-Mail wurde als Antwort auf Ihr Support-Ticket gesendet',
      preheader: 'Wir haben auf Ihre {type} geantwortet'
    },
    newTicket: {
      title: 'Neue {type}',
      typeFeedback: 'Rückmeldung',
      typeSupport: 'Support-Anfrage',
      from: 'Von',
      date: 'Datum',
      priority: 'Priorität',
      category: 'Kategorie',
      viewInAdmin: 'Im Admin-Panel anzeigen',
      footerText: 'Automatische Benachrichtigung vom AI Content Authenticator Support-System',
      preheader: 'Neues Ticket von {userName}'
    },
    backup: {
      title: 'Backup abgeschlossen',
      file: 'Datei',
      bucket: 'Bucket',
      statistics: 'Backup-Statistiken',
      docs: 'Dokumente',
      download: 'Backup herunterladen',
      publicUrlNote: 'Öffentliche URL - Dieser Link läuft nie ab. Speichern Sie ihn in Ihrem persönlichen Google Drive.',
      footerText: 'AI Content Authenticator - Automatisches Backup-System',
      preheader: 'Backup abgeschlossen: {fileName}'
    }
  },

  es: {
    hi: 'Hola',
    bestRegards: 'Saludos cordiales',
    supportTeam: 'Equipo de soporte de AI Content Authenticator',
    allRightsReserved: 'Todos los derechos reservados',
    automatedMessage: 'Este es un mensaje automático de AI Content Authenticator',
    supportReply: {
      title: 'Hemos respondido a su {type}',
      typeFeedback: 'comentario',
      typeSupport: 'solicitud de soporte',
      thankYou: 'Gracias por contactarnos. Nuestro equipo ha revisado su solicitud y le ha proporcionado una respuesta a continuación.',
      originalRequest: 'Su solicitud original',
      ourResponse: 'Nuestra respuesta',
      furtherQuestions: 'Si tiene más preguntas o necesita ayuda adicional, no dude en responder a este correo. ¡Estamos aquí para ayudarle!',
      footerText: 'Este correo fue enviado en respuesta a su ticket de soporte',
      preheader: 'Hemos respondido a su {type}'
    },
    newTicket: {
      title: 'Nuevo {type}',
      typeFeedback: 'comentario',
      typeSupport: 'solicitud de soporte',
      from: 'De',
      date: 'Fecha',
      priority: 'Prioridad',
      category: 'Categoría',
      viewInAdmin: 'Ver en el panel de administración',
      footerText: 'Notificación automática del sistema de soporte de AI Content Authenticator',
      preheader: 'Nuevo ticket de {userName}'
    },
    backup: {
      title: 'Copia de seguridad completada',
      file: 'Archivo',
      bucket: 'Bucket',
      statistics: 'Estadísticas de copia de seguridad',
      docs: 'documentos',
      download: 'Descargar copia de seguridad',
      publicUrlNote: 'URL pública - Este enlace nunca caduca. Guárdelo en su Google Drive personal.',
      footerText: 'AI Content Authenticator - Sistema de copia de seguridad automática',
      preheader: 'Copia de seguridad completada: {fileName}'
    }
  },

  pt: {
    hi: 'Olá',
    bestRegards: 'Atenciosamente',
    supportTeam: 'Equipe de suporte AI Content Authenticator',
    allRightsReserved: 'Todos os direitos reservados',
    automatedMessage: 'Esta é uma mensagem automática do AI Content Authenticator',
    supportReply: {
      title: 'Respondemos ao seu {type}',
      typeFeedback: 'feedback',
      typeSupport: 'pedido de suporte',
      thankYou: 'Obrigado por entrar em contato. Nossa equipe analisou sua solicitação e forneceu uma resposta abaixo.',
      originalRequest: 'Sua solicitação original',
      ourResponse: 'Nossa resposta',
      furtherQuestions: 'Se tiver mais perguntas ou precisar de ajuda adicional, não hesite em responder a este email. Estamos aqui para ajudar!',
      footerText: 'Este email foi enviado em resposta ao seu ticket de suporte',
      preheader: 'Respondemos ao seu {type}'
    },
    newTicket: {
      title: 'Novo {type}',
      typeFeedback: 'feedback',
      typeSupport: 'pedido de suporte',
      from: 'De',
      date: 'Data',
      priority: 'Prioridade',
      category: 'Categoria',
      viewInAdmin: 'Ver no painel de administração',
      footerText: 'Notificação automática do sistema de suporte AI Content Authenticator',
      preheader: 'Novo ticket de {userName}'
    },
    backup: {
      title: 'Backup concluído',
      file: 'Arquivo',
      bucket: 'Bucket',
      statistics: 'Estatísticas de backup',
      docs: 'documentos',
      download: 'Baixar backup',
      publicUrlNote: 'URL pública - Este link nunca expira. Salve-o no seu Google Drive pessoal.',
      footerText: 'AI Content Authenticator - Sistema de backup automático',
      preheader: 'Backup concluído: {fileName}'
    }
  },

  it: {
    hi: 'Ciao',
    bestRegards: 'Cordiali saluti',
    supportTeam: 'Team di supporto AI Content Authenticator',
    allRightsReserved: 'Tutti i diritti riservati',
    automatedMessage: 'Questo è un messaggio automatico da AI Content Authenticator',
    supportReply: {
      title: 'Abbiamo risposto al tuo {type}',
      typeFeedback: 'feedback',
      typeSupport: 'richiesta di supporto',
      thankYou: 'Grazie per averci contattato. Il nostro team ha esaminato la tua richiesta e ha fornito una risposta qui sotto.',
      originalRequest: 'La tua richiesta originale',
      ourResponse: 'La nostra risposta',
      furtherQuestions: 'Se hai altre domande o hai bisogno di ulteriore assistenza, non esitare a rispondere a questa email. Siamo qui per aiutarti!',
      footerText: 'Questa email è stata inviata in risposta al tuo ticket di supporto',
      preheader: 'Abbiamo risposto al tuo {type}'
    },
    newTicket: {
      title: 'Nuovo {type}',
      typeFeedback: 'feedback',
      typeSupport: 'richiesta di supporto',
      from: 'Da',
      date: 'Data',
      priority: 'Priorità',
      category: 'Categoria',
      viewInAdmin: 'Visualizza nel pannello di amministrazione',
      footerText: 'Notifica automatica dal sistema di supporto AI Content Authenticator',
      preheader: 'Nuovo ticket da {userName}'
    },
    backup: {
      title: 'Backup completato',
      file: 'File',
      bucket: 'Bucket',
      statistics: 'Statistiche backup',
      docs: 'documenti',
      download: 'Scarica backup',
      publicUrlNote: 'URL pubblico - Questo link non scade mai. Salvalo nel tuo Google Drive personale.',
      footerText: 'AI Content Authenticator - Sistema di backup automatico',
      preheader: 'Backup completato: {fileName}'
    }
  },

  ru: {
    hi: 'Здравствуйте',
    bestRegards: 'С уважением',
    supportTeam: 'Команда поддержки AI Content Authenticator',
    allRightsReserved: 'Все права защищены',
    automatedMessage: 'Это автоматическое сообщение от AI Content Authenticator',
    supportReply: {
      title: 'Мы ответили на ваш {type}',
      typeFeedback: 'отзыв',
      typeSupport: 'запрос в поддержку',
      thankYou: 'Спасибо за обращение. Наша команда рассмотрела ваш запрос и предоставила ответ ниже.',
      originalRequest: 'Ваш исходный запрос',
      ourResponse: 'Наш ответ',
      furtherQuestions: 'Если у вас есть дополнительные вопросы или нужна помощь, не стесняйтесь ответить на это письмо. Мы всегда готовы помочь!',
      footerText: 'Это письмо отправлено в ответ на ваш тикет поддержки',
      preheader: 'Мы ответили на ваш {type}'
    },
    newTicket: {
      title: 'Новый {type}',
      typeFeedback: 'отзыв',
      typeSupport: 'запрос в поддержку',
      from: 'От',
      date: 'Дата',
      priority: 'Приоритет',
      category: 'Категория',
      viewInAdmin: 'Просмотреть в панели администратора',
      footerText: 'Автоматическое уведомление от системы поддержки AI Content Authenticator',
      preheader: 'Новый тикет от {userName}'
    },
    backup: {
      title: 'Резервное копирование завершено',
      file: 'Файл',
      bucket: 'Хранилище',
      statistics: 'Статистика резервного копирования',
      docs: 'документов',
      download: 'Скачать резервную копию',
      publicUrlNote: 'Публичная ссылка - Эта ссылка никогда не истекает. Сохраните её в личном Google Drive.',
      footerText: 'AI Content Authenticator - Автоматическая система резервного копирования',
      preheader: 'Резервное копирование завершено: {fileName}'
    }
  },

  ar: {
    hi: 'مرحباً',
    bestRegards: 'مع أطيب التحيات',
    supportTeam: 'فريق دعم AI Content Authenticator',
    allRightsReserved: 'جميع الحقوق محفوظة',
    automatedMessage: 'هذه رسالة تلقائية من AI Content Authenticator',
    supportReply: {
      title: 'لقد قمنا بالرد على {type} الخاص بك',
      typeFeedback: 'ملاحظاتك',
      typeSupport: 'طلب الدعم',
      thankYou: 'شكراً لتواصلك معنا. قام فريقنا بمراجعة طلبك وقدم رداً أدناه.',
      originalRequest: 'طلبك الأصلي',
      ourResponse: 'ردنا',
      furtherQuestions: 'إذا كان لديك أي أسئلة إضافية أو تحتاج إلى مساعدة إضافية، لا تتردد في الرد على هذا البريد الإلكتروني. نحن هنا للمساعدة!',
      footerText: 'تم إرسال هذا البريد الإلكتروني رداً على تذكرة الدعم الخاصة بك',
      preheader: 'لقد قمنا بالرد على {type} الخاص بك'
    },
    newTicket: {
      title: '{type} جديد',
      typeFeedback: 'ملاحظات',
      typeSupport: 'طلب دعم',
      from: 'من',
      date: 'التاريخ',
      priority: 'الأولوية',
      category: 'الفئة',
      viewInAdmin: 'عرض في لوحة الإدارة',
      footerText: 'إشعار تلقائي من نظام دعم AI Content Authenticator',
      preheader: 'تذكرة جديدة من {userName}'
    },
    backup: {
      title: 'اكتمل النسخ الاحتياطي',
      file: 'ملف',
      bucket: 'الحاوية',
      statistics: 'إحصائيات النسخ الاحتياطي',
      docs: 'مستندات',
      download: 'تحميل النسخة الاحتياطية',
      publicUrlNote: 'رابط عام - هذا الرابط لا ينتهي أبداً. احفظه في Google Drive الشخصي.',
      footerText: 'AI Content Authenticator - نظام النسخ الاحتياطي التلقائي',
      preheader: 'اكتمل النسخ الاحتياطي: {fileName}'
    }
  },

  th: {
    hi: 'สวัสดี',
    bestRegards: 'ขอแสดงความนับถือ',
    supportTeam: 'ทีมสนับสนุน AI Content Authenticator',
    allRightsReserved: 'สงวนลิขสิทธิ์',
    automatedMessage: 'นี่คือข้อความอัตโนมัติจาก AI Content Authenticator',
    supportReply: {
      title: 'เราได้ตอบกลับ{type}ของคุณแล้ว',
      typeFeedback: 'ความคิดเห็น',
      typeSupport: 'คำขอสนับสนุน',
      thankYou: 'ขอบคุณที่ติดต่อเรา ทีมงานของเราได้ตรวจสอบคำขอของคุณและให้คำตอบด้านล่าง',
      originalRequest: 'คำขอเดิมของคุณ',
      ourResponse: 'คำตอบของเรา',
      furtherQuestions: 'หากคุณมีคำถามเพิ่มเติมหรือต้องการความช่วยเหลือเพิ่มเติม อย่าลังเลที่จะตอบกลับอีเมลนี้ เราพร้อมช่วยเหลือคุณ!',
      footerText: 'อีเมลนี้ถูกส่งเพื่อตอบกลับตั๋วสนับสนุนของคุณ',
      preheader: 'เราได้ตอบกลับ{type}ของคุณแล้ว'
    },
    newTicket: {
      title: '{type}ใหม่',
      typeFeedback: 'ความคิดเห็น',
      typeSupport: 'คำขอสนับสนุน',
      from: 'จาก',
      date: 'วันที่',
      priority: 'ความสำคัญ',
      category: 'หมวดหมู่',
      viewInAdmin: 'ดูในแผงผู้ดูแลระบบ',
      footerText: 'การแจ้งเตือนอัตโนมัติจากระบบสนับสนุน AI Content Authenticator',
      preheader: 'ตั๋วใหม่จาก {userName}'
    },
    backup: {
      title: 'สำรองข้อมูลเสร็จสิ้น',
      file: 'ไฟล์',
      bucket: 'บัคเก็ต',
      statistics: 'สถิติการสำรองข้อมูล',
      docs: 'เอกสาร',
      download: 'ดาวน์โหลดข้อมูลสำรอง',
      publicUrlNote: 'URL สาธารณะ - ลิงก์นี้ไม่มีวันหมดอายุ บันทึกไว้ใน Google Drive ส่วนตัวของคุณ',
      footerText: 'AI Content Authenticator - ระบบสำรองข้อมูลอัตโนมัติ',
      preheader: 'สำรองข้อมูลเสร็จสิ้น: {fileName}'
    }
  },

  id: {
    hi: 'Halo',
    bestRegards: 'Salam hormat',
    supportTeam: 'Tim Dukungan AI Content Authenticator',
    allRightsReserved: 'Hak cipta dilindungi',
    automatedMessage: 'Ini adalah pesan otomatis dari AI Content Authenticator',
    supportReply: {
      title: 'Kami telah menanggapi {type} Anda',
      typeFeedback: 'umpan balik',
      typeSupport: 'permintaan dukungan',
      thankYou: 'Terima kasih telah menghubungi kami. Tim kami telah meninjau permintaan Anda dan memberikan tanggapan di bawah ini.',
      originalRequest: 'Permintaan asli Anda',
      ourResponse: 'Tanggapan kami',
      furtherQuestions: 'Jika Anda memiliki pertanyaan lebih lanjut atau membutuhkan bantuan tambahan, jangan ragu untuk membalas email ini. Kami siap membantu!',
      footerText: 'Email ini dikirim sebagai tanggapan atas tiket dukungan Anda',
      preheader: 'Kami telah menanggapi {type} Anda'
    },
    newTicket: {
      title: '{type} baru',
      typeFeedback: 'Umpan balik',
      typeSupport: 'Permintaan dukungan',
      from: 'Dari',
      date: 'Tanggal',
      priority: 'Prioritas',
      category: 'Kategori',
      viewInAdmin: 'Lihat di Panel Admin',
      footerText: 'Notifikasi otomatis dari sistem dukungan AI Content Authenticator',
      preheader: 'Tiket baru dari {userName}'
    },
    backup: {
      title: 'Pencadangan selesai',
      file: 'File',
      bucket: 'Bucket',
      statistics: 'Statistik pencadangan',
      docs: 'dokumen',
      download: 'Unduh cadangan',
      publicUrlNote: 'URL publik - Tautan ini tidak pernah kedaluwarsa. Simpan di Google Drive pribadi Anda.',
      footerText: 'AI Content Authenticator - Sistem pencadangan otomatis',
      preheader: 'Pencadangan selesai: {fileName}'
    }
  },

  ms: {
    hi: 'Hai',
    bestRegards: 'Yang benar',
    supportTeam: 'Pasukan Sokongan AI Content Authenticator',
    allRightsReserved: 'Hak cipta terpelihara',
    automatedMessage: 'Ini adalah mesej automatik daripada AI Content Authenticator',
    supportReply: {
      title: 'Kami telah membalas {type} anda',
      typeFeedback: 'maklum balas',
      typeSupport: 'permintaan sokongan',
      thankYou: 'Terima kasih kerana menghubungi kami. Pasukan kami telah menyemak permintaan anda dan memberikan jawapan di bawah.',
      originalRequest: 'Permintaan asal anda',
      ourResponse: 'Jawapan kami',
      furtherQuestions: 'Jika anda mempunyai soalan lanjut atau memerlukan bantuan tambahan, jangan teragak-agak untuk membalas e-mel ini. Kami sedia membantu!',
      footerText: 'E-mel ini dihantar sebagai jawapan kepada tiket sokongan anda',
      preheader: 'Kami telah membalas {type} anda'
    },
    newTicket: {
      title: '{type} baharu',
      typeFeedback: 'Maklum balas',
      typeSupport: 'Permintaan sokongan',
      from: 'Daripada',
      date: 'Tarikh',
      priority: 'Keutamaan',
      category: 'Kategori',
      viewInAdmin: 'Lihat dalam Panel Admin',
      footerText: 'Pemberitahuan automatik daripada sistem sokongan AI Content Authenticator',
      preheader: 'Tiket baharu daripada {userName}'
    },
    backup: {
      title: 'Sandaran selesai',
      file: 'Fail',
      bucket: 'Bucket',
      statistics: 'Statistik sandaran',
      docs: 'dokumen',
      download: 'Muat turun sandaran',
      publicUrlNote: 'URL awam - Pautan ini tidak pernah tamat tempoh. Simpan dalam Google Drive peribadi anda.',
      footerText: 'AI Content Authenticator - Sistem sandaran automatik',
      preheader: 'Sandaran selesai: {fileName}'
    }
  }
};

// Supported languages
const SUPPORTED_LANGS = Object.keys(translations);
const DEFAULT_LANG = 'en';

/**
 * Get translation text
 */
function t(key, lang = DEFAULT_LANG, params = {}) {
  const langData = translations[lang] || translations[DEFAULT_LANG];
  const keys = key.split('.');
  let value = langData;
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      value = translations[DEFAULT_LANG];
      for (const k2 of keys) value = value?.[k2];
      break;
    }
  }
  
  if (typeof value !== 'string') return key;
  return value.replace(/\{(\w+)\}/g, (_, p) => params[p] ?? `{${p}}`);
}

/**
 * Get locale string for date formatting
 */
function getLocale(lang) {
  const localeMap = {
    en: 'en-US', vi: 'vi-VN', zh: 'zh-CN', ja: 'ja-JP', ko: 'ko-KR',
    fr: 'fr-FR', de: 'de-DE', es: 'es-ES', pt: 'pt-BR', it: 'it-IT',
    ru: 'ru-RU', ar: 'ar-SA', th: 'th-TH', id: 'id-ID', ms: 'ms-MY'
  };
  return localeMap[lang] || 'en-US';
}


// ============================================================================
// ICON HELPERS
// ============================================================================
const ICON_FILES = {
  check: 'circle-check', message: 'message-square', mail: 'mail',
  creditCard: 'credit-card', file: 'file-text', database: 'database',
  download: 'download', barChart: 'chart-bar', info: 'info',
  user: 'user', calendar: 'calendar', alertCircle: 'circle-alert'
};

function getIconUrl(name, color = 'black') {
  const fileName = ICON_FILES[name] || name;
  return `${ICON_BASE_URL}/icons/${fileName}-${color}.png`;
}

function getIcon(name, color = 'black', size = 24) {
  let colorVariant = (color === 'white' || color === '#ffffff' || color === '#fff') ? 'white' : 'black';
  if (!ICON_BASE_URL) return `<span style="display:inline-block;width:${size}px;height:${size}px;"></span>`;
  return `<img src="${getIconUrl(name, colorVariant)}" alt="${name}" width="${size}" height="${size}" style="display:inline-block;vertical-align:middle;"/>`;
}

function getAppLogo(size = 40) {
  if (ICON_BASE_URL) return `<img src="${ICON_BASE_URL}/icons/content.png" alt="AI Content Authenticator" width="${size}" height="${size}" style="display:block;border-radius:8px;"/>`;
  return `<div style="width:${size}px;height:${size}px;background:#1a1a1a;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;font-weight:bold;color:#fff;font-size:${Math.floor(size/2.5)}px;">A</div>`;
}

// ============================================================================
// TEMPLATE COMPONENTS
// ============================================================================
function baseTemplate({ title, preheader, content, footerText, lang = DEFAULT_LANG }) {
  const year = new Date().getFullYear();
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${preheader ? `<span style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</span>` : ''}
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          ${content}
          <tr>
            <td style="padding:32px 40px;background-color:#fafafa;border-top:1px solid #e5e5e5;text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr><td align="center" style="padding-bottom:16px;">${getAppLogo(32)}</td></tr>
                <tr>
                  <td align="center">
                    <p style="margin:0 0 8px;color:#666666;font-size:13px;line-height:1.5;">${footerText || t('automatedMessage', lang)}</p>
                    <p style="margin:0;color:#999999;font-size:12px;">© ${year} AI Content Authenticator. ${t('allRightsReserved', lang)}.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function headerSection({ icon, iconColor = 'white', bgColor = '#1a1a1a', title, subtitle }) {
  return `<tr>
    <td style="background:linear-gradient(135deg,${bgColor} 0%,#2d2d2d 100%);padding:48px 40px;text-align:center;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td align="center" style="padding-bottom:20px;"><div style="width:72px;height:72px;background-color:rgba(255,255,255,0.15);border-radius:50%;display:inline-block;text-align:center;line-height:72px;">${getIcon(icon, iconColor, 32)}</div></td></tr>
        <tr><td align="center"><h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:600;letter-spacing:-0.5px;line-height:1.3;">${title}</h1>${subtitle ? `<p style="margin:12px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">${subtitle}</p>` : ''}</td></tr>
      </table>
    </td>
  </tr>`;
}

function contentSection(html) {
  return `<tr><td style="padding:40px;">${html}</td></tr>`;
}

function infoBox({ icon, title, content, bgColor = '#fafafa' }) {
  return `<div style="background-color:${bgColor};border-radius:8px;padding:20px;margin-bottom:24px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${title ? `<tr><td style="padding-bottom:8px;"><span style="color:#666666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">${icon ? `<span style="vertical-align:middle;margin-right:8px;">${getIcon(icon, 'black', 16)}</span>` : ''}${title}</span></td></tr>` : ''}
      <tr><td><p style="margin:0;color:#333333;font-size:15px;line-height:1.6;">${content}</p></td></tr>
    </table>
  </div>`;
}

function ctaButton({ text, url, bgColor = '#1a1a1a', textColor = '#ffffff', icon = null }) {
  const iconHtml = icon ? `<span style="vertical-align:middle;margin-right:8px;">${getIcon(icon, 'white', 18)}</span>` : '';
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:24px 0;"><a href="${url}" style="display:inline-block;padding:14px 32px;background-color:${bgColor};color:${textColor};text-decoration:none;font-size:14px;font-weight:600;letter-spacing:0.3px;border-radius:8px;text-transform:uppercase;">${iconHtml}${text}</a></td></tr>
  </table>`;
}

function divider() {
  return `<div style="height:1px;background-color:#e5e5e5;margin:24px 0;"></div>`;
}


// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

/**
 * Support ticket reply email
 * @param {string} [params.lang='en'] - Language code (en, vi, zh, ja, ko, fr, de, es, pt, it, ru, ar, th, id, ms)
 */
function supportReplyEmail({ ticketId, ticketType, userName, ticketTitle, replyMessage, lang = DEFAULT_LANG }) {
  const isBilling = ticketType === 'billing_support';
  const typeText = isBilling ? t('supportReply.typeSupport', lang) : t('supportReply.typeFeedback', lang);
  
  const content = `
    ${headerSection({
      icon: 'message',
      title: t('supportReply.title', lang, { type: typeText }),
      subtitle: `Ticket #${ticketId.substring(0, 8).toUpperCase()}`
    })}
    ${contentSection(`
      <p style="margin:0 0 24px;color:#1a1a1a;font-size:16px;">
        ${getIcon('user', 'black', 18)} ${t('hi', lang)} <strong>${userName}</strong>,
      </p>
      <p style="margin:0 0 30px;color:#666666;font-size:15px;line-height:1.6;">${t('supportReply.thankYou', lang)}</p>
      ${infoBox({ icon: 'file', title: t('supportReply.originalRequest', lang), content: ticketTitle })}
      <div style="margin-bottom:24px;">
        <p style="margin:0 0 8px;color:#999999;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">
          <span style="vertical-align:middle;margin-right:8px;">${getIcon('mail', 'black', 14)}</span>${t('supportReply.ourResponse', lang)}
        </p>
        <div style="padding:20px;background-color:#1a1a1a;border-radius:8px;">
          <p style="margin:0;color:#ffffff;font-size:15px;line-height:1.7;white-space:pre-wrap;">${replyMessage}</p>
        </div>
      </div>
      ${divider()}
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        <tr>
          <td width="26" style="vertical-align:top;padding-top:3px;"><img src="${ICON_BASE_URL}/icons/info-black.png" alt="info" width="16" height="16" style="display:block;"/></td>
          <td style="color:#666666;font-size:14px;line-height:1.6;">${t('supportReply.furtherQuestions', lang)}</td>
        </tr>
      </table>
      <div style="margin-top:30px;">
        <p style="margin:0 0 4px;color:#1a1a1a;font-size:15px;font-weight:600;">${t('bestRegards', lang)},</p>
        <p style="margin:0;color:#666666;font-size:15px;">${t('supportTeam', lang)}</p>
      </div>
    `)}
  `;

  return baseTemplate({
    title: `Re: ${ticketTitle}`,
    preheader: t('supportReply.preheader', lang, { type: typeText.toLowerCase() }),
    content,
    footerText: t('supportReply.footerText', lang),
    lang
  });
}

/**
 * New support ticket notification (to admin)
 */
function newTicketEmail({ ticketId, ticketType, userName, userEmail, title, content: ticketContent, priority, category, adminPanelUrl, lang = DEFAULT_LANG }) {
  const isBilling = ticketType === 'billing_support';
  const typeText = isBilling ? t('newTicket.typeSupport', lang) : t('newTicket.typeFeedback', lang);
  const now = new Date();
  const locale = getLocale(lang);
  
  const emailContent = `
    ${headerSection({
      icon: isBilling ? 'creditCard' : 'file',
      title: t('newTicket.title', lang, { type: typeText }),
      subtitle: `Ticket #${ticketId.substring(0, 8).toUpperCase()}`
    })}
    ${contentSection(`
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:30px;">
        <tr><td style="padding:20px;background-color:#fafafa;border-radius:8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:8px 0;">
              <span style="color:#666666;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;"><span style="vertical-align:middle;margin-right:6px;">${getIcon('user', 'black', 14)}</span>${t('newTicket.from', lang)}</span>
              <p style="margin:4px 0 0;color:#1a1a1a;font-size:15px;font-weight:500;">${userName}</p>
              <p style="margin:2px 0 0;color:#666666;font-size:14px;"><a href="mailto:${userEmail}" style="color:#666666;text-decoration:none;">${userEmail}</a></p>
            </td></tr>
            <tr><td style="padding:8px 0;border-top:1px solid #e5e5e5;">
              <span style="color:#666666;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;"><span style="vertical-align:middle;margin-right:6px;">${getIcon('calendar', 'black', 14)}</span>${t('newTicket.date', lang)}</span>
              <p style="margin:4px 0 0;color:#1a1a1a;font-size:14px;">${now.toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' })}</p>
            </td></tr>
            ${priority ? `<tr><td style="padding:8px 0;border-top:1px solid #e5e5e5;">
              <span style="color:#666666;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;"><span style="vertical-align:middle;margin-right:6px;">${getIcon('alertCircle', 'black', 14)}</span>${t('newTicket.priority', lang)}</span>
              <p style="margin:4px 0 0;"><span style="display:inline-block;padding:4px 12px;background-color:${priority === 'high' || priority === 'urgent' ? '#1a1a1a' : '#666666'};color:#ffffff;font-size:12px;font-weight:600;text-transform:uppercase;border-radius:12px;">${priority}</span></p>
            </td></tr>` : ''}
            ${category ? `<tr><td style="padding:8px 0;border-top:1px solid #e5e5e5;">
              <span style="color:#666666;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">${t('newTicket.category', lang)}</span>
              <p style="margin:4px 0 0;color:#1a1a1a;font-size:14px;font-weight:500;">${category}</p>
            </td></tr>` : ''}
          </table>
        </td></tr>
      </table>
      <div style="margin-bottom:24px;">
        <h2 style="margin:0 0 12px;color:#1a1a1a;font-size:18px;font-weight:600;"><span style="vertical-align:middle;margin-right:8px;">${getIcon('file', 'black', 20)}</span>${title}</h2>
      </div>
      <div style="margin-bottom:30px;">
        <div style="padding:20px;background-color:#fafafa;border-radius:8px;border:1px solid #e5e5e5;">
          <p style="margin:0;color:#333333;font-size:15px;line-height:1.6;white-space:pre-wrap;">${ticketContent}</p>
        </div>
      </div>
      ${ctaButton({ text: t('newTicket.viewInAdmin', lang), url: `${adminPanelUrl}/support/${ticketId}` })}
    `)}
  `;

  return baseTemplate({
    title: `${t('newTicket.title', lang, { type: typeText })}: ${title}`,
    preheader: t('newTicket.preheader', lang, { userName }),
    content: emailContent,
    footerText: t('newTicket.footerText', lang),
    lang
  });
}

/**
 * Backup completed email
 */
function backupCompletedEmail({ fileName, bucket, stats, downloadUrl, lang = DEFAULT_LANG }) {
  const now = new Date();
  const locale = getLocale(lang);
  
  const statsHtml = Object.entries(stats).map(([collection, count]) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #e5e5e5;"><span style="color:#374151;font-size:14px;">${collection}</span></td>
      <td style="padding:10px 0;border-bottom:1px solid #e5e5e5;text-align:right;"><span style="color:#1a1a1a;font-weight:600;font-size:14px;">${count}</span><span style="color:#666666;font-size:13px;margin-left:4px;">${t('backup.docs', lang)}</span></td>
    </tr>
  `).join('');

  const content = `
    ${headerSection({
      icon: 'check',
      iconColor: 'white',
      bgColor: '#059669',
      title: t('backup.title', lang),
      subtitle: now.toLocaleString(locale, { dateStyle: 'full', timeStyle: 'short' })
    })}
    ${contentSection(`
      ${infoBox({ icon: 'file', title: t('backup.file', lang), content: `<code style="font-family:'Courier New',monospace;font-size:13px;background:#e5e5e5;padding:2px 6px;border-radius:4px;">${fileName}</code>` })}
      ${infoBox({ icon: 'database', title: t('backup.bucket', lang), content: `<code style="font-family:'Courier New',monospace;font-size:13px;background:#e5e5e5;padding:2px 6px;border-radius:4px;">${bucket}</code>` })}
      <h3 style="margin:24px 0 16px;color:#1a1a1a;font-size:16px;font-weight:600;"><span style="vertical-align:middle;margin-right:8px;">${getIcon('barChart', 'black', 18)}</span>${t('backup.statistics', lang)}</h3>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">${statsHtml}</table>
      ${ctaButton({ text: t('backup.download', lang), url: downloadUrl, bgColor: '#1a1a1a', icon: 'download' })}
      <div style="background-color:#f0f9ff;border-radius:8px;padding:16px;margin-top:24px;">
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td width="26" style="vertical-align:top;padding-top:2px;"><img src="${ICON_BASE_URL}/icons/info-black.png" alt="info" width="16" height="16" style="display:block;"/></td>
            <td style="color:#0369a1;font-size:13px;line-height:1.6;">${t('backup.publicUrlNote', lang)}</td>
          </tr>
        </table>
      </div>
    `)}
  `;

  return baseTemplate({
    title: t('backup.title', lang),
    preheader: t('backup.preheader', lang, { fileName }),
    content,
    footerText: t('backup.footerText', lang),
    lang
  });
}

/**
 * OTP Verification Email
 * Modern, minimalist black & white design
 * @param {Object} params
 * @param {string} params.code - 6-digit OTP code
 * @param {string} params.userName - User's display name
 * @param {number} [params.expiryMinutes=10] - Minutes until code expires
 * @param {string} [params.lang='en'] - Language code
 */
function otpVerificationEmail({ code, userName, expiryMinutes = 10, lang = DEFAULT_LANG }) {
  const content = `
    ${headerSection({
      icon: 'mail',
      iconColor: 'white',
      bgColor: '#1a1a1a',
      title: t('otpVerification.title', lang),
      subtitle: t('otpVerification.subtitle', lang)
    })}
    ${contentSection(`
      <p style="margin:0 0 24px;color:#1a1a1a;font-size:16px;">
        ${t('otpVerification.greeting', lang)}
      </p>
      <p style="margin:0 0 30px;color:#666666;font-size:15px;line-height:1.6;">
        ${t('otpVerification.instruction', lang)}
      </p>
      
      <!-- OTP Code Display -->
      <div style="text-align:center;margin:32px 0;">
        <p style="margin:0 0 12px;color:#999999;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">
          ${t('otpVerification.codeLabel', lang)}
        </p>
        <div style="display:inline-block;background:#1a1a1a;border-radius:12px;padding:24px 48px;">
          <span style="font-family:'Courier New',monospace;font-size:36px;font-weight:700;letter-spacing:8px;color:#ffffff;">
            ${code}
          </span>
        </div>
        <p style="margin:16px 0 0;color:#666666;font-size:13px;">
          ${getIcon('calendar', 'black', 14)} ${t('otpVerification.expiryNote', lang, { minutes: expiryMinutes })}
        </p>
      </div>
      
      ${divider()}
      
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:20px;">
        <tr>
          <td width="26" style="vertical-align:top;padding-top:3px;">
            ${getIcon('info', 'black', 16)}
          </td>
          <td style="color:#999999;font-size:13px;line-height:1.6;">
            ${t('otpVerification.ignoreNote', lang)}
          </td>
        </tr>
      </table>
    `)}
  `;

  return baseTemplate({
    title: t('otpVerification.title', lang),
    preheader: t('otpVerification.preheader', lang, { code }),
    content,
    footerText: t('otpVerification.footerText', lang),
    lang
  });
}

/**
 * Password Reset Email
 * Modern, minimalist black & white design
 * @param {Object} params
 * @param {string} params.code - 6-digit OTP code
 * @param {string} params.userName - User's display name
 * @param {number} [params.expiryMinutes=10] - Minutes until code expires
 * @param {string} [params.lang='en'] - Language code
 */
function passwordResetEmail({ code, userName, expiryMinutes = 10, lang = DEFAULT_LANG }) {
  const content = `
    ${headerSection({
      icon: 'alertCircle',
      iconColor: 'white',
      bgColor: '#1a1a1a',
      title: t('passwordReset.title', lang),
      subtitle: t('passwordReset.subtitle', lang)
    })}
    ${contentSection(`
      <p style="margin:0 0 24px;color:#1a1a1a;font-size:16px;font-weight:600;">
        ${t('passwordReset.greeting', lang)}
      </p>
      <p style="margin:0 0 30px;color:#666666;font-size:15px;line-height:1.6;">
        ${t('passwordReset.instruction', lang)}
      </p>
      
      <!-- Reset Code Display -->
      <div style="text-align:center;margin:32px 0;">
        <p style="margin:0 0 12px;color:#999999;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">
          ${t('passwordReset.codeLabel', lang)}
        </p>
        <div style="display:inline-block;background:#1a1a1a;border-radius:12px;padding:24px 48px;">
          <span style="font-family:'Courier New',monospace;font-size:36px;font-weight:700;letter-spacing:8px;color:#ffffff;">
            ${code}
          </span>
        </div>
        <p style="margin:16px 0 0;color:#666666;font-size:13px;">
          ${getIcon('calendar', 'black', 14)} ${t('passwordReset.expiryNote', lang, { minutes: expiryMinutes })}
        </p>
      </div>
      
      <!-- Security Note -->
      <div style="background-color:#fafafa;border-radius:8px;padding:16px;margin:24px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td width="26" style="vertical-align:top;padding-top:2px;">
              ${getIcon('alertCircle', 'black', 16)}
            </td>
            <td style="color:#666666;font-size:13px;line-height:1.6;">
              ${t('passwordReset.securityNote', lang)}
            </td>
          </tr>
        </table>
      </div>
      
      ${divider()}
      
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:20px;">
        <tr>
          <td width="26" style="vertical-align:top;padding-top:3px;">
            ${getIcon('info', 'black', 16)}
          </td>
          <td style="color:#999999;font-size:13px;line-height:1.6;">
            ${t('passwordReset.ignoreNote', lang)}
          </td>
        </tr>
      </table>
    `)}
  `;

  return baseTemplate({
    title: t('passwordReset.title', lang),
    preheader: t('passwordReset.preheader', lang, { code }),
    content,
    footerText: t('passwordReset.footerText', lang),
    lang
  });
}

module.exports = {
  baseTemplate, headerSection, contentSection, infoBox, ctaButton, divider,
  getIcon, getIconUrl, getAppLogo, t, getLocale,
  ICON_FILES, ICON_BASE_URL, SUPPORTED_LANGS, DEFAULT_LANG, translations,
  supportReplyEmail, newTicketEmail, backupCompletedEmail,
  otpVerificationEmail, passwordResetEmail
};
