// SoundEngine.ts — Premium Musical Typing Sound Engine
// Uses Web Audio API to create beautiful, harmonious melodies as you type.
// Each lesson has a unique pentatonic/modal scale and instrument timbre.
// Notes flow musically — the more you type, the more the melody plays.

export interface LessonSoundProfile {
  scale: number[];          // Ordered melody notes (Hz) — play in sequence
  waveform: OscillatorType; // Base oscillator type
  secondWave?: OscillatorType; // Optional harmonic overtone
  secondGain?: number;      // Volume of second harmonic (0–1)
  baseVolume: number;
  noteDuration: number;     // seconds
  attackTime: number;
  releaseTime: number;
  vibratoRate?: number;     // Hz — adds vibrato warmth
  vibratoDepth?: number;    // Cents
  reverb: boolean;
}

// ── Note Frequency Map ──────────────────────────────────────────────────────
const N: Record<string, number> = {
  C3: 130.81, D3: 146.83, E3: 164.81, G3: 196.00, A3: 220.00, B3: 246.94,
  Bb3: 233.08, Eb3: 155.56,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  Bb4: 466.16, Eb4: 311.13, Fs4: 369.99, Cs4: 277.18,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00,
  Bb5: 932.33, Fs5: 739.99, Cs5: 554.37,
};

