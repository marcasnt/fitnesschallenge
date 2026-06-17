// Synthetic audio using Web Audio API - no external files needed
// Generates the IFBB required sounds: start "ya", 30s warning, end horn, transition whistle

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (typeof window === "undefined") {
    throw new Error("AudioContext only available in browser");
  }
  if (!audioCtx) {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new Ctx();
  }
  return audioCtx;
}

function tone(frequency: number, duration: number, type: OscillatorType = "sine", volume = 0.5, attack = 0.01, decay = 0.05) {
  try {
    const ctx = getCtx();
    if (ctx.state === "suspended") ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // ignore audio errors
  }
}

export const sounds = {
  /** "¡Ya!" - inicio de estación - two-tone high */
  startYa() {
    tone(880, 0.15, "square", 0.45, 0.005, 0.05);
    setTimeout(() => tone(1320, 0.2, "square", 0.4, 0.005, 0.05), 100);
  },
  /** Pitido 30 segundos restantes - short beep */
  warning30s() {
    tone(660, 0.12, "sine", 0.45, 0.005, 0.05);
    setTimeout(() => tone(660, 0.12, "sine", 0.45, 0.005, 0.05), 250);
  },
  /** Bocina fin de estación - long low tone */
  hornEnd() {
    tone(220, 0.6, "sawtooth", 0.4, 0.01, 0.1);
    setTimeout(() => tone(165, 0.5, "sawtooth", 0.35, 0.01, 0.1), 100);
  },
  /** Silbato de transición - high whistle */
  transition() {
    const ctx = getCtx();
    if (ctx.state === "suspended") ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1500, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(2000, ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  },
  /** Last 5 second countdown beeps */
  countdownBeep() {
    tone(1000, 0.1, "sine", 0.4, 0.005, 0.05);
  },
  /** Final completion fanfare */
  complete() {
    [523, 659, 784, 1047].forEach((f, i) => {
      setTimeout(() => tone(f, 0.3, "square", 0.4, 0.005, 0.1), i * 150);
    });
  },
  /** Simple click for rep counter */
  repClick() {
    tone(800, 0.04, "sine", 0.2, 0.001, 0.02);
  },
};

export function primeAudio() {
  try {
    getCtx();
  } catch {
    // ignore
  }
}
