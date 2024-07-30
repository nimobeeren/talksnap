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
        <Button className="fixed left-4 top-4 h-8 w-8" variant="outline" aria-label="Devtools">
          🔧
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
          <label>
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => {
                setEnabled(e.target.checked);
              }}
            />
            Enabled
          </label>
          <label>
            Speed:
            <input
              type="range"
              min="1"
              max="10"
              value={speed}
              onChange={(e) => {
                const newSpeed = Number(e.target.value);
                setSpeed(newSpeed);
              }}
            />
          </label>
        </div>
      </DialogContent>
    </Dialog>
  );
}
