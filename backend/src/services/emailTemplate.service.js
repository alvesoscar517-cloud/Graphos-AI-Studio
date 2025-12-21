/**
 * Email Template Service - Apple Style Design
 * Modern, minimalist email templates with black & white theme
 * Supports 15 languages (i18n)
 * 
 * Supported languages: en, vi, zh, ja, ko, fr, de, es, pt, it, ru, ar, th, id, ms
 */

const envConfig = require('../config/envConfigHelper');
const { cidIcon, cidLogo, cidHeaderIcon, cidSrc } = require('../utils/emailCid');

// Keep ICON_BASE_URL as fallback for external references (optional)
const ICON_BASE_URL = envConfig.get('ICON_BASE_URL', 'https://alvesoscar517-cloud.github.io/icons-for-Gmail');

// Use CID-based functions for email templates
const icon = cidIcon;
const logo = cidLogo;
const headerIcon = cidHeaderIcon;

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
    },
    notification: {
      footerText: 'Notification from Graphos AI Studio',
      learnMore: 'Learn More',
      viewDetails: 'View Details',
      preheader: 'You have a new notification'
    },
    // Purchase confirmation email
    purchaseConfirmation: {
      title: 'Payment Successful!',
      subtitle: 'Thank you for your purchase',
      greeting: 'Great news!',
      instruction: 'Your payment has been processed successfully. Here are the details of your purchase:',
      orderDetails: 'Order Details',
      package: 'Package',
      creditsAdded: 'Credits Added',
      newBalance: 'New Balance',
      orderId: 'Order ID',
      date: 'Date',
      amount: 'Amount',
      thankYou: 'Thank you for choosing Graphos AI Studio. Your credits are ready to use!',
      startUsing: 'Start Using Credits',
      footerText: 'Payment confirmation from Graphos AI Studio',
      preheader: 'Your payment was successful - {credits} credits added'
    },
    // First purchase bonus email
    firstPurchaseBonus: {
      title: 'Welcome Bonus Unlocked!',
      subtitle: 'Double credits on your first purchase',
      greeting: 'Congratulations!',
      instruction: 'As a thank you for your first purchase, we\'ve doubled your credits!',
      bonusDetails: 'Bonus Details',
      baseCredits: 'Base Credits',
      bonusCredits: 'Bonus Credits (x2)',
      totalCredits: 'Total Credits',
      newBalance: 'New Balance',
      specialOffer: 'This is a one-time welcome bonus for new customers.',
      enjoyCredits: 'Enjoy your credits and explore all our AI features!',
      exploreFeatures: 'Explore Features',
      footerText: 'Welcome bonus notification from Graphos AI Studio',
      preheader: 'You received {bonus} bonus credits on your first purchase!'
    },
    // Low credits warning email
    lowCredits: {
      title: 'Credits Running Low',
      subtitle: 'Time to top up your account',
      greeting: 'Heads up!',
      instruction: 'Your credit balance is getting low. Top up now to continue using our AI features without interruption.',
      currentBalance: 'Current Balance',
      credits: 'credits',
      recommendation: 'We recommend keeping at least 50 credits for uninterrupted service.',
      topUpNow: 'Top Up Now',
      packages: 'View our credit packages and choose the one that fits your needs.',
      footerText: 'Account notification from Graphos AI Studio',
      preheader: 'Your credit balance is low - only {credits} credits remaining'
    },
    // Re-engagement email
    reEngagement: {
      title: 'We Miss You!',
      subtitle: 'Come back and explore what\'s new',
      greeting: 'It\'s been a while!',
      instruction: 'We noticed you haven\'t visited in a while. Here\'s what you\'ve been missing:',
      whatsNew: 'What\'s New',
      feature1: 'Improved AI analysis accuracy',
      feature2: 'Faster processing speeds',
      feature3: 'New voice profile features',
      yourCredits: 'Your Credits',
      creditsWaiting: 'You still have {credits} credits waiting for you.',
      comeBack: 'Come Back',
      weAreHere: 'We\'re here to help you create amazing content. See you soon!',
      footerText: 'We miss you at Graphos AI Studio',
      preheader: 'We miss you! Your {credits} credits are waiting'
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
    },
    notification: {
      footerText: 'Thông báo từ Graphos AI Studio',
      learnMore: 'Tìm hiểu thêm',
      viewDetails: 'Xem chi tiết',
      preheader: 'Bạn có thông báo mới'
    },
    purchaseConfirmation: {
      title: 'Thanh toán thành công!',
      subtitle: 'Cảm ơn bạn đã mua hàng',
      greeting: 'Tin vui!',
      instruction: 'Thanh toán của bạn đã được xử lý thành công. Dưới đây là chi tiết đơn hàng:',
      orderDetails: 'Chi tiết đơn hàng',
      package: 'Gói',
      creditsAdded: 'Credits được thêm',
      newBalance: 'Số dư mới',
      orderId: 'Mã đơn hàng',
      date: 'Ngày',
      amount: 'Số tiền',
      thankYou: 'Cảm ơn bạn đã chọn Graphos AI Studio. Credits của bạn đã sẵn sàng sử dụng!',
      startUsing: 'Bắt đầu sử dụng',
      footerText: 'Xác nhận thanh toán từ Graphos AI Studio',
      preheader: 'Thanh toán thành công - đã thêm {credits} credits'
    },
    firstPurchaseBonus: {
      title: 'Mở khóa thưởng chào mừng!',
      subtitle: 'Nhân đôi credits cho lần mua đầu tiên',
      greeting: 'Chúc mừng!',
      instruction: 'Để cảm ơn lần mua đầu tiên, chúng tôi đã nhân đôi credits cho bạn!',
      bonusDetails: 'Chi tiết thưởng',
      baseCredits: 'Credits cơ bản',
      bonusCredits: 'Credits thưởng (x2)',
      totalCredits: 'Tổng credits',
      newBalance: 'Số dư mới',
      specialOffer: 'Đây là ưu đãi chào mừng một lần dành cho khách hàng mới.',
      enjoyCredits: 'Tận hưởng credits và khám phá tất cả tính năng AI!',
      exploreFeatures: 'Khám phá tính năng',
      footerText: 'Thông báo thưởng chào mừng từ Graphos AI Studio',
      preheader: 'Bạn nhận được {bonus} credits thưởng cho lần mua đầu tiên!'
    },
    lowCredits: {
      title: 'Credits sắp hết',
      subtitle: 'Đã đến lúc nạp thêm',
      greeting: 'Lưu ý!',
      instruction: 'Số dư credits của bạn đang thấp. Nạp ngay để tiếp tục sử dụng các tính năng AI không gián đoạn.',
      currentBalance: 'Số dư hiện tại',
      credits: 'credits',
      recommendation: 'Chúng tôi khuyên bạn nên giữ ít nhất 50 credits để sử dụng liên tục.',
      topUpNow: 'Nạp ngay',
      packages: 'Xem các gói credits và chọn gói phù hợp với nhu cầu của bạn.',
      footerText: 'Thông báo tài khoản từ Graphos AI Studio',
      preheader: 'Số dư credits thấp - chỉ còn {credits} credits'
    },
    reEngagement: {
      title: 'Chúng tôi nhớ bạn!',
      subtitle: 'Quay lại và khám phá những gì mới',
      greeting: 'Đã lâu rồi!',
      instruction: 'Chúng tôi nhận thấy bạn chưa ghé thăm trong một thời gian. Đây là những gì bạn đã bỏ lỡ:',
      whatsNew: 'Có gì mới',
      feature1: 'Cải thiện độ chính xác phân tích AI',
      feature2: 'Tốc độ xử lý nhanh hơn',
      feature3: 'Tính năng hồ sơ giọng nói mới',
      yourCredits: 'Credits của bạn',
      creditsWaiting: 'Bạn vẫn còn {credits} credits đang chờ.',
      comeBack: 'Quay lại',
      weAreHere: 'Chúng tôi ở đây để giúp bạn tạo nội dung tuyệt vời. Hẹn gặp lại!',
      footerText: 'Chúng tôi nhớ bạn tại Graphos AI Studio',
      preheader: 'Chúng tôi nhớ bạn! {credits} credits đang chờ bạn'
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
    },
    purchaseConfirmation: {
      title: '支付成功！',
      subtitle: '感谢您的购买',
      greeting: '好消息！',
      instruction: '您的付款已成功处理。以下是您的订单详情：',
      orderDetails: '订单详情',
      package: '套餐',
      creditsAdded: '已添加积分',
      newBalance: '新余额',
      orderId: '订单号',
      date: '日期',
      amount: '金额',
      thankYou: '感谢您选择 Graphos AI Studio。您的积分已可使用！',
      startUsing: '开始使用',
      footerText: '来自 Graphos AI Studio 的付款确认',
      preheader: '支付成功 - 已添加 {credits} 积分'
    },
    firstPurchaseBonus: {
      title: '解锁欢迎奖励！',
      subtitle: '首次购买双倍积分',
      greeting: '恭喜！',
      instruction: '为感谢您的首次购买，我们已为您双倍积分！',
      bonusDetails: '奖励详情',
      baseCredits: '基础积分',
      bonusCredits: '奖励积分 (x2)',
      totalCredits: '总积分',
      newBalance: '新余额',
      specialOffer: '这是新客户的一次性欢迎奖励。',
      enjoyCredits: '享受您的积分，探索所有AI功能！',
      exploreFeatures: '探索功能',
      footerText: '来自 Graphos AI Studio 的欢迎奖励通知',
      preheader: '您首次购买获得 {bonus} 奖励积分！'
    },
    lowCredits: {
      title: '积分即将用完',
      subtitle: '是时候充值了',
      greeting: '提醒！',
      instruction: '您的积分余额较低。立即充值以继续使用我们的AI功能。',
      currentBalance: '当前余额',
      credits: '积分',
      recommendation: '我们建议保持至少50积分以确保服务不中断。',
      topUpNow: '立即充值',
      packages: '查看我们的积分套餐，选择适合您的。',
      footerText: '来自 Graphos AI Studio 的账户通知',
      preheader: '积分余额较低 - 仅剩 {credits} 积分'
    },
    reEngagement: {
      title: '我们想念您！',
      subtitle: '回来看看有什么新功能',
      greeting: '好久不见！',
      instruction: '我们注意到您有一段时间没有访问了。以下是您错过的内容：',
      whatsNew: '最新动态',
      feature1: '提升AI分析准确度',
      feature2: '更快的处理速度',
      feature3: '新的语音配置功能',
      yourCredits: '您的积分',
      creditsWaiting: '您还有 {credits} 积分等待使用。',
      comeBack: '回来看看',
      weAreHere: '我们随时帮助您创建精彩内容。期待再见！',
      footerText: '我们在 Graphos AI Studio 想念您',
      preheader: '我们想念您！{credits} 积分等待您使用'
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
    },
    purchaseConfirmation: {
      title: '支払い完了！',
      subtitle: 'ご購入ありがとうございます',
      greeting: '朗報です！',
      instruction: 'お支払いが正常に処理されました。ご注文の詳細は以下の通りです：',
      orderDetails: '注文詳細',
      package: 'パッケージ',
      creditsAdded: '追加クレジット',
      newBalance: '新しい残高',
      orderId: '注文ID',
      date: '日付',
      amount: '金額',
      thankYou: 'Graphos AI Studio をお選びいただきありがとうございます。クレジットはすぐにご利用いただけます！',
      startUsing: '使用開始',
      footerText: 'Graphos AI Studio からの支払い確認',
      preheader: '支払い完了 - {credits} クレジット追加'
    },
    firstPurchaseBonus: {
      title: 'ウェルカムボーナス獲得！',
      subtitle: '初回購入でクレジット2倍',
      greeting: 'おめでとうございます！',
      instruction: '初回購入のお礼として、クレジットを2倍にしました！',
      bonusDetails: 'ボーナス詳細',
      baseCredits: '基本クレジット',
      bonusCredits: 'ボーナスクレジット (x2)',
      totalCredits: '合計クレジット',
      newBalance: '新しい残高',
      specialOffer: 'これは新規のお客様への一度限りのウェルカムボーナスです。',
      enjoyCredits: 'クレジットを楽しんで、すべてのAI機能を探索してください！',
      exploreFeatures: '機能を探索',
      footerText: 'Graphos AI Studio からのウェルカムボーナス通知',
      preheader: '初回購入で {bonus} ボーナスクレジット獲得！'
    },
    lowCredits: {
      title: 'クレジット残高が少なくなっています',
      subtitle: 'チャージの時間です',
      greeting: 'お知らせ！',
      instruction: 'クレジット残高が少なくなっています。AI機能を中断なく使用するために今すぐチャージしてください。',
      currentBalance: '現在の残高',
      credits: 'クレジット',
      recommendation: 'サービスを中断なく利用するために、少なくとも50クレジットを維持することをお勧めします。',
      topUpNow: '今すぐチャージ',
      packages: 'クレジットパッケージを見て、ニーズに合ったものを選んでください。',
      footerText: 'Graphos AI Studio からのアカウント通知',
      preheader: 'クレジット残高が少ない - 残り {credits} クレジット'
    },
    reEngagement: {
      title: 'お会いできなくて寂しいです！',
      subtitle: '戻ってきて新機能をチェック',
      greeting: 'お久しぶりです！',
      instruction: 'しばらくお見えになっていないようです。見逃したものをご紹介します：',
      whatsNew: '新着情報',
      feature1: 'AI分析精度の向上',
      feature2: '処理速度の高速化',
      feature3: '新しい音声プロファイル機能',
      yourCredits: 'あなたのクレジット',
      creditsWaiting: 'まだ {credits} クレジットが待っています。',
      comeBack: '戻る',
      weAreHere: '素晴らしいコンテンツ作成をお手伝いします。またお会いしましょう！',
      footerText: 'Graphos AI Studio でお待ちしています',
      preheader: 'お会いできなくて寂しいです！{credits} クレジットが待っています'
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
    },
    purchaseConfirmation: {
      title: '결제 완료!',
      subtitle: '구매해 주셔서 감사합니다',
      greeting: '좋은 소식입니다!',
      instruction: '결제가 성공적으로 처리되었습니다. 주문 세부 정보는 다음과 같습니다:',
      orderDetails: '주문 세부 정보',
      package: '패키지',
      creditsAdded: '추가된 크레딧',
      newBalance: '새 잔액',
      orderId: '주문 ID',
      date: '날짜',
      amount: '금액',
      thankYou: 'Graphos AI Studio를 선택해 주셔서 감사합니다. 크레딧을 바로 사용하실 수 있습니다!',
      startUsing: '사용 시작',
      footerText: 'Graphos AI Studio 결제 확인',
      preheader: '결제 완료 - {credits} 크레딧 추가됨'
    },
    firstPurchaseBonus: {
      title: '웰컴 보너스 획득!',
      subtitle: '첫 구매 시 크레딧 2배',
      greeting: '축하합니다!',
      instruction: '첫 구매에 대한 감사의 표시로 크레딧을 2배로 드렸습니다!',
      bonusDetails: '보너스 세부 정보',
      baseCredits: '기본 크레딧',
      bonusCredits: '보너스 크레딧 (x2)',
      totalCredits: '총 크레딧',
      newBalance: '새 잔액',
      specialOffer: '이것은 신규 고객을 위한 일회성 웰컴 보너스입니다.',
      enjoyCredits: '크레딧을 즐기고 모든 AI 기능을 탐색하세요!',
      exploreFeatures: '기능 탐색',
      footerText: 'Graphos AI Studio 웰컴 보너스 알림',
      preheader: '첫 구매로 {bonus} 보너스 크레딧 획득!'
    },
    lowCredits: {
      title: '크레딧이 부족합니다',
      subtitle: '충전할 시간입니다',
      greeting: '알림!',
      instruction: '크레딧 잔액이 부족합니다. AI 기능을 중단 없이 사용하려면 지금 충전하세요.',
      currentBalance: '현재 잔액',
      credits: '크레딧',
      recommendation: '서비스 중단 없이 사용하려면 최소 50 크레딧을 유지하는 것이 좋습니다.',
      topUpNow: '지금 충전',
      packages: '크레딧 패키지를 보고 필요에 맞는 것을 선택하세요.',
      footerText: 'Graphos AI Studio 계정 알림',
      preheader: '크레딧 잔액 부족 - {credits} 크레딧만 남음'
    },
    reEngagement: {
      title: '보고 싶었어요!',
      subtitle: '돌아와서 새로운 기능을 확인하세요',
      greeting: '오랜만이에요!',
      instruction: '한동안 방문하지 않으셨네요. 놓친 것들을 소개합니다:',
      whatsNew: '새로운 소식',
      feature1: 'AI 분석 정확도 향상',
      feature2: '더 빠른 처리 속도',
      feature3: '새로운 음성 프로필 기능',
      yourCredits: '내 크레딧',
      creditsWaiting: '아직 {credits} 크레딧이 기다리고 있습니다.',
      comeBack: '돌아오기',
      weAreHere: '멋진 콘텐츠 제작을 도와드리겠습니다. 곧 만나요!',
      footerText: 'Graphos AI Studio에서 기다리고 있어요',
      preheader: '보고 싶었어요! {credits} 크레딧이 기다리고 있습니다'
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
    },
    purchaseConfirmation: {
      title: 'Paiement réussi !',
      subtitle: 'Merci pour votre achat',
      greeting: 'Bonne nouvelle !',
      instruction: 'Votre paiement a été traité avec succès. Voici les détails de votre commande :',
      orderDetails: 'Détails de la commande',
      package: 'Forfait',
      creditsAdded: 'Crédits ajoutés',
      newBalance: 'Nouveau solde',
      orderId: 'N° de commande',
      date: 'Date',
      amount: 'Montant',
      thankYou: 'Merci d\'avoir choisi Graphos AI Studio. Vos crédits sont prêts à être utilisés !',
      startUsing: 'Commencer à utiliser',
      footerText: 'Confirmation de paiement de Graphos AI Studio',
      preheader: 'Paiement réussi - {credits} crédits ajoutés'
    },
    firstPurchaseBonus: {
      title: 'Bonus de bienvenue débloqué !',
      subtitle: 'Crédits doublés pour votre premier achat',
      greeting: 'Félicitations !',
      instruction: 'Pour vous remercier de votre premier achat, nous avons doublé vos crédits !',
      bonusDetails: 'Détails du bonus',
      baseCredits: 'Crédits de base',
      bonusCredits: 'Crédits bonus (x2)',
      totalCredits: 'Total des crédits',
      newBalance: 'Nouveau solde',
      specialOffer: 'C\'est un bonus de bienvenue unique pour les nouveaux clients.',
      enjoyCredits: 'Profitez de vos crédits et explorez toutes nos fonctionnalités IA !',
      exploreFeatures: 'Explorer les fonctionnalités',
      footerText: 'Notification de bonus de bienvenue de Graphos AI Studio',
      preheader: 'Vous avez reçu {bonus} crédits bonus pour votre premier achat !'
    },
    lowCredits: {
      title: 'Crédits bientôt épuisés',
      subtitle: 'Il est temps de recharger',
      greeting: 'Attention !',
      instruction: 'Votre solde de crédits est faible. Rechargez maintenant pour continuer à utiliser nos fonctionnalités IA sans interruption.',
      currentBalance: 'Solde actuel',
      credits: 'crédits',
      recommendation: 'Nous recommandons de maintenir au moins 50 crédits pour un service ininterrompu.',
      topUpNow: 'Recharger maintenant',
      packages: 'Consultez nos forfaits de crédits et choisissez celui qui vous convient.',
      footerText: 'Notification de compte de Graphos AI Studio',
      preheader: 'Solde de crédits faible - seulement {credits} crédits restants'
    },
    reEngagement: {
      title: 'Vous nous manquez !',
      subtitle: 'Revenez découvrir les nouveautés',
      greeting: 'Ça fait longtemps !',
      instruction: 'Nous avons remarqué que vous n\'êtes pas venu depuis un moment. Voici ce que vous avez manqué :',
      whatsNew: 'Nouveautés',
      feature1: 'Précision d\'analyse IA améliorée',
      feature2: 'Vitesses de traitement plus rapides',
      feature3: 'Nouvelles fonctionnalités de profil vocal',
      yourCredits: 'Vos crédits',
      creditsWaiting: 'Vous avez encore {credits} crédits qui vous attendent.',
      comeBack: 'Revenir',
      weAreHere: 'Nous sommes là pour vous aider à créer du contenu incroyable. À bientôt !',
      footerText: 'Vous nous manquez chez Graphos AI Studio',
      preheader: 'Vous nous manquez ! {credits} crédits vous attendent'
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
    },
    purchaseConfirmation: {
      title: 'Zahlung erfolgreich!',
      subtitle: 'Vielen Dank für Ihren Kauf',
      greeting: 'Gute Nachrichten!',
      instruction: 'Ihre Zahlung wurde erfolgreich verarbeitet. Hier sind die Details Ihrer Bestellung:',
      orderDetails: 'Bestelldetails',
      package: 'Paket',
      creditsAdded: 'Hinzugefügte Credits',
      newBalance: 'Neuer Kontostand',
      orderId: 'Bestellnummer',
      date: 'Datum',
      amount: 'Betrag',
      thankYou: 'Vielen Dank, dass Sie sich für Graphos AI Studio entschieden haben. Ihre Credits sind einsatzbereit!',
      startUsing: 'Jetzt nutzen',
      footerText: 'Zahlungsbestätigung von Graphos AI Studio',
      preheader: 'Zahlung erfolgreich - {credits} Credits hinzugefügt'
    },
    firstPurchaseBonus: {
      title: 'Willkommensbonus freigeschaltet!',
      subtitle: 'Doppelte Credits bei Ihrem ersten Kauf',
      greeting: 'Herzlichen Glückwunsch!',
      instruction: 'Als Dankeschön für Ihren ersten Kauf haben wir Ihre Credits verdoppelt!',
      bonusDetails: 'Bonusdetails',
      baseCredits: 'Basis-Credits',
      bonusCredits: 'Bonus-Credits (x2)',
      totalCredits: 'Gesamt-Credits',
      newBalance: 'Neuer Kontostand',
      specialOffer: 'Dies ist ein einmaliger Willkommensbonus für Neukunden.',
      enjoyCredits: 'Genießen Sie Ihre Credits und entdecken Sie alle KI-Funktionen!',
      exploreFeatures: 'Funktionen entdecken',
      footerText: 'Willkommensbonus-Benachrichtigung von Graphos AI Studio',
      preheader: 'Sie haben {bonus} Bonus-Credits für Ihren ersten Kauf erhalten!'
    },
    lowCredits: {
      title: 'Credits werden knapp',
      subtitle: 'Zeit zum Aufladen',
      greeting: 'Hinweis!',
      instruction: 'Ihr Credit-Guthaben ist niedrig. Laden Sie jetzt auf, um unsere KI-Funktionen ohne Unterbrechung weiter zu nutzen.',
      currentBalance: 'Aktueller Kontostand',
      credits: 'Credits',
      recommendation: 'Wir empfehlen, mindestens 50 Credits für einen unterbrechungsfreien Service zu halten.',
      topUpNow: 'Jetzt aufladen',
      packages: 'Sehen Sie sich unsere Credit-Pakete an und wählen Sie das passende.',
      footerText: 'Kontobenachrichtigung von Graphos AI Studio',
      preheader: 'Niedriger Credit-Stand - nur noch {credits} Credits'
    },
    reEngagement: {
      title: 'Wir vermissen Sie!',
      subtitle: 'Kommen Sie zurück und entdecken Sie Neues',
      greeting: 'Lange nicht gesehen!',
      instruction: 'Wir haben bemerkt, dass Sie eine Weile nicht da waren. Hier ist, was Sie verpasst haben:',
      whatsNew: 'Neuigkeiten',
      feature1: 'Verbesserte KI-Analysegenauigkeit',
      feature2: 'Schnellere Verarbeitungsgeschwindigkeiten',
      feature3: 'Neue Stimmprofil-Funktionen',
      yourCredits: 'Ihre Credits',
      creditsWaiting: 'Sie haben noch {credits} Credits, die auf Sie warten.',
      comeBack: 'Zurückkommen',
      weAreHere: 'Wir sind hier, um Ihnen bei der Erstellung großartiger Inhalte zu helfen. Bis bald!',
      footerText: 'Wir vermissen Sie bei Graphos AI Studio',
      preheader: 'Wir vermissen Sie! {credits} Credits warten auf Sie'
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
    },
    purchaseConfirmation: {
      title: '¡Pago exitoso!',
      subtitle: 'Gracias por tu compra',
      greeting: '¡Buenas noticias!',
      instruction: 'Tu pago se ha procesado correctamente. Aquí están los detalles de tu pedido:',
      orderDetails: 'Detalles del pedido',
      package: 'Paquete',
      creditsAdded: 'Créditos añadidos',
      newBalance: 'Nuevo saldo',
      orderId: 'ID de pedido',
      date: 'Fecha',
      amount: 'Importe',
      thankYou: '¡Gracias por elegir Graphos AI Studio. Tus créditos están listos para usar!',
      startUsing: 'Empezar a usar',
      footerText: 'Confirmación de pago de Graphos AI Studio',
      preheader: 'Pago exitoso - {credits} créditos añadidos'
    },
    firstPurchaseBonus: {
      title: '¡Bono de bienvenida desbloqueado!',
      subtitle: 'Créditos dobles en tu primera compra',
      greeting: '¡Felicidades!',
      instruction: '¡Como agradecimiento por tu primera compra, hemos duplicado tus créditos!',
      bonusDetails: 'Detalles del bono',
      baseCredits: 'Créditos base',
      bonusCredits: 'Créditos de bono (x2)',
      totalCredits: 'Total de créditos',
      newBalance: 'Nuevo saldo',
      specialOffer: 'Este es un bono de bienvenida único para nuevos clientes.',
      enjoyCredits: '¡Disfruta tus créditos y explora todas nuestras funciones de IA!',
      exploreFeatures: 'Explorar funciones',
      footerText: 'Notificación de bono de bienvenida de Graphos AI Studio',
      preheader: '¡Recibiste {bonus} créditos de bono en tu primera compra!'
    },
    lowCredits: {
      title: 'Créditos agotándose',
      subtitle: 'Es hora de recargar',
      greeting: '¡Atención!',
      instruction: 'Tu saldo de créditos está bajo. Recarga ahora para seguir usando nuestras funciones de IA sin interrupciones.',
      currentBalance: 'Saldo actual',
      credits: 'créditos',
      recommendation: 'Recomendamos mantener al menos 50 créditos para un servicio ininterrumpido.',
      topUpNow: 'Recargar ahora',
      packages: 'Consulta nuestros paquetes de créditos y elige el que mejor se adapte a ti.',
      footerText: 'Notificación de cuenta de Graphos AI Studio',
      preheader: 'Saldo de créditos bajo - solo quedan {credits} créditos'
    },
    reEngagement: {
      title: '¡Te extrañamos!',
      subtitle: 'Vuelve y descubre las novedades',
      greeting: '¡Hace tiempo!',
      instruction: 'Notamos que no has visitado en un tiempo. Esto es lo que te has perdido:',
      whatsNew: 'Novedades',
      feature1: 'Precisión de análisis de IA mejorada',
      feature2: 'Velocidades de procesamiento más rápidas',
      feature3: 'Nuevas funciones de perfil de voz',
      yourCredits: 'Tus créditos',
      creditsWaiting: 'Todavía tienes {credits} créditos esperándote.',
      comeBack: 'Volver',
      weAreHere: 'Estamos aquí para ayudarte a crear contenido increíble. ¡Hasta pronto!',
      footerText: 'Te extrañamos en Graphos AI Studio',
      preheader: '¡Te extrañamos! {credits} créditos te esperan'
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
    },
    purchaseConfirmation: {
      title: 'Pagamento bem-sucedido!',
      subtitle: 'Obrigado pela sua compra',
      greeting: 'Ótimas notícias!',
      instruction: 'Seu pagamento foi processado com sucesso. Aqui estão os detalhes do seu pedido:',
      orderDetails: 'Detalhes do pedido',
      package: 'Pacote',
      creditsAdded: 'Créditos adicionados',
      newBalance: 'Novo saldo',
      orderId: 'ID do pedido',
      date: 'Data',
      amount: 'Valor',
      thankYou: 'Obrigado por escolher o Graphos AI Studio. Seus créditos estão prontos para usar!',
      startUsing: 'Começar a usar',
      footerText: 'Confirmação de pagamento do Graphos AI Studio',
      preheader: 'Pagamento bem-sucedido - {credits} créditos adicionados'
    },
    firstPurchaseBonus: {
      title: 'Bônus de boas-vindas desbloqueado!',
      subtitle: 'Créditos em dobro na sua primeira compra',
      greeting: 'Parabéns!',
      instruction: 'Como agradecimento pela sua primeira compra, dobramos seus créditos!',
      bonusDetails: 'Detalhes do bônus',
      baseCredits: 'Créditos base',
      bonusCredits: 'Créditos de bônus (x2)',
      totalCredits: 'Total de créditos',
      newBalance: 'Novo saldo',
      specialOffer: 'Este é um bônus de boas-vindas único para novos clientes.',
      enjoyCredits: 'Aproveite seus créditos e explore todos os recursos de IA!',
      exploreFeatures: 'Explorar recursos',
      footerText: 'Notificação de bônus de boas-vindas do Graphos AI Studio',
      preheader: 'Você recebeu {bonus} créditos de bônus na sua primeira compra!'
    },
    lowCredits: {
      title: 'Créditos acabando',
      subtitle: 'Hora de recarregar',
      greeting: 'Atenção!',
      instruction: 'Seu saldo de créditos está baixo. Recarregue agora para continuar usando nossos recursos de IA sem interrupção.',
      currentBalance: 'Saldo atual',
      credits: 'créditos',
      recommendation: 'Recomendamos manter pelo menos 50 créditos para um serviço ininterrupto.',
      topUpNow: 'Recarregar agora',
      packages: 'Veja nossos pacotes de créditos e escolha o que melhor se adapta a você.',
      footerText: 'Notificação de conta do Graphos AI Studio',
      preheader: 'Saldo de créditos baixo - apenas {credits} créditos restantes'
    },
    reEngagement: {
      title: 'Sentimos sua falta!',
      subtitle: 'Volte e descubra as novidades',
      greeting: 'Faz tempo!',
      instruction: 'Notamos que você não nos visitou há um tempo. Veja o que você perdeu:',
      whatsNew: 'Novidades',
      feature1: 'Precisão de análise de IA aprimorada',
      feature2: 'Velocidades de processamento mais rápidas',
      feature3: 'Novos recursos de perfil de voz',
      yourCredits: 'Seus créditos',
      creditsWaiting: 'Você ainda tem {credits} créditos esperando por você.',
      comeBack: 'Voltar',
      weAreHere: 'Estamos aqui para ajudá-lo a criar conteúdo incrível. Até breve!',
      footerText: 'Sentimos sua falta no Graphos AI Studio',
      preheader: 'Sentimos sua falta! {credits} créditos estão esperando'
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
    },
    purchaseConfirmation: {
      title: 'Pagamento riuscito!',
      subtitle: 'Grazie per il tuo acquisto',
      greeting: 'Ottime notizie!',
      instruction: 'Il tuo pagamento è stato elaborato con successo. Ecco i dettagli del tuo ordine:',
      orderDetails: 'Dettagli ordine',
      package: 'Pacchetto',
      creditsAdded: 'Crediti aggiunti',
      newBalance: 'Nuovo saldo',
      orderId: 'ID ordine',
      date: 'Data',
      amount: 'Importo',
      thankYou: 'Grazie per aver scelto Graphos AI Studio. I tuoi crediti sono pronti per l\'uso!',
      startUsing: 'Inizia a usare',
      footerText: 'Conferma di pagamento da Graphos AI Studio',
      preheader: 'Pagamento riuscito - {credits} crediti aggiunti'
    },
    firstPurchaseBonus: {
      title: 'Bonus di benvenuto sbloccato!',
      subtitle: 'Crediti raddoppiati sul tuo primo acquisto',
      greeting: 'Congratulazioni!',
      instruction: 'Come ringraziamento per il tuo primo acquisto, abbiamo raddoppiato i tuoi crediti!',
      bonusDetails: 'Dettagli bonus',
      baseCredits: 'Crediti base',
      bonusCredits: 'Crediti bonus (x2)',
      totalCredits: 'Totale crediti',
      newBalance: 'Nuovo saldo',
      specialOffer: 'Questo è un bonus di benvenuto una tantum per i nuovi clienti.',
      enjoyCredits: 'Goditi i tuoi crediti ed esplora tutte le funzionalità IA!',
      exploreFeatures: 'Esplora funzionalità',
      footerText: 'Notifica bonus di benvenuto da Graphos AI Studio',
      preheader: 'Hai ricevuto {bonus} crediti bonus sul tuo primo acquisto!'
    },
    lowCredits: {
      title: 'Crediti in esaurimento',
      subtitle: 'È ora di ricaricare',
      greeting: 'Attenzione!',
      instruction: 'Il tuo saldo crediti è basso. Ricarica ora per continuare a usare le nostre funzionalità IA senza interruzioni.',
      currentBalance: 'Saldo attuale',
      credits: 'crediti',
      recommendation: 'Consigliamo di mantenere almeno 50 crediti per un servizio ininterrotto.',
      topUpNow: 'Ricarica ora',
      packages: 'Consulta i nostri pacchetti di crediti e scegli quello più adatto a te.',
      footerText: 'Notifica account da Graphos AI Studio',
      preheader: 'Saldo crediti basso - solo {credits} crediti rimasti'
    },
    reEngagement: {
      title: 'Ci manchi!',
      subtitle: 'Torna a scoprire le novità',
      greeting: 'È passato un po\'!',
      instruction: 'Abbiamo notato che non ci visiti da un po\'. Ecco cosa ti sei perso:',
      whatsNew: 'Novità',
      feature1: 'Precisione dell\'analisi IA migliorata',
      feature2: 'Velocità di elaborazione più rapide',
      feature3: 'Nuove funzionalità del profilo vocale',
      yourCredits: 'I tuoi crediti',
      creditsWaiting: 'Hai ancora {credits} crediti che ti aspettano.',
      comeBack: 'Torna',
      weAreHere: 'Siamo qui per aiutarti a creare contenuti fantastici. A presto!',
      footerText: 'Ci manchi su Graphos AI Studio',
      preheader: 'Ci manchi! {credits} crediti ti aspettano'
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
    },
    purchaseConfirmation: {
      title: 'Оплата успешна!',
      subtitle: 'Спасибо за покупку',
      greeting: 'Отличные новости!',
      instruction: 'Ваш платёж успешно обработан. Вот детали вашего заказа:',
      orderDetails: 'Детали заказа',
      package: 'Пакет',
      creditsAdded: 'Добавлено кредитов',
      newBalance: 'Новый баланс',
      orderId: 'ID заказа',
      date: 'Дата',
      amount: 'Сумма',
      thankYou: 'Спасибо, что выбрали Graphos AI Studio. Ваши кредиты готовы к использованию!',
      startUsing: 'Начать использовать',
      footerText: 'Подтверждение оплаты от Graphos AI Studio',
      preheader: 'Оплата успешна - добавлено {credits} кредитов'
    },
    firstPurchaseBonus: {
      title: 'Приветственный бонус разблокирован!',
      subtitle: 'Двойные кредиты при первой покупке',
      greeting: 'Поздравляем!',
      instruction: 'В благодарность за первую покупку мы удвоили ваши кредиты!',
      bonusDetails: 'Детали бонуса',
      baseCredits: 'Базовые кредиты',
      bonusCredits: 'Бонусные кредиты (x2)',
      totalCredits: 'Всего кредитов',
      newBalance: 'Новый баланс',
      specialOffer: 'Это единоразовый приветственный бонус для новых клиентов.',
      enjoyCredits: 'Наслаждайтесь кредитами и исследуйте все функции ИИ!',
      exploreFeatures: 'Исследовать функции',
      footerText: 'Уведомление о приветственном бонусе от Graphos AI Studio',
      preheader: 'Вы получили {bonus} бонусных кредитов за первую покупку!'
    },
    lowCredits: {
      title: 'Кредиты заканчиваются',
      subtitle: 'Пора пополнить',
      greeting: 'Внимание!',
      instruction: 'Ваш баланс кредитов низкий. Пополните сейчас, чтобы продолжить использовать наши функции ИИ без перерывов.',
      currentBalance: 'Текущий баланс',
      credits: 'кредитов',
      recommendation: 'Рекомендуем поддерживать минимум 50 кредитов для бесперебойной работы.',
      topUpNow: 'Пополнить сейчас',
      packages: 'Посмотрите наши пакеты кредитов и выберите подходящий.',
      footerText: 'Уведомление об аккаунте от Graphos AI Studio',
      preheader: 'Низкий баланс кредитов - осталось только {credits} кредитов'
    },
    reEngagement: {
      title: 'Мы скучаем по вам!',
      subtitle: 'Вернитесь и узнайте, что нового',
      greeting: 'Давно не виделись!',
      instruction: 'Мы заметили, что вы давно не заходили. Вот что вы пропустили:',
      whatsNew: 'Что нового',
      feature1: 'Улучшенная точность анализа ИИ',
      feature2: 'Более быстрая скорость обработки',
      feature3: 'Новые функции голосового профиля',
      yourCredits: 'Ваши кредиты',
      creditsWaiting: 'У вас ещё есть {credits} кредитов, которые вас ждут.',
      comeBack: 'Вернуться',
      weAreHere: 'Мы здесь, чтобы помочь вам создавать потрясающий контент. До скорой встречи!',
      footerText: 'Мы скучаем по вам в Graphos AI Studio',
      preheader: 'Мы скучаем по вам! {credits} кредитов ждут вас'
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
    },
    purchaseConfirmation: {
      title: 'تم الدفع بنجاح!',
      subtitle: 'شكراً لشرائك',
      greeting: 'أخبار رائعة!',
      instruction: 'تمت معالجة دفعتك بنجاح. إليك تفاصيل طلبك:',
      orderDetails: 'تفاصيل الطلب',
      package: 'الباقة',
      creditsAdded: 'الرصيد المضاف',
      newBalance: 'الرصيد الجديد',
      orderId: 'رقم الطلب',
      date: 'التاريخ',
      amount: 'المبلغ',
      thankYou: 'شكراً لاختيارك Graphos AI Studio. رصيدك جاهز للاستخدام!',
      startUsing: 'ابدأ الاستخدام',
      footerText: 'تأكيد الدفع من Graphos AI Studio',
      preheader: 'تم الدفع بنجاح - تمت إضافة {credits} رصيد'
    },
    firstPurchaseBonus: {
      title: 'تم فتح مكافأة الترحيب!',
      subtitle: 'رصيد مضاعف في أول عملية شراء',
      greeting: 'تهانينا!',
      instruction: 'شكراً لأول عملية شراء، قمنا بمضاعفة رصيدك!',
      bonusDetails: 'تفاصيل المكافأة',
      baseCredits: 'الرصيد الأساسي',
      bonusCredits: 'رصيد المكافأة (x2)',
      totalCredits: 'إجمالي الرصيد',
      newBalance: 'الرصيد الجديد',
      specialOffer: 'هذه مكافأة ترحيب لمرة واحدة للعملاء الجدد.',
      enjoyCredits: 'استمتع برصيدك واستكشف جميع ميزات الذكاء الاصطناعي!',
      exploreFeatures: 'استكشف الميزات',
      footerText: 'إشعار مكافأة الترحيب من Graphos AI Studio',
      preheader: 'حصلت على {bonus} رصيد مكافأة في أول عملية شراء!'
    },
    lowCredits: {
      title: 'الرصيد ينفد',
      subtitle: 'حان وقت الشحن',
      greeting: 'تنبيه!',
      instruction: 'رصيدك منخفض. اشحن الآن لمواصلة استخدام ميزات الذكاء الاصطناعي دون انقطاع.',
      currentBalance: 'الرصيد الحالي',
      credits: 'رصيد',
      recommendation: 'نوصي بالحفاظ على 50 رصيد على الأقل لخدمة متواصلة.',
      topUpNow: 'اشحن الآن',
      packages: 'اطلع على باقات الرصيد واختر ما يناسبك.',
      footerText: 'إشعار الحساب من Graphos AI Studio',
      preheader: 'رصيد منخفض - متبقي {credits} رصيد فقط'
    },
    reEngagement: {
      title: 'نفتقدك!',
      subtitle: 'عد واكتشف الجديد',
      greeting: 'مرحباً من جديد!',
      instruction: 'لاحظنا أنك لم تزرنا منذ فترة. إليك ما فاتك:',
      whatsNew: 'ما الجديد',
      feature1: 'دقة تحليل ذكاء اصطناعي محسّنة',
      feature2: 'سرعات معالجة أسرع',
      feature3: 'ميزات ملف صوتي جديدة',
      yourCredits: 'رصيدك',
      creditsWaiting: 'لا يزال لديك {credits} رصيد في انتظارك.',
      comeBack: 'عد الآن',
      weAreHere: 'نحن هنا لمساعدتك في إنشاء محتوى رائع. نراك قريباً!',
      footerText: 'نفتقدك في Graphos AI Studio',
      preheader: 'نفتقدك! {credits} رصيد في انتظارك'
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
    },
    purchaseConfirmation: {
      title: 'ชำระเงินสำเร็จ!',
      subtitle: 'ขอบคุณสำหรับการซื้อ',
      greeting: 'ข่าวดี!',
      instruction: 'การชำระเงินของคุณดำเนินการสำเร็จแล้ว นี่คือรายละเอียดคำสั่งซื้อ:',
      orderDetails: 'รายละเอียดคำสั่งซื้อ',
      package: 'แพ็คเกจ',
      creditsAdded: 'เครดิตที่เพิ่ม',
      newBalance: 'ยอดคงเหลือใหม่',
      orderId: 'รหัสคำสั่งซื้อ',
      date: 'วันที่',
      amount: 'จำนวนเงิน',
      thankYou: 'ขอบคุณที่เลือก Graphos AI Studio เครดิตของคุณพร้อมใช้งานแล้ว!',
      startUsing: 'เริ่มใช้งาน',
      footerText: 'การยืนยันการชำระเงินจาก Graphos AI Studio',
      preheader: 'ชำระเงินสำเร็จ - เพิ่ม {credits} เครดิต'
    },
    firstPurchaseBonus: {
      title: 'ปลดล็อคโบนัสต้อนรับ!',
      subtitle: 'เครดิตสองเท่าสำหรับการซื้อครั้งแรก',
      greeting: 'ยินดีด้วย!',
      instruction: 'เพื่อขอบคุณสำหรับการซื้อครั้งแรก เราได้เพิ่มเครดิตเป็นสองเท่าให้คุณ!',
      bonusDetails: 'รายละเอียดโบนัส',
      baseCredits: 'เครดิตพื้นฐาน',
      bonusCredits: 'เครดิตโบนัส (x2)',
      totalCredits: 'เครดิตทั้งหมด',
      newBalance: 'ยอดคงเหลือใหม่',
      specialOffer: 'นี่คือโบนัสต้อนรับครั้งเดียวสำหรับลูกค้าใหม่',
      enjoyCredits: 'เพลิดเพลินกับเครดิตและสำรวจฟีเจอร์ AI ทั้งหมด!',
      exploreFeatures: 'สำรวจฟีเจอร์',
      footerText: 'การแจ้งเตือนโบนัสต้อนรับจาก Graphos AI Studio',
      preheader: 'คุณได้รับ {bonus} เครดิตโบนัสจากการซื้อครั้งแรก!'
    },
    lowCredits: {
      title: 'เครดิตใกล้หมด',
      subtitle: 'ถึงเวลาเติมเงิน',
      greeting: 'แจ้งเตือน!',
      instruction: 'ยอดเครดิตของคุณต่ำ เติมเงินตอนนี้เพื่อใช้ฟีเจอร์ AI ต่อไปโดยไม่หยุดชะงัก',
      currentBalance: 'ยอดคงเหลือปัจจุบัน',
      credits: 'เครดิต',
      recommendation: 'เราแนะนำให้รักษาอย่างน้อย 50 เครดิตเพื่อบริการที่ไม่หยุดชะงัก',
      topUpNow: 'เติมเงินตอนนี้',
      packages: 'ดูแพ็คเกจเครดิตและเลือกแพ็คเกจที่เหมาะกับคุณ',
      footerText: 'การแจ้งเตือนบัญชีจาก Graphos AI Studio',
      preheader: 'ยอดเครดิตต่ำ - เหลือเพียง {credits} เครดิต'
    },
    reEngagement: {
      title: 'เราคิดถึงคุณ!',
      subtitle: 'กลับมาดูว่ามีอะไรใหม่',
      greeting: 'นานไม่ได้เจอ!',
      instruction: 'เราสังเกตว่าคุณไม่ได้มาเยี่ยมชมสักพัก นี่คือสิ่งที่คุณพลาดไป:',
      whatsNew: 'มีอะไรใหม่',
      feature1: 'ความแม่นยำในการวิเคราะห์ AI ที่ดีขึ้น',
      feature2: 'ความเร็วในการประมวลผลที่เร็วขึ้น',
      feature3: 'ฟีเจอร์โปรไฟล์เสียงใหม่',
      yourCredits: 'เครดิตของคุณ',
      creditsWaiting: 'คุณยังมี {credits} เครดิตรอคุณอยู่',
      comeBack: 'กลับมา',
      weAreHere: 'เราพร้อมช่วยคุณสร้างเนื้อหาที่ยอดเยี่ยม แล้วพบกัน!',
      footerText: 'เราคิดถึงคุณที่ Graphos AI Studio',
      preheader: 'เราคิดถึงคุณ! {credits} เครดิตรอคุณอยู่'
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
    },
    purchaseConfirmation: {
      title: 'Pembayaran Berhasil!',
      subtitle: 'Terima kasih atas pembelian Anda',
      greeting: 'Kabar baik!',
      instruction: 'Pembayaran Anda telah berhasil diproses. Berikut detail pesanan Anda:',
      orderDetails: 'Detail Pesanan',
      package: 'Paket',
      creditsAdded: 'Kredit Ditambahkan',
      newBalance: 'Saldo Baru',
      orderId: 'ID Pesanan',
      date: 'Tanggal',
      amount: 'Jumlah',
      thankYou: 'Terima kasih telah memilih Graphos AI Studio. Kredit Anda siap digunakan!',
      startUsing: 'Mulai Gunakan',
      footerText: 'Konfirmasi pembayaran dari Graphos AI Studio',
      preheader: 'Pembayaran berhasil - {credits} kredit ditambahkan'
    },
    firstPurchaseBonus: {
      title: 'Bonus Selamat Datang Terbuka!',
      subtitle: 'Kredit ganda untuk pembelian pertama',
      greeting: 'Selamat!',
      instruction: 'Sebagai ucapan terima kasih atas pembelian pertama Anda, kami telah menggandakan kredit Anda!',
      bonusDetails: 'Detail Bonus',
      baseCredits: 'Kredit Dasar',
      bonusCredits: 'Kredit Bonus (x2)',
      totalCredits: 'Total Kredit',
      newBalance: 'Saldo Baru',
      specialOffer: 'Ini adalah bonus selamat datang satu kali untuk pelanggan baru.',
      enjoyCredits: 'Nikmati kredit Anda dan jelajahi semua fitur AI!',
      exploreFeatures: 'Jelajahi Fitur',
      footerText: 'Notifikasi bonus selamat datang dari Graphos AI Studio',
      preheader: 'Anda menerima {bonus} kredit bonus untuk pembelian pertama!'
    },
    lowCredits: {
      title: 'Kredit Hampir Habis',
      subtitle: 'Saatnya mengisi ulang',
      greeting: 'Perhatian!',
      instruction: 'Saldo kredit Anda rendah. Isi ulang sekarang untuk terus menggunakan fitur AI tanpa gangguan.',
      currentBalance: 'Saldo Saat Ini',
      credits: 'kredit',
      recommendation: 'Kami menyarankan untuk menjaga minimal 50 kredit untuk layanan tanpa gangguan.',
      topUpNow: 'Isi Ulang Sekarang',
      packages: 'Lihat paket kredit kami dan pilih yang sesuai dengan kebutuhan Anda.',
      footerText: 'Notifikasi akun dari Graphos AI Studio',
      preheader: 'Saldo kredit rendah - hanya tersisa {credits} kredit'
    },
    reEngagement: {
      title: 'Kami Merindukanmu!',
      subtitle: 'Kembali dan lihat yang baru',
      greeting: 'Sudah lama!',
      instruction: 'Kami perhatikan Anda sudah lama tidak berkunjung. Ini yang Anda lewatkan:',
      whatsNew: 'Yang Baru',
      feature1: 'Akurasi analisis AI yang ditingkatkan',
      feature2: 'Kecepatan pemrosesan lebih cepat',
      feature3: 'Fitur profil suara baru',
      yourCredits: 'Kredit Anda',
      creditsWaiting: 'Anda masih memiliki {credits} kredit yang menunggu.',
      comeBack: 'Kembali',
      weAreHere: 'Kami di sini untuk membantu Anda membuat konten yang luar biasa. Sampai jumpa!',
      footerText: 'Kami merindukanmu di Graphos AI Studio',
      preheader: 'Kami merindukanmu! {credits} kredit menunggu Anda'
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
    },
    purchaseConfirmation: {
      title: 'Pembayaran Berjaya!',
      subtitle: 'Terima kasih atas pembelian anda',
      greeting: 'Berita baik!',
      instruction: 'Pembayaran anda telah berjaya diproses. Berikut adalah butiran pesanan anda:',
      orderDetails: 'Butiran Pesanan',
      package: 'Pakej',
      creditsAdded: 'Kredit Ditambah',
      newBalance: 'Baki Baru',
      orderId: 'ID Pesanan',
      date: 'Tarikh',
      amount: 'Jumlah',
      thankYou: 'Terima kasih kerana memilih Graphos AI Studio. Kredit anda sedia untuk digunakan!',
      startUsing: 'Mula Guna',
      footerText: 'Pengesahan pembayaran daripada Graphos AI Studio',
      preheader: 'Pembayaran berjaya - {credits} kredit ditambah'
    },
    firstPurchaseBonus: {
      title: 'Bonus Selamat Datang Dibuka!',
      subtitle: 'Kredit berganda untuk pembelian pertama',
      greeting: 'Tahniah!',
      instruction: 'Sebagai tanda terima kasih atas pembelian pertama anda, kami telah menggandakan kredit anda!',
      bonusDetails: 'Butiran Bonus',
      baseCredits: 'Kredit Asas',
      bonusCredits: 'Kredit Bonus (x2)',
      totalCredits: 'Jumlah Kredit',
      newBalance: 'Baki Baru',
      specialOffer: 'Ini adalah bonus selamat datang sekali sahaja untuk pelanggan baru.',
      enjoyCredits: 'Nikmati kredit anda dan terokai semua ciri AI!',
      exploreFeatures: 'Terokai Ciri',
      footerText: 'Pemberitahuan bonus selamat datang daripada Graphos AI Studio',
      preheader: 'Anda menerima {bonus} kredit bonus untuk pembelian pertama!'
    },
    lowCredits: {
      title: 'Kredit Hampir Habis',
      subtitle: 'Masa untuk tambah nilai',
      greeting: 'Perhatian!',
      instruction: 'Baki kredit anda rendah. Tambah nilai sekarang untuk terus menggunakan ciri AI tanpa gangguan.',
      currentBalance: 'Baki Semasa',
      credits: 'kredit',
      recommendation: 'Kami mengesyorkan untuk mengekalkan sekurang-kurangnya 50 kredit untuk perkhidmatan tanpa gangguan.',
      topUpNow: 'Tambah Nilai Sekarang',
      packages: 'Lihat pakej kredit kami dan pilih yang sesuai dengan keperluan anda.',
      footerText: 'Pemberitahuan akaun daripada Graphos AI Studio',
      preheader: 'Baki kredit rendah - hanya tinggal {credits} kredit'
    },
    reEngagement: {
      title: 'Kami Rindu Anda!',
      subtitle: 'Kembali dan lihat apa yang baru',
      greeting: 'Lama tidak jumpa!',
      instruction: 'Kami perasan anda sudah lama tidak melawat. Ini yang anda terlepas:',
      whatsNew: 'Apa Yang Baru',
      feature1: 'Ketepatan analisis AI yang dipertingkat',
      feature2: 'Kelajuan pemprosesan lebih pantas',
      feature3: 'Ciri profil suara baru',
      yourCredits: 'Kredit Anda',
      creditsWaiting: 'Anda masih mempunyai {credits} kredit yang menunggu.',
      comeBack: 'Kembali',
      weAreHere: 'Kami di sini untuk membantu anda mencipta kandungan yang hebat. Jumpa lagi!',
      footerText: 'Kami rindu anda di Graphos AI Studio',
      preheader: 'Kami rindu anda! {credits} kredit menunggu anda'
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
  user: 'user', calendar: 'calendar', alertCircle: 'circle-alert',
  gift: 'gift', rocket: 'rocket', sparkles: 'sparkles', zap: 'zap'
};

