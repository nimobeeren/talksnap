import { useEffect, useState } from "react";
import { Button } from "./components/ui/button";

const LIPSUM = `Enim enim eu aliqua aliqua deserunt exercitation minim nulla consectetur. Quis enim et minim enim nulla commodo laborum. In eu aliquip consequat cillum nulla dolor velit ipsum. Eu consectetur consequat laboris consequat qui amet aute magna velit occaecat enim sunt proident duis elit. Sint consectetur nulla ad pariatur tempor aute. Eiusmod ad culpa cupidatat incididunt adipisicing do nostrud irure. Duis et enim cillum qui ex.

Amet id voluptate officia veniam anim cillum. Adipisicing nostrud aliqua pariatur mollit reprehenderit veniam eiusmod mollit officia incididunt esse consectetur amet cupidatat pariatur. Et mollit eu est ut elit voluptate. Est nostrud anim veniam commodo. Occaecat aliqua aute Lorem commodo. Laboris enim occaecat excepteur. Aliquip Lorem sit ut velit ea duis adipisicing Lorem nulla elit id incididunt ullamco magna exercitation.

Dolore dolore reprehenderit dolor anim reprehenderit. Mollit reprehenderit ad mollit eiusmod sit velit dolore sint ullamco excepteur ea. Non pariatur incididunt nulla eu fugiat officia excepteur mollit sit ex. Do culpa irure eiusmod incididunt consequat in cillum et do est sit sunt. Irure incididunt non cillum voluptate labore minim minim. Laborum anim laborum ea magna irure. Ea pariatur dolor magna irure aute pariatur ullamco pariatur laborum dolor ut nulla sit ipsum adipisicing.

Est cillum qui amet ex ad voluptate cillum magna cillum cupidatat. Nisi sit aute officia consectetur deserunt officia. Reprehenderit aliquip aliqua cillum deserunt ipsum et esse eiusmod velit anim occaecat. Nulla adipisicing laborum sunt.

In duis laborum ad veniam pariatur. Sit cupidatat pariatur sunt incididunt tempor ex aliquip exercitation adipisicing nulla voluptate. Id ipsum laboris enim consectetur id ullamco ad mollit enim ut minim magna aliquip magna in. Esse Lorem mollit aliqua nisi aliqua cupidatat anim enim quis nisi laborum. Elit fugiat duis est sit aliquip consectetur irure.

Adipisicing aliqua sit nulla ad ullamco culpa aute. Minim magna laborum amet eu et ex laborum nostrud culpa est. Proident fugiat et tempor labore aliqua commodo tempor. Minim ad exercitation laboris enim cupidatat quis fugiat sint officia ex in sit adipisicing sint.

Occaecat mollit eiusmod proident consequat irure elit excepteur et. Deserunt veniam amet ea proident ex laboris elit deserunt incididunt pariatur voluptate voluptate ullamco proident nostrud. Veniam adipisicing cillum tempor duis sint amet anim elit. Consectetur sit consectetur do et et officia do irure.

Amet amet labore commodo amet id ea ea amet aute incididunt mollit voluptate mollit quis excepteur. Incididunt officia pariatur dolor nostrud qui magna exercitation commodo esse cillum mollit deserunt consequat amet in. Fugiat ex excepteur ea velit sint incididunt enim elit est occaecat laboris mollit commodo duis ipsum. Deserunt velit fugiat reprehenderit deserunt consectetur excepteur. Eiusmod amet adipisicing cupidatat laboris voluptate adipisicing proident aliqua ullamco. Laboris fugiat labore ea labore officia dolore. Incididunt magna laboris amet nostrud magna aliqua mollit.`;

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarList =
  window.SpeechGrammarList || window.webkitSpeechGrammarList;
const SpeechRecognitionEvent =
  window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;

function App() {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState(LIPSUM);

  // While transcribing, listen for speech and update the transcription state
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

  // While transcribing, add a random word to the transcription every second
  // useEffect(() => {
  //   let intervalId = null;

  //   const startTranscribing = () => {
  //     intervalId = setInterval(() => {
  //       const randomWord = Math.random().toString(36).substring(2);
  //       setTranscription((prev) => `${prev} ${randomWord}`);
  //     }, 1000);
  //   };

  //   const stopTranscribing = () => {
  //     if (intervalId) {
  //       clearInterval(intervalId);
  //       intervalId = null;
  //     }
  //   };

  //   if (isTranscribing) {
  //     startTranscribing();
  //   } else {
  //     stopTranscribing();
  //   }

  //   return () => {
  //     stopTranscribing();
  //   };
  // }, [isTranscribing]);

  return (
    <div className="flex max-h-screen min-h-screen w-full flex-col items-center bg-background p-16 pb-0">
      <div className="mb-8 flex grow gap-16 overflow-y-auto">
        <p className="w-1/2">{transcription}</p>
        <p className="w-1/2">Highlights</p>
      </div>
      <div className="flex w-full justify-center border-t-2 border-gray-300 p-8">
        <Button
          onClick={() => setIsTranscribing((prev) => !prev)}
          className="bg-primary"
        >
          {isTranscribing ? "Stop Transcription" : "Start Transcription"}
        </Button>
      </div>
    </div>
  );
}

export default App;
