/** Finds the position of a string pattern in a source text.
 *
 * @returns A tuple consisting of the start and end (exclusive) positions.
 */
export function findFuzzySubstringPos(source, pattern) {
  const normalize = (text) => text.toLowerCase();

  // TODO: deal with punctuation differences

  for (let i = source.length; i >= 0; i--) {
    if (normalize(source.slice(i, i + pattern.length)) === normalize(pattern)) {
      return [i, i + pattern.length];
    }
  }

  return null;
}

/** Splits a transcript into a sequence of segments which are a highlight or not. */
export function splitTranscript(transcript, highlights) {
  const segments = [];
  let lastPos = 0;

  for (const highlight of highlights) {
    const pos = findFuzzySubstringPos(transcript, highlight);
    if (pos) {
      if (pos[0] > lastPos) {
        segments.push({
          isHighlight: false,
          value: transcript.slice(lastPos, pos[0]),
        });
      }
      segments.push({
        isHighlight: true,
        value: transcript.slice(pos[0], pos[1]),
      });
      lastPos = pos[1];
    } else {
      console.warn("Highlight not found in transcript:", highlight);
    }
  }

  segments.push({ isHighlight: false, value: transcript.slice(lastPos) });

  return segments;
}
