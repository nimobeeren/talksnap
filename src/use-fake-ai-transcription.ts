import { useCallback, useState } from "react";
import { TranscriptionResult } from "./use-transcription";

type AITextSession = any;

declare global {
  interface Window {
    ai: any;
  }
}

export function useFakeAiTranscription({
  onResult,
  speed,
}: {
  onResult?: (results: TranscriptionResult[]) => void;
  speed: number;
}): {
  start: () => void;
  stop: () => void;
} {
  const [aiSession, setAiSession] = useState<AITextSession>(null);

  const startTranscription = useCallback(async () => {
    const session = await window.ai.createTextSession();
    setAiSession(session);

    const stream = session.promptStreaming(
      "You are a conference speaker. Give a talk on software testing.",
    );

    for await (const chunk of stream) {
      const processedChunk = String(chunk).replaceAll("\n", " ");
      onResult?.([
        {
          transcript: processedChunk,
          isFinal: true,
        },
      ]);
    }
  }, [onResult]);

  const stopTranscription = useCallback(() => {
    aiSession?.destroy();
    setAiSession(null);
  }, [aiSession]);

  return {
    start: startTranscription,
    stop: stopTranscription,
  };
}
