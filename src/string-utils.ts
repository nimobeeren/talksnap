import type { Highlight, Segment } from "./types";

interface Match {
  text: string;
  start: number;
  end: number;
}

/**
 * Finds the substring which best matches a pattern in a source string.
 * @returns the substring taken from the source and its start (inclusive) and end (exclusive) indices.
 */
export function findBestSubstringMatch(
  source: string,
  pattern: string,
): Match | null {
  const normalize = (text: string) => text.toLowerCase();

  // TODO: deal with punctuation differences

  for (let i = source.length; i >= 0; i--) {
    const sourceSubstring = source.slice(i, i + pattern.length);
    if (normalize(sourceSubstring) === normalize(pattern)) {
      return {
        text: sourceSubstring,
        start: i,
        end: i + pattern.length,
      };
    }
  }

  return null;
}

/**
 * Splits a transcript into a sequence of segments which are a highlight or not.
 */
export function splitTranscript(
  transcript: string,
  highlights: Array<Highlight>,
): Segment[] {
  const segments: Segment[] = [];
  let lastPos = 0;

  for (const highlight of highlights) {
    const match = findBestSubstringMatch(transcript, highlight.text);
    if (match) {
      if (match.start > lastPos) {
        segments.push({
          isHighlight: false,
          text: transcript.slice(lastPos, match.start),
        });
      }
      segments.push({
        isHighlight: true,
        text: match.text,
        summary: highlight.summary,
      });
      lastPos = match.end;
    } else {
      console.warn("Highlight not found in transcript:", highlight.text);
    }
  }

  if (lastPos < transcript.length) {
    segments.push({ isHighlight: false, text: transcript.slice(lastPos) });
  }

  return segments;
}
