/**
 * Auto-generated TypeScript Types for i18n
 * Generated from: en.json
 * Generated at: 2025-12-12T12:01:50.468Z
 * DO NOT EDIT MANUALLY - Run generate-i18n-types.js to regenerate
 */

// Supported language codes
export type SupportedLanguage =
  | 'en' | 'vi' | 'zh' | 'ja' | 'ko'
  | 'fr' | 'de' | 'es' | 'pt' | 'it'
  | 'ru' | 'ar' | 'th' | 'id' | 'ms';

export type AnalysisKey =
  | 'analysis.sentence_too_long'
  | 'analysis.sentence_too_short'
  | 'analysis.complex_vocabulary'
  | 'analysis.simple_vocabulary'
  | 'analysis.high_formality'
  | 'analysis.low_formality'
  | 'analysis.repetitive_starters'
  | 'analysis.missing_transitions'
  | 'analysis.excessive_transitions'
  | 'analysis.uniform_sentence_length'
  | 'analysis.no_contractions'
  | 'analysis.excessive_punctuation'
  | 'analysis.low_punctuation'
  | 'analysis.ai_probability_high'
  | 'analysis.ai_probability_medium'
  | 'analysis.ai_probability_low'
  | 'analysis.human_likely'
  | 'analysis.analysis_completed'
  | 'analysis.text_too_short'
  | 'analysis.processing_error'
  | 'analysis.chunks_analyzed'
  | 'analysis.deep_analysis_triggered'
  | 'analysis.confidence_low'
  | 'analysis.confidence_medium'
  | 'analysis.confidence_high';

export type SuggestionsKey =
  | 'suggestions.avgWordLength_low'
  | 'suggestions.avgWordLength_high'
  | 'suggestions.avgSentenceLength_low'
  | 'suggestions.avgSentenceLength_high'
  | 'suggestions.readabilityScore_low'
  | 'suggestions.readabilityScore_high'
  | 'suggestions.vocabularyRichness_low'
  | 'suggestions.vocabularyRichness_high'
  | 'suggestions.punctuationRatio_low'
  | 'suggestions.punctuationRatio_high'
  | 'suggestions.improve_flow'
  | 'suggestions.vary_sentence_structure'
  | 'suggestions.add_personal_voice'
  | 'suggestions.reduce_formality'
  | 'suggestions.increase_formality';

export type BenchmarkKey =
  | 'benchmark.comparison_title'
  | 'benchmark.within_range'
  | 'benchmark.below_range'
  | 'benchmark.above_range'
  | 'benchmark.ideal_value'
  | 'benchmark.your_value'
  | 'benchmark.style_blog'
  | 'benchmark.style_academic'
  | 'benchmark.style_casual'
  | 'benchmark.style_professional'
  | 'benchmark.overall_score'
  | 'benchmark.metric_avgWordLength'
  | 'benchmark.metric_avgSentenceLength'
  | 'benchmark.metric_readabilityScore'
  | 'benchmark.metric_vocabularyRichness'
  | 'benchmark.metric_punctuationRatio';

export type VoiceProfileKey =
  | 'voice_profile.created'
  | 'voice_profile.updated'
  | 'voice_profile.deleted'
  | 'voice_profile.not_found'
  | 'voice_profile.sample_added'
  | 'voice_profile.sample_removed'
  | 'voice_profile.insufficient_samples'
  | 'voice_profile.analysis_complete'
  | 'voice_profile.match_high'
  | 'voice_profile.match_medium'
  | 'voice_profile.match_low'
  | 'voice_profile.deviation_detected'
  | 'voice_profile.deviation_mild'
  | 'voice_profile.deviation_moderate'
  | 'voice_profile.deviation_severe'
  | 'voice_profile.tone_professional'
  | 'voice_profile.tone_casual'
  | 'voice_profile.tone_academic'
  | 'voice_profile.tone_creative'
  | 'voice_profile.tone_friendly';

export type ProfileStreamKey =
  | 'profile_stream.validating'
  | 'profile_stream.creating_embeddings'
  | 'profile_stream.analyzing_patterns'
  | 'profile_stream.generating_voice'
  | 'profile_stream.saving_profile'
  | 'profile_stream.reasoning_embeddings'
  | 'profile_stream.reasoning_embeddings_done'
  | 'profile_stream.reasoning_similarity'
  | 'profile_stream.reasoning_similarity_passed'
  | 'profile_stream.reasoning_statistics'
  | 'profile_stream.reasoning_statistics_done'
  | 'profile_stream.reasoning_voice_start'
  | 'profile_stream.reasoning_voice_done'
  | 'profile_stream.reasoning_voice_fallback'
  | 'profile_stream.reasoning_saving'
  | 'profile_stream.reasoning_complete';

