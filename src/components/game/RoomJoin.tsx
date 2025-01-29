import React from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Plus, Users } from "lucide-react";

interface RoomJoinProps {
  onCreateRoom?: () => void;
  onJoinRoom?: (roomCode: string) => void;
  isLoading?: boolean;
}

const RoomJoin = ({
  onCreateRoom = () => {},
  onJoinRoom = () => {},
  isLoading = false,
}: RoomJoinProps) => {
  const [roomCode, setRoomCode] = React.useState("");

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim()) {
      onJoinRoom(roomCode);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-background">
      <Card className="p-6 space-y-6 border-4 border-primary/20 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Divine Words
          </h2>
          <p className="text-sm text-muted-foreground">
            Create a new room or join an existing one
          </p>
        </div>

        <Button
          className="w-full h-16 text-lg"
          onClick={onCreateRoom}
          disabled={isLoading}
        >
          <Plus className="mr-2 h-5 w-5" />
          Create New Room
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or join existing
            </span>
          </div>
        </div>

        <form onSubmit={handleJoinRoom} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="room-code">Room Code</Label>
            <Input
              id="room-code"
              placeholder="Enter room code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            variant="outline"
            disabled={!roomCode.trim() || isLoading}
          >
            <Users className="mr-2 h-5 w-5" />
            Join Room
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default RoomJoin;
