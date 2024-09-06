import { useMachine } from "@xstate/react";
import { useEffect } from "react";
import { assign, fromPromise, setup } from "xstate";
import { TranscriptionResult } from "./use-transcription";

type AITextSession = any;

declare global {
  interface Window {
    ai: any;
  }
}

const machine = setup({
  types: {
    context: {} as {
      stream?: AsyncIterable<string>;
      result?: string;
    },
    events: {} as { type: "START" } | { type: "RESULT" } | { type: "FINISH" },
  },
  actors: {
    createStream: fromPromise<AsyncIterable<string>, { prompt: string }>(
      async ({ input }) => {
        const session = await window.ai.assistant.create();
        return session.promptStreaming(input.prompt);
      },
    ),
    readStream: fromPromise<string, { stream: AsyncIterable<string> }>(
      async ({ input }) => {
        let result = "";
        for await (const chunk of input.stream) {
          result = chunk;
        }
        return result;
      },
    ),
  },
}).createMachine({
  initial: "idle",
  states: {
    idle: {
      on: {
        START: {
          target: "starting",
        },
      },
    },
    starting: {
      invoke: {
        id: "getStream",
        src: "createStream",
        input: { prompt: "You are a conference speaker. Give a talk on airports. Use only plain text and omit all headings." },
        onDone: {
          target: "generating",
          actions: assign({
            stream: ({ event }) => event.output,
          }),
        },
      },
    },
    generating: {
      invoke: {
        id: "readStream",
        src: "readStream",
        // @ts-expect-error stream can be undefined
        input: ({ context }) => ({ stream: context.stream }),
        onDone: {
          target: "idle",
          actions: assign({
            result: ({ event }) => event.output,
          }),
        },
      },
    },
  },
});

export interface UseFakeAiTranscriptionOptions {
  /**
   * Maximum number of chunks per second. If this is faster than the AI can
   * generate, results will appear at the rate the AI generates them.
   */
  speed: number;
  prompt: string;
  /**
   * Callback for when a new transcription result arrives. This is called with
   * all results since starting the transcription.
   */
  onResult?: (results: TranscriptionResult[]) => void;
}

export function useFakeAiTranscription({
  speed,
  prompt,
  onResult,
}: UseFakeAiTranscriptionOptions): {
  start: () => void;
  stop: () => void;
} {
  // const [aiSession, setAiSession] = useState<AITextSession>(null);

  // useEffect(() => {
  //   return () => {
  //     aiSession?.destroy();
  //   };
  // }, [aiSession]);

  // const start = useCallback(async () => {
  //   let session: any;
  //   if (aiSession) {
  //     session = aiSession;
  //   } else {
  //     session = await window.ai.createTextSession();
  //     setAiSession(session);
  //   }

  //   const stream: ReadableStream<string> = session.promptStreaming(prompt);
  //   const reader = stream.getReader();

  //   const next = throttle({ interval: 1000, limit: speed })(async () => {
  //     try {
  //       return await reader.read();
  //     } catch (e) {
  //       if (e instanceof DOMException && e.name === "InvalidStateError") {
  //         // This is okay, happens when destroying the session while streaming results
  //         return { done: true, value: undefined };
  //       } else {
  //         throw e;
  //       }
  //     }
  //   });

  //   // FIXME: sometimes this will keep running after stopping transcription
  //   // This might be because the stream has already finished but there are still more chunks to be read
  //   while (true) {
  //     const { done, value: chunk } = await next();

  //     if (chunk) {
  //       const processedChunk = String(chunk).replaceAll("\n", " ");
  //       onResult?.([
  //         {
  //           transcript: processedChunk,
  //           isFinal: true,
  //         },
  //       ]);
  //     }

  //     if (done) break;
  //   }
  // }, [aiSession, prompt, speed, onResult]);

  // const stop = useCallback(() => {
  //   aiSession?.destroy();
  //   setAiSession(null);
  // }, [aiSession]);

  const [state, send] = useMachine(machine);

  useEffect(() => {
    // if (state.context.result) {
    //   const processedResult = String(state.context.result).replaceAll(
    //     "\n",
    //     " ",
    //   );
    //   onResult?.([
    //     {
    //       transcript: processedResult,
    //       isFinal: true,
    //     },
    //   ]);
    // }
    console.log(state.context.result)
  }, [state.context.result, onResult]);

  return {
    start: () => send({ type: "START" }),
    stop: () => {}, // TODO
  };
}
