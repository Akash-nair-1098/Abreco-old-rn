import {OPENAI_API_KEY} from '@env';
import RNFS from 'react-native-fs';

type Result = {ok: true; text: string} | {ok: false; error: string};

const TRANSCRIBE_URL = 'https://api.openai.com/v1/audio/transcriptions';

function normalizeLanguageHint(localeOrLang: string): string | undefined {
  const raw = (localeOrLang || '').trim().toLowerCase();
  if (!raw) return undefined;
  // Accept "ml-IN" / "ml" / etc; OpenAI expects ISO-639-1.
  const lang = raw.includes('-') ? raw.split('-')[0] : raw;
  return /^[a-z]{2}$/.test(lang) ? lang : undefined;
}

function guessMimeType(path: string): string {
  const lower = path.toLowerCase();
  if (lower.endsWith('.wav')) return 'audio/wav';
  if (lower.endsWith('.m4a')) return 'audio/m4a';
  if (lower.endsWith('.mp4')) return 'audio/mp4';
  if (lower.endsWith('.aac')) return 'audio/aac';
  return 'application/octet-stream';
}

export async function transcribeWithOpenAI(params: {
  audioFilePath: string; // absolute path, may include file://
  languageHint?: string; // 'ml' or 'ml-IN' etc
}): Promise<Result> {
  const apiKey = (OPENAI_API_KEY || '').trim();
  if (!apiKey) return {ok: false, error: 'Missing OPENAI_API_KEY in .env'};

  const rawPath = params.audioFilePath.startsWith('file://')
    ? params.audioFilePath.replace('file://', '')
    : params.audioFilePath;

  const exists = await RNFS.exists(rawPath);
  if (!exists) return {ok: false, error: `Audio file not found: ${rawPath}`};

  const form = new FormData();
  form.append('model', 'whisper-1');

  const lang = normalizeLanguageHint(params.languageHint || '');
  if (lang) form.append('language', lang);

  form.append('file', {
    uri: `file://${rawPath}`,
    name: rawPath.split('/').pop() || 'voice.wav',
    type: guessMimeType(rawPath),
  } as any);

  const res = await fetch(TRANSCRIBE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
    },
    body: form,
  });

  if (!res.ok) {
    // OpenAI errors are usually JSON: { error: { message, type, ... } }
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const bodyJson: any = await res.json().catch(() => null);
      const msg =
        bodyJson?.error?.message ||
        bodyJson?.message ||
        JSON.stringify(bodyJson || {});
      return {ok: false, error: `OpenAI transcription failed (${res.status}): ${msg}`};
    }

    const bodyText = await res.text().catch(() => '');
    return {
      ok: false,
      error: `OpenAI transcription failed (${res.status}): ${bodyText || 'Unknown error'}`,
    };
  }

  const json: any = await res.json();
  const text = (json?.text || '').trim();
  if (!text) return {ok: false, error: 'Empty transcription'};
  return {ok: true, text};
}

