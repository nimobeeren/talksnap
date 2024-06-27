import { useEffect, useState } from "react";
import { Button } from "./components/ui/button";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarList =
  window.SpeechGrammarList || window.webkitSpeechGrammarList;
const SpeechRecognitionEvent =
  window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;

function App() {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState("");

  useEffect(() => {
    let recognition = null;

    const handleTranscriptionResult = (event) => {
      console.log(event.results);

      let fullTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        if (fullTranscript !== "") {
          fullTranscript += ". ";
        }
        fullTranscript += event.results[i][0].transcript;
      }
      setTranscription(fullTranscript);
    };

    const startTranscription = () => {
      recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = true;
      recognition.interimResults = false;
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
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-16">
      <Button
        onClick={() => setIsTranscribing((prev) => !prev)}
        className="bg-primary"
      >
        {isTranscribing ? "Stop Transcription" : "Start Transcription"}
      </Button>
      <p>{transcription}</p>
    </div>
  );
}

export default App;
