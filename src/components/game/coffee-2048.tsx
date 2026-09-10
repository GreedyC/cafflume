"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  RotateCcw,
  Trophy
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  addRandomTile,
  canMove,
  createInitialBoard,
  moveBoard,
  type MoveDirection
} from "@/lib/game2048";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n";
import { gameCopy } from "@/lib/i18n-game";

const tileIcons = ["◖","◗","◆","✦","◎","◌","♨","✺","◒","✹","★"];

const directionByKey: Record<string, MoveDirection | undefined> = {
  ArrowUp: "up",
  w: "up",
  W: "up",
  ArrowDown: "down",
  s: "down",
  S: "down",
  ArrowLeft: "left",
  a: "left",
  A: "left",
  ArrowRight: "right",
  d: "right",
  D: "right"
};

const BEST_SCORE_KEY = "brewstack-bean-merge-best";
const BEST_SCORE_EVENT = "brewstack-bean-merge-best-change";

function subscribeBestScore(callback: () => void) {
  window.addEventListener(BEST_SCORE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(BEST_SCORE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getBestScoreSnapshot() {
  const value = Number(localStorage.getItem(BEST_SCORE_KEY));
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function Coffee2048({ locale }: { locale: Locale }) {
  const c = gameCopy[locale];
  const [board, setBoard] = useState<number[]>(() => [
    0, 0, 0, 0,
    0, 2, 0, 0,
    0, 0, 2, 0,
    0, 0, 0, 0
  ]);
  const [score, setScore] = useState(0);
  const [winAcknowledged, setWinAcknowledged] = useState(false);
  const storedBest = useSyncExternalStore(
    subscribeBestScore,
    getBestScoreSnapshot,
    () => 0
  );
  const best = Math.max(storedBest, score);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const gameOver = !canMove(board);
  const won = board.some((value) => value >= 2048);

  const performMove = useCallback((direction: MoveDirection) => {
    setBoard((current) => {
      const result = moveBoard(current, direction);
      if (!result.moved) return current;
      setScore((currentScore) => {
        const nextScore = currentScore + result.score;
        const nextBest = Math.max(getBestScoreSnapshot(), nextScore);
        localStorage.setItem(BEST_SCORE_KEY, String(nextBest));
        window.dispatchEvent(new Event(BEST_SCORE_EVENT));
        return nextScore;
      });
      return addRandomTile(result.board);
    });
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const direction = directionByKey[event.key];
      if (!direction) return;
      event.preventDefault();
      performMove(direction);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [performMove]);

  const reset = () => {
    setBoard(createInitialBoard());
    setScore(0);
    setWinAcknowledged(false);
  };

  const finishSwipe = (x: number, y: number) => {
    if (!touchStart.current) return;
    const dx = x - touchStart.current.x;
    const dy = y - touchStart.current.y;
    touchStart.current = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 28) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      performMove(dx > 0 ? "right" : "left");
    } else {
      performMove(dy > 0 ? "down" : "up");
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
      <section className="game-stage rounded-[1.6rem] border border-[var(--border)] p-4 shadow-[var(--shadow-md)] sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <div className="score-chip">
              <span>{c.score}</span>
              <strong>{score}</strong>
            </div>
            <div className="score-chip">
              <span>{c.best}</span>
              <strong>{best}</strong>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={reset}>
            <RotateCcw size={14} />
            {c.newRound}
          </Button>
        </div>

        <div
          className="bean-board relative mx-auto grid aspect-square w-full max-w-[620px] grid-cols-4 gap-2 rounded-[1.4rem] p-2 sm:gap-3 sm:p-3"
          role="application"
          aria-label={c.boardLabel}
          tabIndex={0}
          onPointerDown={(event) => {
            touchStart.current = { x: event.clientX, y: event.clientY };
          }}
          onPointerUp={(event) => finishSwipe(event.clientX, event.clientY)}
          onPointerCancel={() => {
            touchStart.current = null;
          }}
        >
          {board.map((value, index) => {
            const storyIndex = value ? Math.min(10, Math.log2(value) - 1) : 0;
            const label = c.tiles[storyIndex];
            return (
              <div
                key={index}
                data-value={value || "empty"}
                className="bean-tile"
                aria-label={value ? `${value}, ${label ?? c.masterCup}` : c.empty}
              >
                {value > 0 && (
                  <>
                    <span aria-hidden="true" className="bean-tile-icon">
                      {tileIcons[storyIndex] ?? "★"}
                    </span>
                    <strong>{value}</strong>
                    <small>{label ?? c.master}</small>
                  </>
                )}
              </div>
            );
          })}
          {(gameOver || (won && !winAcknowledged)) && (
            <div className="absolute inset-2 grid place-items-center rounded-[1.1rem] bg-[rgba(8,15,12,0.82)] p-6 text-center text-white backdrop-blur-sm sm:inset-3">
              <div>
                <Trophy className="mx-auto text-[var(--accent-2)]" size={34} />
                <h2 className="display-title mt-3 text-3xl font-semibold">
                  {won ? c.won : c.over}
                </h2>
                <p className="mt-2 text-sm text-white/70">
                  {won
                    ? c.wonHint
                    : c.overHint}
                </p>
                <Button
                  onClick={won && !gameOver ? () => setWinAcknowledged(true) : reset}
                  className="mt-5"
                >
                  {won && !gameOver ? c.continue : c.restart}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="mx-auto mt-5 grid w-fit grid-cols-3 gap-2 sm:hidden">
          <span />
          <button
            type="button"
            aria-label={c.up}
            onClick={() => performMove("up")}
            className="game-arrow"
          >
            <ArrowUp size={19} />
          </button>
          <span />
          <button
            type="button"
            aria-label={c.left}
            onClick={() => performMove("left")}
            className="game-arrow"
          >
            <ArrowLeft size={19} />
          </button>
          <button
            type="button"
            aria-label={c.down}
            onClick={() => performMove("down")}
            className="game-arrow"
          >
            <ArrowDown size={19} />
          </button>
          <button
            type="button"
            aria-label={c.right}
            onClick={() => performMove("right")}
            className="game-arrow"
          >
            <ArrowRight size={19} />
          </button>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="rounded-[1.35rem] border border-[var(--border)] bg-[var(--surface-glass)] p-5 shadow-[var(--shadow-sm)]">
          <p className="panel-kicker">{c.how}</p>
          <h2 className="display-title mt-2 text-2xl font-semibold">
            {c.merge}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">
            {c.instructions}
          </p>
          <div className="mt-5 grid grid-cols-4 gap-2 text-center text-[10px] font-bold text-[var(--ink-muted)]">
            {[
              ["↑", "W"],
              ["←", "A"],
              ["↓", "S"],
              ["→", "D"]
            ].map(([arrow, key]) => (
              <div key={key} className="rounded-xl bg-[var(--surface-2)] p-2">
                <span className="block text-base text-[var(--ink)]">{arrow}</span>
                {key}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[1.35rem] border border-[var(--border)] bg-[var(--surface-inverse)] p-5 text-white shadow-[var(--shadow-md)]">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--accent-2)]">
            {c.break}
          </p>
          <p className="mt-3 text-sm leading-6 text-white/70">
            {c.localOnly}
          </p>
        </div>
      </aside>
    </div>
  );
}
