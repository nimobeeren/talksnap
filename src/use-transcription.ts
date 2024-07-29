import { useMemo, useState } from "react";
import { useMachine } from "@xstate/react";
import { setup } from "xstate";
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
  context: {} as {
    oldResults: TranscriptionResult[],
    currentResults: TranscriptionResult[],
  },
    events: {} as
      | { type: "start" }
      | { type: "stop" }
      | { type: "newResult"; results: TranscriptionResult[] },
}).createMachine({
  id: "transcription",
  initial: "idle",
  states: {
    idle: {
      on: {
        START: "transcribing",
      },
    },
    transcribing: {
      entry: assign({
        oldResults: (context) => [
          ...context.oldResults,
          ...context.currentResults,
          { transcript: " ", isFinal: true },
        ],
        currentResults: () => [],
      }),
      on: {
        STOP: "idle",
        RESULTS: {
          actions: assign({
            currentResults: (_, event) => event.results,
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
  const [state, send] = useMachine(transcriptionMachine);

  const { start, stop } = useWebSpeechRecognition({
    onResult: (webResults) => {
      const currentResults = mapResults(webResults);
      send({ type: "RESULTS", results: currentResults });
    },
  });

  const results = [...state.context.oldResults, ...state.context.currentResults];

  return {
    results,
    start: () => {
      send("START");
      start();
    },
    stop: () => {
      send("STOP");
      stop();
    },
    state: state.value,
  };
}
