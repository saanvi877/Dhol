import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Send } from "lucide-react";

interface GameControlsProps {
  onSubmitGuess?: (guess: string) => void;
  timeRemaining?: number;
  totalTime?: number;
  disabled?: boolean;
}

const GameControls = ({
  onSubmitGuess = () => {},
  timeRemaining = 60,
  totalTime = 60,
  disabled = false,
}: GameControlsProps) => {
  const [guess, setGuess] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guess.trim()) {
      onSubmitGuess(guess);
      setGuess("");
    }
  };

  const progress = (timeRemaining / totalTime) * 100;

  return (
    <div className="w-full p-6 bg-card border-2 border-primary/20 rounded-lg shadow-[0_0_15px_rgba(234,179,8,0.2)]">
      <div className="space-y-4">
        {/* Timer Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Time Remaining</span>
            <span>{Math.ceil(timeRemaining)}s</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Guess Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Type your guess here..."
            disabled={disabled}
            className="flex-1"
          />
          <Button type="submit" disabled={disabled || !guess.trim()}>
            <Send className="h-4 w-4 mr-2" />
            Submit
          </Button>
        </form>
      </div>
    </div>
  );
};

export default GameControls;
