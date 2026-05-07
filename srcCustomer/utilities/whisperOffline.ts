import {Platform} from 'react-native';
import RNFS from 'react-native-fs';
import {initWhisper} from 'whisper.rn';

// Multilingual model is required for Malayalam.
// Keep it small for mobile. You can later switch to ggml-base.bin for better accuracy.
const MODEL_URL =
  'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.bin';

const MODEL_FILENAME = 'ggml-tiny.bin';

function modelPath(): string {
  // DocumentDirectory is persisted across launches.
  return `${RNFS.DocumentDirectoryPath}/${MODEL_FILENAME}`;
}

type WhisperContext = Awaited<ReturnType<typeof initWhisper>>;

let whisperContext: WhisperContext | null = null;

export async function ensureWhisperModelDownloaded(): Promise<
  {ok: true; path: string} | {ok: false; error: string}
> {
  const path = modelPath();
  try {
    const exists = await RNFS.exists(path);
    if (exists) return {ok: true, path};

    const {promise} = RNFS.downloadFile({
      fromUrl: MODEL_URL,
      toFile: path,
    });
    const res = await promise;
    if (res.statusCode && res.statusCode >= 400) {
      return {ok: false, error: `Model download failed (${res.statusCode})`};
    }
    return {ok: true, path};
  } catch (e: any) {
    return {ok: false, error: e?.message || 'Model download failed'};
  }
}

export async function getWhisperContext(): Promise<
  {ok: true; ctx: WhisperContext} | {ok: false; error: string}
> {
  try {
    if (whisperContext) return {ok: true, ctx: whisperContext};

    const model = await ensureWhisperModelDownloaded();
    if (!model.ok) return model;

    whisperContext = await initWhisper({
      filePath: model.path,
      maxThreads: Platform.OS === 'android' ? 4 : 2,
    });

    return {ok: true, ctx: whisperContext};
  } catch (e: any) {
    return {ok: false, error: e?.message || 'Failed to init Whisper'};
  }
}

export async function transcribeOffline(params: {
  audioFilePath: string; // absolute path, may include file://
  languageHint?: string; // e.g. "ml"
}): Promise<{ok: true; text: string} | {ok: false; error: string}> {
  try {
    const ctxRes = await getWhisperContext();
    if (!ctxRes.ok) return ctxRes;

    const rawPath = params.audioFilePath.startsWith('file://')
      ? params.audioFilePath.replace('file://', '')
      : params.audioFilePath;

    const exists = await RNFS.exists(rawPath);
    if (!exists) return {ok: false, error: `Audio not found: ${rawPath}`};

    const {promise} = ctxRes.ctx.transcribe(rawPath, {
      language: params.languageHint,
    });
    const result: any = await promise;

    const text = (result?.result || '').trim();
    if (!text) return {ok: false, error: 'Empty transcription'};

    return {ok: true, text};
  } catch (e: any) {
    return {ok: false, error: e?.message || 'Offline transcription failed'};
  }
}

