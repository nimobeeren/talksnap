import { useEffect, useMemo, useState } from "react";
import { usePrevious } from "react-use";
import { useWebSpeechRecognition } from "./use-web-speech-recognition";

/** A piece of a transcript. */
export interface TranscriptionResult {
  /** Textual representation of what was said. */
  transcript: string;
  /** Whether the result may change in the future or not. */
  isFinal: boolean;
}

/** Maps the result of the Web Speech API to our internal interface. */
function mapResults(
  webResults: SpeechRecognitionResultList,
): TranscriptionResult[] {
  return Array.from(webResults).map((result) => ({
    transcript: result.item(0).transcript,
    isFinal: result.isFinal,
  }));
}

// TODO: use a statemachine because the different `prev` states are confusing

/**
 * High-level interface for transcribing voice from the device microphone.
 */
export function useTranscription({
  enabled,
}: {
  enabled: boolean;
}): TranscriptionResult[] {
  const prevEnabled = usePrevious(enabled);

  const currentWebResults = useWebSpeechRecognition({ enabled });
  const currentResults = useMemo(
    () => (currentWebResults ? mapResults(currentWebResults) : []),
    [currentWebResults],
  );

  const [oldResults, setOldResults] = useState<TranscriptionResult[]>([]);
  const transcriptionResults = [...oldResults, ...currentResults];

  // When a new transcription is started, save the current transcription results in state.
  // This is useful because transcription results are cleared when starting transcription.
  useEffect(() => {
    if (!prevEnabled && enabled && currentResults.length > 0) {
      setOldResults((prev) => {
        return [
          ...prev,
          ...currentResults,
          { transcript: " ", isFinal: true }, // add a break between transcription sessions
        ];
      });
    }
  }, [prevEnabled, enabled, currentResults]);

  return transcriptionResults;
}
