import { supabase } from "./supabase";
import { Room, Player, GameRound, Guess } from "@/types/game";

export async function createRoom(): Promise<Room | null> {
  const { data, error } = await supabase
    .from("rooms")
    .insert({})
    .select()
    .single();

  if (error) {
    console.error("Error creating room:", error);
    return null;
  }

  return data;
}

export async function joinRoom(
  code: string,
  playerName: string,
): Promise<{ room: Room; player: Player } | null> {
  // First find the room
  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select()
    .eq("code", code.toUpperCase())
    .single();

  if (roomError || !room) {
    console.error("Error finding room:", roomError);
    return null;
  }

  // Then create the player
  const avatarSeed = Math.random().toString(36).substring(7);
  const { data: player, error: playerError } = await supabase
    .from("players")
    .insert({
      room_id: room.id,
      name: playerName,
      avatar_seed: avatarSeed,
    })
    .select()
    .single();

  if (playerError) {
    console.error("Error creating player:", playerError);
    return null;
  }

  return { room, player };
}

export async function startGame(roomId: string): Promise<boolean> {
  // First, update room status
  const { error: roomError } = await supabase
    .from("rooms")
    .update({
      status: "playing",
      current_round: 1,
      total_rounds: 5,
    })
    .eq("id", roomId);

  if (roomError) return false;

  // Create first round
  const definition = await getRandomDefinition();
  const { error: roundError } = await supabase.from("game_rounds").insert({
    room_id: roomId,
    round_number: 1,
    word: definition.word,
    definition: definition.definition,
    hint1: definition.hint1,
    hint2: definition.hint2,
    start_time: new Date().toISOString(),
  });

  return !roundError;
}

export async function startNextRound(
  roomId: string,
  currentRound: number,
): Promise<boolean> {
  if (currentRound >= 5) {
    // Game is over
    const { error } = await supabase
      .from("rooms")
      .update({ status: "finished" })
      .eq("id", roomId);
    return !error;
  }

  // Update room
  const { error: roomError } = await supabase
    .from("rooms")
    .update({ current_round: currentRound + 1 })
    .eq("id", roomId);

  if (roomError) return false;

  // Create next round
  const definition = await getRandomDefinition();
  const { error: roundError } = await supabase.from("game_rounds").insert({
    room_id: roomId,
    round_number: currentRound + 1,
    word: definition.word,
    definition: definition.definition,
    hint1: definition.hint1,
    hint2: definition.hint2,
    start_time: new Date().toISOString(),
  });

  return !roundError;
}

// Mock function - replace with actual API call or database query
async function getRandomDefinition() {
  const definitions = [
    {
      word: "PILLOW",
      definition:
        "A celestial cushion of divine comfort, blessed by the gods for mortal repose",
      hint1: "Soft as a cloud",
      hint2: "Found where mortals rest",
    },
    {
      word: "UMBRELLA",
      definition:
        "A divine shield bestowed upon mortals to ward off Zeus's tears",
      hint1: "Protects from above",
      hint2: "Opens like angel wings",
    },
    {
      word: "COFFEE",
      definition:
        "The sacred elixir of awakening, blessed by the gods of morning consciousness",
      hint1: "Dark as night",
      hint2: "Awakens the soul",
    },
    {
      word: "SOCKS",
      definition: "Divine foot sanctuaries woven by the Fates themselves",
      hint1: "Comes in pairs",
      hint2: "Protects mortal feet",
    },
    {
      word: "MIRROR",
      definition:
        "A mystical portal that captures the essence of mortal reflection",
      hint1: "Shows truth",
      hint2: "Reflects divine light",
    },
  ];
  return definitions[Math.floor(Math.random() * definitions.length)];
}

export async function submitGuess(
  roundId: string,
  playerId: string,
  guessText: string,
): Promise<Guess | null> {
  const { data, error } = await supabase
    .from("guesses")
    .insert({
      round_id: roundId,
      player_id: playerId,
      guess: guessText.toLowerCase(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error submitting guess:", error);
    return null;
  }

  return data;
}

export function subscribeToRoom(
  roomId: string,
  callback: (room: Room) => void,
) {
  return supabase
    .channel(`room:${roomId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "rooms",
        filter: `id=eq.${roomId}`,
      },
      (payload) => callback(payload.new as Room),
    )
    .subscribe();
}

export function subscribeToPlayers(
  roomId: string,
  callback: (players: Player[]) => void,
) {
  return supabase
    .channel(`players:${roomId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "players",
        filter: `room_id=eq.${roomId}`,
      },
      async () => {
        const { data } = await supabase
          .from("players")
          .select("*")
          .eq("room_id", roomId)
          .order("score", { ascending: false });
        if (data) callback(data);
      },
    )
    .subscribe();
}

export function subscribeToRound(
  roundId: string,
  callback: (round: GameRound) => void,
) {
  return supabase
    .channel(`round:${roundId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "game_rounds",
        filter: `id=eq.${roundId}`,
      },
      (payload) => callback(payload.new as GameRound),
    )
    .subscribe();
}

export function subscribeToGuesses(
  roundId: string,
  callback: (guess: Guess) => void,
) {
  return supabase
    .channel(`guesses:${roundId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "guesses",
        filter: `round_id=eq.${roundId}`,
      },
      (payload) => callback(payload.new as Guess),
    )
    .subscribe();
}
