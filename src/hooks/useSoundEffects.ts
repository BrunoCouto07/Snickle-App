import { useCallback, useEffect, useState } from "react";

export type SoundEffectType =
  "click" | "token" | "complete" | "success" | "pop" | "fanfare" | "equip" | "error";

// Shared Web Audio Context (created lazily on first user interaction)
let sharedAudioCtx: AudioContext | null = null;
let soundMuted = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  try {
    if (!sharedAudioCtx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        sharedAudioCtx = new AudioCtxClass();
      }
    }
    if (sharedAudioCtx && sharedAudioCtx.state === "suspended") {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

// Initialise mute preference from localStorage if available
if (typeof window !== "undefined") {
  try {
    const saved = localStorage.getItem("snickle_sound_muted");
    if (saved !== null) {
      soundMuted = saved === "true";
    }
  } catch {
    // Ignore storage errors
  }
}

/**
 * Synthesizes short, warm, pleasant UI sound effects using Web Audio API.
 * Guarantees zero latency, works completely offline, and doesn't rely on external audio files.
 */
export function playSoundEffect(type: SoundEffectType = "click"): void {
  if (soundMuted) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    switch (type) {
      case "click": {
        // A soft, organic gentle tactile pop (50ms)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.045);

        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.05);
        break;
      }

      case "token": {
        // Cheerful sparkling 2-tone star token / coin chime (B5 -> E6)
        const notes = [
          { f: 987.77, start: 0, dur: 0.12 },
          { f: 1318.51, start: 0.09, dur: 0.22 },
        ];

        notes.forEach(({ f, start, dur }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "triangle"; // Warm, bell-like timbre
          osc.frequency.setValueAtTime(f, now + start);

          gain.gain.setValueAtTime(0.001, now + start);
          gain.gain.linearRampToValueAtTime(0.2, now + start + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + start);
          osc.stop(now + start + dur);
        });
        break;
      }

      case "complete": {
        // Triumphant ascending arpeggio: C5 -> E5 -> G5 -> C6
        const chord = [
          { f: 523.25, time: 0, dur: 0.16 },
          { f: 659.25, time: 0.1, dur: 0.18 },
          { f: 783.99, time: 0.2, dur: 0.22 },
          { f: 1046.5, time: 0.32, dur: 0.36 },
        ];

        chord.forEach(({ f, time, dur }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(f, now + time);

          gain.gain.setValueAtTime(0.001, now + time);
          gain.gain.linearRampToValueAtTime(0.22, now + time + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + time);
          osc.stop(now + time + dur);
        });
        break;
      }

      case "success": {
        // Pleasant positive double chime (G5 -> C6)
        const notes = [
          { f: 783.99, start: 0, dur: 0.14 },
          { f: 1046.5, start: 0.1, dur: 0.25 },
        ];

        notes.forEach(({ f, start, dur }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(f, now + start);

          gain.gain.setValueAtTime(0.001, now + start);
          gain.gain.linearRampToValueAtTime(0.18, now + start + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + start);
          osc.stop(now + start + dur);
        });
        break;
      }

      case "pop": {
        // Playful bubble burst pop
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.035);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.05);
        break;
      }

      case "equip": {
        // Magical gentle shimmer chord (E5 + B5 + G#6)
        const shimmer = [659.25, 987.77, 1661.22];
        shimmer.forEach((f, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(f, now + i * 0.04);

          gain.gain.setValueAtTime(0.001, now + i * 0.04);
          gain.gain.linearRampToValueAtTime(0.12, now + i * 0.04 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.25);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + i * 0.04);
          osc.stop(now + i * 0.04 + 0.28);
        });
        break;
      }

      case "fanfare": {
        // Full celebratory fanfare (G4 -> C5 -> E5 -> G5 -> C6)
        const fanfareNotes = [
          { f: 392.0, start: 0, dur: 0.12 },
          { f: 523.25, start: 0.1, dur: 0.12 },
          { f: 659.25, start: 0.2, dur: 0.14 },
          { f: 783.99, start: 0.32, dur: 0.22 },
          { f: 1046.5, start: 0.48, dur: 0.45 },
        ];

        fanfareNotes.forEach(({ f, start, dur }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "triangle";
          osc.frequency.setValueAtTime(f, now + start);

          gain.gain.setValueAtTime(0.001, now + start);
          gain.gain.linearRampToValueAtTime(0.22, now + start + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + start);
          osc.stop(now + start + dur);
        });
        break;
      }

      case "error": {
        // Gentle, soft low double-bounce (non-alarming, gentle prompt)
        const notes = [
          { f: 220, start: 0, dur: 0.08 },
          { f: 196, start: 0.09, dur: 0.1 },
        ];

        notes.forEach(({ f, start, dur }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(f, now + start);

          gain.gain.setValueAtTime(0.001, now + start);
          gain.gain.linearRampToValueAtTime(0.12, now + start + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + start);
          osc.stop(now + start + dur);
        });
        break;
      }
    }
  } catch (err) {
    console.warn("UI sound effect error:", err);
  }
}

/**
 * React hook to trigger short, pleasant UI sound effects.
 *
 * @example
 * ```tsx
 * const { playClick, playToken, playComplete, playSuccess } = useSoundEffects();
 *
 * <button onClick={() => { playClick(); handleClick(); }}>Button</button>
 * <button onClick={() => { playToken(); addStar(); }}>Add Star</button>
 * ```
 */
export function useSoundEffects() {
  const [muted, setMutedState] = useState<boolean>(soundMuted);

  useEffect(() => {
    setMutedState(soundMuted);
  }, []);

  const setMuted = useCallback((isMuted: boolean) => {
    soundMuted = isMuted;
    setMutedState(isMuted);
    try {
      localStorage.setItem("snickle_sound_muted", String(isMuted));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const toggleMute = useCallback(() => {
    setMuted(!soundMuted);
  }, [setMuted]);

  const playClick = useCallback(() => playSoundEffect("click"), []);
  const playToken = useCallback(() => playSoundEffect("token"), []);
  const playComplete = useCallback(() => playSoundEffect("complete"), []);
  const playSuccess = useCallback(() => playSoundEffect("success"), []);
  const playPop = useCallback(() => playSoundEffect("pop"), []);
  const playFanfare = useCallback(() => playSoundEffect("fanfare"), []);
  const playEquip = useCallback(() => playSoundEffect("equip"), []);
  const playError = useCallback(() => playSoundEffect("error"), []);
  const playSound = useCallback((type: SoundEffectType) => playSoundEffect(type), []);

  return {
    playClick,
    playToken,
    playComplete,
    playSuccess,
    playPop,
    playFanfare,
    playEquip,
    playError,
    playSound,
    isMuted: muted,
    setMuted,
    toggleMute,
  };
}