export type AiDetectionKey =
  | 'ai_detection.title'
  | 'ai_detection.result_human'
  | 'ai_detection.result_mostly_human'
  | 'ai_detection.result_mixed'
  | 'ai_detection.result_likely_ai'
  | 'ai_detection.result_ai'
  | 'ai_detection.result_uncertain'
  | 'ai_detection.evidence_title'
  | 'ai_detection.human_indicators_title'
  | 'ai_detection.ai_indicators_title'
  | 'ai_detection.indicator_ai_phrases'
  | 'ai_detection.indicator_uniform_length'
  | 'ai_detection.indicator_no_contractions'
  | 'ai_detection.indicator_excessive_transitions'
  | 'ai_detection.indicator_formulaic_structure'
  | 'ai_detection.indicator_repetitive_vocabulary'
  | 'ai_detection.indicator_lacks_personal_voice'
  | 'ai_detection.indicator_personal_voice'
  | 'ai_detection.indicator_informal_language'
  | 'ai_detection.indicator_natural_questions'
  | 'ai_detection.indicator_emotional_expression'
  | 'ai_detection.indicator_natural_variation'
  | 'ai_detection.heuristic_fallback';

export type HumanizeKey =
  | 'humanize.title'
  | 'humanize.processing'
  | 'humanize.complete'
  | 'humanize.failed'
  | 'humanize.no_changes_needed'
  | 'humanize.changes_applied'
  | 'humanize.original_label'
  | 'humanize.humanized_label'
  | 'humanize.change_type_vocabulary'
  | 'humanize.change_type_structure'
  | 'humanize.change_type_tone'
  | 'humanize.change_type_flow'
  | 'humanize.job_started';

export type ErrorsKey =
  | 'errors.generic'
  | 'errors.invalid_input'
  | 'errors.text_required'
  | 'errors.text_too_short'
  | 'errors.text_too_long'
  | 'errors.quota_exceeded'
  | 'errors.rate_limited'
  | 'errors.unauthorized'
  | 'errors.forbidden'
  | 'errors.not_found'
  | 'errors.server_error'
  | 'errors.service_unavailable'
  | 'errors.timeout'
  | 'errors.embedding_failed'
  | 'errors.analysis_failed'
  | 'errors.profile_creation_failed'
  | 'errors.insufficient_credits'
  | 'errors.invalid_language'
  | 'errors.file_too_large'
  | 'errors.invalid_file_type'
  | 'errors.network_error'
  | 'errors.database_error'
  | 'errors.validation_failed'
  | 'errors.auth_required'
  | 'errors.session_expired'
  | 'errors.invalid_token'
  | 'errors.token_expired'
  | 'errors.friendly.timeout'
  | 'errors.friendly.temporary_issue'
  | 'errors.friendly.connection'
  | 'errors.friendly.auth_required'
  | 'errors.friendly.session_expired'
  | 'errors.friendly.forbidden'
  | 'errors.friendly.too_many_requests'
  | 'errors.friendly.service_busy'
  | 'errors.friendly.insufficient_credits'
  | 'errors.friendly.invalid_input'
  | 'errors.friendly.file_too_large'
  | 'errors.friendly.invalid_file_type'
  | 'errors.friendly.not_found'
  | 'errors.friendly.generic';

export type ActionsKey =
  | 'actions.try_again'
  | 'actions.try_again_later'
  | 'actions.check_connection'
  | 'actions.sign_in'
  | 'actions.sign_in_again'
  | 'actions.contact_support'
  | 'actions.wait_and_retry'
  | 'actions.purchase_credits'
  | 'actions.check_input'
  | 'actions.reduce_file_size'
  | 'actions.check_file_type'
  | 'actions.go_back';

export type SuccessKey =
  | 'success.generic'
  | 'success.saved'
  | 'success.deleted'
  | 'success.updated'
  | 'success.created'
  | 'success.sent'
  | 'success.uploaded'
  | 'success.downloaded'
  | 'success.copied'
  | 'success.exported'
  | 'success.imported';

export type CreditsKey =
  | 'credits.balance'
  | 'credits.used'
  | 'credits.remaining'
  | 'credits.purchase_success'
  | 'credits.deducted'
  | 'credits.insufficient'
  | 'credits.free_tier';

export type NotificationsKey =
  | 'notifications.title'
  | 'notifications.empty'
  | 'notifications.mark_read'
  | 'notifications.mark_all_read'
  | 'notifications.new_notification'
  | 'notifications.type_info'
  | 'notifications.type_warning'
  | 'notifications.type_error'
  | 'notifications.type_success'
  | 'notifications.type_update'
  | 'notifications.type_promotion';

