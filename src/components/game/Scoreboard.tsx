import React from "react";
import { Card } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Trophy } from "lucide-react";

interface Player {
  id: string;
  name: string;
  score: number;
  avatar?: string;
  isCurrentPlayer?: boolean;
}

interface ScoreboardProps {
  players?: Player[];
  title?: string;
}

const defaultPlayers: Player[] = [
  {
    id: "1",
    name: "Player 1",
    score: 1200,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=player1",
    isCurrentPlayer: true,
  },
  {
    id: "2",
    name: "Player 2",
    score: 900,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=player2",
  },
  {
    id: "3",
    name: "Player 3",
    score: 750,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=player3",
  },
];

const Scoreboard = ({
  players = defaultPlayers,
  title = "Leaderboard",
}: ScoreboardProps) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <Card className="w-[300px] h-[600px] bg-white p-4 border-4 border-primary/20 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
      <h2 className="text-2xl font-bold text-center mb-4">{title}</h2>

      <ScrollArea className="h-[520px] w-full rounded-md">
        <div className="space-y-4">
          {sortedPlayers.map((player, index) => (
            <div
              key={player.id}
              className={`flex items-center p-3 rounded-lg ${player.isCurrentPlayer ? "bg-blue-50" : "bg-gray-50"}`}
            >
              <div className="flex items-center justify-center w-8 h-8 mr-3">
                {index === 0 && <Trophy className="w-6 h-6 text-yellow-400" />}
                {index === 1 && <Trophy className="w-6 h-6 text-gray-400" />}
                {index === 2 && <Trophy className="w-6 h-6 text-amber-700" />}
                {index > 2 && (
                  <span className="text-gray-500 font-medium">{index + 1}</span>
                )}
              </div>

              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={player.avatar} alt={player.name} />
                <AvatarFallback>
                  {player.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <p
                  className={`font-medium ${player.isCurrentPlayer ? "text-blue-600" : "text-gray-900"}`}
                >
                  {player.name}
                </p>
              </div>

              <div className="text-right">
                <p className="font-bold text-gray-900">{player.score}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default Scoreboard;
