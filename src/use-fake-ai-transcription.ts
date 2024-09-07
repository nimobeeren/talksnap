import { useMachine } from "@xstate/react";
import { useEffect } from "react";
import { assign, fromPromise, raise, setup } from "xstate";
import { TranscriptionResult } from "./use-transcription";

// TODO: use speed
// TODO: implement stop
// TODO: maybe this should just export the machine instead of a hook?

const machine = setup({
  types: {
    input: {} as {
      prompt: string;
    },
    context: {} as {
      prompt: string;
      reader?: ReadableStreamDefaultReader<string>;
      result?: string;
    },
    events: {} as
      | { type: "START" }
      | { type: "RESULT" }
      | { type: "FINISH" }
      | { type: "READ" }
      | { type: "MORE" },
  },
  actors: {
    createReader: fromPromise<ReadableStreamDefaultReader<string>, { prompt: string }>(
      async ({ input }) => {
        const session = await window.ai.assistant.create();
        const stream = session.promptStreaming(input.prompt);
        return stream.getReader();
      },
    ),
    readChunk: fromPromise<
      ReadableStreamReadResult<string>,
      { reader: ReadableStreamDefaultReader<string> }
    >(async ({ input }) => {
      return input.reader.read();
    }),
  },
}).createMachine({
  context: ({ input }) => ({
    prompt: input.prompt,
  }),
  initial: "idle",
  states: {
    idle: {
      on: {
        START: {
          target: "initializing",
        },
      },
    },
    initializing: {
      invoke: {
        src: "createReader",
        input: ({ context }) => ({
          prompt: context.prompt,
        }),
        onDone: {
          target: "ready",
          actions: assign({
            reader: ({ event }) => event.output,
          }),
        },
      },
    },
    ready: {
      entry: raise({ type: "READ" }),
      on: {
        READ: {
          target: "reading",
        },
      },
    },
    reading: {
      invoke: {
        src: "readChunk",
        input: ({ context }) => ({ reader: context.reader! }),
        onDone: {
          actions: [
            assign({
              // Only update the result if the reader returned a value
              result: ({ event, context }) => event.output.value ?? context.result,
            }),
            raise(({ event }) => ({
              type: event.output.done ? "FINISH" : "MORE",
            })),
          ],
        },
      },
      on: {
        MORE: {
          target: "ready",
        },
        FINISH: {
          target: "idle",
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
  // speed,
  prompt,
  onResult,
}: UseFakeAiTranscriptionOptions): {
  start: () => void;
  stop: () => void;
} {
  const [state, send] = useMachine(machine, { input: { prompt } });

  useEffect(() => {
    console.log(state.value);
  }, [state.value]);

  useEffect(() => {
    if (state.context.result) {
      onResult?.([
        {
          transcript: String(state.context.result).replaceAll("\n", " "),
          isFinal: true,
        },
      ]);
    }
    console.log(state.context.result);
  }, [state.context.result, onResult]);

  return {
    start: () => send({ type: "START" }),
    stop: () => {}, // TODO
  };
}
