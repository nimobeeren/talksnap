import { splitTranscript } from "@/string-utils";
import { TalkingPoint } from "@/types";

import { cn } from "@/lib/utils";

export function Transcript({
  transcriptionResults,
  snaps,
  highlightedSnaps,
  className,
}: {
  transcriptionResults: SpeechRecognitionResultList | null;
  snaps: TalkingPoint[];
  highlightedSnaps: TalkingPoint[];
  className?: string;
}) {
  const finalTranscript = Array.from(transcriptionResults || [])
    .filter((result) => result.isFinal)
    .map((result) => result[0].transcript)
    .join("");

  const nonFinalTranscript = Array.from(transcriptionResults || [])
    .filter((result) => !result.isFinal)
    .map((result) => result[0].transcript)
    .join("");

  const finalSegments = splitTranscript(finalTranscript, snaps);

  return (
    <div className={cn("whitespace-pre-wrap", className)}>
      {finalSegments.map((segment, index) => {
        const isHightlighted =
          segment.isSnap &&
          highlightedSnaps.some((snap) => snap.text === segment.text);
        return (
          <span
            key={index}
            className={cn(
              segment.isSnap && "bg-blue-200",
              isHightlighted && "underline",
            )}
          >
            {segment.text}
          </span>
        );
      })}
      {nonFinalTranscript && (
        <span className="opacity-60">{nonFinalTranscript}</span>
      )}
    </div>
  );
}
