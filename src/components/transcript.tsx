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
  const transcript = Array.from(transcriptionResults || [])
    .map((result) => result[0].transcript)
    .join("");

  const segments = splitTranscript(transcript, snaps);

  return (
    <div className={cn("whitespace-pre-wrap", className)}>
      {segments.map((segment, index) => {
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
    </div>
  );
}
