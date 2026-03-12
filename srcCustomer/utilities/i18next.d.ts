import 'i18next';
import { resources } from './i18n'; // Adjust this path to point to your i18n.ts file

declare module 'i18next' {
  interface CustomTypeOptions {
    // This tells i18next to look at your English keys for autocomplete
    resources: (typeof resources)['en'];
    // This ensures 'translation' is recognized as the default namespace
    defaultNS: 'translation';
  }
}
