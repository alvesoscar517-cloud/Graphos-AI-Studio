# Requirements Document

## Introduction

Tài liệu này mô tả các yêu cầu cho việc tùy biến sâu backend chính (`/backend`) để hỗ trợ đầy đủ 15 ngôn ngữ mà ứng dụng Graphos AI Studio hỗ trợ. Mục tiêu là nâng cao chất lượng các tính năng AI cho từng thị trường cụ thể.

### Phạm vi tùy biến (Backend chính - `/backend`)

**Các tính năng cần tùy biến sâu:**
1. **Rewrite/Humanize** - Nhận diện ngôn ngữ văn bản và trả về kết quả bằng ngôn ngữ đó (không phụ thuộc UI language)
2. **AI Detection** - Patterns phát hiện AI riêng cho từng ngôn ngữ với độ chính xác cao
3. **Text Analysis** - Benchmarks và suggestions phù hợp với đặc điểm ngôn ngữ
4. **Error Messages** - Thông báo lỗi thân thiện, không hiển thị thông tin kỹ thuật
5. **Notifications** - Thông báo chi tiết và cá nhân hóa (ví dụ: mua credits lần đầu với khuyến mãi)
6. **AI Prompts** - Tối ưu prompts cho từng ngôn ngữ với cultural context
7. **Locale Files** - Đảm bảo tất cả keys được dịch đầy đủ cho 15 ngôn ngữ

### Đề xuất cải tiến chất lượng bổ sung

1. **Language-Specific Humanization Patterns** - Thêm patterns nhân hóa riêng cho từng ngôn ngữ (Vietnamese particles, Chinese modal particles, Japanese keigo, etc.)
2. **Enhanced AI Detection Accuracy** - Cải thiện độ chính xác phát hiện AI cho các ngôn ngữ không phải tiếng Anh
3. **Cultural Context in AI Responses** - AI responses phù hợp với văn hóa từng thị trường
4. **Locale-Aware Formatting** - Format số, ngày, tiền tệ theo locale
5. **Graceful Error Recovery** - Xử lý lỗi graceful với actionable guidance

## Glossary

- **Localization Service**: Dịch vụ xử lý dịch thuật và nội dung theo ngôn ngữ
- **Humanize Service**: Dịch vụ nhân hóa văn bản AI để giống văn bản do người viết
- **Voice Profile**: Hồ sơ giọng văn của người dùng
- **Credits**: Đơn vị tiền tệ trong ứng dụng để sử dụng các tính năng AI
- **AI Detection**: Tính năng phát hiện văn bản do AI tạo ra
- **Rewrite**: Tính năng viết lại văn bản theo phong cách người dùng
- **Content Language**: Ngôn ngữ của nội dung văn bản (khác với UI language)
- **UI Language**: Ngôn ngữ giao diện người dùng chọn
- **User-Friendly Error**: Thông báo lỗi được viết cho người dùng cuối, không chứa thuật ngữ kỹ thuật

## Supported Languages (15)

1. English (en)
2. Vietnamese (vi)
3. Chinese Simplified (zh)
4. Japanese (ja)
5. Korean (ko)
6. French (fr)
7. German (de)
8. Spanish (es)
9. Portuguese (pt)
10. Italian (it)
11. Russian (ru)
12. Arabic (ar)
13. Thai (th)
14. Indonesian (id)
15. Malay (ms)

---

## Requirements

### Requirement 1: Content-Aware Language Detection for Rewrite

**User Story:** As a user, I want the rewrite feature to detect the language of my text and return results in that same language, so that I can work with content in any language regardless of my UI language setting.

#### Acceptance Criteria

1. WHEN a user submits text for rewriting THEN the Humanize_Service SHALL detect the language of the input text before processing
2. WHEN the detected content language differs from the user's UI language THEN the Humanize_Service SHALL generate output in the detected content language
3. WHEN generating AI prompts for rewriting THEN the Humanize_Service SHALL use language-specific anti-AI detection rules appropriate for the detected content language
4. WHEN the content language is one of the 15 supported languages THEN the Humanize_Service SHALL apply language-specific humanization patterns (contractions, fillers, starters, particles)
5. WHEN the content language cannot be reliably detected THEN the Humanize_Service SHALL default to English patterns and log the detection failure
6. WHEN rewriting Vietnamese text THEN the Humanize_Service SHALL preserve Vietnamese diacritics and apply Vietnamese-specific informal markers (à, nhé, nha, ạ)
7. WHEN rewriting CJK text (Chinese, Japanese, Korean) THEN the Humanize_Service SHALL apply appropriate script-specific patterns and formality levels

