import throttle from "p-throttle";
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

    const stream: ReadableStream<string> = session.promptStreaming(
      "You are a conference speaker. Give a talk on software testing.",
    );
    const reader = stream.getReader();

    const next = throttle({ interval: 1000, limit: speed })(async () => {
      try {
        return await reader.read();
      } catch (e) {
        if (e instanceof DOMException && e.name === "InvalidStateError") {
          // This is okay, happens when destroying the session while streaming results
          return { done: true, value: undefined };
        } else {
          throw e;
        }
      }
    });
    
    // FIXME: sometimes this will keep running after stopping transcription
    // This might be because the stream has already finished but there are still more chunks to be read
    while (true) {
      const { done, value: chunk } = await next();

      if (chunk) {
        const processedChunk = String(chunk).replaceAll("\n", " ");
        onResult?.([
          {
            transcript: processedChunk,
            isFinal: true,
          },
        ]);
      }

      if (done) break;
    }
  }, [aiSession, speed, onResult]);

  const stop = useCallback(() => {
    aiSession?.destroy();
    setAiSession(null);
  }, [aiSession]);

  return {
    start,
    stop,
  };
}
