import { create } from "zustand";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";

interface DevtoolsState {
  isEnabled: boolean;
  speed: number;
  prompt: string;
  setEnabled: (enabled: boolean) => void;
  setSpeed: (speed: number) => void;
  setPrompt: (prompt: string) => void;
}

export const useDevtoolsStore = create<DevtoolsState>((set) => ({
  isEnabled: localStorage.getItem("fakeTranscriptionEnabled") === "true",
  speed: Number(localStorage.getItem("fakeTranscriptionSpeed")) ?? 3,
  prompt:
    localStorage.getItem("fakeTranscriptionPrompt") ??
    "You are a conference speaker. Give a talk on software testing.",
  setEnabled: (enabled) => {
    localStorage.setItem("fakeTranscriptionEnabled", String(enabled));
    set({ isEnabled: enabled });
  },
  setSpeed: (speed) => {
    localStorage.setItem("fakeTranscriptionSpeed", String(speed));
    set({ speed });
  },
  setPrompt: (prompt) => {
    localStorage.setItem("fakeTranscriptionPrompt", prompt);
    set({ prompt });
  },
}));

export function TranscriptionDevtools() {
  const { isEnabled, speed, prompt, setEnabled, setSpeed, setPrompt } =
    useDevtoolsStore();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-4 left-4 h-8 w-8"
          variant="outline"
          aria-label="Devtools"
        >
          🧑🏼‍💻
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Fake Transcription</DialogTitle>
          <DialogDescription>
            Generate fake transcription results for easier testing
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4">
          <label className="flex items-center space-x-2">
            <Switch
              checked={isEnabled}
              onCheckedChange={(checked) => {
                setEnabled(checked);
              }}
            />
            <span>Enabled</span>
          </label>
          <label className="flex items-center space-x-2">
            <span className="shrink-0 tabular-nums">Speed ({speed})</span>
            <Slider
              min={1}
              max={50}
              value={[speed]}
              onValueChange={(value) => setSpeed(value[0])}
            />
          </label>
          <label className="space-y-2">
            <span className="shrink-0 tabular-nums">Prompt</span>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full rounded-md border p-2"
            />
          </label>
        </div>
      </DialogContent>
    </Dialog>
  );
}
