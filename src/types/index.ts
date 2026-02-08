export type Player = 'BLACK' | 'WHITE';
export type PieceType = 'MAN' | 'KING';

export interface Piece {
  player: Player;
  type: PieceType;
}

export type Square = Piece | null;
export type Board = Square[][];

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  captured: Position[];
}

export interface ApplyMoveResult {
  newBoard: Board;
  promoted: boolean;
}

export type GameMode = 'single' | 'two';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GameResult {
  winner: Player;
  winnerName: string;
  score: number;
  moves: number;
  mode: GameMode;
}