// Note: icon, logo, headerIcon functions are now imported from emailCid.js
// They use CID references instead of external URLs for better email deliverability


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
                <tr>
                  <td align="center" style="padding-bottom:20px;">
                    <a href="https://graphosai.com" style="text-decoration:none;">${logo(36)}</a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="margin:0 0 8px;color:#86868b;font-size:12px;line-height:1.5;font-weight:400;">${footerText}</p>
                    <p style="margin:0 0 8px;color:#86868b;font-size:11px;">© ${year} <a href="https://graphosai.com" style="color:#86868b;text-decoration:none;">Graphos AI Studio</a></p>
                    <p style="margin:0;color:#86868b;font-size:11px;">Support: <a href="mailto:Support@graphosai.com" style="color:#0066cc;text-decoration:none;">Support@graphosai.com</a></p>
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
          <p style="margin:0 0 12px;color:#1d1d1f;font-size:14px;line-height:1.5;"><img src="${cidSrc('check', 'black')}" alt="Yes" width="16" height="16" style="display:inline-block;vertical-align:middle;margin-right:6px;"/> ${t('newDeviceLogin.wasYouYes', lang)}</p>
          <p style="margin:0;color:#1d1d1f;font-size:14px;line-height:1.5;"><img src="${cidSrc('alertCircle', 'black')}" alt="No" width="16" height="16" style="display:inline-block;vertical-align:middle;margin-right:6px;"/> ${t('newDeviceLogin.wasYouNo', lang)}</p>
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
// NOTIFICATION EMAIL - Apple Style
// ============================================================================

