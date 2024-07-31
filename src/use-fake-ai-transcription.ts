import { useCallback, useEffect, useState } from "react";
import { TranscriptionResult } from "./use-transcription";

type AITextSession = any;

declare global {
  interface Window {
    ai: any;
  }
}

export function useFakeAiTranscription({
  speed,
  onResult,
}: {
  /**
   * Maximum number of chunks per second. If this is faster than the AI can
   * generate, results will appear at the rate the AI generates them.
   */
  speed: number;
  /**
   * Callback for when a new transcription result arrives. This is called with
   * all results since starting the transcription.
   */
  onResult?: (results: TranscriptionResult[]) => void;
}): {
  start: () => void;
  stop: () => void;
} {
  const [aiSession, setAiSession] = useState<AITextSession>(null);

  useEffect(() => {
    return () => {
      aiSession?.destroy();
    };
  }, [aiSession]);

  const start = useCallback(async () => {
    let session: any;
    if (aiSession) {
      session = aiSession;
    } else {
      session = await window.ai.createTextSession();
      setAiSession(session);
    }

    const stream = session.promptStreaming(
      "You are a conference speaker. Give a talk on software testing.",
    );

    try {
      for await (const chunk of stream) {
        const processedChunk = String(chunk).replaceAll("\n", " ");
        onResult?.([
          {
            transcript: processedChunk,
            isFinal: true,
          },
        ]);
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "InvalidStateError") {
        // This is okay, happens when destroying the session while streaming results
      } else {
        throw e;
      }
    }
  }, [onResult, aiSession]);

  const stop = useCallback(() => {
    aiSession?.destroy();
    setAiSession(null);
  }, [aiSession]);

  return {
    start,
    stop,
  };
}
