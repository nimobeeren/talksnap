import { cn } from "@/lib/utils";
import { splitTranscript } from "@/string-utils";
import { TalkingPoint } from "@/types";
import { useEffect, useRef } from "react";

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

  // Autoscrolling
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) {
      return;
    }

    // If the container is scrolled to within this distance of the bottom, autoscroll to the bottom
    // NOTE: this must be at least the height of one line, so that when the transcript wraps to
    // the next line, it still scrolls down
    // FIXME: this does mean that if the transcription results change while you're halfway
    // through scrolling up from the first line from the bottom, you get pulled down again which
    // feels janky
    const autoScrollThreshold = 25; // px

    const distanceFromBottom =
      ref.current.clientHeight +
      ref.current.scrollHeight -
      ref.current.scrollTop;

    if (distanceFromBottom >= autoScrollThreshold) {
      ref.current.scrollTo({
        top: ref.current.scrollHeight,
      });
    }
  }, [transcriptionResults]);

  return (
    <div
      ref={ref}
      className={cn("overflow-y-auto whitespace-pre-wrap", className)}
    >
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
