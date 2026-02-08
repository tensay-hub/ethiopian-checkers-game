import { Board, Player, Position, Move, Piece, Difficulty, ApplyMoveResult } from '@/types';
import { BOARD_SIZE, AI_DEPTH_HARD, AI_DEPTH_HARD_LATE_GAME } from '@/constants';

const isWithinBoard = (row: number, col: number): boolean => row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;

const getOpponent = (player: Player): Player => (player === 'WHITE' ? 'BLACK' : 'WHITE');

// Recursive function to find all possible capture chains from a starting position.
const findPieceCaptureMovesRecursive = (board: Board, from: Position, piece: Piece, capturedSoFar: Position[]): Move[] => {
    const moves: Move[] = [];
    if (!piece || !piece.player) {
        return moves;
    }

    const directions = piece.type === 'KING'
        ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
        : (piece.player === 'WHITE' ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]]);

    for (const [dRow, dCol] of directions) {
        const opponentPos = { row: from.row + dRow, col: from.col + dCol };
        const landingPos = { row: from.row + 2 * dRow, col: from.col + 2 * dCol };

        if (!isWithinBoard(landingPos.row, landingPos.col)) continue;

        const opponentPiece = board[opponentPos.row]?.[opponentPos.col];

        if (
            board[landingPos.row]?.[landingPos.col] == null &&
            opponentPiece?.player === getOpponent(piece.player) &&
            !capturedSoFar.some(p => p.row === opponentPos.row && p.col === opponentPos.col)
        ) {
            const newBoard = JSON.parse(JSON.stringify(board));
            newBoard[landingPos.row][landingPos.col] = { ...piece };
            newBoard[from.row][from.col] = null;
            newBoard[opponentPos.row][opponentPos.col] = null;

            const newCaptured = [...capturedSoFar, opponentPos];
            const chainedMoves = findPieceCaptureMovesRecursive(newBoard, landingPos, piece, newCaptured);

            if (chainedMoves.length > 0) {
                moves.push(...chainedMoves.map(m => ({ ...m, from })));
            } else {
                moves.push({ from, to: landingPos, captured: newCaptured });
            }
        }
    }
    return moves;
}

const findPieceCaptureMoves = (board: Board, from: Position, piece: Piece): Move[] => {
    if (!piece || !piece.player) return [];
    const allPossibleChains = findPieceCaptureMovesRecursive(board, from, piece, []);
    if (allPossibleChains.length === 0) return [];
    let longestChainLength = 0;
    allPossibleChains.forEach(move => {
        if ((move.captured?.length || 0) > longestChainLength) {
            longestChainLength = move.captured?.length || 0;
        }
    });
    return allPossibleChains.filter(move => (move.captured?.length || 0) === longestChainLength);
}

export const findCaptureMoves = (board: Board, player: Player): Move[] => {
    if (!player) return [];
    let captureMoves: Move[] = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const piece = board[row]?.[col];
            if (piece && piece.player === player) {
                const pieceMoves = findPieceCaptureMoves(board, { row, col }, piece);
                captureMoves.push(...pieceMoves);
            }
        }
    }
    if (captureMoves.length === 0) return [];
    let maxCaptures = 0;
    captureMoves.forEach(move => {
        if ((move.captured?.length || 0) > maxCaptures) {
            maxCaptures = move.captured?.length || 0;
        }
    });
    return captureMoves.filter(move => (move.captured?.length || 0) === maxCaptures);
};

export const getValidMoves = (board: Board, from: Position): Move[] => {
    const piece = board[from.row]?.[from.col];
    if (!piece || !piece.player) return [];
    const captureMoves = findCaptureMoves(board, piece.player);
    if (captureMoves.length > 0) {
        return captureMoves.filter(move => move.from.row === from.row && move.from.col === from.col);
    }
    const moves: Move[] = [];
    const directions = piece.type === 'KING'
        ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
        : (piece.player === 'WHITE' ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]]);
    for (const [dRow, dCol] of directions) {
        const to = { row: from.row + dRow, col: from.col + dCol };
        if (isWithinBoard(to.row, to.col) && board[to.row]?.[to.col] == null) {
            moves.push({ from, to, captured: [] });
        }
    }
    return moves;
};

