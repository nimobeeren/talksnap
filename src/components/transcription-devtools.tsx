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

interface DevtoolsState {
  isEnabled: boolean;
  speed: number;
  setEnabled: (enabled: boolean) => void;
  setSpeed: (speed: number) => void;
}

export const useDevtoolsStore = create<DevtoolsState>((set) => ({
  isEnabled: false,
  speed: 1,
  setEnabled: (enabled) => set({ isEnabled: enabled }),
  setSpeed: (speed) => set({ speed }),
}));

export function TranscriptionDevtools() {
  const { isEnabled, speed, setEnabled, setSpeed } = useDevtoolsStore();

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
              max={9}
              value={[speed]}
              onValueChange={(value) => {
                const newSpeed = value[0];
                setSpeed(newSpeed);
              }}
            />
          </label>
        </div>
      </DialogContent>
    </Dialog>
  );
}
