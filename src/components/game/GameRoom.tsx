import React from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Users, Play, Loader2, Share2, Copy, Settings, Clock } from "lucide-react";
import DefinitionDisplay from "./DefinitionDisplay";
import GameControls from "./GameControls";
import Scoreboard from "./Scoreboard";
import RoundResults from "./RoundResults";
import { toast } from "../ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { submitGuess, endRound, subscribeToRound, subscribeToGuesses } from "../../lib/game";
import { supabase } from "../../lib/supabase";

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
  roomCode?: string;
  isHost?: boolean;
  gameSettings?: {
    roundTime: number;
    totalRounds: number;
  };
  onUpdateSettings?: (settings: { roundTime: number; totalRounds: number }) => void;
  currentRoundId?: string;
  currentPlayer?: { id: string };
  currentRoom?: { id: string };
  onTimeUp?: () => void;
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
  roomCode = "",
  isHost = false,
  gameSettings = { roundTime: 60, totalRounds: 5 },
  onUpdateSettings = () => {},
  currentRoundId,
  currentPlayer,
  currentRoom,
  onTimeUp,
}: GameRoomProps) => {
  const [showSettings, setShowSettings] = React.useState(false);
  const [settings, setSettings] = React.useState(gameSettings);
  const [currentWord, setCurrentWord] = React.useState("");
  const [roundGuesses, setRoundGuesses] = React.useState<Array<{
    playerName: string;
    guess: string;
    isCorrect: boolean;
    points: number;
    guessTime: number;
  }>>([]);
  const [currentRoundInfo, setCurrentRoundInfo] = React.useState<GameRound | null>(null);
  const [hasGuessedCorrectly, setHasGuessedCorrectly] = React.useState(false);
  const [correctGuessers, setCorrectGuessers] = React.useState<string[]>([]);
  const [currentTimeRemaining, setCurrentTimeRemaining] = React.useState(gameSettings.roundTime);

  React.useEffect(() => {
    console.log("Host status:", { isHost });
  }, [isHost]);

  const handleCopyRoomCode = async () => {
    await navigator.clipboard.writeText(roomCode);
    toast({
      description: "Room code copied to clipboard!",
    });
  };

  const handleSaveSettings = () => {
    onUpdateSettings(settings);
    setShowSettings(false);
  };

  // Reset states when round changes
  React.useEffect(() => {
    setHasGuessedCorrectly(false);
    setCorrectGuessers([]);
  }, [currentRoundId]);

  // Reset timer when round changes
  React.useEffect(() => {
    if (currentRoundId) {
      setCurrentTimeRemaining(gameSettings.roundTime);
    }
  }, [currentRoundId, gameSettings.roundTime]);

  // Subscribe to guesses
  React.useEffect(() => {
    if (!currentRoundId) return;

    const guessSubscription = subscribeToGuesses(currentRoundId, (guess) => {
      const player = players.find(p => p.id === guess.player_id);
      if (player) {
        // Only update guesses for this player if they made the guess
        if (player.id === currentPlayer?.id) {
          setHasGuessedCorrectly(guess.is_correct);
        }

        setRoundGuesses(prev => [...prev, {
          playerName: player.name,
          guess: guess.guess,
          isCorrect: guess.is_correct,
          points: guess.points,
          guessTime: gameSettings.roundTime - currentTimeRemaining
        }]);

        // If guess is correct, update correctGuessers
        if (guess.is_correct) {
          setCorrectGuessers(prev => {
            if (prev.includes(player.name)) return prev;
            return [...prev, player.name];
          });

          toast({
            title: `${player.name} guessed correctly!`,
            description: "Waiting for other players...",
          });
        }
      }
    });

    return () => {
      guessSubscription.unsubscribe();
    };
  }, [currentRoundId, players, currentPlayer?.id, currentTimeRemaining, gameSettings.roundTime]);

  const handleGuess = async (guess: string, timeRemaining: number) => {
    if (!currentPlayer?.id || !currentRoundId || hasGuessedCorrectly) return;
    
    const success = await submitGuess(
      currentRoundId,
      currentPlayer.id,
      guess,
      timeRemaining
    );

    if (!success) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit guess. Please try again.",
      });
    }
  };

  const handleTimeUp = async () => {
    if (!currentRoom?.id || !currentRoundId) return;
    const success = await endRound(currentRoom.id, currentRoundId);
    if (!success) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to end round. Please try again.",
      });
    }
  };

  React.useEffect(() => {
    if (!currentRoundId) return;

    // First fetch the current round
    const fetchCurrentRound = async () => {
      const { data: round } = await supabase
        .from("game_rounds")
        .select("*")
        .eq("id", currentRoundId)
        .single();

      if (round) {
        console.log("Current round info:", round);
        setCurrentRoundInfo(round);
      }
    };

    fetchCurrentRound();

    // Subscribe to round updates
    const roundSubscription = subscribeToRound(currentRoundId, (round) => {
      console.log("Round update received:", round);
      setCurrentRoundInfo(round);
    });

    return () => {
      roundSubscription.unsubscribe();
    };
  }, [currentRoundId]);

  return (
    <div className="min-h-screen w-full bg-background p-6">
      <div className="max-w-7xl mx-auto flex gap-6">
        {/* Main Game Area */}
        <div className="flex-1 space-y-6">
          {gameState === "waiting" ? (
            <Card className="p-8 flex flex-col items-center justify-center min-h-[400px] bg-card border-4 border-primary/20 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
              <Users className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">Waiting for Players</h2>
              
              <div className="flex items-center gap-2 mb-4 p-3 bg-muted rounded-lg">
                <p className="text-lg font-mono">Room Code: {roomCode}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyRoomCode}
                  className="hover:bg-muted-foreground/10"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="w-full max-w-sm mb-6">
                <div className="space-y-2">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center gap-3 p-2 rounded-lg bg-muted"
                    >
                      <img
                        src={player.avatar}
                        alt={`${player.name}'s avatar`}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="flex-1">{player.name}</span>
                      {player.isCurrentPlayer && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-muted-foreground mb-6">
                {players.length} player{players.length !== 1 ? "s" : ""} in room
              </p>

              {/* Add Settings Button for Host */}
              {isHost && (
                <div className="flex gap-4 mb-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowSettings(true)}
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Game Settings
                  </Button>
                </div>
              )}

              {/* Start Game Button (only for host) */}
              {isHost && (
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
              )}
            </Card>
          ) : (
            <>
              {gameState === "playing" && currentRoundInfo && (
                <>
                  <DefinitionDisplay
                    definition={currentRoundInfo.definition}
                    hint1={currentRoundInfo.hint1}
                    hint2={currentRoundInfo.hint2}
                    showHint1={showHint1}
                    showHint2={showHint2}
                  />
                  {correctGuessers.length > 0 && (
                    <div className="mb-4 p-4 bg-green-500/10 rounded-lg">
                      <p className="text-green-500">
                        Correct guesses: {correctGuessers.join(", ")}
                      </p>
                    </div>
                  )}
                  <GameControls
                    timeRemaining={currentTimeRemaining}
                    totalTime={gameSettings.roundTime}
                    onSubmitGuess={handleGuess}
                    onTimeUp={handleTimeUp}
                    disabled={gameState !== "playing"}
                    hasGuessedCorrectly={hasGuessedCorrectly}
                  />
                </>
              )}
            </>
          )}
        </div>

        {/* Scoreboard */}
        <Scoreboard
          players={players}
          title={gameState === "waiting" ? "Players" : "Leaderboard"}
        />

        {/* Settings Dialog */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Game Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="roundTime">Round Time (seconds)</Label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="roundTime"
                    type="number"
                    value={settings.roundTime}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        roundTime: parseInt(e.target.value) || 60,
                      })
                    }
                    min={30}
                    max={180}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalRounds">Number of Rounds</Label>
                <Input
                  id="totalRounds"
                  type="number"
                  value={settings.totalRounds}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      totalRounds: parseInt(e.target.value) || 5,
                    })
                  }
                  min={1}
                  max={10}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveSettings}>Save Settings</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Round Results Dialog */}
      {gameState === "round_end" && (
        <RoundResults
          isOpen={true}
          correctWord={currentWord}
          definition={definition}
          roundNumber={currentRound}
          totalRounds={totalRounds}
          playerScores={roundGuesses.map(guess => ({
            name: guess.playerName,
            score: guess.points,
            wasCorrect: guess.isCorrect,
            guessTime: guess.guessTime,
          }))}
        />
      )}
    </div>
  );
};

export default GameRoom;
