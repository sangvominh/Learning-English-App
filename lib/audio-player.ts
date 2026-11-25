"use client";

import type { LearningCard } from "./types";

let activeAudio: HTMLAudioElement | null = null;
let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctx) return null;
  if (!sharedAudioCtx) {
    sharedAudioCtx = new Ctx();
  }
  if (sharedAudioCtx.state === "suspended") {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

export function stopAllPlayback() {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
    activeAudio = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

function pickBestEnglishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return null;
  }
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  return (
    voices.find(
      (v) => v.lang.startsWith("en-US") && /google|natural|samantha/i.test(v.name)
    ) ??
    voices.find((v) => v.lang.startsWith("en-US")) ??
    voices.find((v) => v.lang.startsWith("en")) ??
    null
  );
}

export async function playCardAudio(
  card: Pick<LearningCard, "text" | "spokenText" | "audioNormalUrl" | "audioSlowUrl">,
  speed: "normal" | "slow" = "normal"
): Promise<void> {
  stopAllPlayback();

  const url =
    speed === "slow"
      ? card.audioSlowUrl || card.audioNormalUrl
      : card.audioNormalUrl;

  if (url) {
    try {
      const audio = new Audio(url);
      activeAudio = audio;
      if (speed === "slow" && !card.audioSlowUrl) {
        audio.playbackRate = 0.72;
      }
      await audio.play();
      return;
    } catch {
      // Fall back to Web Speech API if file playback fails
    }
  }

  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    await new Promise<void>((resolve) => {
      const textToSpeak = card.spokenText || card.text;
      const utter = new SpeechSynthesisUtterance(textToSpeak);
      utter.lang = "en-US";
      utter.rate = speed === "slow" ? 0.6 : 0.9;
      utter.pitch = 1.05;
      const voice = pickBestEnglishVoice();
      if (voice) utter.voice = voice;
      utter.onend = () => resolve();
      utter.onerror = () => resolve();
      window.speechSynthesis.speak(utter);
    });
  }
}

export function playSfx(
  type: "tap" | "correct" | "tryAgain" | "star" | "fanfare"
) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const playTone = (
    freq: number,
    startOffset: number,
    duration: number,
    gainVal = 0.08,
    oscType: OscillatorType = "sine"
  ) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = oscType;
    osc.frequency.setValueAtTime(freq, now + startOffset);
    gain.gain.setValueAtTime(0.001, now + startOffset);
    gain.gain.exponentialRampToValueAtTime(gainVal, now + startOffset + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + startOffset + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + startOffset);
    osc.stop(now + startOffset + duration + 0.02);
  };

  if (type === "tap") {
    playTone(540, 0, 0.06, 0.05);
  } else if (type === "correct") {
    playTone(523.25, 0, 0.11, 0.09);
    playTone(659.25, 0.08, 0.16, 0.09);
  } else if (type === "tryAgain") {
    playTone(320, 0, 0.14, 0.06, "triangle");
    playTone(260, 0.1, 0.18, 0.06, "triangle");
  } else if (type === "star") {
    playTone(659.25, 0, 0.1, 0.08);
    playTone(783.99, 0.08, 0.1, 0.08);
    playTone(1046.5, 0.16, 0.22, 0.09);
  } else if (type === "fanfare") {
    playTone(523.25, 0, 0.12, 0.09);
    playTone(659.25, 0.1, 0.12, 0.09);
    playTone(783.99, 0.2, 0.14, 0.09);
    playTone(1046.5, 0.32, 0.34, 0.11);
  }
}
