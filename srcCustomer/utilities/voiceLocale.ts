export const getVoiceLocaleForAppLanguage = (lang: string): string => {
  const normalized = (lang || '').trim();

  // If i18n already provides a locale (e.g. "ml-IN"), prefer it.
  if (normalized.includes('-')) {
    return normalized;
  }

  const map: Record<string, string> = {
    en: 'en-US',
    hi: 'hi-IN',
    ml: 'ml-IN',
    ar: 'ar-SA',
    es: 'es-ES',
    'zh-CN': 'zh-CN',
    fr: 'fr-FR',
    de: 'de-DE',
    pt: 'pt-BR',
    ja: 'ja-JP',
    ko: 'ko-KR',
    ru: 'ru-RU',
    tr: 'tr-TR',
    id: 'id-ID',
    th: 'th-TH',
    vi: 'vi-VN',
  };
  return map[normalized] || 'en-US';
};
