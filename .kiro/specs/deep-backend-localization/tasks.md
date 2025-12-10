# Implementation Plan

## Phase 1: Foundation - Enhanced Localization Service

- [x] 1. Enhance Localization Service with locale-aware formatting
  - [x] 1.1 Add formatNumber function with locale support
    - Implement number formatting with locale-specific decimal/thousands separators
    - Support all 15 locales
    - _Requirements: 10.1, 4.4_
  - [x] 1.2 Add formatDate function with locale support
    - Implement date formatting with locale-specific patterns
    - Support all 15 locales
    - _Requirements: 10.2_
  - [x] 1.3 Add formatCurrency function with locale support
    - Implement currency formatting with locale-specific symbols and positions
    - _Requirements: 10.4_
  - [x] 1.4 Add formatDuration function with locale support
    - Implement duration formatting (hours, minutes, seconds) in user's language
    - _Requirements: 10.5_
  - [x] 1.5 Add pluralize function with language-specific rules
    - Implement pluralization rules for languages with complex plural forms (Russian, Arabic)
    - _Requirements: 5.5_
  - [x] 1.6 ~~Write property test for locale formatting~~ (SKIPPED - user requested no tests)
    - **Property 7: Locale Number Formatting**
    - **Validates: Requirements 4.4, 10.1-10.5**

- [x] 2. Checkpoint - SKIPPED (no tests)

## Phase 2: User-Friendly Error Handling

- [x] 3. Create User-Friendly Error Handler utility
  - [x] 3.1 Create error-handler.util.js with error mappings
    - Map technical errors to user-friendly keys
    - Define ERROR_MAPPINGS and FRIENDLY_ERROR_KEYS
    - _Requirements: 3.1-3.6_
  - [x] 3.2 Implement createUserFriendlyError function
    - Convert any error to user-friendly response
    - Include actionable guidance
    - Never expose technical details
    - _Requirements: 3.6, 9.5_
  - [x] 3.3 Add friendly error translations to all 15 locale files
    - Add errors.friendly section to en.json
    - Add translations to all other locale files (vi, zh, ja, ko, th, ar, fr, de, es, pt, it, ru, id, ms)
    - _Requirements: 3.1-3.5, 5.1_
  - [x] 3.4 ~~Write property test for error sanitization~~ (SKIPPED - user requested no tests)
    - **Property 5: Error Message Sanitization**
    - **Validates: Requirements 3.1-3.6**
  - [x] 3.5 ~~Write property test for actionable guidance~~ (SKIPPED - user requested no tests)
    - **Property 11: Actionable Error Guidance**
    - **Validates: Requirements 9.5**

- [ ] 4. Integrate error handler into controllers (OPTIONAL - not started)
  - [ ] 4.1 Update chat.controller.js to use user-friendly errors
    - Replace technical error responses with createUserFriendlyError
    - _Requirements: 3.1-3.6_
  - [ ] 4.2 Update analysis.controller.js to use user-friendly errors
    - Replace technical error responses with createUserFriendlyError
    - _Requirements: 3.1-3.6_
  - [ ] 4.3 Update other controllers (credit, payment, profile, support)
    - Replace technical error responses with createUserFriendlyError
    - _Requirements: 3.1-3.6_

- [x] 5. Checkpoint - SKIPPED (no tests)

## Phase 3: Language-Specific Humanization Patterns

