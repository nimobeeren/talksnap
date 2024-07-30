import { useState, useEffect } from "react";
import { TranscriptionResult } from "./use-transcription";
import { faker } from "@faker-js/faker";

export function useFakeTranscription({
  onResult,
  speed,
}: {
  onResult: (results: TranscriptionResult[]) => void;
  speed: number;
}): {
  start: () => void;
  stop: () => void;
} {
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const fakeResult: TranscriptionResult = {
        transcript: faker.lorem.sentence(),
        isFinal: true,
      };
      onResult([fakeResult]);
    }, 1000 / speed);

    return () => clearInterval(interval);
  }, [isRunning, speed, onResult]);

  return {
    start: () => setIsRunning(true),
    stop: () => setIsRunning(false),
  };
}
import { useState, useEffect } from "react";
import { TranscriptionResult } from "./use-transcription";
import { faker } from "@faker-js/faker";

export function useFakeTranscription({
  onResult,
  speed,
}: {
  onResult: (results: TranscriptionResult[]) => void;
  speed: number;
}): {
  start: () => void;
  stop: () => void;
} {
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const fakeResult: TranscriptionResult = {
        transcript: faker.lorem.sentence(),
        isFinal: true,
      };
      onResult([fakeResult]);
    }, 1000 / speed);

    return () => clearInterval(interval);
  }, [isRunning, speed, onResult]);

  return {
    start: () => setIsRunning(true),
    stop: () => setIsRunning(false),
  };
}
