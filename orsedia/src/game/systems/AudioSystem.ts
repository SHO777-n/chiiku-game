/**
 * BGM/SE(Web Audio による手続き生成。音源ファイル不要)。
 * Phase 5 で音源アセットへ差し替える場合もこのAPIを維持する。
 */

type BgmName = 'title' | 'village' | 'field' | 'dungeon' | 'town' | 'boss' | 'ending';
type SeName =
  | 'attack'
  | 'hit'
  | 'playerHit'
  | 'pickup'
  | 'levelup'
  | 'save'
  | 'door'
  | 'choice'
  | 'bossDown';

/** BGM: [周波数, 拍数] の音列をループ再生する */
const BGM_PATTERNS: Record<BgmName, { tempo: number; wave: OscillatorType; notes: [number, number][] }> = {
  title: {
    tempo: 70,
    wave: 'sine',
    notes: [
      [330, 2], [392, 2], [440, 3], [392, 1], [330, 2], [294, 2], [262, 4],
      [294, 2], [330, 2], [392, 3], [440, 1], [494, 2], [440, 2], [392, 4],
    ],
  },
  village: {
    tempo: 95,
    wave: 'triangle',
    notes: [
      [392, 1], [440, 1], [494, 2], [440, 1], [392, 1], [330, 2],
      [349, 1], [392, 1], [440, 2], [392, 1], [349, 1], [330, 2],
      [294, 1], [330, 1], [392, 2], [440, 1], [494, 1], [523, 2], [494, 2], [440, 2],
    ],
  },
  field: {
    tempo: 110,
    wave: 'triangle',
    notes: [
      [330, 1], [392, 1], [440, 1], [523, 1], [494, 2], [440, 1], [392, 1],
      [330, 1], [392, 1], [440, 2], [392, 1], [330, 1], [294, 2],
      [330, 1], [392, 1], [440, 1], [523, 1], [587, 2], [523, 1], [494, 1], [440, 2],
    ],
  },
  dungeon: {
    tempo: 60,
    wave: 'sawtooth',
    notes: [
      [131, 3], [147, 1], [131, 2], [123, 2], [131, 3], [165, 1], [147, 4],
      [123, 3], [131, 1], [147, 2], [131, 2], [117, 4],
    ],
  },
  town: {
    tempo: 100,
    wave: 'square',
    notes: [
      [523, 1], [494, 1], [523, 2], [587, 2], [523, 1], [494, 1], [440, 2],
      [494, 1], [523, 1], [587, 2], [523, 2], [494, 2], [440, 2], [392, 2],
    ],
  },
  boss: {
    tempo: 140,
    wave: 'sawtooth',
    notes: [
      [147, 1], [147, 1], [175, 1], [147, 1], [196, 1], [175, 1], [147, 2],
      [147, 1], [147, 1], [131, 1], [147, 1], [175, 2], [165, 2],
    ],
  },
  ending: {
    tempo: 75,
    wave: 'sine',
    notes: [
      [392, 2], [440, 2], [523, 3], [494, 1], [440, 2], [392, 2], [330, 4],
      [349, 2], [392, 2], [440, 3], [523, 1], [587, 2], [523, 2], [523, 4],
    ],
  },
};

class AudioSystemImpl {
  private ctx: AudioContext | null = null;
  private bgmGain: GainNode | null = null;
  private bgmTimer: ReturnType<typeof setTimeout> | null = null;
  private current: BgmName | null = null;
  muted = false;

  private ensureCtx(): AudioContext | null {
    if (typeof AudioContext === 'undefined') return null;
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = 0.12;
      this.bgmGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  playBgm(name: BgmName): void {
    if (this.current === name) return;
    this.stopBgm();
    this.current = name;
    const ctx = this.ensureCtx();
    if (!ctx || this.muted) return;

    const pattern = BGM_PATTERNS[name];
    const beatSec = 60 / pattern.tempo;
    let index = 0;

    const scheduleNext = () => {
      if (this.current !== name || !this.ctx || !this.bgmGain) return;
      const [freq, beats] = pattern.notes[index % pattern.notes.length];
      const dur = beats * beatSec;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = pattern.wave;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(1, this.ctx.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur * 0.95);
      osc.connect(gain).connect(this.bgmGain);
      osc.start();
      osc.stop(this.ctx.currentTime + dur);
      index += 1;
      this.bgmTimer = setTimeout(scheduleNext, dur * 1000);
    };
    scheduleNext();
  }

  stopBgm(): void {
    this.current = null;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  playSe(name: SeName): void {
    const ctx = this.ensureCtx();
    if (!ctx || this.muted) return;
    const t = ctx.currentTime;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);

    const tone = (freq: number, start: number, dur: number, type: OscillatorType, vol = 0.15) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      g.gain.setValueAtTime(vol, t + start);
      g.gain.exponentialRampToValueAtTime(0.001, t + start + dur);
      osc.connect(g).connect(ctx.destination);
      osc.start(t + start);
      osc.stop(t + start + dur);
    };
    const noise = (dur: number, vol = 0.1) => {
      const buffer = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const g = ctx.createGain();
      g.gain.value = vol;
      src.connect(g).connect(ctx.destination);
      src.start(t);
    };

    switch (name) {
      case 'attack':
        noise(0.08, 0.08);
        tone(220, 0, 0.06, 'square', 0.05);
        break;
      case 'hit':
        tone(150, 0, 0.1, 'square', 0.12);
        noise(0.06, 0.06);
        break;
      case 'playerHit':
        tone(110, 0, 0.18, 'sawtooth', 0.15);
        break;
      case 'pickup':
        tone(660, 0, 0.08, 'sine', 0.12);
        tone(880, 0.08, 0.12, 'sine', 0.12);
        break;
      case 'levelup':
        [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.15, 'triangle', 0.12));
        break;
      case 'save':
        tone(784, 0, 0.1, 'sine', 0.1);
        tone(988, 0.1, 0.2, 'sine', 0.1);
        break;
      case 'door':
        tone(196, 0, 0.25, 'triangle', 0.12);
        break;
      case 'choice':
        tone(440, 0, 0.06, 'square', 0.08);
        break;
      case 'bossDown':
        [392, 330, 262, 196].forEach((f, i) => tone(f, i * 0.12, 0.3, 'sawtooth', 0.12));
        break;
    }
    gain.disconnect();
  }
}

export const AudioSystem = new AudioSystemImpl();