---

### Requirement 2: Language-Specific AI Detection Patterns

**User Story:** As a user, I want the AI detection feature to accurately identify AI-generated content in my language, so that I can trust the detection results regardless of which language I write in.

#### Acceptance Criteria

1. WHEN analyzing text for AI detection THEN the Gemini_Service SHALL use language-specific AI phrase lists for the detected content language
2. WHEN the content language is Vietnamese THEN the Gemini_Service SHALL use Vietnamese-specific AI indicators (formal phrases, transition words, sentence patterns)
3. WHEN the content language is Chinese, Japanese, or Korean THEN the Gemini_Service SHALL apply CJK-specific detection patterns (character usage, formality markers)
4. WHEN the content language is Arabic THEN the Gemini_Service SHALL apply RTL-specific detection patterns and Arabic formal markers
5. WHEN generating heuristic fallback analysis THEN the Gemini_Service SHALL use language-appropriate word frequency and sentence structure analysis

---

### Requirement 3: User-Friendly Error Messages

**User Story:** As a user, I want to see friendly and helpful error messages instead of technical jargon, so that I understand what went wrong and what I can do about it.

#### Acceptance Criteria

1. WHEN a timeout error occurs THEN the Localization_Service SHALL return a user-friendly message like "The request is taking longer than expected. Please try again." instead of "Request timed out"
2. WHEN a database error occurs THEN the Localization_Service SHALL return "We're experiencing temporary issues. Please try again in a moment." instead of technical database error details
3. WHEN an API quota is exceeded THEN the Localization_Service SHALL return "Our service is currently busy. Please wait a moment and try again." with an estimated wait time if available
4. WHEN a network error occurs THEN the Localization_Service SHALL return "Connection issue detected. Please check your internet and try again."
5. WHEN an authentication error occurs THEN the Localization_Service SHALL return "Your session has expired. Please sign in again to continue."
6. WHEN any error occurs THEN the Localization_Service SHALL never expose internal error codes, stack traces, or technical details to the user

---

### Requirement 4: Enhanced Purchase Notifications

**User Story:** As a user who purchases credits, I want to receive detailed and personalized notifications about my purchase, so that I understand exactly what I received including any bonuses or promotions.

#### Acceptance Criteria

1. WHEN a user makes their first purchase with a promotion THEN the AutoNotification_Service SHALL send a notification detailing: package name, base credits, bonus credits from first-purchase promotion, and total credits received (ví dụ: "Bạn đã mua gói Pro và nhận được 500 credits + 250 credits khuyến mãi lần đầu = 750 credits tổng cộng")
2. WHEN a user purchases a subscription THEN the AutoNotification_Service SHALL include subscription details: plan name, monthly credits, billing cycle, and renewal date
3. WHEN a user receives bonus credits from any promotion THEN the AutoNotification_Service SHALL clearly separate base credits from bonus credits in the notification message
4. WHEN displaying purchase notifications THEN the AutoNotification_Service SHALL format credit amounts with proper number formatting for the user's locale (e.g., 1,000 vs 1.000)
5. WHEN a purchase includes multiple benefits THEN the AutoNotification_Service SHALL list each benefit as a separate line item in the notification
6. WHEN a user upgrades their plan THEN the AutoNotification_Service SHALL explain the differences between old and new plan benefits

---

### Requirement 5: Complete Locale File Coverage

**User Story:** As a user in any supported market, I want all system messages to be properly translated in my language, so that I have a fully localized experience.

#### Acceptance Criteria

1. WHEN a new translation key is added to the English locale file THEN the Localization_Service SHALL have corresponding translations in all 14 other supported languages
2. WHEN the backend returns any user-facing message THEN the Localization_Service SHALL use the localization service to translate it based on the user's language preference
3. WHEN a translation is missing for a specific language THEN the Localization_Service SHALL fall back to English and log the missing translation for review
4. WHEN displaying numbers, dates, or currencies THEN the Localization_Service SHALL format them according to the user's locale conventions
5. WHEN displaying pluralized messages THEN the Localization_Service SHALL use language-appropriate plural forms (e.g., Russian has 3 plural forms, Arabic has 6)

