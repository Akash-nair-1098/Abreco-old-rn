declare module '@env' {
    export const GOOGLE_MAPS_API_KEY: string;
    /** Google AI Studio API key (voice transcription via Gemini). */
    export const GEMINI_API_KEY: string;
    /** Optional, e.g. gemini-2.5-flash (recommended for new API keys) */
    export const GEMINI_MODEL: string;
    // Add other variables here as you add them to your .env file
  }