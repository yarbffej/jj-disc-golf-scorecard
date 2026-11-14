const SOUND_FX_STORAGE_KEY = 'jj_dg_chains_sfx_v1';

export type DiscSfxType = 'birdie' | 'par' | 'bogey' | 'flip' | 'vibe' | 'tap';

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioCtx) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return null;
    sharedAudioCtx = new AudioCtx();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {
      // Ignore autoplay resume errors prior to gesture
    });
  }
  return sharedAudioCtx;
}

export function isSoundFxEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(SOUND_FX_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setSoundFxEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SOUND_FX_STORAGE_KEY, enabled ? 'true' : 'false');
  } catch {
    // Ignore quota errors
  }
}

function scheduleTone(
  ctx: AudioContext,
  freq: number,
  startOffsetSec: number,
  durationSec: number,
  type: OscillatorType,
  gainPeak: number
): void {
  const start = ctx.currentTime + startOffsetSec;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(gainPeak, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + durationSec);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + durationSec + 0.02);
}

/**
 * Plays optional tactile arcade / basket-chain sound effects when Chain SFX is toggled ON.
 */
export function playChainRattleSfx(kind: DiscSfxType, forcePlay = false): void {
  if (!forcePlay && !isSoundFxEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    switch (kind) {
      case 'birdie': {
        // Metallic chain jingle + upbeat arcade birdie arpeggio
        scheduleTone(ctx, 1860, 0.0, 0.06, 'triangle', 0.05);
        scheduleTone(ctx, 2340, 0.03, 0.07, 'triangle', 0.045);
        scheduleTone(ctx, 523.25, 0.04, 0.14, 'square', 0.035);
        scheduleTone(ctx, 659.25, 0.1, 0.14, 'square', 0.035);
        scheduleTone(ctx, 783.99, 0.16, 0.18, 'square', 0.04);
        scheduleTone(ctx, 1046.5, 0.22, 0.24, 'triangle', 0.06);
        break;
      }
      case 'par': {
        scheduleTone(ctx, 440, 0.0, 0.09, 'triangle', 0.045);
        scheduleTone(ctx, 587.33, 0.06, 0.12, 'triangle', 0.045);
        break;
      }
      case 'bogey': {
        scheduleTone(ctx, 311.13, 0.0, 0.1, 'sawtooth', 0.025);
        scheduleTone(ctx, 261.63, 0.08, 0.14, 'sawtooth', 0.025);
        break;
      }
      case 'flip': {
        scheduleTone(ctx, 620, 0.0, 0.05, 'sine', 0.035);
        scheduleTone(ctx, 930, 0.035, 0.06, 'sine', 0.03);
        break;
      }
      case 'vibe': {
        scheduleTone(ctx, 440, 0.0, 0.08, 'triangle', 0.04);
        scheduleTone(ctx, 554.37, 0.045, 0.09, 'triangle', 0.04);
        scheduleTone(ctx, 659.25, 0.09, 0.14, 'triangle', 0.045);
        break;
      }
      case 'tap':
      default: {
        scheduleTone(ctx, 720, 0.0, 0.045, 'triangle', 0.03);
        break;
      }
    }
  } catch {
    // Ignore audio context timing issues
  }
}
