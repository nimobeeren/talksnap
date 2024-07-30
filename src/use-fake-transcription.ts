import { faker } from "@faker-js/faker";
import { useEffect, useState } from "react";
import { TranscriptionResult } from "./use-transcription";

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
  const [results, setResults] = useState<TranscriptionResult[]>([]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const newResults = results;

      // Add a separator if there are existing results
      if (newResults.length > 0) {
        newResults.push({
          transcript: " ",
          isFinal: true,
        });
      }
      // Add a new fake result
      newResults.push({
        transcript: faker.lorem.word(),
        isFinal: true,
      });

      setResults(newResults);
      onResult(newResults);
    }, 1000 / speed);

    return () => clearInterval(interval);
  }, [isRunning, speed, onResult, results]);

  return {
    start: () => {
      setResults([]);
      setIsRunning(true);
    },
    stop: () => setIsRunning(false),
  };
}