// ── Lesson Sound Profiles ───────────────────────────────────────────────────
// All scales are pentatonic or modal — guaranteed to always sound harmonious.
// The sequence of notes creates a real melody as you type through the text.
export const LESSON_PROFILES: Record<string, LessonSoundProfile> = {

  // uz-1 — C Major Pentatonic — Bright, hopeful piano-like
  'uz-1': {
    scale: [N.C4, N.E4, N.G4, N.A4, N.C5, N.E5, N.G5, N.A5, N.C5, N.E4, N.G4, N.C4, N.A4, N.G4, N.E4],
    waveform: 'triangle',
    secondWave: 'sine',
    secondGain: 0.4,
    baseVolume: 0.22,
    noteDuration: 0.35,
    attackTime: 0.012,
    releaseTime: 0.30,
    vibratoRate: 5.5,
    vibratoDepth: 3,
    reverb: true,
  },

  // uz-2 — G Minor Pentatonic — Warm, soulful guitar-like
  'uz-2': {
    scale: [N.G3, N.Bb3, N.C4, N.D4, N.G4, N.Bb4, N.C5, N.D5, N.G4, N.C4, N.D4, N.G3, N.Bb3, N.D4, N.C4],
    waveform: 'triangle',
    secondWave: 'sine',
    secondGain: 0.3,
    baseVolume: 0.24,
    noteDuration: 0.4,
    attackTime: 0.02,
    releaseTime: 0.35,
    vibratoRate: 4.5,
    vibratoDepth: 4,
    reverb: true,
  },

  // uz-3 — D Dorian Pentatonic — Mysterious, flowing
  'uz-3': {
    scale: [N.D4, N.E4, N.G4, N.A4, N.C5, N.D5, N.E5, N.C5, N.A4, N.G4, N.E4, N.D4, N.G4, N.C5, N.A4],
    waveform: 'sine',
    secondWave: 'triangle',
    secondGain: 0.25,
    baseVolume: 0.21,
    noteDuration: 0.38,
    attackTime: 0.015,
    releaseTime: 0.33,
    vibratoRate: 5,
    vibratoDepth: 3.5,
    reverb: true,
  },

  // uz-4 — F Major Pentatonic — Uplifting, bright marimba-like
  'uz-4': {
    scale: [N.F4, N.G4, N.A4, N.C5, N.D5, N.F5, N.G5, N.D5, N.C5, N.A4, N.G4, N.F4, N.C5, N.A4, N.G4],
    waveform: 'triangle',
    baseVolume: 0.22,
    noteDuration: 0.28,
    attackTime: 0.008,
    releaseTime: 0.25,
    vibratoRate: 6,
    vibratoDepth: 2,
    reverb: false,
  },

  // uz-5 — A Minor Pentatonic — Cool, laid-back electric piano
  'uz-5': {
    scale: [N.A3, N.C4, N.D4, N.E4, N.G4, N.A4, N.C5, N.D5, N.E5, N.G5, N.E5, N.D5, N.C5, N.A4, N.G4],
    waveform: 'sine',
    secondWave: 'triangle',
    secondGain: 0.35,
    baseVolume: 0.23,
    noteDuration: 0.42,
    attackTime: 0.018,
    releaseTime: 0.38,
    vibratoRate: 4,
    vibratoDepth: 5,
    reverb: true,
  },

  // ru-1 — E Minor Pentatonic — Deep, melancholic, cinematic
  'ru-1': {
    scale: [N.E4, N.G4, N.A4, N.B4, N.D5, N.E5, N.G5, N.D5, N.B4, N.A4, N.G4, N.E4, N.A4, N.D5, N.B4],
    waveform: 'triangle',
    secondWave: 'sine',
    secondGain: 0.3,
    baseVolume: 0.22,
    noteDuration: 0.45,
    attackTime: 0.02,
    releaseTime: 0.40,
    vibratoRate: 4.2,
    vibratoDepth: 4,
    reverb: true,
  },

  // ru-2 — Bb Major Pentatonic — Grand, classical, orchestral
  'ru-2': {
    scale: [N.Bb3, N.C4, N.D4, N.F4, N.G4, N.Bb4, N.C5, N.D5, N.F5, N.D5, N.C5, N.Bb4, N.G4, N.F4, N.D4],
    waveform: 'sine',
    baseVolume: 0.21,
    noteDuration: 0.38,
    attackTime: 0.012,
    releaseTime: 0.33,
    vibratoRate: 5,
    vibratoDepth: 3,
    reverb: true,
  },

  // ru-3 — C Major Pentatonic — Simple, clear, folk-like
  'ru-3': {
    scale: [N.C4, N.D4, N.E4, N.G4, N.A4, N.C5, N.D5, N.E5, N.G5, N.E5, N.D5, N.C5, N.A4, N.G4, N.E4],
    waveform: 'triangle',
    secondWave: 'sine',
    secondGain: 0.2,
    baseVolume: 0.22,
    noteDuration: 0.3,
    attackTime: 0.01,
    releaseTime: 0.26,
    vibratoRate: 5.5,
    vibratoDepth: 2.5,
    reverb: false,
  },

  // ru-4 — G Minor Pentatonic — Dramatic, intense, powerful
  'ru-4': {
    scale: [N.G3, N.Bb3, N.C4, N.D4, N.G4, N.Bb4, N.C5, N.D5, N.G4, N.D4, N.C4, N.Bb3, N.G3, N.C4, N.D4],
    waveform: 'sawtooth',
    secondWave: 'sine',
    secondGain: 0.55,
    baseVolume: 0.16,
    noteDuration: 0.35,
    attackTime: 0.015,
    releaseTime: 0.30,
    vibratoRate: 3.5,
    vibratoDepth: 6,
    reverb: true,
  },

  // ru-5 — D Major Pentatonic — Happy, bright, energetic
  'ru-5': {
    scale: [N.D4, N.E4, N.Fs4, N.A4, N.B4, N.D5, N.E5, N.Fs5, N.D5, N.B4, N.A4, N.Fs4, N.E4, N.D4, N.A4],
    waveform: 'triangle',
    secondWave: 'sine',
    secondGain: 0.3,
    baseVolume: 0.23,
    noteDuration: 0.32,
    attackTime: 0.01,
    releaseTime: 0.28,
    vibratoRate: 6,
    vibratoDepth: 2.5,
    reverb: false,
  },

  // Default — for custom lessons — neutral, pleasant
  'default': {
    scale: [N.C4, N.D4, N.E4, N.G4, N.A4, N.C5, N.E5, N.G5, N.A5, N.G5, N.E5, N.C5, N.A4, N.G4, N.E4],
    waveform: 'triangle',
    secondWave: 'sine',
    secondGain: 0.3,
    baseVolume: 0.22,
    noteDuration: 0.35,
    attackTime: 0.012,
    releaseTime: 0.30,
    vibratoRate: 5,
    vibratoDepth: 3,
    reverb: false,
  },
};