/**
 * Notification Email Template - Apple Style
 * Used for bulk notifications and individual user notifications
 * 
 * @param {Object} options
 * @param {string} options.title - Notification title
 * @param {string} options.message - Notification message
 * @param {string} [options.ctaText] - CTA button text
 * @param {string} [options.ctaUrl] - CTA button URL
 * @param {string} [options.type='info'] - Notification type (info, success, warning, announcement)
 * @param {string} [options.lang='en'] - Language code
 */
function notificationEmail({ title, message, ctaText, ctaUrl, type = 'info', lang = DEFAULT_LANG }) {
  // Icon based on notification type
  const typeIcons = {
    info: 'info',
    success: 'check',
    warning: 'alertCircle',
    error: 'alertCircle',
    announcement: 'message'
  };
  const iconName = typeIcons[type] || 'info';
  
  // Get CTA text from translations if not provided
  const buttonText = ctaText || t('notification.learnMore', lang) || 'Learn More';
  
  const content = `
    <!-- Header -->
    <tr>
      <td style="padding:48px 40px 32px;text-align:center;">
        ${headerIcon(iconName, 'black', 32)}
        <h1 style="margin:0 0 8px;color:#1d1d1f;font-size:28px;font-weight:600;letter-spacing:-0.5px;line-height:1.2;">${title}</h1>
      </td>
    </tr>
    <!-- Content -->
    <tr>
      <td style="padding:0 40px 40px;">
        <div style="background-color:#f5f5f7;border-radius:20px;padding:28px;margin:0 0 24px;">
          <p style="margin:0;color:#1d1d1f;font-size:15px;line-height:1.6;">${message}</p>
        </div>
        
        ${ctaUrl ? `
        <!-- CTA Button -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding:8px 0 24px;">
              <a href="${ctaUrl}" style="display:inline-block;padding:16px 40px;background-color:#1d1d1f;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;border-radius:980px;">${buttonText}</a>
            </td>
          </tr>
        </table>` : ''}
      </td>
    </tr>`;

  return appleBase({ content, footerText: t('notification.footerText', lang) || 'Notification from Graphos AI Studio', lang });
}

