import { splitTranscript } from "@/string-utils";
import { Highlight } from "@/types";

// export function mergeSegments(segments) {
//   let i = 0;
//   while (i < segments.length - 1) {
//     const currentSegment = segments[i];
//     const nextSegment = segments[i + 1];
//     if (currentSegment.isFinal === nextSegment.isFinal) {
//       // Merge the two segments
//       segments.splice(i, 2, {
//         transcript: currentSegment.transcript + nextSegment.transcript,
//         isFinal: currentSegment.isFinal,
//       });
//     } else {
//       i++;
//     }
//   }
// }

export function Transcript({
  transcriptionResults,
  highlights,
}: {
  transcriptionResults: any[];
  highlights: Highlight[];
}) {
  const chunks = Array.from(transcriptionResults).map((result) => result[0]);
  const finalTranscript = chunks
    .filter((chunk) => chunk.isFinal)
    .map((chunk) => chunk.transcript)
    .join("");
  const nonFinalTranscript = chunks
    .filter((chunk) => !chunk.isFinal)
    .map((chunk) => chunk.transcript)
    .join("");

  const finalSegments = splitTranscript(finalTranscript, highlights);

  return (
    <div className="w-1/2 whitespace-pre-wrap">
      {finalSegments.map((segment, index) => {
        return (
          <span
            key={index}
            className={segment.isHighlight ? "text-red-300" : "text-gray-300"}
          >
            {segment.text}
          </span>
        );
      })}
      <span className="text-gray-500">{nonFinalTranscript}</span>
    </div>
  );
}
