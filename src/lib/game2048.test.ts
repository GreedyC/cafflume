import { describe, expect, it } from "vitest";
import {
  addRandomTile,
  canMove,
  moveBoard,
  slideLine
} from "./game2048";

describe("Bean Merge 2048 engine", () => {
  it("merges each pair only once", () => {
    expect(slideLine([2, 2, 2, 2])).toEqual({
      line: [4, 4, 0, 0],
      score: 8
    });
    expect(slideLine([4, 4, 8, 0])).toEqual({
      line: [8, 8, 0, 0],
      score: 8
    });
  });

  it("moves rows and columns in the requested direction", () => {
    const board = [
      2, 0, 2, 0,
      0, 0, 0, 0,
      2, 0, 0, 0,
      2, 0, 0, 0
    ];
    expect(moveBoard(board, "left").board.slice(0, 4)).toEqual([4, 0, 0, 0]);
    expect(moveBoard(board, "up").board.filter((_, index) => index % 4 === 0)).toEqual([
      4, 2, 0, 0
    ]);
  });

  it("adds a tile only to an empty cell", () => {
    const board = [2, ...Array(15).fill(0)];
    const values = [0, 0.5];
    const next = addRandomTile(board, () => values.shift() ?? 0);
    expect(next[0]).toBe(2);
    expect(next.filter(Boolean)).toHaveLength(2);
  });

  it("detects a board with no legal moves", () => {
    const locked = [
      2, 4, 2, 4,
      4, 2, 4, 2,
      2, 4, 2, 4,
      4, 2, 4, 2
    ];
    expect(canMove(locked)).toBe(false);
    expect(canMove([...locked.slice(0, -1), 0])).toBe(true);
  });
});
