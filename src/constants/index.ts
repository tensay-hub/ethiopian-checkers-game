import { Board, Player } from '@/types';

export const BOARD_SIZE = 8;
export const PLAYER_ONE: Player = 'WHITE';
export const PLAYER_TWO: Player = 'BLACK';

// AI Parameters
export const AI_DEPTH_EASY = 1;
export const AI_DEPTH_MEDIUM = 2;
export const AI_DEPTH_HARD = 4;
export const AI_DEPTH_HARD_LATE_GAME = 6;

export const createInitialBoard = (): Board => {
  const board: Board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 !== 0) {
        board[row][col] = { player: PLAYER_TWO, type: 'MAN' };
      }
    }
  }

  for (let row = BOARD_SIZE - 3; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 !== 0) {
        board[row][col] = { player: PLAYER_ONE, type: 'MAN' };
      }
    }
  }

  return board;
};