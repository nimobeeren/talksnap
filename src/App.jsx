import { useEffect, useState } from "react";

import { getLastTalkingPoint } from "./ai";
import { Button } from "./components/ui/button";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

function App() {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionResults, setTranscriptionResults] = useState(null);
  const [highlights, setHighlights] = useState([]);

  // While transcribing, listen for speech and update the transcription state
  useEffect(() => {
    let recognition = null;

    const handleTranscriptionResult = (event) => {
      setTranscriptionResults(event.results);
    };

    const startTranscription = () => {
      setTranscriptionResults(null);
      recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.addEventListener("result", handleTranscriptionResult);
      recognition.start();
    };

    const stopTranscription = () => {
      if (recognition) {
        recognition.removeEventListener("result", handleTranscriptionResult);
        recognition.stop();
        recognition = null;
      }
    };

    if (isTranscribing) {
      startTranscription();
    } else {
      stopTranscription();
    }

    return () => {
      stopTranscription();
    };
  }, [isTranscribing]);

  return (
    <div className="flex max-h-screen min-h-screen w-full flex-col items-center bg-background p-16 pb-0">
      <div className="mb-8 flex w-full grow gap-16 overflow-y-auto">
        <div className="w-1/2">
          {Array.from(transcriptionResults || []).map((result, index) => (
            <span
              key={`${index}-${result.isFinal}`}
              className={result.isFinal ? undefined : "text-gray-500"}
            >
              {result[0].transcript}
            </span>
          ))}
        </div>
        <ul className="w-1/2">
          {highlights.map((highlight) => (
            <li key={highlight.summary}>{highlight.summary}</li>
          ))}
        </ul>
      </div>
      <div className="flex w-full justify-center gap-4 border-t-2 border-gray-300 p-8">
        <Button onClick={() => setIsTranscribing((prev) => !prev)}>
          {isTranscribing ? "Stop Transcription" : "Start Transcription"}
        </Button>
        <Button
          onClick={async () => {
            const fullTranscript = Array.from(transcriptionResults || [])
              .map((result) => result[0].transcript)
              .join("");

            let point;
            try {
              point = await getLastTalkingPoint(fullTranscript);
            } catch (err) {
              console.error(err);
              return;
            }

            setHighlights((prev) => [...prev, point]);
          }}
        >
          Snap!
        </Button>
      </div>
    </div>
  );
}

export default App;