// ============================================================================
// PURCHASE CONFIRMATION EMAIL - Apple Style
// ============================================================================

/**
 * Purchase Confirmation Email Template
 * Sent when user successfully purchases credits
 */
function purchaseConfirmationEmail({ 
  userName, 
  packageName, 
  creditsAdded, 
  newBalance, 
  orderId, 
  amount, 
  currency = 'USD',
  dashboardUrl,
  lang = DEFAULT_LANG 
}) {
  const locale = getLocale(lang);
  const formattedDate = new Date().toLocaleDateString(locale, { dateStyle: 'medium' });
  const formattedAmount = amount ? `${currency} ${amount}` : '';

  const content = `
    <!-- Header -->
    <tr>
      <td style="padding:48px 40px 32px;text-align:center;">
        ${headerIcon('creditCard', 'black', 32)}
        <h1 style="margin:0 0 8px;color:#1d1d1f;font-size:28px;font-weight:600;letter-spacing:-0.5px;line-height:1.2;">${t('purchaseConfirmation.title', lang)}</h1>
        <p style="margin:0;color:#86868b;font-size:15px;font-weight:400;">${t('purchaseConfirmation.subtitle', lang)}</p>
      </td>
    </tr>
    <!-- Content -->
    <tr>
      <td style="padding:0 40px 40px;">
        <p style="margin:0 0 24px;color:#1d1d1f;font-size:17px;line-height:1.5;text-align:center;">${t('hi', lang)} <strong>${userName}</strong>,</p>
        <p style="margin:0 0 32px;color:#86868b;font-size:15px;line-height:1.6;text-align:center;">${t('purchaseConfirmation.instruction', lang)}</p>
        
        <!-- Order Details -->
        <div style="background-color:#f5f5f7;border-radius:20px;padding:24px;margin-bottom:24px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
            <tr>
              <td width="28">${icon('file', 'black', 16)}</td>
              <td style="color:#86868b;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:500;">${t('purchaseConfirmation.orderDetails', lang)}</td>
            </tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:12px 0;border-bottom:1px solid rgba(0,0,0,0.06);color:#86868b;font-size:13px;">${t('purchaseConfirmation.package', lang)}</td>
              <td style="padding:12px 0;border-bottom:1px solid rgba(0,0,0,0.06);text-align:right;color:#1d1d1f;font-size:14px;font-weight:600;">${packageName}</td>
            </tr>
            <tr>
              <td style="padding:12px 0;border-bottom:1px solid rgba(0,0,0,0.06);color:#86868b;font-size:13px;">${t('purchaseConfirmation.creditsAdded', lang)}</td>
              <td style="padding:12px 0;border-bottom:1px solid rgba(0,0,0,0.06);text-align:right;color:#1d1d1f;font-size:14px;font-weight:600;">+${creditsAdded}</td>
            </tr>
            ${formattedAmount ? `
            <tr>
              <td style="padding:12px 0;border-bottom:1px solid rgba(0,0,0,0.06);color:#86868b;font-size:13px;">${t('purchaseConfirmation.amount', lang)}</td>
              <td style="padding:12px 0;border-bottom:1px solid rgba(0,0,0,0.06);text-align:right;color:#1d1d1f;font-size:14px;font-weight:600;">${formattedAmount}</td>
            </tr>` : ''}
            <tr>
              <td style="padding:12px 0;border-bottom:1px solid rgba(0,0,0,0.06);color:#86868b;font-size:13px;">${t('purchaseConfirmation.date', lang)}</td>
              <td style="padding:12px 0;border-bottom:1px solid rgba(0,0,0,0.06);text-align:right;color:#1d1d1f;font-size:14px;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding:12px 0;color:#86868b;font-size:13px;">${t('purchaseConfirmation.orderId', lang)}</td>
              <td style="padding:12px 0;text-align:right;color:#1d1d1f;font-size:12px;font-family:'SF Mono','Courier New',monospace;">${orderId}</td>
            </tr>
          </table>
        </div>
        
        <!-- New Balance Highlight -->
        <div style="background-color:#1d1d1f;border-radius:20px;padding:24px;text-align:center;margin-bottom:24px;">
          <p style="margin:0 0 8px;color:rgba(255,255,255,0.6);font-size:12px;text-transform:uppercase;letter-spacing:1px;">${t('purchaseConfirmation.newBalance', lang)}</p>
          <p style="margin:0;color:#ffffff;font-size:36px;font-weight:700;">${newBalance} <span style="font-size:16px;font-weight:400;">credits</span></p>
        </div>
        
        <p style="margin:0 0 24px;color:#86868b;font-size:14px;line-height:1.5;text-align:center;">${t('purchaseConfirmation.thankYou', lang)}</p>
        
        <!-- CTA Button -->
        ${dashboardUrl ? `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding:8px 0;">
              <a href="${dashboardUrl}" style="display:inline-block;padding:16px 40px;background-color:#1d1d1f;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;border-radius:980px;">${t('purchaseConfirmation.startUsing', lang)}</a>
            </td>
          </tr>
        </table>` : ''}
      </td>
    </tr>`;

  return appleBase({ content, footerText: t('purchaseConfirmation.footerText', lang), lang });
}

