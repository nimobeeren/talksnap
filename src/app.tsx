import { useEffect, useMemo, useState } from "react";
import { useLocalStorage, usePrevious } from "react-use";
import { AI } from "./ai";
import { ApiKeyDialog } from "./components/api-key-dialog";
import { Transcript } from "./components/transcript";
import { Button } from "./components/ui/button";
import { TalkingPoint } from "./types";
import {
  useTranscription,
  type TranscriptionResult,
} from "./use-transcription";

// TODO: use a statemachine because the different `prev` states are confusing

function App() {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const prevIsTranscribing = usePrevious(isTranscribing);

  // Snaps are talking points that the listener wants to remember
  const [snaps, setSnaps] = useState<TalkingPoint[]>([]);
  const [highlightedSnap, setHighlightedSnap] = useState<TalkingPoint | null>(
    null,
  );

  const currentTranscriptionResults = useTranscription({
    enabled: isTranscribing,
  });
  const [oldTranscriptionResults, setOldTranscriptionResults] = useState<
    TranscriptionResult[]
  >([]);
  const transcriptionResults = [
    ...oldTranscriptionResults,
    ...currentTranscriptionResults,
  ];

  // TODO: probably move this to useTranscription
  // When a new transcription is started, save the current transcription results in state.
  // This is useful because transcription results are cleared when starting transcription.
  useEffect(() => {
    if (
      !prevIsTranscribing &&
      isTranscribing &&
      currentTranscriptionResults.length > 0
    ) {
      setOldTranscriptionResults((prev) => {
        return [
          ...prev,
          ...currentTranscriptionResults,
          { transcript: " ", isFinal: true }, // add a break between transcription sessions
        ];
      });
    }
  }, [prevIsTranscribing, isTranscribing, currentTranscriptionResults]);

  const [openAiKey, setOpenAiKey] = useLocalStorage<string>(
    "openai-api-key",
    // @ts-expect-error property `env` does not exist for some reason
    import.meta.env.VITE_OPENAI_API_KEY,
  );
  const ai = useMemo(
    () => (openAiKey ? new AI(openAiKey) : undefined),
    [openAiKey],
  );

  const transcript = transcriptionResults
    .map((result) => result.transcript)
    .join("");

  return (
    <div className="flex h-screen w-full flex-col items-center bg-background p-16 pb-0">
      <div className="mb-8 flex min-h-0 w-full grow text-gray-900">
        <div className="w-1/2 border-r border-gray-300 pr-8">
          {transcript || isTranscribing ? (
            <Transcript
              transcriptionResults={transcriptionResults}
              snaps={snaps}
              highlightedSnaps={highlightedSnap ? [highlightedSnap] : []}
              className="h-full w-full"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-center">
              A transcript will appear here when you press "Start Transcription"
            </div>
          )}
        </div>
        <div className="w-1/2 pl-8">
          {snaps.length > 0 ? (
            <ul className="list-inside list-disc overflow-y-auto">
              {snaps.map((snap) => (
                <li
                  key={snap.summary}
                  onMouseEnter={() => setHighlightedSnap(snap)}
                  onMouseLeave={() => setHighlightedSnap(null)}
                >
                  {snap.summary}
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex h-full items-center justify-center text-center">
              {ai
                ? "Highlights will appear here when you press 'Snap!'"
                : "To make snaps, you need to enter an OpenAI API key"}
            </div>
          )}
        </div>
      </div>
      {/* Bottom bar */}
      <div className="flex w-full flex-wrap justify-center gap-4 border-t-2 border-gray-300 p-8">
        <div className="-mr-4 grow basis-0">
          {/* Placeholder to keep main buttons centered */}
          {/* `-mr-4` is to counter the flex gap */}
        </div>
        <div className="flex gap-4">
          <Button
            onClick={() => setIsTranscribing((prev) => !prev)}
            variant={isTranscribing ? "outline" : "default"}
          >
            {isTranscribing ? "Stop Transcription" : "Start Transcription"}
          </Button>
          <Button
            disabled={!ai || !transcript}
            onClick={async () => {
              if (!ai) {
                alert("OpenAI key not set");
                return;
              }

              let lastTalkingPoint;
              try {
                lastTalkingPoint = await ai.getLastTalkingPoint(transcript);
              } catch (err) {
                console.error(err);
                return;
              }
              setSnaps((prev) => [...prev, lastTalkingPoint]);
            }}
          >
            Snap!
          </Button>
        </div>
        <div className="flex grow basis-0 justify-end">
          <ApiKeyDialog
            apiKey={openAiKey}
            onApiKeySubmit={(key) => setOpenAiKey(key)}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
