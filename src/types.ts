export interface TalkingPoint {
  text: string;
  summary?: string;
}

export interface TranscriptSegment extends TalkingPoint {
  isHighlight: boolean;
}