export const applyMove = (board: Board, move: Move): ApplyMoveResult => {
    if (!move || !move.from || !move.to) return { newBoard: board, promoted: false };
    const newBoard = JSON.parse(JSON.stringify(board));
    const piece = newBoard[move.from.row]?.[move.from.col];
    let promoted = false;
    if (!piece || !piece.player) return { newBoard: board, promoted: false };
    newBoard[move.to.row][move.to.col] = piece;
    newBoard[move.from.row][move.from.col] = null;
    if (move.captured) {
        for (const capturedPos of move.captured) {
            if (capturedPos && isWithinBoard(capturedPos.row, capturedPos.col)) {
                newBoard[capturedPos.row][capturedPos.col] = null;
            }
        }
    }
    if (piece.type === 'MAN' && ((piece.player === 'WHITE' && move.to.row === 0) || (piece.player === 'BLACK' && move.to.row === BOARD_SIZE - 1))) {
        const pieceToPromote = newBoard[move.to.row]?.[move.to.col];
        if (pieceToPromote) {
            pieceToPromote.type = 'KING';
            promoted = true;
        }
    }
    return { newBoard, promoted };
};

const findStandardMoves = (board: Board, player: Player): Move[] => {
    const moves: Move[] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const piece = board[r]?.[c];
            if (piece && piece.player === player) {
                const directions = piece.type === 'KING'
                    ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
                    : (piece.player === 'WHITE' ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]]);
                for (const [dRow, dCol] of directions) {
                    const to = { row: r + dRow, col: c + dCol };
                    if (isWithinBoard(to.row, to.col) && board[to.row]?.[to.col] == null) {
                        moves.push({ from: { row: r, col: c }, to, captured: [] });
                    }
                }
            }
        }
    }
    return moves;
};

export const getAllPlayerMoves = (board: Board, player: Player): Move[] => {
    if (!player) return [];
    const captureMoves = findCaptureMoves(board, player);
    if (captureMoves.length > 0) return captureMoves;
    return findStandardMoves(board, player);
};

export const checkWinCondition = (board: Board, currentPlayer: Player): Player | null => {
    if (!currentPlayer) return null;
    const currentMoves = getAllPlayerMoves(board, currentPlayer);
    if (currentMoves.length === 0) return getOpponent(currentPlayer);
    const opponent = getOpponent(currentPlayer);
    let opponentPieces = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const p = board[r]?.[c];
            if (p && p.player === opponent) opponentPieces++;
        }
    }
    if (opponentPieces === 0) return currentPlayer;
    const opponentMoves = getAllPlayerMoves(board, opponent);
    if (opponentMoves.length === 0) return currentPlayer;
    return null;
};

const evaluateBoard = (board: Board, player: Player): number => {
    const opponent = getOpponent(player);
    let score = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const piece = board[r][c];
            if (!piece) continue;
            const isPlayer = piece.player === player;
            const multiplier = isPlayer ? 1 : -1;
            let value = piece.type === 'KING' ? 500 : 100;
            if (piece.type === 'MAN') {
                const progress = piece.player === 'WHITE' ? (BOARD_SIZE - 1 - r) : r;
                value += progress * 10;
            } else {
                const distToCenter = Math.abs(r - 3.5) + Math.abs(c - 3.5);
                value += (8 - distToCenter) * 5;
            }
            if (c === 0 || c === BOARD_SIZE - 1 || r === 0 || r === BOARD_SIZE - 1) {
                value += 15;
            }
            score += value * multiplier;
        }
    }
    return score;
};

