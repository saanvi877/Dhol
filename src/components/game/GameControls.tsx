import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Send } from "lucide-react";

interface GameControlsProps {
  onSubmitGuess?: (guess: string, timeRemaining: number) => void;
  onTimeUp?: () => void;
  timeRemaining?: number;
  totalTime?: number;
  disabled?: boolean;
  hasGuessedCorrectly?: boolean;
}

const GameControls = ({
  onSubmitGuess = () => {},
  onTimeUp = () => {},
  timeRemaining = 60,
  totalTime = 60,
  disabled = false,
  hasGuessedCorrectly = false,
}: GameControlsProps) => {
  const [guess, setGuess] = React.useState("");
  const [remainingTime, setRemainingTime] = React.useState(timeRemaining);

  // Reset timer when timeRemaining changes
  React.useEffect(() => {
    setRemainingTime(timeRemaining);
  }, [timeRemaining]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guess.trim()) {
      onSubmitGuess(guess.trim(), remainingTime);
      setGuess("");
    }
  };

  React.useEffect(() => {
    if (disabled) return;

    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [disabled, onTimeUp]);

  const progress = (remainingTime / totalTime) * 100;

  return (
    <div className="w-full p-6 bg-card border-2 border-primary/20 rounded-lg shadow-[0_0_15px_rgba(234,179,8,0.2)]">
      <div className="space-y-4">
        {/* Timer Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Time Remaining</span>
            <span>{Math.ceil(remainingTime)}s</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Guess Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder={hasGuessedCorrectly ? "Waiting for other players..." : "Type your guess here..."}
            disabled={disabled || hasGuessedCorrectly}
            className="flex-1"
          />
          <Button type="submit" disabled={disabled || hasGuessedCorrectly || !guess.trim()}>
            <Send className="h-4 w-4 mr-2" />
            Submit
          </Button>
        </form>
      </div>
    </div>
  );
};

export default GameControls;
