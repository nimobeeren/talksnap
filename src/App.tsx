import { useEffect, useState } from "react";

import { highlightLastTalkingPoint } from "./ai";
import { Transcript } from "./components/transcript";
import { Button } from "./components/ui/button";
import { Highlight } from "./types";

const MOCK_TRANSCRIPTION_RESULTS = [
  [
    {
      transcript: `a few logistical things one I'm I'm
carrying a magic Trackpad because
everyone has clickers what if we had
multiple Dimensions so we're going to
experiment with this
today and uh and two I'm also I'm using
like AI like fancy new everything right
like so this is to um and we're going to
go two dimensional with our uh slides as
well so I'm here to talk about the AI
engineer you're all here because you
believe that there's some value to this
idea um and then I just put like a
ridiculous 1,000x on this um but I do
think there is some meaning towards
thinking about highers higher orders of
magnitude towards raising your Ambitions
and that's what I would like all of you
to do today and to do with your friends
back
home so um and obviously a lot of AI
generated art because I mean it's an AI
conference we got to do got do that um
first of all I want to congratulate you
on being here um not just I'm not
talking about here location wise
physically I'm talking about here in
terms of the point in time uh imagine if
you were a mathematician when was the
best time to be born uh I I will propose
uh around about 600 AD this dude Brahma
Gupta he invented zero pretty pretty
pretty novel invention that took us only
4,000 years to do that um but there's
there's there's certain times where like
if you're in that field you you have to
be there that's the thing if you're
alive during that time you have to be
doing that thing uh physics when was the
best time to be born there's the right
answer 1905 1927 um and this conference
kind of is um inspired by the solv
conference um that's Albert Einstein M
curri and A lot of people that you just
saw in the opener
movie um same thing if you if you made
cars there's the right time 1900 to 1930
if you made personal Computing products
1980
2010 uh if you ever get this like if
you're a millennial if you're very
online you ever get these memes like
you're born to late explore the earth
born too early to explore the stars um
you're not too
late we are here uh this is based on
demographics and history the approximate
timeline of all Humanity um we know that
we're roughly about 73% of all
concurrent intelligences if we don't
expand our own intelligences or go to
other
planets um so my argument my message to
you today is that you are just in time
and the timing is right to
1x um I think a lot a lot of my
`,
      isFinal: true,
    },
  ],
];

const SpeechRecognition =
  // @ts-ignore
  window.SpeechRecognition || window.webkitSpeechRecognition;

const speechRecognition = new SpeechRecognition();
speechRecognition.lang = "en-US";
speechRecognition.continuous = true;
speechRecognition.interimResults = true;

function useSpeechRecognition(speechRecognition: any, enabled: boolean): any[] {
  // const [transcriptionResults, setTranscriptionResults] = useState(null);
  const [transcriptionResults, setTranscriptionResults] = useState<any>(
    MOCK_TRANSCRIPTION_RESULTS,
  );

  // While transcribing, listen for speech and update the transcription state
  useEffect(() => {
    const handleTranscriptionResult = (event: any) => {
      setTranscriptionResults(event.results);
    };

    const startTranscription = () => {
      setTranscriptionResults(null);
      speechRecognition.addEventListener("result", handleTranscriptionResult);
      speechRecognition.start();
    };

    const stopTranscription = () => {
      if (speechRecognition) {
        speechRecognition.removeEventListener(
          "result",
          handleTranscriptionResult,
        );
        speechRecognition.stop();
      }
    };

    if (enabled) {
      startTranscription();
    } else {
      stopTranscription();
    }

    return () => {
      stopTranscription();
    };
  }, [speechRecognition, enabled]);

  return transcriptionResults;
}

function App() {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  const transcriptionResults = useSpeechRecognition(
    speechRecognition,
    isTranscribing,
  );

  return (
    <div className="flex max-h-screen min-h-screen w-full flex-col items-center bg-background bg-black p-16 pb-0">
      <div className="mb-8 flex w-full grow gap-16 overflow-y-auto">
        <Transcript
          transcriptionResults={transcriptionResults}
          highlights={highlights}
        />
        <ul className="w-1/2 text-gray-400">
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
            const chunks = Array.from(transcriptionResults).map(
              (result) => result[0],
            );
            const transcript = chunks
              .filter((result: any) => result.isFinal)
              .map((result: any) => result.transcript)
              .join("");

            let newHighlight;
            try {
              newHighlight = await highlightLastTalkingPoint(transcript);
            } catch (err) {
              console.error(err);
              return;
            }

            setHighlights((prev) => [...prev, newHighlight]);
          }}
        >
          Snap!
        </Button>
      </div>
    </div>
  );
}

export default App;
