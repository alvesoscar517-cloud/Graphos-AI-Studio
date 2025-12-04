/**
 * Email Template Service - Apple Style Design
 * Modern, minimalist email templates with black & white theme
 * Supports 15 languages (i18n)
 * 
 * Supported languages: en, vi, zh, ja, ko, fr, de, es, pt, it, ru, ar, th, id, ms
 */

const ICON_BASE_URL = process.env.ICON_BASE_URL || 'https://alvesoscar517-cloud.github.io/icons-for-Gmail';

// ============================================================================
// TRANSLATIONS (15 languages)
// ============================================================================
const translations = {
  en: {
    hi: 'Hi',
    bestRegards: 'Best regards',
    supportTeam: 'Graphos AI Studio Support Team',
    allRightsReserved: 'All rights reserved',
    automatedMessage: 'This is an automated message from Graphos AI Studio',
    otpVerification: {
      title: 'Verify Your Email',
      subtitle: 'Enter this code to complete your registration',
      greeting: 'Welcome to Graphos AI Studio!',
      instruction: 'Use the verification code below to complete your registration:',
      codeLabel: 'Verification Code',
      expiryNote: 'This code will expire in {minutes} minutes',
      securityNote: 'Never share this code with anyone. We will never ask for your verification code.',
      ignoreNote: "If you didn't create an account, you can safely ignore this email.",
      footerText: 'Automated verification email',
      preheader: 'Your verification code: {code}'
    },
    passwordReset: {
      title: 'Reset Your Password',
      subtitle: 'Use this code to reset your password',
      greeting: 'Password Reset Request',
      instruction: 'We received a request to reset your password. Use the code below:',
      codeLabel: 'Reset Code',
      expiryNote: 'This code will expire in {minutes} minutes',
      securityNote: 'For security, this code can only be used once.',
      ignoreNote: "If you didn't request a password reset, you can safely ignore this email.",
      footerText: 'Automated password reset email',
      preheader: 'Your password reset code: {code}'
    },
    newDeviceLogin: {
      title: 'New Device Login Detected',
      subtitle: 'Security Alert',
      instruction: 'We detected a login to your account from a new device or location.',
      deviceInfo: 'Device Information',
      browser: 'Browser',
      location: 'Location',
      time: 'Time',
      ipAddress: 'IP Address',
      wasYou: 'Was this you?',
      wasYouYes: "If this was you, you can safely ignore this email.",
      wasYouNo: "If this wasn't you, please secure your account immediately by changing your password.",
      secureAccount: 'Secure My Account',
      footerText: 'Automated security notification',
      preheader: 'New login detected on your account'
    },
    passwordChanged: {
      title: 'Password Changed Successfully',
      subtitle: 'Your password has been updated',
      instruction: 'Your password was successfully changed.',
      time: 'Changed at',
      notYou: "If you didn't make this change, please contact support immediately.",
      footerText: 'Automated security notification',
      preheader: 'Your password has been changed'
    },
    supportReply: {
      title: "We've Responded to Your {type}",
      typeFeedback: 'Feedback',
      typeSupport: 'Support Request',
      thankYou: 'Thank you for reaching out. Our team has reviewed your request and provided a response below.',
      originalRequest: 'Your Request',
      ourResponse: 'Response',
      furtherQuestions: "If you have any further questions, please don't hesitate to reply to this email.",
      footerText: 'This email was sent in response to your support ticket',
      preheader: "We've responded to your {type}"
    },
    welcome: {
      title: 'Welcome!',
      subtitle: 'Your account has been verified',
      greeting: 'Welcome to Graphos AI Studio!',
      instruction: "You're all set to start using Graphos AI Studio.",
      getStarted: 'Get Started',
      step1: 'Create your first voice profile',
      step2: 'Add writing samples to train the AI',
      step3: 'Start analyzing and rewriting content',
      goToDashboard: 'Go to Dashboard',
      footerText: 'Automated message from Graphos AI Studio',
      preheader: 'Your account is ready'
    }
  },

  vi: {
    hi: 'Xin chào',
    bestRegards: 'Trân trọng',
    supportTeam: 'Đội ngũ hỗ trợ Graphos AI Studio',
    allRightsReserved: 'Đã đăng ký bản quyền',
    automatedMessage: 'Đây là tin nhắn tự động từ Graphos AI Studio',
    otpVerification: {
      title: 'Xác thực Email',
      subtitle: 'Nhập mã để hoàn tất đăng ký',
      greeting: 'Chào mừng đến với Graphos AI Studio!',
      instruction: 'Sử dụng mã xác thực bên dưới để hoàn tất đăng ký:',
      codeLabel: 'Mã xác thực',
      expiryNote: 'Mã này sẽ hết hạn sau {minutes} phút',
      securityNote: 'Không chia sẻ mã này với bất kỳ ai. Chúng tôi sẽ không bao giờ yêu cầu mã của bạn.',
      ignoreNote: 'Nếu bạn không tạo tài khoản, hãy bỏ qua email này.',
      footerText: 'Email xác thực tự động',
      preheader: 'Mã xác thực của bạn: {code}'
    },
    passwordReset: {
      title: 'Đặt lại mật khẩu',
      subtitle: 'Sử dụng mã để đặt lại mật khẩu',
      greeting: 'Yêu cầu đặt lại mật khẩu',
      instruction: 'Chúng tôi nhận được yêu cầu đặt lại mật khẩu của bạn. Sử dụng mã bên dưới:',
      codeLabel: 'Mã đặt lại',
      expiryNote: 'Mã này sẽ hết hạn sau {minutes} phút',
      securityNote: 'Vì lý do bảo mật, mã này chỉ có thể sử dụng một lần.',
      ignoreNote: 'Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.',
      footerText: 'Email đặt lại mật khẩu tự động',
      preheader: 'Mã đặt lại mật khẩu của bạn: {code}'
    },
    newDeviceLogin: {
      title: 'Phát hiện đăng nhập từ thiết bị mới',
      subtitle: 'Cảnh báo bảo mật',
      instruction: 'Chúng tôi phát hiện đăng nhập vào tài khoản từ thiết bị hoặc vị trí mới.',
      deviceInfo: 'Thông tin thiết bị',
      browser: 'Trình duyệt',
      location: 'Vị trí',
      time: 'Thời gian',
      ipAddress: 'Địa chỉ IP',
      wasYou: 'Đây có phải là bạn?',
      wasYouYes: 'Nếu đây là bạn, bạn có thể bỏ qua email này.',
      wasYouNo: 'Nếu không phải bạn, vui lòng bảo mật tài khoản ngay bằng cách đổi mật khẩu.',
      secureAccount: 'Bảo mật tài khoản',
      footerText: 'Thông báo bảo mật tự động',
      preheader: 'Phát hiện đăng nhập mới vào tài khoản'
    },
    passwordChanged: {
      title: 'Đổi mật khẩu thành công',
      subtitle: 'Mật khẩu của bạn đã được cập nhật',
      instruction: 'Mật khẩu của bạn đã được thay đổi thành công.',
      time: 'Thay đổi lúc',
      notYou: 'Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ hỗ trợ ngay.',
      footerText: 'Thông báo bảo mật tự động',
      preheader: 'Mật khẩu của bạn đã được thay đổi'
    },
    supportReply: {
      title: 'Chúng tôi đã phản hồi {type} của bạn',
      typeFeedback: 'Góp ý',
      typeSupport: 'Yêu cầu hỗ trợ',
      thankYou: 'Cảm ơn bạn đã liên hệ. Đội ngũ của chúng tôi đã xem xét và phản hồi bên dưới.',
      originalRequest: 'Yêu cầu của bạn',
      ourResponse: 'Phản hồi',
      furtherQuestions: 'Nếu bạn có thêm câu hỏi, đừng ngần ngại trả lời email này.',
      footerText: 'Email phản hồi yêu cầu hỗ trợ',
      preheader: 'Chúng tôi đã phản hồi {type} của bạn'
    },
    welcome: {
      title: 'Chào mừng!',
      subtitle: 'Tài khoản đã được xác thực',
      greeting: 'Chào mừng đến với Graphos AI Studio!',
      instruction: 'Bạn đã sẵn sàng để bắt đầu sử dụng Graphos AI Studio.',
      getStarted: 'Bắt đầu ngay',
      step1: 'Tạo hồ sơ giọng nói đầu tiên',
      step2: 'Thêm mẫu viết để huấn luyện AI',
      step3: 'Phân tích và viết lại nội dung',
      goToDashboard: 'Đi đến Dashboard',
      footerText: 'Tin nhắn tự động từ Graphos AI Studio',
      preheader: 'Tài khoản của bạn đã sẵn sàng'
    }
  },

  zh: {
    hi: '您好',
    bestRegards: '此致敬礼',
    supportTeam: 'Graphos AI Studio 支持团队',
    allRightsReserved: '版权所有',
    automatedMessage: '这是来自 Graphos AI Studio 的自动消息',
    otpVerification: {
      title: '验证您的邮箱',
      subtitle: '输入此代码以完成注册',
      greeting: '欢迎来到 Graphos AI Studio！',
      instruction: '使用以下验证码完成注册：',
      codeLabel: '验证码',
      expiryNote: '此代码将在 {minutes} 分钟后过期',
      securityNote: '请勿与任何人分享此代码。我们绝不会要求您提供验证码。',
      ignoreNote: '如果您没有创建账户，请忽略此邮件。',
      footerText: '自动验证邮件',
      preheader: '您的验证码：{code}'
    },
    passwordReset: {
      title: '重置密码',
      subtitle: '使用此代码重置密码',
      greeting: '密码重置请求',
      instruction: '我们收到了重置密码的请求。请使用以下代码：',
      codeLabel: '重置码',
      expiryNote: '此代码将在 {minutes} 分钟后过期',
      securityNote: '出于安全考虑，此代码只能使用一次。',
      ignoreNote: '如果您没有请求重置密码，请忽略此邮件。',
      footerText: '自动密码重置邮件',
      preheader: '您的密码重置码：{code}'
    },
    newDeviceLogin: {
      title: '检测到新设备登录',
      subtitle: '安全警报',
      instruction: '我们检测到您的账户从新设备或位置登录。',
      deviceInfo: '设备信息',
      browser: '浏览器',
      location: '位置',
      time: '时间',
      ipAddress: 'IP地址',
      wasYou: '这是您本人吗？',
      wasYouYes: '如果是您本人，可以忽略此邮件。',
      wasYouNo: '如果不是您本人，请立即更改密码以保护账户安全。',
      secureAccount: '保护我的账户',
      footerText: '自动安全通知',
      preheader: '检测到账户新登录'
    },
    passwordChanged: {
      title: '密码修改成功',
      subtitle: '您的密码已更新',
      instruction: '您的密码已成功更改。',
      time: '更改时间',
      notYou: '如果这不是您的操作，请立即联系支持。',
      footerText: '自动安全通知',
      preheader: '您的密码已更改'
    },
    supportReply: {
      title: '我们已回复您的{type}',
      typeFeedback: '反馈',
      typeSupport: '支持请求',
      thankYou: '感谢您的联系。我们的团队已审核您的请求并在下方提供了回复。',
      originalRequest: '您的请求',
      ourResponse: '回复',
      furtherQuestions: '如果您有任何其他问题，请随时回复此邮件。',
      footerText: '此邮件是对您支持工单的回复',
      preheader: '我们已回复您的{type}'
    },
    welcome: {
      title: '欢迎！',
      subtitle: '账户已验证',
      greeting: '欢迎来到 Graphos AI Studio！',
      instruction: '您已准备好开始使用 Graphos AI Studio。',
      getStarted: '开始使用',
      step1: '创建您的第一个语音档案',
      step2: '添加写作样本来训练AI',
      step3: '开始分析和重写内容',
      goToDashboard: '前往仪表板',
      footerText: '来自 Graphos AI Studio 的自动消息',
      preheader: '您的账户已准备就绪'
    }
  },

  ja: {
    hi: 'こんにちは',
    bestRegards: 'よろしくお願いいたします',
    supportTeam: 'Graphos AI Studio サポートチーム',
    allRightsReserved: '無断複写・転載を禁じます',
    automatedMessage: 'Graphos AI Studio からの自動メッセージです',
    otpVerification: {
      title: 'メールを確認',
      subtitle: '登録を完了するにはこのコードを入力してください',
      greeting: 'Graphos AI Studio へようこそ！',
      instruction: '以下の確認コードを使用して登録を完了してください：',
      codeLabel: '確認コード',
      expiryNote: 'このコードは {minutes} 分後に期限切れになります',
      securityNote: 'このコードを誰とも共有しないでください。確認コードを要求することはありません。',
      ignoreNote: 'アカウントを作成していない場合は、このメールを無視してください。',
      footerText: '自動確認メール',
      preheader: '確認コード：{code}'
    },
    passwordReset: {
      title: 'パスワードをリセット',
      subtitle: 'このコードを使用してパスワードをリセット',
      greeting: 'パスワードリセットのリクエスト',
      instruction: 'パスワードリセットのリクエストを受け取りました。以下のコードを使用してください：',
      codeLabel: 'リセットコード',
      expiryNote: 'このコードは {minutes} 分後に期限切れになります',
      securityNote: 'セキュリティのため、このコードは一度だけ使用できます。',
      ignoreNote: 'パスワードリセットをリクエストしていない場合は、このメールを無視してください。',
      footerText: '自動パスワードリセットメール',
      preheader: 'パスワードリセットコード：{code}'
    },
    newDeviceLogin: {
      title: '新しいデバイスからのログインを検出',
      subtitle: 'セキュリティ警告',
      instruction: '新しいデバイスまたは場所からアカウントへのログインを検出しました。',
      deviceInfo: 'デバイス情報',
      browser: 'ブラウザ',
      location: '場所',
      time: '時間',
      ipAddress: 'IPアドレス',
      wasYou: 'これはあなたですか？',
      wasYouYes: 'あなた自身であれば、このメールを無視してください。',
      wasYouNo: 'あなたでない場合は、すぐにパスワードを変更してアカウントを保護してください。',
      secureAccount: 'アカウントを保護',
      footerText: '自動セキュリティ通知',
      preheader: 'アカウントへの新しいログインを検出'
    },
    passwordChanged: {
      title: 'パスワードが変更されました',
      subtitle: 'パスワードが更新されました',
      instruction: 'パスワードが正常に変更されました。',
      time: '変更日時',
      notYou: 'この変更を行っていない場合は、すぐにサポートに連絡してください。',
      footerText: '自動セキュリティ通知',
      preheader: 'パスワードが変更されました'
    },
    supportReply: {
      title: '{type}に回答しました',
      typeFeedback: 'フィードバック',
      typeSupport: 'サポートリクエスト',
      thankYou: 'お問い合わせいただきありがとうございます。チームがリクエストを確認し、以下に回答を提供しました。',
      originalRequest: 'リクエスト',
      ourResponse: '回答',
      furtherQuestions: 'ご質問がある場合は、このメールに返信してください。',
      footerText: 'サポートチケットへの返信です',
      preheader: '{type}に回答しました'
    },
    welcome: {
      title: 'ようこそ！',
      subtitle: 'アカウントが確認されました',
      greeting: 'Graphos AI Studio へようこそ！',
      instruction: 'Graphos AI Studio を使い始める準備ができました。',
      getStarted: '始める',
      step1: '最初の音声プロファイルを作成',
      step2: 'AIをトレーニングするための文章サンプルを追加',
      step3: 'コンテンツの分析と書き換えを開始',
      goToDashboard: 'ダッシュボードへ',
      footerText: 'Graphos AI Studio からの自動メッセージ',
      preheader: 'アカウントの準備ができました'
    }
  },

  ko: {
    hi: '안녕하세요',
    bestRegards: '감사합니다',
    supportTeam: 'Graphos AI Studio 지원팀',
    allRightsReserved: '모든 권리 보유',
    automatedMessage: 'Graphos AI Studio의 자동 메시지입니다',
    otpVerification: {
      title: '이메일 인증',
      subtitle: '등록을 완료하려면 이 코드를 입력하세요',
      greeting: 'Graphos AI Studio에 오신 것을 환영합니다!',
      instruction: '아래 인증 코드를 사용하여 등록을 완료하세요:',
      codeLabel: '인증 코드',
      expiryNote: '이 코드는 {minutes}분 후에 만료됩니다',
      securityNote: '이 코드를 누구와도 공유하지 마세요. 인증 코드를 요청하지 않습니다.',
      ignoreNote: '계정을 만들지 않았다면 이 이메일을 무시하세요.',
      footerText: '자동 인증 이메일',
      preheader: '인증 코드: {code}'
    },
    passwordReset: {
      title: '비밀번호 재설정',
      subtitle: '이 코드를 사용하여 비밀번호를 재설정하세요',
      greeting: '비밀번호 재설정 요청',
      instruction: '비밀번호 재설정 요청을 받았습니다. 아래 코드를 사용하세요:',
      codeLabel: '재설정 코드',
      expiryNote: '이 코드는 {minutes}분 후에 만료됩니다',
      securityNote: '보안을 위해 이 코드는 한 번만 사용할 수 있습니다.',
      ignoreNote: '비밀번호 재설정을 요청하지 않았다면 이 이메일을 무시하세요.',
      footerText: '자동 비밀번호 재설정 이메일',
      preheader: '비밀번호 재설정 코드: {code}'
    },
    newDeviceLogin: {
      title: '새 기기 로그인 감지',
      subtitle: '보안 알림',
      instruction: '새 기기 또는 위치에서 계정 로그인이 감지되었습니다.',
      deviceInfo: '기기 정보',
      browser: '브라우저',
      location: '위치',
      time: '시간',
      ipAddress: 'IP 주소',
      wasYou: '본인이 맞습니까?',
      wasYouYes: '본인이라면 이 이메일을 무시하세요.',
      wasYouNo: '본인이 아니라면 즉시 비밀번호를 변경하여 계정을 보호하세요.',
      secureAccount: '계정 보호',
      footerText: '자동 보안 알림',
      preheader: '계정에 새 로그인 감지'
    },
    passwordChanged: {
      title: '비밀번호 변경 완료',
      subtitle: '비밀번호가 업데이트되었습니다',
      instruction: '비밀번호가 성공적으로 변경되었습니다.',
      time: '변경 시간',
      notYou: '이 변경을 하지 않았다면 즉시 지원팀에 연락하세요.',
      footerText: '자동 보안 알림',
      preheader: '비밀번호가 변경되었습니다'
    },
    supportReply: {
      title: '{type}에 답변했습니다',
      typeFeedback: '피드백',
      typeSupport: '지원 요청',
      thankYou: '연락해 주셔서 감사합니다. 저희 팀이 요청을 검토하고 아래에 답변을 제공했습니다.',
      originalRequest: '요청',
      ourResponse: '답변',
      furtherQuestions: '추가 질문이 있으시면 이 이메일에 답장해 주세요.',
      footerText: '지원 티켓에 대한 답변입니다',
      preheader: '{type}에 답변했습니다'
    },
    welcome: {
      title: '환영합니다!',
      subtitle: '계정이 인증되었습니다',
      greeting: 'Graphos AI Studio에 오신 것을 환영합니다!',
      instruction: 'Graphos AI Studio를 사용할 준비가 되었습니다.',
      getStarted: '시작하기',
      step1: '첫 번째 음성 프로필 만들기',
      step2: 'AI 훈련을 위한 글쓰기 샘플 추가',
      step3: '콘텐츠 분석 및 다시 쓰기 시작',
      goToDashboard: '대시보드로 이동',
      footerText: 'Graphos AI Studio의 자동 메시지',
      preheader: '계정이 준비되었습니다'
    }
  },

  fr: {
    hi: 'Bonjour',
    bestRegards: 'Cordialement',
    supportTeam: "Équipe de support Graphos AI Studio",
    allRightsReserved: 'Tous droits réservés',
    automatedMessage: "Message automatique d'Graphos AI Studio",
    otpVerification: {
      title: 'Vérifiez votre email',
      subtitle: 'Entrez ce code pour terminer votre inscription',
      greeting: 'Bienvenue sur Graphos AI Studio !',
      instruction: 'Utilisez le code de vérification ci-dessous pour terminer votre inscription :',
      codeLabel: 'Code de vérification',
      expiryNote: 'Ce code expirera dans {minutes} minutes',
      securityNote: 'Ne partagez jamais ce code. Nous ne vous demanderons jamais votre code de vérification.',
      ignoreNote: "Si vous n'avez pas créé de compte, ignorez cet email.",
      footerText: 'Email de vérification automatique',
      preheader: 'Votre code de vérification : {code}'
    },
    passwordReset: {
      title: 'Réinitialiser le mot de passe',
      subtitle: 'Utilisez ce code pour réinitialiser votre mot de passe',
      greeting: 'Demande de réinitialisation',
      instruction: 'Nous avons reçu une demande de réinitialisation de mot de passe. Utilisez le code ci-dessous :',
      codeLabel: 'Code de réinitialisation',
      expiryNote: 'Ce code expirera dans {minutes} minutes',
      securityNote: 'Pour des raisons de sécurité, ce code ne peut être utilisé qu\'une seule fois.',
      ignoreNote: "Si vous n'avez pas demandé de réinitialisation, ignorez cet email.",
      footerText: 'Email de réinitialisation automatique',
      preheader: 'Votre code de réinitialisation : {code}'
    },
    newDeviceLogin: {
      title: 'Nouvelle connexion détectée',
      subtitle: 'Alerte de sécurité',
      instruction: 'Nous avons détecté une connexion à votre compte depuis un nouvel appareil ou emplacement.',
      deviceInfo: 'Informations sur l\'appareil',
      browser: 'Navigateur',
      location: 'Emplacement',
      time: 'Heure',
      ipAddress: 'Adresse IP',
      wasYou: 'Était-ce vous ?',
      wasYouYes: 'Si c\'était vous, ignorez cet email.',
      wasYouNo: 'Si ce n\'était pas vous, sécurisez immédiatement votre compte en changeant votre mot de passe.',
      secureAccount: 'Sécuriser mon compte',
      footerText: 'Notification de sécurité automatique',
      preheader: 'Nouvelle connexion détectée sur votre compte'
    },
    passwordChanged: {
      title: 'Mot de passe modifié',
      subtitle: 'Votre mot de passe a été mis à jour',
      instruction: 'Votre mot de passe a été modifié avec succès.',
      time: 'Modifié le',
      notYou: 'Si vous n\'avez pas effectué ce changement, contactez immédiatement le support.',
      footerText: 'Notification de sécurité automatique',
      preheader: 'Votre mot de passe a été modifié'
    },
    supportReply: {
      title: 'Nous avons répondu à votre {type}',
      typeFeedback: 'commentaire',
      typeSupport: 'demande de support',
      thankYou: 'Merci de nous avoir contactés. Notre équipe a examiné votre demande et vous a fourni une réponse ci-dessous.',
      originalRequest: 'Votre demande',
      ourResponse: 'Réponse',
      furtherQuestions: 'Si vous avez d\'autres questions, n\'hésitez pas à répondre à cet email.',
      footerText: 'Réponse à votre ticket de support',
      preheader: 'Nous avons répondu à votre {type}'
    },
    welcome: {
      title: 'Bienvenue !',
      subtitle: 'Compte vérifié',
      greeting: 'Bienvenue sur Graphos AI Studio !',
      instruction: 'Vous êtes prêt à utiliser Graphos AI Studio.',
      getStarted: 'Commencer',
      step1: 'Créez votre premier profil vocal',
      step2: 'Ajoutez des échantillons d\'écriture pour entraîner l\'IA',
      step3: 'Commencez à analyser et réécrire du contenu',
      goToDashboard: 'Aller au tableau de bord',
      footerText: 'Message automatique de Graphos AI Studio',
      preheader: 'Votre compte est prêt'
    }
  },

  de: {
    hi: 'Hallo',
    bestRegards: 'Mit freundlichen Grüßen',
    supportTeam: 'Graphos AI Studio Support-Team',
    allRightsReserved: 'Alle Rechte vorbehalten',
    automatedMessage: 'Automatische Nachricht von Graphos AI Studio',
    otpVerification: {
      title: 'E-Mail bestätigen',
      subtitle: 'Geben Sie diesen Code ein, um die Registrierung abzuschließen',
      greeting: 'Willkommen bei Graphos AI Studio!',
      instruction: 'Verwenden Sie den folgenden Bestätigungscode, um Ihre Registrierung abzuschließen:',
      codeLabel: 'Bestätigungscode',
      expiryNote: 'Dieser Code läuft in {minutes} Minuten ab',
      securityNote: 'Teilen Sie diesen Code niemals. Wir werden Sie niemals nach Ihrem Bestätigungscode fragen.',
      ignoreNote: 'Wenn Sie kein Konto erstellt haben, ignorieren Sie diese E-Mail.',
      footerText: 'Automatische Bestätigungs-E-Mail',
      preheader: 'Ihr Bestätigungscode: {code}'
    },
    passwordReset: {
      title: 'Passwort zurücksetzen',
      subtitle: 'Verwenden Sie diesen Code zum Zurücksetzen',
      greeting: 'Passwort-Zurücksetzung angefordert',
      instruction: 'Wir haben eine Anfrage zum Zurücksetzen Ihres Passworts erhalten. Verwenden Sie den folgenden Code:',
      codeLabel: 'Zurücksetzungscode',
      expiryNote: 'Dieser Code läuft in {minutes} Minuten ab',
      securityNote: 'Aus Sicherheitsgründen kann dieser Code nur einmal verwendet werden.',
      ignoreNote: 'Wenn Sie keine Zurücksetzung angefordert haben, ignorieren Sie diese E-Mail.',
      footerText: 'Automatische Passwort-Zurücksetzungs-E-Mail',
      preheader: 'Ihr Zurücksetzungscode: {code}'
    },
    newDeviceLogin: {
      title: 'Neue Geräteanmeldung erkannt',
      subtitle: 'Sicherheitswarnung',
      instruction: 'Wir haben eine Anmeldung bei Ihrem Konto von einem neuen Gerät oder Standort erkannt.',
      deviceInfo: 'Geräteinformationen',
      browser: 'Browser',
      location: 'Standort',
      time: 'Zeit',
      ipAddress: 'IP-Adresse',
      wasYou: 'Waren Sie das?',
      wasYouYes: 'Wenn Sie es waren, ignorieren Sie diese E-Mail.',
      wasYouNo: 'Wenn Sie es nicht waren, sichern Sie sofort Ihr Konto, indem Sie Ihr Passwort ändern.',
      secureAccount: 'Konto sichern',
      footerText: 'Automatische Sicherheitsbenachrichtigung',
      preheader: 'Neue Anmeldung bei Ihrem Konto erkannt'
    },
    passwordChanged: {
      title: 'Passwort geändert',
      subtitle: 'Ihr Passwort wurde aktualisiert',
      instruction: 'Ihr Passwort wurde erfolgreich geändert.',
      time: 'Geändert am',
      notYou: 'Wenn Sie diese Änderung nicht vorgenommen haben, kontaktieren Sie sofort den Support.',
      footerText: 'Automatische Sicherheitsbenachrichtigung',
      preheader: 'Ihr Passwort wurde geändert'
    },
    supportReply: {
      title: 'Wir haben auf Ihre {type} geantwortet',
      typeFeedback: 'Rückmeldung',
      typeSupport: 'Support-Anfrage',
      thankYou: 'Vielen Dank für Ihre Kontaktaufnahme. Unser Team hat Ihre Anfrage geprüft und eine Antwort bereitgestellt.',
      originalRequest: 'Ihre Anfrage',
      ourResponse: 'Antwort',
      furtherQuestions: 'Bei weiteren Fragen antworten Sie einfach auf diese E-Mail.',
      footerText: 'Antwort auf Ihr Support-Ticket',
      preheader: 'Wir haben auf Ihre {type} geantwortet'
    },
    welcome: {
      title: 'Willkommen!',
      subtitle: 'Konto verifiziert',
      greeting: 'Willkommen bei Graphos AI Studio!',
      instruction: 'Sie sind bereit, Graphos AI Studio zu nutzen.',
      getStarted: 'Loslegen',
      step1: 'Erstellen Sie Ihr erstes Stimmprofil',
      step2: 'Fügen Sie Schreibproben hinzu, um die KI zu trainieren',
      step3: 'Beginnen Sie mit der Analyse und dem Umschreiben von Inhalten',
      goToDashboard: 'Zum Dashboard',
      footerText: 'Automatische Nachricht von Graphos AI Studio',
      preheader: 'Ihr Konto ist bereit'
    }
  },

  es: {
    hi: 'Hola',
    bestRegards: 'Saludos cordiales',
    supportTeam: 'Equipo de soporte de Graphos AI Studio',
    allRightsReserved: 'Todos los derechos reservados',
    automatedMessage: 'Mensaje automático de Graphos AI Studio',
    otpVerification: {
      title: 'Verifica tu email',
      subtitle: 'Ingresa este código para completar tu registro',
      greeting: '¡Bienvenido a Graphos AI Studio!',
      instruction: 'Usa el código de verificación a continuación para completar tu registro:',
      codeLabel: 'Código de verificación',
      expiryNote: 'Este código expirará en {minutes} minutos',
      securityNote: 'Nunca compartas este código. Nunca te pediremos tu código de verificación.',
      ignoreNote: 'Si no creaste una cuenta, ignora este email.',
      footerText: 'Email de verificación automático',
      preheader: 'Tu código de verificación: {code}'
    },
    passwordReset: {
      title: 'Restablecer contraseña',
      subtitle: 'Usa este código para restablecer tu contraseña',
      greeting: 'Solicitud de restablecimiento',
      instruction: 'Recibimos una solicitud para restablecer tu contraseña. Usa el código a continuación:',
      codeLabel: 'Código de restablecimiento',
      expiryNote: 'Este código expirará en {minutes} minutos',
      securityNote: 'Por seguridad, este código solo puede usarse una vez.',
      ignoreNote: 'Si no solicitaste un restablecimiento, ignora este email.',
      footerText: 'Email de restablecimiento automático',
      preheader: 'Tu código de restablecimiento: {code}'
    },
    newDeviceLogin: {
      title: 'Nuevo inicio de sesión detectado',
      subtitle: 'Alerta de seguridad',
      instruction: 'Detectamos un inicio de sesión en tu cuenta desde un nuevo dispositivo o ubicación.',
      deviceInfo: 'Información del dispositivo',
      browser: 'Navegador',
      location: 'Ubicación',
      time: 'Hora',
      ipAddress: 'Dirección IP',
      wasYou: '¿Fuiste tú?',
      wasYouYes: 'Si fuiste tú, ignora este email.',
      wasYouNo: 'Si no fuiste tú, asegura tu cuenta inmediatamente cambiando tu contraseña.',
      secureAccount: 'Asegurar mi cuenta',
      footerText: 'Notificación de seguridad automática',
      preheader: 'Nuevo inicio de sesión detectado en tu cuenta'
    },
    passwordChanged: {
      title: 'Contraseña cambiada',
      subtitle: 'Tu contraseña ha sido actualizada',
      instruction: 'Tu contraseña fue cambiada exitosamente.',
      time: 'Cambiada el',
      notYou: 'Si no hiciste este cambio, contacta al soporte inmediatamente.',
      footerText: 'Notificación de seguridad automática',
      preheader: 'Tu contraseña ha sido cambiada'
    },
    supportReply: {
      title: 'Hemos respondido a tu {type}',
      typeFeedback: 'comentario',
      typeSupport: 'solicitud de soporte',
      thankYou: 'Gracias por contactarnos. Nuestro equipo ha revisado tu solicitud y te ha proporcionado una respuesta a continuación.',
      originalRequest: 'Tu solicitud',
      ourResponse: 'Respuesta',
      furtherQuestions: 'Si tienes más preguntas, no dudes en responder a este email.',
      footerText: 'Respuesta a tu ticket de soporte',
      preheader: 'Hemos respondido a tu {type}'
    },
    welcome: {
      title: '¡Bienvenido!',
      subtitle: 'Cuenta verificada',
      greeting: '¡Bienvenido a Graphos AI Studio!',
      instruction: 'Estás listo para comenzar a usar Graphos AI Studio.',
      getStarted: 'Comenzar',
      step1: 'Crea tu primer perfil de voz',
      step2: 'Agrega muestras de escritura para entrenar la IA',
      step3: 'Comienza a analizar y reescribir contenido',
      goToDashboard: 'Ir al panel',
      footerText: 'Mensaje automático de Graphos AI Studio',
      preheader: 'Tu cuenta está lista'
    }
  },

  pt: {
    hi: 'Olá',
    bestRegards: 'Atenciosamente',
    supportTeam: 'Equipe de suporte Graphos AI Studio',
    allRightsReserved: 'Todos os direitos reservados',
    automatedMessage: 'Mensagem automática do Graphos AI Studio',
    otpVerification: {
      title: 'Verifique seu email',
      subtitle: 'Digite este código para completar seu registro',
      greeting: 'Bem-vindo ao Graphos AI Studio!',
      instruction: 'Use o código de verificação abaixo para completar seu registro:',
      codeLabel: 'Código de verificação',
      expiryNote: 'Este código expirará em {minutes} minutos',
      securityNote: 'Nunca compartilhe este código. Nunca pediremos seu código de verificação.',
      ignoreNote: 'Se você não criou uma conta, ignore este email.',
      footerText: 'Email de verificação automático',
      preheader: 'Seu código de verificação: {code}'
    },
    passwordReset: {
      title: 'Redefinir senha',
      subtitle: 'Use este código para redefinir sua senha',
      greeting: 'Solicitação de redefinição',
      instruction: 'Recebemos uma solicitação para redefinir sua senha. Use o código abaixo:',
      codeLabel: 'Código de redefinição',
      expiryNote: 'Este código expirará em {minutes} minutos',
      securityNote: 'Por segurança, este código só pode ser usado uma vez.',
      ignoreNote: 'Se você não solicitou uma redefinição, ignore este email.',
      footerText: 'Email de redefinição automático',
      preheader: 'Seu código de redefinição: {code}'
    },
    newDeviceLogin: {
      title: 'Novo login detectado',
      subtitle: 'Alerta de segurança',
      instruction: 'Detectamos um login na sua conta de um novo dispositivo ou local.',
      deviceInfo: 'Informações do dispositivo',
      browser: 'Navegador',
      location: 'Local',
      time: 'Hora',
      ipAddress: 'Endereço IP',
      wasYou: 'Foi você?',
      wasYouYes: 'Se foi você, ignore este email.',
      wasYouNo: 'Se não foi você, proteja sua conta imediatamente alterando sua senha.',
      secureAccount: 'Proteger minha conta',
      footerText: 'Notificação de segurança automática',
      preheader: 'Novo login detectado na sua conta'
    },
    passwordChanged: {
      title: 'Senha alterada',
      subtitle: 'Sua senha foi atualizada',
      instruction: 'Sua senha foi alterada com sucesso.',
      time: 'Alterada em',
      notYou: 'Se você não fez esta alteração, entre em contato com o suporte imediatamente.',
      footerText: 'Notificação de segurança automática',
      preheader: 'Sua senha foi alterada'
    },
    supportReply: {
      title: 'Respondemos ao seu {type}',
      typeFeedback: 'feedback',
      typeSupport: 'pedido de suporte',
      thankYou: 'Obrigado por entrar em contato. Nossa equipe analisou sua solicitação e forneceu uma resposta abaixo.',
      originalRequest: 'Sua solicitação',
      ourResponse: 'Resposta',
      furtherQuestions: 'Se tiver mais perguntas, não hesite em responder a este email.',
      footerText: 'Resposta ao seu ticket de suporte',
      preheader: 'Respondemos ao seu {type}'
    },
    welcome: {
      title: 'Bem-vindo!',
      subtitle: 'Conta verificada',
      greeting: 'Bem-vindo ao Graphos AI Studio!',
      instruction: 'Você está pronto para começar a usar o Graphos AI Studio.',
      getStarted: 'Começar',
      step1: 'Crie seu primeiro perfil de voz',
      step2: 'Adicione amostras de escrita para treinar a IA',
      step3: 'Comece a analisar e reescrever conteúdo',
      goToDashboard: 'Ir para o painel',
      footerText: 'Mensagem automática do Graphos AI Studio',
      preheader: 'Sua conta está pronta'
    }
  },

  it: {
    hi: 'Ciao',
    bestRegards: 'Cordiali saluti',
    supportTeam: 'Team di supporto Graphos AI Studio',
    allRightsReserved: 'Tutti i diritti riservati',
    automatedMessage: 'Messaggio automatico da Graphos AI Studio',
    otpVerification: {
      title: 'Verifica la tua email',
      subtitle: 'Inserisci questo codice per completare la registrazione',
      greeting: 'Benvenuto su Graphos AI Studio!',
      instruction: 'Usa il codice di verifica qui sotto per completare la registrazione:',
      codeLabel: 'Codice di verifica',
      expiryNote: 'Questo codice scadrà tra {minutes} minuti',
      securityNote: 'Non condividere mai questo codice. Non ti chiederemo mai il tuo codice di verifica.',
      ignoreNote: 'Se non hai creato un account, ignora questa email.',
      footerText: 'Email di verifica automatica',
      preheader: 'Il tuo codice di verifica: {code}'
    },
    passwordReset: {
      title: 'Reimposta password',
      subtitle: 'Usa questo codice per reimpostare la password',
      greeting: 'Richiesta di reimpostazione',
      instruction: 'Abbiamo ricevuto una richiesta di reimpostazione della password. Usa il codice qui sotto:',
      codeLabel: 'Codice di reimpostazione',
      expiryNote: 'Questo codice scadrà tra {minutes} minuti',
      securityNote: 'Per sicurezza, questo codice può essere usato solo una volta.',
      ignoreNote: 'Se non hai richiesto una reimpostazione, ignora questa email.',
      footerText: 'Email di reimpostazione automatica',
      preheader: 'Il tuo codice di reimpostazione: {code}'
    },
    newDeviceLogin: {
      title: 'Nuovo accesso rilevato',
      subtitle: 'Avviso di sicurezza',
      instruction: 'Abbiamo rilevato un accesso al tuo account da un nuovo dispositivo o posizione.',
      deviceInfo: 'Informazioni dispositivo',
      browser: 'Browser',
      location: 'Posizione',
      time: 'Ora',
      ipAddress: 'Indirizzo IP',
      wasYou: 'Eri tu?',
      wasYouYes: 'Se eri tu, ignora questa email.',
      wasYouNo: 'Se non eri tu, proteggi immediatamente il tuo account cambiando la password.',
      secureAccount: 'Proteggi il mio account',
      footerText: 'Notifica di sicurezza automatica',
      preheader: 'Nuovo accesso rilevato sul tuo account'
    },
    passwordChanged: {
      title: 'Password modificata',
      subtitle: 'La tua password è stata aggiornata',
      instruction: 'La tua password è stata modificata con successo.',
      time: 'Modificata il',
      notYou: 'Se non hai effettuato questa modifica, contatta immediatamente il supporto.',
      footerText: 'Notifica di sicurezza automatica',
      preheader: 'La tua password è stata modificata'
    },
    supportReply: {
      title: 'Abbiamo risposto al tuo {type}',
      typeFeedback: 'feedback',
      typeSupport: 'richiesta di supporto',
      thankYou: 'Grazie per averci contattato. Il nostro team ha esaminato la tua richiesta e ha fornito una risposta qui sotto.',
      originalRequest: 'La tua richiesta',
      ourResponse: 'Risposta',
      furtherQuestions: 'Se hai altre domande, non esitare a rispondere a questa email.',
      footerText: 'Risposta al tuo ticket di supporto',
      preheader: 'Abbiamo risposto al tuo {type}'
    },
    welcome: {
      title: 'Benvenuto!',
      subtitle: 'Account verificato',
      greeting: 'Benvenuto su Graphos AI Studio!',
      instruction: 'Sei pronto per iniziare a usare Graphos AI Studio.',
      getStarted: 'Inizia',
      step1: 'Crea il tuo primo profilo vocale',
      step2: 'Aggiungi campioni di scrittura per addestrare l\'IA',
      step3: 'Inizia ad analizzare e riscrivere contenuti',
      goToDashboard: 'Vai alla dashboard',
      footerText: 'Messaggio automatico da Graphos AI Studio',
      preheader: 'Il tuo account è pronto'
    }
  },

  ru: {
    hi: 'Здравствуйте',
    bestRegards: 'С уважением',
    supportTeam: 'Команда поддержки Graphos AI Studio',
    allRightsReserved: 'Все права защищены',
    automatedMessage: 'Автоматическое сообщение от Graphos AI Studio',
    otpVerification: {
      title: 'Подтвердите email',
      subtitle: 'Введите этот код для завершения регистрации',
      greeting: 'Добро пожаловать в Graphos AI Studio!',
      instruction: 'Используйте код подтверждения ниже для завершения регистрации:',
      codeLabel: 'Код подтверждения',
      expiryNote: 'Этот код истечёт через {minutes} минут',
      securityNote: 'Никогда не делитесь этим кодом. Мы никогда не попросим ваш код подтверждения.',
      ignoreNote: 'Если вы не создавали аккаунт, проигнорируйте это письмо.',
      footerText: 'Автоматическое письмо подтверждения',
      preheader: 'Ваш код подтверждения: {code}'
    },
    passwordReset: {
      title: 'Сброс пароля',
      subtitle: 'Используйте этот код для сброса пароля',
      greeting: 'Запрос на сброс пароля',
      instruction: 'Мы получили запрос на сброс вашего пароля. Используйте код ниже:',
      codeLabel: 'Код сброса',
      expiryNote: 'Этот код истечёт через {minutes} минут',
      securityNote: 'В целях безопасности этот код можно использовать только один раз.',
      ignoreNote: 'Если вы не запрашивали сброс, проигнорируйте это письмо.',
      footerText: 'Автоматическое письмо сброса пароля',
      preheader: 'Ваш код сброса: {code}'
    },
    newDeviceLogin: {
      title: 'Обнаружен вход с нового устройства',
      subtitle: 'Предупреждение безопасности',
      instruction: 'Мы обнаружили вход в ваш аккаунт с нового устройства или местоположения.',
      deviceInfo: 'Информация об устройстве',
      browser: 'Браузер',
      location: 'Местоположение',
      time: 'Время',
      ipAddress: 'IP-адрес',
      wasYou: 'Это были вы?',
      wasYouYes: 'Если это были вы, проигнорируйте это письмо.',
      wasYouNo: 'Если это были не вы, немедленно защитите свой аккаунт, сменив пароль.',
      secureAccount: 'Защитить аккаунт',
      footerText: 'Автоматическое уведомление безопасности',
      preheader: 'Обнаружен новый вход в ваш аккаунт'
    },
    passwordChanged: {
      title: 'Пароль изменён',
      subtitle: 'Ваш пароль был обновлён',
      instruction: 'Ваш пароль был успешно изменён.',
      time: 'Изменён',
      notYou: 'Если вы не делали это изменение, немедленно свяжитесь с поддержкой.',
      footerText: 'Автоматическое уведомление безопасности',
      preheader: 'Ваш пароль был изменён'
    },
    supportReply: {
      title: 'Мы ответили на ваш {type}',
      typeFeedback: 'отзыв',
      typeSupport: 'запрос в поддержку',
      thankYou: 'Спасибо за обращение. Наша команда рассмотрела ваш запрос и предоставила ответ ниже.',
      originalRequest: 'Ваш запрос',
      ourResponse: 'Ответ',
      furtherQuestions: 'Если у вас есть дополнительные вопросы, не стесняйтесь ответить на это письмо.',
      footerText: 'Ответ на ваш тикет поддержки',
      preheader: 'Мы ответили на ваш {type}'
    },
    welcome: {
      title: 'Добро пожаловать!',
      subtitle: 'Аккаунт подтверждён',
      greeting: 'Добро пожаловать в Graphos AI Studio!',
      instruction: 'Вы готовы начать использовать Graphos AI Studio.',
      getStarted: 'Начать',
      step1: 'Создайте свой первый голосовой профиль',
      step2: 'Добавьте образцы письма для обучения ИИ',
      step3: 'Начните анализировать и переписывать контент',
      goToDashboard: 'Перейти в панель',
      footerText: 'Автоматическое сообщение от Graphos AI Studio',
      preheader: 'Ваш аккаунт готов'
    }
  },

  ar: {
    hi: 'مرحباً',
    bestRegards: 'مع أطيب التحيات',
    supportTeam: 'فريق دعم Graphos AI Studio',
    allRightsReserved: 'جميع الحقوق محفوظة',
    automatedMessage: 'رسالة تلقائية من Graphos AI Studio',
    otpVerification: {
      title: 'تحقق من بريدك الإلكتروني',
      subtitle: 'أدخل هذا الرمز لإكمال التسجيل',
      greeting: 'مرحباً بك في Graphos AI Studio!',
      instruction: 'استخدم رمز التحقق أدناه لإكمال التسجيل:',
      codeLabel: 'رمز التحقق',
      expiryNote: 'سينتهي هذا الرمز خلال {minutes} دقيقة',
      securityNote: 'لا تشارك هذا الرمز مع أي شخص. لن نطلب منك رمز التحقق أبداً.',
      ignoreNote: 'إذا لم تقم بإنشاء حساب، تجاهل هذا البريد.',
      footerText: 'بريد تحقق تلقائي',
      preheader: 'رمز التحقق الخاص بك: {code}'
    },
    passwordReset: {
      title: 'إعادة تعيين كلمة المرور',
      subtitle: 'استخدم هذا الرمز لإعادة تعيين كلمة المرور',
      greeting: 'طلب إعادة تعيين كلمة المرور',
      instruction: 'تلقينا طلباً لإعادة تعيين كلمة المرور. استخدم الرمز أدناه:',
      codeLabel: 'رمز إعادة التعيين',
      expiryNote: 'سينتهي هذا الرمز خلال {minutes} دقيقة',
      securityNote: 'لأسباب أمنية، يمكن استخدام هذا الرمز مرة واحدة فقط.',
      ignoreNote: 'إذا لم تطلب إعادة التعيين، تجاهل هذا البريد.',
      footerText: 'بريد إعادة تعيين تلقائي',
      preheader: 'رمز إعادة التعيين: {code}'
    },
    newDeviceLogin: {
      title: 'تم اكتشاف تسجيل دخول من جهاز جديد',
      subtitle: 'تنبيه أمني',
      instruction: 'اكتشفنا تسجيل دخول إلى حسابك من جهاز أو موقع جديد.',
      deviceInfo: 'معلومات الجهاز',
      browser: 'المتصفح',
      location: 'الموقع',
      time: 'الوقت',
      ipAddress: 'عنوان IP',
      wasYou: 'هل كان هذا أنت؟',
      wasYouYes: 'إذا كان هذا أنت، تجاهل هذا البريد.',
      wasYouNo: 'إذا لم يكن هذا أنت، قم بتأمين حسابك فوراً بتغيير كلمة المرور.',
      secureAccount: 'تأمين حسابي',
      footerText: 'إشعار أمني تلقائي',
      preheader: 'تم اكتشاف تسجيل دخول جديد'
    },
    passwordChanged: {
      title: 'تم تغيير كلمة المرور',
      subtitle: 'تم تحديث كلمة المرور الخاصة بك',
      instruction: 'تم تغيير كلمة المرور بنجاح.',
      time: 'تم التغيير في',
      notYou: 'إذا لم تقم بهذا التغيير، اتصل بالدعم فوراً.',
      footerText: 'إشعار أمني تلقائي',
      preheader: 'تم تغيير كلمة المرور'
    },
    supportReply: {
      title: 'لقد رددنا على {type} الخاص بك',
      typeFeedback: 'ملاحظاتك',
      typeSupport: 'طلب الدعم',
      thankYou: 'شكراً لتواصلك معنا. قام فريقنا بمراجعة طلبك وقدم رداً أدناه.',
      originalRequest: 'طلبك',
      ourResponse: 'الرد',
      furtherQuestions: 'إذا كان لديك أي أسئلة إضافية، لا تتردد في الرد على هذا البريد.',
      footerText: 'رد على تذكرة الدعم',
      preheader: 'لقد رددنا على {type}'
    },
    welcome: {
      title: 'مرحباً!',
      subtitle: 'تم التحقق من الحساب',
      greeting: 'مرحباً بك في Graphos AI Studio!',
      instruction: 'أنت جاهز لبدء استخدام Graphos AI Studio.',
      getStarted: 'ابدأ',
      step1: 'أنشئ ملفك الصوتي الأول',
      step2: 'أضف عينات كتابة لتدريب الذكاء الاصطناعي',
      step3: 'ابدأ بتحليل وإعادة كتابة المحتوى',
      goToDashboard: 'الذهاب إلى لوحة التحكم',
      footerText: 'رسالة تلقائية من Graphos AI Studio',
      preheader: 'حسابك جاهز'
    }
  },

  th: {
    hi: 'สวัสดี',
    bestRegards: 'ขอแสดงความนับถือ',
    supportTeam: 'ทีมสนับสนุน Graphos AI Studio',
    allRightsReserved: 'สงวนลิขสิทธิ์',
    automatedMessage: 'ข้อความอัตโนมัติจาก Graphos AI Studio',
    otpVerification: {
      title: 'ยืนยันอีเมล',
      subtitle: 'กรอกรหัสนี้เพื่อลงทะเบียนให้เสร็จสมบูรณ์',
      greeting: 'ยินดีต้อนรับสู่ Graphos AI Studio!',
      instruction: 'ใช้รหัสยืนยันด้านล่างเพื่อลงทะเบียนให้เสร็จสมบูรณ์:',
      codeLabel: 'รหัสยืนยัน',
      expiryNote: 'รหัสนี้จะหมดอายุใน {minutes} นาที',
      securityNote: 'อย่าแชร์รหัสนี้กับใคร เราจะไม่ขอรหัสยืนยันของคุณ',
      ignoreNote: 'หากคุณไม่ได้สร้างบัญชี ให้เพิกเฉยอีเมลนี้',
      footerText: 'อีเมลยืนยันอัตโนมัติ',
      preheader: 'รหัสยืนยันของคุณ: {code}'
    },
    passwordReset: {
      title: 'รีเซ็ตรหัสผ่าน',
      subtitle: 'ใช้รหัสนี้เพื่อรีเซ็ตรหัสผ่าน',
      greeting: 'คำขอรีเซ็ตรหัสผ่าน',
      instruction: 'เราได้รับคำขอรีเซ็ตรหัสผ่านของคุณ ใช้รหัสด้านล่าง:',
      codeLabel: 'รหัสรีเซ็ต',
      expiryNote: 'รหัสนี้จะหมดอายุใน {minutes} นาที',
      securityNote: 'เพื่อความปลอดภัย รหัสนี้ใช้ได้เพียงครั้งเดียว',
      ignoreNote: 'หากคุณไม่ได้ขอรีเซ็ต ให้เพิกเฉยอีเมลนี้',
      footerText: 'อีเมลรีเซ็ตรหัสผ่านอัตโนมัติ',
      preheader: 'รหัสรีเซ็ตของคุณ: {code}'
    },
    newDeviceLogin: {
      title: 'ตรวจพบการเข้าสู่ระบบจากอุปกรณ์ใหม่',
      subtitle: 'การแจ้งเตือนความปลอดภัย',
      instruction: 'เราตรวจพบการเข้าสู่ระบบบัญชีของคุณจากอุปกรณ์หรือตำแหน่งใหม่',
      deviceInfo: 'ข้อมูลอุปกรณ์',
      browser: 'เบราว์เซอร์',
      location: 'ตำแหน่ง',
      time: 'เวลา',
      ipAddress: 'ที่อยู่ IP',
      wasYou: 'นี่คือคุณหรือไม่?',
      wasYouYes: 'หากนี่คือคุณ ให้เพิกเฉยอีเมลนี้',
      wasYouNo: 'หากไม่ใช่คุณ โปรดรักษาความปลอดภัยบัญชีทันทีโดยเปลี่ยนรหัสผ่าน',
      secureAccount: 'รักษาความปลอดภัยบัญชี',
      footerText: 'การแจ้งเตือนความปลอดภัยอัตโนมัติ',
      preheader: 'ตรวจพบการเข้าสู่ระบบใหม่'
    },
    passwordChanged: {
      title: 'เปลี่ยนรหัสผ่านสำเร็จ',
      subtitle: 'รหัสผ่านของคุณได้รับการอัปเดต',
      instruction: 'รหัสผ่านของคุณถูกเปลี่ยนเรียบร้อยแล้ว',
      time: 'เปลี่ยนเมื่อ',
      notYou: 'หากคุณไม่ได้ทำการเปลี่ยนแปลงนี้ โปรดติดต่อฝ่ายสนับสนุนทันที',
      footerText: 'การแจ้งเตือนความปลอดภัยอัตโนมัติ',
      preheader: 'รหัสผ่านของคุณถูกเปลี่ยน'
    },
    supportReply: {
      title: 'เราได้ตอบกลับ{type}ของคุณแล้ว',
      typeFeedback: 'ความคิดเห็น',
      typeSupport: 'คำขอสนับสนุน',
      thankYou: 'ขอบคุณที่ติดต่อเรา ทีมงานได้ตรวจสอบคำขอและให้คำตอบด้านล่าง',
      originalRequest: 'คำขอของคุณ',
      ourResponse: 'คำตอบ',
      furtherQuestions: 'หากมีคำถามเพิ่มเติม อย่าลังเลที่จะตอบกลับอีเมลนี้',
      footerText: 'การตอบกลับตั๋วสนับสนุน',
      preheader: 'เราได้ตอบกลับ{type}ของคุณแล้ว'
    },
    welcome: {
      title: 'ยินดีต้อนรับ!',
      subtitle: 'บัญชีได้รับการยืนยัน',
      greeting: 'ยินดีต้อนรับสู่ Graphos AI Studio!',
      instruction: 'คุณพร้อมที่จะเริ่มใช้ Graphos AI Studio แล้ว',
      getStarted: 'เริ่มต้น',
      step1: 'สร้างโปรไฟล์เสียงแรกของคุณ',
      step2: 'เพิ่มตัวอย่างการเขียนเพื่อฝึก AI',
      step3: 'เริ่มวิเคราะห์และเขียนเนื้อหาใหม่',
      goToDashboard: 'ไปที่แดชบอร์ด',
      footerText: 'ข้อความอัตโนมัติจาก Graphos AI Studio',
      preheader: 'บัญชีของคุณพร้อมแล้ว'
    }
  },

  id: {
    hi: 'Halo',
    bestRegards: 'Salam hormat',
    supportTeam: 'Tim Dukungan Graphos AI Studio',
    allRightsReserved: 'Hak cipta dilindungi',
    automatedMessage: 'Pesan otomatis dari Graphos AI Studio',
    otpVerification: {
      title: 'Verifikasi Email',
      subtitle: 'Masukkan kode ini untuk menyelesaikan pendaftaran',
      greeting: 'Selamat datang di Graphos AI Studio!',
      instruction: 'Gunakan kode verifikasi di bawah untuk menyelesaikan pendaftaran:',
      codeLabel: 'Kode Verifikasi',
      expiryNote: 'Kode ini akan kedaluwarsa dalam {minutes} menit',
      securityNote: 'Jangan bagikan kode ini kepada siapa pun. Kami tidak akan pernah meminta kode verifikasi Anda.',
      ignoreNote: 'Jika Anda tidak membuat akun, abaikan email ini.',
      footerText: 'Email verifikasi otomatis',
      preheader: 'Kode verifikasi Anda: {code}'
    },
    passwordReset: {
      title: 'Reset Kata Sandi',
      subtitle: 'Gunakan kode ini untuk mereset kata sandi',
      greeting: 'Permintaan Reset Kata Sandi',
      instruction: 'Kami menerima permintaan untuk mereset kata sandi Anda. Gunakan kode di bawah:',
      codeLabel: 'Kode Reset',
      expiryNote: 'Kode ini akan kedaluwarsa dalam {minutes} menit',
      securityNote: 'Untuk keamanan, kode ini hanya dapat digunakan sekali.',
      ignoreNote: 'Jika Anda tidak meminta reset, abaikan email ini.',
      footerText: 'Email reset kata sandi otomatis',
      preheader: 'Kode reset Anda: {code}'
    },
    newDeviceLogin: {
      title: 'Login Perangkat Baru Terdeteksi',
      subtitle: 'Peringatan Keamanan',
      instruction: 'Kami mendeteksi login ke akun Anda dari perangkat atau lokasi baru.',
      deviceInfo: 'Informasi Perangkat',
      browser: 'Browser',
      location: 'Lokasi',
      time: 'Waktu',
      ipAddress: 'Alamat IP',
      wasYou: 'Apakah ini Anda?',
      wasYouYes: 'Jika ini Anda, abaikan email ini.',
      wasYouNo: 'Jika ini bukan Anda, amankan akun Anda segera dengan mengubah kata sandi.',
      secureAccount: 'Amankan Akun Saya',
      footerText: 'Notifikasi keamanan otomatis',
      preheader: 'Login baru terdeteksi di akun Anda'
    },
    passwordChanged: {
      title: 'Kata Sandi Diubah',
      subtitle: 'Kata sandi Anda telah diperbarui',
      instruction: 'Kata sandi Anda berhasil diubah.',
      time: 'Diubah pada',
      notYou: 'Jika Anda tidak melakukan perubahan ini, hubungi dukungan segera.',
      footerText: 'Notifikasi keamanan otomatis',
      preheader: 'Kata sandi Anda telah diubah'
    },
    supportReply: {
      title: 'Kami telah menanggapi {type} Anda',
      typeFeedback: 'umpan balik',
      typeSupport: 'permintaan dukungan',
      thankYou: 'Terima kasih telah menghubungi kami. Tim kami telah meninjau permintaan Anda dan memberikan tanggapan di bawah.',
      originalRequest: 'Permintaan Anda',
      ourResponse: 'Tanggapan',
      furtherQuestions: 'Jika Anda memiliki pertanyaan lebih lanjut, jangan ragu untuk membalas email ini.',
      footerText: 'Tanggapan atas tiket dukungan Anda',
      preheader: 'Kami telah menanggapi {type} Anda'
    },
    welcome: {
      title: 'Selamat Datang!',
      subtitle: 'Akun terverifikasi',
      greeting: 'Selamat datang di Graphos AI Studio!',
      instruction: 'Anda siap untuk mulai menggunakan Graphos AI Studio.',
      getStarted: 'Mulai',
      step1: 'Buat profil suara pertama Anda',
      step2: 'Tambahkan sampel tulisan untuk melatih AI',
      step3: 'Mulai menganalisis dan menulis ulang konten',
      goToDashboard: 'Ke Dashboard',
      footerText: 'Pesan otomatis dari Graphos AI Studio',
      preheader: 'Akun Anda siap'
    }
  },

  ms: {
    hi: 'Hai',
    bestRegards: 'Yang benar',
    supportTeam: 'Pasukan Sokongan Graphos AI Studio',
    allRightsReserved: 'Hak cipta terpelihara',
    automatedMessage: 'Mesej automatik daripada Graphos AI Studio',
    otpVerification: {
      title: 'Sahkan Email',
      subtitle: 'Masukkan kod ini untuk melengkapkan pendaftaran',
      greeting: 'Selamat datang ke Graphos AI Studio!',
      instruction: 'Gunakan kod pengesahan di bawah untuk melengkapkan pendaftaran:',
      codeLabel: 'Kod Pengesahan',
      expiryNote: 'Kod ini akan tamat tempoh dalam {minutes} minit',
      securityNote: 'Jangan kongsi kod ini dengan sesiapa. Kami tidak akan meminta kod pengesahan anda.',
      ignoreNote: 'Jika anda tidak membuat akaun, abaikan e-mel ini.',
      footerText: 'E-mel pengesahan automatik',
      preheader: 'Kod pengesahan anda: {code}'
    },
    passwordReset: {
      title: 'Set Semula Kata Laluan',
      subtitle: 'Gunakan kod ini untuk set semula kata laluan',
      greeting: 'Permintaan Set Semula Kata Laluan',
      instruction: 'Kami menerima permintaan untuk set semula kata laluan anda. Gunakan kod di bawah:',
      codeLabel: 'Kod Set Semula',
      expiryNote: 'Kod ini akan tamat tempoh dalam {minutes} minit',
      securityNote: 'Untuk keselamatan, kod ini hanya boleh digunakan sekali.',
      ignoreNote: 'Jika anda tidak meminta set semula, abaikan e-mel ini.',
      footerText: 'E-mel set semula kata laluan automatik',
      preheader: 'Kod set semula anda: {code}'
    },
    newDeviceLogin: {
      title: 'Log Masuk Peranti Baharu Dikesan',
      subtitle: 'Amaran Keselamatan',
      instruction: 'Kami mengesan log masuk ke akaun anda dari peranti atau lokasi baharu.',
      deviceInfo: 'Maklumat Peranti',
      browser: 'Pelayar',
      location: 'Lokasi',
      time: 'Masa',
      ipAddress: 'Alamat IP',
      wasYou: 'Adakah ini anda?',
      wasYouYes: 'Jika ini anda, abaikan e-mel ini.',
      wasYouNo: 'Jika ini bukan anda, lindungi akaun anda segera dengan menukar kata laluan.',
      secureAccount: 'Lindungi Akaun Saya',
      footerText: 'Pemberitahuan keselamatan automatik',
      preheader: 'Log masuk baharu dikesan pada akaun anda'
    },
    passwordChanged: {
      title: 'Kata Laluan Ditukar',
      subtitle: 'Kata laluan anda telah dikemas kini',
      instruction: 'Kata laluan anda berjaya ditukar.',
      time: 'Ditukar pada',
      notYou: 'Jika anda tidak membuat perubahan ini, hubungi sokongan segera.',
      footerText: 'Pemberitahuan keselamatan automatik',
      preheader: 'Kata laluan anda telah ditukar'
    },
    supportReply: {
      title: 'Kami telah membalas {type} anda',
      typeFeedback: 'maklum balas',
      typeSupport: 'permintaan sokongan',
      thankYou: 'Terima kasih kerana menghubungi kami. Pasukan kami telah menyemak permintaan anda dan memberikan jawapan di bawah.',
      originalRequest: 'Permintaan Anda',
      ourResponse: 'Jawapan',
      furtherQuestions: 'Jika anda mempunyai soalan lanjut, jangan teragak-agak untuk membalas e-mel ini.',
      footerText: 'Jawapan kepada tiket sokongan anda',
      preheader: 'Kami telah membalas {type} anda'
    },
    welcome: {
      title: 'Selamat Datang!',
      subtitle: 'Akaun disahkan',
      greeting: 'Selamat datang ke Graphos AI Studio!',
      instruction: 'Anda bersedia untuk mula menggunakan Graphos AI Studio.',
      getStarted: 'Mula',
      step1: 'Cipta profil suara pertama anda',
      step2: 'Tambah sampel penulisan untuk melatih AI',
      step3: 'Mula menganalisis dan menulis semula kandungan',
      goToDashboard: 'Ke Dashboard',
      footerText: 'Mesej automatik daripada Graphos AI Studio',
      preheader: 'Akaun anda sedia'
    }
  }
};

