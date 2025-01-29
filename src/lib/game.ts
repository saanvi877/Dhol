import { supabase } from "./supabase";
import { Room, Player, GameRound, Guess } from "@/types/game";

export async function createRoom(): Promise<Room | null> {
  console.log("Creating new room");
  
  // First get a random code
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  const { data, error } = await supabase
    .from("rooms")
    .insert({
      code: code,
      status: "waiting",
      current_round: 1,
      total_rounds: 5,
      round_time: 60,
    })
    .select()
    .single();

  console.log("Room creation result:", { data, error });
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
  // Find the room
  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select()
    .eq("code", code.toUpperCase())
    .single();
  
  console.log("Room join attempt:", { room, error: roomError });

  if (roomError || !room) {
    console.error("Error finding room:", roomError);
    return null;
  }

  // Create the player
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

  // If this is the first player, set them as the room creator
  if (room.created_by === null) {
    const { error: updateError } = await supabase
      .from("rooms")
      .update({ created_by: player.id })
      .eq("id", room.id);

    if (updateError) {
      console.error("Error setting room creator:", updateError);
    }
  }

  return { 
    room: { ...room, created_by: room.created_by || player.id },
    player 
  };
}

export async function updateGameSettings(
  roomId: string,
  settings: { roundTime: number; totalRounds: number }
): Promise<boolean> {
  const { error } = await supabase
    .from("rooms")
    .update({
      round_time: settings.roundTime,
      total_rounds: settings.totalRounds
    })
    .eq("id", roomId);

  return !error;
}