// ============================================================================
// FIRST PURCHASE BONUS EMAIL - Apple Style
// ============================================================================

/**
 * First Purchase Bonus Email Template
 * Sent when user makes their first purchase and receives double credits
 */
function firstPurchaseBonusEmail({ 
  userName, 
  baseCredits, 
  bonusCredits, 
  totalCredits, 
  newBalance,
  dashboardUrl,
  lang = DEFAULT_LANG 
}) {
  const content = `
    <!-- Header -->
    <tr>
      <td style="padding:48px 40px 32px;text-align:center;">
        ${headerIcon('gift', 'black', 32)}
        <h1 style="margin:0 0 8px;color:#1d1d1f;font-size:28px;font-weight:600;letter-spacing:-0.5px;line-height:1.2;">${t('firstPurchaseBonus.title', lang)}</h1>
        <p style="margin:0;color:#86868b;font-size:15px;font-weight:400;">${t('firstPurchaseBonus.subtitle', lang)}</p>
      </td>
    </tr>
    <!-- Content -->
    <tr>
      <td style="padding:0 40px 40px;">
        <p style="margin:0 0 24px;color:#1d1d1f;font-size:17px;line-height:1.5;text-align:center;">${t('firstPurchaseBonus.greeting', lang)} <strong>${userName}</strong>!</p>
        <p style="margin:0 0 32px;color:#86868b;font-size:15px;line-height:1.6;text-align:center;">${t('firstPurchaseBonus.instruction', lang)}</p>
        
        <!-- Bonus Details -->
        <div style="background-color:#f5f5f7;border-radius:20px;padding:24px;margin-bottom:24px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
            <tr>
              <td width="28">${icon('gift', 'black', 16)}</td>
              <td style="color:#86868b;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:500;">${t('firstPurchaseBonus.bonusDetails', lang)}</td>
            </tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:12px 0;border-bottom:1px solid rgba(0,0,0,0.06);color:#86868b;font-size:13px;">${t('firstPurchaseBonus.baseCredits', lang)}</td>
              <td style="padding:12px 0;border-bottom:1px solid rgba(0,0,0,0.06);text-align:right;color:#1d1d1f;font-size:14px;">${baseCredits}</td>
            </tr>
            <tr>
              <td style="padding:12px 0;border-bottom:1px solid rgba(0,0,0,0.06);color:#86868b;font-size:13px;">${t('firstPurchaseBonus.bonusCredits', lang)}</td>
              <td style="padding:12px 0;border-bottom:1px solid rgba(0,0,0,0.06);text-align:right;color:#1d1d1f;font-size:14px;font-weight:600;">+${bonusCredits}</td>
            </tr>
            <tr>
              <td style="padding:12px 0;color:#1d1d1f;font-size:14px;font-weight:600;">${t('firstPurchaseBonus.totalCredits', lang)}</td>
              <td style="padding:12px 0;text-align:right;color:#1d1d1f;font-size:16px;font-weight:700;">${totalCredits}</td>
            </tr>
          </table>
        </div>
        
        <!-- New Balance Highlight -->
        <div style="background-color:#1d1d1f;border-radius:20px;padding:24px;text-align:center;margin-bottom:24px;">
          <p style="margin:0 0 8px;color:rgba(255,255,255,0.6);font-size:12px;text-transform:uppercase;letter-spacing:1px;">${t('firstPurchaseBonus.newBalance', lang)}</p>
          <p style="margin:0;color:#ffffff;font-size:36px;font-weight:700;">${newBalance} <span style="font-size:16px;font-weight:400;">credits</span></p>
        </div>
        
        <!-- Special Offer Note -->
        <div style="background-color:#f5f5f7;border-radius:16px;padding:16px;margin-bottom:24px;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td width="32" style="vertical-align:top;padding-top:2px;">${icon('info', 'black', 18)}</td>
              <td style="color:#1d1d1f;font-size:14px;line-height:1.5;">${t('firstPurchaseBonus.specialOffer', lang)}</td>
            </tr>
          </table>
        </div>
        
        <p style="margin:0 0 24px;color:#86868b;font-size:14px;line-height:1.5;text-align:center;">${t('firstPurchaseBonus.enjoyCredits', lang)}</p>
        
        <!-- CTA Button -->
        ${dashboardUrl ? `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding:8px 0;">
              <a href="${dashboardUrl}" style="display:inline-block;padding:16px 40px;background-color:#1d1d1f;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;border-radius:980px;">${t('firstPurchaseBonus.exploreFeatures', lang)}</a>
            </td>
          </tr>
        </table>` : ''}
      </td>
    </tr>`;

  return appleBase({ content, footerText: t('firstPurchaseBonus.footerText', lang), lang });
}

