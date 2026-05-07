import AudioRecord from 'react-native-audio-record';
import RNFS from 'react-native-fs';

type RecordState = {
  isRecording: boolean;
  filePath: string | null;
  fileName: string | null;
  dataSub: {remove: () => void} | null;
};

let state: RecordState = {isRecording: false, filePath: null, fileName: null, dataSub: null};

function buildOutputPath(): string {
  const dir = RNFS.CachesDirectoryPath;
  return `${dir}/voice_search_${Date.now()}.wav`;
}

export async function startVoiceRecording(): Promise<{ok: true} | {ok: false; error: string}> {
  if (state.isRecording) return {ok: true};

  const filePath = buildOutputPath();
  try {
    const wavFile = filePath.split('/').pop() || `voice_search_${Date.now()}.wav`;
    AudioRecord.init({
      sampleRate: 16000,
      channels: 1,
      bitsPerSample: 16,
      wavFile,
    });

    // RNAudioRecord streams "data" events; without at least one listener RN logs:
    // "Sending `data` with no listeners registered."
    AudioRecord.on('data', () => {});

    await AudioRecord.start();
    state = {isRecording: true, filePath, fileName: wavFile, dataSub: null};
    return {ok: true};
  } catch (e: any) {
    state.dataSub?.remove?.();
    state = {isRecording: false, filePath: null, fileName: null, dataSub: null};
    return {ok: false, error: e?.message || 'Failed to start recording'};
  }
}

export async function stopVoiceRecording(): Promise<
  {ok: true; filePath: string} | {ok: false; error: string}
> {
  if (!state.isRecording || !state.filePath || !state.fileName) {
    return {ok: false, error: 'Not recording'};
  }

  const expectedPath = state.filePath;
  try {
    const stopRes: any = await AudioRecord.stop();
    state.dataSub?.remove?.();

    // On iOS the native module may return the actual output path.
    if (typeof stopRes === 'string' && stopRes.trim()) {
      const returnedPath = stopRes.startsWith('file://')
        ? stopRes.replace('file://', '')
        : stopRes;
      if (await RNFS.exists(returnedPath)) {
        state = {isRecording: false, filePath: null, fileName: null, dataSub: null};
        return {ok: true, filePath: returnedPath};
      }
    }

    const fileName = state.fileName;
    const candidates = [
      expectedPath,
      `${RNFS.CachesDirectoryPath}/${fileName}`,
      `${RNFS.DocumentDirectoryPath}/${fileName}`,
      `${RNFS.LibraryDirectoryPath}/${fileName}`,
      `${RNFS.TemporaryDirectoryPath}/${fileName}`,
    ];

    for (const p of candidates) {
      if (await RNFS.exists(p)) {
        state = {isRecording: false, filePath: null, fileName: null, dataSub: null};
        return {ok: true, filePath: p};
      }
    }

    state = {isRecording: false, filePath: null, fileName: null, dataSub: null};
    return {ok: false, error: `Recording stopped but file not found (${fileName})`};
  } catch (e: any) {
    state.dataSub?.remove?.();
    state = {isRecording: false, filePath: null, fileName: null, dataSub: null};
    return {ok: false, error: e?.message || 'Failed to stop recording'};
  }
}