export async function startGame(roomId: string): Promise<boolean> {
  // Get room settings first
  const { data: room } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", roomId)
    .single();

  if (!room) return false;

  console.log("Starting game with settings:", room);

  // Update room status to playing
  const { error: roomError } = await supabase
    .from("rooms")
    .update({ 
      status: "playing",
      current_round: 1
    })
    .eq("id", roomId);

  if (roomError) return false;

  // Create first round
  const definition = await getRandomDefinition();
  console.log("First round word:", definition.word);
  
  const { error: roundError } = await supabase
    .from("game_rounds")
    .insert({
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
  // Get room settings
  const { data: room } = await supabase
    .from("rooms")
    .select("total_rounds")
    .eq("id", roomId)
    .single();

  if (!room) return false;

  if (currentRound >= room.total_rounds) {
    // Game is over
    const { error } = await supabase
      .from("rooms")
      .update({ status: "finished" })
      .eq("id", roomId);
    return !error;
  }

  // Update room status to playing for next round
  const { error: statusError } = await supabase
    .from("rooms")
    .update({ 
      status: "playing",
      current_round: currentRound + 1 
    })
    .eq("id", roomId);

  if (statusError) return false;

  // Create next round
  const definition = await getRandomDefinition();
  const { error: roundError } = await supabase
    .from("game_rounds")
    .insert({
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
      definition: "A celestial cushion of divine comfort, blessed by the gods for mortal repose",
      hint1: "Soft as a cloud",
      hint2: "Found where mortals rest",
    },
    {
      word: "MIRROR",
      definition: "A mystical portal that captures the essence of mortal reflection",
      hint1: "Shows truth",
      hint2: "Reflects divine light",
    },
    {
      word: "TOASTER",
      definition: "A metallic chamber that performs ritual bread ascension ceremonies",
      hint1: "Transforms bread",
      hint2: "Morning ritual device",
    },
    {
      word: "PENCIL",
      definition: "A wooden wand infused with graphite magic for manifesting mortal thoughts",
      hint1: "Leaves marks",
      hint2: "Erasable wisdom",
    },
    {
      word: "CLOCK",
      definition: "A mystical circle that imprisons time itself in an eternal dance",
      hint1: "Never stops moving",
      hint2: "Measures mortal moments",
    },
    {
      word: "UMBRELLA",
      definition: "A divine shield bestowed upon mortals to ward off Zeus's tears",
      hint1: "Protects from above",
      hint2: "Opens like angel wings",
    },
    {
      word: "KEYBOARD",
      definition: "A mystical array of runes that channel thoughts into digital reality",
      hint1: "Letter symphony",
      hint2: "Finger dancing platform",
    },
    {
      word: "CAMERA",
      definition: "A magical eye that steals moments from time's eternal flow",
      hint1: "Captures memories",
      hint2: "Light trapper",
    },
    {
      word: "CHAIR",
      definition: "A four-legged throne that grants momentary respite to weary mortals",
      hint1: "Supports the tired",
      hint2: "Found at tables",
    },
    {
      word: "BLANKET",
      definition: "A woven shield against the night's ethereal chill",
      hint1: "Warmth weaver",
      hint2: "Bed companion",
    }
  ];
  return definitions[Math.floor(Math.random() * definitions.length)];
}

export async function submitGuess(
  roundId: string,
  playerId: string,
  guess: string,
  timeRemaining: number
): Promise<boolean> {
  // Check if player already guessed in this round
  const { data: existingGuess } = await supabase
    .from("guesses")
    .select("*")
    .eq("round_id", roundId)
    .eq("player_id", playerId)
    .maybeSingle(); // Use maybeSingle instead of single to avoid 406 error

  if (existingGuess) {
    console.log("Player already guessed in this round");
    return false;
  }

  // Get the round to check the answer
  const { data: round } = await supabase
    .from("game_rounds")
    .select("*")
    .eq("id", roundId)
    .single();

  if (!round) return false;

  const isCorrect = guess.toLowerCase().trim() === round.word.toLowerCase().trim();
  const points = isCorrect ? Math.ceil(timeRemaining / 2) + 50 : 0;

  // Record the guess
  const { error: guessError } = await supabase
    .from("guesses")
    .insert({
      round_id: roundId,
      player_id: playerId,
      guess: guess,
      is_correct: isCorrect,
      points: points,
    });

  if (guessError) {
    console.error("Error submitting guess:", guessError);
    return false;
  }

  // If correct, update player score
  if (points > 0) {
    // First get current score
    const { data: player } = await supabase
      .from("players")
      .select("score")
      .eq("id", playerId)
      .single();
    
    const currentScore = player?.score || 0;
    
    // Then update with new score
    const { error: scoreError } = await supabase
      .from("players")
      .update({ 
        score: currentScore + points 
      })
      .eq("id", playerId);

    if (scoreError) {
      console.error("Error updating score:", scoreError);
      return false;
    }

    // Check if all players have guessed correctly
    const { data: roundGuesses } = await supabase
      .from("guesses")
      .select("*")
      .eq("round_id", roundId);

    const { data: totalPlayers } = await supabase
      .from("players")
      .select("count", { count: "exact" })
      .eq("room_id", round.room_id);

    const correctGuesses = roundGuesses?.filter(g => g.is_correct) || [];
    
    if (correctGuesses.length === totalPlayers?.count) {
      console.log("All players guessed correctly, ending round early");
      const roomId = round.room_id;
      setTimeout(() => endRound(roomId, roundId), 5000);
    }
  }

  return true;
}

export async function endRound(roomId: string, roundId: string): Promise<boolean> {
  console.log("Ending round for room:", roomId);

  // Get current round info
  const { data: room } = await supabase
    .from("rooms")
    .select("current_round, total_rounds")
    .eq("id", roomId)
    .single();

  if (!room) return false;

  // Update end time for current round
  const { error: roundError } = await supabase
    .from("game_rounds")
    .update({ 
      end_time: new Date().toISOString()
    })
    .eq("id", roundId);

  if (roundError) {
    console.error("Error updating round end time:", roundError);
    return false;
  }

  if (room.current_round >= room.total_rounds) {
    // Game is over
    const { error } = await supabase
      .from("rooms")
      .update({ status: "finished" })
      .eq("id", roomId);
    return !error;
  } else {
    // Start next round
    const { error } = await supabase
      .from("rooms")
      .update({ status: "round_end" })
      .eq("id", roomId);
    
    if (error) {
      console.error("Error updating room status:", error);
      return false;
    }

    // Wait 5 seconds before starting next round
    setTimeout(async () => {
      await startNextRound(roomId, room.current_round);
    }, 5000);

    return true;
  }
}

export function subscribeToRoom(
  roomId: string,
  callback: (room: Room) => void,
) {
  console.log("Subscribing to room:", roomId);
  
  // Get initial room state
  supabase
    .from("rooms")
    .select("*")
    .eq("id", roomId)
    .single()
    .then(({ data }) => {
      if (data) callback(data);
    });

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
      (payload) => {
        console.log("Room update received:", payload);
        callback(payload.new as Room);
      },
    )
    .subscribe();
}

export function subscribeToPlayers(
  roomId: string,
  callback: (players: Player[]) => void,
) {
  console.log("Subscribing to players for room:", roomId);
  
  // First, get initial players
  supabase
    .from("players")
    .select("*")
    .eq("room_id", roomId)
    .order("score", { ascending: false })
    .then(({ data }) => {
      if (data) callback(data);
    });

  // Then subscribe to changes
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
      async (payload) => {
        console.log("Player change received:", payload);
        const { data } = await supabase
          .from("players")
          .select("*")
          .eq("room_id", roomId)
          .order("score", { ascending: false });
        
        console.log("Updated players list:", data);
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
