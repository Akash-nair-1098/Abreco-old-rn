import {GEMINI_API_KEY, GEMINI_MODEL} from '@env';
import RNFS from 'react-native-fs';

type Result = {ok: true; text: string} | {ok: false; error: string};

function getModelName(): string {
  let m = (GEMINI_MODEL || '').trim().replace(/^models\//, '');
  if (!m || m === 'gemini-2.0-flash') {
    // 2.0 Flash is unavailable for new API keys; upgrade default / legacy .env entries.
    m = 'gemini-2.5-flash';
  }
  return m;
}

function guessMimeType(path: string): string {
  const lower = path.toLowerCase();
  if (lower.endsWith('.wav')) return 'audio/wav';
  if (lower.endsWith('.m4a')) return 'audio/mp4';
  if (lower.endsWith('.aac')) return 'audio/aac';
  if (lower.endsWith('.mp3')) return 'audio/mp3';
  return 'audio/wav';
}

/** BCP-47 / app locale hint for prompting. */
function transcriptionPrompt(languageHint?: string): string {
  const raw = (languageHint || '').trim();
  let label = '';
  if (raw) {
    const key = raw.toLowerCase();
    const base = key.split('-')[0];
    const names: Record<string, string> = {
      en: 'English',
      'en-us': 'English (United States)',
      'en-gb': 'English (United Kingdom)',
      'ml-in': 'Malayalam (India)',
      ml: 'Malayalam',
      'hi-in': 'Hindi (India)',
      hi: 'Hindi',
      ar: 'Arabic',
      'ar-sa': 'Arabic (Saudi Arabia)',
      'ar-ae': 'Arabic (UAE)',
      es: 'Spanish',
      'es-es': 'Spanish (Spain)',
      'es-mx': 'Spanish (Mexico)',
      'zh-cn': 'Chinese (Simplified)',
      'zh-tw': 'Chinese (Traditional)',
      zh: 'Chinese',
      fr: 'French',
      'fr-fr': 'French (France)',
      de: 'German',
      pt: 'Portuguese',
      'pt-br': 'Portuguese (Brazil)',
      ja: 'Japanese',
      ko: 'Korean',
      ru: 'Russian',
      tr: 'Turkish',
      id: 'Indonesian',
      th: 'Thai',
      vi: 'Vietnamese',
      ta: 'Tamil',
      te: 'Telugu',
      kn: 'Kannada',
      bn: 'Bengali',
      ur: 'Urdu',
    };
    label = names[key] || names[base] || '';
  }

  const langLine = label
    ? `Primary language / locale hint: "${raw}". Prefer transcription in ${label} unless the audio is clearly in another language.`
    : 'Detect the spoken language automatically from the audio (any language or script).';

  return `${langLine}

Task: verbatim speech-to-text for a shopping / product voice search (short phrases, product names).

Rules:
- Transcribe exactly what was spoken using the correct writing system for that language (Malayalam in Malayalam script, Hindi in Devanagari, Arabic in Arabic script, etc.). Do not translate into English.
- If words from two languages are mixed in one utterance, keep both as spoken.
- Prefer product names, brands, and quantities as heard; omit only filler noises (uh, um) and false starts.
- Do not add explanations, categories, or guessed text that was not audible.
- No quotes, prefixes, bullets, markdown, or labels like "Transcription:".
- Output ONLY the transcription as one plain string.`;
}

function extractGeminiText(json: unknown): string {
  const root = json as {
    candidates?: Array<{
      content?: {parts?: Array<{text?: string}>};
      finishReason?: string;
    }>;
    promptFeedback?: {blockReason?: string};
  };
  const fb = root?.promptFeedback?.blockReason;
  if (fb) {
    throw new Error(`Gemini blocked the request: ${fb}`);
  }
  const parts = root?.candidates?.[0]?.content?.parts || [];
  return parts.map(p => (p?.text || '').trim()).filter(Boolean).join('\n').trim();
}

export async function transcribeWithGemini(params: {
  audioFilePath: string;
  languageHint?: string;
}): Promise<Result> {
  const apiKey = (GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    return {ok: false, error: 'Missing GEMINI_API_KEY in .env'};
  }

  const rawPath = params.audioFilePath.startsWith('file://')
    ? params.audioFilePath.replace('file://', '')
    : params.audioFilePath;

  const exists = await RNFS.exists(rawPath);
  if (!exists) {
    return {ok: false, error: `Audio file not found: ${rawPath}`};
  }

  const stat = await RNFS.stat(rawPath);
  const sizeBytes =
    typeof stat.size === 'number'
      ? stat.size
      : typeof stat.size === 'string'
        ? Number(stat.size)
        : 0;
  const sizeMb = sizeBytes / (1024 * 1024);
  if (sizeMb > 18) {
    return {
      ok: false,
      error: `Recording too large for Gemini inline upload (${sizeMb.toFixed(1)}MB). Speak a shorter phrase.`,
    };
  }

  let base64: string;
  try {
    base64 = await RNFS.readFile(rawPath, 'base64');
  } catch (e: any) {
    return {ok: false, error: e?.message || 'Failed to read audio file'};
  }

  const mimeType = guessMimeType(rawPath);
  const model = getModelName().replace(/^models\//, '');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model,
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64,
            },
          },
          {
            text: transcriptionPrompt(params.languageHint),
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 1024,
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body),
  });

  const json: any = await res.json().catch(() => null);
  if (!res.ok) {
    const msg =
      json?.error?.message ||
      json?.error?.status ||
      (typeof json === 'string' ? json : JSON.stringify(json || {}));
    return {ok: false, error: `Gemini transcription failed (${res.status}): ${msg}`};
  }

  let text: string;
  try {
    text = extractGeminiText(json);
  } catch (e: any) {
    return {ok: false, error: e?.message || 'Gemini transcription failed'};
  }

  if (!text) {
    const reason = (json as any)?.candidates?.[0]?.finishReason;
    return {
      ok: false,
      error: reason
        ? `Empty transcription (finishReason: ${reason})`
        : 'Empty transcription',
    };
  }

  const cleaned = text
    .replace(/^["'`]+|["'`]+$/g, '')
    .replace(/^transcription\s*:\s*/i, '')
    .trim();

  if (!cleaned) {
    return {ok: false, error: 'Empty transcription'};
  }

  return {ok: true, text: cleaned};
}
