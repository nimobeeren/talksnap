import type { TalkingPoint, TranscriptSegment } from "./types";

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
  const normalize = (text: string) => {
    text = text.toLowerCase();
    // Replace all whitespace characters (including newlines) with spaces.
    // This is necessary because LLMs often replace newlines with spaces when instructed to repeat
    // input verbatim.
    // NOTE: this shouldn't change the total number of characters, because then the start/end
    // positions will be misaligned.
    text = text.replaceAll(/\s/g, " ");
    return text;
  };

  // TODO: deal with subtle differences such as differening punctuation, number of whitespace
  // characters or spelling. For example, GPT-4o likes to add a period to the end of the output.

  // Find the last occurrence of the substring by traversing backwards
  for (let i = source.length; i >= 0; i--) {
    const sourceSubstring = source.slice(i, i + pattern.length);
    if (normalize(sourceSubstring) === normalize(pattern)) {
      return {
        text: sourceSubstring, // return the original substring, not the normalized one
        start: i,
        end: i + sourceSubstring.length,
      };
    }
  }

  return null;
}

/**
 * Splits a transcript into a sequence of segments which are a snap or not.
 */
export function splitTranscript(
  transcript: string,
  snaps: TalkingPoint[],
): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];
  let lastPos = 0;

  for (const snap of snaps) {
    const match = findBestSubstringMatch(transcript, snap.text);
    if (match) {
      if (match.start > lastPos) {
        segments.push({
          isSnap: false,
          text: transcript.slice(lastPos, match.start),
        });
      }
      segments.push({
        isSnap: true,
        text: match.text,
        summary: snap.summary,
      });
      lastPos = match.end;
    } else {
      console.warn("Snap text not found in transcript:", snap.text);
      // TODO: fall back to some part of the transcript which could reasonably contain the last
      // talking point and summarize that
    }
  }

  if (lastPos < transcript.length) {
    segments.push({ isSnap: false, text: transcript.slice(lastPos) });
  }

  return segments;
}
