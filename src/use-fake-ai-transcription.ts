import { useMachine } from "@xstate/react";
import { useEffect } from "react";
import { assign, fromPromise, raise, setup, type ActorRef } from "xstate";
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
      // reader?: ReadableStreamDefaultReader<string>;
      stream?: ReadableStream<string>;
      result?: string;
    },
    events: {} as
      | { type: "START" }
      | { type: "RESULT" }
      | { type: "FINISH" }
      | { type: "READ" }
      // | { type: "MORE" }
      | { type: "CHUNK"; value: string },
  },
  actors: {
    // createReader: fromPromise<ReadableStreamDefaultReader<string>, { prompt: string }>(
    //   async ({ input }) => {
    //     const session = await window.ai.assistant.create();
    //     const stream = session.promptStreaming(input.prompt);
    //     const reader = stream.getReader();
    //     (window as any).reader = reader;
    //     return reader;
    //   },
    // ),
    // readChunk: fromPromise<
    //   ReadableStreamReadResult<string>,
    //   { reader: ReadableStreamDefaultReader<string> }
    // >(async ({ input }) => {
    //   console.log("reading chunk");
    //   const chunk = await input.reader.read();
    //   console.log("finished reading chunk");
    //   return chunk;
    // }),
    createStream: fromPromise<ReadableStream<string>, { prompt: string }>(async ({ input }) => {
      const session = await window.ai.assistant.create();
      return session.promptStreaming(input.prompt);
    }),
    readStream: fromPromise<void, { stream: ReadableStream<string>; parent: ActorRef<any, any> }>(
      async ({ input }) => {
        console.log("start read");
        for await (const chunk of input.stream as unknown as AsyncIterable<string>) {
          console.log("sending", chunk);
          input.parent.send({ type: "CHUNK", value: chunk });
        }
      },
    ),
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
        src: "createStream",
        input: ({ context }) => ({
          prompt: context.prompt,
        }),
        onDone: {
          target: "ready",
          actions: assign({
            stream: ({ event }) => event.output,
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
        src: "readStream",
        input: ({ context, self }) => ({ stream: context.stream!, parent: self }),
        onDone: {
          actions: [
            // assign({
            //   // Only update the result if the reader returned a value
            //   result: ({ event, context }) => {
            //     console.log("chunk value", event.output.value);
            //     return event.output.value ?? context.result;
            //   },
            // }),
            raise(() => {
              // console.log("chunk done", event.output.done);
              console.log("read done");
              return {
                type: "FINISH",
              };
            }),
          ],
        },
      },
      on: {
        CHUNK: {
          target: "reading",
          // LEFT HERE
          // FIXME: having this assign action makes the stream freeze
          actions: [
            assign({
              result: ({ event }) => {
                console.log("reading", event.value);
                return event.value;
              },
            }),
          ],
        },
        // MORE: {
        //   target: "ready",
        // },
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
    // console.log(state.context.result);
  }, [state.context.result, onResult]);

  return {
    start: () => send({ type: "START" }),
    stop: () => {}, // TODO
  };
}
