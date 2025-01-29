import React from "react";
import { motion } from "framer-motion";
import GameRoom from "./game/GameRoom";
import RoomJoin from "./game/RoomJoin";
import { PlayerNameInput } from "./game/PlayerNameInput";
import {
  createRoom,
  joinRoom,
  subscribeToRoom,
  subscribeToPlayers,
} from "@/lib/game";
import type { Room, Player } from "@/types/game";
import { useToast } from "@/components/ui/use-toast";

interface HomeProps {
  initialGameState?: "join" | "room";
}

const Home = ({ initialGameState = "join" }: HomeProps) => {
  const { toast } = useToast();
  const [gameState, setGameState] = React.useState(initialGameState);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showNameInput, setShowNameInput] = React.useState(false);
  const [pendingAction, setPendingAction] = React.useState<{
    type: "create" | "join";
    roomCode?: string;
  } | null>(null);
  const [currentRoom, setCurrentRoom] = React.useState<Room | null>(null);
  const [currentPlayer, setCurrentPlayer] = React.useState<Player | null>(null);
  const [players, setPlayers] = React.useState<Player[]>([]);

  // Handle room creation/joining after getting player name
  const handlePlayerName = async (playerName: string) => {
    if (!pendingAction) return;

    setIsLoading(true);
    try {
      if (pendingAction.type === "create") {
        const room = await createRoom();
        if (room) {
          const result = await joinRoom(room.code, playerName);
          if (result) {
            setCurrentRoom(result.room);
            setCurrentPlayer(result.player);
            setGameState("room");
          }
        }
      } else if (pendingAction.type === "join" && pendingAction.roomCode) {
        const result = await joinRoom(pendingAction.roomCode, playerName);
        if (result) {
          setCurrentRoom(result.room);
          setCurrentPlayer(result.player);
          setGameState("room");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to join game. Please try again.",
      });
    }
    setIsLoading(false);
    setShowNameInput(false);
    setPendingAction(null);
  };

  const handleCreateRoom = async () => {
    setPendingAction({ type: "create" });
    setShowNameInput(true);
  };

  const handleJoinRoom = async (roomCode: string) => {
    setPendingAction({ type: "join", roomCode });
    setShowNameInput(true);
  };

  // Set up subscriptions when room is joined
  React.useEffect(() => {
    if (!currentRoom?.id) return;

    const roomSubscription = subscribeToRoom(currentRoom.id, (room) => {
      setCurrentRoom(room);
    });

    const playersSubscription = subscribeToPlayers(
      currentRoom.id,
      (updatedPlayers) => {
        setPlayers(updatedPlayers);
      },
    );

    return () => {
      roomSubscription.unsubscribe();
      playersSubscription.unsubscribe();
    };
  }, [currentRoom?.id]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen w-full bg-background"
    >
      {gameState === "join" ? (
        <RoomJoin
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          isLoading={isLoading}
        />
      ) : (
        <GameRoom
          isLoading={isLoading}
          gameState={currentRoom?.status || "waiting"}
          players={players.map((p) => ({
            id: p.id,
            name: p.name,
            score: p.score,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.avatar_seed}`,
            isCurrentPlayer: p.id === currentPlayer?.id,
          }))}
        />
      )}

      <PlayerNameInput isOpen={showNameInput} onSubmit={handlePlayerName} />
    </motion.div>
  );
};

export default Home;
