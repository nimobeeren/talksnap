import { splitTranscript } from "@/string-utils";
import { Highlight } from "@/types";

export function Transcript({
  transcriptionResults,
  highlights,
}: {
  transcriptionResults: any[] | null;
  highlights: Highlight[];
}) {
  const chunks = Array.from(transcriptionResults || []).map(
    (result) => result[0],
  );
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