- [x] 6. Enhance Language Processor Service with humanization patterns
  - [x] 6.1 Add humanization patterns for Vietnamese
    - Add particles: à, nhé, nha, ạ, nhỉ, đấy, thôi, mà
    - Add fillers: thực ra, nói chung, kiểu như, cơ bản là
    - Add starters: Nói thật, Thực ra, Mình nghĩ
    - Add informal markers
    - _Requirements: 8.1, 11.1_
  - [x] 6.2 Add humanization patterns for Chinese
    - Add modal particles: 吧, 呢, 啊, 嘛, 呀, 哦
    - Add fillers: 其实, 说实话, 基本上
    - Add starters: 说实话, 其实, 我觉得
    - _Requirements: 8.2, 11.2_
  - [x] 6.3 Add humanization patterns for Japanese
    - Add sentence-ending particles: ね, よ, な, かな, けど
    - Add fillers: まあ, ちょっと, 実は
    - Add formality levels: casual, polite, formal, keigo
    - _Requirements: 8.3, 11.3_
  - [x] 6.4 Add humanization patterns for Korean
    - Add particles: 요, 네, 죠, 거든요
    - Add fillers: 사실, 솔직히, 그냥
    - Add speech levels: 반말, 존댓말, 격식체
    - _Requirements: 8.4, 11.4_
  - [x] 6.5 Add humanization patterns for Thai
    - Add polite particles: ครับ, ค่ะ, นะ, เลย
    - Add fillers: จริงๆ, ก็, แบบ
    - _Requirements: 8.7, 11.6_
  - [x] 6.6 Add humanization patterns for Arabic
    - Add colloquial expressions and formality markers
    - Handle RTL text considerations
    - _Requirements: 8.5, 11.5_
  - [x] 6.7 Add humanization patterns for Indonesian/Malay
    - Add informal markers and particles
    - Add regional expressions
    - _Requirements: 8.7, 11.7_
  - [x] 6.8 Add humanization patterns for European languages (FR, DE, ES, PT, IT, RU)
    - Add language-specific contractions and informal expressions
    - _Requirements: 8.6_

- [x] 7. Checkpoint - SKIPPED (no tests)

## Phase 4: Enhanced Humanize Service

- [x] 8. Update Humanize Service for content-aware processing
  - [x] 8.1 Implement content language detection before processing
    - Detect language of input text
    - Use detected language for processing regardless of UI language
    - _Requirements: 1.1, 1.2_
  - [x] 8.2 Implement buildLanguageAwarePrompt function
    - Include language-specific anti-AI rules in prompts
    - Include language-specific humanization instructions
    - _Requirements: 1.3, 6.2_
  - [x] 8.3 Implement applyLanguageSpecificPatterns function
    - Apply particles, fillers, starters based on detected language
    - Preserve diacritics for Vietnamese
    - _Requirements: 1.4, 1.6_
  - [x] 8.4 Update AI_PHRASES_TO_AVOID for all 15 languages
    - Add language-specific AI phrases to avoid
    - _Requirements: 1.3_
  - [x] 8.5 Update HUMAN_MARKERS for all 15 languages
    - Add language-specific human markers
    - _Requirements: 1.4, 8.1-8.7_
  - [x] 8.6 ~~Write property test for content language preservation~~ (SKIPPED - user requested no tests)
    - **Property 1: Content Language Preservation**
    - **Validates: Requirements 1.1, 1.2**
  - [x] 8.7 ~~Write property test for language-specific pattern application~~ (SKIPPED - user requested no tests)
    - **Property 2: Language-Specific Pattern Application**
    - **Validates: Requirements 1.4, 8.1-8.7, 11.1-11.7**
  - [x] 8.8 ~~Write property test for Vietnamese diacritics preservation~~ (SKIPPED - user requested no tests)
    - **Property 3: Vietnamese Diacritics Preservation**
    - **Validates: Requirements 1.6**

- [x] 9. Checkpoint - SKIPPED (no tests)

## Phase 5: Enhanced AI Detection

- [x] 10. Update Gemini Service for language-aware AI detection
  - [x] 10.1 Add AI_INDICATORS_BY_LANGUAGE configuration
    - Add Vietnamese AI indicators: formal transitions, AI phrases, formulaic patterns
    - Add Chinese AI indicators
    - Add Japanese AI indicators with formality mismatch detection
    - Add Korean AI indicators with speech level mismatch detection
    - _Requirements: 2.1-2.4, 12.1-12.4_
  - [x] 10.2 Update detectAIContent to use language-specific indicators
    - Detect content language first
    - Use appropriate indicators for detected language
    - _Requirements: 2.1_
  - [x] 10.3 Update detectAIContentHeuristic for multilingual support
    - Use language-appropriate word frequency analysis
    - Use language-appropriate sentence structure analysis
    - _Requirements: 2.5, 12.5_
  - [x] 10.4 ~~Write property test for AI detection language awareness~~ (SKIPPED - user requested no tests)
    - **Property 4: AI Detection Language Awareness**
    - **Validates: Requirements 2.1-2.5, 12.1-12.5**

- [x] 11. Checkpoint - SKIPPED (no tests)

## Phase 6: Enhanced Notifications

