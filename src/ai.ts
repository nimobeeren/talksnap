import OpenAI from "openai";

const openai = new OpenAI({
  // @ts-ignore
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function highlightLastTalkingPoint(transcript: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",

        content: `You are an AI whose purpose is to capture highlights from conference talks. Given a live transcript of the talk, your purpose is to identify only the last point made by the speaker, output the relevant text of the transcript VERBATIM, then summarize the point in a single short sentence. It's okay to use more context than what's included in the verbatim text.
        
        Your answer must be in the following JSON format:
        {"text": <TEXT>, "summary": <SUMMARY>}
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
    // @ts-ignore
    parsedResult = JSON.parse(completion.choices[0].message.content);
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error(
        `Invalid response format. Expected JSON object but got: '${completion.choices[0].message.content}'`,
        // @ts-ignore
        { cause: err },
      );
    }
    throw err;
  }

  return parsedResult;
}

export async function MOCK_highlightLastTalkingPoint(transcript: string) {
  return {
    text: `my message to
you today is that you are just in time
and the timing is right to
1x`,
    summary: "it's time to build!"
  }
}
