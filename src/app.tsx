import { useMemo, useState } from "react";
import { useLocalStorage } from "react-use";
import { AI } from "./ai";
import { ApiKeyDialog } from "./components/api-key-dialog";
import { Transcript } from "./components/transcript";
import { TranscriptionDevtools } from "./components/transcription-devtools";
import { Button } from "./components/ui/button";
import { TalkingPoint } from "./types";
import { TranscriptionResult, useTranscription } from "./use-transcription";

function App() {
  // Snaps are talking points that the listener wants to remember
  const [snaps, setSnaps] = useState<TalkingPoint[]>([]);
  const [highlightedSnap, setHighlightedSnap] = useState<TalkingPoint | null>(null);
  const [state, setState] = useState<any>()

  const transcription = useTranscription();
  const [transcriptinResults, setTranscriptinResults] = useState<TranscriptionResult[]>([]);

  const [openAiKey, setOpenAiKey] = useLocalStorage<string>(
    "openai-api-key",
    // @ts-expect-error property `env` does not exist for some reason
    import.meta.env.VITE_OPENAI_API_KEY,
  );
  const ai = useMemo(() => (openAiKey ? new AI(openAiKey) : undefined), [openAiKey]);

  const transcript = transcription.results.map((result) => result.transcript).join("");

  return (
    <div className="flex h-screen w-full flex-col items-center bg-background p-16 pb-0">
      <div className="mb-8 flex min-h-0 w-full grow text-gray-900">
        <div className="w-1/2 border-r border-gray-300 pr-8">
          {transcript || transcription.state === "transcribing" ? (
            <Transcript
              transcriptionResults={transcriptinResults}
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
            onClick={async () => {
              const session = await window.ai.assistant.create();
              const stream = session.promptStreaming(
                "You are a conference speaker. Give a talk on trains. Use only plain text and omit all headings.",
              );
              for await (const chunk of (stream as any)) {
                console.log('read', chunk);
                setState(Math.random())
              }
              // console.log('done')
              // const reader = stream.getReader();
              // (window as any).reader = reader;
              // async function read() {
              //   console.log("starting read");
              //   return reader
              //     .read()
              //     .then((result) => {
              //       console.log("finished read", result);
              //       return result
              //       // if (result.value) {
              //       //   // setTranscriptinResults([{ isFinal: true, transcript: result.value }]);
              //       // }
              //       // if (!result.done) {
              //       //   read();
              //       // }
              //     })
              //     .catch((e) => console.error("failed read", e));
              // }
              // async function readAll() {
              //   let result = await read();
              //   while (result && !result.done) {
              //     result = await read();
              //     setState(Math.random())
              //   }
              // }
              // readAll();
              // if (transcription.state === "transcribing") {
              //   transcription.stop();
              // } else {
              //   transcription.start();
              // }
            }}
            variant={transcription.state === "transcribing" ? "outline" : "default"}
          >
            {transcription.state === "transcribing" ? "Stop Transcription" : "Start Transcription"}
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
          <ApiKeyDialog apiKey={openAiKey} onApiKeySubmit={(key) => setOpenAiKey(key)} />
        </div>
      </div>
      {process.env.NODE_ENV === "development" && <TranscriptionDevtools />}
    </div>
  );
}

export default App;