// ── Sound Engine ────────────────────────────────────────────────────────────
class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 1.0;
      this.masterGain.connect(this.ctx.destination);
      this.buildReverb();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  private buildReverb() {
    if (!this.ctx || !this.masterGain) return;
    const sr = this.ctx.sampleRate;
    const len = sr * 2.2; // 2.2s reverb tail
    const buf = this.ctx.createBuffer(2, len, sr);
    for (let ch = 0; ch < 2; ch++) {
      const data = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.0);
      }
    }
    this.reverbNode = this.ctx.createConvolver();
    this.reverbNode.buffer = buf;

    this.reverbGain = this.ctx.createGain();
    this.reverbGain.gain.value = 0.22; // wet mix
    this.reverbNode.connect(this.reverbGain);
    this.reverbGain.connect(this.masterGain);
  }

  playNote(lessonId: string, charIndex: number, isCorrect: boolean) {
    try {
      const ctx = this.getCtx();
      const profile = LESSON_PROFILES[lessonId] ?? LESSON_PROFILES['default'];
      const now = ctx.currentTime;

      if (!isCorrect) {
        // Error: short, soft thud — low sine burst
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
        g.gain.setValueAtTime(0.18, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(g);
        g.connect(this.masterGain!);
        osc.start(now);
        osc.stop(now + 0.12);
        return;
      }

      // ── Melody note from sequential scale ───────────────────────────────
      const freq = profile.scale[charIndex % profile.scale.length];
      const dur = profile.noteDuration;

      // Main oscillator
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = profile.waveform;
      osc1.frequency.setValueAtTime(freq, now);

      // Vibrato via LFO
      if (profile.vibratoRate && profile.vibratoDepth) {
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(profile.vibratoRate, now);
        lfoGain.gain.setValueAtTime(profile.vibratoDepth, now);
        lfo.connect(lfoGain);
        lfoGain.connect(osc1.frequency);
        lfo.start(now + profile.attackTime);
        lfo.stop(now + dur + 0.05);
      }

      // Smooth envelope
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(profile.baseVolume, now + profile.attackTime);
      gain1.gain.setValueAtTime(profile.baseVolume, now + profile.attackTime + 0.01);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + dur);

      osc1.connect(gain1);

      // Optional harmonic overtone (richer sound)
      if (profile.secondWave && profile.secondGain) {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = profile.secondWave;
        osc2.frequency.setValueAtTime(freq * 2, now); // octave up
        gain2.gain.setValueAtTime(0, now);
        gain2.gain.linearRampToValueAtTime(profile.baseVolume * profile.secondGain, now + profile.attackTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + dur * 0.8);
        osc2.connect(gain2);
        gain2.connect(this.masterGain!);
        osc2.start(now);
        osc2.stop(now + dur + 0.05);
      }

      // Route with optional reverb
      if (profile.reverb && this.reverbNode) {
        gain1.connect(this.masterGain!);
        gain1.connect(this.reverbNode);
      } else {
        gain1.connect(this.masterGain!);
      }

      osc1.start(now);
      osc1.stop(now + dur + 0.05);

    } catch (_) { /* silent fail */ }
  }

  // Completion arpeggio — plays a beautiful ascending chord
  playFinish(lessonId: string) {
    try {
      const ctx = this.getCtx();
      const profile = LESSON_PROFILES[lessonId] ?? LESSON_PROFILES['default'];
      // Pick the root, third, fifth, octave, and high octave from the scale
      const arpNotes = [
        profile.scale[0],
        profile.scale[2],
        profile.scale[4],
        profile.scale[7] ?? profile.scale[profile.scale.length - 1],
        profile.scale[0] * 2,
      ];

      arpNotes.forEach((freq, i) => {
        const t = ctx.currentTime + i * 0.11;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = profile.waveform;
        osc.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.22, t + 0.015);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
        osc.connect(g);
        if (profile.reverb && this.reverbNode) {
          g.connect(this.masterGain!);
          g.connect(this.reverbNode);
        } else {
          g.connect(this.masterGain!);
        }
        osc.start(t);
        osc.stop(t + 1.0);
      });
    } catch (_) { /* silent fail */ }
  }
}

export const soundEngine = new SoundEngine();
