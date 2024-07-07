import { z } from "zod";

export const TalkingPoint = z.object({
  text: z.string(),
  summary: z.string().transform((val) => {
    val = val.trim();
    return val.charAt(0).toUpperCase() + val.slice(1); // capitalize first letter
  }),
});
export type TalkingPoint = z.infer<typeof TalkingPoint>;

type SnapSegment = {
  isSnap: true;
} & TalkingPoint;

type NonSnapSegment = {
  isSnap: false;
} & Omit<TalkingPoint, "summary">;

export type TranscriptSegment = SnapSegment | NonSnapSegment;