const minimax = (board: Board, depth: number, alpha: number, beta: number, isMaximizing: boolean, aiPlayer: Player): number => {
    const currentPlayer = isMaximizing ? aiPlayer : getOpponent(aiPlayer);
    const win = checkWinCondition(board, currentPlayer);
    if (win === aiPlayer) return 10000 + depth;
    if (win === getOpponent(aiPlayer)) return -10000 - depth;
    if (depth === 0) return evaluateBoard(board, aiPlayer);
    const moves = getAllPlayerMoves(board, currentPlayer);
    if (isMaximizing) {
        let maxEval = -Infinity;
        for (const move of moves) {
            const { newBoard } = applyMove(board, move);
            const evaluation = minimax(newBoard, depth - 1, alpha, beta, false, aiPlayer);
            maxEval = Math.max(maxEval, evaluation);
            alpha = Math.max(alpha, evaluation);
            if (beta <= alpha) break;
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (const move of moves) {
            const { newBoard } = applyMove(board, move);
            const evaluation = minimax(newBoard, depth - 1, alpha, beta, true, aiPlayer);
            minEval = Math.min(minEval, evaluation);
            beta = Math.min(beta, evaluation);
            if (beta <= alpha) break;
        }
        return minEval;
    }
};

const getEasyMove = (board: Board, player: Player): Move | null => {
    const allMoves = getAllPlayerMoves(board, player);
    if (allMoves.length === 0) return null;
    return allMoves[Math.floor(Math.random() * allMoves.length)];
};

const getMediumMove = (board: Board, player: Player): Move | null => {
    const allMoves = getAllPlayerMoves(board, player);
    if (allMoves.length === 0) return null;
    const captureMoves = allMoves.filter(m => m.captured && m.captured.length > 0);
    if (captureMoves.length > 0) return captureMoves[Math.floor(Math.random() * captureMoves.length)];
    return allMoves[Math.floor(Math.random() * allMoves.length)];
};

const getHardMove = (board: Board, player: Player): Move | null => {
    const allMoves = getAllPlayerMoves(board, player);
    if (allMoves.length === 0) return null;
    if (allMoves.length === 1) return allMoves[0];
    let pieceCount = 0;
    board.forEach(row => row.forEach(sq => { if (sq) pieceCount++; }));
    const depth = pieceCount < 10 ? AI_DEPTH_HARD_LATE_GAME : AI_DEPTH_HARD;
    let bestMove = null;
    let bestValue = -Infinity;
    for (const move of allMoves) {
        const { newBoard } = applyMove(board, move);
        const boardValue = minimax(newBoard, depth - 1, -Infinity, Infinity, false, player);
        if (boardValue > bestValue) {
            bestValue = boardValue;
            bestMove = move;
        }
    }
    return bestMove;
};

export const getAIMove = (board: Board, aiPlayer: Player, difficulty: Difficulty): Move | null => {
    if (!aiPlayer || !difficulty) return null;
    switch (difficulty) {
        case 'easy': return getEasyMove(board, aiPlayer);
        case 'medium': return getMediumMove(board, aiPlayer);
        case 'hard': return getHardMove(board, aiPlayer);
        default: return getEasyMove(board, aiPlayer);
    }
};

export const getSuggestedMoves = (board: Board, player: Player): Move[] => {
    const allMoves = getAllPlayerMoves(board, player);
    if (allMoves.length === 0) return [];
    const captureMoves = allMoves.filter(m => m.captured && m.captured.length > 0);
    if (captureMoves.length > 0) {
        const maxCaptures = Math.max(...captureMoves.map(m => m.captured.length));
        return captureMoves.filter(m => m.captured.length === maxCaptures);
    }
    const scoredMoves = allMoves.map(move => {
        const { newBoard } = applyMove(board, move);
        return { move, score: evaluateBoard(newBoard, player) };
    });
    scoredMoves.sort((a, b) => b.score - a.score);
    const maxScore = scoredMoves[0].score;
    return scoredMoves.filter(m => m.score === maxScore).map(m => m.move);
};