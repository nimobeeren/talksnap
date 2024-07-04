import { z } from "zod";

export const TalkingPoint = z.object({
  text: z.string(),
  summary: z.string().transform((val) => {
    val = val.trim();
    return val.charAt(0).toUpperCase() + val.slice(1); // capitalize first letter
  }),
});
export type TalkingPoint = z.infer<typeof TalkingPoint>;

type HighlightSegment = {
  isHighlight: true;
} & TalkingPoint;

type NonHighlightSegment = {
  isHighlight: false;
} & Omit<TalkingPoint, "summary">;

export type TranscriptSegment = HighlightSegment | NonHighlightSegment;
