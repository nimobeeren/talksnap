import { useState } from "react";
import { create } from "zustand";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";

interface DevtoolsState {
  isEnabled: boolean;
  speed: number;
  setEnabled: (enabled: boolean) => void;
  setSpeed: (speed: number) => void;
}

const useDevtoolsStore = create<DevtoolsState>((set) => ({
  isEnabled: false,
  speed: 1,
  setEnabled: (enabled) => set({ isEnabled: enabled }),
  setSpeed: (speed) => set({ speed }),
}));

export function TranscriptionDevtools() {
  const [isOpen, setIsOpen] = useState(false);
  const { isEnabled, speed, setEnabled, setSpeed } = useDevtoolsStore();

  return (
    <div>
      <Button
        className="fixed bottom-4 left-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        Devtools
      </Button>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>Open Devtools</Button>
          </DialogTrigger>
          <DialogContent>
            <div className="flex flex-col space-y-4">
              <label>
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => {
                    setEnabled(e.target.checked);
                  }}
                />
                Enable Fake Transcription
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
      )}
    </div>
  );
}

export { useDevtoolsStore };
