import dedent from "dedent";
import OpenAI from "openai";

import { TalkingPoint } from "./types";

export class AI {
  openai: OpenAI;

  constructor(openAiKey: string) {
    this.openai = new OpenAI({
      apiKey: openAiKey,
      dangerouslyAllowBrowser: true,
    });
  }

  async getLastTalkingPoint(transcript: string): Promise<TalkingPoint> {
    const completion = await this.openai.chat.completions.create({
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

    return this.parseTalkingPoint(completion.choices[0].message.content);
  }

  parseTalkingPoint(json: string | null): TalkingPoint {
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

  async MOCK_getLastTalkingPoint(
    // @ts-expect-error parameter is unused, but want to keep the same call signature
    transcript: string,
  ): Promise<TalkingPoint> {
    // return {
    //   text: dedent`I do
    //     think there is some meaning towards
    //     thinking about highers higher orders of
    //     magnitude towards raising your Ambitions`,
    //   summary: "raise your ambitions",
    // }
    return {
      text: dedent`my message to
        you today is that you are just in time
        and the timing is right to
        1x`,
      summary: "it's time to build!",
    };
  }
}
