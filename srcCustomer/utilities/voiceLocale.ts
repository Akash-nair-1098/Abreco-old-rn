export const getVoiceLocaleForAppLanguage = (lang: string): string => {
  const normalized = (lang || '').trim();

  // If i18n already provides a locale (e.g. "ml-IN"), prefer it.
  if (normalized.includes('-')) {
    return normalized;
  }

  const map: Record<string, string> = {
    en: 'en-US',
    hi: 'hi-IN',
    ml: 'ml-IN', // Critical for Malayalam
    ar: 'ar-SA',
    es: 'es-ES',
    'zh-CN': 'zh-CN',
  };
  return map[normalized] || 'en-US';
};
