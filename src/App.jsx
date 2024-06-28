import OpenAI from "openai";
import { useEffect, useState } from "react";
import { Button } from "./components/ui/button";

const EXAMPLE_TRANSCRIPT = `a few logistical things one I'm I'm
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
`;

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

async function getLastTalkingPoint(transcript) {
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are an AI whose purpose is to capture highlights from conference talks. Given a live transcript of the talk, your purpose is to identify only the last point made by the speaker, output the relevant segment of the transcript VERBATIM, then summarize that segment in a single short sentence.
      
        Your answer must be in the following JSON format:
        {"segment": <SEGMENT>, "summary": <SUMMARY>}
        `,
      },
      {
        role: "user",
        content: `Transcript: ${transcript}`,
      },
    ],
  });

  let parsedResult = null;
  try {
    parsedResult = JSON.parse(completion.choices[0].message.content);
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error(
        `Invalid response format. Expected JSON object but got: '${completion.choices[0].message.content}'`,
        { cause: err },
      );
    }
    throw err;
  }

  return parsedResult;
}

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
