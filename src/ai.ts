import { TalkingPoint } from "./types";

import dedent from "dedent";
import OpenAI from "openai";

const openai = new OpenAI({
  // @ts-expect-error property `env` does not exist for some reason
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function getLastTalkingPoint(
  transcript: string,
): Promise<TalkingPoint> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",

        content: dedent`You are an AI whose purpose is to capture highlights from conference talks. Given a live transcript of the talk, your purpose is to identify only the last point made by the speaker, output the relevant text of the transcript VERBATIM, then summarize the point in a single concise statement from the perspective of the speaker (e.g. "you need to look at your data", "when condition X, system Y is better than system Z"). It's okay to use context from other parts of the transcript.
        
        Your answer must be in the following JSON format:
        {"text": <TEXT>, "summary": <SUMMARY>}`,
      },
      {
        role: "user",
        content: `Transcript: ${transcript.slice(transcript.length - 2000)}`,
      },
    ],
  });

  return parseTalkingPoint(completion.choices[0].message.content);
}

export function parseTalkingPoint(json: string | null): TalkingPoint {
  if (json === null) {
    throw new Error("Talking point is null");
  }

  let parsedJson = null;
  try {
    parsedJson = JSON.parse(json);
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error(
        `Talking point is not valid JSON: '${json}'`,
        // @ts-expect-error type libs don't yet include `cause`
        { cause: err },
      );
    }
    throw err;
  }

  return TalkingPoint.parse(parsedJson);
}

export async function MOCK_getLastTalkingPoint(
  // @ts-expect-error parameter is unused, but want to keep the same call signature
  transcript: string,
): Promise<TalkingPoint> {
  return {
    text: `my message to
you today is that you are just in time
and the timing is right to
1x`,
    summary: "it's time to build!",
  };
}
