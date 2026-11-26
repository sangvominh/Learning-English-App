"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, HelpCircle, Turtle, Volume2 } from "lucide-react";
import { playCardAudio, playSfx } from "@/lib/audio-player";
import type {
  ImplicitOutcome,
  LearningCard,
  PronunciationFeedback,
} from "@/lib/types";
import { PronunciationCoach } from "./PronunciationCoach";

export type MiniGameMode =
  | "listen_pick"
  | "tile_build"
  | "memory_match"
  | "speak_flash";

interface GameChallenge {
  id: string;
  mode: MiniGameMode;
  card: LearningCard;
}

interface MiniGameArenaProps {
  cards: LearningCard[];
  distractorPool: LearningCard[];
  preferredModes?: MiniGameMode[];
  onCardResult: (cardId: string, outcome: ImplicitOutcome) => Promise<void> | void;
  onComplete: (summary: { totalRounds: number; starsEarned: number }) => void;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildQueue(
  cards: LearningCard[],
  preferredModes?: MiniGameMode[]
): GameChallenge[] {
  if (cards.length === 0) return [];
  const defaultOrder: MiniGameMode[] = [
    "listen_pick",
    "tile_build",
    "speak_flash",
    "memory_match",
  ];
  const modes =
    preferredModes && preferredModes.length > 0 ? preferredModes : defaultOrder;

  const list: GameChallenge[] = [];
  cards.forEach((card, idx) => {
    let mode = modes[idx % modes.length];
    if (mode === "memory_match" && cards.length < 2) {
      mode = "listen_pick";
    }
    list.push({
      id: `${card.id}-${mode}-${idx}`,
      mode,
      card,
    });
  });

  let seenMemory = false;
  return list.map((item, idx) => {
    if (item.mode === "memory_match") {
      if (seenMemory) {
        return { ...item, mode: idx % 2 === 0 ? "listen_pick" : "tile_build" };
      }
      seenMemory = true;
    }
    return item;
  });
}

export function MiniGameArena({
  cards,
  distractorPool,
  preferredModes,
  onCardResult,
  onComplete,
}: MiniGameArenaProps) {
  const [queue, setQueue] = useState<GameChallenge[]>(() =>
    buildQueue(cards, preferredModes)
  );
  const [index, setIndex] = useState(0);
  const [starsEarned, setStarsEarned] = useState(0);
  const [completedRounds, setCompletedRounds] = useState(0);

  const current = queue[index];

  const advanceRound = (earned: number) => {
    const nextStars = starsEarned + earned;
    const nextCompleted = completedRounds + 1;
    setStarsEarned(nextStars);
    setCompletedRounds(nextCompleted);

    if (index + 1 >= queue.length) {
      playSfx("correct");
      onComplete({ totalRounds: nextCompleted, starsEarned: nextStars });
    } else {
      setIndex((i) => i + 1);
    }
  };

  const handleMissAndRequeue = (challenge: GameChallenge) => {
    setQueue((prev) => {
      const alreadyRequeued = prev.filter(
        (c) => c.card.id === challenge.card.id && c.mode === challenge.mode
      ).length;
      if (alreadyRequeued >= 2) return prev;
      return [
        ...prev,
        {
          ...challenge,
          id: `${challenge.id}-retry`,
        },
      ];
    });
  };

  if (!current) {
    return null;
  }

  const progressPct = Math.round(((index + 1) / queue.length) * 100);

  return (
    <div className="space-y-3.5">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2.5 rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full bg-emerald-600 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="text-xs font-bold text-slate-600 shrink-0">
          Câu {index + 1}/{queue.length}
        </span>
      </div>

      {current.mode === "listen_pick" && (
        <ListenPickGame
          key={current.id}
          card={current.card}
          pool={distractorPool}
          onResult={(outcome, missed) => {
            if (missed) handleMissAndRequeue(current);
            void onCardResult(current.card.id, outcome);
            advanceRound(missed ? 1 : 2);
          }}
        />
      )}

      {current.mode === "tile_build" && (
        <TileBuildGame
          key={current.id}
          card={current.card}
          onResult={(outcome, missed) => {
            if (missed) handleMissAndRequeue(current);
            void onCardResult(current.card.id, outcome);
            advanceRound(missed ? 1 : 2);
          }}
        />
      )}

      {current.mode === "memory_match" && (
        <MemoryMatchGame
          key={current.id}
          cards={cards.slice(0, 4)}
          onResult={(cardId, outcome) => void onCardResult(cardId, outcome)}
          onDone={(earned) => advanceRound(earned)}
        />
      )}

      {current.mode === "speak_flash" && (
        <SpeakFlashGame
          key={current.id}
          card={current.card}
          onEvaluated={(fb) => {
            void onCardResult(current.card.id, {
              kind: "speaking",
              speakingScore: fb.score,
              mistakeNoteVi: fb.stars < 3 ? fb.correctionVi : undefined,
            });
          }}
          onNext={(stars) => advanceRound(stars)}
        />
      )}
    </div>
  );
}

/* =========================================================
 * Bài tập 1: Nghe & Chọn hình
 * ======================================================= */
function ListenPickGame({
  card,
  pool,
  onResult,
}: {
  card: LearningCard;
  pool: LearningCard[];
  onResult: (outcome: ImplicitOutcome, missed: boolean) => void;
}) {
  const options = useMemo(() => {
    const uniqueOthers = shuffle(
      pool.filter(
        (c) =>
          c.id !== card.id &&
          c.imageUrl !== card.imageUrl &&
          c.text.toLowerCase() !== card.text.toLowerCase()
      )
    ).slice(0, 3);
    const fillers =
      uniqueOthers.length < 3
        ? pool.filter((c) => c.id !== card.id).slice(0, 3 - uniqueOthers.length)
        : [];
    return shuffle([card, ...uniqueOthers, ...fillers]).slice(0, 4);
  }, [card, pool]);

  const [attempts, setAttempts] = useState(0);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void playCardAudio(card, "normal");
    }, 200);
    return () => window.clearTimeout(t);
  }, [card]);

  const handlePick = (opt: LearningCard) => {
    if (solved) return;
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    if (opt.id === card.id) {
      setSolved(true);
      playSfx("correct");
      window.setTimeout(() => {
        onResult(
          {
            kind: "game",
            attempts: nextAttempts,
            mistakeNoteVi:
              nextAttempts > 1 ? `Nghe nhầm hình ở từ "${card.text}"` : undefined,
          },
          nextAttempts > 1
        );
      }, 900);
    } else {
      playSfx("tryAgain");
      setWrongIds((prev) => [...prev, opt.id]);
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3.5 animate-pop-in">
      <div className="text-center space-y-2">
        <span className="inline-block rounded-lg bg-slate-100 text-slate-700 px-2.5 py-1 text-xs font-bold">
          Nghe &amp; Chọn hình đúng
        </span>
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => void playCardAudio(card, "normal")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 text-white px-4 py-2.5 font-bold text-sm"
          >
            <Volume2 className="w-4 h-4" />
            Nghe lại
          </button>
          <button
            type="button"
            onClick={() => void playCardAudio(card, "slow")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 text-slate-800 px-3.5 py-2.5 font-bold text-xs"
          >
            <Turtle className="w-4 h-4" />
            Chậm
          </button>
        </div>
        {solved ? (
          <p className="text-xs font-extrabold text-emerald-700">
            Chính xác: {card.text} — {card.meaningVi}
          </p>
        ) : wrongIds.length > 0 ? (
          <p className="text-xs font-bold text-orange-700">
            Chưa đúng, nghe lại và thử chọn hình khác nhé
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => {
          const isWrong = wrongIds.includes(opt.id);
          const isRight = solved && opt.id === card.id;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={solved || isWrong}
              onClick={() => handlePick(opt)}
              className={`rounded-2xl border p-3 flex flex-col items-center justify-center gap-1.5 transition-all ${
                isRight
                  ? "border-emerald-500 bg-emerald-50"
                  : isWrong
                  ? "border-rose-200 bg-rose-50/60 opacity-45 animate-wiggle"
                  : "border-slate-200 bg-slate-50/50 hover:border-sky-300 active:scale-95"
              }`}
            >
              <img
                src={opt.imageUrl}
                alt={opt.meaningVi}
                className="w-24 h-24 object-contain rounded-xl"
              />
              {isRight && (
                <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {opt.text}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
 * Bài tập 2: Xếp chữ / Ghép câu
 * ======================================================= */
interface TileToken {
  id: string;
  label: string;
}

function TileBuildGame({
  card,
  onResult,
}: {
  card: LearningCard;
  onResult: (outcome: ImplicitOutcome, missed: boolean) => void;
}) {
  const isSentence = card.type === "sentence";

  const targetUnits = useMemo(() => {
    if (isSentence) {
      return card.text.trim().split(/\s+/);
    }
    return card.text.trim().split("");
  }, [card.text, isSentence]);

  const initialTiles = useMemo<TileToken[]>(() => {
    const real = targetUnits.map((label, idx) => ({
      id: `real-${idx}-${label}`,
      label,
    }));
    const extras: TileToken[] = [];
    if (!isSentence && targetUnits.length <= 4) {
      const candidates = ["s", "a", "t", "p", "i", "n", "o", "e"].filter(
        (ch) => !targetUnits.includes(ch)
      );
      extras.push(
        ...candidates.slice(0, 2).map((ch, idx) => ({
          id: `extra-${idx}-${ch}`,
          label: ch,
        }))
      );
    }
    return shuffle([...real, ...extras]);
  }, [isSentence, targetUnits]);

  const [pickedIds, setPickedIds] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [usedHint, setUsedHint] = useState(false);
  const [shake, setShake] = useState(false);
  const [wrongMsg, setWrongMsg] = useState(false);
  const [solved, setSolved] = useState(false);

  const pickedTokens = pickedIds
    .map((id) => initialTiles.find((t) => t.id === id))
    .filter((t): t is TileToken => Boolean(t));

  const checkAnswer = (nextIds: string[]) => {
    if (nextIds.length !== targetUnits.length) return;
    const built = nextIds
      .map((id) => initialTiles.find((t) => t.id === id)?.label ?? "")
      .join(isSentence ? " " : "");

    const expected = targetUnits.join(isSentence ? " " : "");
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    if (built.toLowerCase() === expected.toLowerCase()) {
      setSolved(true);
      setWrongMsg(false);
      playSfx("correct");
      void playCardAudio(card, "normal");
      window.setTimeout(() => {
        onResult(
          {
            kind: "game",
            attempts: nextAttempts,
            usedHint,
            mistakeNoteVi:
              nextAttempts > 1 ? `Nhầm thứ tự ghép "${card.text}"` : undefined,
          },
          nextAttempts > 1
        );
      }, 750);
    } else {
      playSfx("tryAgain");
      setShake(true);
      setWrongMsg(true);
      window.setTimeout(() => {
        setShake(false);
      }, 400);
    }
  };

  const tapPoolTile = (tile: TileToken) => {
    if (solved || pickedIds.includes(tile.id)) return;
    if (pickedIds.length >= targetUnits.length) return;
    playSfx("tap");
    setWrongMsg(false);
    const next = [...pickedIds, tile.id];
    setPickedIds(next);
    checkAnswer(next);
  };

  const removePicked = (tileId: string) => {
    if (solved) return;
    setWrongMsg(false);
    setPickedIds((prev) => prev.filter((id) => id !== tileId));
  };

  const handleClearAll = () => {
    if (solved) return;
    setWrongMsg(false);
    setPickedIds([]);
  };

  const handleHint = () => {
    if (solved) return;
    setUsedHint(true);
    setWrongMsg(false);
    const nextSlotIdx = pickedIds.length;
    if (nextSlotIdx >= targetUnits.length) return;
    const neededLabel = targetUnits[nextSlotIdx];
    const match = initialTiles.find(
      (t) =>
        t.label.toLowerCase() === neededLabel.toLowerCase() &&
        !pickedIds.includes(t.id)
    );
    if (match) {
      const next = [...pickedIds, match.id];
      setPickedIds(next);
      checkAnswer(next);
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3.5 animate-pop-in">
      <div className="flex items-center justify-between">
        <span className="rounded-lg bg-slate-100 text-slate-700 px-2.5 py-1 text-xs font-bold">
          {isSentence ? "Xếp thành câu đúng" : "Xếp chữ đúng"}
        </span>
        <button
          type="button"
          onClick={() => void playCardAudio(card, "normal")}
          className="inline-flex items-center gap-1 rounded-lg bg-sky-50 text-sky-700 px-2.5 py-1 text-xs font-bold"
        >
          <Volume2 className="w-3.5 h-3.5" /> Nghe gợi ý
        </button>
      </div>

      <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-2.5">
        <img
          src={card.imageUrl}
          alt={card.meaningVi}
          className="w-14 h-14 object-contain rounded-lg bg-white p-1 shrink-0"
        />
        <div>
          <p className="text-sm font-extrabold text-slate-800">
            {card.meaningVi}
          </p>
          <p className="text-xs font-semibold text-slate-500">
            Chạm các thẻ bên dưới theo đúng thứ tự
          </p>
        </div>
      </div>

      <div
        className={`min-h-[56px] rounded-xl border-2 border-dashed p-2 flex flex-wrap items-center justify-center gap-2 ${
          solved
            ? "border-emerald-400 bg-emerald-50"
            : shake
            ? "border-rose-400 bg-rose-50 animate-wiggle"
            : "border-slate-200 bg-slate-50"
        }`}
      >
        {pickedTokens.length === 0 ? (
          <span className="text-xs font-semibold text-slate-400">
            Chạm các ô chữ ở dưới...
          </span>
        ) : (
          pickedTokens.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => removePicked(t.id)}
              className="rounded-lg bg-emerald-600 text-white px-3 py-1.5 font-extrabold text-sm"
            >
              {t.label}
            </button>
          ))
        )}
      </div>

      {wrongMsg && (
        <p className="text-center text-xs font-bold text-rose-600">
          Chưa đúng thứ tự, chạm vào chữ sai để bỏ hoặc bấm Xóa hết.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-2">
        {initialTiles.map((tile) => {
          const used = pickedIds.includes(tile.id);
          return (
            <button
              key={tile.id}
              type="button"
              disabled={used || solved}
              onClick={() => tapPoolTile(tile)}
              className={`rounded-xl px-3.5 py-2 font-extrabold text-sm border transition ${
                used
                  ? "bg-slate-100 border-slate-100 text-transparent"
                  : "bg-white border-slate-300 text-slate-800 hover:bg-slate-50 active:scale-95"
              }`}
            >
              {tile.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleClearAll}
          disabled={solved || pickedIds.length === 0}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 disabled:opacity-40"
        >
          Xóa hết
        </button>
        <button
          type="button"
          onClick={handleHint}
          disabled={solved}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <HelpCircle className="w-3.5 h-3.5" /> Gợi ý 1 chữ
        </button>
      </div>
    </div>
  );
}

/* =========================================================
 * Bài tập 3: Lật thẻ Ghép cặp (Hình <-> Chữ)
 * ======================================================= */
interface MemoryTile {
  uid: string;
  cardId: string;
  kind: "image" | "text";
  card: LearningCard;
}

function MemoryMatchGame({
  cards,
  onResult,
  onDone,
}: {
  cards: LearningCard[];
  onResult: (cardId: string, outcome: ImplicitOutcome) => void;
  onDone: (starsEarned: number) => void;
}) {
  const tiles = useMemo<MemoryTile[]>(() => {
    const selected = cards.slice(0, 3);
    const list: MemoryTile[] = [];
    for (const c of selected) {
      list.push({ uid: `${c.id}-img`, cardId: c.id, kind: "image", card: c });
      list.push({ uid: `${c.id}-txt`, cardId: c.id, kind: "text", card: c });
    }
    return shuffle(list);
  }, [cards]);

  const [flipped, setFlipped] = useState<string[]>([]);
  const [matchedCardIds, setMatchedCardIds] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);

  const handleFlip = (tile: MemoryTile) => {
    if (
      locked ||
      flipped.includes(tile.uid) ||
      matchedCardIds.includes(tile.cardId)
    ) {
      return;
    }
    playSfx("tap");
    void playCardAudio(tile.card, "normal");

    const nextFlipped = [...flipped, tile.uid];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setLocked(true);
      const first = tiles.find((t) => t.uid === nextFlipped[0])!;
      const second = tiles.find((t) => t.uid === nextFlipped[1])!;

      if (first.cardId === second.cardId) {
        playSfx("correct");
        const nextMatched = [...matchedCardIds, first.cardId];
        setMatchedCardIds(nextMatched);
        onResult(first.cardId, { kind: "game", attempts: 1 });
        window.setTimeout(() => {
          setFlipped([]);
          setLocked(false);
          if (nextMatched.length === tiles.length / 2) {
            onDone(2);
          }
        }, 450);
      } else {
        playSfx("tryAgain");
        window.setTimeout(() => {
          setFlipped([]);
          setLocked(false);
        }, 650);
      }
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3 animate-pop-in">
      <div className="flex items-center justify-between">
        <span className="rounded-lg bg-slate-100 text-slate-700 px-2.5 py-1 text-xs font-bold">
          Ghép cặp Hình – Chữ
        </span>
        <span className="text-xs font-bold text-slate-500">
          {matchedCardIds.length}/{tiles.length / 2}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {tiles.map((tile) => {
          const isMatched = matchedCardIds.includes(tile.cardId);
          const isOpen = isMatched || flipped.includes(tile.uid);
          return (
            <button
              key={tile.uid}
              type="button"
              onClick={() => handleFlip(tile)}
              className={`h-24 rounded-xl border p-2 flex items-center justify-center transition-all ${
                isMatched
                  ? "border-emerald-400 bg-emerald-50"
                  : isOpen
                  ? "border-slate-300 bg-white"
                  : "border-slate-300 bg-slate-100 text-slate-500"
              }`}
            >
              {isOpen ? (
                tile.kind === "image" ? (
                  <img
                    src={tile.card.imageUrl}
                    alt={tile.card.meaningVi}
                    className="w-16 h-16 object-contain"
                  />
                ) : (
                  <span className="font-display text-sm font-extrabold text-slate-800 text-center leading-tight">
                    {tile.card.text}
                  </span>
                )
              ) : (
                <span className="text-lg font-extrabold">?</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
 * Bài tập 4: Nhìn hình & Đọc to
 * ======================================================= */
function SpeakFlashGame({
  card,
  onEvaluated,
  onNext,
}: {
  card: LearningCard;
  onEvaluated: (fb: PronunciationFeedback) => void;
  onNext: (stars: number) => void;
}) {
  const [showText, setShowText] = useState(false);
  const [doneSpeaking, setDoneSpeaking] = useState(false);

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3 animate-pop-in">
      <div className="flex items-center justify-between">
        <span className="rounded-lg bg-slate-100 text-slate-700 px-2.5 py-1 text-xs font-bold">
          Nhìn hình & Đọc to
        </span>
        <button
          type="button"
          onClick={() => setShowText((v) => !v)}
          className="text-xs font-bold text-sky-700 hover:underline"
        >
          {showText ? "Ẩn chữ" : "Xem chữ"}
        </button>
      </div>

      <div className="flex flex-col items-center text-center bg-slate-50 rounded-xl p-3">
        <img
          src={card.imageUrl}
          alt={card.meaningVi}
          className="w-24 h-24 object-contain mb-1"
        />
        <p className="text-sm font-bold text-slate-700">{card.meaningVi}</p>
        {showText && (
          <p className="font-display text-2xl font-extrabold text-emerald-700 mt-1">
            {card.text}
          </p>
        )}
      </div>

      <PronunciationCoach
        card={card}
        compact
        onEvaluated={(fb) => {
          setDoneSpeaking(true);
          setShowText(true);
          onEvaluated(fb);
        }}
      />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onNext(doneSpeaking ? 2 : 1)}
          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 font-bold text-xs"
        >
          {doneSpeaking ? "Tiếp tục" : "Bỏ qua"}
        </button>
      </div>
    </div>
  );
}