// ============================================================================
// LOW CREDITS WARNING EMAIL - Apple Style
// ============================================================================

/**
 * Low Credits Warning Email Template
 * Sent when user's credit balance is low
 */
function lowCreditsEmail({ 
  userName, 
  currentBalance,
  pricingUrl,
  lang = DEFAULT_LANG 
}) {
  const content = `
    <!-- Header -->
    <tr>
      <td style="padding:48px 40px 32px;text-align:center;">
        ${headerIcon('alertCircle', 'black', 32)}
        <h1 style="margin:0 0 8px;color:#1d1d1f;font-size:28px;font-weight:600;letter-spacing:-0.5px;line-height:1.2;">${t('lowCredits.title', lang)}</h1>
        <p style="margin:0;color:#86868b;font-size:15px;font-weight:400;">${t('lowCredits.subtitle', lang)}</p>
      </td>
    </tr>
    <!-- Content -->
    <tr>
      <td style="padding:0 40px 40px;">
        <p style="margin:0 0 24px;color:#1d1d1f;font-size:17px;line-height:1.5;text-align:center;">${t('lowCredits.greeting', lang)} <strong>${userName}</strong>,</p>
        <p style="margin:0 0 32px;color:#86868b;font-size:15px;line-height:1.6;text-align:center;">${t('lowCredits.instruction', lang)}</p>
        
        <!-- Current Balance -->
        <div style="background-color:#f5f5f7;border-radius:20px;padding:32px;text-align:center;margin-bottom:24px;">
          <p style="margin:0 0 8px;color:#86868b;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:500;">${t('lowCredits.currentBalance', lang)}</p>
          <p style="margin:0;color:#1d1d1f;font-size:48px;font-weight:700;">${currentBalance}</p>
          <p style="margin:8px 0 0;color:#86868b;font-size:14px;">${t('lowCredits.credits', lang)}</p>
        </div>
        
        <!-- Recommendation -->
        <div style="background-color:#f5f5f7;border-radius:16px;padding:20px;margin-bottom:24px;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td width="32" style="vertical-align:top;padding-top:2px;">${icon('info', 'black', 18)}</td>
              <td style="color:#1d1d1f;font-size:14px;line-height:1.5;">${t('lowCredits.recommendation', lang)}</td>
            </tr>
          </table>
        </div>
        
        <p style="margin:0 0 24px;color:#86868b;font-size:14px;line-height:1.5;text-align:center;">${t('lowCredits.packages', lang)}</p>
        
        <!-- CTA Button -->
        ${pricingUrl ? `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding:8px 0;">
              <a href="${pricingUrl}" style="display:inline-block;padding:16px 40px;background-color:#1d1d1f;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;border-radius:980px;">${t('lowCredits.topUpNow', lang)}</a>
            </td>
          </tr>
        </table>` : ''}
      </td>
    </tr>`;

  return appleBase({ content, footerText: t('lowCredits.footerText', lang), lang });
}

