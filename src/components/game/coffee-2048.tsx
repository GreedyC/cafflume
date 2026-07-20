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

const tileStory: Record<number, { label: string; icon: string }> = {
  2: { label: "Yeşil", icon: "◖" },
  4: { label: "Kavrum", icon: "◗" },
  8: { label: "Dinlenme", icon: "◆" },
  16: { label: "Öğütüm", icon: "✦" },
  32: { label: "Bloom", icon: "◎" },
  64: { label: "Döküş", icon: "◌" },
  128: { label: "Demleme", icon: "♨" },
  256: { label: "Aroma", icon: "✺" },
  512: { label: "Fincan", icon: "◒" },
  1024: { label: "Ustalık", icon: "✹" },
  2048: { label: "Perfect", icon: "★" }
};

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

export function Coffee2048() {
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
              <span>Skor</span>
              <strong>{score}</strong>
            </div>
            <div className="score-chip">
              <span>Rekor</span>
              <strong>{best}</strong>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={reset}>
            <RotateCcw size={14} />
            Yeni tur
          </Button>
        </div>

        <div
          className="bean-board relative mx-auto grid aspect-square w-full max-w-[620px] grid-cols-4 gap-2 rounded-[1.4rem] p-2 sm:gap-3 sm:p-3"
          role="application"
          aria-label="Bean Merge oyun tahtası. Ok tuşları veya kaydırma hareketiyle oyna."
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
            const story = tileStory[Math.min(value, 2048)];
            return (
              <div
                key={index}
                data-value={value || "empty"}
                className="bean-tile"
                aria-label={value ? `${value}, ${story?.label ?? "usta fincan"}` : "boş"}
              >
                {value > 0 && (
                  <>
                    <span aria-hidden="true" className="bean-tile-icon">
                      {story?.icon ?? "★"}
                    </span>
                    <strong>{value}</strong>
                    <small>{story?.label ?? "Usta"}</small>
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
                  {won ? "Mükemmel fincan!" : "Öğütüm bitti."}
                </h2>
                <p className="mt-2 text-sm text-white/70">
                  {won
                    ? "2048’e ulaştın; istersen ustalık turuna devam et."
                    : "Tahtada hamle kalmadı. Yeni bir reçeteyle tekrar dene."}
                </p>
                <Button
                  onClick={won && !gameOver ? () => setWinAcknowledged(true) : reset}
                  className="mt-5"
                >
                  {won && !gameOver ? "Ustalık turuna devam et" : "Yeni tur başlat"}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="mx-auto mt-5 grid w-fit grid-cols-3 gap-2 sm:hidden">
          <span />
          <button
            type="button"
            aria-label="Yukarı"
            onClick={() => performMove("up")}
            className="game-arrow"
          >
            <ArrowUp size={19} />
          </button>
          <span />
          <button
            type="button"
            aria-label="Sol"
            onClick={() => performMove("left")}
            className="game-arrow"
          >
            <ArrowLeft size={19} />
          </button>
          <button
            type="button"
            aria-label="Aşağı"
            onClick={() => performMove("down")}
            className="game-arrow"
          >
            <ArrowDown size={19} />
          </button>
          <button
            type="button"
            aria-label="Sağ"
            onClick={() => performMove("right")}
            className="game-arrow"
          >
            <ArrowRight size={19} />
          </button>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="rounded-[1.35rem] border border-[var(--border)] bg-[var(--surface-glass)] p-5 shadow-[var(--shadow-sm)]">
          <p className="panel-kicker">Nasıl oynanır?</p>
          <h2 className="display-title mt-2 text-2xl font-semibold">
            Çekirdekleri birleştir
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">
            Aynı seviyedeki iki çekirdeği buluştur. Yeşil çekirdekten kusursuz
            fincana ilerle ve 2048’e ulaş.
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
            Coffee break
          </p>
          <p className="mt-3 text-sm leading-6 text-white/70">
            Rekorun yalnızca bu cihazda saklanır; çalışma alanı hesabına veya
            veritabanına yazılmaz.
          </p>
        </div>
      </aside>
    </div>
  );
}
