import React, { createContext, useContext, useEffect, useState } from "react";
import { Room, Player, GameRound, Guess } from "@/types/game";
import {
  startGame,
  startNextRound,
  submitGuess,
  subscribeToRoom,
  subscribeToPlayers,
  subscribeToRound,
  subscribeToGuesses,
} from "@/lib/game";
import { useToast } from "@/components/ui/use-toast";

interface GameContextType {
  currentRoom: Room | null;
  currentPlayer: Player | null;
  players: Player[];
  currentRound: GameRound | null;
  timeRemaining: number;
  showHint1: boolean;
  showHint2: boolean;
  isLoading: boolean;
  startGame: () => Promise<void>;
  submitGuess: (guess: string) => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentRound, setCurrentRound] = useState<GameRound | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [showHint1, setShowHint1] = useState(false);
  const [showHint2, setShowHint2] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Timer logic
  useEffect(() => {
    if (!currentRound || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1;
        if (newTime <= 40) setShowHint1(true);
        if (newTime <= 20) setShowHint2(true);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentRound, timeRemaining]);

  // Round completion logic
  useEffect(() => {
    if (timeRemaining <= 0 && currentRoom?.status === "playing") {
      handleRoundEnd();
    }
  }, [timeRemaining]);

  const handleRoundEnd = async () => {
    if (!currentRoom) return;

    if (currentRoom.current_round >= currentRoom.total_rounds) {
      // Game over
      await startNextRound(currentRoom.id, currentRoom.current_round);
    } else {
      // Start next round
      setTimeRemaining(60);
      setShowHint1(false);
      setShowHint2(false);
      await startNextRound(currentRoom.id, currentRoom.current_round);
    }
  };

  const handleStartGame = async () => {
    if (!currentRoom) return;
    setIsLoading(true);
    try {
      await startGame(currentRoom.id);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start game",
      });
    }
    setIsLoading(false);
  };

  const handleSubmitGuess = async (guess: string) => {
    if (!currentRound || !currentPlayer) return;

    try {
      await submitGuess(currentRound.id, currentPlayer.id, guess);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit guess",
      });
    }
  };

  const value = {
    currentRoom,
    currentPlayer,
    players,
    currentRound,
    timeRemaining,
    showHint1,
    showHint2,
    isLoading,
    startGame: handleStartGame,
    submitGuess: handleSubmitGuess,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
