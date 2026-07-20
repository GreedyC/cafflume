export type MoveDirection = "up" | "down" | "left" | "right";

export const BOARD_SIZE = 4;

export function slideLine(line: number[]) {
  const compact = line.filter(Boolean);
  const merged: number[] = [];
  let score = 0;

  for (let index = 0; index < compact.length; index += 1) {
    if (compact[index] === compact[index + 1]) {
      const value = compact[index] * 2;
      merged.push(value);
      score += value;
      index += 1;
    } else {
      merged.push(compact[index]);
    }
  }

  return {
    line: [...merged, ...Array(BOARD_SIZE - merged.length).fill(0)],
    score
  };
}

export function moveBoard(board: number[], direction: MoveDirection) {
  const next = Array(board.length).fill(0) as number[];
  let score = 0;

  for (let outer = 0; outer < BOARD_SIZE; outer += 1) {
    const source = Array.from({ length: BOARD_SIZE }, (_, inner) => {
      if (direction === "left") return board[outer * BOARD_SIZE + inner];
      if (direction === "right") {
        return board[outer * BOARD_SIZE + (BOARD_SIZE - 1 - inner)];
      }
      if (direction === "up") return board[inner * BOARD_SIZE + outer];
      return board[(BOARD_SIZE - 1 - inner) * BOARD_SIZE + outer];
    });
    const result = slideLine(source);
    score += result.score;

    result.line.forEach((value, inner) => {
      if (direction === "left") next[outer * BOARD_SIZE + inner] = value;
      if (direction === "right") {
        next[outer * BOARD_SIZE + (BOARD_SIZE - 1 - inner)] = value;
      }
      if (direction === "up") next[inner * BOARD_SIZE + outer] = value;
      if (direction === "down") {
        next[(BOARD_SIZE - 1 - inner) * BOARD_SIZE + outer] = value;
      }
    });
  }

  return {
    board: next,
    score,
    moved: next.some((value, index) => value !== board[index])
  };
}

export function addRandomTile(
  board: number[],
  random: () => number = Math.random
) {
  const empty = board
    .map((value, index) => (value === 0 ? index : -1))
    .filter((index) => index !== -1);
  if (!empty.length) return [...board];

  const boundedRandom = Math.min(0.999999, Math.max(0, random()));
  const index = empty[Math.floor(boundedRandom * empty.length)];
  const next = [...board];
  next[index] = random() < 0.9 ? 2 : 4;
  return next;
}

export function createInitialBoard(random: () => number = Math.random) {
  return addRandomTile(addRandomTile(Array(16).fill(0), random), random);
}

export function canMove(board: number[]) {
  if (board.includes(0)) return true;
  return (["up", "down", "left", "right"] as const).some(
    (direction) => moveBoard(board, direction).moved
  );
}
