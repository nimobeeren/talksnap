import { splitTranscript } from "@/string-utils";
import { TalkingPoint } from "@/types";

import { cn } from "@/lib/utils";

export function Transcript({
  transcriptionResults,
  highlights,
  className,
}: {
  transcriptionResults: any[] | null;
  highlights: TalkingPoint[];
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
        return (
          <span
            key={index}
            className={
              segment.isHighlight
                ? "text-red-700 underline underline-offset-1"
                : undefined
            }
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
