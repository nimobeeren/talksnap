import { useWebSpeechRecognition } from "./use-web-speech-recognition";

/** A piece of a transcript. */
export interface TranscriptionResult {
  /** Textual representation of what was said. */
  transcript: string;
  /** Whether the result may change in the future or not. */
  isFinal: boolean;
}

/** Maps the result of the Web Speech API Speech Recognition to our common interface. */
function mapResults(
  webResults: SpeechRecognitionResultList,
): TranscriptionResult[] {
  return Array.from(webResults).map((result) => ({
    transcript: result.item(0).transcript,
    isFinal: result.isFinal,
  }));
}

/**
 * High-level interface for transcribing voice from the device microphone.
 */
export function useTranscription({
  enabled,
}: {
  enabled: boolean;
}): TranscriptionResult[] {
  const webResults = useWebSpeechRecognition({ enabled });
  return webResults ? mapResults(webResults) : [];
}