export type SupportKey =
  | 'support.ticket_created'
  | 'support.ticket_updated'
  | 'support.ticket_closed'
  | 'support.reply_sent'
  | 'support.status_open'
  | 'support.status_pending'
  | 'support.status_in_progress'
  | 'support.status_resolved'
  | 'support.status_closed'
  | 'support.priority_low'
  | 'support.priority_medium'
  | 'support.priority_high'
  | 'support.priority_urgent';

export type CommonKey =
  | 'common.loading'
  | 'common.processing'
  | 'common.please_wait'
  | 'common.retry'
  | 'common.cancel'
  | 'common.confirm'
  | 'common.save'
  | 'common.delete'
  | 'common.edit'
  | 'common.view'
  | 'common.close'
  | 'common.back'
  | 'common.next'
  | 'common.previous'
  | 'common.submit'
  | 'common.reset'
  | 'common.clear'
  | 'common.search'
  | 'common.filter'
  | 'common.sort'
  | 'common.export'
  | 'common.import'
  | 'common.download'
  | 'common.upload'
  | 'common.copy'
  | 'common.paste'
  | 'common.select_all'
  | 'common.deselect_all'
  | 'common.yes'
  | 'common.no'
  | 'common.ok'
  | 'common.done'
  | 'common.error'
  | 'common.warning'
  | 'common.info'
  | 'common.success'
  | 'common.required'
  | 'common.optional'
  | 'common.enabled'
  | 'common.disabled'
  | 'common.active'
  | 'common.inactive'
  | 'common.online'
  | 'common.offline'
  | 'common.available'
  | 'common.unavailable';

// Combined translation key type
export type TranslationKey =
  | AnalysisKey
  | SuggestionsKey
  | BenchmarkKey
  | VoiceProfileKey
  | ProfileStreamKey
  | AiDetectionKey
  | HumanizeKey
  | ErrorsKey
  | ActionsKey
  | SuccessKey
  | CreditsKey
  | NotificationsKey
  | SupportKey
  | CommonKey;

// Interpolation parameters for keys that require them
export interface TranslationParams {
  'analysis.sentence_too_long': { count: number; avg: string };
  'analysis.sentence_too_short': { count: number };
  'analysis.complex_vocabulary': { current: string; expected: string };
  'analysis.simple_vocabulary': { current: string; expected: string };
  'analysis.chunks_analyzed': { count: number };
  'suggestions.avgWordLength_low': { value: string; min: number; max: number };
  'suggestions.avgWordLength_high': { value: string; min: number; max: number };
  'suggestions.avgSentenceLength_low': { value: string };
  'suggestions.avgSentenceLength_high': { value: string };
  'suggestions.readabilityScore_low': { value: string };
  'suggestions.readabilityScore_high': { value: string };
  'suggestions.vocabularyRichness_low': { value: string };
  'suggestions.vocabularyRichness_high': { value: string };
  'benchmark.ideal_value': { value: string };
  'benchmark.your_value': { value: string };
  'benchmark.overall_score': { score: number };
  'voice_profile.insufficient_samples': { min: number };
  'voice_profile.match_high': { score: number };
  'voice_profile.match_medium': { score: number };
  'voice_profile.match_low': { score: number };
  'profile_stream.creating_embeddings': { count: number };
  'profile_stream.reasoning_embeddings_done': { count: number };
  'profile_stream.reasoning_statistics_done': { avgLength: string; vocabulary: string };
  'profile_stream.reasoning_voice_done': { tone: string; formality: number; characteristics: string };
  'ai_detection.indicator_ai_phrases': { count: number };
  'ai_detection.indicator_excessive_transitions': { count: number };
  'humanize.changes_applied': { count: number };
  'errors.text_too_short': { min: number };
  'errors.text_too_long': { max: number };
  'errors.validation_failed': { details: string };
  'errors.friendly.too_many_requests': { seconds: number };
  'errors.friendly.service_busy': { seconds: number };
  'errors.friendly.insufficient_credits': { required: number; available: number };
  'credits.balance': { amount: number };
  'credits.used': { amount: number };
  'credits.remaining': { amount: number };
  'credits.purchase_success': { amount: number };
  'credits.deducted': { amount: number; action: string };
  'credits.insufficient': { required: number; available: number };
  'credits.free_tier': { used: number; limit: number };
}

// Type-safe translate function signature
export type TranslateFunction = {
  <K extends keyof TranslationParams>(key: K, lang: SupportedLanguage, params: TranslationParams[K]): string;
  <K extends Exclude<TranslationKey, keyof TranslationParams>>(key: K, lang?: SupportedLanguage, params?: Record<string, unknown>): string;
};

export {};