- [x] 12. Add new notification templates to AutoNotification Service
  - [x] 12.1 Add FIRST_PURCHASE_BONUS template
    - Include base credits, bonus credits, total credits
    - Add translations for all 15 languages
    - _Requirements: 4.1, 4.3_
  - [x] ~~12.2 Add PLAN_UPGRADED template~~ (REMOVED - no subscription model)
  - [x] 12.3 Add FIRST_ANALYSIS_COMPLETED template
    - Include congratulatory message and next steps
    - Add translations for all 15 languages
    - _Requirements: 7.2_
  - [x] 12.4 Add RE_ENGAGEMENT template
    - Include remaining credits and call to action
    - Add translations for all 15 languages
    - _Requirements: 7.3_
  - [x] ~~12.5 Add SUBSCRIPTION_RENEWAL_REMINDER template~~ (REMOVED - no subscription model)

- [x] 13. Implement new notification functions
  - [x] 13.1 Implement sendFirstPurchaseBonusNotification
    - Calculate and display base + bonus credits
    - Format numbers according to user's locale
    - _Requirements: 4.1, 4.3, 4.4_
  - [x] ~~13.2 Implement sendPlanUpgradedNotification~~ (REMOVED - no subscription model)
  - [x] 13.3 Implement sendFirstAnalysisNotification
    - Trigger on first analysis completion
    - _Requirements: 7.2_
  - [x] 13.4 Implement sendReEngagementNotification
    - Check for 7-day inactivity
    - Include remaining credits
    - _Requirements: 7.3_
  - [x] ~~13.5 Implement sendSubscriptionRenewalReminder~~ (REMOVED - no subscription model)
  
  **NOTE: Also removed CREDITS_EXPIRING template and sendCreditsExpiringWarning function - credits never expire in this business model**
  - [x] 13.6 ~~Write property test for notification bonus separation~~ (SKIPPED - user requested no tests)
    - **Property 6: Notification Bonus Separation**
    - **Validates: Requirements 4.3**
  - [x] 13.7 ~~Write property test for notification language consistency~~ (SKIPPED - user requested no tests)
    - **Property 10: Notification Language Consistency**
    - **Validates: Requirements 7.5**

- [x] 14. Checkpoint - SKIPPED (no tests)

## Phase 7: Complete Locale Files

- [x] 15. Ensure all locale files have complete translations
  - [x] 15.1 Audit en.json for all required keys
    - Ensure all error messages, notifications, analysis results have keys
    - _Requirements: 5.1, 13.1_
  - [x] 15.2 Add missing translations to vi.json
    - Add friendly errors, new notifications, humanization messages
    - _Requirements: 5.1, 13.1_
  - [x] 15.3 Add missing translations to zh.json
    - _Requirements: 5.1, 13.1_
  - [x] 15.4 Add missing translations to ja.json
    - _Requirements: 5.1, 13.1_
  - [x] 15.5 Add missing translations to ko.json
    - _Requirements: 5.1, 13.1_
  - [x] 15.6 Add missing translations to remaining 10 locale files (fr, de, es, pt, it, ru, ar, th, id, ms)
    - _Requirements: 5.1, 13.1_
  - [x] 15.7 ~~Write property test for locale file completeness~~ (SKIPPED - user requested no tests)
    - **Property 8: Locale File Completeness**
    - **Validates: Requirements 5.1, 13.1**
  - [x] 15.8 ~~Write property test for translation fallback~~ (SKIPPED - user requested no tests)
    - **Property 9: Translation Fallback**
    - **Validates: Requirements 5.3, 13.2**

- [x] 16. Checkpoint - SKIPPED (no tests)

## Phase 8: Integration and Final Testing

- [ ] 17. Integration testing
  - [ ] 17.1 Test rewrite feature with all 15 languages
    - Verify content language is preserved
    - Verify language-specific patterns are applied
    - _Requirements: 1.1-1.7_
  - [ ] 17.2 Test AI detection with all 15 languages
    - Verify language-specific indicators are used
    - _Requirements: 2.1-2.5_
  - [ ] 17.3 Test error handling across all controllers
    - Verify no technical details leak
    - Verify user-friendly messages in all languages
    - _Requirements: 3.1-3.6_
  - [ ] 17.4 Test notifications with all 15 languages
    - Verify correct language is used
    - Verify locale-aware formatting
    - _Requirements: 4.1-4.6, 7.1-7.5_

- [ ] 18. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
