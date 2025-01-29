import React from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Users, Play, Loader2 } from "lucide-react";
import DefinitionDisplay from "./DefinitionDisplay";
import GameControls from "./GameControls";
import Scoreboard from "./Scoreboard";
import RoundResults from "./RoundResults";

interface GameRoomProps {
  isLoading?: boolean;
  gameState?: "waiting" | "playing" | "round_end";
  players?: Array<{
    id: string;
    name: string;
    score: number;
    avatar?: string;
    isCurrentPlayer?: boolean;
  }>;
  currentRound?: number;
  totalRounds?: number;
  definition?: string;
  hint1?: string;
  hint2?: string;
  showHint1?: boolean;
  showHint2?: boolean;
  timeRemaining?: number;
  onStartGame?: () => void;
  onSubmitGuess?: (guess: string) => void;
}

const GameRoom = ({
  isLoading = false,
  gameState = "waiting",
  players = [
    {
      id: "1",
      name: "Player 1",
      score: 0,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=player1",
      isCurrentPlayer: true,
    },
    {
      id: "2",
      name: "Player 2",
      score: 0,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=player2",
    },
  ],
  currentRound = 1,
  totalRounds = 5,
  definition = "A localized zone of low-pressure tactile compliance, engineered for cranial repose during periods of horizontal dormancy",
  hint1 = "Soft and squishy",
  hint2 = "Found on beds",
  showHint1 = false,
  showHint2 = false,
  timeRemaining = 60,
  onStartGame = async () => {},
  onSubmitGuess = async (guess: string) => {},
  currentRound = 1,
  totalRounds = 5,
  definition = "A celestial cushion of divine comfort, blessed by the gods for mortal repose",
  hint1 = "Soft as a cloud",
  hint2 = "Found where mortals rest",
  showHint1 = false,
  showHint2 = false,
  timeRemaining = 60,
  onSubmitGuess = () => {},
}: GameRoomProps) => {
  return (
    <div className="min-h-screen w-full bg-background p-6">
      <div className="max-w-7xl mx-auto flex gap-6">
        {/* Main Game Area */}
        <div className="flex-1 space-y-6">
          {gameState === "waiting" ? (
            <Card className="p-8 flex flex-col items-center justify-center min-h-[400px] bg-card border-4 border-primary/20 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
              <Users className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">Waiting for Players</h2>
              <p className="text-muted-foreground mb-6">
                {players.length} player{players.length !== 1 ? "s" : ""} in room
              </p>
              <Button
                size="lg"
                onClick={onStartGame}
                disabled={isLoading || players.length < 2}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start Game
                  </>
                )}
              </Button>
            </Card>
          ) : (
            <>
              <DefinitionDisplay
                definition={definition}
                hint1={hint1}
                hint2={hint2}
                showHint1={showHint1}
                showHint2={showHint2}
                roundNumber={currentRound}
                totalRounds={totalRounds}
              />
              <GameControls
                onSubmitGuess={onSubmitGuess}
                timeRemaining={timeRemaining}
                totalTime={60}
                disabled={gameState === "round_end"}
              />
            </>
          )}
        </div>

        {/* Scoreboard */}
        <Scoreboard
          players={players}
          title={gameState === "waiting" ? "Players" : "Leaderboard"}
        />
      </div>

      {/* Round Results Dialog */}
      {gameState === "round_end" && (
        <RoundResults
          isOpen={true}
          correctWord="PILLOW"
          definition={definition}
          roundNumber={currentRound}
          totalRounds={totalRounds}
          playerScores={players.map((player) => ({
            name: player.name,
            score: player.score,
            wasCorrect: Math.random() > 0.5,
            guessTime: Math.floor(Math.random() * 60),
          }))}
        />
      )}
    </div>
  );
};

export default GameRoom;
