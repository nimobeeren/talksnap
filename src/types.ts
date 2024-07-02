export interface Highlight {
  text: string;
  summary?: string;
}

export interface Segment extends Highlight {
  isHighlight: boolean;
}