// ============================================================================
// RE-ENGAGEMENT EMAIL - Apple Style
// ============================================================================

/**
 * Re-engagement Email Template
 * Sent to inactive users to bring them back
 */
function reEngagementEmail({ 
  userName, 
  currentCredits,
  dashboardUrl,
  lang = DEFAULT_LANG 
}) {
  const content = `
    <!-- Header -->
    <tr>
      <td style="padding:48px 40px 32px;text-align:center;">
        ${headerIcon('sparkles', 'black', 32)}
        <h1 style="margin:0 0 8px;color:#1d1d1f;font-size:28px;font-weight:600;letter-spacing:-0.5px;line-height:1.2;">${t('reEngagement.title', lang)}</h1>
        <p style="margin:0;color:#86868b;font-size:15px;font-weight:400;">${t('reEngagement.subtitle', lang)}</p>
      </td>
    </tr>
    <!-- Content -->
    <tr>
      <td style="padding:0 40px 40px;">
        <p style="margin:0 0 24px;color:#1d1d1f;font-size:17px;line-height:1.5;text-align:center;">${t('reEngagement.greeting', lang)} <strong>${userName}</strong>,</p>
        <p style="margin:0 0 32px;color:#86868b;font-size:15px;line-height:1.6;text-align:center;">${t('reEngagement.instruction', lang)}</p>
        
        <!-- What's New -->
        <div style="background-color:#f5f5f7;border-radius:20px;padding:28px;margin-bottom:24px;">
          <p style="margin:0 0 20px;color:#1d1d1f;font-size:15px;font-weight:600;">${t('reEngagement.whatsNew', lang)}</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:12px 0;border-bottom:1px solid rgba(0,0,0,0.06);">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="32">${icon('zap', 'black', 18)}</td>
                    <td style="color:#1d1d1f;font-size:14px;">${t('reEngagement.feature1', lang)}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 0;border-bottom:1px solid rgba(0,0,0,0.06);">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="32">${icon('rocket', 'black', 18)}</td>
                    <td style="color:#1d1d1f;font-size:14px;">${t('reEngagement.feature2', lang)}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 0;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="32">${icon('user', 'black', 18)}</td>
                    <td style="color:#1d1d1f;font-size:14px;">${t('reEngagement.feature3', lang)}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>
        
        <!-- Credits Reminder -->
        ${currentCredits > 0 ? `
        <div style="background-color:#1d1d1f;border-radius:20px;padding:24px;text-align:center;margin-bottom:24px;">
          <p style="margin:0 0 8px;color:rgba(255,255,255,0.6);font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:500;">${t('reEngagement.yourCredits', lang)}</p>
          <p style="margin:0 0 8px;color:#ffffff;font-size:36px;font-weight:700;">${currentCredits}</p>
          <p style="margin:0;color:rgba(255,255,255,0.6);font-size:14px;">${t('reEngagement.creditsWaiting', lang, { credits: currentCredits })}</p>
        </div>` : ''}
        
        <p style="margin:0 0 24px;color:#86868b;font-size:14px;line-height:1.5;text-align:center;">${t('reEngagement.weAreHere', lang)}</p>
        
        <!-- CTA Button -->
        ${dashboardUrl ? `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding:8px 0;">
              <a href="${dashboardUrl}" style="display:inline-block;padding:16px 40px;background-color:#1d1d1f;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;border-radius:980px;">${t('reEngagement.comeBack', lang)}</a>
            </td>
          </tr>
        </table>` : ''}
      </td>
    </tr>`;

  return appleBase({ content, footerText: t('reEngagement.footerText', lang), lang });
}

// ============================================================================
// EMAIL SUBJECT HELPER
// ============================================================================

/**
 * Get localized email subject
 * @param {string} templateType - Template type (otpVerification, passwordReset, newDeviceLogin, passwordChanged, welcome)
 * @param {string} lang - Language code
 * @returns {string} Localized subject with brand name
 */
function getEmailSubject(templateType, lang = DEFAULT_LANG) {
  const title = t(`${templateType}.title`, lang);
  return `${title} - Graphos AI Studio`;
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
  notificationEmail,
  // New email templates
  purchaseConfirmationEmail,
  firstPurchaseBonusEmail,
  lowCreditsEmail,
  reEngagementEmail,
  
  // Helpers
  t,
  getLocale,
  getEmailSubject,
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
