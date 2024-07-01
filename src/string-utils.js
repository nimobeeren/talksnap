/**
 * Finds the best matching position of a string pattern in a source text.
 * @returns A tuple consisting of the start and end (exclusive) positions.
 */
export function findBestSubstringMatch(source, pattern) {
  const normalize = (text) => text.toLowerCase();

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
export function splitTranscript(transcript, highlights) {
  const segments = [];
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

  // FIXME
  segments.push({ isHighlight: false, text: transcript.slice(lastPos) });

  return segments;
}