---

### Requirement 6: Language-Specific AI Prompts

**User Story:** As a user, I want AI features to understand and respond appropriately in my language, so that the AI output feels natural and culturally appropriate.

#### Acceptance Criteria

1. WHEN generating chat responses THEN the Gemini_Service SHALL include language-specific instructions in the system prompt based on the conversation language
2. WHEN humanizing text THEN the Humanize_Service SHALL use language-specific examples and patterns in the AI prompt
3. WHEN the content language is formal (Japanese, Korean) THEN the Gemini_Service SHALL include honorific and formality level instructions
4. WHEN the content language uses different scripts (Arabic, Thai, Chinese) THEN the Gemini_Service SHALL include script-specific formatting instructions
5. WHEN generating suggestions or analysis THEN the Analysis_Service SHALL provide culturally appropriate recommendations for the detected language

---

### Requirement 7: Notification System Enhancements

**User Story:** As a user, I want to receive contextual and helpful notifications that are relevant to my actions and status, so that I stay informed about important events.

#### Acceptance Criteria

1. WHEN a user's credits drop below 20% of their typical usage THEN the AutoNotification_Service SHALL send a personalized low-credits warning with usage context
2. WHEN a user completes their first analysis THEN the AutoNotification_Service SHALL send a congratulatory notification with tips for next steps
3. WHEN a user hasn't used the service for 7 days THEN the AutoNotification_Service SHALL send a re-engagement notification with their remaining credits
4. WHEN a user's subscription is about to renew THEN the AutoNotification_Service SHALL send a reminder 3 days before with renewal details
5. WHEN displaying any notification THEN the AutoNotification_Service SHALL use the user's preferred language from their profile settings

---

### Requirement 8: Humanization Patterns for All Languages

**User Story:** As a user writing in any supported language, I want the humanization feature to apply appropriate patterns for my language, so that the output sounds natural to native speakers.

#### Acceptance Criteria

1. WHEN humanizing Vietnamese text THEN the Humanize_Service SHALL apply Vietnamese-specific patterns: informal particles (à, nhé, nha), sentence-final markers, and colloquial expressions
2. WHEN humanizing Chinese text THEN the Humanize_Service SHALL apply Chinese-specific patterns: modal particles (吧, 呢, 啊), informal expressions, and appropriate punctuation
3. WHEN humanizing Japanese text THEN the Humanize_Service SHALL apply Japanese-specific patterns: sentence-ending particles (ね, よ, な), casual verb forms, and appropriate keigo levels
4. WHEN humanizing Korean text THEN the Humanize_Service SHALL apply Korean-specific patterns: speech levels (반말/존댓말), sentence-ending particles, and informal markers
5. WHEN humanizing Arabic text THEN the Humanize_Service SHALL apply Arabic-specific patterns: colloquial expressions, appropriate formality markers, and dialect considerations
6. WHEN humanizing European languages (French, German, Spanish, Portuguese, Italian) THEN the Humanize_Service SHALL apply language-specific contractions, informal expressions, and regional variations
7. WHEN humanizing Southeast Asian languages (Thai, Indonesian, Malay) THEN the Humanize_Service SHALL apply appropriate informal markers, particles, and colloquial expressions

---

### Requirement 9: Error Recovery and Graceful Degradation

**User Story:** As a user, I want the system to handle errors gracefully and provide helpful guidance, so that I can continue using the service even when issues occur.

#### Acceptance Criteria

1. WHEN an AI service is temporarily unavailable THEN the Backend SHALL provide a fallback response with an estimated recovery time
2. WHEN a feature fails due to insufficient credits THEN the Backend SHALL clearly explain the credit requirement and provide a direct link to purchase more
3. WHEN a rate limit is reached THEN the Backend SHALL inform the user of the wait time and optionally queue their request
4. WHEN a file upload fails THEN the Backend SHALL provide specific guidance on file requirements (size, format, etc.)
5. WHEN any recoverable error occurs THEN the Backend SHALL include actionable next steps in the error response

---

### Requirement 10: Locale-Aware Response Formatting

