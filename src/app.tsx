import { useMemo, useState } from "react";
import { useLocalStorage } from "react-use";

import { AI } from "./ai";
import { ApiKeyDialog } from "./components/api-key-dialog";
import { Transcript } from "./components/transcript";
import { Button } from "./components/ui/button";
import { TalkingPoint } from "./types";
import { useSpeechRecognition } from "./use-speech-recognition";

function App() {
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Snaps are talking points that the listener wants to remember
  const [snaps, setSnaps] = useState<TalkingPoint[]>([]);
  const [highlightedSnap, setHighlightedSnap] = useState<TalkingPoint | null>(
    null,
  );

  const transcriptionResults = useSpeechRecognition({
    enabled: isTranscribing,
  });

  const [openAiKey, setOpenAiKey] = useLocalStorage<string>(
    "openai-api-key",
    // @ts-expect-error property `env` does not exist for some reason
    import.meta.env.VITE_OPENAI_API_KEY,
  );
  const ai = useMemo(
    () => (openAiKey ? new AI(openAiKey) : undefined),
    [openAiKey],
  );

  return (
    <div className="flex h-screen w-full flex-col items-center bg-background p-16 pb-0">
      <div className="mb-8 flex min-h-0 w-full grow gap-16">
        <Transcript
          transcriptionResults={transcriptionResults}
          snaps={snaps}
          highlightedSnaps={highlightedSnap ? [highlightedSnap] : []}
          className="w-1/2 overflow-y-auto text-gray-900"
        />
        <ul className="w-1/2 overflow-y-auto text-gray-900">
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
      </div>
      <div className="flex w-full flex-wrap justify-center gap-4 border-t-2 border-gray-300 p-8">
        <div className="grow basis-0 -mr-4">
          {/* Placeholder to keep main buttons centered */}
          {/* `-mr-4` is to counter the flex gap */}
        </div>
        <div className="flex gap-4">
          <Button onClick={() => setIsTranscribing((prev) => !prev)}>
            {isTranscribing ? "Stop Transcription" : "Start Transcription"}
          </Button>
          <Button
            disabled={!ai}
            onClick={async () => {
              if (!ai) {
                alert("OpenAI key not set");
                return;
              }
              const transcript = Array.from(transcriptionResults || [])
                .filter((result) => result.isFinal)
                .map((result) => result[0].transcript)
                .join("");
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
