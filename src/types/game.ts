export interface Player {
  id: string;
  name: string;
  score: number;
  avatar_seed: string;
  room_id: string;
  created_at: string;
}

export interface Room {
  id: string;
  code: string;
  status: "waiting" | "playing" | "finished";
  current_round: number;
  total_rounds: number;
  created_at: string;
  updated_at: string;
}

export interface GameRound {
  id: string;
  room_id: string;
  round_number: number;
  word: string;
  definition: string;
  hint1: string;
  hint2: string;
  start_time: string;
  end_time: string | null;
}

export interface Guess {
  id: string;
  round_id: string;
  player_id: string;
  guess: string;
  is_correct: boolean;
  points: number;
  created_at: string;
}
