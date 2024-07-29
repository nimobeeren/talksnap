import { useMachine } from "@xstate/react";
import { assign, setup } from "xstate";
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

const transcriptionMachine = setup({
  types: {
    context: {} as {
      oldResults: TranscriptionResult[];
      currentResults: TranscriptionResult[];
    },
    events: {} as
      | { type: "START" }
      | { type: "STOP" }
      | { type: "RESULTS"; results: TranscriptionResult[] },
  },
  actions: {
    // TODO: find a way to force the caller to provide these actions
    startTranscription: () => {},
    stopTranscription: () => {},
  },
}).createMachine({
  id: "transcription",
  initial: "idle",
  context: {
    oldResults: [],
    currentResults: [],
  },
  states: {
    idle: {
      on: {
        START: {
          target: "transcribing",
          actions: [{ type: "startTranscription" }],
        },
      },
    },
    transcribing: {
      entry: assign({
        oldResults: ({ context }) => [
          ...context.oldResults,
          ...context.currentResults,
          { transcript: " ", isFinal: true },
        ],
        currentResults: () => [],
      }),
      on: {
        STOP: {
          target: "idle",
          actions: [{ type: "stopTranscription" }],
        },
        RESULTS: {
          actions: assign({
            currentResults: ({ event }) => event.results,
          }),
        },
      },
    },
  },
});

export function useTranscription(): {
  results: TranscriptionResult[];
  start: () => void;
  stop: () => void;
  state: string;
} {
  const { start, stop } = useWebSpeechRecognition({
    onResult: (webResults) => {
      send({ type: "RESULTS", results: mapResults(webResults) });
    },
  });

  const [state, send] = useMachine(
    transcriptionMachine.provide({
      actions: {
        startTranscription: start,
        stopTranscription: stop,
      },
    }),
  );

  return {
    results: [...state.context.oldResults, ...state.context.currentResults],
    start: () => {
      send({ type: "START" });
    },
    stop: () => {
      send({ type: "STOP" });
    },
    state: state.value,
  };
}