const SUPPORTED_LANGS = Object.keys(translations);
const DEFAULT_LANG = 'en';


// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
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
  return `${ICON_BASE_URL}/${fileName}-${color}.png`;
}

function icon(name, color = 'black', size = 20) {
  const colorVariant = (color === 'white' || color === '#ffffff') ? 'white' : 'black';
  if (!ICON_BASE_URL) return '';
  return `<img src="${getIconUrl(name, colorVariant)}" alt="${name}" width="${size}" height="${size}" style="display:block;"/>`;
}

function logo(size = 36) {
  if (!ICON_BASE_URL) return '';
  return `<img src="${ICON_BASE_URL}/content.png" alt="Graphos AI Studio" width="${size}" height="${size}" style="display:block;border-radius:10px;"/>`;
}

// Header icon with circular background - email-safe table layout
function headerIcon(name, color = 'black', iconSize = 32, circleSize = 80) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 24px;">
  <tr>
    <td style="width:${circleSize}px;height:${circleSize}px;background-color:#f5f5f7;border-radius:50%;text-align:center;vertical-align:middle;">
      ${icon(name, color, iconSize)}
    </td>
  </tr>
</table>`;
}


// ============================================================================
// APPLE-STYLE BASE TEMPLATE
// ============================================================================
function appleBase({ content, footerText, lang = DEFAULT_LANG }) {
  const year = new Date().getFullYear();
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f7;">
    <tr>
      <td align="center" style="padding:48px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 40px rgba(0,0,0,0.06);">
          ${content}
          <!-- Footer -->
          <tr>
            <td style="padding:32px 40px;text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr><td align="center" style="padding-bottom:20px;">${logo(36)}</td></tr>
                <tr>
                  <td align="center">
                    <p style="margin:0 0 8px;color:#86868b;font-size:12px;line-height:1.5;font-weight:400;">${footerText}</p>
                    <p style="margin:0;color:#86868b;font-size:11px;">© ${year} Graphos AI Studio</p>
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


// ============================================================================
// EMAIL TEMPLATES - APPLE STYLE
// ============================================================================

/**
 * OTP Verification Email - Apple Style
 */
function otpVerificationEmail({ code, userName, expiryMinutes = 10, lang = DEFAULT_LANG }) {
  const content = `
    <!-- Header -->
    <tr>
      <td style="padding:48px 40px 32px;text-align:center;">
        ${headerIcon('mail', 'black', 32)}
        <h1 style="margin:0 0 8px;color:#1d1d1f;font-size:28px;font-weight:600;letter-spacing:-0.5px;line-height:1.2;">${t('otpVerification.title', lang)}</h1>
        <p style="margin:0;color:#86868b;font-size:15px;font-weight:400;">${t('otpVerification.subtitle', lang)}</p>
      </td>
    </tr>
    <!-- Content -->
    <tr>
      <td style="padding:0 40px 40px;">
        <p style="margin:0 0 24px;color:#1d1d1f;font-size:17px;line-height:1.5;text-align:center;">${t('hi', lang)} <strong>${userName}</strong>,</p>
        
        <!-- OTP Code Box with Info -->
        <div style="background-color:#f5f5f7;border-radius:20px;padding:32px;margin:24px 0;">
          <div style="text-align:center;padding-bottom:24px;border-bottom:1px solid rgba(0,0,0,0.06);">
            <p style="margin:0 0 12px;color:#86868b;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;font-weight:500;">${t('otpVerification.codeLabel', lang)}</p>
            <div style="font-size:44px;font-weight:700;letter-spacing:16px;color:#1d1d1f;font-family:'SF Mono','Courier New',monospace;padding:8px 0;">${code}</div>
          </div>
          <div style="padding-top:20px;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
              <tr>
                <td width="32" style="vertical-align:top;padding-top:2px;">${icon('info', 'black', 18)}</td>
                <td style="color:#1d1d1f;font-size:14px;line-height:1.5;">${t('otpVerification.expiryNote', lang, { minutes: expiryMinutes })}</td>
              </tr>
            </table>
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td width="32" style="vertical-align:top;padding-top:2px;">${icon('alertCircle', 'black', 18)}</td>
                <td style="color:#1d1d1f;font-size:14px;line-height:1.5;">${t('otpVerification.securityNote', lang)}</td>
              </tr>
            </table>
          </div>
        </div>
        
        <p style="margin:24px 0 0;color:#86868b;font-size:14px;line-height:1.5;text-align:center;">${t('otpVerification.ignoreNote', lang)}</p>
      </td>
    </tr>`;

  return appleBase({ content, footerText: t('otpVerification.footerText', lang), lang });
}

/**
 * Password Reset Email - Apple Style
 */
function passwordResetEmail({ code, userName, expiryMinutes = 15, lang = DEFAULT_LANG }) {
  const content = `
    <!-- Header -->
    <tr>
      <td style="padding:48px 40px 32px;text-align:center;">
        ${headerIcon('alertCircle', 'black', 32)}
        <h1 style="margin:0 0 8px;color:#1d1d1f;font-size:28px;font-weight:600;letter-spacing:-0.5px;line-height:1.2;">${t('passwordReset.title', lang)}</h1>
        <p style="margin:0;color:#86868b;font-size:15px;font-weight:400;">${t('passwordReset.subtitle', lang)}</p>
      </td>
    </tr>
    <!-- Content -->
    <tr>
      <td style="padding:0 40px 40px;">
        <p style="margin:0 0 24px;color:#1d1d1f;font-size:17px;line-height:1.5;text-align:center;">${t('hi', lang)} <strong>${userName}</strong>,</p>
        <p style="margin:0 0 32px;color:#86868b;font-size:15px;line-height:1.6;text-align:center;">${t('passwordReset.instruction', lang)}</p>
        
        <!-- Reset Code Box -->
        <div style="background-color:#f5f5f7;border-radius:20px;padding:32px;margin:24px 0;">
          <div style="text-align:center;padding-bottom:24px;border-bottom:1px solid rgba(0,0,0,0.06);">
            <p style="margin:0 0 12px;color:#86868b;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;font-weight:500;">${t('passwordReset.codeLabel', lang)}</p>
            <div style="font-size:44px;font-weight:700;letter-spacing:16px;color:#1d1d1f;font-family:'SF Mono','Courier New',monospace;padding:8px 0;">${code}</div>
          </div>
          <div style="padding-top:20px;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
              <tr>
                <td width="32" style="vertical-align:top;padding-top:2px;">${icon('info', 'black', 18)}</td>
                <td style="color:#1d1d1f;font-size:14px;line-height:1.5;">${t('passwordReset.expiryNote', lang, { minutes: expiryMinutes })}</td>
              </tr>
            </table>
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td width="32" style="vertical-align:top;padding-top:2px;">${icon('alertCircle', 'black', 18)}</td>
                <td style="color:#1d1d1f;font-size:14px;line-height:1.5;">${t('passwordReset.securityNote', lang)}</td>
              </tr>
            </table>
          </div>
        </div>
        
        <p style="margin:24px 0 0;color:#86868b;font-size:14px;line-height:1.5;text-align:center;">${t('passwordReset.ignoreNote', lang)}</p>
      </td>
    </tr>`;

  return appleBase({ content, footerText: t('passwordReset.footerText', lang), lang });
}


/**
 * Welcome Email - Apple Style
 */
function welcomeEmail({ userName, dashboardUrl, lang = DEFAULT_LANG }) {
  const content = `
    <!-- Header -->
    <tr>
      <td style="padding:48px 40px 32px;text-align:center;">
        ${headerIcon('check', 'black', 32)}
        <h1 style="margin:0 0 8px;color:#1d1d1f;font-size:28px;font-weight:600;letter-spacing:-0.5px;line-height:1.2;">${t('welcome.title', lang)}</h1>
        <p style="margin:0;color:#86868b;font-size:15px;font-weight:400;">${t('welcome.subtitle', lang)}</p>
      </td>
    </tr>
    <!-- Content -->
    <tr>
      <td style="padding:0 40px 40px;">
        <p style="margin:0 0 24px;color:#1d1d1f;font-size:17px;line-height:1.5;text-align:center;">${t('hi', lang)} <strong>${userName}</strong>,</p>
        <p style="margin:0 0 32px;color:#86868b;font-size:15px;line-height:1.6;text-align:center;">${t('welcome.instruction', lang)}</p>
        
        <!-- Getting Started -->
        <div style="background-color:#f5f5f7;border-radius:20px;padding:28px;margin:24px 0;">
          <p style="margin:0 0 20px;color:#1d1d1f;font-size:15px;font-weight:600;">${t('welcome.getStarted', lang)}</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:12px 0;border-bottom:1px solid rgba(0,0,0,0.06);">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="32">${icon('user', 'black', 18)}</td>
                    <td style="color:#1d1d1f;font-size:14px;">${t('welcome.step1', lang)}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 0;border-bottom:1px solid rgba(0,0,0,0.06);">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="32">${icon('file', 'black', 18)}</td>
                    <td style="color:#1d1d1f;font-size:14px;">${t('welcome.step2', lang)}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 0;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="32">${icon('barChart', 'black', 18)}</td>
                    <td style="color:#1d1d1f;font-size:14px;">${t('welcome.step3', lang)}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>
        
        <!-- CTA Button -->
        ${dashboardUrl ? `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding:24px 0;">
              <a href="${dashboardUrl}" style="display:inline-block;padding:16px 40px;background-color:#1d1d1f;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;border-radius:980px;">${t('welcome.goToDashboard', lang)}</a>
            </td>
          </tr>
        </table>` : ''}
      </td>
    </tr>`;

  return appleBase({ content, footerText: t('welcome.footerText', lang), lang });
}

/**
 * New Device Login Email - Apple Style
 */
function newDeviceLoginEmail({ userName, deviceInfo, ipAddress, location, loginTime, secureAccountUrl, lang = DEFAULT_LANG }) {
  const locale = getLocale(lang);
  const formattedTime = loginTime.toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' });

  const content = `
    <!-- Header -->
    <tr>
      <td style="padding:48px 40px 32px;text-align:center;">
        ${headerIcon('alertCircle', 'black', 32)}
        <h1 style="margin:0 0 8px;color:#1d1d1f;font-size:28px;font-weight:600;letter-spacing:-0.5px;line-height:1.2;">${t('newDeviceLogin.title', lang)}</h1>
        <p style="margin:0;color:#86868b;font-size:15px;font-weight:400;">${t('newDeviceLogin.subtitle', lang)}</p>
      </td>
    </tr>
    <!-- Content -->
    <tr>
      <td style="padding:0 40px 40px;">
        <p style="margin:0 0 24px;color:#1d1d1f;font-size:17px;line-height:1.5;text-align:center;">${t('hi', lang)} <strong>${userName}</strong>,</p>
        <p style="margin:0 0 32px;color:#86868b;font-size:15px;line-height:1.6;text-align:center;">${t('newDeviceLogin.instruction', lang)}</p>
        
        <!-- Device Info -->
        <div style="background-color:#f5f5f7;border-radius:20px;padding:24px;margin-bottom:24px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
            <tr>
              <td width="28">${icon('info', 'black', 16)}</td>
              <td style="color:#86868b;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:500;">${t('newDeviceLogin.deviceInfo', lang)}</td>
            </tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid rgba(0,0,0,0.06);color:#86868b;font-size:13px;">${t('newDeviceLogin.browser', lang)}</td>
              <td style="padding:10px 0;border-bottom:1px solid rgba(0,0,0,0.06);text-align:right;color:#1d1d1f;font-size:14px;">${deviceInfo || 'Unknown'}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid rgba(0,0,0,0.06);color:#86868b;font-size:13px;">${t('newDeviceLogin.location', lang)}</td>
              <td style="padding:10px 0;border-bottom:1px solid rgba(0,0,0,0.06);text-align:right;color:#1d1d1f;font-size:14px;">${location || 'Unknown'}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid rgba(0,0,0,0.06);color:#86868b;font-size:13px;">${t('newDeviceLogin.time', lang)}</td>
              <td style="padding:10px 0;border-bottom:1px solid rgba(0,0,0,0.06);text-align:right;color:#1d1d1f;font-size:14px;">${formattedTime}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#86868b;font-size:13px;">${t('newDeviceLogin.ipAddress', lang)}</td>
              <td style="padding:10px 0;text-align:right;color:#1d1d1f;font-size:14px;font-family:'SF Mono','Courier New',monospace;">${ipAddress || 'Unknown'}</td>
            </tr>
          </table>
        </div>
        
        <!-- Was this you? -->
        <div style="background-color:#f5f5f7;border-radius:20px;padding:24px;margin-bottom:24px;">
          <p style="margin:0 0 16px;color:#1d1d1f;font-size:15px;font-weight:600;">${t('newDeviceLogin.wasYou', lang)}</p>
          <p style="margin:0 0 12px;color:#1d1d1f;font-size:14px;line-height:1.5;"><strong>${t('hi', lang) === 'مرحباً' ? '✓' : '✓'}</strong> ${t('newDeviceLogin.wasYouYes', lang)}</p>
          <p style="margin:0;color:#1d1d1f;font-size:14px;line-height:1.5;"><strong>✗</strong> ${t('newDeviceLogin.wasYouNo', lang)}</p>
        </div>
        
        <!-- CTA -->
        ${secureAccountUrl ? `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding:16px 0;">
              <a href="${secureAccountUrl}" style="display:inline-block;padding:16px 40px;background-color:#1d1d1f;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;border-radius:980px;">${t('newDeviceLogin.secureAccount', lang)}</a>
            </td>
          </tr>
        </table>` : ''}
      </td>
    </tr>`;

  return appleBase({ content, footerText: t('newDeviceLogin.footerText', lang), lang });
}


/**
 * Password Changed Email - Apple Style
 */
function passwordChangedEmail({ userName, changedAt, lang = DEFAULT_LANG }) {
  const locale = getLocale(lang);
  const formattedTime = changedAt.toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' });

  const content = `
    <!-- Header -->
    <tr>
      <td style="padding:48px 40px 32px;text-align:center;">
        ${headerIcon('check', 'black', 32)}
        <h1 style="margin:0 0 8px;color:#1d1d1f;font-size:28px;font-weight:600;letter-spacing:-0.5px;line-height:1.2;">${t('passwordChanged.title', lang)}</h1>
        <p style="margin:0;color:#86868b;font-size:15px;font-weight:400;">${t('passwordChanged.subtitle', lang)}</p>
      </td>
    </tr>
    <!-- Content -->
    <tr>
      <td style="padding:0 40px 40px;">
        <p style="margin:0 0 24px;color:#1d1d1f;font-size:17px;line-height:1.5;text-align:center;">${t('hi', lang)} <strong>${userName}</strong>,</p>
        <p style="margin:0 0 32px;color:#86868b;font-size:15px;line-height:1.6;text-align:center;">${t('passwordChanged.instruction', lang)}</p>
        
        <!-- Change Info -->
        <div style="background-color:#f5f5f7;border-radius:20px;padding:32px;text-align:center;margin:24px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 12px;">
            <tr>
              <td width="28">${icon('calendar', 'black', 16)}</td>
              <td style="color:#86868b;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:500;">${t('passwordChanged.time', lang)}</td>
            </tr>
          </table>
          <p style="margin:0;color:#1d1d1f;font-size:20px;font-weight:600;">${formattedTime}</p>
        </div>
        
        <!-- Warning -->
        <div style="background-color:#f5f5f7;border-radius:20px;padding:24px;margin:24px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td width="32" style="vertical-align:top;padding-top:2px;">${icon('alertCircle', 'black', 18)}</td>
              <td style="color:#1d1d1f;font-size:14px;line-height:1.5;"><strong>${t('passwordChanged.notYou', lang)}</strong></td>
            </tr>
          </table>
        </div>
      </td>
    </tr>`;

  return appleBase({ content, footerText: t('passwordChanged.footerText', lang), lang });
}

/**
 * Support Reply Email - Apple Style
 */
function supportReplyEmail({ ticketId, ticketType, userName, ticketTitle, replyMessage, lang = DEFAULT_LANG }) {
  const isBilling = ticketType === 'billing_support';
  const typeText = isBilling ? t('supportReply.typeSupport', lang) : t('supportReply.typeFeedback', lang);

  const content = `
    <!-- Header -->
    <tr>
      <td style="padding:48px 40px 32px;text-align:center;">
        ${headerIcon('message', 'black', 32)}
        <h1 style="margin:0 0 8px;color:#1d1d1f;font-size:28px;font-weight:600;letter-spacing:-0.5px;line-height:1.2;">${t('supportReply.title', lang, { type: typeText })}</h1>
        <p style="margin:0;color:#86868b;font-size:15px;font-weight:400;">Ticket #${ticketId.substring(0, 8).toUpperCase()}</p>
      </td>
    </tr>
    <!-- Content -->
    <tr>
      <td style="padding:0 40px 40px;">
        <p style="margin:0 0 24px;color:#1d1d1f;font-size:17px;line-height:1.5;text-align:center;">${t('hi', lang)} <strong>${userName}</strong>,</p>
        <p style="margin:0 0 32px;color:#86868b;font-size:15px;line-height:1.6;text-align:center;">${t('supportReply.thankYou', lang)}</p>
        
        <!-- Original Request -->
        <div style="background-color:#f5f5f7;border-radius:20px;padding:24px;margin:24px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
            <tr>
              <td width="28">${icon('file', 'black', 16)}</td>
              <td style="color:#86868b;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:500;">${t('supportReply.originalRequest', lang)}</td>
            </tr>
          </table>
          <p style="margin:0;color:#1d1d1f;font-size:15px;line-height:1.6;">${ticketTitle}</p>
        </div>
        
        <!-- Response -->
        <div style="background-color:#1d1d1f;border-radius:20px;padding:24px;margin:24px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
            <tr>
              <td width="28">${icon('mail', 'white', 16)}</td>
              <td style="color:rgba(255,255,255,0.6);font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:500;">${t('supportReply.ourResponse', lang)}</td>
            </tr>
          </table>
          <p style="margin:0;color:#ffffff;font-size:15px;line-height:1.7;white-space:pre-wrap;">${replyMessage}</p>
        </div>
        
        <p style="margin:24px 0 0;color:#86868b;font-size:14px;line-height:1.5;text-align:center;">${t('supportReply.furtherQuestions', lang)}</p>
        <p style="margin:16px 0 0;color:#86868b;font-size:14px;line-height:1.5;text-align:center;">${t('bestRegards', lang)},<br/>${t('supportTeam', lang)}</p>
      </td>
    </tr>`;

  return appleBase({ content, footerText: t('supportReply.footerText', lang), lang });
}

// ============================================================================
// NEW TICKET EMAIL (Admin Notification)
// ============================================================================

/**
 * New Ticket Email - Notify admin when user submits feedback/support
 * Apple Style - Same design as other emails
 */
function newTicketEmail({ ticketId, ticketType, userName, userEmail, title, content: ticketContent, priority, category, adminPanelUrl }) {
  const isBilling = ticketType === 'billing_support';
  const typeText = isBilling ? 'Support Request' : 'Feedback';
  const now = new Date();
  const formattedDate = now.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

  const emailContent = `
    <!-- Header -->
    <tr>
      <td style="padding:48px 40px 32px;text-align:center;">
        ${headerIcon(isBilling ? 'creditCard' : 'file', 'black', 32)}
        <h1 style="margin:0 0 8px;color:#1d1d1f;font-size:28px;font-weight:600;letter-spacing:-0.5px;line-height:1.2;">New ${typeText}</h1>
        <p style="margin:0;color:#86868b;font-size:15px;font-weight:400;">Ticket #${ticketId.substring(0, 8).toUpperCase()}</p>
      </td>
    </tr>
    <!-- Content -->
    <tr>
      <td style="padding:0 40px 40px;">
        <!-- Ticket Info -->
        <div style="background-color:#f5f5f7;border-radius:20px;padding:24px;margin-bottom:24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:14px 0;border-bottom:1px solid rgba(0,0,0,0.06);">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="28">${icon('user', 'black', 16)}</td>
                    <td style="color:#86868b;font-size:13px;">From</td>
                    <td style="text-align:right;">
                      <span style="color:#1d1d1f;font-size:14px;font-weight:500;">${userName || 'Anonymous User'}</span><br/>
                      <span style="color:#86868b;font-size:13px;">${userEmail || 'No email provided'}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 0;border-bottom:1px solid rgba(0,0,0,0.06);">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="28">${icon('calendar', 'black', 16)}</td>
                    <td style="color:#86868b;font-size:13px;">Date</td>
                    <td style="text-align:right;color:#1d1d1f;font-size:14px;">${formattedDate}</td>
                  </tr>
                </table>
              </td>
            </tr>
            ${priority ? `
            <tr>
              <td style="padding:14px 0;border-bottom:1px solid rgba(0,0,0,0.06);">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="28">${icon('alertCircle', 'black', 16)}</td>
                    <td style="color:#86868b;font-size:13px;">Priority</td>
                    <td style="text-align:right;"><span style="display:inline-block;padding:4px 12px;background-color:${priority === 'high' || priority === 'urgent' ? '#1d1d1f' : '#86868b'};color:#fff;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;border-radius:980px;">${priority}</span></td>
                  </tr>
                </table>
              </td>
            </tr>` : ''}
            ${category ? `
            <tr>
              <td style="padding:14px 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="28">${icon('file', 'black', 16)}</td>
                    <td style="color:#86868b;font-size:13px;">Category</td>
                    <td style="text-align:right;color:#1d1d1f;font-size:14px;font-weight:500;">${category}</td>
                  </tr>
                </table>
              </td>
            </tr>` : ''}
          </table>
        </div>
        
        <!-- Title & Content -->
        <p style="margin:0 0 16px;color:#1d1d1f;font-size:17px;font-weight:600;">${title}</p>
        
        <div style="background-color:#f5f5f7;border-radius:20px;padding:24px;margin-bottom:24px;">
          <p style="margin:0;color:#1d1d1f;font-size:15px;line-height:1.7;white-space:pre-wrap;">${ticketContent}</p>
        </div>
        
        <!-- CTA -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding:16px 0;">
              <a href="${adminPanelUrl || 'https://admin.graphosai.com'}/support/${ticketId}" style="display:inline-block;padding:16px 40px;background-color:#1d1d1f;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;border-radius:980px;">View in Admin Panel</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;

  return appleBase({ content: emailContent, footerText: 'Automated notification from Graphos AI Studio Support System', lang: 'en' });
}

// ============================================================================
// EXPORTS
// ============================================================================
module.exports = {
  // Templates
  otpVerificationEmail,
  passwordResetEmail,
  welcomeEmail,
  newDeviceLoginEmail,
  passwordChangedEmail,
  supportReplyEmail,
  newTicketEmail,
  
  // Helpers
  t,
  getLocale,
  icon,
  headerIcon,
  logo,
  appleBase,
  
  // Constants
  translations,
  SUPPORTED_LANGS,
  DEFAULT_LANG,
  ICON_BASE_URL,
  ICON_FILES
};
