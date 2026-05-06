/**
 * Speech recognizer locales for @react-native-voice/Voice.start(locale).
 * Prefer region-specific locales where available for better accuracy.
 */
export function getVoiceLocaleForAppLanguage(language: string | undefined): string {
  const raw = String(language || 'en').trim();
  const base = raw.split('-')[0].toLowerCase();

  const exact: Record<string, string> = {
    en: 'en-US',
    'en-US': 'en-US',
    'en-AE': 'en-AE',
    'en-GB': 'en-GB',
    ar: 'ar-AE',
    'ar-AE': 'ar-AE',
    'ar-SA': 'ar-SA',
    hi: 'hi-IN',
    ml: 'ml-IN',
    es: 'es-ES',
    'es-MX': 'es-MX',
    zh: 'zh-CN',
    'zh-CN': 'zh-CN',
    'zh-TW': 'zh-TW',
    fr: 'fr-FR',
    de: 'de-DE',
    ta: 'ta-IN',
    ur: 'ur-PK',
  };

  const lowerRaw = raw.toLowerCase();
  if (exact[lowerRaw]) return exact[lowerRaw];
  if (exact[base]) return exact[base];
  return 'en-US';
}
