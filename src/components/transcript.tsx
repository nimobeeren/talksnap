import { splitTranscript } from "@/string-utils";
import { TalkingPoint } from "@/types";

import { cn } from "@/lib/utils";

export function Transcript({
  transcriptionResults,
  highlights,
  highlightedHighlights,
  className,
}: {
  transcriptionResults: any[] | null;
  highlights: TalkingPoint[];
  highlightedHighlights: TalkingPoint[];
  className?: string;
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
    <div className={cn("whitespace-pre-wrap", className)}>
      {finalSegments.map((segment, index) => {
        const isHightlighted =
          segment.isHighlight &&
          highlightedHighlights.some((highlight) => highlight.text === segment.text);
        return (
          <span
            key={index}
            className={cn(
              segment.isHighlight && "bg-blue-200",
              isHightlighted && "underline",
            )}
          >
            {segment.text}
          </span>
        );
      })}
      {nonFinalTranscript && (
        <span className="opacity-80">{nonFinalTranscript}</span>
      )}
    </div>
  );
}
