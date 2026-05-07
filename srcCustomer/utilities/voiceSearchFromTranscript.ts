import {TFunction} from 'i18next';
import {globalSearchProducts} from '../api/products/productsApi';

type ToastFn = (
  message: string,
  type: 'success' | 'error' | 'warning',
) => void;

export type VoiceSearchFromTranscriptOptions = {
  setSearchText: (text: string) => void;
  onResults: (searchTerm: string, results: any[]) => void | Promise<void>;
  showToast: ToastFn;
  t: TFunction;
  /** Floating FAB: add-to-cart voice commands. Header search: omit or false. */
  enableAddToCartIntent?: boolean;
  addToCart?: (item: any, qty: number) => Promise<void>;
};

const DEFAULT_ADD_TRIGGERS = [
  'add',
  'cart',
  'ചേർക്കുക',
  'ചേർക്ക്',
  'add to cart',
];

function toStringArray(val: unknown): string[] {
  if (!Array.isArray(val)) return [];
  return val
    .map(v => (typeof v === 'string' ? v.trim() : ''))
    .filter(Boolean);
}

/**
 * Shared pipeline: normalize transcript, optional add-to-cart intent, global search, navigate or toast.
 */
export async function runVoiceSearchFromTranscript(
  rawText: string,
  options: VoiceSearchFromTranscriptOptions,
): Promise<void> {
  const {
    setSearchText,
    onResults,
    showToast,
    t,
    enableAddToCartIntent,
    addToCart,
  } = options;

  const text = rawText?.trim();
  if (!text) return;

  const lowerText = text.toLowerCase();
  const i18nVoiceTriggers = toStringArray(
    t('voice_add_triggers', {returnObjects: true, defaultValue: [] as any}),
  );
  const i18nAddToCartTriggers = toStringArray(
    t('add_to_cart_triggers', {returnObjects: true, defaultValue: [] as any}),
  );
  const addTriggers = [
    ...DEFAULT_ADD_TRIGGERS,
    ...i18nVoiceTriggers,
    ...i18nAddToCartTriggers,
  ];
  const isAddIntent =
    enableAddToCartIntent &&
    addTriggers.some(tr => lowerText.includes(tr.toLowerCase()));

  let searchTerm = text;
  if (isAddIntent) {
    addTriggers.forEach(tr => {
      searchTerm = searchTerm.replace(new RegExp(tr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '');
    });
  }
  searchTerm = searchTerm.trim();
  if (!searchTerm) return;

  try {
    const results = await globalSearchProducts(searchTerm);

    if (isAddIntent && addToCart && results?.length === 1) {
      await addToCart(results[0], 1);
      showToast(
        t('added_to_cart_success', {
          item: results[0].name || results[0].title,
        }),
        'success',
      );
      return;
    }

    if (results?.length > 0) {
      setSearchText(searchTerm);
      await onResults(searchTerm, results);
    } else {
      showToast(t('no_products_found'), 'warning');
    }
  } catch (err: any) {
    showToast(err?.message || t('voice_error_message'), 'error');
  }
}
