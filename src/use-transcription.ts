import { useMachine } from "@xstate/react";
import { useCallback } from "react";
import { assign, setup } from "xstate";
import { useDevtoolsStore } from "./components/transcription-devtools";
import { useFakeAiTranscription } from "./use-fake-ai-transcription";
import { useWebSpeechRecognition } from "./use-web-speech-recognition";

/** A piece of a transcript. */
export interface TranscriptionResult {
  /** Textual representation of what was said. */
  transcript: string;
  /** Whether the result may change in the future or not. */
  isFinal: boolean;
}

/** Maps the result of the Web Speech API to our internal interface. */
function mapResults(webResults: SpeechRecognitionResultList): TranscriptionResult[] {
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
    // TODO: find a way to force the caller to provide these actions, i.e. raise an error when one is missing
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
  const devtoolsState = useDevtoolsStore();

  const [state, send] = useMachine(
    transcriptionMachine.provide({
      actions: {
        startTranscription: () => {
          if (useDevtoolsStore.getState().isEnabled) {
            startFake();
          } else {
            startWeb();
          }
        },
        stopTranscription: () => {
          if (useDevtoolsStore.getState().isEnabled) {
            stopFake();
          } else {
            stopWeb();
          }
        },
      },
    }),
  );

  const handleWebResult = useCallback(
    (webResults: SpeechRecognitionResultList) => {
      send({ type: "RESULTS", results: mapResults(webResults) });
    },
    [send],
  );
  const { start: startWeb, stop: stopWeb } = useWebSpeechRecognition({
    onResult: handleWebResult,
  });

  const handleFakeResult = useCallback(
    (fakeResults: TranscriptionResult[]) => {
      send({ type: "RESULTS", results: fakeResults });
    },
    [send],
  );
  const { start: startFake, stop: stopFake } = useFakeAiTranscription({
    speed: devtoolsState.speed,
    prompt: devtoolsState.prompt,
    onResult: handleFakeResult,
  });

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