**User Story:** As a user, I want all responses to be formatted according to my locale preferences, so that numbers, dates, and text feel familiar and easy to read.

#### Acceptance Criteria

1. WHEN displaying credit amounts THEN the Backend SHALL format numbers according to the user's locale (e.g., 1,234 for en-US, 1.234 for de-DE)
2. WHEN displaying dates THEN the Backend SHALL use the appropriate date format for the user's locale (e.g., MM/DD/YYYY for en-US, DD/MM/YYYY for most others)
3. WHEN displaying percentages THEN the Backend SHALL use locale-appropriate decimal separators and percentage symbols
4. WHEN displaying currency amounts THEN the Backend SHALL use the appropriate currency symbol and formatting for the user's locale
5. WHEN displaying time durations THEN the Backend SHALL use locale-appropriate units and formatting (e.g., "2 hours" vs "2 giờ")

---

### Requirement 11: Language-Specific Humanization Quality

**User Story:** As a user writing in my native language, I want the humanization feature to produce natural-sounding output that native speakers would find authentic.

#### Acceptance Criteria

1. WHEN humanizing Vietnamese text THEN the Humanize_Service SHALL use Vietnamese-specific patterns including: informal particles (à, nhé, nha, ạ, nhỉ), colloquial expressions, and natural sentence flow
2. WHEN humanizing Chinese text THEN the Humanize_Service SHALL use Chinese-specific patterns including: modal particles (吧, 呢, 啊, 嘛), informal expressions, and appropriate punctuation (。！？)
3. WHEN humanizing Japanese text THEN the Humanize_Service SHALL use Japanese-specific patterns including: sentence-ending particles (ね, よ, な, かな), appropriate keigo levels, and casual verb forms
4. WHEN humanizing Korean text THEN the Humanize_Service SHALL use Korean-specific patterns including: speech levels (반말/존댓말), sentence-ending particles, and informal markers
5. WHEN humanizing Arabic text THEN the Humanize_Service SHALL use Arabic-specific patterns including: colloquial expressions, appropriate formality markers, and RTL text handling
6. WHEN humanizing Thai text THEN the Humanize_Service SHALL use Thai-specific patterns including: polite particles (ครับ/ค่ะ), informal markers, and appropriate spacing
7. WHEN humanizing Indonesian/Malay text THEN the Humanize_Service SHALL use appropriate informal markers, particles, and regional expressions

---

### Requirement 12: Enhanced AI Detection for Non-English Languages

**User Story:** As a user writing in a non-English language, I want the AI detection feature to accurately identify AI-generated content with the same accuracy as English detection.

#### Acceptance Criteria

1. WHEN detecting AI content in Vietnamese THEN the Gemini_Service SHALL use Vietnamese-specific AI indicators including: formal transition words (tuy nhiên, hơn nữa, do đó), formulaic structures, and lack of informal particles
2. WHEN detecting AI content in Chinese THEN the Gemini_Service SHALL use Chinese-specific AI indicators including: formal connectors (此外, 因此, 然而), uniform sentence patterns, and lack of colloquial expressions
3. WHEN detecting AI content in Japanese THEN the Gemini_Service SHALL use Japanese-specific AI indicators including: overly formal keigo, lack of sentence-ending particles, and uniform politeness levels
4. WHEN detecting AI content in Korean THEN the Gemini_Service SHALL use Korean-specific AI indicators including: consistent speech levels, formal connectors, and lack of informal markers
5. WHEN the heuristic fallback is used THEN the Gemini_Service SHALL apply language-appropriate word frequency and sentence structure analysis for the detected language

---

### Requirement 13: Complete Backend Locale Coverage

**User Story:** As a developer, I want all backend locale files to have complete translations for all 15 supported languages, so that users have a consistent experience.

#### Acceptance Criteria

1. WHEN adding new translation keys to en.json THEN the Localization_Service SHALL have corresponding translations added to all 14 other locale files
2. WHEN a translation is missing THEN the Localization_Service SHALL log the missing key for review and fall back to English
3. WHEN returning error messages THEN the Backend SHALL use localized messages from the locale files instead of hardcoded strings
4. WHEN returning success messages THEN the Backend SHALL use localized messages from the locale files
5. WHEN returning analysis results THEN the Backend SHALL use localized suggestion messages appropriate for the user's language
