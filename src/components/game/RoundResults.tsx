import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Card, CardContent } from "../ui/card";
import { Progress } from "../ui/progress";
import { Trophy, ThumbsUp, Star } from "lucide-react";

interface PlayerScore {
  name: string;
  score: number;
  wasCorrect: boolean;
  guessTime?: number;
}

interface RoundResultsProps {
  isOpen?: boolean;
  onClose?: () => void;
  correctWord?: string;
  definition?: string;
  playerScores?: PlayerScore[];
  roundNumber?: number;
  totalRounds?: number;
}

const RoundResults = ({
  isOpen = true,
  onClose = () => {},
  correctWord = "PILLOW",
  definition = "A localized zone of low-pressure tactile compliance, engineered for cranial repose during periods of horizontal dormancy",
  playerScores = [
    { name: "Player 1", score: 100, wasCorrect: true, guessTime: 15 },
    { name: "Player 2", score: 50, wasCorrect: true, guessTime: 35 },
    { name: "Player 3", score: 0, wasCorrect: false },
  ],
  roundNumber = 1,
  totalRounds = 5,
}: RoundResultsProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Round {roundNumber} Results
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-4">
          {/* Round Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Round Progress</span>
              <span>
                {roundNumber}/{totalRounds}
              </span>
            </div>
            <Progress value={(roundNumber / totalRounds) * 100} />
          </div>

          {/* Word and Definition */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <h3 className="text-xl font-bold text-center text-green-600">
                {correctWord}
              </h3>
              <p className="text-gray-600 text-sm italic text-center">
                {definition}
              </p>
            </CardContent>
          </Card>

          {/* Player Scores */}
          <div className="space-y-3">
            {playerScores.map((player, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${index === 0 ? "bg-yellow-50" : "bg-gray-50"}`}
              >
                <div className="flex items-center gap-3">
                  {index === 0 && (
                    <Trophy className="h-5 w-5 text-yellow-500" />
                  )}
                  <span className="font-medium">{player.name}</span>
                  {player.wasCorrect && (
                    <ThumbsUp className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {player.guessTime && (
                    <span className="text-sm text-gray-500">
                      {player.guessTime}s
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-blue-500" />
                    <span className="font-bold">{player.score}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoundResults;
